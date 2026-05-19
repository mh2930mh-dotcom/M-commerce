import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

export default function CheckoutScreen({ route }: any) {
  const navigation = useNavigation();
  const { cartItems, total } = route.params || {};

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cardLast4, setCardLast4] = useState('');
  const [notes, setNotes] = useState('');

  const [currency, setCurrency] = useState('EGP');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    getUserSettings();
  }, []);

  async function getUserSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('user_settings')
      .select('currency, notifications_enabled')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setCurrency(data.currency);
      setNotificationsEnabled(data.notifications_enabled);
      getExchangeRate(data.currency);
    }
  }

  async function getExchangeRate(selectedCurrency: string) {
    const { data } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('target_currency', selectedCurrency)
      .maybeSingle();

    if (data) setExchangeRate(data.rate);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(price * exchangeRate);
  }

  async function placeOrder() {
    if (!cartItems?.length) {
      Alert.alert('Your cart is empty');
      return;
    }

    if (!fullName || !phone || !address || !city) {
      Alert.alert('Please complete your checkout information');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const totalConverted = total * exchangeRate;

    const orderItems = cartItems
      .filter((item: any) => item.products?.id)
      .map((item: any) => ({
        product_id: item.products.id,
        quantity: item.quantity,
        price: item.products.price || 0,
      }));

    if (orderItems.length === 0) {
      Alert.alert('No valid products found in your cart');
      return;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user.id,
          total: totalConverted,
          status: 'paid',
          full_name: fullName,
          phone,
          address,
          city,
          payment_method: paymentMethod,
          card_last4: cardLast4,
          notes,
          currency,
          exchange_rate: exchangeRate,
          total_base: total,
          total_converted: totalConverted,
        },
      ])
      .select()
      .single();

    if (orderError) {
      Alert.alert(orderError.message);
      return;
    }

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems.map((item: any) => ({ ...item, order_id: order.id })));

    if (itemsError) {
      Alert.alert(itemsError.message);
      return;
    }

    await supabase.from('cart').delete().eq('user_id', user.id);

    if (notificationsEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Order Confirmed',
          body: 'Your order has been placed successfully!',
        },
        trigger: null,
      });
    }

    Alert.alert('Order placed successfully ✨');

    (navigation as any).navigate('Receipt', {
      orderId: order.id,
      total: formatPrice(total),
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>WAJED</Text>
      <Text style={styles.title}>Checkout</Text>

      <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#999" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#999" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Address" placeholderTextColor="#999" value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder="City" placeholderTextColor="#999" value={city} onChangeText={setCity} />

      <View style={styles.paymentRow}>
        {['Card', 'Cash'].map((method) => (
          <TouchableOpacity
            key={method}
            style={[styles.paymentOption, paymentMethod === method && styles.activePayment]}
            onPress={() => setPaymentMethod(method)}
          >
            <Text style={styles.paymentText}>{method}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {paymentMethod === 'Card' && (
        <TextInput
          style={styles.input}
          placeholder="Card Last 4 Digits"
          placeholderTextColor="#999"
          value={cardLast4}
          onChangeText={setCardLast4}
          maxLength={4}
          keyboardType="numeric"
        />
      )}

      <TextInput style={styles.input} placeholder="Notes" placeholderTextColor="#999" value={notes} onChangeText={setNotes} />

      <Text style={styles.total}>Total: {formatPrice(total || 0)}</Text>

      <TouchableOpacity style={styles.button} onPress={placeOrder}>
        <Text style={styles.buttonText}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', paddingTop: 60, paddingHorizontal: 18 },
  logo: { color: '#C6A75E', fontSize: 34, fontWeight: '800', letterSpacing: 8, textAlign: 'center' },
  title: { color: '#E8D8B0', fontSize: 24, fontWeight: '800', marginTop: 25, marginBottom: 18 },
  input: { backgroundColor: '#111', color: '#fff', borderWidth: 1, borderColor: '#C6A75E', borderRadius: 12, padding: 13, marginBottom: 12 },
  paymentRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  paymentOption: { flex: 1, borderWidth: 1, borderColor: '#C6A75E', borderRadius: 12, padding: 13, alignItems: 'center' },
  activePayment: { backgroundColor: '#C6A75E' },
  paymentText: { color: '#fff', fontWeight: '800' },
  total: { color: '#E8D8B0', fontSize: 20, fontWeight: '800', marginVertical: 12 },
  button: { backgroundColor: '#C6A75E', padding: 15, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#050505', fontWeight: '800' },
});
