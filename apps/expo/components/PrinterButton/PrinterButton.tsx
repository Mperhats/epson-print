import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components';
import { usePrinterContext } from '@/components/PrinterProvider';

export function PrinterButton() {
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
        <View
          style={[styles.statusBadge, { backgroundColor: isConnected ? '#4CAF50' : '#f44336' }]}
        >
          <Ionicons name="print" size={16} color="#fff" />
          <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Connect'}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={showPrinterModal} animationType="slide" transparent>
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.75)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Printer</Text>
            <ScrollView style={styles.printerList}>
              {discoveredPrinters.map((printer) => (
                <TouchableOpacity
                  key={printer.target}
                  style={[
                    styles.printerItem,
                    {
                      borderBottomColor: colors.border,
                      backgroundColor:
                        selectedPrinter?.target === printer.target
                          ? `${colors.primary}20` // 20 is hex for 12% opacity
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    selectPrinter(printer);
                    setShowPrinterModal(false);
                  }}
                >
                  <Text style={[styles.printerName, { color: colors.text }]}>
                    {printer.deviceName}
                    {selectedPrinter?.target === printer.target && ' (Selected)'}
                  </Text>
                  <Text style={[styles.printerTarget, { color: `${colors.text}99` }]}>
                    {printer.target}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.buttonContainer}>
              <Button
                title={isDiscovering ? 'Searching...' : 'Search for Printers'}
                onPress={startDiscovery}
                loading={isDiscovering}
                variant="primary"
              />
              <Button
                title="Close"
                variant="secondary"
                onPress={() => setShowPrinterModal(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  printerButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
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
  printerItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
  },
  printerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  printerTarget: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
});
