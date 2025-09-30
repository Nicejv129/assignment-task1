import React, { useRef, useState, useContext, createContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// ---------- Mock data and context ----------
const currentUser = { id: 'user-1', name: 'Alice' };

const initialEvents = [
  {
    id: 'e1',
    title: 'Park Clean-up',
    description: 'Help clean the neighbourhood park',
    coordinate: { latitude: 51.0447, longitude: -114.0719 },
    required: 5,
    volunteers: ['user-2'],
    contact: { phone: '+11234567890' }
  },
  {
    id: 'e2',
    title: 'Food Bank Sorting',
    description: 'Sort donated food',
    coordinate: { latitude: 51.0486, longitude: -114.0708 },
    required: 3,
    volunteers: ['user-1','user-3'],
    contact: { phone: '+19876543210' }
  },
  {
    id: 'e3',
    title: 'Community Garden',
    description: 'Plant seedlings',
    coordinate: { latitude: 51.0500, longitude: -114.0620 },
    required: 4,
    volunteers: [],
    contact: { phone: '+10123456789' }
  }
];

const EventsContext = createContext();

function EventsProvider({ children }) {
  const [events, setEvents] = useState(initialEvents);

  const toggleVolunteer = (eventId, userId) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      const has = ev.volunteers.includes(userId);
      return {
        ...ev,
        volunteers: has ? ev.volunteers.filter(id => id !== userId) : [...ev.volunteers, userId]
      };
    }));
  };

  return (
    <EventsContext.Provider value={{ events, setEvents, toggleVolunteer, currentUser }}>
      {children}
    </EventsContext.Provider>
  );
}

// ---------- Screens ----------
function MainScreen({ navigation }) {
  const { events, currentUser } = useContext(EventsContext);
  const mapRef = useRef(null);

  // Mock user location (in a real app you'd request permission and watch position)
  const userLocation = { latitude: 51.046, longitude: -114.070, latitudeDelta: 0.01, longitudeDelta: 0.01 };

  // Fit map to markers + user location whenever screen is focused or events change
  useFocusEffect(
    React.useCallback(() => {
      fitMap();
    }, [events])
  );

  const fitMap = () => {
    if (!mapRef.current || events.length === 0) return;
    const coords = events.map(e => e.coordinate);
    coords.push({ latitude: userLocation.latitude, longitude: userLocation.longitude });
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 40, bottom: 180, left: 40 },
      animated: true,
    });
  };

  const onMarkerPress = (event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  // Determine bottom label based on event states
  const total = events.length;
  const appliedCount = events.filter(e => e.volunteers.includes(currentUser.id)).length;
  const fullCount = events.filter(e => e.volunteers.length >= e.required).length;

  const bottomLabel = `Events: ${total} · Applied: ${appliedCount} · Full: ${fullCount}`;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        ref={mapRef}
        initialRegion={userLocation}
        showsUserLocation={true}
      >
        {events.map(ev => {
          const isFull = ev.volunteers.length >= ev.required;
          const isApplied = ev.volunteers.includes(currentUser.id);
          // marker color variation based on state
          const pinColor = isApplied ? 'green' : isFull ? 'gray' : 'red';
          return (
            <Marker
              key={ev.id}
              coordinate={ev.coordinate}
              title={ev.title}
              description={ev.description}
              pinColor={pinColor}
              onPress={() => onMarkerPress(ev)}
            />
          );
        })}
      </MapView>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomLabel}>{bottomLabel}</Text>
      </View>

      <TouchableOpacity
        style={styles.centerButton}
        onPress={() => fitMap()}
      >
        <Text style={{ color: '#fff' }}>Recenter</Text>
      </TouchableOpacity>
    </View>
  );
}

function EventDetails({ route, navigation }) {
  const { eventId } = route.params;
  const { events, toggleVolunteer, currentUser } = useContext(EventsContext);
  const event = events.find(e => e.id === eventId);

  if (!event) return (
    <View style={styles.center}><Text>Event not found</Text></View>
  );

  const isApplied = event.volunteers.includes(currentUser.id);
  const isFull = event.volunteers.length >= event.required;

  // Dynamic status box text
  let statusText = '';
  if (isApplied) statusText = 'Volunteered';
  else if (isFull) statusText = 'Team is full';
  else statusText = `${event.volunteers.length} of ${event.required} volunteers`;

  const onVolunteerPress = () => {
    if (isFull) return;
    toggleVolunteer(event.id, currentUser.id);
    Alert.alert(isApplied ? 'Unapplied' : 'Applied', isApplied ? 'You left the event.' : 'You applied to this event.');
  };

  const onCall = () => {
    // On a real device you'd use Linking.openURL('tel:...')
    Alert.alert('Call', `Would call ${event.contact.phone}`);
  };

  const onText = () => {
    // In real app: Linking.openURL('sms:...')
    Alert.alert('Text', `Would text ${event.contact.phone}`);
  };

  const onShare = () => {
    Alert.alert('Share', `Share event: ${event.title}`);
  };

  return (
    <View style={styles.detailsContainer}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description}>{event.description}</Text>

      <View style={[styles.statusBox, isApplied ? styles.statusApplied : isFull ? styles.statusFull : styles.statusOpen]}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      <View style={styles.buttonRow}>
        {/* Contact buttons - only for applied users */}
        {isApplied && (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={onCall}><Text>Call</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onText}><Text>Text</Text></TouchableOpacity>
          </>
        )}

        {/* Volunteer button - only when not full and not applied */}
        {!isFull && !isApplied && (
          <TouchableOpacity style={[styles.primaryButton]} onPress={onVolunteerPress}><Text style={{ color: '#fff' }}>Volunteer</Text></TouchableOpacity>
        )}

        {/* Share button - when not full or when the user has applied */}
        {(!isFull || isApplied) && (
          <TouchableOpacity style={styles.actionButton} onPress={onShare}><Text>Share</Text></TouchableOpacity>
        )}
      </View>

    </View>
  );
}

// ---------- Navigation ----------
const Stack = createStackNavigator();

export default function App() {
  return (
    <EventsProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Main" component={MainScreen} options={{ title: 'Events Map' }} />
          <Stack.Screen name="EventDetails" component={EventDetails} options={{ title: 'Event Details' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </EventsProvider>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  bottomBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center'
  },
  bottomLabel: { fontSize: 14 },
  centerButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 8
  },
  detailsContainer: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 16 },
  statusBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  statusText: { fontWeight: '600' },
  statusApplied: { backgroundColor: '#dff0d8' },
  statusFull: { backgroundColor: '#f0f0f0' },
  statusOpen: { backgroundColor: '#fff4e5' },
  buttonRow: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  actionButton: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginRight: 8 },
  primaryButton: { padding: 10, borderRadius: 8, backgroundColor: '#28a745', marginRight: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
