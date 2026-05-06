import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function StoreLocatorScreen() {
    const navigation = useNavigation();

  return (
    <View style={styles.container}>
        <TouchableOpacity
  onPress={() => navigation.goBack()}
  style={styles.backButton}
>
  <Ionicons name="arrow-back-outline" size={28} color="#C6A75E" />
</TouchableOpacity>
      <Text style={styles.title}>WAJED Store Locator</Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 31.2001,
          longitude: 29.9187,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        <Marker
          coordinate={{ latitude: 31.2001, longitude: 29.9187 }}
          title="WAJED Alexandria"
          description="Main branch"
        />

        <Marker
          coordinate={{ latitude: 31.2156, longitude: 29.9553 }}
          title="WAJED Boutique"
          description="Luxury fashion store"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', paddingTop: 60 },
  title: {
    color: '#C6A75E',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 15,
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
});