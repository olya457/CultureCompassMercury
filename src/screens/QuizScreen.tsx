import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width: W, height: H } = Dimensions.get('window');

const IS_TINY = H < 690;
const IS_SMALL = H < 740;

const BG = require('../assets/background.png');
const ONBOARD4_STAMP = require('../assets/onboard4.png');

type Q = { q: string; options: string[]; correctIndex: number };
const PASS_SCORE = 7;

export default function QuizScreen() {
  const questions: Q[] = useMemo(
    () => [
      { q: 'The capital of Germany from 1949 to 1990?', options: ['Munich', 'Bonn', 'Hamburg'], correctIndex: 1 },
      { q: 'How many federal states are there in Germany?', options: ['16', '12', '18'], correctIndex: 0 },
      { q: 'What is the longest river in Germany?', options: ['Elbe', 'Rhine', 'Danube'], correctIndex: 2 },
      { q: 'In which city is Oktoberfest held?', options: ['Munich', 'Frankfurt', 'Hamburg'], correctIndex: 0 },
      { q: 'Which company invented the printing press?', options: ['Siemens', 'Gutenberg Press', 'Bosch'], correctIndex: 1 },
      { q: 'What symbol is on the German coat of arms?', options: ['Eagle', 'Lion', 'Deer'], correctIndex: 0 },
      { q: 'The oldest university in Germany?', options: ['Heidelberg University', 'Munich University', 'Jena University'], correctIndex: 0 },
      { q: 'Which motorway is famous for its lack of speed limits?', options: ['Autobahn A9', 'Autobahn A3', 'Autobahn in general'], correctIndex: 2 },
      { q: 'Where is the Brandenburg Gate?', options: ['Potsdam', 'Berlin', 'Leipzig'], correctIndex: 1 },
      { q: 'In which city is the BMW Museum located?', options: ['Munich', 'Stuttgart', 'Hannover'], correctIndex: 0 },
    ],
    []
  );

  type Step = 'start' | 'quiz' | 'result';
  const [step, setStep] = useState<Step>('start');

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<'correct' | 'wrong' | 'none'>>(new Array(questions.length).fill('none'));

  const score = answers.filter((a) => a === 'correct').length;
  const current = questions[index];
  const isLast = index === questions.length - 1;
  const hasPicked = picked !== null;
  const isCorrectPick = hasPicked && picked === current.correctIndex;

  const fade = useRef(new Animated.Value(0)).current;
  const card = useRef(new Animated.Value(0)).current;
  const stampAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    fade.setValue(0);
    card.setValue(0);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(card, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, card]);

  const animateStartContent = useCallback(() => {
    stampAnim.setValue(0);
    textAnim.setValue(0);
    btnAnim.setValue(0);

    Animated.sequence([
      Animated.timing(stampAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [stampAnim, textAnim, btnAnim]);

  const resetAll = useCallback(() => {
    setStep('start');
    setIndex(0);
    setPicked(null);
    setAnswers(new Array(questions.length).fill('none'));

    requestAnimationFrame(() => {
      animateIn();
      animateStartContent();
    });
  }, [questions.length, animateIn, animateStartContent]);

  useFocusEffect(
    useCallback(() => {
      resetAll();
      return () => {};
    }, [resetAll])
  );

  useEffect(() => {
    if (step === 'start') {
      requestAnimationFrame(() => {
        animateIn();
        animateStartContent();
      });
    } else {
      requestAnimationFrame(animateIn);
    }
  }, [step, animateIn, animateStartContent]);

  const goQuiz = () => {
    setStep('quiz');
    setIndex(0);
    setPicked(null);
    setAnswers(new Array(questions.length).fill('none'));
  };

  const selectOption = (i: number) => {
    if (hasPicked) return;
    setPicked(i);
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = i === current.correctIndex ? 'correct' : 'wrong';
      return next;
    });
  };

  const nextQuestion = () => {
    if (!hasPicked) return;
    if (isLast) {
      setStep('result');
      return;
    }
    setIndex((v) => v + 1);
    setPicked(null);
  };

  const shareResult = async () => {
    const passed = score >= PASS_SCORE;
    const msg = passed
      ? `Quiz passed!\nScore: ${score}/${questions.length}\nYou are worthy of the status of Expert of Germany.`
      : `The quiz is over.\nScore: ${score}/${questions.length}\nTry again to improve your result.`;
    try {
      await Share.share({ message: msg });
    } catch {}
  };

  const ProgressRow = () => (
    <View style={styles.progressRow}>
      {answers.map((a, i) => {
        const isActive = i === index && step === 'quiz';
        const bg =
          a === 'correct'
            ? '#35C759'
            : a === 'wrong'
              ? '#FF3B30'
              : isActive
                ? '#FFD84D'
                : 'rgba(255,255,255,0.20)';
        const brd = isActive && a === 'none' ? 'rgba(0,0,0,0.28)' : 'rgba(0,0,0,0.12)';
        return <View key={i} style={[styles.dot, { backgroundColor: bg, borderColor: brd }]} />;
      })}
    </View>
  );

  const CardWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fade,
          transform: [
            { translateY: card.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
            { scale: card.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );

  const CARD_W = Math.min(390, W - 28);
  const CARD_PAD = IS_TINY ? 14 : 16;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quiz</Text>
      </View>

      <View style={styles.center}>
        {step === 'start' && (
          <CardWrap>
            <View style={[styles.cardInner, { width: CARD_W, padding: CARD_PAD }]}>
              <ScrollView contentContainerStyle={{ paddingBottom: 6 }} showsVerticalScrollIndicator={false} bounces={false}>
                <Animated.View
                  style={[
                    styles.stampWrap,
                    {
                      opacity: stampAnim,
                      transform: [
                        { translateY: stampAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
                        { scale: stampAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) },
                      ],
                    },
                  ]}
                >
                  <Image
                    source={ONBOARD4_STAMP}
                    style={[styles.stamp, { width: IS_TINY ? 118 : 132, height: IS_TINY ? 118 : 132 }]}
                    resizeMode="contain"
                  />
                </Animated.View>

                <Animated.Text
                  style={[
                    styles.introText,
                    {
                      opacity: textAnim,
                      transform: [{ translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                      fontSize: IS_TINY ? 12.8 : 14,
                      lineHeight: IS_TINY ? 18 : 20,
                      textAlign: 'center',
                    },
                  ]}
                >
                  The Culture Compass Mercury quiz is 10 tricky questions about Germany: history, culture, mentality, symbols and
                  facts that you might think you know. After successfully passing, you get a digital “Germany Pro” stamp — a sign
                  that you are really familiar with the country.
                </Animated.Text>

                <Animated.View
                  style={[
                    {
                      opacity: btnAnim,
                      transform: [{ translateY: btnAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
                      marginTop: IS_TINY ? 14 : 18,
                    },
                  ]}
                >
                  <Pressable onPress={goQuiz} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
                    <Text style={[styles.primaryBtnText, { fontSize: IS_TINY ? 15 : 16 }]}>Start</Text>
                  </Pressable>
                </Animated.View>
              </ScrollView>
            </View>
          </CardWrap>
        )}

        {step === 'quiz' && (
          <CardWrap>
            <View style={[styles.cardInner, { width: CARD_W, padding: CARD_PAD }]}>
              <ProgressRow />

              <Text style={styles.question}>{current.q}</Text>

              <View style={styles.options}>
                {current.options.map((opt, i) => {
                  const correct = i === current.correctIndex;
                  const chosen = i === picked;

                  let bg = 'rgba(0,0,0,0.28)';
                  let brd = 'rgba(255,255,255,0.12)';
                  let txt = '#fff';

                  if (hasPicked) {
                    if (correct) {
                      bg = '#35C759';
                      brd = 'rgba(0,0,0,0.15)';
                      txt = '#0B1A12';
                    } else if (chosen && !correct) {
                      bg = '#FF3B30';
                      brd = 'rgba(0,0,0,0.15)';
                      txt = '#1B0A0A';
                    } else {
                      bg = 'rgba(0,0,0,0.22)';
                      brd = 'rgba(255,255,255,0.10)';
                      txt = 'rgba(255,255,255,0.90)';
                    }
                  }

                  return (
                    <Pressable
                      key={`${index}_${opt}`}
                      onPress={() => selectOption(i)}
                      disabled={hasPicked}
                      style={({ pressed }) => [
                        styles.optionBtn,
                        { backgroundColor: bg, borderColor: brd },
                        pressed && !hasPicked && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.optionText, { color: txt }]}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {hasPicked && (
                <View style={styles.tfRow}>
                  <Text style={[styles.tfText, isCorrectPick ? styles.trueText : styles.falseText]}>
                    {isCorrectPick ? 'TRUE' : 'FALSE'}
                  </Text>
                </View>
              )}

              <View style={styles.quizBottomRow}>
                <Pressable onPress={resetAll} style={styles.closeMini} hitSlop={10}>
                  <Text style={styles.closeMiniText}>×</Text>
                  <Text style={styles.closeMiniLabel}>Close quiz</Text>
                </Pressable>

                <Pressable
                  onPress={nextQuestion}
                  disabled={!hasPicked}
                  style={({ pressed }) => [
                    styles.nextBtn,
                    !hasPicked && styles.nextBtnDisabled,
                    pressed && hasPicked && styles.pressed,
                  ]}
                >
                  <Text style={styles.nextText}>{isLast ? 'Finish' : 'Next'}</Text>
                </Pressable>
              </View>
            </View>
          </CardWrap>
        )}

        {step === 'result' && (
          <CardWrap>
            <View style={[styles.cardInner, { width: CARD_W, padding: CARD_PAD }]}>
              <ProgressRow />

              {score >= PASS_SCORE ? (
                <>
                  <Text style={styles.resultTitle}>Quiz passed!</Text>
                  <Text style={styles.resultSub}>You are worthy of the status of Expert of Germany.</Text>

                  <View style={styles.resultStampWrap}>
                    <Image source={ONBOARD4_STAMP} style={styles.stampBig} resizeMode="contain" />
                  </View>

                  <Pressable onPress={shareResult} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
                    <Text style={[styles.primaryBtnText, { fontSize: IS_TINY ? 15 : 16 }]}>Share</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.resultTitle}>The quiz is over!</Text>
                  <Text style={styles.resultSub}>Unfortunately, we cannot yet place you with the title of expert in Germany.</Text>

                  <View style={styles.resultStampWrap}>
                    <Image source={ONBOARD4_STAMP} style={styles.stampBig} resizeMode="contain" />
                  </View>

                  <Pressable onPress={goQuiz} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}>
                    <Text style={[styles.secondaryBtnText, { fontSize: IS_TINY ? 15 : 16 }]}>Try again</Text>
                  </Pressable>

                  <Pressable onPress={shareResult} style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}>
                    <Text style={[styles.ghostBtnText, { fontSize: IS_TINY ? 15 : 16 }]}>Share</Text>
                  </Pressable>
                </>
              )}
            </View>
          </CardWrap>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  header: {
    paddingTop: (Platform.OS === 'android' ? 14 : 18) + 30 + 30,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 17, opacity: 0.92 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingBottom: 14 },

  card: {
    borderRadius: 22,
    backgroundColor: 'rgba(0,22,45,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  cardInner: {
    borderRadius: 22,
    overflow: 'hidden',
  },

  stampWrap: { alignItems: 'center', marginTop: 6, marginBottom: 14 },
  stamp: {},

  introText: {
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '800',
  },

  primaryBtn: {
    height: IS_SMALL ? 54 : 58,
    borderRadius: 16,
    backgroundColor: '#FFD84D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#111', fontWeight: '900' },

  progressRow: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' },
  dot: { width: 14, height: 14, borderRadius: 8, borderWidth: 1 },

  question: {
    color: '#FFD84D',
    fontWeight: '900',
    fontSize: IS_TINY ? 12.2 : 12.6,
    marginTop: 6,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 16.5,
  },

  options: { gap: 10 },
  optionBtn: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  optionText: { fontWeight: '900', fontSize: 12.5 },

  tfRow: { marginTop: 12, alignItems: 'center' },
  tfText: { fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  trueText: { color: '#35C759' },
  falseText: { color: '#FF3B30' },

  quizBottomRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  closeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  closeMiniText: { color: '#FFD84D', fontWeight: '900', fontSize: 16, marginTop: -1 },
  closeMiniLabel: { color: '#fff', fontWeight: '900', fontSize: 11.5 },

  nextBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFD84D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: { opacity: 0.45 },
  nextText: { color: '#111', fontWeight: '900', fontSize: 12.5 },

  resultTitle: { color: '#FFD84D', fontWeight: '900', fontSize: 13.5, textAlign: 'center', marginTop: 4 },
  resultSub: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '800',
    fontSize: IS_TINY ? 12.6 : 13.5,
    textAlign: 'center',
    lineHeight: IS_TINY ? 18 : 20,
  },

  resultStampWrap: { alignItems: 'center', marginTop: 14, marginBottom: 8 },
  stampBig: { width: IS_TINY ? 132 : 150, height: IS_TINY ? 132 : 150 },

  secondaryBtn: {
    marginTop: 14,
    height: IS_SMALL ? 54 : 58,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  secondaryBtnText: { color: '#fff', fontWeight: '900' },

  ghostBtn: {
    marginTop: 10,
    height: IS_SMALL ? 54 : 58,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  ghostBtnText: { color: '#FFD84D', fontWeight: '900' },

  pressed: { transform: [{ scale: 0.985 }] },
});
