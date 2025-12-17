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
  Platform,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { getSavedPlaces, toggleSavedPlace, type SavedPlace } from '../storage/savedPlaces';

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 690;

const CARD_W = Math.min(360, W - 36);
const CARD_H = Math.min(560, H * (IS_TINY ? 0.70 : 0.72));

const BG = require('../assets/background.png');
const ICON_BOOKMARK = require('../assets/ic_bookmark.png');
const ICON_BOOKMARK_FILLED = require('../assets/ic_bookmark_filled.png');
const ICON_SHARE = require('../assets/ic_share.png');

export const IMAGES = {
  hotel_adlon: require('../assets/hotel_adlon.png'),
  bayerischer_hof: require('../assets/bayerischer_hof.png'),
  atlantic_hamburg: require('../assets/atlantic_hamburg.png'),
  hotel_elephant: require('../assets/hotel_elephant.png'),
  brenners_baden: require('../assets/brenners_baden.png'),
  the_fontenay: require('../assets/the_fontenay.png'),
  mandarin_munich: require('../assets/mandarin_munich.png'),
  das_stue: require('../assets/das_stue.png'),

  englischer_garten: require('../assets/park_englischer_garten.png'),
  tiergarten: require('../assets/park_tiergarten.png'),
  herrenhausen: require('../assets/park_herrenhausen.png'),
  viktoriapark: require('../assets/park_viktoriapark.png'),
  luisenpark: require('../assets/park_luisenpark.png'),
  palmengarten: require('../assets/park_palmengarten.png'),
  zwinger_gardens: require('../assets/park_zwinger_gardens.png'),
  babelsberg: require('../assets/park_babelsberg.png'),

  brandenburg_gate: require('../assets/mon_brandenburg_gate.png'),
  neuschwanstein: require('../assets/mon_neuschwanstein.png'),
  cologne_cathedral: require('../assets/mon_cologne_cathedral.png'),
  reichstag: require('../assets/mon_reichstag.png'),
  frauenkirche: require('../assets/mon_frauenkirche.png'),
  heidelberg_castle: require('../assets/mon_heidelberg_castle.png'),
  porta_nigra: require('../assets/mon_porta_nigra.png'),
  museum_island: require('../assets/mon_museum_island.png'),
} as const;

export type CategoryKey = 'Hotels' | 'Parks' | 'Monuments';

export type MapPlace = {
  id: string;
  category: CategoryKey;
  title: string;
  city: string;
  coordsText: string;
  lat: number;
  lng: number;
  stars: 4 | 5;
  description: string;
  imageKey: keyof typeof IMAGES;
};

type IntMapRouteParams = {
  category?: CategoryKey;
  placeId?: string;
} | undefined;

const GREY_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#d9d9d9' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b6b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f2f2f2' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#c7c7c7' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#bdbdbd' }] },
];

