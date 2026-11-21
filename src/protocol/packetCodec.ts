import {
  ACK_FRAME_LENGTH,
  FRAME_OVERHEAD_BYTES,
  PACKET_ETX,
  PACKET_STX,
  PROTOCOL_VERSION,
} from './constants';
import { QUICK_CMD, type QuickCommandCode } from './byteMap';
import type { DeviceProfile } from './profiles';

export interface AckFrame {
  readonly seq: number;
  readonly ok: boolean;
  readonly errorCode: number;
}

export interface DecodedPacket {
  readonly version: number;
  readonly seq: number;
  readonly payloadBytes: Uint8Array;
  readonly payloadText: string;
  readonly checksum: number;
}

export class PayloadLimitError extends Error {
  readonly actualBytes: number;
  readonly maxBytes: number;
  readonly profileId: string;

  constructor(actualBytes: number, maxBytes: number, profileId: string) {
    super(
      `Payload (${actualBytes} B) exceeds ${profileId} limit of ${maxBytes} B.`
    );
    this.name = 'PayloadLimitError';
    this.actualBytes = actualBytes;
    this.maxBytes = maxBytes;
    this.profileId = profileId;
  }
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function computeXorChecksum(bytes: Uint8Array): number {
  let xor = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    xor ^= bytes[i];
  }
  return xor & 0xff;
}

export function encodeFramedPacket(
  payloadText: string,
  seq: number,
  profile: DeviceProfile
): Uint8Array {
  const payloadBytes = textEncoder.encode(payloadText);
  if (payloadBytes.length > profile.maxPayloadBytes) {
    throw new PayloadLimitError(
      payloadBytes.length,
      profile.maxPayloadBytes,
      profile.id
    );
  }

  const len = payloadBytes.length;
  const checksum = computeXorChecksum(payloadBytes);
  const frame = new Uint8Array(FRAME_OVERHEAD_BYTES + len);

  frame[0] = PACKET_STX;
  frame[1] = PROTOCOL_VERSION;
  frame[2] = seq & 0xff;
  frame[3] = (len >> 8) & 0xff;
  frame[4] = len & 0xff;
  frame.set(payloadBytes, 5);
  frame[5 + len] = checksum;
  frame[6 + len] = PACKET_ETX;

  return frame;
}

export function decodeFramedPacket(frame: Uint8Array): DecodedPacket | null {
  if (frame.length < FRAME_OVERHEAD_BYTES) {
    return null;
  }
  if (frame[0] !== PACKET_STX || frame[frame.length - 1] !== PACKET_ETX) {
    return null;
  }
  const version = frame[1];
  const seq = frame[2];
  const expectedLen = (frame[3] << 8) | frame[4];
  if (frame.length !== FRAME_OVERHEAD_BYTES + expectedLen) {
    return null;
  }

  const payloadBytes = frame.slice(5, 5 + expectedLen);
  const checksum = frame[5 + expectedLen];
  if (computeXorChecksum(payloadBytes) !== checksum) {
    return null;
  }

  return {
    version,
    seq,
    payloadBytes,
    payloadText: textDecoder.decode(payloadBytes),
    checksum,
  };
}

export function encodeAckPacket(seq: number, ok: boolean, errorCode: number): Uint8Array {
  return new Uint8Array([
    PACKET_STX,
    PROTOCOL_VERSION,
    seq & 0xff,
    ok ? 1 : 0,
    errorCode & 0xff,
    PACKET_ETX,
  ]);
}

export function parseAckPacket(bytes: Uint8Array): AckFrame | null {
  if (bytes.length < ACK_FRAME_LENGTH) {
    return null;
  }

  for (let i = 0; i <= bytes.length - ACK_FRAME_LENGTH; i += 1) {
    if (
      bytes[i] === PACKET_STX &&
      bytes[i + 1] === PROTOCOL_VERSION &&
      bytes[i + 5] === PACKET_ETX
    ) {
      return {
        seq: bytes[i + 2],
        ok: bytes[i + 3] === 1,
        errorCode: bytes[i + 4],
      };
    }
  }

  return null;
}

export function encodeQuickCommand(code: QuickCommandCode): Uint8Array {
  return new Uint8Array([code & 0xff]);
}

export function encodeMouseMovePacket(dx: number, dy: number): Uint8Array {
  const clampedX = Math.max(-128, Math.min(127, Math.round(dx)));
  const clampedY = Math.max(-128, Math.min(127, Math.round(dy)));
  return new Uint8Array([
    QUICK_CMD.MOUSE_MOVE_PACKET,
    clampedX & 0xff,
    clampedY & 0xff,
  ]);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`)
    .join(' ');
}
