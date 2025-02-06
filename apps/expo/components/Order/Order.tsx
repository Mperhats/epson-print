import type { OrderMerchantDto } from '@nosh/backend-merchant-sdk';
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './Order.styles';

interface Theme {
  name: string;
  isDark: boolean;
  colors: {
    primary: string;
    contrast: string;
    contrastSubtle: string;
  };
}

interface OrderProps {
  selectedOrder: OrderMerchantDto;
  theme: Theme;
}

interface OrderNotesProps {
  orderNotes: string;
  theme: Theme;
}

interface OrderProductItemProps {
  item?: {
    id: string;
    quantity: number;
    price: number;
    specialInstructions?: string | null;
    name: string;
    cartModifierGroups: Array<{
      catalogModifierGroupId: string;
      name: string;
      modifiers: Array<{ id: string; name: string; quantity: number; price: number }>;
    }>;
  };
  theme: Theme;
  showDivider?: boolean;
}

const formatPrice = (price?: number) => {
  if (!price) return '$0.00';
  return `$${(price / 100).toFixed(2)}`;
};

export const Order = ({ selectedOrder, theme }: OrderProps) => {
  return (
    <View style={styles.orderDetailsContent}>
      {selectedOrder.cartItems?.map((item, index) => {
        const cartItemsCount = selectedOrder.cartItems?.length || 0;
        return (
          <OrderProductItem
            key={item.id}
            item={item}
            theme={theme}
            showDivider={index !== cartItemsCount - 1}
          />
        );
      })}

      {selectedOrder.orderNotes && selectedOrder.orderNotes.length > 0 && (
        <OrderNotesBubble orderNotes={selectedOrder.orderNotes} theme={theme} />
      )}
    </View>
  );
};

export const OrderNotesBubble = ({ orderNotes, theme }: OrderNotesProps) => {
  return (
    <View style={[styles.orderNotesContainer, { backgroundColor: theme.colors.contrastSubtle }]}>
      <Text style={[styles.orderNoteText, { color: theme.colors.primary }]}>{orderNotes}</Text>
    </View>
  );
};

export const OrderProductItem = ({ item, theme, showDivider }: OrderProductItemProps) => {
  if (!item) return null;

  const flatModifiers = item.cartModifierGroups.flatMap((group) => {
    return group.modifiers.map((modifier) => ({
      id: modifier.id,
      name: modifier.name,
      quantity: modifier.quantity,
      price: modifier.price,
      depth: 1,
    }));
  });

  return (
    <View style={styles.productItemContainer}>
      <View style={styles.productRow}>
        <View style={styles.productQuantityRow}>
          <View>
            <View style={[styles.quantityButton, { backgroundColor: theme.colors.contrastSubtle }]}>
              <Text style={[{ color: theme.colors.primary }]}>{item.quantity.toString()}</Text>
            </View>
          </View>

          <Text style={[styles.productName, { color: theme.colors.primary }]}>{item.name}</Text>
        </View>

        <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
          {formatPrice(item.price)}
        </Text>
      </View>

      <View style={styles.modifiersContainer}>
        {flatModifiers.map((modifier) => (
          <Text
            key={modifier.id}
            style={[
              styles.modifierItem,
              { marginLeft: modifier.depth * 8, color: theme.colors.primary },
            ]}
          >
            {modifier.quantity} × {modifier.name}{' '}
            {modifier.price > 0 ? ` (${formatPrice(modifier.price)})` : ''}
          </Text>
        ))}

        {item.specialInstructions && (
          <View style={styles.specialInstructions}>
            <Text style={[{ color: theme.colors.primary }]}>Special instructions:</Text>
            <Text style={[{ color: theme.colors.primary }]}>{item.specialInstructions}</Text>
          </View>
        )}

        {showDivider && (
          <View
            style={{ height: 1, backgroundColor: theme.colors.contrastSubtle, marginVertical: 8 }}
          />
        )}
      </View>
    </View>
  );
};
