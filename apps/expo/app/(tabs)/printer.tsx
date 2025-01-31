import { Button, PrinterInfo, ScreenTitle } from '@/components';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DeviceInfo } from 'react-native-esc-pos-printer';

export default memo(function PrinterScreen() {
  const params = useLocalSearchParams<{ printer: string }>();
  const printer = params.printer ? (JSON.parse(params.printer) as DeviceInfo) : null;
  const router = useRouter();

  if (!printer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No printer data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <ScreenTitle title={'Simple Print'} />
      </View>
      <View style={styles.contentContainer}>
        <PrinterInfo printer={printer} />
      </View>
      <View style={styles.contentContainer}>
        <Button
          loading={false}
          title="Simple Print"
          onPress={() =>
            router.push({
              pathname: '/simple-print',
              params: { printer: params.printer },
            })
          }
        />
        <Button
          loading={false}
          title="Print From View"
          onPress={() =>
            router.push({
              pathname: '/print-from-view',
              params: { printer: params.printer },
            })
          }
          topOffset
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf9f9',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
});
