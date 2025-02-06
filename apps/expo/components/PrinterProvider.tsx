import { EscPosPrinterService, type PrinterService } from '@/services/printer.service';
import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { DeviceInfo } from 'react-native-esc-pos-printer';
import {
  Printer,
  PrinterConstants,
  type PrinterStatusResponse,
  usePrintersDiscovery,
} from 'react-native-esc-pos-printer';
import type { OrderMerchantDto } from '@nosh/backend-merchant-sdk';
import { OrderPrinterAdapter } from '@/services/order-printer.adapter';

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
  printerService: PrinterService | null;
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
  printOrder: (order: OrderMerchantDto) => Promise<void>;
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
  const { printing, error, printOrder } = context;
  return { printing, error, printOrder };
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

function createPrinterInstance(printer: DeviceInfo | null): Printer | null {
  if (!printer) return null;
  return new Printer({
    target: printer.target,
    deviceName: printer.deviceName,
  });
}

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
 * Provider component that manages all printer-related state and functionality
 * Handles printer discovery, connection management, and UI state
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

  const printerInstance = useMemo(() => createPrinterInstance(selectedPrinter), [selectedPrinter]);

  const printerService = useMemo(() => {
    if (!printerInstance) return null;
    return new EscPosPrinterService(printerInstance);
  }, [printerInstance]);

  const orderAdapter = useMemo(() => new OrderPrinterAdapter(), []);

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

  const printOrder = async (order: OrderMerchantDto) => {
    if (!printerService) {
      setError('No printer available');
      return;
    }

    try {
      setPrinting(true);
      setError(null);

      const printJob = orderAdapter.createPrintJob(order);
      await printerService.print(printJob);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to print');
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
    printerService,
    showPrinterModal,
    setShowPrinterModal,
    selectPrinter,
    clearPrinter,
    printing,
    error,
    printOrder,
  };

  return <PrinterContext.Provider value={contextValue}>{children}</PrinterContext.Provider>;
};
