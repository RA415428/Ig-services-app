import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Clipboard
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; 

const API_URL = 'https://ig-services-rdeu.onrender.com/api';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState('Login'); // Login, Register, Tags, Home, Coins, Settings, MyOrders
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const [coins, setCoins] = useState(1); 
  const [loading, setLoading] = useState(false);

  // Forms States
  const [instaUser, setInstaUser] = useState('');
  const [instaPass, setInstaPass] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [orderType, setOrderType] = useState('like'); 
  const [quantity, setQuantity] = useState('');
  const [orderList, setOrderList] = useState([]);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const coinCostPerItem = { like: 2, follower: 5, comment: 3, view: 1 };

  // Navigation Helpers
  const activeColor = '#FF5C7E'; 
  const inactiveColor = '#94A3B8';
  const isTags = screen === 'Tags';
  const isHome = screen === 'Home';
  const isCoins = screen === 'Coins';
  const isSettings = screen === 'Settings' || screen === 'MyOrders';

  // Internet Connection Check & Splash Logic
  const checkInternet = async () => {
    try {
      const response = await fetch('https://clients3.google.com/generate_204', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.ok || response.status === 204) {
        setTimeout(() => {
          setShowSplash(false);
        }, 1000);
      } else {
        showNoInternetAlert();
      }
    } catch (err) {
      showNoInternetAlert();
    }
  };

  const showNoInternetAlert = () => {
    Alert.alert(
      'Connection Error',
      'No Internet connection found. Please check your network and try again.',
      [{ text: 'Retry', onPress: () => checkInternet() }]
    );
  };

  useEffect(() => {
    checkInternet();
  }, []);

  // Trending Hashtags Data
  const hashtagData = {
    "Art": "#art #artist #drawing #painting #illustration #artwork",
    "Fashion": "#fashion #ootd #style #instafashion #fashionblogger",
    "Fitness": "#fitness #gym #workout #fit #motivation #bodybuilding",
    "Food": "#food #foodporn #yummy #instafood #delicious #foodie",
    "Instagram Growth": "#instagrowth #socialmedia #growthhacking #marketing",
    "Marketing": "#marketing #digitalmarketing #business #branding #seo",
    "Motivation": "#motivation #quotes #inspiration #success #mindset",
    "Photography": "#photography #photooftheday #nature #portrait #travel",
    "Technology": "#tech #technology #innovation #coding #gadgets #software"
  };

  const coinPackages = [
    { qty: 100, price: '₹30.00', value: 100 },
    { qty: 500, price: '₹130.00', value: 500 },
    { qty: 1000, price: '₹290.00', value: 1000 },
    { qty: 2000, price: '₹590.00', value: 2000 },
    { qty: 5000, price: '₹1,500.00', value: 5000 },
    { qty: 10000, price: '₹3,000.00', value: 10000 }
  ];

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
        setScreen('Tags'); 
      } else {
        Alert.alert('Error', data.error || 'Login failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    }
    setLoading(false);
  };

  // Daily Bonus (Claim 10 Coins)
  const handleDailyBonus = async () => {
    if (dailyBonusClaimed) {
      Alert.alert('Info', 'Daily bonus already claimed!');
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
        Alert.alert('🎁 Bonus', '10 Coins added successfully!');
      } else {
        Alert.alert('Error', 'Failed to add bonus coins');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    }
    setLoading(false);
  };

  // Watch Ad (Watch Now Button)
  const handleWatchAd = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/add-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coinAmount: 15 }) 
      });
      const data = await res.json();
      if (res.ok) {
        setCoins(data.currentCoins);
        Alert.alert('Success', 'Ad watched successfully! 15 coins added.');
      } else {
        Alert.alert('Error', 'Failed to add coins');
      }
    } catch (err) {
      Alert.alert('Error', 'Server connection failed');
    }
    setLoading(false);
  };

  // Buy Coins Package
  const handleBuyPackage = async (qty, price) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/add-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, coinAmount: qty }) 
      });
      const data = await res.json();
      if (res.ok) {
        setCoins(data.currentCoins);
        Alert.alert('Success', `Purchase of ${qty} Coins for ${price} simulated successfully!`);
      } else {
        Alert.alert('Error', 'Transaction failed');
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
        setScreen('Tags');
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

  // Copy Member ID
  const handleCopyId = () => {
    const shortId = userId ? userId.substring(userId.length - 5) : '00000';
    Clipboard.setString(shortId);
    Alert.alert('Copied', `Member ID #${shortId} copied to clipboard!`);
  };

  // Toggle Hashtag
  const toggleHashtag = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Splash Screen Layout (Sox Follow Launch Screen with rocket)
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar style="light" />
        <View style={styles.splashHalo}>
          <Ionicons name="rocket-sharp" size={70} color="#FF5C7E" />
        </View>
        <Text style={styles.splashTitle}>SOX FOLLOW</Text>
        <ActivityIndicator size="small" color="#FF5C7E" style={{ marginTop: 30 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5C7E" />
        </View>
      )}

      {/* Main Header */}
      {userId && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {screen === 'Tags' ? 'Dashboard' : screen === 'Coins' ? 'Store' : screen}
          </Text>
          <View style={styles.coinBadgeContainer}>
            <Text style={styles.coinBadgeText}>🪙 {coins}</Text>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.mainScroll}>
        {/* 1. Login Screen */}
        {screen === 'Login' && (
          <View style={styles.authContainer}>
            <View style={styles.authLogoCircle}>
              <Ionicons name="rocket-sharp" size={45} color="#FF5C7E" />
            </View>
            <Text style={styles.authTitle}>SOX FOLLOW</Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Username / Email" 
              placeholderTextColor="#64748B"
              value={email} 
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor="#64748B"
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
            <View style={styles.authLogoCircle}>
              <Ionicons name="rocket-sharp" size={45} color="#FF5C7E" />
            </View>
            <Text style={styles.authTitle}>Create Account</Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              placeholderTextColor="#64748B"
              value={email} 
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Password" 
              placeholderTextColor="#64748B"
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

        {/* 3. Tags Screen (Dashboard) */}
        {screen === 'Tags' && (
          <View style={styles.innerContainer}>
            {/* Member ID Card */}
            <View style={styles.memberCard}>
              <View style={styles.memberLeft}>
                <View style={styles.verifiedCircle}>
                  <Ionicons name="shield-checkmark" size={16} color="#4F46E5" />
                </View>
                <View>
                  <Text style={styles.memberSub}>WELCOME BACK</Text>
                  <Text style={styles.memberTitle}>
                    Member #{userId ? userId.substring(userId.length - 5) : '00000'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.btnCopy} onPress={handleCopyId}>
                <Ionicons name="copy-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.btnCopyText}>Copy ID</Text>
              </TouchableOpacity>
            </View>

            {/* Watch Ads Card */}
            <View style={styles.adCard}>
              <Text style={styles.adCardTitle}>Watch Ads to Earn Coins</Text>
              <Text style={styles.adCardSub}>Claim up to 12 rewards daily!</Text>
              <Text style={styles.adCardProgress}>Daily Progress: 1 / 12</Text>
              
              <TouchableOpacity style={styles.btnWatchNow} onPress={handleWatchAd}>
                <Ionicons name="play" size={14} color="#4F46E5" style={{ marginRight: 6 }} />
                <Text style={styles.btnWatchNowText}>Watch Now</Text>
              </TouchableOpacity>
            </View>

            {/* Trending Hashtags Header */}
            <Text style={styles.sectionHeader}>Trending Hashtags</Text>

            {/* Collapsible Hashtags List */}
            {Object.keys(hashtagData).map((section) => (
              <View key={section} style={styles.hashtagWrapper}>
                <TouchableOpacity style={styles.hashtagRow} onPress={() => toggleHashtag(section)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.hashtagIconBox}>
                      <Text style={{ fontSize: 13, color: '#FF5C7E', fontWeight: 'bold' }}>#</Text>
                    </View>
                    <Text style={styles.hashtagRowText}>{section}</Text>
                  </View>
                  <Ionicons 
                    name={expandedSection === section ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#64748B" 
                  />
                </TouchableOpacity>

                {expandedSection === section && (
                  <View style={styles.hashtagDetailBox}>
                    <Text style={styles.hashtagDetailText}>{hashtagData[section]}</Text>
                    <TouchableOpacity 
                      style={styles.btnCopyTags} 
                      onPress={() => {
                        Clipboard.setString(hashtagData[section]);
                        Alert.alert('Copied', 'Hashtags copied to clipboard!');
                      }}
                    >
                      <Text style={styles.btnCopyTagsText}>Copy Hashtags</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 4. Home Screen (Place Order Form) */}
        {screen === 'Home' && (
          <View style={styles.innerContainer}>
            <Text style={styles.fieldLabel}>Welcome</Text>
            {/* Custom Select Box */}
            <View style={styles.customSelectRow}>
              {['like', 'follower', 'comment', 'view'].map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.selectorBtn, orderType === item && styles.selectorActive]}
                  onPress={() => setOrderType(item)}
                >
                  <Text style={[styles.selectorText, orderType === item && styles.selectorTextActive]}>
                    {item.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Paste</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Type / Paste Link Here" 
              placeholderTextColor="#64748B"
              value={targetUrl} 
              onChangeText={setTargetUrl}
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>Quantity</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Min: 10, Max: 10000" 
              placeholderTextColor="#64748B"
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
              <Text style={styles.btnText}>PLACE ORDER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnBorderOrange} onPress={() => setScreen('Coins')}>
              <Text style={styles.btnBorderOrangeText}>BUY COINS</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. Coins Screen (Store Package List) */}
        {screen === 'Coins' && (
          <View style={styles.innerContainer}>
            {/* Help & Support Card */}
            <View style={styles.supportCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.supportIconCircle}>
                  <Ionicons name="help-circle-outline" size={18} color="#4F46E5" />
                </View>
                <View>
                  <Text style={styles.supportTitle}>Help & Support</Text>
                  <Text style={styles.supportSub}>Need assistance with coins?</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.btnSupportContact} onPress={() => Alert.alert('Contact', 'Contact admin at support@igservices.com')}>
                <Text style={styles.btnSupportContactText}>Contact</Text>
              </TouchableOpacity>
            </View>

            {/* Monthly subscription card */}
            <View style={styles.subCard}>
              <Ionicons name="logo-usd" size={30} color="#FBBF24" style={{ marginBottom: 8 }} />
              <Text style={styles.subCardTitle}>100 COINS</Text>
              <Text style={styles.subCardPrice}>₹30.00 / Month</Text>
              
              <TouchableOpacity style={styles.btnPrimary} onPress={() => handleBuyPackage(100, '₹30.00')}>
                <Text style={styles.btnText}>Buy Now</Text>
              </TouchableOpacity>
              <Text style={styles.subCardDetail}>Subscription auto-renews monthly. Manage or cancel anytime.</Text>
            </View>

            <Text style={styles.sectionHeader}>Buy Coins</Text>

            {/* Coins Gr
