import { describe, expect, it } from 'vitest';
import {
  ACK_ERROR_CODE,
  DEVICE_PROFILES,
  PACKET_ETX,
  PACKET_STX,
  PROTOCOL_VERSION,
  PayloadLimitError,
  QUICK_CMD,
  computeXorChecksum,
  decodeFramedPacket,
  encodeAckPacket,
  encodeFramedPacket,
  encodeMouseMovePacket,
  encodeQuickCommand,
  parseAckPacket,
} from '../src/protocol';

describe('PacketCodec', () => {
  it('encodes and decodes a valid RubberOtter v1 framed packet', () => {
    const frame = encodeFramedPacket('type "ok"', 7, DEVICE_PROFILES.rubberotter);
    expect(frame[0]).toBe(PACKET_STX);
    expect(frame[1]).toBe(PROTOCOL_VERSION);
    expect(frame[2]).toBe(7);
    expect(frame[frame.length - 1]).toBe(PACKET_ETX);

    const decoded = decodeFramedPacket(frame);
    expect(decoded).not.toBeNull();
    expect(decoded?.seq).toBe(7);
    expect(decoded?.payloadText).toBe('type "ok"');
    expect(decoded?.checksum).toBe(computeXorChecksum(decoded!.payloadBytes));
  });

  it('rejects a frame with corrupted XOR checksum', () => {
    const frame = encodeFramedPacket('enter', 1, DEVICE_PROFILES.rubberotter);
    frame[frame.length - 2] ^= 0xff;
    expect(decodeFramedPacket(frame)).toBeNull();
  });

  it('enforces 384 B payload limit on rubberotter profile', () => {
    const okPayload = 'a'.repeat(384);
    expect(() =>
      encodeFramedPacket(okPayload, 1, DEVICE_PROFILES.rubberotter)
    ).not.toThrow();

    const tooLong = 'a'.repeat(385);
    expect(() =>
      encodeFramedPacket(tooLong, 2, DEVICE_PROFILES.rubberotter)
    ).toThrow(PayloadLimitError);
  });

  it('enforces 1024 B payload limit on rubberorca profile', () => {
    const okPayload = 'a'.repeat(1024);
    const frame = encodeFramedPacket(okPayload, 3, DEVICE_PROFILES.rubberorca);
    const decoded = decodeFramedPacket(frame);
    expect(decoded?.payloadBytes.length).toBe(1024);

    const tooLong = 'a'.repeat(1025);
    expect(() =>
      encodeFramedPacket(tooLong, 4, DEVICE_PROFILES.rubberorca)
    ).toThrow(PayloadLimitError);
  });

  it('parses 6-byte ACK frames including error codes 1, 2, 3', () => {
    const okAck = encodeAckPacket(42, true, ACK_ERROR_CODE.NONE);
    expect(parseAckPacket(okAck)).toEqual({ seq: 42, ok: true, errorCode: 0 });

    const errAck = encodeAckPacket(43, false, ACK_ERROR_CODE.XOR_MISMATCH);
    expect(parseAckPacket(errAck)).toEqual({ seq: 43, ok: false, errorCode: 3 });

    // Embedded inside noisy prefix/suffix bytes
    const padded = new Uint8Array([0x00, 0xff, ...errAck, 0x0a]);
    expect(parseAckPacket(padded)).toEqual({ seq: 43, ok: false, errorCode: 3 });
  });

  it('encodes single-byte quick commands and clamps mouse deltas', () => {
    expect(Array.from(encodeQuickCommand(QUICK_CMD.MEDIA_PLAY_PAUSE))).toEqual([0x11]);
    expect(Array.from(encodeQuickCommand(QUICK_CMD.MOUSE_SCROLL_DOWN))).toEqual([0x85]);
    expect(Array.from(encodeMouseMovePacket(200, -200))).toEqual([0x80, 127, 128]);
  });
});
