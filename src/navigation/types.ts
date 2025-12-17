import type { NavigatorScreenParams } from '@react-navigation/native';

export type CategoryKey = 'Hotels' | 'Parks' | 'Monuments';

export type TabsParamList = {
  Home: undefined;
  IntMap: { category?: CategoryKey; placeId?: string } | undefined;
  Quiz: undefined;
  Saved: undefined;
};

export type RootStackParamList = {
  Loader: undefined;
  Onboarding: undefined;
  Registration1: undefined;
  MainTabs: NavigatorScreenParams<TabsParamList>;
  Category: { category: CategoryKey };
  Profile: undefined;
};
