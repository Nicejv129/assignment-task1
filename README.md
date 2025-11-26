# Assignment Task 1 – Event Map Volunteer App

This project is a React Native / Expo application that displays community events on a map and lets users view details and apply as volunteers. It demonstrates problem‑solving skills, state management, offline caching, and automated testing for a mobile app.

## Features

- Shows a map with markers for multiple community events.
- Taps on a marker navigate to an event details screen.
- Users can apply or unapply as volunteers for an event.
- Shows contact options (Call / Text) for events where the current user is already a volunteer.
- Fetches events from a remote API with offline caching in async storage.
- Basic Jest test suite using React Native Testing Library.

## Technology Stack

- **Runtime / Framework**: React Native, Expo
- **Language**: JavaScript / TypeScript tooling
- **Navigation**: `@react-navigation/native`, `@react-navigation/stack`
- **State / Storage**: `@react-native-async-storage/async-storage`
- **Networking / Connectivity**: `fetch`, `@react-native-community/netinfo`
- **Testing**: Jest, `@testing-library/react-native`, `@testing-library/jest-native`
- **Misc**: `react-native-maps`, UUID, and other typical Expo RN dependencies

## Project Structure

- `src/utils/eventService.js` – Fetches events from the API and manages local cache using AsyncStorage and NetInfo.
- `__tests__/events.test.js` – Integration-style tests for the main event map flow.
- `__mocks__/fileMock.js` – Jest mock for static file imports.
- `jest.config.js` – Jest configuration for React Native and asset mapping.
- `package.json` / `yarn.lock` / `package-lock.json` – Dependencies and scripts.

## Event Fetching and Offline Cache

The `fetchEventsWithCache` function in `src/utils/eventService.js`:

- Checks network connectivity using NetInfo.
- If online:
  - Calls a configured events API endpoint.
  - Parses the JSON response.
  - Persists it into AsyncStorage under the `@events_cache` key.
- If offline or any error occurs:
  - Attempts to read and return the last cached events from AsyncStorage.
  - Falls back to an empty array when no cache is available.

This design allows the events list to keep working with previously loaded data even when the device loses connectivity.

## Testing

The test suite in `__tests__/events.test.js` uses React Native Testing Library and Jest to verify key user flows:

- Renders the main screen with the map and event markers (map is mocked to avoid native rendering issues).
- Pressing a marker navigates to the event details screen and shows an event title.
- Users can:
  - Press the **Volunteer** button to apply.
  - Press the button again to unapply.
  - See text feedback update when applying/unapplying.
- For an event where the current user is already a volunteer (e.g. “Food Bank Sorting”), the details screen shows **Call** and **Text** contact buttons.

`jest.config.js` configures React Native preset, jsdom test environment, asset mocks, and the Jest Native matchers.

## Scripts

Common scripts in `package.json`:

- `npm start` / `yarn start` – Start the Expo development server.
- `npm run android` – Run the app on an Android emulator or device.
- `npm run ios` – Run the app on an iOS simulator or device.
- `npm run web` – Run the app in a web browser (Expo for web).
- `npm test` – Run Jest tests.

> Note: Make sure to run `npm install` or `yarn install` before starting or testing the application.

## Getting Started

1. Clone the repository:
git clone https://github.com/Nicejv129/assignment-task1.git
cd assignment-task1

2. Install dependencies:
npm install

or
yarn install

3. Configure the events API endpoint in `src/utils/eventService.js` (`EVENTS_API` constant).
   npm start
   
4. Start the app:

5. Run tests:
   npm test


## Assignment Context

This repository is part of “Project 2 – Test Application by Demonstrating Problem Solving Skills” from the course template. It focuses on:

- Adding a network/caching service for events.
- Writing automated tests around navigation and user interaction.
- Updating project configuration and dependencies to support testing in React Native.

