import { FlatList, View } from 'react-native';
import type { DeviceInfo } from 'react-native-esc-pos-printer';
import { PrinterItem } from '../PrinterItem';
import { styles } from './styles';

interface PrintersListProps {
  printers: DeviceInfo[];
  onPress: (printer: DeviceInfo) => void;
}

export const PrintersList = ({ printers, onPress }: PrintersListProps) => {
  const renderItem = ({ item }: { item: DeviceInfo }) => {
    return <PrinterItem printer={item} onPress={onPress} />;
  };

  return (
    <View style={styles.container}>
      <FlatList data={printers} renderItem={renderItem} />
    </View>
  );
};
