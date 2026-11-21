import { useCallback, useEffect } from 'react';
import {
  type Transport,
  type TransportKind,
  createTransport,
  getAvailableTransports,
} from '../transport';
import { CommandQueue } from '../protocol/commandQueue';
import { bytesToHex, parseAckPacket } from '../protocol';
import { useDeckStore } from '../store/useDeckStore';

let activeTransport: Transport | null = null;
let activeQueue: CommandQueue | null = null;
let unsubState: (() => void) | null = null;
let unsubData: (() => void) | null = null;

export function getActiveCommandQueue(): CommandQueue | null {
  return activeQueue;
}

function teardownTransport(): void {
  if (activeQueue) {
    activeQueue.dispose();
    activeQueue = null;
  }
  if (unsubState) {
    unsubState();
    unsubState = null;
  }
  if (unsubData) {
    unsubData();
    unsubData = null;
  }
  activeTransport = null;
}

export function useDeviceConnection() {
  const transportKind = useDeckStore((s) => s.transportKind);
  const connectionState = useDeckStore((s) => s.connectionState);
  const connectedDevice = useDeckStore((s) => s.connectedDevice);
  const lastError = useDeckStore((s) => s.lastError);
  const setTransportKind = useDeckStore((s) => s.setTransportKind);
  const setConnectionState = useDeckStore((s) => s.setConnectionState);
  const setConnectedDevice = useDeckStore((s) => s.setConnectedDevice);
  const appendLog = useDeckStore((s) => s.appendLog);

  const availableTransports = getAvailableTransports();

  useEffect(() => {
    if (!availableTransports.includes(transportKind) && availableTransports.length > 0) {
      setTransportKind(availableTransports[0]);
    }
  }, [availableTransports, transportKind, setTransportKind]);

  const disconnect = useCallback(async () => {
    const current = activeTransport;
    teardownTransport();
    if (current) {
      await current.disconnect();
    }
    setConnectedDevice(null);
    setConnectionState('disconnected', null);
    appendLog('info', 'Disconnected.');
  }, [appendLog, setConnectedDevice, setConnectionState]);

  const connect = useCallback(
    async (overrideKind?: TransportKind) => {
      const kind = overrideKind ?? transportKind;
      if (overrideKind) {
        setTransportKind(overrideKind);
      }

      if (activeTransport) {
        await disconnect();
      }

      const transport = createTransport(kind);
      activeTransport = transport;

      unsubState = transport.onStateChange((state, err) => {
        setConnectionState(state, err ?? null);
        if (state === 'disconnected') {
          setConnectedDevice(null);
        }
      });

      unsubData = transport.onData((chunk) => {
        const ack = parseAckPacket(chunk);
        if (ack) {
          appendLog(
            'rx',
            `ACK seq=${ack.seq} status=${ack.ok ? 'OK' : `ERR(${ack.errorCode})`}`
          );
        } else {
          appendLog('rx', bytesToHex(chunk));
        }
      });

      activeQueue = new CommandQueue(transport);

      try {
        appendLog('info', `Connecting via ${kind}...`);
        const device = await transport.connect();
        setConnectedDevice(device);
        appendLog('info', `Connected to ${device.name} (${device.id}).`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        appendLog('error', `Connection failed: ${msg}`);
        teardownTransport();
      }
    },
    [
      appendLog,
      disconnect,
      setConnectedDevice,
      setConnectionState,
      setTransportKind,
      transportKind,
    ]
  );

  return {
    transportKind,
    availableTransports,
    connectionState,
    connectedDevice,
    lastError,
    isConnected: connectionState === 'connected',
    setTransportKind,
    connect,
    disconnect,
  };
}
