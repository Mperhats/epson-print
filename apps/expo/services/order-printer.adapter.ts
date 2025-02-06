import type { OrderMerchantDto } from '@nosh/backend-merchant-sdk';
import type { PrintJob, PrintSection, PrintContent } from './printer.service';
import { formatPrice } from '@/utils/format';

export class OrderPrinterAdapter {
  createPrintJob(order: OrderMerchantDto): PrintJob {
    return {
      sections: [
        this.createHeaderSection(order),
        this.createItemsSection(order),
        ...this.createNotesSection(order),
        this.createTotalSection(order),
      ].filter(Boolean) as PrintSection[],
    };
  }

  private createHeaderSection(order: OrderMerchantDto): PrintSection {
    return {
      type: 'header',
      align: 'center',
      content: [
        { type: 'text', text: 'ORDER RECEIPT' },
        { type: 'feed', lines: 2 },
        { type: 'text', text: `Order #${order.readableId || order.id}` },
        { type: 'feed', lines: 2 },
      ],
    };
  }

  private createItemsSection(order: OrderMerchantDto): PrintSection {
    const content: PrintContent[] = [];

    for (const item of order.cartItems || []) {
      content.push({
        type: 'line',
        left: `${item.quantity}x ${item.name}`,
        right: formatPrice(item.price * item.quantity),
      });
      content.push({ type: 'feed', lines: 1 });

      // Add modifiers
      for (const group of item.cartModifierGroups || []) {
        for (const modifier of group.modifiers) {
          content.push({
            type: 'text',
            text: `  ${modifier.quantity}x ${modifier.name}${
              modifier.price > 0 ? ` (${formatPrice(modifier.price)})` : ''
            }`,
          });
          content.push({ type: 'feed', lines: 1 });
        }
      }

      // Add special instructions
      if (item.specialInstructions) {
        content.push({ type: 'text', text: '  Special Instructions:' });
        content.push({ type: 'feed', lines: 1 });
        content.push({ type: 'text', text: `  ${item.specialInstructions}` });
        content.push({ type: 'feed', lines: 1 });
      }
    }

    return {
      type: 'content',
      align: 'left',
      content,
    };
  }

  private createNotesSection(order: OrderMerchantDto): PrintSection[] {
    if (!order.orderNotes) return [];

    return [{
      type: 'content',
      align: 'left',
      content: [
        { type: 'feed', lines: 1 },
        { type: 'text', text: 'Order Notes:' },
        { type: 'feed', lines: 1 },
        { type: 'text', text: order.orderNotes },
        { type: 'feed', lines: 2 },
      ],
    }];
  }

  private createTotalSection(order: OrderMerchantDto): PrintSection {
    return {
      type: 'footer',
      align: 'left',
      size: { width: 2, height: 2 },
      content: [
        {
          type: 'line',
          left: 'TOTAL',
          right: formatPrice(order.cost?.subtotalAmount),
        },
        { type: 'feed', lines: 4 },
        { type: 'cut' },
      ],
    };
  }
} 