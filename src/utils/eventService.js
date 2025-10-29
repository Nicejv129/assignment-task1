import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const EVENTS_API = 'https://example.com/api/events'; // your endpoint

export async function fetchEventsWithCache() {
  try {
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      const response = await fetch(EVENTS_API);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      await AsyncStorage.setItem('@events_cache', JSON.stringify(data));
      return data;
    } else {
      const cached = await AsyncStorage.getItem('@events_cache');
      return cached ? JSON.parse(cached) : [];
    }
  } catch (err) {
    console.error('Fetch error:', err);
    const cached = await AsyncStorage.getItem('@events_cache');
    return cached ? JSON.parse(cached) : [];
  }
}
