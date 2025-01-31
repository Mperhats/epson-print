import { Button, PrintersList, ScreenTitle } from '@/components';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePrintersDiscovery } from 'react-native-esc-pos-printer';
import type { DeviceInfo } from 'react-native-esc-pos-printer';

export default memo(function DiscoveryScreen() {
  const { start, printerError, isDiscovering, printers } = usePrintersDiscovery();
  const router = useRouter();

  const handlePrinterSelect = (printer: DeviceInfo) => {
    if (!printer) return;

    // Serialize only the necessary printer properties
    const serializedPrinter = {
      target: printer.target,
      deviceName: printer.deviceName,
      deviceType: printer.deviceType,
      ipAddress: printer.ipAddress,
      macAddress: printer.macAddress,
    };

    router.push({
      pathname: '/printer',
      params: { printer: JSON.stringify(serializedPrinter) },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <ScreenTitle title={'Discovery'} />
      </View>
      <PrintersList onPress={handlePrinterSelect} printers={printers} />
      <View style={styles.contentContainer}>
        <Button loading={isDiscovering} title="Search" onPress={() => start()} />
        {printerError ? <Text style={styles.errorText}>{printerError.message}</Text> : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf9f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
});
