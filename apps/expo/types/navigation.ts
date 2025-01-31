import type { DeviceInfo } from 'react-native-esc-pos-printer';

export type TabParamList = {
  discovery: undefined;
  'simple-print': {
    printer: DeviceInfo;
  };
  'print-from-view': {
    printer: DeviceInfo;
  };
  printer: {
    printer: DeviceInfo;
  };
};
