import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function BarcodeScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  async function handleBarcodeScanned({ data }: { data: string }) {
    setScanned(true);

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', data)
      .maybeSingle();

    if (error) {
      Alert.alert(error.message);
      return;
    }

    if (product) {
      Alert.alert('Product Found', `${product.name} - $${product.price}`);
    } else {
      Alert.alert('Not Found', 'No product found with this barcode.');
    }
  }

  if (!permission) {
    return <Text style={styles.text}>Loading camera...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
  onPress={() => navigation.goBack()}
  style={styles.backButton}
>
  <Ionicons name="arrow-back-outline" size={28} color="#C6A75E" />
</TouchableOpacity>
      <Text style={styles.title}>Scan Product Barcode</Text>

      <View style={styles.scannerBox}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
      </View>

      {scanned && (
        <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    paddingTop: 70,
    paddingHorizontal: 20,
  },
  title: {
    color: '#C6A75E',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 30,
  },
  scannerBox: {
    height: 360,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#C6A75E',
  },
  button: {
    backgroundColor: '#C6A75E',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 25,
  },
  buttonText: {
    color: '#050505',
    fontWeight: '800',
  },
  text: {
    color: '#E8D8B0',
    textAlign: 'center',
    marginTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
});