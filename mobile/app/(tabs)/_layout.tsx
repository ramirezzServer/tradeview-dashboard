import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { COLORS } from '../../src/theme/colors';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name:       string;
  title:      string;
  icon:       IoniconsName;
  iconFocused: IoniconsName;
}

const TABS: TabConfig[] = [
  {
    name:        'index',
    title:       'Dashboard',
    icon:        'home-outline',
    iconFocused: 'home',
  },
  {
    name:        'watchlist',
    title:       'Watchlist',
    icon:        'bookmark-outline',
    iconFocused: 'bookmark',
  },
  {
    name:        'portfolio',
    title:       'Portfolio',
    icon:        'pie-chart-outline',
    iconFocused: 'pie-chart',
  },
  {
    name:        'news',
    title:       'News',
    icon:        'newspaper-outline',
    iconFocused: 'newspaper',
  },
  {
    name:        'settings',
    title:       'Settings',
    icon:        'settings-outline',
    iconFocused: 'settings',
  },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:         false,
        tabBarStyle:          styles.tabBar,
        tabBarActiveTintColor:   COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarLabelStyle:     styles.tabLabel,
        tabBarItemStyle:      styles.tabItem,
        tabBarHideOnKeyboard: true,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.tabBar,
    borderTopWidth:  1,
    borderTopColor:  COLORS.border,
    height:          Platform.OS === 'ios' ? 82 : 62,
    paddingBottom:   Platform.OS === 'ios' ? 24 : 8,
    paddingTop:       8,
  },
  tabLabel: {
    fontSize:   10,
    fontWeight: '600',
    marginTop:  -2,
  },
  tabItem: {
    paddingTop: 2,
  },
});
