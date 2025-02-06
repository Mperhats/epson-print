import { Order } from '@/components/Order/Order';
import { usePrinterPrint } from '@/components/PrinterProvider';
import type {
  OrderDeliveryInfoMerchantDtoCourierStatusEnum,
  OrderMerchantDto,
} from '@nosh/backend-merchant-sdk';
import { useTheme } from '@react-navigation/native';
import { memo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import activeItems from '../data/active-items.json';

export default memo(function OrdersScreen() {
  const { printOrder } = usePrinterPrint();
  const { colors, dark } = useTheme();

  // Transform the raw data to match OrderMerchantDto
  const orders = (activeItems.result || []).map((order) => ({
    ...order,
    deliveryInformation: {
      ...order.deliveryInformation,
      courierStatus: order.deliveryInformation
        .courierStatus as OrderDeliveryInfoMerchantDtoCourierStatusEnum,
    },
    cost: {
      ...order.cost,
      fees: order.cost.fees.map((fee) => ({
        ...fee,
        description: fee.description || '',
      })),
    },
    cartItems: order.cartItems.map((item) => ({
      ...item,
      total: item.price * item.quantity,
      images: [],
    })),
  })) as unknown as OrderMerchantDto[];

  const handleOrderPress = async (order: OrderMerchantDto) => {
    await printOrder(order);
  };

  const theme = {
    name: dark ? 'dark' : 'default',
    isDark: dark,
    colors: {
      primary: colors.text,
      contrast: colors.card,
      contrastSubtle: colors.border,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {orders.map((order) => (
          <TouchableOpacity key={order.id} onPress={() => handleOrderPress(order)}>
            <Order selectedOrder={order} theme={theme} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf9f9',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
