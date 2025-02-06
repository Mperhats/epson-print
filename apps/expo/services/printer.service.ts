import type { PrinterStatusResponse } from 'react-native-esc-pos-printer';
import { Printer, PrinterConstants } from 'react-native-esc-pos-printer';

export interface PrintJob {
  sections: PrintSection[];
}

export interface PrintSection {
  type: 'header' | 'content' | 'footer';
  align?: 'left' | 'center' | 'right';
  size?: { width: number; height: number };
  content: PrintContent[];
}

export type PrintContent =
  | { type: 'text'; text: string }
  | { type: 'line'; left: string; right: string; gapSymbol?: string }
  | { type: 'feed'; lines: number }
  | { type: 'cut' };

const getAlignment = (align: string): number => {
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
};

const ensureConnection = async (printer: Printer): Promise<void> => {
  await Printer.tryToConnectUntil(
    printer,
    (status) => status.online.statusCode === PrinterConstants.TRUE,
  );
};

const printContent = async (printer: Printer, content: PrintContent): Promise<void> => {
  switch (content.type) {
    case 'text':
      await printer.addText(content.text);
      break;
    case 'line':
      await Printer.addTextLine(printer, {
        left: content.left,
        right: content.right,
        gapSymbol: content.gapSymbol || '.',
      });
      break;
    case 'feed':
      await printer.addFeedLine(content.lines);
      break;
    case 'cut':
      await printer.addCut();
      break;
  }
};

const printSection = async (printer: Printer, section: PrintSection): Promise<void> => {
  if (section.align) {
    await printer.addTextAlign(getAlignment(section.align));
  }

  if (section.size) {
    await printer.addTextSize(section.size);
  }

  for (const item of section.content) {
    await printContent(printer, item);
  }
};

export const print = async (printer: Printer, job: PrintJob): Promise<PrinterStatusResponse> => {
  try {
    const result = await printer.addQueueTask(async () => {
      await ensureConnection(printer);

      for (const section of job.sections) {
        await printSection(printer, section);
      }

      const result = await printer.sendData();
      await printer.disconnect();
      return result;
    });

    if (!result) {
      throw new Error('Printer did not return a status response');
    }

    return result as PrinterStatusResponse;
  } catch (error) {
    await printer.disconnect();
    throw error;
  }
};

export const createPrinter = (target: string, deviceName: string): Printer => {
  return new Printer({ target, deviceName });
};
