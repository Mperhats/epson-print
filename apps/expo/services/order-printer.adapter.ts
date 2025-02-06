import { formatPrice } from '@/utils/format';
import type { OrderMerchantDto } from '@nosh/backend-merchant-sdk';
import { Printer, PrinterConstants } from 'react-native-esc-pos-printer';

const printHeader = async (printer: Printer, order: OrderMerchantDto): Promise<void> => {
  await printer.addTextAlign(PrinterConstants.ALIGN_CENTER);
  await printer.addText('ORDER RECEIPT');
  await printer.addFeedLine(2);
  await printer.addText(`Order #${order.readableId || order.id}`);
  await printer.addFeedLine(2);
};

const printItems = async (printer: Printer, order: OrderMerchantDto): Promise<void> => {
  await printer.addTextAlign(PrinterConstants.ALIGN_LEFT);

  for (const item of order.cartItems || []) {
    await Printer.addTextLine(printer, {
      left: `${item.quantity}x ${item.name}`,
      right: formatPrice(item.price * item.quantity),
    });
    await printer.addFeedLine(1);

    // Add modifiers
    for (const group of item.cartModifierGroups || []) {
      for (const modifier of group.modifiers) {
        await printer.addText(
          `  ${modifier.quantity}x ${modifier.name}${
            modifier.price > 0 ? ` (${formatPrice(modifier.price)})` : ''
          }`,
        );
        await printer.addFeedLine(1);
      }
    }

    // Add special instructions
    if (item.specialInstructions) {
      await printer.addText('  Special Instructions:');
      await printer.addFeedLine(1);
      await printer.addText(`  ${item.specialInstructions}`);
      await printer.addFeedLine(1);
    }
  }
};

const printNotes = async (printer: Printer, order: OrderMerchantDto): Promise<void> => {
  if (!order.orderNotes) return;

  await printer.addTextAlign(PrinterConstants.ALIGN_LEFT);
  await printer.addFeedLine(1);
  await printer.addText('Order Notes:');
  await printer.addFeedLine(1);
  await printer.addText(order.orderNotes);
  await printer.addFeedLine(2);
};

const printTotal = async (printer: Printer, order: OrderMerchantDto): Promise<void> => {
  await printer.addTextAlign(PrinterConstants.ALIGN_LEFT);
  await printer.addTextSize({ width: 2, height: 2 });
  await Printer.addTextLine(printer, {
    left: 'TOTAL',
    right: formatPrice(order.cost?.subtotalAmount),
  });
  await printer.addFeedLine(4);
  await printer.addCut();
};

/**
 * Creates a print task for the given order that can be passed to the printer provider
 */
export const printOrder = (order: OrderMerchantDto) => {
  return async (printer: Printer): Promise<void> => {
    await printHeader(printer, order);
    await printItems(printer, order);
    await printNotes(printer, order);
    await printTotal(printer, order);
  };
};
