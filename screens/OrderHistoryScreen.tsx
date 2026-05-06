import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
};

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    getOrders();
  }, []);

  async function getOrders() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.log(error.message);
    else setOrders(data || []);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
  onPress={() => navigation.goBack()}
  style={styles.backButton}
>
  <Ionicons name="arrow-back-outline" size={28} color="#C6A75E" />
</TouchableOpacity>
      <Text style={styles.logo}>WAJED</Text>
      <Text style={styles.title}>Order History</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
            <Text style={styles.text}>Status: {item.status}</Text>
            <Text style={styles.text}>Total: ${item.total}</Text>
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleString()}
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
    backgroundColor: '#B8963A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  orderId: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  text: {
    color: '#050505',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    color: '#2B2110',
    marginTop: 6,
  },
  empty: {
    color: '#E8D8B0',
    textAlign: 'center',
    marginTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
});