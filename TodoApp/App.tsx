import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { logout, restoreSession } from './src/store/authSlice';
import { setUnauthorizedHandler } from './src/api/client';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    // Log out automatically if the server ever rejects our token (expired / revoked).
    setUnauthorizedHandler(() => store.dispatch(logout()));
    // Try to sign in with a token saved from the last session.
    store.dispatch(restoreSession());
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
