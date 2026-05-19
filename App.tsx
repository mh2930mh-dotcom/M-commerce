import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import HomeScreen from './screens/HomeScreen';
import CartScreen from './screens/CartScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import * as Notifications from 'expo-notifications';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import ProfileScreen from './screens/ProfileScreen';
import MainTabs from './navigation/MainTabs';
import AddProductScreen from './screens/AddProductScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import StoreLocatorScreen from './screens/StoreLocatorScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import CheckoutScreen from './screens/CheckoutScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const linking = {
    prefixes: ['wajed://'],
    config: {
      screens: {
        MainTabs: {
          screens: {
            HomeTab: 'home',
          },
        },
        ProductDetails: 'product/:productId',
        Cart: 'cart',
        Orders: 'orders',
      },
    },
  };
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return <Auth />;
  }

  return (
    <NavigationContainer linking={linking as any}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Orders" component={OrderHistoryScreen} />
        <Stack.Screen name="Scanner" component={BarcodeScannerScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} />
        <Stack.Screen name="Receipt" component={ReceiptScreen} />
        <Stack.Screen name="StoreLocator" component={StoreLocatorScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}