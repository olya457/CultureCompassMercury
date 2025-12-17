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
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
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
      display:flex;
      align-items:center;
      justify-content:center;
      background: transparent !important;
    }
    .svg-sun{
      width:100%;
      height:100%;
      transform-origin: 50% 50%;
      animation: spin 25s linear infinite, sun-glow 3s linear infinite;
    }
    #sun{
      stroke-width:18;
      stroke-dasharray:2;
      stroke-dashoffset:2;
    }
    @keyframes sun-glow {
      0%   { fill: #f1c40f; stroke:#f1c40f; }
      50%  { fill: #e67e22; stroke:#e67e22; }
      100% { fill: #f1c40f; stroke:#f1c40f; }
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <svg class="svg-sun" viewBox="0 0 200 200" aria-hidden="true">
    <g>
      <circle id="sun" cx="100" cy="100" r="55" fill="#f1c40f" stroke="#f1c40f"></circle>
      <g stroke="#f1c40f" stroke-width="10" stroke-linecap="round">
        <line x1="100" y1="10"  x2="100" y2="35"></line>
        <line x1="100" y1="165" x2="100" y2="190"></line>
        <line x1="10"  y1="100" x2="35"  y2="100"></line>
        <line x1="165" y1="100" x2="190" y2="100"></line>
        <line x1="30"  y1="30"  x2="48"  y2="48"></line>
        <line x1="152" y1="152" x2="170" y2="170"></line>
        <line x1="30"  y1="170" x2="48"  y2="152"></line>
        <line x1="152" y1="48"  x2="170" y2="30"></line>
      </g>
    </g>
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
      <View style={[styles.centerWrap, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
