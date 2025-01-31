import { Text, View } from 'react-native';
import type { DeviceInfo } from 'react-native-esc-pos-printer';
import { styles } from './styles';

interface PrinterInfoProps {
  printer: DeviceInfo;
}

export const PrinterInfo = ({ printer }: PrinterInfoProps) => {
  const renderPrinterInfo = () => {
    const printerKeys = ['deviceName', 'target', 'deviceType', 'ipAddress', 'macAddress'] as const;
    return printerKeys.map((key) => {
      return (
        <Text key={key} style={styles.text}>
          <Text style={[styles.text, styles.bold]}>{key}</Text>: {printer[key]}
        </Text>
      );
    });
  };

  return <View style={styles.container}>{renderPrinterInfo()}</View>;
};
