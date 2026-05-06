import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProductDetailsScreen({ route }: any) {
  const { productId } = route.params || {};
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    getProduct();
  }, []);

  async function getProduct() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    setProduct(data);
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading product...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image_url }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
      <Text style={styles.desc}>{product.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', padding: 20, paddingTop: 70 },
  image: { width: '100%', height: 360, borderRadius: 22, backgroundColor: '#E8D8B0' },
  name: { color: '#C6A75E', fontSize: 26, fontWeight: '800', marginTop: 20 },
  price: { color: '#E8D8B0', fontSize: 20, fontWeight: '800', marginTop: 8 },
  desc: { color: '#E8D8B0', fontSize: 16, marginTop: 16 },
  text: { color: '#E8D8B0', textAlign: 'center', marginTop: 100 },
});