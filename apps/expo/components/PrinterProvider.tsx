import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { DeviceInfo } from 'react-native-esc-pos-printer';
import {
  Printer,
  PrinterConstants,
  type PrinterStatusResponse,
  usePrintersDiscovery,
} from 'react-native-esc-pos-printer';

/**
 * Core interfaces for printer state management
 */
interface PrinterDiscoveryState {
  isDiscovering: boolean;
  startDiscovery: () => void;
  discoveredPrinters: DeviceInfo[];
  discoveryError: Error | null;
}

interface PrinterConnectionState {
  selectedPrinter: DeviceInfo | null;
  printerStatus: PrinterStatusResponse | null;
  isConnected: boolean;
  printerInstance: Printer | null;
}

interface PrinterUIState {
  showPrinterModal: boolean;
  setShowPrinterModal: (show: boolean) => void;
}

interface PrinterActions {
  selectPrinter: (printer: DeviceInfo) => void;
  clearPrinter: () => void;
}

interface PrinterPrintState {
  printing: boolean;
  error: string | null;
}

interface PrinterPrintActions {
  print: (printTask: (printer: Printer) => Promise<void>) => Promise<void>;
}

type PrinterContextType = PrinterDiscoveryState &
  PrinterConnectionState &
  PrinterUIState &
  PrinterActions &
  PrinterPrintState &
  PrinterPrintActions;

const PrinterContext = createContext<PrinterContextType | null>(null);

/**
 * Hook for printer discovery functionality
 * Use this when you only need to search for and list available printers
 */
export const usePrinterDiscovery = () => {
  const context = useContext(PrinterContext);
  if (!context) throw new Error('usePrinterDiscovery must be used within a PrinterProvider');
  const { isDiscovering, startDiscovery, discoveredPrinters, discoveryError } = context;
  return { isDiscovering, startDiscovery, discoveredPrinters, discoveryError };
};

/**
 * Hook for printer connection state
 * Use this when you need to check printer status or access the printer instance
 */
export const usePrinterConnection = () => {
  const context = useContext(PrinterContext);
  if (!context) throw new Error('usePrinterConnection must be used within a PrinterProvider');
  const { selectedPrinter, printerStatus, isConnected, printerInstance } = context;
  return { selectedPrinter, printerStatus, isConnected, printerInstance };
};

/**
 * Hook for printer UI state management
 * Use this to control the printer selection modal
 */
export const usePrinterUI = () => {
  const context = useContext(PrinterContext);
  if (!context) throw new Error('usePrinterUI must be used within a PrinterProvider');
  const { showPrinterModal, setShowPrinterModal } = context;
  return { showPrinterModal, setShowPrinterModal };
};

/**
 * Hook for printer actions
 * Use this to select or clear the current printer
 */
export const usePrinterActions = () => {
  const context = useContext(PrinterContext);
  if (!context) throw new Error('usePrinterActions must be used within a PrinterProvider');
  const { selectPrinter, clearPrinter } = context;
  return { selectPrinter, clearPrinter };
};

/**
 * Hook for printer printing functionality
 * Use this when you need to print orders
 */
export const usePrinterPrint = () => {
  const context = useContext(PrinterContext);
  if (!context) throw new Error('usePrinterPrint must be used within a PrinterProvider');
  const { printing, error, print } = context;
  return { printing, error, print };
};

/**
 * Main printer context hook
 * Use this when you need access to all printer functionality
 */
export const usePrinterContext = () => {
  const context = useContext(PrinterContext);
  if (!context) throw new Error('usePrinterContext must be used within a PrinterProvider');
  return context;
};

function serializePrinterData(printer: DeviceInfo): DeviceInfo {
  return {
    target: printer.target,
    deviceName: printer.deviceName,
    deviceType: printer.deviceType,
    ipAddress: printer.ipAddress,
    macAddress: printer.macAddress,
    bdAddress: printer.bdAddress,
  };
}

/**
 * Creates a new printer instance with the given target and device name
 */
const createPrinter = (target: string, deviceName: string): Printer => {
  return new Printer({ target, deviceName });
};

/**
 * Provider component that manages all printer-related state and functionality
 */
export const PrinterProvider = ({ children }: { children: ReactNode }) => {
  const {
    start,
    printerError: discoveryError,
    isDiscovering,
    printers: discoveredPrinters,
  } = usePrintersDiscovery();

  const [selectedPrinter, setSelectedPrinter] = useState<DeviceInfo | null>(null);
  const [printerStatus, setPrinterStatus] = useState<PrinterStatusResponse | null>(null);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const printerInstance = useMemo(
    () =>
      selectedPrinter ? createPrinter(selectedPrinter.target, selectedPrinter.deviceName) : null,
    [selectedPrinter],
  );

  useEffect(() => {
    if (!printerInstance) {
      setPrinterStatus(null);
      return;
    }

    const stop = Printer.monitorPrinter(printerInstance, (status) => {
      setPrinterStatus(status);
    });

    return () => {
      stop();
      printerInstance.disconnect();
    };
  }, [printerInstance]);

  const isConnected =
    printerStatus?.connection.statusCode === PrinterConstants.TRUE &&
    printerStatus?.online.statusCode === PrinterConstants.TRUE;

  const selectPrinter = (printer: DeviceInfo) => {
    setSelectedPrinter(serializePrinterData(printer));
  };

  const clearPrinter = () => {
    setSelectedPrinter(null);
  };

  const ensureConnection = async (printer: Printer): Promise<void> => {
    await Printer.tryToConnectUntil(
      printer,
      (status) => status.online.statusCode === PrinterConstants.TRUE,
    );
  };

  const handlePrint = async (printTask: (printer: Printer) => Promise<void>) => {
    if (!printerInstance) {
      setError('No printer available');
      return;
    }

    try {
      setPrinting(true);
      setError(null);

      await printerInstance.addQueueTask(async () => {
        await ensureConnection(printerInstance);
        await printTask(printerInstance);
        const result = await printerInstance.sendData();
        await printerInstance.disconnect();
        return result;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to print');
      await printerInstance.disconnect();
    } finally {
      setPrinting(false);
    }
  };

  const contextValue: PrinterContextType = {
    isDiscovering,
    startDiscovery: start,
    discoveredPrinters,
    discoveryError,
    selectedPrinter,
    printerStatus,
    isConnected,
    printerInstance,
    showPrinterModal,
    setShowPrinterModal,
    selectPrinter,
    clearPrinter,
    printing,
    error,
    print: handlePrint,
  };

  return <PrinterContext.Provider value={contextValue}>{children}</PrinterContext.Provider>;
};
