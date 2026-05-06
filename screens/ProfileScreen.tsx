import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    getUser();
    getUserSettings();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setEmail(user?.email || '');
  }

  async function logout() {
    await supabase.auth.signOut();
  }
  async function getUserSettings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) return;
  
    const { data } = await supabase
      .from('user_settings')
      .select('dark_mode')
      .eq('user_id', user.id)
      .maybeSingle();
  
    if (data) setIsDark(data.dark_mode);
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#050505' : '#F8F5EF' }]}>
      <Text style={styles.logo}>WAJED</Text>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Logged in as</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
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
  logo: {
    color: '#C6A75E',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
  },
  title: {
    color: '#E8D8B0',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 30,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#B8963A',
    borderRadius: 18,
    padding: 18,
  },
  label: {
    color: '#2B2110',
    fontWeight: '700',
  },
  email: {
    color: '#050505',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
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
});