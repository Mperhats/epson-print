import { useTheme } from '@react-navigation/native';
import { memo, useCallback } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { DeviceInfo } from 'react-native-esc-pos-printer';

import { Button } from '@/components';
import { PrinterItem } from './PrinterItem';

interface PrinterModalProps {
  isVisible: boolean;
  onClose: () => void;
  printers: DeviceInfo[];
  selectedPrinter: DeviceInfo | null;
  onSelectPrinter: (printer: DeviceInfo) => void;
  isDiscovering: boolean;
  onStartDiscovery: () => void;
}

export const PrinterModal = memo(({
  isVisible,
  onClose,
  printers,
  selectedPrinter,
  onSelectPrinter,
  isDiscovering,
  onStartDiscovery,
}: PrinterModalProps) => {
  const { colors } = useTheme();

  const handlePrinterSelect = useCallback((printer: DeviceInfo) => {
    onSelectPrinter(printer);
    onClose();
  }, [onSelectPrinter, onClose]);

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Printer</Text>
          <ScrollView style={styles.printerList}>
            {printers.map((printer) => (
              <PrinterItem
                key={printer.target}
                printer={printer}
                isSelected={selectedPrinter?.target === printer.target}
                onSelect={handlePrinterSelect}
                colors={colors}
              />
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <Button
              title={isDiscovering ? 'Searching...' : 'Search for Printers'}
              onPress={onStartDiscovery}
              loading={isDiscovering}
              variant="primary"
            />
            <Button title="Close" variant="secondary" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
});

PrinterModal.displayName = 'PrinterModal';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  printerList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
}); 