import { Animated, Text, View } from 'react-native';
import React, { useRef, useEffect } from 'react';

const TextAnimation = ({ text, duration = 5000, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // Start at 50% of size

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, // Full opacity
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, // Full size (no scaling)
        friction: 4,  // Control bounciness (lower friction = more bounce)
        tension: 50,  // Control speed of bounce (higher tension = faster bounce)
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim, duration]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <Text style={style}>{text}</Text>
    </Animated.View>
  );
};

export default TextAnimation;
