import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const BG = require('../assets/background.png');

const IMG = {
  s1: require('../assets/onboard1.png'),
  s2: require('../assets/onboard2.png'),
  s3: require('../assets/onboard3.png'),
  s4: require('../assets/onboard4.png'),
  s5: require('../assets/onboard5.png'),
};

export default function OnboardingScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmall = height < 700;
  const [index, setIndex] = useState(0);

  const anim = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const cOpacity = useRef(new Animated.Value(0)).current;
  const cTranslate = useRef(new Animated.Value(10)).current;

  const steps = useMemo(() => [
    {
      key: 's1',
      image: IMG.s1,
      title: 'Greeting',
      subtitle: 'Hi, I’m Mary. I’ll show you Germany\nas a local sees it — honestly,\nsimply, and without tourist filters.',
      button: 'Hello, Mary',
    },
    {
      key: 's2',
      image: IMG.s2,
      title: 'Place categories',
      subtitle: 'Hotels, parks, and attractions —\nchoose what’s really worth your\nattention. I’ve prepared proven\nlocations.',
      button: 'Good',
    },
    {
      key: 's3',
      image: IMG.s3,
      title: 'Interactive map',
      subtitle: 'Move around the map, discover\npoints, and save them so you don’t\nget lost.',
      button: 'Okay, next',
    },
    {
      key: 's4',
      image: IMG.s4,
      title: 'Facts and Quiz',
      subtitle: 'Get facts every day and take a\nchallenging quiz. You’ll prove that\nyou’re a true German expert.',
      button: 'Start now',
    },
    {
      key: 's5',
      image: IMG.s5,
      title: 'Privacy',
      subtitle: 'All information remains on your\ndevice and is not transmitted\nanywhere. It is not mandatory to\nprovide accurate information.',
      button: 'I agree',
    },
  ], []);

  const step = steps[index];

  const bottomContentHeight = isSmall ? 240 : 280;
  const availableImageHeight = height - bottomContentHeight - insets.top - insets.bottom - 40;
  
  const imageSize = Math.min(width * 0.85, availableImageHeight, isSmall ? 280 : 400);

  const playContentIn = () => {
    cOpacity.setValue(0);
    cTranslate.setValue(10);
    Animated.parallel([
      Animated.timing(cOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(cTranslate, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    playContentIn();
  }, [index]);

  const goNext = () => {
    if (index >= steps.length - 1) {
      navigation.replace('Registration1');
      return;
    }

    Animated.parallel([
      Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slide, { toValue: -10, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setIndex((v) => v + 1);
      anim.setValue(0);
      slide.setValue(10);
      Animated.parallel([
        Animated.timing(anim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();
    });
  };

  return (
    <ImageBackground source={BG} style={styles.bg}>
      <View style={[styles.safe, { paddingTop: insets.top || 20, paddingBottom: Math.max(insets.bottom, 20) }]}>
        
        <Animated.View style={[styles.imageContainer, { opacity: anim, transform: [{ translateY: slide }] }]}>
          <Image
            source={step.image}
            style={{ width: imageSize, height: imageSize }}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.bottomWrapper}>
          <View style={[styles.bottomCard, isSmall && { paddingVertical: 15 }]}>
            <Animated.View style={{ opacity: cOpacity, transform: [{ translateY: cTranslate }], alignItems: 'center' }}>
              <Text style={[styles.title, isSmall && { fontSize: 20 }]}>{step.title}</Text>
              <Text style={[styles.subtitle, isSmall && { fontSize: 13, lineHeight: 18 }]}>{step.subtitle}</Text>
              
              <Pressable onPress={goNext} style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
                <Text style={styles.btnText}>{step.button}</Text>
              </Pressable>

              <View style={styles.dots}>
                {steps.map((_, i) => (
                  <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
              </View>
            </Animated.View>
          </View>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomWrapper: {
    justifyContent: 'flex-end',
  },
  bottomCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 25,
    width: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    marginTop: 20,
    width: '100%',
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFD84D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: { transform: [{ scale: 0.97 }] },
  btnText: {
    color: '#111',
    fontWeight: '900',
    fontSize: 16,
  },
  dots: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#FFD84D',
  },
});