import { Button, PrinterInfo, PrinterStatus, ScreenTitle } from '@/components';
import { useLocalSearchParams } from 'expo-router';
import { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  type DeviceInfo,
  Printer,
  PrinterConstants,
  type PrinterStatusResponse,
} from 'react-native-esc-pos-printer';

export default memo(function SimplePrintScreen() {
  const params = useLocalSearchParams<{ printer: string }>();
  const printer = params.printer ? (JSON.parse(params.printer) as DeviceInfo) : null;

  const [printing, setPrinting] = useState(false);
  const [currentStatus, setStatus] = useState<PrinterStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const printerInstance = useMemo(() => {
    if (!printer) return null;
    return new Printer({
      target: printer.target,
      deviceName: printer.deviceName,
    });
  }, [printer]);

  useEffect(() => {
    if (!printerInstance) return;

    const stop = Printer.monitorPrinter(printerInstance, (nextStatus) => {
      setStatus(nextStatus);
    });

    return stop;
  }, [printerInstance]);

  if (!printer || !printerInstance) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No printer data available</Text>
      </View>
    );
  }

  const printSimpleReceipt = async () => {
    try {
      setPrinting(true);
      setError(null);

      const res = await printerInstance.addQueueTask(async () => {
        await Printer.tryToConnectUntil(
          printerInstance,
          (status) => status.online.statusCode === PrinterConstants.TRUE,
        );

        await printerInstance.addTextAlign(PrinterConstants.ALIGN_CENTER);

        await printerInstance.addTextSize({ width: 3, height: 3 });
        await printerInstance.addText('DUDE!');
        await printerInstance.addFeedLine();
        await printerInstance.addTextSmooth(PrinterConstants.TRUE);
        await printerInstance.addText('DUDE!');
        await printerInstance.addFeedLine();
        await printerInstance.addTextSmooth(PrinterConstants.FALSE);
        await printerInstance.addTextSize({ width: 1, height: 1 });
        await printerInstance.addText('is that a ');
        await printerInstance.addFeedLine();
        await printerInstance.addTextStyle({
          em: PrinterConstants.TRUE,
          ul: PrinterConstants.TRUE,
          color: PrinterConstants.PARAM_UNSPECIFIED,
        } as const);

        await printerInstance.addText('printer?');
        await printerInstance.addFeedLine();
        await printerInstance.addTextStyle(); // reset styles
        await printerInstance.addTextAlign(PrinterConstants.ALIGN_LEFT);
        await printerInstance.addText('Left');
        await printerInstance.addFeedLine();
        await printerInstance.addTextAlign(PrinterConstants.ALIGN_RIGHT);
        await printerInstance.addText('Right');
        await printerInstance.addFeedLine();
        await printerInstance.addTextSize({ width: 1, height: 1 });
        await Printer.addTextLine(printerInstance, {
          left: 'Cheesburger',
          right: '3 EUR',
          gapSymbol: '_',
        });
        await printerInstance.addFeedLine();
        await printerInstance.addTextSize({ width: 1, height: 1 });
        await Printer.addTextLine(printerInstance, {
          left: 'Chickenburger',
          right: '1.5 EUR',
          gapSymbol: '.',
        });
        await printerInstance.addFeedLine();
        await printerInstance.addTextSize({ width: 2, height: 2 });
        await Printer.addTextLine(printerInstance, {
          left: 'Happy Meal',
          right: '7 EUR',
          gapSymbol: '.',
        });
        await printerInstance.addFeedLine();
        await printerInstance.addTextAlign(PrinterConstants.ALIGN_CENTER);
        await printerInstance.addImage({
          source: require('@/assets/images/store.png'),
          width: 100,
        });
        await printerInstance.addFeedLine();
        await printerInstance.addBarcode({
          data: 'Test123',
          type: PrinterConstants.BARCODE_CODE93,
          hri: PrinterConstants.HRI_BELOW,
          width: 2,
          height: 50,
        });

        await printerInstance.addSymbol({
          type: PrinterConstants.SYMBOL_QRCODE_MODEL_2,
          level: PrinterConstants.LEVEL_M,
          size: 5,
          data: 'Test123',
        });

        await printerInstance.addCut();

        const result = await printerInstance.sendData();

        await printerInstance.disconnect();
        return result;
      });
      if (res) {
        setStatus(res);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to print');
      await printerInstance.disconnect();
    } finally {
      setPrinting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <ScreenTitle title={'Simple Print'} />
      </View>
      <View style={styles.contentContainer}>
        {currentStatus ? <PrinterStatus status={currentStatus} /> : null}
        <PrinterInfo printer={printer} />
      </View>
      <View style={styles.contentContainer}>
        <Button loading={printing} title="Test print" onPress={printSimpleReceipt} />
        {error && <Text style={styles.errorText}>{error}</Text>}
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
