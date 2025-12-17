import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Share,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { height: H } = Dimensions.get('window');
const IS_TINY = H < 690;

const BG = require('../assets/background.png');
const ICON_BACK = require('../assets/ic_back.png');
const ICON_BOOKMARK = require('../assets/ic_bookmark.png');
const ICON_BOOKMARK_FILLED = require('../assets/ic_bookmark_filled.png');
const ICON_SHARE = require('../assets/ic_share.png');
const ICON_MAP = require('../assets/ic_map.png');
const MAP_PREVIEW = require('../assets/map_preview.png');

const IMAGES = {
  hotel_adlon: require('../assets/hotel_adlon.png'),
  bayerischer_hof: require('../assets/bayerischer_hof.png'),
  atlantic_hamburg: require('../assets/atlantic_hamburg.png'),
  hotel_elephant: require('../assets/hotel_elephant.png'),
  brenners_baden: require('../assets/brenners_baden.png'),
  the_fontenay: require('../assets/the_fontenay.png'),
  mandarin_munich: require('../assets/mandarin_munich.png'),
  das_stue: require('../assets/das_stue.png'),
} as const;

type Place = {
  id: string;
  title: string;
  city: string;
  description: string;
  coordsText: string;
  lat: number;
  lng: number;
  stars: 4 | 5;
  imageKey: keyof typeof IMAGES;
};

const SAVED_KEY = 'saved_places_v1';

async function loadSavedIDs(): Promise<Record<string, true>> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as string[];
    const map: Record<string, true> = {};
    parsed.forEach((id) => (map[id] = true));
    return map;
  } catch {
    return {};
  }
}

async function saveSavedIDs(map: Record<string, true>) {
  const ids = Object.keys(map).filter((k) => map[k]);
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(ids));
}

function StarsRow({ count }: { count: number }) {
  const stars = new Array(count).fill('★').join('');
  return <Text style={styles.stars}>{stars}</Text>;
}

