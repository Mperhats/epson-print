import { useTheme } from '@react-navigation/native';
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { usePrinterContext } from '@/components/PrinterProvider';
import { PrinterModal } from '@/components/PrinterButton/PrinterModal';
import { PrinterStatusBadge } from '@/components/PrinterButton/PrinterStatusBadge';

export const PrinterButton = memo(() => {
  const {
    selectedPrinter,
    startDiscovery,
    isDiscovering,
    discoveredPrinters,
    selectPrinter,
    isConnected,
    showPrinterModal,
    setShowPrinterModal,
  } = usePrinterContext();
  const { colors, dark } = useTheme();

  return (
    <>
      <TouchableOpacity
        style={[styles.printerButton, { backgroundColor: dark ? colors.card : 'transparent' }]}
        onPress={() => setShowPrinterModal(true)}
      >
        <PrinterStatusBadge isConnected={isConnected} />
      </TouchableOpacity>

      <PrinterModal
        isVisible={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        printers={discoveredPrinters}
        selectedPrinter={selectedPrinter}
        onSelectPrinter={selectPrinter}
        isDiscovering={isDiscovering}
        onStartDiscovery={startDiscovery}
      />
    </>
  );
});

PrinterButton.displayName = 'PrinterButton';

const styles = StyleSheet.create({
  printerButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
