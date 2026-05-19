import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type WishlistItem = {
  id: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
  } | null;
};

export default function WishlistScreen() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [currency, setCurrency] = useState('EGP');
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    getWishlist();
    getUserSettings();
  }, []);
  useFocusEffect(
    useCallback(() => {
      getWishlist();
      getUserSettings();
    }, [])
  );

  async function getWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: wishlistData, error } = await supabase
      .from('wishlist')
      .select('id, product_id')
      .eq('user_id', user.id);

    if (error) {
      console.log(error.message);
      return;
    }

    const productIds = wishlistData.map((item) => item.product_id);
    if (productIds.length === 0) {
      setWishlistItems([]);
      return;
    }

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    const merged = wishlistData.map((wish) => ({
      id: wish.id,
      products:
        productsData?.find((p) => p.id === wish.product_id) || null,
    }));

    setWishlistItems(merged);
  }

  async function removeFromWishlist(wishlistId: string) {
    await supabase.from('wishlist').delete().eq('id', wishlistId);

    setWishlistItems((prev) =>
      prev.filter((item) => item.id !== wishlistId)
    );
  }
  async function getUserSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) return;
  
    const { data, error } = await supabase
      .from('user_settings')
      .select('dark_mode, currency')
      .eq('user_id', user.id)
      .maybeSingle();
  
    if (error) {
      console.log(error.message);
      return;
    }
  
    if (data) {
      setIsDark(data.dark_mode);
      setCurrency(data.currency);
      getExchangeRate(data.currency);
    }
  }
  async function getExchangeRate(selectedCurrency: string) {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('target_currency', selectedCurrency)
      .maybeSingle();
  
    if (error) {
      console.log(error.message);
      return;
    }
  
    if (data) {
      setExchangeRate(data.rate);
    }
  }
  
  function formatPrice(price: number) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(price * exchangeRate);
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#050505' : '#F8F5EF' }]}>
      <Text style={styles.logo}>WAJED</Text>
      <Text style={styles.title}>Wishlist</Text>

      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No wishlist items yet</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.heart}
              onPress={() => removeFromWishlist(item.id)}
            >
              <Ionicons name="heart" size={24} color="red" />
            </TouchableOpacity>

            <Image
              source={{ uri: item.products?.image_url }}
              style={styles.image}
            />

            <Text style={styles.name}>
              {item.products?.name}
            </Text>

            <Text style={styles.category}>
              {item.products?.category}
            </Text>

            <Text style={styles.price}>
            {formatPrice(item.products?.price || 0)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  logo: {
    color: '#C6A75E',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
  },
  title: {
    color: '#E8D8B0',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#B8963A',
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#E8D8B0',
  },
  heart: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  name: {
    color: '#050505',
    fontWeight: '800',
    fontSize: 16,
    marginTop: 12,
  },
  category: {
    color: '#2B2110',
    marginTop: 4,
  },
  price: {
    color: '#050505',
    fontWeight: '800',
    fontSize: 18,
    marginTop: 8,
  },
  empty: {
    color: '#E8D8B0',
    textAlign: 'center',
    marginTop: 50,
  },
});