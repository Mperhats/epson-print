import type { OrderMerchantDto } from '@nosh/backend-merchant-sdk';
import { useEffect, useMemo, useState } from 'react';
import {
  type DeviceInfo,
  Printer,
  PrinterConstants,
  type PrinterStatusResponse,
} from 'react-native-esc-pos-printer';

export const usePrinter = (printerDevice: DeviceInfo | null) => {
  const [printing, setPrinting] = useState(false);
  const [currentStatus, setStatus] = useState<PrinterStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const printerInstance = useMemo(() => {
    if (!printerDevice) return null;
    return new Printer({
      target: printerDevice.target,
      deviceName: printerDevice.deviceName,
    });
  }, [printerDevice]);

  useEffect(() => {
    if (!printerInstance) return;

    const stop = Printer.monitorPrinter(printerInstance, (nextStatus) => {
      setStatus(nextStatus);
    });

    return stop;
  }, [printerInstance]);

  const formatPrice = (price?: number) => {
    if (!price) return '$0.00';
    return `$${(price / 100).toFixed(2)}`;
  };

  const printOrder = async (order: OrderMerchantDto) => {
    if (!printerInstance) {
      setError('No printer available');
      return;
    }

    try {
      setPrinting(true);
      setError(null);

      const res = await printerInstance.addQueueTask(async () => {
        await Printer.tryToConnectUntil(
          printerInstance,
          (status) => status.online.statusCode === PrinterConstants.TRUE,
        );

        // Header
        await printerInstance.addTextAlign(PrinterConstants.ALIGN_CENTER);
        await printerInstance.addTextSize({ width: 2, height: 2 });
        await printerInstance.addText('ORDER RECEIPT');
        await printerInstance.addFeedLine(2);

        // Order ID
        await printerInstance.addTextSize({ width: 1, height: 1 });
        await printerInstance.addText(`Order #${order.readableId || order.id}`);
        await printerInstance.addFeedLine(2);

        // Items
        await printerInstance.addTextAlign(PrinterConstants.ALIGN_LEFT);
        for (const item of order.cartItems || []) {
          await Printer.addTextLine(printerInstance, {
            left: `${item.quantity}x ${item.name}`,
            right: formatPrice(item.price * item.quantity),
            gapSymbol: '.',
          });
          await printerInstance.addFeedLine();

          // Modifiers
          for (const group of item.cartModifierGroups || []) {
            for (const modifier of group.modifiers) {
              await printerInstance.addText(`  ${modifier.quantity}x ${modifier.name}`);
              if (modifier.price > 0) {
                await printerInstance.addText(` (${formatPrice(modifier.price)})`);
              }
              await printerInstance.addFeedLine();
            }
          }

          // Special Instructions
          if (item.specialInstructions) {
            await printerInstance.addText('  Special Instructions:');
            await printerInstance.addFeedLine();
            await printerInstance.addText(`  ${item.specialInstructions}`);
            await printerInstance.addFeedLine();
          }
        }

        // Order Notes
        if (order.orderNotes) {
          await printerInstance.addFeedLine();
          await printerInstance.addText('Order Notes:');
          await printerInstance.addFeedLine();
          await printerInstance.addText(order.orderNotes);
          await printerInstance.addFeedLine(2);
        }

        // Total
        await printerInstance.addTextSize({ width: 2, height: 2 });
        await Printer.addTextLine(printerInstance, {
          left: 'TOTAL',
          right: formatPrice(order.cost?.subtotalAmount),
          gapSymbol: '.',
        });

        await printerInstance.addFeedLine(4);
        await printerInstance.addCut();

        const result = await printerInstance.sendData();
        await printerInstance.disconnect();
        return result;
      });

      if (res) {
        setStatus(res);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to print');
      await printerInstance.disconnect();
    } finally {
      setPrinting(false);
    }
  };

  return {
    printing,
    currentStatus,
    error,
    printOrder,
    printerInstance,
  };
};
