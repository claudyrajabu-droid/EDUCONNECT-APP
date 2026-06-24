// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { C } from '../theme';

import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import {
  WanafunziDarasaScreen, WanafunziListScreen,
  MahudhurioListScreen,  MahudhurioDetailScreen,
  MasomoScreen, MatokeoScreen, UjumbeScreen,
  MalipoScreen, TaarifaScreen, SubscriptionScreen,
} from '../screens/MainScreens';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor:C.primary}}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main"              component={DashboardScreen} />
            <Stack.Screen name="Subscription"      component={SubscriptionScreen} />
            <Stack.Screen name="WanafunziDarasa"   component={WanafunziDarasaScreen} />
            <Stack.Screen name="WanafunziList"     component={WanafunziListScreen} />
            <Stack.Screen name="MahudhurioList"    component={MahudhurioListScreen} />
            <Stack.Screen name="MahudhurioDetail"  component={MahudhurioDetailScreen} />
            <Stack.Screen name="Masomo"            component={MasomoScreen} />
            <Stack.Screen name="Matokeo"           component={MatokeoScreen} />
            <Stack.Screen name="Ujumbe"            component={UjumbeScreen} />
            <Stack.Screen name="Malipo"            component={MalipoScreen} />
            <Stack.Screen name="Taarifa"           component={TaarifaScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
