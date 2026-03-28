import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

// ── Constants ──────────────────────────────────────────────
const API_URL     = 'https://wordle-api.vercel.app/api/wordle';
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

// ── Tile Component ─────────────────────────────────────────
function GameTile({ letter, state }) {
  return (
    <View style={[
      styles.tile,
      state === 'correct' && styles.tileCorrect,
      state === 'present' && styles.tilePresent,
      state === 'absent'  && styles.tileAbsent,
      state === 'filled'  && styles.tileFilled,
    ]}>
      <Text style={styles.tileText}>{letter}</Text>
    </View>
  );
}

// ── Key Component ──────────────────────────────────────────
function Key({ label, state, onPress }) {
  const isWide = label === 'ENTER' || label === '⌫';
  return (
    <TouchableOpacity
      style={[
        styles.key,
        isWide          && styles.keyWide,
        state === 'correct' && styles.keyCorrect,
        state === 'present' && styles.keyPresent,
        state === 'absent'  && styles.keyAbsent,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.keyText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Helper — build empty board ─────────────────────────────
function makeEmptyBoard() {
  return Array.from({ length: MAX_GUESSES }, () =>
    Array.from({ length: WORD_LENGTH }, () => ({ letter: '', state: 'empty' }))
  );
}

// ── Main Screen ────────────────────────────────────────────
export default function WordleScreen() {
  const [board,        setBoard]        = useState(makeEmptyBoard());
  const [currentRow,   setCurrentRow]   = useState(0);
  const [currentCol,   setCurrentCol]   = useState(0);
  const [keyStates,    setKeyStates]    = useState({});
  const [gameOver,     setGameOver]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [message,      setMessage]      = useState('Guess the 5-letter word!');
  const [messageColor, setMessageColor] = useState('#5a5a6a');
  const [streak,       setStreak]       = useState(0);

  // ── Show status message ──────────────────────────────────
  function showMessage(msg, color = '#5a5a6a') {
    setMessage(msg);
    setMessageColor(color);
  }

  // ── Submit guess to API ──────────────────────────────────
  async function submitGuess(row, col) {
    if (col < WORD_LENGTH) {
      showMessage('Not enough letters', '#f87171');
      return;
    }

    const word = board[row].map(t => t.letter).join('').toLowerCase();

    setLoading(true);
    showMessage('Checking…', '#818cf8');

    try {
      const res = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ word }),
      });

      if (!res.ok) throw new Error('API error');
      const result = await res.json();

      // Update board tiles with colour results
      setBoard(prev => {
        const next = prev.map(r => [...r]);
        result.forEach((tile, i) => {
          next[row][i] = {
            letter: tile.guess.toUpperCase(),
            state:  tile.result,
          };
        });
        return next;
      });

      // Update keyboard key colours
      setKeyStates(prev => {
        const next     = { ...prev };
        const priority = { correct: 3, present: 2, absent: 1 };
        result.forEach(tile => {
          const k = tile.guess.toUpperCase();
          if (!next[k] || priority[tile.result] > priority[next[k]]) {
            next[k] = tile.result;
          }
        });
        return next;
      });

      const won     = result.every(t => t.result === 'correct');
      const nextRow = row + 1;

      if (won) {
        const winMessages = [
          'Genius!', 'Magnificent!', 'Impressive!',
          'Splendid!', 'Great!', 'Phew!',
        ];
        showMessage(winMessages[row] || 'You got it!', '#4ade80');
        setStreak(s => s + 1);
        setGameOver(true);

      } else if (nextRow >= MAX_GUESSES) {
        showMessage('Hard luck! The word has been guessed', '#f87171');
        setStreak(0);
        setGameOver(true);

      } else {
        showMessage(`Guess ${nextRow + 1} of ${MAX_GUESSES}`, '#5a5a6a');
        setCurrentRow(nextRow);
        setCurrentCol(0);
      }

    } catch (err) {
      showMessage('Connection error — check internet', '#f87171');
    } finally {
      setLoading(false);
    }
  }

  // ── Handle any key press ─────────────────────────────────
  const handleKey = useCallback((key) => {
    if (gameOver || loading) return;

    if (key === '⌫') {
      // Delete last letter
      if (currentCol === 0) return;
      const newCol = currentCol - 1;
      setBoard(prev => {
        const next = prev.map(r => [...r]);
        next[currentRow][newCol] = { letter: '', state: 'empty' };
        return next;
      });
      setCurrentCol(newCol);
      return;
    }

    if (key === 'ENTER') {
      submitGuess(currentRow, currentCol);
      return;
    }

    // Add letter to current tile
    if (currentCol >= WORD_LENGTH) return;
    setBoard(prev => {
      const next = prev.map(r => [...r]);
      next[currentRow][currentCol] = { letter: key, state: 'filled' };
      return next;
    });
    setCurrentCol(c => c + 1);

  }, [gameOver, loading, currentRow, currentCol, board]);

  // ── Reset game ───────────────────────────────────────────
  function resetGame() {
    setBoard(makeEmptyBoard());
    setCurrentRow(0);
    setCurrentCol(0);
    setKeyStates({});
    setGameOver(false);
    setLoading(false);
    showMessage('Guess the 5-letter word!', '#5a5a6a');
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          W<Text style={styles.headerAccent}>.</Text>ORDLE
        </Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakLabel}>streak </Text>
          <Text style={styles.streakNum}>{streak}</Text>
        </View>
      </View>

      {/* Status message */}
      <Text style={[styles.message, { color: messageColor }]}>
        {message}
      </Text>

      {/* Game board */}
      <View style={styles.board}>
        {board.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((tile, c) => (
              <GameTile key={c} letter={tile.letter} state={tile.state} />
            ))}
          </View>
        ))}
      </View>

      {/* Loading spinner */}
      {loading && (
        <ActivityIndicator
          color="#818cf8"
          style={{ marginBottom: 10 }}
        />
      )}

      {/* Play again button — only shows when game is over */}
      {gameOver && (
        <TouchableOpacity style={styles.playAgainBtn} onPress={resetGame}>
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>
      )}

      {/* On-screen keyboard */}
      <View style={styles.keyboard}>
        {KEYBOARD_ROWS.map((row, r) => (
          <View key={r} style={styles.keyRow}>
            {row.map(key => (
              <Key
                key={key}
                label={key}
                state={keyStates[key]}
                onPress={() => handleKey(key)}
              />
            ))}
          </View>
        ))}
      </View>

    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#0f0f11',
    alignItems: 'center',
  },

  // Header
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a32',
    marginBottom: 12,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 22,
    color: '#f0ede8',
    letterSpacing: 2,
  },
  headerAccent: {
    color: '#818cf8',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1f',
    borderWidth: 1,
    borderColor: '#2a2a32',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakLabel: {
    fontSize: 11,
    color: '#5a5a6a',
  },
  streakNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fbbf24',
  },

  // Message
  message: {
    fontSize: 13,
    marginBottom: 14,
    letterSpacing: 0.4,
  },

  // Board
  board: {
    gap: 6,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  tile: {
    width: 54,
    height: 54,
    borderWidth: 1.5,
    borderColor: '#2a2a32',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileFilled: {
    borderColor: '#5a5a6a',
  },
  tileCorrect: {
    backgroundColor: '#14532d',
    borderColor: '#4ade80',
  },
  tilePresent: {
    backgroundColor: '#78350f',
    borderColor: '#fbbf24',
  },
  tileAbsent: {
    backgroundColor: '#27272a',
    borderColor: '#27272a',
  },
  tileText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f0ede8',
  },

  // Play again
  playAgainBtn: {
    backgroundColor: '#818cf8',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  playAgainText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },

  // Keyboard
  keyboard: {
    width: '100%',
    paddingHorizontal: 6,
    gap: 6,
    marginTop: 'auto',
    paddingBottom: 12,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  key: {
    height: 52,
    minWidth: 30,
    paddingHorizontal: 5,
    backgroundColor: '#1a1a1f',
    borderWidth: 1,
    borderColor: '#2a2a32',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyWide: {
    minWidth: 52,
  },
  keyCorrect: {
    backgroundColor: '#14532d',
    borderColor: '#4ade80',
  },
  keyPresent: {
    backgroundColor: '#78350f',
    borderColor: '#fbbf24',
  },
  keyAbsent: {
    backgroundColor: '#18181b',
    borderColor: '#18181b',
  },
  keyText: {
    color: '#f0ede8',
    fontWeight: '700',
    fontSize: 12,
  },
});
