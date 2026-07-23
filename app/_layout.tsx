import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HabitProvider } from '../contexts/HabitContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { NoteProvider } from '../contexts/NoteContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <SettingsProvider>
          <HabitProvider>
            <NoteProvider>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#000000' },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="add-habit" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="edit-habit" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="notes" options={{ headerShown: false }} />
                <Stack.Screen name="archive" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
                <Stack.Screen name="note-editor" options={{ presentation: 'modal', headerShown: false }} />
              </Stack>
            </NoteProvider>
          </HabitProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
