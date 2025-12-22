import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Dimensions,
  Animated,
  Easing,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { IMAGES } from '../data/images';
import { getSavedPlaces, removeSavedPlace, type SavedPlace } from '../storage/savedPlaces';

const { height: H } = Dimensions.get('window');
const IS_TINY = H < 690;

const BG = require('../assets/background.png');
const ICON_BOOKMARK_FILLED = require('../assets/ic_bookmark_filled.png');
const ICON_MAP = require('../assets/ic_map.png');

export default function SavedScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const headerTop = Platform.OS === 'android' ? insets.top + 20 : insets.top;

  const [items, setItems] = useState<SavedPlace[]>([]);
  const a = useRef(new Animated.Value(0)).current;

  const runIn = () => {
    a.setValue(0);
    Animated.timing(a, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const load = useCallback(async () => {
    const list = await getSavedPlaces();
    setItems(list);
  }, []);

  useEffect(() => {
    load();
    runIn();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onToggle = async (id: string) => {
    const next = await removeSavedPlace(id);
    setItems(next);
  };

  const openCategory = (p: SavedPlace) => {
    navigation.navigate('Category', { category: p.category });
  };

  const openMap = (p: SavedPlace) => {
    navigation.navigate('MainTabs', {
      screen: 'IntMap',
      params: {
        autoFocusId: p.id,
        category: p.category,
      },
    });
  };

  const empty = items.length === 0;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <Animated.View
        style={[
          styles.header,
          { paddingTop: headerTop + 12 },
          {
            opacity: a,
            transform: [
              { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) },
            ],
          },
        ]}
      >
        <Text style={styles.title}>Saved</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.body,
          {
            opacity: a,
            transform: [
              { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
            ],
          },
        ]}
      >
        {empty ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No saved places yet</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            scrollIndicatorInsets={{ bottom: 60 }}
          >
            {items.map((p) => {
              const img = IMAGES[p.imageKey] ?? IMAGES.fallback;

              return (
                <View key={p.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Image source={img} style={styles.cardImage} resizeMode="cover" />
                  </View>

                  <View style={styles.cardBottom}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {p.title} ({p.city})
                    </Text>

                    <Text style={styles.coordsText}>
                      Coordinates: {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                    </Text>

                    <View style={styles.rowActions}>
                      <Pressable
                        onPress={() => openCategory(p)}
                        style={({ pressed }) => [styles.btnYellow, pressed && styles.pressed]}
                      >
                        <Text style={styles.btnYellowText}>OPEN CATEGORY</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => openMap(p)}
                        style={({ pressed }) => [styles.btnDark, pressed && styles.pressed]}
                      >
                        <Image source={ICON_MAP} style={styles.btnIcon} />
                        <Text style={styles.btnDarkText}>MAP</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => onToggle(p.id)}
                        style={({ pressed }) => [styles.btnBookmark, pressed && styles.pressed]}
                      >
                        <Image source={ICON_BOOKMARK_FILLED} style={styles.bookIcon} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={{ height: 78 }} />
          </ScrollView>
        )}
      </Animated.View>
    </ImageBackground>
  );
}

const CARD_RADIUS = 22;

const styles = StyleSheet.create({
  bg: { flex: 1 },

  header: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  title: { color: '#fff', fontWeight: '900', fontSize: 15, opacity: 0.92 },

  body: { flex: 1 },

  list: {
    paddingHorizontal: 18,
    paddingTop: 10,
    gap: 14,
    paddingBottom: 78,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: { color: 'rgba(255,255,255,0.75)', fontWeight: '800' },

  card: {
    backgroundColor: 'rgba(0,22,45,0.78)',
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  cardTop: {
    height: IS_TINY ? 150 : 175,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cardImage: { width: '100%', height: '100%' },

  cardBottom: {
    padding: 14,
    backgroundColor: 'rgba(0,22,45,0.92)',
  },

  cardTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 6,
  },

  coordsText: {
    color: '#FFD84D',
    fontWeight: '900',
    fontSize: 13,
    marginBottom: 12,
  },

  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  btnYellow: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFD84D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnYellowText: { color: '#111', fontWeight: '900', fontSize: 14, letterSpacing: 0.4 },

  btnDark: {
    width: 92,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnDarkText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  btnIcon: { width: 16, height: 16, tintColor: '#FFD84D' },

  btnBookmark: {
    width: 54,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookIcon: { width: 18, height: 18, tintColor: '#FFD84D' },

  pressed: { transform: [{ scale: 0.985 }] },
});
