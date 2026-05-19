import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function SettingsScreen() {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState('EGP');
  const [country, setCountry] = useState('Egypt');
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.log(error.message);
      return;
    }

    if (!data) {
      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert([{ user_id: user.id }])
        .select()
        .single();

      if (insertError) {
        console.log(insertError.message);
        return;
      }

      setSettingsId(newSettings.id);
      return;
    }

    setSettingsId(data.id);
    setNotifications(data.notifications_enabled);
    setHaptics(data.haptics_enabled);
    setDarkMode(data.dark_mode);
    setCurrency(data.currency);
    setCountry(data.country);
    setLanguage(data.language || 'English');
  }

  async function updateSetting(field: string, value: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .update({
        [field]: value,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      Alert.alert(error.message);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#050505' : '#F8F5EF' }]}>
      <Text style={styles.logo}>WAJED</Text>
      <Text style={[styles.title, { color: darkMode ? '#E8D8B0' : '#111' }]}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Notifications</Text>
        <Switch
          value={notifications}
          onValueChange={(value) => {
            setNotifications(value);
            updateSetting('notifications_enabled', value);
          }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Haptic Feedback</Text>
        <Switch
          value={haptics}
          onValueChange={(value) => {
            setHaptics(value);
            updateSetting('haptics_enabled', value);
          }}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={(value) => {
            setDarkMode(value);
            updateSetting('dark_mode', value);
          }}
        />
      </View>

      <Text style={[styles.section, { color: darkMode ? '#E8D8B0' : '#111' }]}>Currency</Text>
      {['EGP', 'USD', 'EUR'].map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.option, currency === item && styles.activeOption]}
          onPress={() => {
            setCurrency(item);
            updateSetting('currency', item);
          }}
        >
          <Text style={[styles.optionText, currency === item && styles.activeOptionText]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
      <Text style={[styles.section, { color: darkMode ? '#E8D8B0' : '#111' }]}>Language</Text>

{['English', 'French', 'Spanish'].map((item) => (
  <TouchableOpacity
    key={item}
    style={[styles.option, language === item && styles.activeOption]}
    onPress={() => {
      setLanguage(item);
      updateSetting('language', item);
    }}
  >
    <Text style={[styles.optionText, language === item && styles.activeOptionText]}>
      {item}
    </Text>
  </TouchableOpacity>
))}

      <Text style={[styles.section, { color: darkMode ? '#E8D8B0' : '#111' }]}>Country</Text>
      {['Egypt', 'USA', 'France'].map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.option, country === item && styles.activeOption]}
          onPress={() => {
            setCountry(item);
            updateSetting('country', item);
          }}
        >
          <Text style={[styles.optionText, country === item && styles.activeOptionText]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 18,
  },
  logo: {
    color: '#C6A75E',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 30,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#B8963A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#050505',
    fontWeight: '800',
    fontSize: 16,
  },
  section: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: '#C6A75E',
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
  },
  activeOption: {
    backgroundColor: '#C6A75E',
  },
  optionText: {
    color: '#C6A75E',
    fontWeight: '800',
  },
  activeOptionText: {
    color: '#050505',
  },
});