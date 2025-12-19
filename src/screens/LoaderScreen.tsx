import React, { useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { WebView } from 'react-native-webview';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

const BG = require('../assets/background.png');

export default function LoaderScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 5000);
    return () => clearTimeout(t);
  }, [navigation]);

  const safeH = Math.max(0, height - insets.top - insets.bottom);

  const size = useMemo(() => {
    const byW = width * 0.78;
    const byH = safeH * 0.42;
    const s = Math.min(byW, byH);
    return Math.max(220, Math.min(340, s));
  }, [width, safeH]);

  const html = useMemo(() => {
    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: transparent !important;
      overflow: hidden;
    }

    body {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent !important;
    }

    .orb {
      width: 100%;
      height: 100%;
      animation: rotate 26s linear infinite;
      transform-origin: 50% 50%;
    }

    .ring {
      fill: none;
      stroke: url(#goldGradient);
      stroke-width: 14;
      stroke-linecap: round;
      stroke-dasharray: 260;
      stroke-dashoffset: 0;
      animation: pulse 3.2s ease-in-out infinite;
      filter: drop-shadow(0 0 12px rgba(212,175,55,0.65));
    }

    .core {
      fill: url(#coreGradient);
      animation: corePulse 2.8s ease-in-out infinite;
      transform-origin: 50% 50%;
      filter: drop-shadow(0 0 18px rgba(255,215,120,0.9));
    }

    @keyframes rotate {
      100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0%   { stroke-dashoffset: 0; opacity: 0.9; }
      50%  { stroke-dashoffset: 60; opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: 0.9; }
    }

    @keyframes corePulse {
      0%   { transform: scale(0.92); opacity: 0.85; }
      50%  { transform: scale(1); opacity: 1; }
      100% { transform: scale(0.92); opacity: 0.85; }
    }
  </style>
</head>
<body>
  <svg class="orb" viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff1a8"/>
        <stop offset="45%" stop-color="#d4af37"/>
        <stop offset="100%" stop-color="#b8891a"/>
      </linearGradient>

      <radialGradient id="coreGradient">
        <stop offset="0%" stop-color="#fff6c2"/>
        <stop offset="70%" stop-color="#e6b94d"/>
        <stop offset="100%" stop-color="#b8891a"/>
      </radialGradient>
    </defs>

    <!-- outer ring -->
    <circle class="ring" cx="100" cy="100" r="68" />

    <!-- glowing core -->
    <circle class="core" cx="100" cy="100" r="28" />
  </svg>
</body>
</html>
`;
  }, []);

  const injected = useMemo(() => {
    return `
      document.documentElement.style.background = 'transparent';
      document.body.style.background = 'transparent';
      true;
    `;
  }, []);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View
        style={[
          styles.centerWrap,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          injectedJavaScript={injected}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          javaScriptEnabled
          domStorageEnabled
          opaque={false}
          style={[styles.web, { width: size, height: size }]}
          {...(Platform.OS === 'android'
            ? { androidLayerType: 'hardware' as const }
            : {})}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  web: {
    backgroundColor: 'transparent',
  },
});
