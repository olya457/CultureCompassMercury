import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

import { launchImageLibrary } from 'react-native-image-picker';
import { getProfile, saveProfile } from '../storage/profileStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration1'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 750;
const IS_TINY = H < 690;

const BG = require('../assets/background.png');
const LOGO = require('../assets/logo.png');

export default function Registration1Screen({ navigation }: Props) {
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const appearOpacity = useRef(new Animated.Value(0)).current;
  const appearY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(appearOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(appearY, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [appearOpacity, appearY]);

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      if (p) {
        setName(p.name ?? '');
        setAbout(p.about ?? '');
        setPhotoUri(p.photoUri);
      }
    })();
  }, []);

  const avatarSize = useMemo(() => (IS_TINY ? 70 : IS_SMALL ? 80 : 92), []);

  const pickPhoto = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.9,
    });

    if (res.didCancel) return;

    const asset = res.assets?.[0];
    if (!asset?.uri) {
      Alert.alert('Error', 'Could not get photo');
      return;
    }

    setPhotoUri(asset.uri);
  };

  const onSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }

    await saveProfile({
      name: trimmedName,
      about: about.trim(),
      photoUri,
    });

    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: appearOpacity, transform: [{ translateY: appearY }] }}>
            <View style={styles.top}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              <Text style={styles.h1}>REGISTRATION:</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <Pressable
                  onPress={pickPhoto}
                  style={[styles.avatarBox, { width: avatarSize, height: avatarSize }]}
                >
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.avatarImg} />
                  ) : (
                    <View style={styles.avatarEmpty}>
                      <Text style={styles.avatarPlus}>+</Text>
                      <Text style={styles.avatarHint}>Photo</Text>
                    </View>
                  )}
                </Pressable>

                <View style={styles.fieldCol}>
                  <Text style={styles.label}>
                    Your name<Text style={styles.star}>*</Text>:
                  </Text>

                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    style={styles.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <Text style={[styles.label, { marginTop: IS_TINY ? 12 : 14 }]}>
                Briefly about myself<Text style={styles.star}>*</Text>:
              </Text>

              <TextInput
                value={about}
                onChangeText={setAbout}
                placeholder="Write a short note..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.textarea}
                multiline
                textAlignVertical="top"
              />

              <Pressable onPress={onSave} style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>

              <Pressable onPress={pickPhoto} style={styles.pickHint}>
            
              </Pressable>
            </View>
          </Animated.View>

          <View style={{ height: 28 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: { flex: 1 },

  scroll: {
    paddingHorizontal: IS_TINY ? 14 : 18,
    paddingTop: (Platform.OS === 'android' ? 12 : 8) + 80, 
    paddingBottom: 24,
  },

  top: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: IS_TINY ? 8 : 10,
  },

  logo: {
    width: Math.min(W * (IS_TINY ? 0.30 : 0.34), IS_TINY ? 120 : 140),
    height: Math.min(W * (IS_TINY ? 0.30 : 0.34), IS_TINY ? 120 : 140),
    marginBottom: IS_TINY ? 8 : 10,
  },

  h1: {
    color: '#fff',
    fontSize: IS_TINY ? 28 : IS_SMALL ? 31 : 34,
    fontWeight: '900',
    letterSpacing: 1,
  },

  card: {
    marginTop: IS_TINY ? 10 : 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 22,
    padding: IS_TINY ? 14 : 16,
  },

  row: {
    flexDirection: 'row',
    gap: IS_TINY ? 12 : 14,
    alignItems: 'center',
  },

  avatarBox: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },

  avatarImg: { width: '100%', height: '100%' },

  avatarEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  avatarPlus: {
    color: '#FFD84D',
    fontSize: IS_TINY ? 28 : 30,
    fontWeight: '900',
    marginBottom: 2,
  },

  avatarHint: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
  },

  fieldCol: { flex: 1 },

  label: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: IS_TINY ? 15 : 16,
    fontWeight: '700',
    marginBottom: 8,
  },

  star: { color: '#ff5a5a' },

  input: {
    height: IS_TINY ? 42 : 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#fff',
    backgroundColor: 'rgba(20,60,110,0.55)',
  },

  textarea: {
    marginTop: 6,
    minHeight: IS_TINY ? 105 : IS_SMALL ? 125 : 150,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    color: '#fff',
    backgroundColor: 'rgba(20,60,110,0.55)',
    fontSize: IS_TINY ? 13.5 : 14.5,
    lineHeight: IS_TINY ? 19 : 20,
  },

  saveBtn: {
    marginTop: IS_TINY ? 16 : 18,
    alignSelf: 'center',
    width: Math.min(260, W - 80),
    paddingVertical: IS_TINY ? 14 : 16,
    borderRadius: 18,
    backgroundColor: '#FFD84D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveBtnPressed: { transform: [{ scale: 0.985 }] },

  saveText: {
    color: '#111',
    fontSize: IS_TINY ? 16 : 18,
    fontWeight: '900',
  },

  pickHint: { marginTop: 12, alignSelf: 'center' },

  pickHintText: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
});
