import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ProfileControl({ user, onPress }) {
  const avatarInitial = user.username.charAt(0).toUpperCase();

  return (
    <Pressable
      accessibilityLabel={`Open profile settings for ${user.username}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.profileRow,
        pressed && styles.profileRowPressed,
      ]}
    >
      <View
        style={[
          styles.profileAvatar,
          { backgroundColor: user.avatarColor || '#D8C2FF' },
        ]}
      >
        <Text style={styles.profileAvatarText}>{avatarInitial}</Text>
      </View>
      <View style={styles.profileCopy}>
        <Text style={styles.profileLabel}>Profile</Text>
        <Text style={styles.profileName}>{user.username}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  profileRowPressed: {
    opacity: 0.65,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  profileAvatarText: {
    color: '#2e174b',
    fontSize: 15,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
    marginLeft: 12,
  },
  profileLabel: {
    color: '#766987',
    fontSize: 11,
  },
  profileName: {
    marginTop: 2,
    color: '#2e174b',
    fontSize: 15,
    fontWeight: '700',
  },
  chevron: {
    color: '#2e174b',
    fontSize: 28,
    lineHeight: 30,
  },
});
