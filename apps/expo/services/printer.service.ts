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

export interface PrinterService {
  /**
   * Prints a structured print job
   * @param job The print job to execute
   * @returns The printer status after printing
   */
  print(job: PrintJob): Promise<PrinterStatusResponse>;

  /**
   * Gets the underlying printer instance for advanced usage
   * Use this when you need direct access to printer capabilities
   */
  getPrinter(): Printer;
}

export class EscPosPrinterService implements PrinterService {
  constructor(private printer: Printer) {}

  getPrinter(): Printer {
    return this.printer;
  }

  async print(job: PrintJob): Promise<PrinterStatusResponse> {
    try {
      const result = await this.printer.addQueueTask(async () => {
        await this.ensureConnection();

        for (const section of job.sections) {
          await this.printSection(section);
        }

        const result = await this.printer.sendData();
        await this.printer.disconnect();
        return result;
      });

      if (!result) {
        throw new Error('Printer did not return a status response');
      }

      return result as PrinterStatusResponse;
    } catch (error) {
      await this.printer.disconnect();
      throw error;
    }
  }

  private async ensureConnection(): Promise<void> {
    await Printer.tryToConnectUntil(
      this.printer,
      (status) => status.online.statusCode === PrinterConstants.TRUE,
    );
  }

  private async printSection(section: PrintSection): Promise<void> {
    if (section.align) {
      await this.printer.addTextAlign(this.getAlignment(section.align));
    }

    if (section.size) {
      await this.printer.addTextSize(section.size);
    }

    for (const item of section.content) {
      await this.printContent(item);
    }
  }

  private async printContent(content: PrintContent): Promise<void> {
    switch (content.type) {
      case 'text':
        await this.printer.addText(content.text);
        break;
      case 'line':
        await Printer.addTextLine(this.printer, {
          left: content.left,
          right: content.right,
          gapSymbol: content.gapSymbol || '.',
        });
        break;
      case 'feed':
        await this.printer.addFeedLine(content.lines);
        break;
      case 'cut':
        await this.printer.addCut();
        break;
    }
  }

  private getAlignment(align: string): number {
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
}
