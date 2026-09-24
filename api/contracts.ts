import { Business, Customer, Employee, Reservation } from '../types';
import { DetailedOrder, InventoryItem, KitchenTicket } from '../types';
import { DeviceRecord } from '../types/device';

export interface ApiContracts {
  '/merchants/:merchantId': Business;
  '/merchants/:merchantId/employees': Employee[];
  '/merchants/:merchantId/customers': Customer[];
  '/merchants/:merchantId/orders': DetailedOrder[];
  '/merchants/:merchantId/inventory': InventoryItem[];
  '/merchants/:merchantId/reservations': Reservation[];
  '/merchants/:merchantId/devices': DeviceRecord[];
  '/merchants/:merchantId/kds/tickets': KitchenTicket[];
}

export interface MutationEnvelope<T> {
  mutationId: string;
  idempotencyKey: string;
  merchantId: string;
  locationId: string;
  actorId: string;
  payload: T;
  createdAt: string;
}
