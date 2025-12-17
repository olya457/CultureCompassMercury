import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TabsParamList, RootStackParamList } from '../navigation/types';
import { getProfile, UserProfile } from '../storage/profileStorage';

const { height: H } = Dimensions.get('window');
const IS_TINY = H < 690;

const BG = require('../assets/background.png');
const ICON_GEAR = require('../assets/ic_gear.png');
const FACT_GIRL = require('../assets/onboard1.png');
const MAP_PREVIEW = require('../assets/map_preview.png');

type HomeTabNav = BottomTabNavigationProp<TabsParamList, 'Home'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

const FACTS: string[] = [
  'Germans are rarely late - punctuality is perceived as respect.',
  'At work, it is not customary to discuss personal life until you have become close.',
  'In Germany, planning is loved - even a meeting with a friend is written down in the calendar.',
  'The humor of Germans is dry and straightforward.',
  'Plastic and paper are sorted so strictly that fines are the norm.',
  'Saturday and Sunday - "Ruhetag" - making noise is almost forbidden.',
  'On German trains, you can sit next to strangers and no one cares.',
  "Germans are honest in small things - they even leave a note if they scratch someone else's car.",
  'They rarely touch people when communicating - distance is important.',
  'At pedestrian crossings, the sound of clicking is important for the visually impaired - it is constantly checked.',
  'In Germany, excessive emotionality in public places is not welcomed.',
  'Many cafes close early - the evening rhythm is calm.',
  'It is customary for Germans to return bottles - it brings real money (Pfand).',
  'Silence in the entrance is a sacred rule.',
  'At work, clear instructions and roles are important, they do not like improvisation.',
  'All processes like to optimize - Germans are fans of order.',
  'In schools, responsibility is taught from an early age.',
  'In stores, Sunday is a day off, almost everything is closed.',
  'Germans do not interrupt - they listen completely.',
  'Trash cans are placed far apart to stimulate sorting.',
  'During a toast, they always look each other in the eye - this is "Respekt".',
  'Public transport works very stably, but people still grumble about being late.',
  'Education and courses are a constant part of adult life.',
  'In Germany, alcohol in parks is not a problem, as long as everyone is civilized.',
  'Drivers always stop at pedestrian crossings, even if a pedestrian just looks in their direction.',
  'Restaurants often have long waits — rushing is not welcome.',
  'Germans love their city and often brag about local specialties.',
  "If they agree, they will do it. They don't break promises here.",
  'Cash is often used — trust in cards is growing slowly.',
  'In Germany, privacy is taken very seriously — no photos are taken without permission.',
];

function pickRandomFact(prev: string | null) {
  if (FACTS.length <= 1) return FACTS[0] || '';
  let next = FACTS[Math.floor(Math.random() * FACTS.length)];
  if (prev && FACTS.length > 1) {
    let guard = 0;
    while (next === prev && guard < 12) {
      next = FACTS[Math.floor(Math.random() * FACTS.length)];
      guard += 1;
    }
  }
  return next;
}

export default function HomeScreen() {
  const tabNav = useNavigation<HomeTabNav>();
  const rootNav = tabNav.getParent<RootNav>();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [factText, setFactText] = useState<string>(() => pickRandomFact(null));

  const appear = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      let alive = true;

      (async () => {
        const p = await getProfile();
        if (!alive) return;
        setProfile(p);
      })();

      setFactText((prev) => pickRandomFact(prev));

      appear.setValue(0);
      Animated.timing(appear, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      return () => {
        alive = false;
      };
    }, [appear])
  );

  const name = useMemo(() => profile?.name?.trim() || 'Guest', [profile?.name]);

  const onShareFact = async () => {
    try {
      await Share.share({ message: `Daily fact:\n${factText}` });
    } catch {}
  };

  const openCategory = (category: 'Hotels' | 'Parks' | 'Monuments') => {
    if (rootNav) rootNav.navigate('Category', { category });
  };

  const openMap = () => {
    tabNav.navigate('IntMap');
  };

  const openProfile = () => {
    if (rootNav) rootNav.navigate('Profile');
  };

  const topPad = Platform.OS === 'android' ? insets.top + 20 : insets.top;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            {profile?.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarPlus}>+</Text>
            )}
          </View>

          <Text style={styles.hello} numberOfLines={1}>
            Hello, {name}
          </Text>
        </View>

        <Pressable onPress={openProfile} style={styles.gearBtn}>
          <Image source={ICON_GEAR} style={styles.gearIcon} />
        </Pressable>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: appear,
            transform: [
              {
                translateY: appear.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.factCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.factTitle}>Daily facts:</Text>
            <Text style={styles.factText}>{factText}</Text>

            <Pressable onPress={onShareFact} style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}>
              <Text style={styles.shareText}>Share</Text>
            </Pressable>
          </View>

          <Image source={FACT_GIRL} style={styles.factGirl} resizeMode="contain" />
        </View>

        <Text style={styles.sectionTitle}>Choose a category:</Text>

        <View style={styles.categories}>
          {(['Hotels', 'Parks', 'Monuments'] as const).map((c) => (
            <Pressable key={c} onPress={() => openCategory(c)} style={({ pressed }) => [styles.categoryBtn, pressed && styles.pressed]}>
              <Text style={styles.categoryText}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapTitle}>Interactive map:</Text>
              <Text style={styles.mapDesc}>
                Tap on a pin to see details.{"\n"}Save everything you like.
              </Text>
            </View>

            <Pressable onPress={openMap} style={({ pressed }) => [styles.openBtn, pressed && styles.pressed]}>
              <Text style={styles.openText}>Open</Text>
            </Pressable>
          </View>

          <View style={styles.mapPreviewBox}>
            <Image source={MAP_PREVIEW} style={styles.mapPreview} resizeMode="cover" />
          </View>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlus: { color: '#FFD84D', fontSize: 18, fontWeight: '900' },
  hello: { color: '#fff', fontSize: 15, fontWeight: '800' },
  gearBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  gearIcon: { width: 18, height: 18 },
  content: { flex: 1, paddingHorizontal: 18, paddingBottom: 24 },
  factCard: {
    backgroundColor: 'rgba(0,22,45,0.75)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 18,
  },
  factTitle: { color: '#fff', fontWeight: '900', marginBottom: 6 },
  factText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 16, marginBottom: 10 },
  shareBtn: {
    backgroundColor: '#FFD84D',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  shareText: { color: '#111', fontWeight: '900', fontSize: 12 },
  factGirl: { width: IS_TINY ? 86 : 96, height: IS_TINY ? 108 : 120, marginLeft: 8 },
  sectionTitle: { color: '#fff', fontWeight: '900', marginBottom: 10 },
  categories: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  categoryBtn: { backgroundColor: 'rgba(0,22,45,0.7)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  categoryText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  mapCard: { backgroundColor: 'rgba(0,22,45,0.75)', borderRadius: 18, padding: 14 },
  mapHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  mapTitle: { color: '#fff', fontWeight: '900', marginBottom: 4 },
  mapDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 11.5, lineHeight: 15 },
  openBtn: { backgroundColor: '#FFD84D', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 },
  openText: { color: '#111', fontWeight: '900', fontSize: 12 },
  mapPreviewBox: { borderRadius: 14, overflow: 'hidden', height: IS_TINY ? 140 : 155 },
  mapPreview: { width: '100%', height: '100%' },
  pressed: { transform: [{ scale: 0.98 }] },
});