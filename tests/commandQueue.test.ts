import { describe, expect, it } from 'vitest';
import {
  ACK_ERROR_CODE,
  DEVICE_PROFILES,
  encodeAckPacket,
} from '../src/protocol';
import { CommandQueue } from '../src/protocol/commandQueue';
import { MockTransport } from '../src/transport';

describe('CommandQueue with MockTransport', () => {
  it('sends framed commands sequentially and resolves on matching ACK', async () => {
    const transport = new MockTransport({ ackDelayMs: 1 });
    await transport.connect();
    const queue = new CommandQueue(transport, { ackTimeoutMs: 500 });

    const [r1, r2] = await Promise.all([
      queue.enqueueFramed('type "first"', DEVICE_PROFILES.rubberotter),
      queue.enqueueFramed('enter', DEVICE_PROFILES.rubberotter),
    ]);

    expect(r1.seq).toBe(1);
    expect(r1.ack.ok).toBe(true);
    expect(r2.seq).toBe(2);
    expect(r2.ack.ok).toBe(true);
    expect(transport.writtenPackets.length).toBe(2);

    queue.dispose();
    await transport.disconnect();
  });

  it('propagates ACK error codes (1, 2, 3) as rejected promises', async () => {
    const transport = new MockTransport({
      ackDelayMs: 1,
      forcedErrorCode: ACK_ERROR_CODE.XOR_MISMATCH,
    });
    await transport.connect();
    const queue = new CommandQueue(transport, { ackTimeoutMs: 500 });

    await expect(
      queue.enqueueFramed('enter', DEVICE_PROFILES.rubberorca)
    ).rejects.toThrow(/code 3/);

    transport.configure({ forcedErrorCode: ACK_ERROR_CODE.PAYLOAD_OVERFLOW });
    await expect(
      queue.enqueueFramed('enter', DEVICE_PROFILES.rubberorca)
    ).rejects.toThrow(/code 2/);

    transport.configure({ forcedErrorCode: ACK_ERROR_CODE.INVALID_VERSION_OR_COMMAND });
    await expect(
      queue.enqueueFramed('enter', DEVICE_PROFILES.rubberorca)
    ).rejects.toThrow(/code 1/);

    queue.dispose();
    await transport.disconnect();
  });

  it('reassembles fragmented ACK frames delivered across multiple chunks', async () => {
    const transport = new MockTransport({ autoAck: false });
    await transport.connect();
    const queue = new CommandQueue(transport, { ackTimeoutMs: 500 });

    const pending = queue.enqueueFramed('enter', DEVICE_PROFILES.rubberorca);
    const ack = encodeAckPacket(1, true, ACK_ERROR_CODE.NONE);

    // Deliver 6-byte ACK in two 3-byte chunks.
    setTimeout(() => {
      transport.emitIncoming(ack.slice(0, 3));
      transport.emitIncoming(ack.slice(3, 6));
    }, 5);

    const result = await pending;
    expect(result.ack).toEqual({ seq: 1, ok: true, errorCode: 0 });

    queue.dispose();
    await transport.disconnect();
  });
});
