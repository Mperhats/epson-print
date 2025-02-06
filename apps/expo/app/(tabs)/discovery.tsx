import { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { usePrintersDiscovery } from 'react-native-esc-pos-printer';
import { PrintersList, Button, ScreenTitle } from '@/components';
import { useRouter } from 'expo-router';
import type { DeviceInfo } from 'react-native-esc-pos-printer';

export default memo(function DiscoveryScreen() {
  const { start, printerError, isDiscovering, printers } = usePrintersDiscovery();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <ScreenTitle title={'Discovery'} />
      </View>
      <PrintersList
        onPress={(printer: DeviceInfo) => {
          if (printer) {
            router.push({
              pathname: '/printer',
              params: { printer: JSON.stringify(printer) }
            });
          }
        }}
        printers={printers}
      />
      <View style={styles.contentContainer}>
        <Button
          loading={isDiscovering}
          title="Search"
          onPress={() => start()}
        />
        {printerError ? (
          <Text style={styles.errorText}>{printerError.message}</Text>
        ) : null}
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
