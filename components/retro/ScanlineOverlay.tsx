import React from 'react';
import { View, Platform } from 'react-native';

// CRT scanline effect via a repeating gradient — a web-only CSS concept.
// Native gets nothing rather than an approximation, to avoid perf/rendering
// artifacts on real devices.
const webOverlayStyle =
  Platform.OS === 'web'
    ? ({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)',
        opacity: 0.35,
      } as const)
    : null;

export const ScanlineOverlay: React.FC = () => {
  if (Platform.OS !== 'web') return null;
  return <View pointerEvents="none" style={webOverlayStyle as any} />;
};
