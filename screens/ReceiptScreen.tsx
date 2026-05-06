import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function ReceiptScreen({ route }: any) {
  const { orderId, total } = route.params || {};

  async function exportPDF() {
    const html = `
      <html>
        <body style="font-family: Arial; padding: 24px;">
          <h1 style="color:#B8963A;">WAJED Receipt</h1>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Total:</strong> ${total}</p>
          <p><strong>Status:</strong> Paid</p>
          <hr />
          <p>Thank you for shopping with WAJED.</p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>WAJED</Text>
      <Text style={styles.title}>Order Successful</Text>
      <Text style={styles.text}>Order ID: {orderId}</Text>
      <Text style={styles.text}>Total: {total}</Text>

      <TouchableOpacity style={styles.button} onPress={exportPDF}>
        <Text style={styles.buttonText}>Export Receipt PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', paddingTop: 80, paddingHorizontal: 20 },
  logo: { color: '#C6A75E', fontSize: 34, fontWeight: '800', letterSpacing: 8, textAlign: 'center' },
  title: { color: '#E8D8B0', fontSize: 26, fontWeight: '800', marginTop: 40, marginBottom: 20 },
  text: { color: '#E8D8B0', fontSize: 16, marginBottom: 10 },
  button: { backgroundColor: '#C6A75E', padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 25 },
  buttonText: { color: '#050505', fontWeight: '800' },
});