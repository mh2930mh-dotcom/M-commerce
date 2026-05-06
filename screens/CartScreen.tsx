import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import * as Notifications from 'expo-notifications';
import * as Localization from 'expo-localization';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type CartItem = {
    id: string;
    quantity: number;
    products: {
      id: string;
      name: string;
      price: number;
      image_url: string;
    } | null;
  };

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [currency, setCurrency] = useState('EGP');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    getCartItems();
    getUserSettings();
  }, []);

  async function getCartItems() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) return;
  
    const { data: cartData, error: cartError } = await supabase
      .from('cart')
      .select('id, quantity, product_id')
      .eq('user_id', user.id);
  
    if (cartError) {
      console.log(cartError.message);
      return;
    }
  
    const productIds = cartData.map((item) => item.product_id);
  
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .in('id', productIds);
  
    if (productsError) {
      console.log(productsError.message);
      return;
    }
  
    const merged = cartData.map((cartItem) => ({
      id: cartItem.id,
      quantity: cartItem.quantity,
      products: productsData.find((p) => p.id === cartItem.product_id) || null,
    }));
  
    setCartItems(merged);
  }

  async function removeItem(cartId: string) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartId);

    if (error) console.log(error.message);
    else getCartItems();
  }

  const total = cartItems.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0
  );
  async function increaseQuantity(cartId: string, currentQty: number) {
    const { error } = await supabase
      .from('cart')
      .update({ quantity: currentQty + 1 })
      .eq('id', cartId);
  
    if (error) console.log(error.message);
    else getCartItems();
  }
  
  async function decreaseQuantity(cartId: string, currentQty: number) {
    if (currentQty <= 1) {
      removeItem(cartId);
      return;
    }
  
    const { error } = await supabase
      .from('cart')
      .update({ quantity: currentQty - 1 })
      .eq('id', cartId);
  
    if (error) console.log(error.message);
    else getCartItems();
  }

  async function checkout() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user || cartItems.length === 0) return;
  
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ user_id: user.id, total, status: 'paid' }])
      .select()
      .single();
  
    if (orderError) {
      console.log(orderError.message);
      return;
    }
  
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.products?.id,
      quantity: item.quantity,
      price: item.products?.price || 0,
    }));
  
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
  
    if (itemsError) {
      console.log(itemsError.message);
      return;
    }
  
    await supabase.from('cart').delete().eq('user_id', user.id);
  
    alert('Order placed successfully ✨');
    (navigation as any).navigate('Receipt', {
      orderId: order.id,
      total: formatPrice(total),
    });
    if (notificationsEnabled) {
      await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Order Confirmed 🛍️',
        body: 'Your order has been placed successfully!',
      },
      trigger: null,
    });
  }
    getCartItems();
  }
  
function formatPrice(price: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(price);
}
async function getUserSettings() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from('user_settings')
    .select(
      'dark_mode, currency, notifications_enabled, haptics_enabled'
    )
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.log(error.message);
    return;
  }

  if (data) {
    setIsDark(data.dark_mode);
    setCurrency(data.currency);
    setNotificationsEnabled(data.notifications_enabled);
    setHapticsEnabled(data.haptics_enabled);
  }
}

  return (
    <View style={[ styles.container, { backgroundColor: isDark ? '#050505' : '#F8F5EF' }, ]}>
      <TouchableOpacity
  onPress={() => navigation.goBack()}
  style={styles.backButton}
>
  <Ionicons name="arrow-back-outline" size={28} color="#C6A75E" />
</TouchableOpacity>
      <Text style={styles.logo}>WAJED</Text>
      <Text style={styles.title}>Your Cart</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.products?.image_url }} style={styles.image} />

            <View style={styles.info}>
              <Text style={styles.name}>{item.products?.name}</Text>
              <Text style={styles.price}>{formatPrice(item.products?.price || 0)}</Text>
              <View style={styles.qtyRow}>
  <TouchableOpacity onPress={() => decreaseQuantity(item.id, item.quantity)}>
    <Text style={styles.qtyButton}>−</Text>
  </TouchableOpacity>

  <Text style={styles.qty}>Qty: {item.quantity}</Text>

  <TouchableOpacity onPress={() => increaseQuantity(item.id, item.quantity)}>
    <Text style={styles.qtyButton}>+</Text>
  </TouchableOpacity>
</View>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Text style={styles.remove}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
      <Text style={styles.total}>Total: {formatPrice(total)}</Text>
        <TouchableOpacity style={styles.checkout} onPress={checkout}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 7,
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
    flexDirection: 'row',
    backgroundColor: '#B8963A',
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
  },
  image: {
    width: 90,
    height: 100,
    borderRadius: 14,
    backgroundColor: '#E8D8B0',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  name: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '800',
  },
  price: {
    color: '#050505',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  qty: {
    color: '#2B2110',
    marginTop: 6,
  },
  remove: {
    color: '#050505',
    marginTop: 10,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#6F5520',
    paddingVertical: 18,
  },
  total: {
    color: '#E8D8B0',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  checkout: {
    backgroundColor: '#C6A75E',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#050505',
    fontWeight: '800',
    fontSize: 16,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  qtyButton: {
    backgroundColor: '#050505',
    color: '#C6A75E',
    fontSize: 20,
    fontWeight: '800',
    width: 30,
    height: 30,
    textAlign: 'center',
    borderRadius: 15,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
});