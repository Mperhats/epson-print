import { Button, PrinterInfo, PrinterStatus, ScreenTitle } from '@/components';
import type { OrderMerchantDto } from '@nosh/backend-merchant-sdk';
import { useLocalSearchParams } from 'expo-router';
import { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  type DeviceInfo,
  Printer,
  PrinterConstants,
  type PrinterStatusResponse,
} from 'react-native-esc-pos-printer';

export default memo(function OrderPrintScreen() {
  const params = useLocalSearchParams<{ printer: string; order: string }>();
  const printer = params.printer ? (JSON.parse(params.printer) as DeviceInfo) : null;
  const order = params.order ? (JSON.parse(params.order) as OrderMerchantDto) : null;

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

  if (!printer || !printerInstance || !order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No printer or order data available</Text>
      </View>
    );
  }

  const formatPrice = (price?: number) => {
    if (!price) return '$0.00';
    return `$${(price / 100).toFixed(2)}`;
  };

  const printOrder = async () => {
    try {
      setPrinting(true);
      setError(null);

      const res = await printerInstance.addQueueTask(async () => {
        await Printer.tryToConnectUntil(
          printerInstance,
          (status) => status.online.statusCode === PrinterConstants.TRUE,
        );

        // Header
        await printerInstance.addTextAlign(PrinterConstants.ALIGN_CENTER);
        await printerInstance.addTextSize({ width: 2, height: 2 });
        await printerInstance.addText('ORDER RECEIPT');
        await printerInstance.addFeedLine(2);

        // Order ID
        await printerInstance.addTextSize({ width: 1, height: 1 });
        await printerInstance.addText(`Order #${order.readableId || order.id}`);
        await printerInstance.addFeedLine(2);

        // Items
        await printerInstance.addTextAlign(PrinterConstants.ALIGN_LEFT);
        for (const item of order.cartItems || []) {
          await Printer.addTextLine(printerInstance, {
            left: `${item.quantity}x ${item.name}`,
            right: formatPrice(item.price * item.quantity),
            gapSymbol: '.',
          });
          await printerInstance.addFeedLine();

          // Modifiers
          for (const group of item.cartModifierGroups || []) {
            for (const modifier of group.modifiers) {
              await printerInstance.addText(`  ${modifier.quantity}x ${modifier.name}`);
              if (modifier.price > 0) {
                await printerInstance.addText(` (${formatPrice(modifier.price)})`);
              }
              await printerInstance.addFeedLine();
            }
          }

          // Special Instructions
          if (item.specialInstructions) {
            await printerInstance.addText('  Special Instructions:');
            await printerInstance.addFeedLine();
            await printerInstance.addText(`  ${item.specialInstructions}`);
            await printerInstance.addFeedLine();
          }
        }

        // Order Notes
        if (order.orderNotes) {
          await printerInstance.addFeedLine();
          await printerInstance.addText('Order Notes:');
          await printerInstance.addFeedLine();
          await printerInstance.addText(order.orderNotes);
          await printerInstance.addFeedLine(2);
        }

        // Total
        await printerInstance.addTextSize({ width: 2, height: 2 });
        await Printer.addTextLine(printerInstance, {
          left: 'TOTAL',
          right: formatPrice(order.cost?.subtotalAmount),
          gapSymbol: '.',
        });

        await printerInstance.addFeedLine(4);
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
        <ScreenTitle title="Print Order" />
      </View>
      <View style={styles.contentContainer}>
        {currentStatus ? <PrinterStatus status={currentStatus} /> : null}
        <PrinterInfo printer={printer} />
      </View>
      <View style={styles.contentContainer}>
        <Button loading={printing} title="Print Order" onPress={printOrder} />
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
