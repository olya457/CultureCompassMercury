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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

import { getSavedPlaces, toggleSavedPlace, type SavedPlace } from '../storage/savedPlaces';

type Props = NativeStackScreenProps<RootStackParamList, 'Category'>;

const { height: H } = Dimensions.get('window');
const IS_TINY = H < 690;
const IS_SMALL = H < 760;

const BG = require('../assets/background.png');
const ICON_BACK = require('../assets/ic_back.png');
const ICON_BOOKMARK = require('../assets/ic_bookmark.png');
const ICON_BOOKMARK_FILLED = require('../assets/ic_bookmark_filled.png');
const ICON_SHARE = require('../assets/ic_share.png');
const ICON_MAP = require('../assets/ic_map.png');

const IMAGES = {
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
};

export type CategoryKey = 'Hotels' | 'Parks' | 'Monuments';

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

function StarsRow({ count }: { count: number }) {
  return <Text style={styles.stars}>{new Array(count).fill('★').join('')}</Text>;
}

function prettyCategory(c: CategoryKey) {
  if (c === 'Hotels') return 'HOTELS';
  if (c === 'Parks') return 'PARKS';
  return 'MONUMENTS';
}

export default function CategoryScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const category = route.params.category as CategoryKey;
  const DATA = useMemo<Record<CategoryKey, Place[]>>(
    () => ({
      Hotels: [
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

      Parks: [
        {
          id: 'englischer_garten',
          title: 'Englischer Garten',
          city: 'Munich',
          description:
            'Englischer Garten is one of the largest city parks in the world, stretching from the center of Munich to the northern districts. It mixes English landscape traditions, wide lawns, streams and artificial lakes. The park is famous for its surfers on the Eisbach River - it is one of the few urban waves in Europe. There is also a traditional "Chinese Tower" with a beer garden, where locals gather. The atmosphere of the park is freedom, activity and constant movement.',
          coordsText: 'Coordinates: 48.1590, 11.6032',
          lat: 48.159,
          lng: 11.6032,
          stars: 5,
          imageKey: 'englischer_garten',
        },
        {
          id: 'tiergarten',
          title: 'Tiergarten',
          city: 'Berlin',
          description:
            'Tiergarten is the green center of Berlin, a place that combines history and modernity. Once it was a hunting ground, and today it is a park for walks, picnics and cyclists. Wide avenues, lakes, bridges and monuments create the feeling of a natural oasis in the metropolis. In different parts of the park there are quiet areas where you can hardly hear the city. Tiergarten is a place where you can feel the real rhythm of Berlin life: peace, freedom and the diversity of people around.',
          coordsText: 'Coordinates: 52.5145, 13.3501',
          lat: 52.5145,
          lng: 13.3501,
          stars: 4,
          imageKey: 'tiergarten',
        },
        {
          id: 'herrenhausen',
          title: 'Herrenhausen Gardens',
          city: 'Hannover',
          description:
            'Herrenhausen is a complex of gardens in the Baroque style, created by the Hanoverian dynasty. Perfect symmetry, fountains, mosaic flower beds and long perspectives of alleys create a feeling of theatricality. This is a place for those who love historical gardens with clear geometry and a royal atmosphere. In the evenings they turn on the lights, and in the summer concerts and performances are held. The main garden, Großer Garten, is a pearl that is definitely worth seeing.',
          coordsText: 'Coordinates: 52.3956, 9.7034',
          lat: 52.3956,
          lng: 9.7034,
          stars: 5,
          imageKey: 'herrenhausen',
        },
        {
          id: 'viktoriapark',
          title: 'Viktoriapark',
          city: 'Berlin',
          description:
            'Viktoriapark is a compact but very diverse park in the Kreuzberg district. It has an artificial waterfall cascading down a cliff, an observation deck overlooking the city center, and quiet walking trails. The park is popular with locals because it combines green spaces with the urban character of Berlin. It is ideal for evening walks, small picnics, and relaxation after a busy day.',
          coordsText: 'Coordinates: 52.4889, 13.3837',
          lat: 52.4889,
          lng: 13.3837,
          stars: 4,
          imageKey: 'viktoriapark',
        },
        {
          id: 'luisenpark',
          title: 'Luisenpark',
          city: 'Mannheim',
          description:
            'Luisenpark is one of the best parks in Germany with lakes, botanical sections, and greenhouses. Here you can go boating, walk along bridges, visit plant pavilions, or watch pelicans and turtles. The park is especially popular with families: many themed areas, playgrounds and interactive spaces. Luisenpark is a place where nature feels as alive as possible.',
          coordsText: 'Coordinates: 49.4756, 8.4933',
          lat: 49.4756,
          lng: 8.4933,
          stars: 5,
          imageKey: 'luisenpark',
        },
        {
          id: 'palmengarten',
          title: 'Palmengarten',
          city: 'Frankfurt',
          description:
            'Palmengarten is a greenhouse park that showcases a variety of plants from around the world. Tropical palms, cacti, aquatic plants, exhibits from climate zones - all this creates a sense of a journey around the planet in one walk. The glass pavilions are made in a modernist style, and the well-groomed garden terraces are ideal for photos. The park is suitable for those who want to experience botanical wealth in the heart of a big city.',
          coordsText: 'Coordinates: 50.1237, 8.6534',
          lat: 50.1237,
          lng: 8.6534,
          stars: 4,
          imageKey: 'palmengarten',
        },
        {
          id: 'zwinger_gardens',
          title: 'Zwinger Gardens',
          city: 'Dresden',
          description:
            'The Zwinger Gardens are part of the famous palace complex of Dresden. It is a combination of Baroque architecture, majestic galleries, park terraces and fountains. The atmosphere here is solemn but cozy, with perfectly manicured lawns and many decorative details. This is a place where historical grandeur and a German approach to beauty are felt.',
          coordsText: 'Coordinates: 51.0530, 13.7314',
          lat: 51.053,
          lng: 13.7314,
          stars: 5,
          imageKey: 'zwinger_gardens',
        },
        {
          id: 'babelsberg',
          title: 'Park Babelsberg',
          city: 'Potsdam',
          description:
            'Babelsberg Park is a romantic landscape park with observation hills, a castle, views of the Havel River and cozy paths in the shade of trees. There are many historical buildings here, including a palace in the neo-Gothic style. The atmosphere is very cinematic: foggy mornings, bright meadows, observation towers and quiet corners. This is one of the most beautiful parks in Potsdam.',
          coordsText: 'Coordinates: 52.3977, 13.0733',
          lat: 52.3977,
          lng: 13.0733,
          stars: 4,
          imageKey: 'babelsberg',
        },
      ],

      Monuments: [
        {
          id: 'brandenburg_gate',
          title: 'Brandenburger Tor',
          city: 'Berlin',
          description:
            'The Brandenburg Gate is one of the main symbols not only of Berlin, but of all of Germany. It was built in the 18th century as a triumphal arch, and later became a symbol of the country’s division and reunification. Today it is a place of meetings, protests, celebrations and moments of historical importance. The architecture is striking in its monumentality and harmonious proportions. The gate looks especially beautiful in the evening, when the backlight makes it golden.',
          coordsText: 'Coordinates: 52.5163, 13.3777',
          lat: 52.5163,
          lng: 13.3777,
          stars: 5,
          imageKey: 'brandenburg_gate',
        },
        {
          id: 'neuschwanstein',
          title: 'Neuschwanstein Castle',
          city: 'Bavaria',
          description:
            'Neuschwanstein Castle is perhaps the most famous castle in Germany and one of the most beautiful in the world. Designed by King Ludwig II, it looks like a fantasy that has come to life among the mountains. Steep towers, snow-white walls, landscapes of the Alps around - everything here seems to be from a fairy tale. Inside, decorative halls, frescoes and details in the style of Romanticism have been preserved. This is a place that exceeds the expectations of even those who have seen many photos.',
          coordsText: 'Coordinates: 47.5576, 10.7498',
          lat: 47.5576,
          lng: 10.7498,
          stars: 5,
          imageKey: 'neuschwanstein',
        },
        {
          id: 'cologne_cathedral',
          title: 'Cologne Cathedral',
          city: 'Cologne',
          description:
            'Cologne Cathedral is a Gothic masterpiece, the construction of which lasted more than 600 years. The height of the spires is 157 meters, which makes it one of the tallest churches in Europe. Inside are huge stained glass windows, a treasury and relics of the three wise men. The cathedral survived the war, bombing and became a symbol of Cologne’s resilience. This is a place where scale and spirituality are physically felt.',
          coordsText: 'Coordinates: 50.9413, 6.9580',
          lat: 50.9413,
          lng: 6.958,
          stars: 5,
          imageKey: 'cologne_cathedral',
        },
        {
          id: 'reichstag',
          title: 'Reichstag',
          city: 'Berlin',
          description:
            'The Reichstag is the heart of German politics, a building with a transparent dome, symbolizing the openness of power. Architect Norman Foster harmoniously combined historical walls with modern technology. The dome is accessible to visitors: here you can walk along the spiral platforms, observing the city. This is one of the places where modern Berlin is felt to the fullest.',
          coordsText: 'Coordinates: 52.5186, 13.3762',
          lat: 52.5186,
          lng: 13.3762,
          stars: 4,
          imageKey: 'reichstag',
        },
        {
          id: 'frauenkirche',
          title: 'Dresden Frauenkirche',
          city: 'Dresden',
          description:
            'Frauenkirche is a church that has become a symbol of the Renaissance. Destroyed during World War II, it was restored stone by stone thanks to archival drawings and the work of craftsmen. Inside, there is a bright interior, a wealth of Baroque forms and a quiet atmosphere. The observation deck offers an incredible view of the old city of Dresden.',
          coordsText: 'Coordinates: 51.0510, 13.7410',
          lat: 51.051,
          lng: 13.741,
          stars: 5,
          imageKey: 'frauenkirche',
        },
        {
          id: 'heidelberg_castle',
          title: 'Heidelberg Castle',
          city: 'Heidelberg',
          description:
            'Heidelberg Castle is a romantic ruin on a hill above one of the most beautiful student cities in Germany. The mix of Gothic and Renaissance, the red stone of the walls, and the panoramas of the Neckar Valley create a unique atmosphere of melancholy and grandeur. This is a place that photographers adore for its dramatic light and shadow.',
          coordsText: 'Coordinates: 49.4106, 8.7153',
          lat: 49.4106,
          lng: 8.7153,
          stars: 4,
          imageKey: 'heidelberg_castle',
        },
        {
          id: 'porta_nigra',
          title: 'Porta Nigra',
          city: 'Trier',
          description:
            'Porta Nigra is an ancient Roman gate, the best preserved north of the Alps. The massive stones, the black shade of the facade, and a history of almost 1,800 years make it a unique archaeological site. Here you can climb inside, walk along the old stairs, and feel the atmosphere of the ancient city.',
          coordsText: 'Coordinates: 49.7595, 6.6431',
          lat: 49.7595,
          lng: 6.6431,
          stars: 4,
          imageKey: 'porta_nigra',
        },
        {
          id: 'museum_island',
          title: 'Museum Island',
          city: 'Berlin',
          description:
            'Museum Island is a complex of five museums included in the UNESCO list. Here are kept masterpieces of antiquity, the Middle Ages and world art: the bust of Nefertiti, the Pergamon Altar, halls with collections of Europe and the Middle East. The architecture of the island combines different eras, but looks like a single ensemble. This is a place where you can spend a whole day and still feel that you have seen only a part.',
          coordsText: 'Coordinates: 52.5207, 13.3994',
          lat: 52.5207,
          lng: 13.3994,
          stars: 5,
          imageKey: 'museum_island',
        },
      ],
    }),
    []
  );

  const places = DATA[category];
  const [savedMap, setSavedMap] = useState<Record<string, true>>({});
  const [selected, setSelected] = useState<Place | null>(null);

  const headerA = useRef(new Animated.Value(0)).current;
  const listA = useRef(new Animated.Value(0)).current;
  const detailA = useRef(new Animated.Value(0)).current;

  const runIn = (v: Animated.Value, delay = 0) => {
    v.setValue(0);
    Animated.timing(v, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      const list = await getSavedPlaces();
      if (!alive) return;

      const m: Record<string, true> = {};
      list.forEach((p) => (m[p.id] = true));
      setSavedMap(m);
    })();

    runIn(headerA, 0);
    runIn(listA, 60);

    return () => {
      alive = false;
    };
  }, [headerA, listA]);

  useEffect(() => {
    if (selected) runIn(detailA, 0);
  }, [selected, detailA]);

  const isSaved = (id: string) => !!savedMap[id];

  const toSavedPlace = (p: Place): SavedPlace => ({
    id: p.id,
    category,
    title: p.title,
    city: p.city,
    description: p.description,
    coordsText: p.coordsText,
    lat: p.lat,
    lng: p.lng,
    stars: p.stars,
    imageKey: p.imageKey,
  });

  const toggleSaved = async (p: Place) => {
    const next = await toggleSavedPlace(toSavedPlace(p));
    const m: Record<string, true> = {};
    next.forEach((x) => (m[x.id] = true));
    setSavedMap(m);
  };

  const onShare = async (p: Place) => {
    try {
      await Share.share({
        message: `${p.title} (${p.city})\n${p.coordsText}\n\n${p.description}`,
      });
    } catch {}
  };

  const headerTop = Platform.OS === 'android' ? insets.top + 20 : insets.top;

  const onBackPress = () => {
    if (selected) {
      setSelected(null);
      return;
    }
    navigation.goBack();
  };

  const openOnIntMap = () => {
    if (!selected) return;

    navigation.navigate('MainTabs', {
      screen: 'IntMap',
      params: { category, placeId: selected.id },
    });
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <Animated.View
        style={[
          styles.header,
          { paddingTop: headerTop + 8 },
          {
            opacity: headerA,
            transform: [{ translateY: headerA.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
          },
        ]}
      >
        <Pressable onPress={onBackPress} style={styles.backBtn} hitSlop={10}>
          <Image source={ICON_BACK} style={styles.backIcon} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerBig}>{prettyCategory(category)}</Text>
        </View>

        <View style={{ width: 40 }} />
      </Animated.View>

      <View style={styles.content}>
        {!selected ? (
          <Animated.View
            style={[
              { flex: 1 },
              {
                opacity: listA,
                transform: [{ translateY: listA.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
              },
            ]}
          >
            <ScrollView contentContainerStyle={styles.listWrap} showsVerticalScrollIndicator={false}>
              {places.map((p) => (
                <View key={p.id} style={styles.card}>
                  <Pressable onPress={() => setSelected(p)} style={styles.cardTop}>
                    <Image source={IMAGES[p.imageKey]} style={styles.cardImage} resizeMode="cover" />

                    <Pressable onPress={() => toggleSaved(p)} style={styles.saveMiniBtn} hitSlop={10}>
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

                    <Pressable
                      onPress={() => setSelected(p)}
                      style={({ pressed }) => [styles.openSmall, pressed && styles.pressed]}
                    >
                      <Text style={styles.openSmallText}>Open</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
              <View style={{ height: 18 }} />
            </ScrollView>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.detailWrap,
              {
                opacity: detailA,
                transform: [{ translateY: detailA.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
              },
            ]}
          >
            <ScrollView contentContainerStyle={{ paddingBottom: 14 }} showsVerticalScrollIndicator={false}>
              <View style={styles.detailCard}>
                <Image source={IMAGES[selected.imageKey]} style={styles.detailImage} resizeMode="cover" />

                <Text style={styles.detailTitle}>
                  {selected.title} ({selected.city})
                </Text>

                <StarsRow count={selected.stars} />
                <Text style={styles.coords}>{selected.coordsText}</Text>
                <Text style={styles.detailDesc}>{selected.description}</Text>

                <View style={styles.actionsRow}>
                  <Pressable onPress={openOnIntMap} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
                    <Image source={ICON_MAP} style={styles.actionIcon} />
                    <Text style={styles.actionText}>Map</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onShare(selected)}
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                  >
                    <Image source={ICON_SHARE} style={styles.actionIcon} />
                    <Text style={styles.actionText}>Share</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => toggleSaved(selected)}
                    style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                  >
                    <Image
                      source={isSaved(selected.id) ? ICON_BOOKMARK_FILLED : ICON_BOOKMARK}
                      style={styles.actionIcon}
                    />
                    <Text style={styles.actionText}>Saved</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </ImageBackground>
  );
}

const CARD_RADIUS = 18;

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: 18, height: 18, tintColor: '#FFD84D' },
  headerCenter: { alignItems: 'center' },
  headerBig: {
    color: '#fff',
    fontSize: IS_TINY ? 18 : 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  content: { flex: 1, paddingHorizontal: IS_TINY ? 14 : 18, paddingTop: 6, paddingBottom: 14 },
  listWrap: { gap: 12, paddingBottom: 12 },
  card: { backgroundColor: 'rgba(0,22,45,0.72)', borderRadius: CARD_RADIUS, overflow: 'hidden' },
  cardTop: { height: IS_TINY ? 118 : 140, backgroundColor: 'rgba(255,255,255,0.06)' },
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
  cardInfo: { padding: IS_TINY ? 10 : 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { flex: 1, color: '#fff', fontWeight: '900', fontSize: IS_TINY ? 12 : 12.5 },
  stars: { color: '#FFD84D', fontSize: 12, fontWeight: '900' },
  openSmall: {
    backgroundColor: '#FFD84D',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: IS_TINY ? 8 : 9,
    minWidth: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openSmallText: { color: '#111', fontWeight: '900', fontSize: 12 },
  detailWrap: { flex: 1 },
  detailCard: {
    backgroundColor: 'rgba(0,22,45,0.78)',
    borderRadius: CARD_RADIUS,
    padding: IS_TINY ? 12 : 14,
  },
  detailImage: {
    width: '100%',
    height: IS_TINY ? 160 : IS_SMALL ? 175 : 190,
    borderRadius: 16,
    marginBottom: 12,
  },
  detailTitle: { color: '#fff', fontWeight: '900', fontSize: IS_TINY ? 13 : 14.2, marginBottom: 6 },
  coords: { color: '#FFD84D', fontWeight: '800', fontSize: IS_TINY ? 11 : 11.5, marginTop: 8, marginBottom: 10 },
  detailDesc: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: IS_TINY ? 11.0 : 11.8,
    lineHeight: IS_TINY ? 15 : 16.6,
    marginBottom: 12,
  },
  actionsRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 14,
    paddingVertical: IS_TINY ? 9 : 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionIcon: { width: 16, height: 16 },
  actionText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  pressed: { transform: [{ scale: 0.98 }] },
});