function StarsRow({ count }: { count: number }) {
  return <Text style={styles.stars}>{new Array(count).fill('★').join('')}</Text>;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function makeFallbackRegion(): Region {
  return { latitude: 51.1657, longitude: 10.4515, latitudeDelta: 8.5, longitudeDelta: 8.5 };
}

export const ALL_PLACES: MapPlace[] = [
  {
    id: 'hotel_adlon',
    category: 'Hotels',
    title: 'Hotel Adlon Kempinski',
    city: 'Berlin',
    coordsText: 'Coordinates: 52.5163, 13.3777',
    lat: 52.5163,
    lng: 13.3777,
    stars: 5,
    imageKey: 'hotel_adlon',
    description: 'Prestigious hotel next to Brandenburg Gate with classic elegance, top service and iconic Berlin atmosphere.',
  },
  {
    id: 'bayerischer_hof',
    category: 'Hotels',
    title: 'Bayerischer Hof',
    city: 'Munich',
    coordsText: 'Coordinates: 48.1402, 11.5747',
    lat: 48.1402,
    lng: 11.5747,
    stars: 5,
    imageKey: 'bayerischer_hof',
    description: 'Legendary Munich hotel known for elegance, service and a classic atmosphere.',
  },
  {
    id: 'atlantic_hamburg',
    category: 'Hotels',
    title: 'Atlantic Hotel',
    city: 'Hamburg',
    coordsText: 'Coordinates: 53.5584, 10.0170',
    lat: 53.5584,
    lng: 10.0170,
    stars: 4,
    imageKey: 'atlantic_hamburg',
    description: 'Classic northern-style stay near the water with spacious rooms and calm atmosphere.',
  },
  {
    id: 'hotel_elephant',
    category: 'Hotels',
    title: 'Hotel Elephant',
    city: 'Weimar',
    coordsText: 'Coordinates: 50.9815, 11.3294',
    lat: 50.9815,
    lng: 11.3294,
    stars: 4,
    imageKey: 'hotel_elephant',
    description: 'Historic hotel with cultural mood and elegant modern interiors.',
  },
  {
    id: 'brenners_baden',
    category: 'Hotels',
    title: 'Brenners Park-Hotel',
    city: 'Baden-Baden',
    coordsText: 'Coordinates: 48.7605, 8.2415',
    lat: 48.7605,
    lng: 8.2415,
    stars: 5,
    imageKey: 'brenners_baden',
    description: 'European resort classic with gardens, spa focus and quiet luxury.',
  },
  {
    id: 'the_fontenay',
    category: 'Hotels',
    title: 'The Fontenay',
    city: 'Hamburg',
    coordsText: 'Coordinates: 53.5655, 10.0003',
    lat: 53.5655,
    lng: 10.0003,
    stars: 5,
    imageKey: 'the_fontenay',
    description: 'Modern architecture near the lake with panoramic rooftop views.',
  },
  {
    id: 'mandarin_munich',
    category: 'Hotels',
    title: 'Mandarin Oriental',
    city: 'Munich',
    coordsText: 'Coordinates: 48.1374, 11.5798',
    lat: 48.1374,
    lng: 11.5798,
    stars: 5,
    imageKey: 'mandarin_munich',
    description: 'Bavarian charm with refined service and a rooftop terrace with city views.',
  },
  {
    id: 'das_stue',
    category: 'Hotels',
    title: 'Das Stue',
    city: 'Berlin',
    coordsText: 'Coordinates: 52.5087, 13.3424',
    lat: 52.5087,
    lng: 13.3424,
    stars: 4,
    imageKey: 'das_stue',
    description: 'Boutique hotel in the former Danish embassy near the Zoo, warm interiors and a creative Berlin vibe.',
  },
  {
    id: 'englischer_garten',
    category: 'Parks',
    title: 'Englischer Garten',
    city: 'Munich',
    coordsText: 'Coordinates: 48.1590, 11.6032',
    lat: 48.1590,
    lng: 11.6032,
    stars: 5,
    imageKey: 'englischer_garten',
    description: 'One of the world’s largest urban parks with streams, lawns and iconic local spots.',
  },
  {
    id: 'tiergarten',
    category: 'Parks',
    title: 'Tiergarten',
    city: 'Berlin',
    coordsText: 'Coordinates: 52.5145, 13.3501',
    lat: 52.5145,
    lng: 13.3501,
    stars: 4,
    imageKey: 'tiergarten',
    description: 'Berlin’s green heart: wide avenues, lakes and quiet corners where city noise fades away.',
  },
  {
    id: 'herrenhausen',
    category: 'Parks',
    title: 'Herrenhausen Gardens',
    city: 'Hannover',
    coordsText: 'Coordinates: 52.3956, 9.7034',
    lat: 52.3956,
    lng: 9.7034,
    stars: 5,
    imageKey: 'herrenhausen',
    description: 'Royal baroque gardens with symmetry, fountains and long alleys.',
  },
  {
    id: 'viktoriapark',
    category: 'Parks',
    title: 'Viktoriapark',
    city: 'Berlin',
    coordsText: 'Coordinates: 52.4889, 13.3837',
    lat: 52.4889,
    lng: 13.3837,
    stars: 4,
    imageKey: 'viktoriapark',
    description: 'Compact park with a waterfall, viewpoints and calm walking paths.',
  },
  {
    id: 'luisenpark',
    category: 'Parks',
    title: 'Luisenpark',
    city: 'Mannheim',
    coordsText: 'Coordinates: 49.4756, 8.4933',
    lat: 49.4756,
    lng: 8.4933,
    stars: 5,
    imageKey: 'luisenpark',
    description: 'Lakes, botanic sections and a lively nature vibe—great for families.',
  },
  {
    id: 'palmengarten',
    category: 'Parks',
    title: 'Palmengarten',
    city: 'Frankfurt',
    coordsText: 'Coordinates: 50.1237, 8.6534',
    lat: 50.1237,
    lng: 8.6534,
    stars: 4,
    imageKey: 'palmengarten',
    description: 'Greenhouse park with plants from around the world and photo-friendly terraces.',
  },
  {
    id: 'zwinger_gardens',
    category: 'Parks',
    title: 'Zwinger Gardens',
    city: 'Dresden',
    coordsText: 'Coordinates: 51.0530, 13.7314',
    lat: 51.0530,
    lng: 13.7314,
    stars: 5,
    imageKey: 'zwinger_gardens',
    description: 'Baroque palace garden ensemble with terraces, fountains and grand galleries.',
  },
  {
    id: 'babelsberg',
    category: 'Parks',
    title: 'Park Babelsberg',
    city: 'Potsdam',
    coordsText: 'Coordinates: 52.3977, 13.0733',
    lat: 52.3977,
    lng: 13.0733,
    stars: 4,
    imageKey: 'babelsberg',
    description: 'Romantic landscape park with castle views and cozy paths near the river.',
  },
  {
    id: 'brandenburg_gate',
    category: 'Monuments',
    title: 'Brandenburger Tor',
    city: 'Berlin',
    coordsText: 'Coordinates: 52.5163, 13.3777',
    lat: 52.5163,
    lng: 13.3777,
    stars: 5,
    imageKey: 'brandenburg_gate',
    description: 'One of Germany’s key symbols—especially beautiful in the evening lighting.',
  },
  {
    id: 'neuschwanstein',
    category: 'Monuments',
    title: 'Neuschwanstein Castle',
    city: 'Bavaria',
    coordsText: 'Coordinates: 47.5576, 10.7498',
    lat: 47.5576,
    lng: 10.7498,
    stars: 5,
    imageKey: 'neuschwanstein',
    description: 'A fairytale landmark in the mountains with dramatic scenery.',
  },
  {
    id: 'cologne_cathedral',
    category: 'Monuments',
    title: 'Cologne Cathedral',
    city: 'Cologne',
    coordsText: 'Coordinates: 50.9413, 6.9580',
    lat: 50.9413,
    lng: 6.9580,
    stars: 5,
    imageKey: 'cologne_cathedral',
    description: 'Gothic masterpiece and unforgettable city icon.',
  },
  {
    id: 'reichstag',
    category: 'Monuments',
    title: 'Reichstag',
    city: 'Berlin',
    coordsText: 'Coordinates: 52.5186, 13.3762',
    lat: 52.5186,
    lng: 13.3762,
    stars: 4,
    imageKey: 'reichstag',
    description: 'Landmark with a transparent dome and panoramic city views.',
  },
  {
    id: 'frauenkirche',
    category: 'Monuments',
    title: 'Dresden Frauenkirche',
    city: 'Dresden',
    coordsText: 'Coordinates: 51.0510, 13.7410',
    lat: 51.0510,
    lng: 13.7410,
    stars: 5,
    imageKey: 'frauenkirche',
    description: 'Carefully restored symbol with bright interior and city views.',
  },
  {
    id: 'heidelberg_castle',
    category: 'Monuments',
    title: 'Heidelberg Castle',
    city: 'Heidelberg',
    coordsText: 'Coordinates: 49.4106, 8.7153',
    lat: 49.4106,
    lng: 8.7153,
    stars: 4,
    imageKey: 'heidelberg_castle',
    description: 'Romantic ruins on a hill with a classic panorama over the valley.',
  },
  {
    id: 'porta_nigra',
    category: 'Monuments',
    title: 'Porta Nigra',
    city: 'Trier',
    coordsText: 'Coordinates: 49.7595, 6.6431',
    lat: 49.7595,
    lng: 6.6431,
    stars: 4,
    imageKey: 'porta_nigra',
    description: 'Ancient Roman gate with a strong historical atmosphere.',
  },
  {
    id: 'museum_island',
    category: 'Monuments',
    title: 'Museum Island',
    city: 'Berlin',
    coordsText: 'Coordinates: 52.5207, 13.3994',
    lat: 52.5207,
    lng: 13.3994,
    stars: 5,
    imageKey: 'museum_island',
    description: 'UNESCO ensemble of museums with world-class collections.',
  },
];

export default function IntMapScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params as IntMapRouteParams) ?? undefined;

  const insets = useSafeAreaInsets();
  const safeTop = Platform.OS === 'android' ? insets.top + 20 : insets.top;

  const mapRef = useRef<MapView | null>(null);
  const lockFitRef = useRef(false);

  const [category, setCategory] = useState<CategoryKey>('Hotels');
  const [savedMap, setSavedMap] = useState<Record<string, true>>({});
  const [selected, setSelected] = useState<MapPlace | null>(null);
  const [regionState, setRegionState] = useState<Region>(makeFallbackRegion());

  const appear = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const tabAnim = useRef(new Animated.Value(0)).current;

  const places = useMemo(() => ALL_PLACES.filter((p) => p.category === category), [category]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await getSavedPlaces();
      if (!alive) return;
      const m: Record<string, true> = {};
      list.forEach((p) => (m[p.id] = true));
      setSavedMap(m);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    appear.setValue(0);
    Animated.timing(appear, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear]);

  useEffect(() => {
    tabAnim.setValue(0);
    Animated.timing(tabAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [category, tabAnim]);

  useEffect(() => {
    cardAnim.setValue(0);
    if (selected) {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [selected, cardAnim]);

  useEffect(() => {
    if (lockFitRef.current) {
      lockFitRef.current = false;
      return;
    }
    setSelected(null);
    requestAnimationFrame(() => {
      if (!places.length) return;
      const coords = places.map((p) => ({ latitude: p.lat, longitude: p.lng }));
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 70, right: 70, bottom: 110, left: 70 },
        animated: true,
      });
    });
  }, [category, places]);

  const isSaved = (id: string) => !!savedMap[id];

  const toSavedPlace = (p: MapPlace): SavedPlace => ({
    id: p.id,
    category: p.category,
    title: p.title,
    city: p.city,
    description: p.description,
    coordsText: p.coordsText,
    lat: p.lat,
    lng: p.lng,
    stars: p.stars,
    imageKey: p.imageKey,
  });

  const toggleSaved = async (p: MapPlace) => {
    const next = await toggleSavedPlace(toSavedPlace(p));
    const m: Record<string, true> = {};
    next.forEach((x) => (m[x.id] = true));
    setSavedMap(m);
  };

  const onShare = async () => {
    if (!selected) return;
    try {
      await Share.share({
        message: `${selected.title} (${selected.city})\n${selected.coordsText}\n\n${selected.description}`,
      });
    } catch {}
  };

  const onOpenCategory = () => {
    if (!selected) return;
    navigation.navigate('Category', { category: selected.category });
  };

  const onSelectCategory = (c: CategoryKey) => {
    if (c === category) return;
    setCategory(c);
  };

  const onCenterToCategory = () => {
    if (!places.length) return;
    const coords = places.map((p) => ({ latitude: p.lat, longitude: p.lng }));
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 70, right: 70, bottom: selected ? 240 : 110, left: 70 },
      animated: true,
    });
  };

  const zoomBy = (factor: number) => {
    const r = regionState;
    const next: Region = {
      ...r,
      latitudeDelta: clamp(r.latitudeDelta * factor, 0.002, 60),
      longitudeDelta: clamp(r.longitudeDelta * factor, 0.002, 60),
    };
    setRegionState(next);
    mapRef.current?.animateToRegion(next, 220);
  };

  useFocusEffect(
    React.useCallback(() => {
      const incomingCat = params?.category;
      const incomingId = params?.placeId;
      if (!incomingCat && !incomingId) return;
      const found = incomingId ? ALL_PLACES.find((p) => p.id === incomingId) : undefined;
      const targetCategory: CategoryKey | undefined = incomingCat ?? found?.category;
      if (targetCategory && targetCategory !== category) {
        lockFitRef.current = true;
        setCategory(targetCategory);
        return;
      }
      if (found) {
        lockFitRef.current = true;
        setSelected(found);
        const r: Region = {
          latitude: found.lat,
          longitude: found.lng,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        };
        setRegionState(r);
        requestAnimationFrame(() => {
          mapRef.current?.animateToRegion(r, 260);
        });
      }
      navigation.setParams?.({ category: undefined, placeId: undefined });
    }, [params?.category, params?.placeId, category, navigation])
  );

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.topWrap, { paddingTop: safeTop + 12 }]}>
        <Text style={styles.topTitle}>Interactive map</Text>
        <Animated.View
          style={[
            styles.tabsRow,
            {
              opacity: tabAnim,
              transform: [{ translateY: tabAnim.interpolate({ inputRange: [0, 1], outputRange: [-4, 0] }) }],
            },
          ]}
        >
          <TabButton label="HOTELS" active={category === 'Hotels'} onPress={() => onSelectCategory('Hotels')} />
          <TabButton label="PARKS" active={category === 'Parks'} onPress={() => onSelectCategory('Parks')} />
          <TabButton label="MONUMENTS" active={category === 'Monuments'} onPress={() => onSelectCategory('Monuments')} />
        </Animated.View>
      </View>
      <Animated.View
        style={[
          styles.centerWrap,
          {
            opacity: appear,
            transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          },
        ]}
      >
        <View style={[styles.mapCard, { width: CARD_W, height: CARD_H }]}>
          <View style={styles.mapInner}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={regionState}
              customMapStyle={GREY_MAP_STYLE as any}
              rotateEnabled={false}
              pitchEnabled={false}
              toolbarEnabled={false}
              showsCompass={false}
              onRegionChangeComplete={(r) => setRegionState(r)}
            >
              {places.map((p) => (
                <Marker
                  key={p.id}
                  coordinate={{ latitude: p.lat, longitude: p.lng }}
                  pinColor={p.id === selected?.id ? '#111111' : '#FFD84D'}
                  onPress={() => setSelected(p)}
                />
              ))}
            </MapView>
            <View style={styles.controls}>
              <Pressable onPress={() => zoomBy(0.7)} style={({ pressed }) => [styles.ctrlBtn, pressed && styles.pressed]}>
                <Text style={styles.ctrlText}>＋</Text>
              </Pressable>
              <Pressable onPress={() => zoomBy(1.4)} style={({ pressed }) => [styles.ctrlBtn, pressed && styles.pressed]}>
                <Text style={styles.ctrlText}>－</Text>
              </Pressable>
              <Pressable onPress={onCenterToCategory} style={({ pressed }) => [styles.ctrlBtn, pressed && styles.pressed]}>
                <Text style={styles.ctrlText}>◎</Text>
              </Pressable>
            </View>
            {selected && (
              <Animated.View
                style={[
                  styles.bottomCard,
                  {
                    opacity: cardAnim,
                    transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
                  },
                ]}
              >
                <Pressable onPress={() => setSelected(null)} style={styles.cardClose} hitSlop={10}>
                  <Text style={styles.cardCloseText}>×</Text>
                </Pressable>
                <View style={styles.cardRowTop}>
                  <Image source={IMAGES[selected.imageKey]} style={styles.cardImg} resizeMode="cover" />
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {selected.title} ({selected.city})
                    </Text>
                    <StarsRow count={selected.stars} />
                  </View>
                  <View style={styles.rightActions}>
                    <Pressable onPress={onOpenCategory} style={({ pressed }) => [styles.openSquare, pressed && styles.pressed]}>
                      <Text style={styles.openSquareText}>↗</Text>
                    </Pressable>
                    <Pressable onPress={() => toggleSaved(selected)} style={({ pressed }) => [styles.saveMini, pressed && styles.pressed]}>
                      <Image
                        source={isSaved(selected.id) ? ICON_BOOKMARK_FILLED : ICON_BOOKMARK}
                        style={styles.saveMiniIcon}
                        resizeMode="contain"
                      />
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.cardCoords}>{selected.coordsText}</Text>
                <Pressable onPress={onShare} style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}>
                  <Image source={ICON_SHARE} style={styles.shareIcon} />
                  <Text style={styles.shareText}>Share</Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tabBtn, active && styles.tabBtnActive, pressed && styles.pressed]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  topWrap: { alignItems: 'center', paddingHorizontal: 18 },
  topTitle: { color: '#fff', fontWeight: '900', fontSize: 16, opacity: 0.92 },
  tabsRow: {
    marginTop: 6,
    width: CARD_W,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  tabBtn: {
    flex: 1,
    height: IS_TINY ? 34 : 36,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFD84D',
    borderColor: 'rgba(0,0,0,0.18)',
  },
  tabText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: IS_TINY ? 11 : 11.5,
    letterSpacing: 0.2,
  },
  tabTextActive: { color: '#111' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 14 },
  mapCard: {
    backgroundColor: 'rgba(0,22,45,0.75)',
    borderRadius: 18,
    padding: 14,
  },
  mapInner: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  map: { width: '100%', height: '100%' },
  controls: {
    position: 'absolute',
    right: 12,
    top: 12,
    gap: 8,
  },
  ctrlBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(0,22,45,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlText: {
    color: '#FFD84D',
    fontWeight: '900',
    fontSize: 18,
    lineHeight: 20,
  },
  bottomCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(0,22,45,0.92)',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardClose: { position: 'absolute', right: 10, top: 6, zIndex: 2 },
  cardCloseText: { color: '#FFD84D', fontWeight: '900', fontSize: 18 },
  cardRowTop: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 30 },
  cardImg: { width: 110, height: 56, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)' },
  cardMeta: { flex: 1 },
  cardTitle: { color: '#fff', fontWeight: '900', fontSize: 11.5 },
  stars: { color: '#FFD84D', fontSize: 12, fontWeight: '900', marginTop: 4 },
  rightActions: { alignItems: 'center', gap: 8 },
  openSquare: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFD84D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openSquareText: {
    color: '#111',
    fontWeight: '900',
    fontSize: 16,
    lineHeight: 18,
    marginTop: -1,
  },
  saveMini: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveMiniIcon: { width: 16, height: 16 },
  cardCoords: { color: '#FFD84D', fontWeight: '900', fontSize: 10.5, marginTop: 8, marginBottom: 10 },
  shareBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  shareIcon: { width: 14, height: 14 },
  shareText: { color: '#fff', fontWeight: '900', fontSize: 11.5 },
  pressed: { transform: [{ scale: 0.98 }] },
});