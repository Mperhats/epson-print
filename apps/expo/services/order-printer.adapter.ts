import { formatPrice } from '@/utils/format';
import type { CartItemMerchantDto, OrderMerchantDto } from '@nosh/backend-merchant-sdk';
import { Printer, PrinterConstants } from 'react-native-esc-pos-printer';

// Types
type BoxConfig = {
  width: number;
  indent?: number;
  contentPadding?: number;
};

// Text Utilities
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

// Box Drawing Utilities
const createBoxLine = (
  content: string,
  { width, indent = 2 }: BoxConfig,
  leftChar: string,
  rightChar: string,
): string => {
  const indentStr = ' '.repeat(indent);
  const paddedContent = content.padEnd(width - 2);
  return `${indentStr}${leftChar}${paddedContent}${rightChar}`;
};

const createBox = async (
  printer: Printer,
  title: string,
  content: string,
  config: BoxConfig,
): Promise<void> => {
  const { width, contentPadding = 1 } = config;
  const contentWidth = width - 4;
  const wrappedLines = wrapText(content, contentWidth);

  await printer.addText(createBoxLine('─'.repeat(width - 2), config, '┌', '┐'));
  await printer.addFeedLine(1);
  await printer.addText(createBoxLine(` ${title}`, config, '│', '│'));
  await printer.addFeedLine(1);

  for (const line of wrappedLines) {
    await printer.addText(createBoxLine(` ${line}`, config, '│', '│'));
    await printer.addFeedLine(1);
  }

  await printer.addText(createBoxLine('─'.repeat(width - 2), config, '└', '┘'));
  await printer.addFeedLine(contentPadding);
};

// Printer Style Utilities
const withStyle = async (
  printer: Printer,
  style: { [key: string]: number },
  action: () => Promise<void>,
): Promise<void> => {
  for (const [key, value] of Object.entries(style)) {
    await printer.addTextStyle({ [key]: value });
  }
  await action();
  await printer.addTextStyle({}); // Reset styles
};

const withTextSize = async (
  printer: Printer,
  size: { width: number; height: number },
  action: () => Promise<void>,
): Promise<void> => {
  await printer.addTextSize(size);
  await action();
  await printer.addTextSize({ width: 1, height: 1 });
};

const withAlignment = async (
  printer: Printer,
  alignment: number,
  action: () => Promise<void>,
): Promise<void> => {
  await printer.addTextAlign(alignment);
  await action();
};

// Component Builders
const buildLogo = async (printer: Printer): Promise<void> => {
  await withAlignment(printer, PrinterConstants.ALIGN_CENTER, async () => {
    await printer.addImage({
      source: require('@/assets/images/splash.png'),
      width: 200,
    });
    await printer.addFeedLine(2);
  });
};

const buildWelcomeMessage = async (printer: Printer, customerName: string): Promise<void> => {
  await withAlignment(printer, PrinterConstants.ALIGN_CENTER, async () => {
    await printer.addText(`Thanks for ordering on Nosh, ${customerName}!`);
    await printer.addFeedLine(2);
  });
};

const buildOrderNumber = async (
  printer: Printer,
  orderId: string,
  customerName?: string,
): Promise<void> => {
  await withAlignment(printer, PrinterConstants.ALIGN_LEFT, async () => {
    await printer.addLineSpace(32);
    await withStyle(printer, { reverse: PrinterConstants.TRUE }, async () => {
      await withTextSize(printer, { width: 2, height: 2 }, async () => {
        // Create a full-width row with order ID and customer name
        const customerDisplay = customerName
          ? `${customerName.split(' ')[0]} ${customerName.split(' ')[1]?.[0] || ''}.`
          : '';
        await Printer.addTextLine(printer, {
          left: `  ${orderId}`,
          right: `${customerDisplay}  `,
        });
      });
    });
    await printer.addLineSpace(32);
    await printer.addFeedLine(2);
  });
};

const buildOrderInfo = async (printer: Printer, order: OrderMerchantDto): Promise<void> => {
  // Order timestamp first
  await withAlignment(printer, PrinterConstants.ALIGN_LEFT, async () => {
    if (order.createdAt) {
      await printer.addText(`Placed at ${new Date(order.createdAt).toLocaleString()}`);
      await printer.addFeedLine(1);
    }
  });

  // Centered fulfillment mode with lines
  await withAlignment(printer, PrinterConstants.ALIGN_CENTER, async () => {
    await printer.addText('─'.repeat(42)); // Top line
    await printer.addFeedLine(1);

    await withStyle(printer, { em: PrinterConstants.TRUE }, async () => {
      await withTextSize(printer, { width: 3, height: 2 }, async () => {
        await printer.addTextSmooth(PrinterConstants.TRUE);
        await printer.addText(order.fulfillmentMode.toUpperCase());
        await printer.addTextSmooth(PrinterConstants.FALSE);
      });
    });
    await printer.addFeedLine(1);

    await printer.addText('─'.repeat(42)); // Bottom line
    await printer.addFeedLine(1);
  });
};

