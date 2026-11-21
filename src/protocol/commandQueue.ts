import { describeAckError } from './constants';
import {
  type AckFrame,
  encodeFramedPacket,
  encodeMouseMovePacket,
  encodeQuickCommand,
  parseAckPacket,
} from './packetCodec';
import type { QuickCommandCode } from './byteMap';
import type { DeviceProfile } from './profiles';
import { validateCommandForProfile } from './commandValidator';
import type { Transport, Unsubscribe } from '../transport/types';

export interface CommandResult {
  readonly seq: number;
  readonly ack: AckFrame;
  readonly payload: string;
}

interface PendingAck {
  readonly seq: number;
  readonly resolve: (ack: AckFrame) => void;
  readonly reject: (err: Error) => void;
  readonly timer: ReturnType<typeof setTimeout>;
}

export interface CommandQueueOptions {
  readonly ackTimeoutMs?: number;
}

export class CommandQueue {
  private readonly transport: Transport;
  private readonly ackTimeoutMs: number;
  private seqCounter = 0;
  private chain: Promise<void> = Promise.resolve();
  private pending: PendingAck | null = null;
  private rxBuffer = new Uint8Array(0);
  private readonly unsubscribeData: Unsubscribe;

  constructor(transport: Transport, options: CommandQueueOptions = {}) {
    this.transport = transport;
    this.ackTimeoutMs = options.ackTimeoutMs ?? 3000;
    this.unsubscribeData = this.transport.onData((chunk) => this.handleIncoming(chunk));
  }

  dispose(): void {
    this.unsubscribeData();
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending.reject(new Error('Command queue disposed.'));
      this.pending = null;
    }
    this.rxBuffer = new Uint8Array(0);
  }

  private nextSeq(): number {
    this.seqCounter = (this.seqCounter + 1) & 0xff;
    return this.seqCounter;
  }

  enqueueFramed(payload: string, profile: DeviceProfile): Promise<CommandResult> {
    const validation = validateCommandForProfile(payload, profile);
    if (!validation.valid) {
      return Promise.reject(new Error(validation.error ?? 'Invalid command.'));
    }

    const seq = this.nextSeq();
    const frame = encodeFramedPacket(payload.trim(), seq, profile);

    const run = async (): Promise<CommandResult> => {
      const ackPromise = this.waitForAck(seq);
      await this.transport.write(frame);
      const ack = await ackPromise;
      if (!ack.ok) {
        throw new Error(describeAckError(ack.errorCode));
      }
      return { seq, ack, payload: payload.trim() };
    };

    const resultPromise = this.chain.then(run, run);
    this.chain = resultPromise.then(
      () => undefined,
      () => undefined
    );
    return resultPromise;
  }

  sendQuickCommand(code: QuickCommandCode): Promise<void> {
    return this.transport.write(encodeQuickCommand(code));
  }

  sendMouseMove(dx: number, dy: number): Promise<void> {
    return this.transport.write(encodeMouseMovePacket(dx, dy));
  }

  private waitForAck(seq: number): Promise<AckFrame> {
    return new Promise<AckFrame>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending?.seq === seq) {
          this.pending = null;
        }
        reject(new Error(`ACK timeout for sequence ${seq}.`));
      }, this.ackTimeoutMs);

      this.pending = { seq, resolve, reject, timer };
    });
  }

  private handleIncoming(chunk: Uint8Array): void {
    const merged = new Uint8Array(this.rxBuffer.length + chunk.length);
    merged.set(this.rxBuffer);
    merged.set(chunk, this.rxBuffer.length);
    this.rxBuffer = merged;

    const ack = parseAckPacket(this.rxBuffer);
    if (!ack) {
      // Cap RX buffer to prevent unbounded growth from non-ACK text replies.
      if (this.rxBuffer.length > 256) {
        this.rxBuffer = this.rxBuffer.slice(-64);
      }
      return;
    }

    this.rxBuffer = new Uint8Array(0);
    if (this.pending && this.pending.seq === ack.seq) {
      const active = this.pending;
      this.pending = null;
      clearTimeout(active.timer);
      active.resolve(ack);
    }
  }
}
