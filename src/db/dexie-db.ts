import Dexie, { Table as DexieTable } from 'dexie';
import { Order, Bill, Shift, AuditLogEntry, MenuItem } from '../types';

export interface OutboxMutation {
  id: string; // UUID
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  createdAt: string;
  retryCount: number;
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  lastError?: string;
}

export class NovaDatabase extends Dexie {
  orders!: DexieTable<Order, string>;
  bills!: DexieTable<Bill, string>;
  shifts!: DexieTable<Shift, string>;
  auditLogs!: DexieTable<AuditLogEntry, string>;
  menuItems!: DexieTable<MenuItem, string>;
  outbox!: DexieTable<OutboxMutation, string>;

  constructor() {
    super('NovaPosOfflineDB');
    this.version(1).stores({
      orders: 'id, orderNumber, branchId, tableId, status, createdAt',
      bills: 'id, orderId, fiscalInvoiceNumber, isPaid, closedAt',
      shifts: 'id, branchId, cashierId, isOpen, openedAt',
      auditLogs: 'id, timestamp, userId, action, entityId',
      menuItems: 'id, categoryId, sku, is86, basePrice',
      outbox: 'id, endpoint, syncStatus, createdAt',
    });
  }
}

export const db = new NovaDatabase();