const buildModifiers = async (printer: Printer, item: CartItemMerchantDto): Promise<void> => {
  for (const group of item.cartModifierGroups || []) {
    for (const modifier of group.modifiers) {
      await printer.addText(
        `  ${modifier.quantity}x ${modifier.name}${
          modifier.price > 0 ? ` ${formatPrice(modifier.price)}` : ''
        }`,
      );
      await printer.addFeedLine(1);
    }
  }
};

const buildOrderItem = async (printer: Printer, item: CartItemMerchantDto): Promise<void> => {
  await withStyle(printer, { em: PrinterConstants.TRUE }, async () => {
    await Printer.addTextLine(printer, {
      left: `${item.quantity}x ${item.name}`,
      right: formatPrice(item.price * item.quantity),
    });
  });
  await printer.addFeedLine(1);

  await buildModifiers(printer, item);

  if (item.specialInstructions) {
    await createBox(printer, 'Special Instructions:', item.specialInstructions, {
      width: 38,
      contentPadding: 1,
    });
  }
};

const calculateTaxAmount = (order: OrderMerchantDto): number => {
  return (
    order.cost?.fees?.reduce((sum, fee) => {
      return fee.description?.toLowerCase().includes('tax') ? sum + fee.amount : sum;
    }, 0) || 0
  );
};

const buildTotals = async (printer: Printer, order: OrderMerchantDto): Promise<void> => {
  const taxAmount = calculateTaxAmount(order);
  const subtotal = order.cost?.subtotalAmount || 0;
  const total = subtotal + taxAmount;

  await withAlignment(printer, PrinterConstants.ALIGN_LEFT, async () => {

    await printer.addFeedLine(1);

    await Printer.addTextLine(printer, {
      left: 'Subtotal',
      right: formatPrice(subtotal),
    });
    await printer.addFeedLine(1);

    await Printer.addTextLine(printer, {
      left: 'Tax',
      right: formatPrice(taxAmount),
    });
    await printer.addFeedLine(1);

    // Make total bold with wider text
    await withStyle(
      printer,
      {
        em: PrinterConstants.TRUE,
      },
      async () => {
        await withTextSize(printer, { width: 2, height: 1 }, async () => {
          // Width 2 for wider, height 1 for normal height
          await printer.addTextSmooth(PrinterConstants.TRUE);
          await Printer.addTextLine(printer, {
            left: 'TOTAL',
            right: formatPrice(total),
          });
          await printer.addTextSmooth(PrinterConstants.FALSE);
        });
      },
    );
  });
  await printer.addFeedLine(2);
};

const buildFooter = async (printer: Printer, order: OrderMerchantDto): Promise<void> => {
  await printer.addText('─'.repeat(42)); // Divider line
  await printer.addFeedLine(2);

  await withAlignment(printer, PrinterConstants.ALIGN_CENTER, async () => {
    if (order.merchant) {
      await printer.addText('Thank you for ordering with');
      await printer.addFeedLine(1);

      // Wrap merchant name if too long (max 32 chars per line)
      const wrappedMerchantName = wrapText(order.merchant.name, 32);
      for (const line of wrappedMerchantName) {
        await printer.addText(line);
        await printer.addFeedLine(2);
      }

      await printer.addText(`Merchant phone number: ${order.merchant.phone}`);
      await printer.addFeedLine(2);
    } else {
      await printer.addText('Thank you for your order!');
      await printer.addFeedLine(2);
    }
  });
};

// Main Receipt Builder
export const buildOrderReceipt = (order: OrderMerchantDto) => {
  return async (printer: Printer): Promise<void> => {
    // Header
    await buildLogo(printer);
    await buildWelcomeMessage(printer, order.customer?.firstName || 'valued customer');
    await buildOrderNumber(
      printer,
      order.readableId || order.id,
      `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`,
    );
    await buildOrderInfo(printer, order);

    // Items
    await withAlignment(printer, PrinterConstants.ALIGN_LEFT, async () => {
      for (const item of order.cartItems || []) {
        await buildOrderItem(printer, item);
      }
    });

    // Notes
    if (order.orderNotes) {
      await createBox(printer, 'Order Notes:', order.orderNotes, { width: 42, contentPadding: 2 });
    }

    // Totals and Footer
    await buildTotals(printer, order);
    await buildFooter(printer, order);
    await printer.addCut();
  };
};
