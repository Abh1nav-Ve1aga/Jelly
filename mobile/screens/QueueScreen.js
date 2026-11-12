import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Logo from '../components/Logo';
import CurrentCard from '../components/CurrentCard';
import PlaybackBar from '../components/PlaybackBar';
import ProfileSheet from '../components/ProfileSheet';
import QueueCard from '../components/QueueCard';
import queue from '../../data/Queue';

const initialCurrentTrackIndex = 0;

function formatDuration(durationSeconds) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function QueueScreen({
  user,
  onSaveProfile,
  onLogout,
  onProfileChange,
  isSavingProfile,
  isLoggingOut,
  profileError,
}) {
  //profile + playback states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(
    initialCurrentTrackIndex
  );
  //time states
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  //refs -> no rerender needed upson change
  //scroll instance to call .scrollTo()
  const scrollViewRef = useRef(null);
  //height of scroll area
  const queueViewportHeightRef = useRef(0);
  //padding -> tells where first song in queue is displayed on screen
  const queueListOffsetRef = useRef(0);
  //all card pos + size
  const cardLayoutsRef = useRef(new Map());
  //holds annimation request ID -> cancel old scroll callbacks
  const scrollFrameRef = useRef(null);

  //with centerTrack as a dependency for scrolling effect, useCallback ensure stable function reference
  const centerTrack = useCallback((trackIndex) => {
    const cardLayout = cardLayoutsRef.current.get(trackIndex);
    const viewportHeight = queueViewportHeightRef.current;

    //when centering, if card infor or screen height is unknown -> not enough info to center
    if (!cardLayout || !viewportHeight) {
      return;
    }

    //cancel older scrolls before executing newest one
    if (scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current);
    }

    //request + execute scroll
    scrollFrameRef.current = requestAnimationFrame(() => {
      //scroll distance to card center
      const cardCenter =
        queueListOffsetRef.current + cardLayout.y + cardLayout.height / 2;
      //scroll till
      const scrollY = Math.max(0, cardCenter - viewportHeight / 2);

      //scroll (annimation) till center of current card (scrollY)
      scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
    });
  }, []);

  //scroll to track when current track changed
  useEffect(() => {
    centerTrack(currentTrackIndex);

    //clean up -> runs before centerTrack is called again or when the queue screen unmounts
    return () => {
      if (scrollFrameRef.current) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [centerTrack, currentTrackIndex]);

  //get height of the screen
  function handleQueueLayout(event) {
    const { height } = event.nativeEvent.layout;

    //store height in ref
    queueViewportHeightRef.current = height;
  }

  function handleQueueListLayout(event) {
    //get the queue's y position on teh screen -> save in ref (padding)
    queueListOffsetRef.current = event.nativeEvent.layout.y;
    //center track list padding info
    centerTrack(currentTrackIndex);
  }

  function handleCardLayout(index, event) {
    //store the start (top) y position of each card + each card's height
    cardLayoutsRef.current.set(index, event.nativeEvent.layout);

    //while rendering, if this card is the current card, center around it
    if (index === currentTrackIndex) {
      centerTrack(index);
    }
  }

  //profile functions
  function openProfile() {
    onProfileChange();
    setIsProfileOpen(true);
  }

  function closeProfile() {
    onProfileChange();
    setIsProfileOpen(false);
  }

  //playback functions
  function goToPreviousTrack() {
    //prev track uptill first track
    if (currentTrackIndex > 0) {
      //song at 0:00 + auto play
      setElapsedSeconds(0);
      setIsPlaying(true);
      setCurrentTrackIndex((currentIndex) => currentIndex - 1);
    }
  }

  function goToNextTrack() {
    //next track uptill last track
    if (currentTrackIndex < queue.length - 1) {
      //song at 0:00 + autoplay
      setElapsedSeconds(0);
      setIsPlaying(true);
      setCurrentTrackIndex((currentIndex) => currentIndex + 1);
    }
  }

  function togglePlayback() {
    if (elapsedSeconds === currentTrackDuration) {
      //when song ends -> play next song
      advanceTrackAfterSong();
      return;
    }

    //toggle play, pause
    setIsPlaying((playing) => !playing);
  }

  const advanceTrackAfterSong = useCallback(() => {
    if ((currentTrackIndex < queue.length - 1)){
        setCurrentTrackIndex((index) => index + 1);
        setElapsedSeconds(0);
        //auto plays
        setIsPlaying(true);
      }
      //no more tracks left
      else{
        setIsPlaying(false)
      }
  }, [currentTrackIndex]);

  //timer stuff
  //get time of current track
  const currentTrackDuration = queue[currentTrackIndex].durationSeconds;

  useEffect(() => {
    //playback paused or song end -> no timer
    if (!isPlaying || elapsedSeconds >= currentTrackDuration) {
      return undefined;
    }

    //1 second timer
    const timer = setTimeout(() => {
      //update elapsed time < track time
      const nextElapsedSecond = Math.min(
        elapsedSeconds + 1,
        currentTrackDuration
      );

      //update current time stamp (seconds)
      setElapsedSeconds(nextElapsedSecond);

      //end of song -> playback paused
      if (nextElapsedSecond === currentTrackDuration) {
        advanceTrackAfterSong();
      }
    }, 1000);

    //clean up timer before rerun
    return () => clearTimeout(timer);
  }, [advanceTrackAfterSong, currentTrackDuration, elapsedSeconds, isPlaying]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Logo compact />

        <ScrollView
          contentContainerStyle={[
            //fixed padding (no excess white space above/below songs)
            styles.scrollContent,
            {
              paddingTop: 6,
              paddingBottom: 140,
            },
          ]}
          onLayout={handleQueueLayout}
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={styles.queueScroll}
        >
          <View onLayout={handleQueueListLayout} style={styles.queueList}>
            {queue.map((track, index) => {
              //song object -> reusability
              const cardProps = {
                duration: formatDuration(track.durationSeconds),
                position: index + 1,
                track,
              };
              
              //display current card if song card is currently playing
              if (index === currentTrackIndex) {
                return (
                  <View
                    key={track.id}
                    onLayout={(event) => handleCardLayout(index, event)}
                    style={styles.cardRow}
                  >
                    <CurrentCard {...cardProps} />
                  </View>
                );
              }
              //other cards -> queue cards
              return (
                <View
                  key={track.id}
                  onLayout={(event) => handleCardLayout(index, event)}
                  style={styles.cardRow}
                >
                  <QueueCard {...cardProps} />
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.playbackOverlay}>
          <PlaybackBar
            canGoNext={currentTrackIndex < queue.length - 1}
            canGoPrevious={currentTrackIndex > 0}
            durationSeconds={currentTrackDuration}
            elapsedSeconds={elapsedSeconds}
            isPlaying={isPlaying}
            onNext={goToNextTrack}
            onPlayPress={togglePlayback}
            onPrevious={goToPreviousTrack}
            onProfilePress={openProfile}
            trackId={queue[currentTrackIndex].id}
            user={user}
          />
        </View>
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
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingLeft: 6,
    paddingRight: 6,
  },
  queueScroll: {
    flex: 1,
  },
  queueList: {
    alignItems: 'flex-start',
    gap: 10,
  },
  cardRow: {
    width: '100%',
  },
  playbackOverlay: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 8,
    zIndex: 1,
  },
});
