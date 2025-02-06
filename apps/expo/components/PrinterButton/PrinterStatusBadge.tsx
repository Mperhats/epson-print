import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PrinterStatusBadgeProps {
  isConnected: boolean;
}

export const PrinterStatusBadge = memo(({ isConnected }: PrinterStatusBadgeProps) => (
  <View style={[styles.statusBadge, { backgroundColor: isConnected ? '#4CAF50' : '#f44336' }]}>
    <Ionicons name="print" size={16} color="#fff" />
    <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Connect'}</Text>
  </View>
));

PrinterStatusBadge.displayName = 'PrinterStatusBadge';

const styles = StyleSheet.create({
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
});
