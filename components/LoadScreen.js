import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

const manaSymbols = [
  require('../assets/Water-mana.png'),
  require('../assets/Fire-mana.png'),
  require('../assets/Tree-mana.png'),
  require('../assets/Skull-mana.png'),
  require('../assets/Sun-mana.png'),
];

const ManaLoadingAnimation = ({ screenType }) => {
  // Shared values for each mana symbol’s vertical position and opacity
  const animations = manaSymbols.map(() => ({
    translateY: useSharedValue(0),
    opacity: useSharedValue(0),
  }));
  
  // Shared values for animated text's opacity and position
  const textOpacity = useSharedValue(0);
  const textPosition = useSharedValue(10);

  useEffect(() => {
    // Loop through each symbol to start the bounce and opacity animations
    animations.forEach((anim, index) => {
      anim.translateY.value = withRepeat(
        withDelay(
          index * 200, // Delay each symbol’s animation by index * 200 ms
          withTiming(-20, { // Bounce up by 20 units
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1, // Infinite repeat
        true,
        () => {
          anim.translateY.value = 0; // Reset to original position
        }
      );

      anim.opacity.value = withRepeat(
        withDelay(
          index * 200,
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true,
        () => {
          anim.opacity.value = 0; // Reset opacity for next bounce
        }
      );
    });

    // Animate text opacity and position
    textOpacity.value = withRepeat(
      withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      true,
      () => {
        textOpacity.value = 0;
      }
    );
    
    textPosition.value = withRepeat(
      withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      
      true,
      () => {
        textPosition.value = 10;
      }
    );
  }, [animations, textOpacity, textPosition]);

  // Animated style for the text
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textPosition.value }],
    };
  });

  // Determine the text based on the screenType prop
  const loadingText = screenType === 'SignUp' ? 'Creating your account...' : 'Logging into your account...';

  return (
    <View style={styles.container}>
      {manaSymbols.map((symbol, index) => {
        const animatedStyle = useAnimatedStyle(() => {
          return {
            opacity: animations[index].opacity.value,
            transform: [
              { translateY: animations[index].translateY.value }, // Bounce up and down
            ],
          };
        });

        return (
          <Animated.Image
            key={index}
            source={symbol}
            style={[styles.symbol, animatedStyle]}
          />
        );
      })}
      <Animated.Text style={[styles.loadingText, animatedTextStyle]}>
        {loadingText}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  symbol: {
    width: 50,
    height: 50,
    marginHorizontal: 8,
  },
  loadingText: {
    fontSize: 18,
    color: "#4A0E4E",
    position: 'absolute',
    bottom: -40,
  },
});

export default ManaLoadingAnimation;
