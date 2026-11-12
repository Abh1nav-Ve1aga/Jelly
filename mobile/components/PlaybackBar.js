import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

function ControlButton({
  accessibilityLabel,
  disabled = false,
  icon,
  isPrimary = false,
  onPress,
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.controlButton,
        isPrimary && styles.primaryButton,
        disabled && styles.controlButtonDisabled,
        pressed && !disabled && styles.controlButtonPressed,
      ]}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.controlIcon,
            isPrimary && styles.primaryIcon,
            pressed && !disabled && styles.controlIconPressed,
          ]}
        >
          {icon}
        </Text>
      )}
    </Pressable>
  );
}

export default function PlaybackBar({
  canGoPrevious,
  canGoNext,
  durationSeconds,
  elapsedSeconds,
  isPlaying,
  trackId,
  user,
  onPrevious,
  onNext,
  onPlayPress,
  onProfilePress,
}) {
  //song time bar
  const progress = useSharedValue(0);
  const previousTrackIdRef = useRef(trackId);

  useEffect(() => {
    //reset bar when song changes
    if (previousTrackIdRef.current !== trackId) {
      cancelAnimation(progress);
      previousTrackIdRef.current = trackId;

      progress.value = withTiming(0, { duration: 0 }, (finished) => {
        if (finished && isPlaying) {
          progress.value = withTiming(1, {
            duration: durationSeconds * 1000,
            easing: Easing.linear,
          });
        }
      });

      return () => cancelAnimation(progress);
    }

    //smoothly run or pause bar animation
    if (isPlaying) {
      const remainingDuration = Math.max(
        durationSeconds * 1000 * (1 - progress.value),
        0
      );

      progress.value = withTiming(1, {
        duration: remainingDuration,
        easing: Easing.linear,
      });
    } else {
      cancelAnimation(progress);
    }

    return () => cancelAnimation(progress);
  }, [durationSeconds, isPlaying, progress, trackId]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progress.value, 1) * 100}%`,
  }));

  //x:xx format
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
    <View style={styles.bar}>
      <View style={styles.progressSection}>
        <View
          accessibilityLabel={`${formatTime(
            elapsedSeconds
          )} of ${formatTime(durationSeconds)}`}
          accessibilityRole="progressbar"
          style={styles.progressTrack}
        >
          {/* bar - animated */}
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        {/* current time + duration */}
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.time}>{formatTime(durationSeconds)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityLabel={`Open profile settings for ${user.username}`}
          accessibilityRole="button"
          onPress={onProfilePress}
          style={({ pressed }) => [
            styles.profileButton,
            pressed && styles.profileButtonPressed,
          ]}
        >
          <View
            style={[
              styles.profileAvatar,
              { backgroundColor: user.avatarColor || '#D8C2FF' },
            ]}
          >
            <Text style={styles.profileButtonText}>
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        </Pressable>
        <View style={styles.playbackControls}>
          <ControlButton
            accessibilityLabel="Previous song"
            disabled={!canGoPrevious}
            icon="|◀"
            onPress={onPrevious}
          />
          <ControlButton
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            icon={isPlaying ? 'Ⅱ' : '▶'}
            isPrimary
            onPress={onPlayPress}
          />
          <ControlButton
            accessibilityLabel="Next song"
            disabled={!canGoNext}
            icon="▶|"
            onPress={onNext}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 118,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#eee5ff',
  },
  progressSection: {
    width: '100%',
    marginBottom: 8,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(118, 105, 135, 0.24)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#7c3aed',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  time: {
    color: '#766987',
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  controlButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#e5deea',
  },
  primaryButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  controlButtonPressed: {
    backgroundColor: '#7c3aed',
  },
  controlButtonDisabled: {
    opacity: 0.35,
  },
  controlIcon: {
    color: '#2e174b',
    fontSize: 15,
    fontWeight: '800',
  },
  primaryIcon: {
    marginLeft: 3,
    fontSize: 22,
  },
  controlIconPressed: {
    color: '#ffffff',
  },
  profileButton: {
    position: 'absolute',
    left: -10,
    top: 25,
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonPressed: {
    opacity: 0.65,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  profileButtonText: {
    color: '#2e174b',
    fontSize: 15,
    fontWeight: '800',
  },
});
