import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WEB_URL = 'https://infastproject.uz/auth';

// Web uchun iframe, Native uchun WebView
const WebAppScreen = () => {
  const [loading, setLoading] = useState(true);

  // Web platform - iframe ishlatamiz
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}
        <iframe
          src={WEB_URL}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          onLoad={() => setLoading(false)}
          allow="geolocation; microphone; camera"
        />
      </View>
    );
  }

  // Native platforms - WebView ishlatamiz
  const WebView = require('react-native-webview').WebView;
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  const injectedJavaScript = `
    (function() {
      document.body.style.overflowX = 'hidden';
      document.body.style.webkitTouchCallout = 'none';
      true;
    })();
  `;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  },
});

export default WebAppScreen;
