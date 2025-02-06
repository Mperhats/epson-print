import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { DeviceInfo } from 'react-native-esc-pos-printer';

interface PrinterItemProps {
  printer: DeviceInfo;
  isSelected: boolean;
  onSelect: (printer: DeviceInfo) => void;
  colors: {
    text: string;
    primary: string;
    border: string;
  };
}

export const PrinterItem = memo(({ printer, isSelected, onSelect, colors }: PrinterItemProps) => (
  <TouchableOpacity
    key={printer.target}
    style={[
      styles.printerItem,
      {
        borderBottomColor: colors.border,
        backgroundColor: isSelected ? `${colors.primary}20` : 'transparent',
      },
    ]}
    onPress={() => onSelect(printer)}
  >
    <Text style={[styles.printerName, { color: colors.text }]}>
      {printer.deviceName}
      {isSelected && ' (Selected)'}
    </Text>
    <Text style={[styles.printerTarget, { color: `${colors.text}99` }]}>{printer.target}</Text>
  </TouchableOpacity>
));

PrinterItem.displayName = 'PrinterItem';

const styles = StyleSheet.create({
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
}); 