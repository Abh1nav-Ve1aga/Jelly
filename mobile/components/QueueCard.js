import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function QueueCard({ position, track, duration }) {
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
    width: '94%',
    minHeight: 72,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 222, 234, 0.32)',
    borderRadius: 20,
    backgroundColor: 'rgba(229, 222, 234, 0.30)',
  },
  position: {
    width: 22,
    color: '#766987',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  coverArt: {
    width: 53,
    height: 53,
    borderRadius: 12,
    opacity: 0.76,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#2e174b',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  artists: {
    marginTop: 4,
    color: '#766987',
    fontSize: 11,
    lineHeight: 14,
  },
  duration: {
    color: '#766987',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
});
