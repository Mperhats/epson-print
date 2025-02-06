import { formatPrice } from '@/utils/format';
import type { CartItemMerchantDto, OrderMerchantDto } from '@nosh/backend-merchant-sdk';
import { Printer, PrinterConstants } from 'react-native-esc-pos-printer';

// Simple utility for text wrapping
const wrapText = (text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

// Print a box with title and content
const printBox = async (
  printer: Printer,
  { title, content, width }: { title: string; content: string; width: number },
) => {
  const lines = wrapText(content, width - 4);
  const padding = ' '.repeat(width - title.length - 3);

  await printer.addText(`┌${'─'.repeat(width - 2)}┐`);
  await printer.addFeedLine(1);
  await printer.addText(`│ ${title}${padding}│`);
  await printer.addFeedLine(1);

  for (const line of lines) {
    await printer.addText(`│ ${line.padEnd(width - 3)}│`);
    await printer.addFeedLine(1);
  }

  await printer.addText(`└${'─'.repeat(width - 2)}┘`);
};

// Format date consistently
const formatDate = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${month}/${day}/${year}, ${displayHours}:${minutes} ${ampm}`;
};

// Print header with logo and welcome message
const printHeader = async (printer: Printer, customerName: string) => {
  await printer.addTextAlign(PrinterConstants.ALIGN_CENTER);
  await printer.addImage({ source: require('@/assets/images/splash.png'), width: 200 });
  await printer.addFeedLine(2);
  await printer.addText(`Thanks for ordering on Nosh, ${customerName}!`);
  await printer.addFeedLine(2);
};

// Print order identifier section
const printOrderIdentifier = async (printer: Printer, orderId: string, customerName: string) => {
  await printer.addLineSpace(32);
  await printer.addTextSize({ width: 2, height: 2 });
  await printer.addTextStyle({ reverse: PrinterConstants.TRUE });

  await Printer.addTextLine(printer, {
    left: `  ${orderId}`,
    right: `${customerName}  `,
  });

  await printer.addTextStyle({});
  await printer.addTextSize({ width: 1, height: 1 });
  await printer.addLineSpace(32);
  await printer.addFeedLine(2);
};

// Print fulfillment mode section
const printFulfillmentMode = async (printer: Printer, mode: string) => {
  await printer.addTextAlign(PrinterConstants.ALIGN_CENTER);
  await printer.addText('─'.repeat(42));
  await printer.addFeedLine(1);

  await printer.addTextSize({ width: 2, height: 2 });
  await printer.addTextStyle({ em: PrinterConstants.TRUE });
  await printer.addTextSmooth(PrinterConstants.TRUE);
  await printer.addText(mode.toUpperCase());
  await printer.addTextSmooth(PrinterConstants.FALSE);
  await printer.addTextStyle({});
  await printer.addTextSize({ width: 1, height: 1 });

  await printer.addFeedLine(1);
  await printer.addText('─'.repeat(42));
  await printer.addFeedLine(1);
};

// Print a single order item with its modifiers
const printOrderItem = async (printer: Printer, item: CartItemMerchantDto) => {
  // Print item name and price
  await printer.addTextStyle({ em: PrinterConstants.TRUE });
  await Printer.addTextLine(printer, {
    left: `${item.quantity}x ${item.name}`,
    right: formatPrice(item.price * item.quantity),
  });
  await printer.addTextStyle({});
  await printer.addFeedLine(1);

  // Check if item has modifiers
  const hasModifiers = (item.cartModifierGroups || []).some((group) => group.modifiers.length > 0);

  // Print modifiers with proper indentation
  if (hasModifiers) {
    for (const group of item.cartModifierGroups || []) {
      for (const modifier of group.modifiers) {
        // Set left margin for indentation
        await Printer.addTextLine(printer, {
          left: `· ${modifier.quantity}x ${modifier.name}`,
          right: modifier.price > 0 ? formatPrice(modifier.price) : '',
        });
        await printer.addFeedLine(1);
      }
    }
  }

  // Print special instructions if any
  if (item.specialInstructions) {
    await printBox(printer, {
      title: 'Special Instructions:',
      content: item.specialInstructions,
      width: 38,
    });
  }

  // Only add extra line break if item had modifiers
  if (hasModifiers || item.specialInstructions) {
    await printer.addFeedLine(1);
  }
};

// Print totals section
const printTotals = async (
  printer: Printer,
  { subtotal, tax, total }: { subtotal: number; tax: number; total: number },
) => {
  await printer.addFeedLine(1);

  await Printer.addTextLine(printer, {
    left: 'Subtotal',
    right: formatPrice(subtotal),
  });
  await printer.addFeedLine(1);

  await Printer.addTextLine(printer, {
    left: 'Tax',
    right: formatPrice(tax),
  });
  await printer.addFeedLine(1);

  await printer.addTextSize({ width: 2, height: 1 });
  await printer.addTextStyle({ em: PrinterConstants.TRUE });
  await printer.addTextSmooth(PrinterConstants.TRUE);

  await Printer.addTextLine(printer, {
    left: 'TOTAL',
    right: formatPrice(total),
  });

  await printer.addTextSmooth(PrinterConstants.FALSE);
  await printer.addTextStyle({});
  await printer.addTextSize({ width: 1, height: 1 });
  await printer.addFeedLine(2);
};

// Print footer section
const printFooter = async (printer: Printer, merchantName?: string, merchantPhone?: string) => {
  await printer.addTextAlign(PrinterConstants.ALIGN_CENTER);
  await printer.addText('─'.repeat(42));
  await printer.addFeedLine(2);
  await printer.addText('Thank you for ordering with');
  await printer.addFeedLine(1);

  if (merchantName) {
    const merchantNameLines = wrapText(merchantName, 32);
    for (const line of merchantNameLines) {
      await printer.addText(line);
      await printer.addFeedLine(1);
    }
    if (merchantPhone) {
      await printer.addText(`Merchant phone number: ${merchantPhone}`);
    }
  } else {
    await printer.addText('Thank you for your order!');
  }
  await printer.addFeedLine(2);
};

// Main receipt builder
export const buildOrderReceipt = (order: OrderMerchantDto) => {
  return async (printer: Printer): Promise<void> => {
    // Print header
    await printHeader(printer, order.customer?.firstName || 'valued customer');

    // Print order identifier
    const customerDisplay = order.customer
      ? `${order.customer.firstName} ${order.customer.lastName?.[0] || ''}.`
      : '';
    await printOrderIdentifier(printer, order.readableId || order.id, customerDisplay);

    // Print order info
    if (order.createdAt) {
      await printer.addText(`Placed at ${formatDate(new Date(order.createdAt))}`);
      await printer.addFeedLine(1);
    }

    // Print fulfillment mode
    await printFulfillmentMode(printer, order.fulfillmentMode);

    // Print items
    await printer.addTextAlign(PrinterConstants.ALIGN_LEFT);
    for (const item of order.cartItems || []) {
      await printOrderItem(printer, item);
    }

    // Print order notes if any
    if (order.orderNotes) {
      await printBox(printer, {
        title: 'Order Notes:',
        content: order.orderNotes,
        width: 42,
      });
      await printer.addFeedLine(2);
    }

    // Calculate and print totals
    const taxAmount =
      order.cost?.fees?.reduce(
        (sum, fee) => (fee.description?.toLowerCase().includes('tax') ? sum + fee.amount : sum),
        0,
      ) || 0;
    const subtotal = order.cost?.subtotalAmount || 0;
    await printTotals(printer, {
      subtotal,
      tax: taxAmount,
      total: subtotal + taxAmount,
    });

    // Print footer
    await printFooter(printer, order.merchant?.name, order.merchant?.phone);

    await printer.addCut();
  };
};
