import React, { useEffect, useRef, useState } from 'react';
import { Animated, AccessibilityInfo, StyleProp, TextStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

// Blinking "PRESS START"-style prompt. Mirrors the reduce-motion-aware pulse
// pattern already established in components/LearningPath.tsx's PhaseNode.
export const BlinkingText: React.FC<Props> = ({ children, style }) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.2, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, pulse]);

  return <Animated.Text style={[style, { opacity: pulse }]}>{children}</Animated.Text>;
};
