import { usePrinterPrint } from '@/components/PrinterProvider';
import type { OrderMerchantDto } from '@nosh/backend-merchant-sdk';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { DeviceInfo } from 'react-native-esc-pos-printer';
import { Button } from '../Button';
import { Order } from '../Order/Order';
import { PrinterStatus } from '../PrinterStatus';
import { styles } from './OrderModal.styles';

interface OrderModalProps {
  visible: boolean;
  onClose: () => void;
  order: OrderMerchantDto | null;
  printer: DeviceInfo | null;
  theme: {
    name: string;
    isDark: boolean;
    colors: {
      primary: string;
      contrast: string;
      contrastSubtle: string;
    };
  };
}

export const OrderModal = ({ visible, onClose, order, printer, theme }: OrderModalProps) => {
  const { printing, error, printOrder } = usePrinterPrint();

  const handlePrint = async () => {
    if (order) {
      await printOrder(order);
    }
  };

  if (!order) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.colors.contrast }]}>
          <ScrollView style={styles.scrollView}>
            <Order selectedOrder={order} theme={theme} />
            {error && (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: theme.colors.primary }]}>{error}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              title="Print Order"
              onPress={handlePrint}
              loading={printing}
              topOffset={false}
            />
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.colors.contrastSubtle }]}
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, { color: theme.colors.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
