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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { getProfile, saveProfile } from '../storage/profileStorage';
import { useNavigation } from '@react-navigation/native';

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 750;
const IS_TINY = H < 690;

const BG = require('../assets/background.png');
const ICON_BACK = require('../assets/ic_back.png'); 

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const safeTop = Math.max(insets.top, Platform.OS === 'android' ? 10 : 0);

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

    Alert.alert('Saved', 'Profile updated successfully.');
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: safeTop + 24 }]} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: appearOpacity, transform: [{ translateY: appearY }] }}>
          
            <View style={styles.headerRow}>
              <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
                <Image source={ICON_BACK} style={styles.backIcon} />
              </Pressable>

              <Text style={styles.headerTitle}>Profile settings</Text>

              <View style={{ width: 40 }} />
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <Pressable onPress={pickPhoto} style={[styles.avatarBox, { width: avatarSize, height: avatarSize }]}>
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
    paddingBottom: 24,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { width: 18, height: 18, tintColor: '#FFD84D' },

  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 14, opacity: 0.92 },

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
