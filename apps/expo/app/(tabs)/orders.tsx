import { Button, ScreenTitle } from '@/components';
import { Order } from '@/components/Order/Order';
import type {
  OrderDeliveryInfoMerchantDtoCourierStatusEnum,
  OrderMerchantDto,
} from '@nosh/backend-merchant-sdk';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import activeItems from '../../data/active-items.json';

// Mock theme for demonstration - replace with your actual theme
const theme = {
  name: 'default',
  isDark: false,
  colors: {
    primary: '#000000',
    contrast: '#FFFFFF',
    contrastSubtle: '#F5F5F5',
  },
};

export default memo(function OrdersScreen() {
  const [_selectedOrder, setSelectedOrder] = useState<OrderMerchantDto | null>(null);
  const router = useRouter();

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

  const handleOrderPress = (order: OrderMerchantDto) => {
    setSelectedOrder(order);
    // Navigate to discovery screen to select a printer
    router.push({
      pathname: '/discovery',
      params: {
        returnTo: '/orders',
        order: JSON.stringify(order),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenTitle title={'Orders'} />
      </View>
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
  headerContainer: {
    paddingTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
