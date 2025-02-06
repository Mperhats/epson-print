import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { styles } from './styles';

interface ButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  topOffset?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ 
  onPress, 
  title, 
  loading = false,
  topOffset = false,
  variant = 'primary' 
}: ButtonProps) => {
  const { colors, dark } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[
        styles.container,
        topOffset && styles.containerSpace,
        {
          backgroundColor: variant === 'primary' ? colors.primary : 'transparent',
          borderColor: colors.primary,
        },
      ]}
      disabled={loading}
    >
      <Text 
        style={[
          styles.text, 
          loading && styles.hidden,
          { 
            color: variant === 'primary' 
              ? colors.card 
              : colors.primary
          }
        ]}
      >
        {title}
      </Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' ? colors.card : colors.primary} 
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};
