import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Logo from '../components/Logo';
import ProfileControl from '../components/ProfileControl';
import ProfileSheet from '../components/ProfileSheet';

export default function HomeScreen({
  user,
  onSaveProfile,
  onLogout,
  onProfileChange,
  isSavingProfile,
  isLoggingOut,
  profileError,
  onHost,
}) {
  //user setting states
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  //open user settings
  function openProfile() {
    onProfileChange();
    setIsProfileOpen(true);
  }

  //close user settings
  function closeProfile() {
    onProfileChange();
    setIsProfileOpen(false);
  }

  function handlePlaceholderPress() {}

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* logo */}
        <Logo compact />

        <View style={styles.main}>
          <Text style={styles.heading}>
            Hi, {user.username}.{`\n`}What’s the vibe?
          </Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onHost}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
            >
              {({ pressed }) => (
                <>
                  <View>
                    <Text
                      style={[
                        styles.actionTitle,
                        pressed && styles.actionTextPressed,
                      ]}
                    >
                      Host a Jam
                    </Text>
                    <Text
                      style={[
                        styles.actionSubtitle,
                        pressed && styles.actionSubtitlePressed,
                      ]}
                    >
                      Start a room for your friends
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.actionArrow,
                      pressed && styles.actionTextPressed,
                    ]}
                  >
                    →
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handlePlaceholderPress}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
            >
              {({ pressed }) => (
                <>
                  <View>
                    <Text
                      style={[
                        styles.actionTitle,
                        pressed && styles.actionTextPressed,
                      ]}
                    >
                      Join a Jam
                    </Text>
                    <Text
                      style={[
                        styles.actionSubtitle,
                        pressed && styles.actionSubtitlePressed,
                      ]}
                    >
                      Enter a friend’s room code
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.actionArrow,
                      pressed && styles.actionTextPressed,
                    ]}
                  >
                    →
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        <ProfileControl onPress={openProfile} user={user} />
      </View>

      {isProfileOpen && (
        <ProfileSheet
          user={user}
          onClose={closeProfile}
          onSave={onSaveProfile}
          onLogout={onLogout}
          onProfileChange={onProfileChange}
          isSaving={isSavingProfile}
          isLoggingOut={isLoggingOut}
          saveError={profileError}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbf8ef',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  main: {
    flex: 1,
    paddingTop: 52,
  },
  heading: {
    color: '#2e174b',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.8,
    lineHeight: 42,
  },
  actions: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 24,
  },
  actionButton: {
    minHeight: 136,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#eee5ff',
  },
  actionButtonPressed: {
    backgroundColor: '#7c3aed',
  },
  actionTitle: {
    color: '#2e174b',
    fontSize: 21,
    fontWeight: '800',
  },
  actionSubtitle: {
    marginTop: 5,
    color: '#766987',
    fontSize: 13,
    fontWeight: '500',
  },
  actionArrow: {
    color: '#2e174b',
    fontSize: 24,
  },
  actionTextPressed: {
    color: '#ffffff',
  },
  actionSubtitlePressed: {
    color: '#eee5ff',
  },
});
