import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function CurrentCard({ position, track, duration }) {
  return (
    <View style={styles.card}>
      <Text style={styles.position} numberOfLines={1}>{position}</Text>
      <Image
        accessibilityLabel={`Abstract cover art for ${track.name}`}
        source={track.coverArt}
        style={styles.coverArt}
      />
      <View style={styles.details}>
        <Text numberOfLines={1} style={styles.title}>
          {track.name}
        </Text>
        <Text numberOfLines={1} style={styles.artists}>
          {track.artists.join(', ')}
        </Text>
      </View>
      <Text style={styles.duration}>{duration}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 92,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.55)',
    borderRadius: 24,
    backgroundColor: '#eee5ff',
  },
  position: {
    width: 22,
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  coverArt: {
    width: 66,
    height: 66,
    borderRadius: 15,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#2e174b',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 19,
  },
  artists: {
    marginTop: 5,
    color: '#766987',
    fontSize: 12,
    lineHeight: 15,
  },
  duration: {
    color: '#766987',
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
