import { Text } from 'react-native';
import { styles } from './styles';

interface ScreenTitleProps {
  title: string;
}

export const ScreenTitle = ({ title }: ScreenTitleProps) => {
  return <Text style={styles.text}>{title}</Text>;
};