export default function HotelsPlaceScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const places: Place[] = useMemo(
    () => [
      {
        id: 'hotel_adlon',
        title: 'Hotel Adlon Kempinski',
        city: 'Berlin',
        description:
          'Hotel Adlon Kempinski is one of the most prestigious hotels in Europe, located right next to the Brandenburg Gate. A place with over a century of history that has seen emperors, diplomats, artists and world-class political events. The interior design combines classicism and modern elegance: marble floors, detailed carvings, warm lighting and exquisite art objects. The hotel is famous for its impeccable service and cuisine, offering interpretations of German and international dishes. Many rooms overlook the Paris square. This is a place where you can feel the prestige, past and style of modern Berlin.',
        coordsText: 'Coordinates: 52.5163, 13.3777',
        lat: 52.5163,
        lng: 13.3777,
        stars: 5,
        imageKey: 'hotel_adlon',
      },
      {
        id: 'bayerischer_hof',
        title: 'Bayerischer Hof',
        city: 'Munich',
        description:
          'Bayerischer Hof is a legendary Munich hotel that has been operating since 1841 and is still a meeting place for diplomats, artists and the business elite. Most of the interiors are decorated in different styles — from classical to art deco — which creates a museum atmosphere, but with an emphasis on comfort. There is a rooftop bar with panoramic views of the Alps and the old town. The hotel has its own theater, several restaurants, a spa complex and a winter garden. Everything here is built around the idea of luxury without ostentatious pomp — elegant, restrained and typical of Bavaria.',
        coordsText: 'Coordinates: 48.1402, 11.5747',
        lat: 48.1402,
        lng: 11.5747,
        stars: 5,
        imageKey: 'bayerischer_hof',
      },
      {
        id: 'atlantic_hamburg',
        title: 'Atlantic Hotel',
        city: 'Hamburg',
        description:
          'The Atlantic Hotel is a symbol of Hamburg, located on the banks of the Alster. This white building in the neoclassical style has been welcoming travelers, artists and even royal families for over a hundred years. Inside, there are high ceilings, bronze chandeliers, soft tones and a subtle maritime motif that echoes the city’s port history. The rooms are spacious, with large windows through which you can see the water and boats. The restaurant is famous for its seafood dishes and local Hamburg dishes. The atmosphere combines classicism with a light breath of sea breeze - ideal for those who want to feel the character of northern Germany.',
        coordsText: 'Coordinates: 53.5584, 10.0170',
        lat: 53.5584,
        lng: 10.017,
        stars: 4,
        imageKey: 'atlantic_hamburg',
      },
      {
        id: 'hotel_elephant',
        title: 'Hotel Elephant',
        city: 'Weimar',
        description:
          'Hotel Elephant is a historic place where German intellectuals met: Goethe, Schiller, musicians and philosophers of different eras. The hotel has been restored in the style of modernism with Bauhaus accents: geometric shapes, a restrained palette, wood panels and minimalist art objects. Each room has a historical mood, but at the same time looks modern. This is a hotel for those who appreciate atmosphere and cultural context. The terrace overlooks the main square of Weimar, a city with an incredible intellectual heritage.',
        coordsText: 'Coordinates: 50.9815, 11.3294',
        lat: 50.9815,
        lng: 11.3294,
        stars: 4,
        imageKey: 'hotel_elephant',
      },
      {
        id: 'brenners_baden',
        title: 'Brenners Park-Hotel',
        city: 'Baden-Baden',
        description:
          'Located among green alleys, Brenners Park-Hotel is the embodiment of European resort classics. Everything here is aimed at peace and rejuvenation: quiet gardens, romantic balconies, rooms with views and a spa complex, which is considered one of the best in the country. The interiors are made in light colors using natural materials, and the atmosphere is intimate and restrained. The hotel is popular with those looking for harmony, walks along the Oos River and the feeling of old resort Europe.',
        coordsText: 'Coordinates: 48.7605, 8.2415',
        lat: 48.7605,
        lng: 8.2415,
        stars: 5,
        imageKey: 'brenners_baden',
      },
      {
        id: 'the_fontenay',
        title: 'The Fontenay',
        city: 'Hamburg',
        description:
          'The modern hotel The Fontenay impresses with its architecture: rounded shapes, wavy facades and a sense of infinity create a space that seems to float above the Alster Lake. Inside, white color, natural light and minimalist furniture dominate. Here, every element corresponds to the concept of movement and freedom. On the roof there is a restaurant with one of the best panoramic views of the city. The hotel is suitable for those who love modern design, technology and an airy atmosphere.',
        coordsText: 'Coordinates: 53.5655, 10.0003',
        lat: 53.5655,
        lng: 10.0003,
        stars: 5,
        imageKey: 'the_fontenay',
      },
      {
        id: 'mandarin_munich',
        title: 'Mandarin Oriental',
        city: 'Munich',
        description:
          'Mandarin Oriental is a combination of Bavarian charm and Asian precision. A small but extremely elegant hotel located in the heart of Munich. The interiors are a mixture of modern materials and Asian decorative accents. The rooms are quiet, with panoramic windows, and the service is individual and extremely sensitive. On the roof there is a terrace with a view of the city roofs and the Alps in the distance.',
        coordsText: 'Coordinates: 48.1374, 11.5798',
        lat: 48.1374,
        lng: 11.5798,
        stars: 5,
        imageKey: 'mandarin_munich',
      },
      {
        id: 'das_stue',
        title: 'Das Stue',
        city: 'Berlin',
        description:
          'Das Stue is a boutique hotel located in the former Danish embassy near the entrance to Berlin Zoo. The interiors are done in dark, warm tones with lots of wood, textures and artistic accents. Many rooms have panoramic windows overlooking the Tiergarten park and even the animal enclosures, creating a unique experience. The hotel is popular with creative people, young professionals and those looking for an unconventional place with style.',
        coordsText: 'Coordinates: 52.5087, 13.3424',
        lat: 52.5087,
        lng: 13.3424,
        stars: 4,
        imageKey: 'das_stue',
      },
    ],
    []
  );

  const [savedMap, setSavedMap] = useState<Record<string, true>>({});
  const [selected, setSelected] = useState<Place | null>(null);
  const [showTip, setShowTip] = useState(true);

  const appear = useRef(new Animated.Value(0)).current;
  const detailAppear = useRef(new Animated.Value(0)).current;
  const tipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const ids = await loadSavedIDs();
      setSavedMap(ids);
    })();

    appear.setValue(0);
    Animated.timing(appear, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    tipAnim.setValue(0);
    Animated.timing(tipAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear, tipAnim]);

  useEffect(() => {
    detailAppear.setValue(0);
    if (selected) {
      Animated.timing(detailAppear, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [selected, detailAppear]);

  const headerTop = Math.max(insets.top, Platform.OS === 'android' ? 10 : 0);

  const isSaved = (id: string) => !!savedMap[id];

  const toggleSaved = async (p: Place) => {
    setSavedMap((prev) => {
      const next = { ...prev };
      if (next[p.id]) delete next[p.id];
      else next[p.id] = true;
      saveSavedIDs(next);
      return next;
    });
  };

  const onSharePlace = async (p: Place) => {
    try {
      await Share.share({
        message: `${p.title} (${p.city})\n${p.coordsText}\n\n${p.description}`,
      });
    } catch {}
  };

  const onOpenMap = (p: Place) => {
    navigation.navigate('MainTabs', {
      screen: 'IntMap',
      params: {
        category: 'Hotels',
        placeId: p.id,
      },
    });
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.header, { paddingTop: headerTop + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={ICON_BACK} style={styles.backIcon} />
        </Pressable>

        <Text style={styles.headerTitle}>Category: Hotels</Text>

        <View style={{ width: 40 }} />
      </View>

      {showTip && (
        <Animated.View
          style={[
            styles.tip,
            {
              opacity: tipAnim,
              transform: [{ translateY: tipAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
            },
          ]}
        >
          <Text style={styles.tipTitle}>Scroll down:</Text>
          <Text style={styles.tipText}>These hotels are selected for comfort, design and atmosphere.</Text>

          <Pressable onPress={() => setShowTip(false)} style={styles.tipClose}>
            <Text style={styles.tipCloseText}>✕</Text>
          </Pressable>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: appear,
            transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          },
        ]}
      >
        {!selected ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listWrap}>
            {places.map((p) => (
              <View key={p.id} style={styles.card}>
                <Pressable onPress={() => setSelected(p)} style={styles.cardTop}>
                  <Image source={IMAGES[p.imageKey]} style={styles.cardImage} resizeMode="cover" />

                  <Pressable onPress={() => toggleSaved(p)} style={styles.saveMiniBtn}>
                    <Image
                      source={isSaved(p.id) ? ICON_BOOKMARK_FILLED : ICON_BOOKMARK}
                      style={styles.saveMiniIcon}
                      resizeMode="contain"
                    />
                  </Pressable>
                </Pressable>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {p.title} ({p.city})
                  </Text>

                  <StarsRow count={p.stars} />

                  <Pressable onPress={() => setSelected(p)} style={({ pressed }) => [styles.openSmall, pressed && styles.pressed]}>
                    <Text style={styles.openSmallText}>Open</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Animated.View
            style={[
              styles.detailWrap,
              {
                opacity: detailAppear,
                transform: [{ translateY: detailAppear.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
              },
            ]}
          >
            <View style={styles.detailCard}>
              <Pressable onPress={() => setSelected(null)} style={styles.detailBackRow}>
                <Text style={styles.detailBackText}>‹ Back</Text>
              </Pressable>

              <Image source={IMAGES[selected.imageKey]} style={styles.detailImage} resizeMode="cover" />

              <Text style={styles.detailTitle}>
                {selected.title} ({selected.city})
              </Text>
              <StarsRow count={selected.stars} />
              <Text style={styles.coords}>{selected.coordsText}</Text>

              <Text style={styles.detailDesc}>{selected.description}</Text>

              <View style={styles.actionsRow}>
                <Pressable onPress={() => onOpenMap(selected)} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
                  <Image source={ICON_MAP} style={styles.actionIcon} />
                  <Text style={styles.actionText}>Map</Text>
                </Pressable>

                <Pressable onPress={() => onSharePlace(selected)} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
                  <Image source={ICON_SHARE} style={styles.actionIcon} />
                  <Text style={styles.actionText}>Share</Text>
                </Pressable>

                <Pressable onPress={() => toggleSaved(selected)} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
                  <Image
                    source={isSaved(selected.id) ? ICON_BOOKMARK_FILLED : ICON_BOOKMARK}
                    style={styles.actionIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.actionText}>Saved</Text>
                </Pressable>
              </View>

              <Pressable onPress={() => onOpenMap(selected)} style={({ pressed }) => [styles.mapPreviewBox, pressed && styles.pressed]}>
                <Image source={MAP_PREVIEW} style={styles.mapPreview} resizeMode="cover" />
              </Pressable>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  header: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { width: 18, height: 18, tintColor: '#FFD84D' },

  headerTitle: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '800',
    opacity: 0.9,
  },

  tip: {
    marginHorizontal: 18,
    marginTop: 6,
    backgroundColor: 'rgba(0,22,45,0.80)',
    borderRadius: 18,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  tipTitle: { color: '#fff', fontWeight: '900', marginBottom: 6, fontSize: 12.5 },
  tipText: { color: 'rgba(255,255,255,0.78)', fontSize: 11.5, lineHeight: 15 },
  tipClose: {
    position: 'absolute',
    right: 10,
    top: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCloseText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '900' },

  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },

  listWrap: {
    gap: 12,
    paddingBottom: 18,
  },

  card: {
    backgroundColor: 'rgba(0,22,45,0.72)',
    borderRadius: 18,
    overflow: 'hidden',
  },

  cardTop: { height: IS_TINY ? 120 : 140, backgroundColor: 'rgba(255,255,255,0.06)' },
  cardImage: { width: '100%', height: '100%' },

  saveMiniBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveMiniIcon: { width: 18, height: 18 },

  cardInfo: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  cardTitle: { flex: 1, color: '#fff', fontWeight: '900', fontSize: 12.5 },
  stars: { color: '#FFD84D', fontSize: 12, fontWeight: '900' },

  openSmall: {
    backgroundColor: '#FFD84D',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openSmallText: { color: '#111', fontWeight: '900', fontSize: 12 },

  detailWrap: { flex: 1 },

  detailCard: {
    backgroundColor: 'rgba(0,22,45,0.78)',
    borderRadius: 18,
    padding: 14,
    flex: 1,
  },

  detailBackRow: { paddingVertical: 6, paddingHorizontal: 2, marginBottom: 6 },
  detailBackText: { color: '#FFD84D', fontWeight: '900' },

  detailImage: {
    width: '100%',
    height: IS_TINY ? 170 : 190,
    borderRadius: 16,
    marginBottom: 12,
  },

  detailTitle: { color: '#fff', fontWeight: '900', fontSize: 13.5, marginBottom: 6 },

  coords: { color: '#FFD84D', fontWeight: '800', fontSize: 11.5, marginTop: 8, marginBottom: 10 },

  detailDesc: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: IS_TINY ? 11.2 : 11.8,
    lineHeight: IS_TINY ? 15 : 16.5,
    marginBottom: 12,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    justifyContent: 'space-between',
  },

  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionIcon: { width: 16, height: 16 },
  actionText: { color: '#fff', fontWeight: '900', fontSize: 12 },

  mapPreviewBox: {
    borderRadius: 14,
    overflow: 'hidden',
    height: IS_TINY ? 130 : 145,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  mapPreview: { width: '100%', height: '100%' },

  pressed: { transform: [{ scale: 0.98 }] },
});
