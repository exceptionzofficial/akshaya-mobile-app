import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useContext(AuthContext);

  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (phone.length !== 10) {
      Alert.alert('Error', 'Phone number must be 10 digits');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await signup({ name, email, phone, password, role: userType });
    setLoading(false);

    if (result.success) {
      Alert.alert(
        '🎉 Welcome!', 
        'Account created successfully! Please login.',
        [{ text: 'Login Now', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Signup Failed', result.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Green Header */}
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            {/* Logo Container */}
            <View style={styles.logoContainer}>
              {/* Option 1: Image Logo (Uncomment when you have logo.png) */}
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logoImage}
                resizeMode="cover"
              />
              
              {/* Option 2: Emoji Logo (Current - Comment out when using image) */}
              {/* <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🌱</Text>
              </View> */}
            </View>
            
            <Text style={styles.title}>சத்வமிர்தம்</Text>
            <Text style={styles.subtitle}>Join our pure food community</Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#95A5A6"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#95A5A6"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="10 digit phone number"
                placeholderTextColor="#95A5A6"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Password</Text>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Min 6 characters"
                placeholderTextColor="#95A5A6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor="#95A5A6"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          {/* User Type */}
          <Text style={styles.userTypeLabel}>Select Account Type</Text>
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeCard,
                userType === 'user' && styles.userTypeCardActive
              ]}
              onPress={() => setUserType('user')}
              activeOpacity={0.7}
            >
              <Text style={styles.userTypeEmoji}>🍽️</Text>
              <Text style={[
                styles.userTypeText,
                userType === 'user' && styles.userTypeTextActive
              ]}>
                Customer
              </Text>
              <Text style={styles.userTypeSubtext}>Order Food</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeCard,
                userType === 'rider' && styles.userTypeCardActive
              ]}
              onPress={() => setUserType('rider')}
              activeOpacity={0.7}
            >
              <Text style={styles.userTypeEmoji}>🚴</Text>
              <Text style={[
                styles.userTypeText,
                userType === 'rider' && styles.userTypeTextActive
              ]}>
                Rider
              </Text>
              <Text style={styles.userTypeSubtext}>Deliver Food</Text>
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing up, you agree to our
          </Text>
          <Text style={styles.footerLink}>
            Terms & Conditions and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollView: { flexGrow: 1, paddingBottom: 30 },
  headerBackground: {
    backgroundColor: '#2D7A4F',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 50,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,  // Perfect circle
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  logoEmoji: { fontSize: 50 },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Futura' : 'sans-serif-medium',
  },
  subtitle: { 
    fontSize: 14, 
    color: '#FFFFFF',
    opacity: 0.9,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputWrapper: { marginBottom: 20 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  showPasswordText: {
    fontSize: 13,
    color: '#2D7A4F',
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  input: { 
    padding: 16,
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
  },
  userTypeLabel: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#2C3E50',
    marginBottom: 16,
  },
  userTypeContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  userTypeCard: { 
    flex: 1, 
    padding: 20, 
    borderWidth: 2,
    borderColor: '#E8ECEF',
    borderRadius: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  userTypeCardActive: { 
    borderColor: '#2D7A4F',
    backgroundColor: '#E8F5E9',
  },
  userTypeEmoji: { fontSize: 36, marginBottom: 12 },
  userTypeText: { 
    fontSize: 15, 
    color: '#7F8C8D', 
    fontWeight: '700',
    marginBottom: 4,
  },
  userTypeTextActive: { color: '#2D7A4F' },
  userTypeSubtext: {
    fontSize: 12,
    color: '#95A5A6',
  },
  registerButton: { 
    backgroundColor: '#2D7A4F',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2D7A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: { opacity: 0.6 },
  registerButtonText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: { 
    fontSize: 15,
    color: '#7F8C8D',
  },
  loginLink: { 
    color: '#2D7A4F', 
    fontWeight: '700',
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 13,
    color: '#95A5A6',
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 13,
    color: '#2D7A4F',
    fontWeight: '600',
  },
});

export default SignupScreen;
