// __tests__/events.test.js

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';
import { EventsContext } from '../App';

// Mock react-native-maps to avoid rendering real maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockMapView = (props) => <View {...props} testID="mockMap">{props.children}</View>;
  const MockMarker = (props) => <View {...props} testID="mockMarker" />;
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

describe('Event Map App', () => {
  it('renders main screen with map and markers', async () => {
    const { getByText, getAllByTestId } = render(<App />);

    // Wait for the map to render markers
    const markers = await waitFor(() => getAllByTestId('mockMarker'));
    expect(markers.length).toBeGreaterThan(0);

    // Check bottom label
    expect(getByText(/Events:/)).toBeTruthy();
  });

  it('navigates to event details when marker is pressed', async () => {
    const { getAllByTestId, getByText } = render(<App />);
    const markers = await waitFor(() => getAllByTestId('mockMarker'));

    // Simulate marker press
    fireEvent.press(markers[0]);

    // Check event title in details screen
    await waitFor(() => {
      expect(getByText(/Park Clean-up|Food Bank Sorting|Community Garden/)).toBeTruthy();
    });
  });

  it('applies and unapplies a volunteer', async () => {
    const { getAllByTestId, getByText } = render(<App />);
    const markers = await waitFor(() => getAllByTestId('mockMarker'));

    // Go to first event
    fireEvent.press(markers[0]);

    // Find volunteer button (if event not full/applied)
    const volunteerButton = await waitFor(() => getByText('Volunteer'));
    expect(volunteerButton).toBeTruthy();

    // Apply
    fireEvent.press(volunteerButton);
    await waitFor(() => getByText('Unapplied')); // Alert triggered

    // Unapply
    fireEvent.press(volunteerButton);
    await waitFor(() => getByText('Applied')); // Alert triggered
  });

  it('renders contact buttons for applied users', async () => {
    const { getAllByTestId, getByText } = render(<App />);
    const markers = await waitFor(() => getAllByTestId('mockMarker'));

    // Select event with currentUser already applied (Food Bank Sorting)
    const appliedEventMarker = markers.find((m) => m.props.title === 'Food Bank Sorting');
    fireEvent.press(appliedEventMarker);

    // Contact buttons should appear
    await waitFor(() => {
      expect(getByText('Call')).toBeTruthy();
      expect(getByText('Text')).toBeTruthy();
    });
  });
});
