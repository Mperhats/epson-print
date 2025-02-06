import { usePrinterConnection } from '@/components/PrinterProvider';
import { OrderPrinterAdapter } from '@/services/order-printer.adapter';
import type { OrderMerchantDto } from '@nosh/backend-merchant-sdk';
import { useMemo, useState } from 'react';
import {
  Printer,
  PrinterConstants,
  type PrinterStatusResponse,
} from 'react-native-esc-pos-printer';

function getAlignment(align: string): number {
  switch (align) {
    case 'left':
      return PrinterConstants.ALIGN_LEFT;
    case 'center':
      return PrinterConstants.ALIGN_CENTER;
    case 'right':
      return PrinterConstants.ALIGN_RIGHT;
    default:
      return PrinterConstants.ALIGN_LEFT;
  }
}

export const usePrinter = () => {
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { printerInstance, printerStatus } = usePrinterConnection();
  const orderAdapter = useMemo(() => new OrderPrinterAdapter(), []);

  const printOrder = async (order: OrderMerchantDto) => {
    if (!printerInstance) {
      setError('No printer available');
      return;
    }

    try {
      setPrinting(true);
      setError(null);

      const printJob = orderAdapter.createPrintJob(order);
      await printerInstance.addQueueTask(async () => {
        await Printer.tryToConnectUntil(
          printerInstance,
          (status: PrinterStatusResponse) => status.online.statusCode === PrinterConstants.TRUE,
        );

        for (const section of printJob.sections) {
          if (section.align) {
            await printerInstance.addTextAlign(getAlignment(section.align));
          }

          if (section.size) {
            await printerInstance.addTextSize(section.size);
          }

          for (const item of section.content) {
            switch (item.type) {
              case 'text':
                await printerInstance.addText(item.text);
                break;
              case 'line':
                await Printer.addTextLine(printerInstance, {
                  left: item.left,
                  right: item.right,
                  gapSymbol: item.gapSymbol || '.',
                });
                break;
              case 'feed':
                await printerInstance.addFeedLine(item.lines);
                break;
              case 'cut':
                await printerInstance.addCut();
                break;
            }
          }
        }

        const result = await printerInstance.sendData();
        await printerInstance.disconnect();
        return result;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to print');
    } finally {
      setPrinting(false);
    }
  };

  return {
    printing,
    currentStatus: printerStatus,
    error,
    printOrder,
  };
};
