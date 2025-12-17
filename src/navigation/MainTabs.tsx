import React from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabsParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import IntMapScreen from '../screens/IntMapScreen';
import QuizScreen from '../screens/QuizScreen';
import SavedScreen from '../screens/SavedScreen';

const Tab = createBottomTabNavigator<TabsParamList>();

const ICONS = {
  Home: require('../assets/tab_home.png'),
  IntMap: require('../assets/tab_map.png'),
  Quiz: require('../assets/tab_quiz.png'),
  Saved: require('../assets/tab_saved.png'),
} as const;

const TAB_BG = '#061B2E';
const ACTIVE = '#FFD84D';
const INACTIVE = 'rgba(255,216,77,0.45)';

export default function MainTabs() {
  return (
    <View style={styles.root}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,

          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.item,

          tabBarIcon: ({ focused }) => {
            const src = ICONS[route.name as keyof typeof ICONS];
            return (
              <View style={styles.iconWrap}>
                <Image
                  source={src}
                  style={[styles.icon, { tintColor: focused ? ACTIVE : INACTIVE }]}
                  resizeMode="contain"
                />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="IntMap" component={IntMapScreen} />
        <Tab.Screen name="Quiz" component={QuizScreen} />
        <Tab.Screen name="Saved" component={SavedScreen} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TAB_BG,
  },

  tabBar: {
    backgroundColor: TAB_BG,
    borderTopWidth: 0,

    height: Platform.OS === 'ios' ? 86 : 68,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
    paddingHorizontal: 18,

    ...(Platform.OS === 'android'
      ? {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 30,
          elevation: 0,
        }
      : null),
  },

  item: {
    borderRadius: 18,
  },

  iconWrap: {
    width: 56,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 26,
    height: 26,
  },
});
