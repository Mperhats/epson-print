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

export const executeJob = async (printer: Printer, job: PrintJob): Promise<void> => {
  for (const section of job.sections) {
    await printSection(printer, section);
  }
};
