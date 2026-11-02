import { Bill, Tenant, Branch } from '../types';

/**
 * ESC/POS Thermal Print Commands Generator
 * Generates standards-compliant ESC/POS byte buffers for 80mm and 58mm thermal printers.
 */
export class EscPosService {
  // ESC/POS Command Byte Constants
  static readonly ESC = 0x1B;
  static readonly GS = 0x1D;
  static readonly LF = 0x0A;

  /**
   * Generates a complete 80mm ESC/POS raw byte array for a customer tax receipt
   */
  static generateReceiptBytes(bill: Bill, tenant: Tenant, branch: Branch): Uint8Array {
    const bytes: number[] = [];

    const append = (...arr: number[]) => bytes.push(...arr);
    const appendText = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i) & 0xFF);
      }
    };
    const appendLine = (str: string) => {
      appendText(str);
      append(EscPosService.LF);
    };

    // 1. Initialize printer
    append(EscPosService.ESC, 0x40); // ESC @ (Initialize)

    // 2. Center Align & Double Size Header
    append(EscPosService.ESC, 0x61, 0x01); // ESC a 1 (Center)
    append(EscPosService.ESC, 0x21, 0x30); // ESC ! 0x30 (Double Height & Width)
    appendLine(tenant.name.toUpperCase());

    // Normal font for sub-details
    append(EscPosService.ESC, 0x21, 0x00);
    appendLine(branch.name);
    appendLine(branch.address);
    appendLine(`Phone: ${branch.phone} | BIN: ${branch.taxBin}`);
    appendLine('================================================');

    // 3. Left Align Order Info
    append(EscPosService.ESC, 0x61, 0x00); // ESC a 0 (Left)
    appendLine(`INVOICE: ${bill.fiscalInvoiceNumber}`);
    appendLine(`DATE:    ${new Date(bill.closedAt || Date.now()).toLocaleString()}`);
    appendLine(`PAYMENT: ${bill.paymentMethod || 'CASH'}`);
    appendLine('------------------------------------------------');
    appendLine('ITEM                          QTY    TOTAL(BDT)');
    appendLine('------------------------------------------------');

    // Line totals
    append(EscPosService.ESC, 0x61, 0x02); // ESC a 2 (Right)
    appendLine(`Subtotal:  ৳${(bill.subtotal / 100).toFixed(2)}`);
    if (bill.discountAmount > 0) {
      appendLine(`Discount: -৳${(bill.discountAmount / 100).toFixed(2)}`);
    }
    appendLine(`Service Charge (10%):  ৳${(bill.serviceChargeAmount / 100).toFixed(2)}`);
    appendLine(`VAT (15%):  ৳${(bill.totalTax / 100).toFixed(2)}`);
    appendLine('================================================');

    // Grand Total (Bold & Large)
    append(EscPosService.ESC, 0x21, 0x20); // Double height
    append(EscPosService.ESC, 0x45, 0x01); // Bold ON
    appendLine(`GRAND TOTAL: ৳${(bill.grandTotal / 100).toFixed(2)}`);
    append(EscPosService.ESC, 0x45, 0x00); // Bold OFF
    append(EscPosService.ESC, 0x21, 0x00); // Normal font

    // 4. Center Footer & QR hint
    append(EscPosService.ESC, 0x61, 0x01); // Center
    appendLine('------------------------------------------------');
    appendLine('Musak-6.3 VAT Tax Invoice');
    appendLine('Thank you for dining at Novasphere Bistro!');
    appendLine('Scan QR on display to earn 5% Loyalty Points');
    append(EscPosService.LF, EscPosService.LF, EscPosService.LF);

    // 5. Paper Partial Cut
    append(EscPosService.GS, 0x56, 0x41, 0x00); // GS V 65 0 (Cut paper)

    return new Uint8Array(bytes);
  }

  /**
   * Generates standard ESC/POS Cash Drawer Kick pulse command
   * Pin 2 (standard RJ11 / RJ12 cash drawer port): ESC p 0 25 250
   */
  static generateDrawerKickBytes(): Uint8Array {
    return new Uint8Array([EscPosService.ESC, 0x70, 0x00, 0x19, 0xFA]);
  }
}
