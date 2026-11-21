import { useCallback, useState } from 'react';
import { QUICK_CMD_LABELS, type QuickCommandCode } from '../protocol';
import { triggerHaptic } from '../services/haptics';
import { selectActiveProfile, useDeckStore } from '../store/useDeckStore';
import { getActiveCommandQueue } from './useDeviceConnection';

export function useCommandQueue() {
  const [isBusy, setIsBusy] = useState(false);
  const profile = useDeckStore(selectActiveProfile);
  const hapticsEnabled = useDeckStore((s) => s.hapticsEnabled);
  const appendLog = useDeckStore((s) => s.appendLog);

  const sendFramedCommand = useCallback(
    async (command: string): Promise<boolean> => {
      const queue = getActiveCommandQueue();
      if (!queue) {
        appendLog('error', 'No active device connection.');
        return false;
      }

      setIsBusy(true);
      try {
        appendLog('tx', command.trim());
        const result = await queue.enqueueFramed(command, profile);
        void triggerHaptic(hapticsEnabled);
        appendLog('info', `Executed seq=${result.seq}.`);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        appendLog('error', msg);
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [appendLog, hapticsEnabled, profile]
  );

  const sendQuickCommand = useCallback(
    async (code: QuickCommandCode): Promise<boolean> => {
      const queue = getActiveCommandQueue();
      if (!queue) {
        appendLog('error', 'No active device connection.');
        return false;
      }

      try {
        await queue.sendQuickCommand(code);
        void triggerHaptic(hapticsEnabled);
        appendLog('tx', `0x${code.toString(16).toUpperCase()} (${QUICK_CMD_LABELS[code]})`);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        appendLog('error', msg);
        return false;
      }
    },
    [appendLog, hapticsEnabled]
  );

  const sendMouseMove = useCallback(
    async (dx: number, dy: number): Promise<void> => {
      const queue = getActiveCommandQueue();
      if (!queue) {
        return;
      }
      try {
        await queue.sendMouseMove(dx, dy);
      } catch {
        // Drop transient pointer deltas on write failure.
      }
    },
    []
  );

  return {
    isBusy,
    profile,
    sendFramedCommand,
    sendQuickCommand,
    sendMouseMove,
  };
}
