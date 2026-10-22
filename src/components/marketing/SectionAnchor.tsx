import type { ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  id: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Landing section marker with a real DOM `id` on web so navbar can scroll to it.
 */
export function SectionAnchor({ id, children, style }: Props) {
  if (Platform.OS === 'web') {
    return (
      <div id={id} data-landing-section={id} style={{ width: '100%' }}>
        <View style={style}>{children}</View>
      </div>
    );
  }

  return (
    <View nativeID={id} style={style}>
      {children}
    </View>
  );
}
