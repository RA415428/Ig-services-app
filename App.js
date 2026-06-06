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
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState('Login'); // Login, Register, Home, Earn, DailyBonus, Settings, MyOrders, Order
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);

  // Forms States
  const [instaUser, setInstaUser] = useState('');
  const [instaPass, setInstaPass] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [orderType, setOrderType] = useState('like'); 
  const [quantity, setQuantity] = useState('');
  const [orderList, setOrderList] = useState([]);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);

  const coinCostPerItem = { like: 2, follower: 5, comment: 3, view: 1 };

  // Navigation Helpers
  const activeColor = '#E1306C';
  const inactiveColor = '#94A3B8';
  const isHome = screen === 'Home';
  const isEarn = screen === 'Earn';
  const isBonus = screen === 'DailyBonus';
  const isSettings = screen === 'Settings' || screen === 'MyOrders';

  // Splash Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); 
    return () => clearTimeout(timer);
  }, []);

  // Register
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

  // Login
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

  // Daily Bonus
  const handleDailyBonus = async () => {
    if (dailyBonusClaimed) {
      Alert.alert('Info', 'Already claimed today!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/add-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coinAmount: 10 })
      });
      const data = await res.json();
      if (res.ok) {
        setCoins(data.currentCoins);
        setDailyBonusClaimed(true);
        Alert.alert('Success', '10 Daily Bonus Coins added!');
      } else {
        Alert.alert('Error', 'Failed to add bonus coins');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    }
    setLoading(false);
  };

  // Watch Ad
  const handleWatchAd = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/add-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coinAmount: 10 }) 
      });
      const data = await res.json();
      if (res.ok) {
        setCoins(data.currentCoins);
        Alert.alert('Success', 'Ad watched! 10 coins added.');
      } else {
        Alert.alert('Error', 'Failed to add coins');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    }
    setLoading(false);
  };

  // Add Fake ID
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
        Alert.alert('Success', 'Instagram ID added successfully!');
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
      Alert.alert('Error', 'Please enter valid URL and Quantity');
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

  // Splash Screen Layout
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="light" />
        <View style={styles.splashLogoCircle}>
          <Text style={{ fontSize: 40 }}>📸</Text>
        </View>
        <Text style={styles.splashText}>IG SERVICES</Text>
        <Text style={styles.splashSub}>Premium Instagram Booster</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E1306C" />
        </View>
      )}

      {/* Main Header */}
      {userId && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>IG SERVICES</Text>
          <Text style={styles.coinBadge}>🪙 {coins} Coins</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.mainScroll}>
        {/* 1. Login Screen */}
        {screen === 'Login' && (
          <View style={styles.authContainer}>
            <View style={[styles.iconCircle, { width: 80, height: 80, borderRadius: 40, marginBottom: 20 }]}>
              <Text style={{ fontSize: 40 }}>📸</Text>
            </View>
            <Text style={styles.authTitle}>Instagram Services</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Username / Email" 
              placeholderTextColor="#9CA3AF"
              value={email} 
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor="#9CA3AF"
              value={password} 
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
              <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreen('Register')}>
              <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. Register Screen */}
        {screen === 'Register' && (
          <View style={styles.authContainer}>
            <View style={[styles.iconCircle, { width: 80, height: 80, borderRadius: 40, marginBottom: 20 }]}>
              <Text style={{ fontSize: 40 }}>📸</Text>
            </View>
            <Text style={styles.authTitle}>Create Account</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              placeholderTextColor="#9CA3AF"
              value={email} 
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor="#9CA3AF"
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

        {/* 3. Home Screen */}
        {screen === 'Home' && (
          <View style={styles.innerContainer}>
            <TouchableOpacity style={styles.serviceCard} onPress={() => setScreen('Order')}>
              <View style={styles.serviceCardHeader}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>🚀</Text>
                </View>
                <Text style={styles.serviceCardTitle}>Place Boost Order</Text>
              </View>
              <Text style={styles.serviceCardSub}>Get Real Likes, Followers, Comments & Views</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceCard} onPress={() => setScreen('AddAccount')}>
              <View style={styles.serviceCardHeader}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>🔑</Text>
                </View>
                <Text style={styles.serviceCardTitle}>Link Fake Instagram ID</Text>
              </View>
              <Text style={styles.serviceCardSub}>Link accounts to automatically complete exchange orders</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Earn Screen */}
        {screen === 'Earn' && (
          <View style={styles.innerContainer}>
            <Text style={styles.pageTitle}>Earn Coins</Text>
            <Text style={styles.pageSubtitle}>Watch visual video ads to claim free coin rewards.</Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleWatchAd}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconCircle, { width: 30, height: 30, borderRadius: 15, marginRight: 8, borderColor: '#FFFFFF' }]}>
                  <Text style={{ fontSize: 14 }}>📺</Text>
                </View>
                <Text style={styles.btnText}>Watch Video Ad</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. Daily Bonus Screen */}
        {screen === 'DailyBonus' && (
          <View style={styles.innerContainer}>
            <Text style={styles.pageTitle}>Daily Bonus</Text>
            <Text style={styles.pageSubtitle}>Claim your daily reward of 10 coins once every 24 hours.</Text>
            <TouchableOpacity 
              style={[styles.btnPrimary, dailyBonusClaimed && { backgroundColor: '#4B5563' }]} 
              onPress={handleDailyBonus}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconCircle, { width: 30, height: 30, borderRadius: 15, marginRight: 8, borderColor: '#FFFFFF' }]}>
                  <Text style={{ fontSize: 14 }}>🎁</Text>
                </View>
                <Text style={styles.btnText}>{dailyBonusClaimed ? 'Claimed Today' : 'Claim 10 Coins'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 6. Settings Screen */}
        {screen === 'Settings' && (
          <View style={styles.innerContainer}>
            <Text style={styles.pageTitle}>Settings</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={fetchMyOrders}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>📊</Text>
                </View>
                <Text style={styles.settingItemText}>My Orders History</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Stats', `Total Orders: ${orderList.length}`)}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>📈</Text>
                </View>
                <Text style={styles.settingItemText}>Check Total Orders Count</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnDanger} onPress={() => {setUserId(null); setScreen('Login');}}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconCircle, { width: 30, height: 30, borderRadius: 15, marginRight: 8, borderColor: '#FFFFFF' }]}>
                  <Text style={{ fontSize: 14 }}>🚪</Text>
                </View>
                <Text style={styles.btnText}>Logout Account</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 7. Create Order Form */}
        {screen === 'Order' && (
          <View style={styles.innerContainer}>
            <Text style={styles.pageTitle}>New Order</Text>
            <View style={styles.selectorRow}>
              {['like', 'follower', 'comment', 'view'].map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.selectorBtn, orderType === item && styles.selectorActive]}
                  onPress={() => setOrderType(item)}
                >
                  <Text style={[styles.selectorText, orderType === item && styles.selectorTextActive]}>
                    {item.toUpperCase()} ({coinCostPerItem[item]}🪙)
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput 
              style={styles.input} 
              placeholder="Instagram Link" 
              placeholderTextColor="#9CA3AF"
              value={targetUrl} 
              onChangeText={setTargetUrl}
              autoCapitalize="none"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Quantity" 
              placeholderTextColor="#9CA3AF"
              value={quantity} 
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            {quantity !== '' && (
              <Text style={styles.costText}>
                Cost: {parseInt(quantity) * coinCostPerItem[orderType] || 0} Coins
              </Text>
            )}
            <TouchableOpacity style={styles.btnPrimary} onPress={handleCreateOrder}>
              <Text style={styles.btnText}>Submit Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setScreen('Home')}>
              <Text style={styles.btnTextSecondary}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 8. My Orders Screen */}
        {screen === 'MyOrders' && (
          <View style={styles.innerContainer}>
            <Text style={styles.pageTitle}>My Orders</Text>
            <ScrollView style={{ width: '100%', maxHeight: 350 }}>
              {orderList.length === 0 ? (
                <Text style={styles.noOrders}>No orders placed yet.</Text>
              ) : (
                orderList.map((ord) => (
                  <View key={ord._id} style={styles.orderCard}>
                    <Text style={styles.orderCardType}>{ord.type.toUpperCase()}</Text>
                    <Text style={styles.orderCardUrl} numberOfLines={1}>{ord.targetUrl}</Text>
                    <Text style={styles.orderCardStatus}>Status: {ord.status}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setScreen('Settings')}>
              <Text style={styles.btnTextSecondary}>Back to Settings</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 9. Add Fake Account */}
        {screen === 'AddAccount' && (
          <View style={styles.innerContainer}>
            <Text style={styles.pageTitle}>Link Fake ID</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Fake Username" 
              placeholderTextColor="#9CA3AF"
              value={instaUser} 
              onChangeText={setInstaUser}
              autoCapitalize="none"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Fake Password" 
              placeholderTextColor="#9CA3AF"
              value={instaPass} 
              onChangeText={setInstaPass}
              secureTextEntry
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={handleAddInsta}>
              <Text style={styles.btnText}>Submit Fake ID</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setScreen('Home')}>
              <Text style={styles.btnTextSecondary}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      {userId && (
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem} onPress={() => setScreen('Home')}>
            <View style={[styles.navIconCircle, isHome && styles.navIconCircleActive]}>
              <Text style={styles.navIconText}>🏠</Text>
            </View>
            <Text style={[styles.navText, isHome && styles.navActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setScreen('Earn')}>
            <View style={[styles.navIconCircle, isEarn && styles.navIconCircleActive]}>
              <Text style={styles.navIconText}>📺</Text>
            </View>
            <Text style={[styles.navText, isEarn && styles.navActive]
