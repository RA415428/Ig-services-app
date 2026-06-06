import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API_URL = 'https://ig-services-rdeu.onrender.com/api';

export default function App() {
  const [screen, setScreen] = useState('Login'); // Login, Register, Home, AddAccount, Order, MyOrders, Earn
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);

  // Earn Coins Form
  const [adCoinsReward, setAdCoinsReward] = useState(10); // Mock reward, Admin set

  // Add Insta Account Form
  const [instaUser, setInstaUser] = useState('');
  const [instaPass, setInstaPass] = useState('');

  // Create Order Form
  const [targetUrl, setTargetUrl] = useState('');
  const [orderType, setOrderType] = useState('like'); // like, follower, comment, view
  const [quantity, setQuantity] = useState('');
  const [orderList, setOrderList] = useState([]);

  const coinCostPerItem = {
    like: 2,      // 2 coins per like
    follower: 5,  // 5 coins per follower
    comment: 3,   // 3 coins per comment
    view: 1       // 1 coin per view
  };

  // Register User
  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Registration successful! Please login.');
        setScreen('Login');
      } else {
        Alert.alert('Error', data.error || 'Registration failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    }
    setLoading(false);
  };

  // Login User
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUserId(data.userId);
        setCoins(data.coins);
        setScreen('Home');
      } else {
        Alert.alert('Error', data.error || 'Login failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    }
    setLoading(false);
  };

  // Watch Ad Mock & Add Coins
  const handleWatchAd = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/add-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coinAmount: adCoinsReward })
      });
      const data = await res.json();
      if (res.ok) {
        setCoins(data.currentCoins);
        Alert.alert('Reward', `You watched an ad and earned ${adCoinsReward} coins!`);
        setScreen('Home');
      } else {
        Alert.alert('Error', data.error || 'Failed to add coins');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    }
    setLoading(false);
  };

  // Add Insta Account
  const handleAddInsta = async () => {
    if (!instaUser || !instaPass) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/add-insta-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username: instaUser, password: instaPass })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Instagram Account added to pool!');
        setInstaUser('');
        setInstaPass('');
        setScreen('Home');
      } else {
        Alert.alert('Error', data.error || 'Failed to add account');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    }
    setLoading(false);
  };

  // Create Order
  const handleCreateOrder = async () => {
    const qtyNum = parseInt(quantity);
    if (!targetUrl || isNaN(qtyNum) || qtyNum <= 0) {
      Alert.alert('Error', 'Please enter a valid URL and Quantity');
      return;
    }
    const cost = qtyNum * coinCostPerItem[orderType];
    if (coins < cost) {
      Alert.alert('Error', `Insufficient coins! You need ${cost} coins.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, targetUrl, type: orderType, quantity: qtyNum, coinCost: cost })
      });
      const data = await res.json();
      if (res.ok) {
        setCoins(data.currentCoins);
        Alert.alert('Success', 'Order placed successfully!');
        setTargetUrl('');
        setQuantity('');
        setScreen('Home');
      } else {
        Alert.alert('Error', data.error || 'Failed to place order');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    }
    setLoading(false);
  };

  // Fetch My Orders
  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/my-orders/${userId}`);
      const data = await res.json();
      if (res.ok) {
        setOrderList(data);
        setScreen('MyOrders');
      } else {
        Alert.alert('Error', 'Failed to fetch orders');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>IG SERVICES</Text>
        {userId && <Text style={styles.coinBadge}>🪙 {coins} Coins</Text>}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}

      {/* 1. Login Screen */}
      {screen === 'Login' && (
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            value={password} 
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('Register')}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. Register Screen */}
      {screen === 'Register' && (
        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            value={password} 
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister}>
            <Text style={styles.btnText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('Login')}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Dashboard / Home Screen */}
      {screen === 'Home' && (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Welcome back!</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => setScreen('Earn')}>
            <Text style={styles.menuText}>📺 Earn Free Coins (Watch Ads)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setScreen('AddAccount')}>
            <Text style={styles.menuText}>🔑 Add Fake Instagram Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setScreen('Order')}>
            <Text style={styles.menuText}>🚀 Place Likes/Followers Order</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={fetchMyOrders}>
            <Text style={styles.menuText}>📊 Check My Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnDanger} onPress={() => {setUserId(null); setScreen('Login');}}>
            <Text style={styles.btnText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* 4. Earn Coins */}
      {screen === 'Earn' && (
        <View style={styles.card}>
          <Text style={styles.title}>Earn Coins</Text>
          <Text style={styles.subtitle}>Watch 1 Video Ad to earn {adCoinsReward} coins</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleWatchAd}>
            <Text style={styles.btnText}>📺 Watch Video Ad</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => setScreen('Home')}>
            <Text style={styles.btnTextSecondary}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 5. Add Fake Insta Account */}
      {screen === 'AddAccount' && (
        <View style={styles.card}>
          <Text style={styles.title}>Add Fake ID</Text>
          <Text style={styles.subtitle}>Add a fake Instagram account. It will be used automatically to follow/like others to earn coins.</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Instagram Username" 
            value={instaUser} 
            onChangeText={setInstaUser}
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Instagram Password" 
            value={instaPass} 
            onChangeText={setInstaPass}
            secureTextEntry
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={handleAddInsta}>
            <Text style={styles.btnText}>Submit Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => setScreen('Home')}>
            <Text style={styles.btnTextSecondary}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 6. Place Order Screen */}
      {screen === 'Order' && (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Place Order</Text>
          
          <Text style={styles.label}>Select Service Type:</Text>
          <View style={styles.selectorRow}>
            {['like', 'follower', 'comment', 'view'].map((item) => (
              <TouchableOpacity 
                key={item} 
                style={[styles.selectorBtn, orderType === item && styles.selectorActive]}
                onPress={() => setOrderType(item)}
              >
                <Text style={[styles.selectorText, orderType === item && styles.selectorTextActive]}>
                  {item.toUpperCase()}{'\n'}({coinCostPerItem[item]}🪙)
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput 
            style={styles.input} 
            placeholder="Instagram Post or Profile Link" 
            value={targetUrl} 
            onChangeText={setTargetUrl}
            autoCapitalize="none"
          />

          <TextInput 
            style={styles.input} 
            placeholder="Quantity" 
            value={quantity} 
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          {quantity !== '' && (
            <Text style={styles.costText}>
              Total Cost: {parseInt(quantity) * coinCostPerItem[orderType] || 0} Coins
            </Text>
          )}

          <TouchableOpacity style={styles.btnPrimary} onPress={handleCreateOrder}>
            <Text style={styles.btnText}>Submit Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.btnSecondary} onPress={() => setScreen('Home')}>
            <Text style={styles.btnTextSecondary}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* 7. My Orders Screen */}
      {screen === 'MyOrders' && (
        <View style={{ flex: 1, width: '100%' }}>
          <Text style={styles.title}>Order History</Text>
          <ScrollView style={styles.orderScroll}>
            {orderList.length === 0 ? (
              <Text style={styles.noOrdersText}>No orders placed yet.</Text>
            ) : (
              orderList.map((ord) => (
                <View key={ord._id} style={styles.orderCard}>
                  <Text style={styles.orderCardType}>{ord.type.toUpperCase()} ORDER</Text>
                  <Text style={styles.orderCardUrl} numberOfLines={1}>{ord.targetUrl}</Text>
                  <View style={styles.orderCardDetails}>
                    <Text>Requested: {ord.quantityRequested}</Text>
                    <Text>Completed: {ord.quantityCompleted}</Text>
                  </View>
                  <Text style={[styles.statusBadge, { color: ord.status === 'Completed' ? '#10B981' : '#F59E0B' }]}>
                    Status: {ord.status}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => setScreen('Home')}>
            <Text style={styles.btnTextSecondary}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20
  },
  loadingContainer: {
    position: 'absolute',
    zIndex: 99,
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 15
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827'
  },
  coinBadge: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706'
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  scrollContainer: {
    width: '100%',
    paddingBottom: 40
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827'
  },
  btnPrimary: {
    width: '100%',
    height: 50,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  btnSecondary: {
    width: '100%',
    height: 50,
    borderColor: '#4F46E5',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  btnTextSecondary: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600'
  },
  btnDanger: {
    width: '100%',
    height: 50,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30
  },
  linkText: {
    color: '#4F46E5',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8
  },
  menuItem: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151'
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  selectorBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    marginHorizontal: 3,
    alignItems: 'center'
  },
  selectorActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5'
  },
  selectorText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4B5563',
    textAlign: 'center'
  },
  selectorTextActive: {
    color: '#4F46E5'
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: 16
  },
  orderScroll: {
    flex: 1,
    width: '100%',
    marginBottom: 16
  },
  noOrdersText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 40
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  orderCardType: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4F46E5'
  },
  orderCardUrl: {
    fontSize: 13,
    color: '#6B7280',
    marginVertical: 4
  },
  orderCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  }
});
