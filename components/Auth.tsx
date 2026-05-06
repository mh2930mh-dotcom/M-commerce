import { useState } from 'react';
import { Alert, StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ScrollView } from 'react-native';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function signInWithEmail() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
  }

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Please enter email and password');
      return;
    }
  
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
  
    if (error) Alert.alert(error.message);
    else Alert.alert('Account created!');
  }

  return (
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}> 
      <Text style={styles.logo}>WAJED</Text>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9B8A63"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9B8A63"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />
     
      <TouchableOpacity style={styles.button} onPress={signInWithEmail}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.outlineButton} onPress={signUpWithEmail}>
        <Text style={styles.outlineText}>Create Account</Text>
      </TouchableOpacity>
      
    </View>
  </TouchableWithoutFeedback>
</KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    color: '#C6A75E',
    fontSize: 42,
    textAlign: 'center',
    letterSpacing: 7,
    fontWeight: '700',
    marginBottom: 10,
  },
  title: {
    color: '#E8D8B0',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 35,
  },
  input: {
    borderWidth: 1,
    borderColor: '#6F5520',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#111',
  },
  button: {
    backgroundColor: '#C6A75E',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#050505',
    fontWeight: '700',
    fontSize: 16,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#C6A75E',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  outlineText: {
    color: '#C6A75E',
    fontWeight: '600',
  },
});