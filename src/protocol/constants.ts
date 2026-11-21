export const BLE_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
export const BLE_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';
export const BLE_MTU_CHUNK_SIZE = 20;
export const USB_CDC_BAUD_RATE = 115200;

export const PACKET_STX = 0x02;
export const PACKET_ETX = 0x03;
export const PROTOCOL_VERSION = 0x01;
export const ACK_FRAME_LENGTH = 6;
export const FRAME_OVERHEAD_BYTES = 7; // STX(1) + VER(1) + SEQ(1) + LEN(2) + XOR(1) + ETX(1)

export const ACK_ERROR_CODE = {
  NONE: 0,
  INVALID_VERSION_OR_COMMAND: 1,
  PAYLOAD_OVERFLOW: 2,
  XOR_MISMATCH: 3,
} as const;

export type AckErrorCode = (typeof ACK_ERROR_CODE)[keyof typeof ACK_ERROR_CODE];

export function describeAckError(code: number): string {
  switch (code) {
    case ACK_ERROR_CODE.NONE:
      return 'OK';
    case ACK_ERROR_CODE.INVALID_VERSION_OR_COMMAND:
      return 'Invalid protocol version or command (code 1)';
    case ACK_ERROR_CODE.PAYLOAD_OVERFLOW:
      return 'Payload exceeds device limit (code 2)';
    case ACK_ERROR_CODE.XOR_MISMATCH:
      return 'XOR checksum mismatch (code 3)';
    default:
      return `Unknown ACK error (code ${code})`;
  }
}
