import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

// ── Constants ──────────────────────────────────────────────
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

// ── Word List ──────────────────────────────────────────────
const WORDS = [
  'CRANE','SLATE','AUDIO','RAISE','AROSE','STARE','SNARE','IRATE',
  'TEARS','LATER','ALERT','ALTER','RATEL','TALER','ARTEL','RATEL',
  'PLANE','PLANT','BLAND','BLANK','BRAND','BRAID','BRAIN','TRAIN',
  'TRAIL','GRAIL','GRAIN','DRAIN','DRANK','GRAND','GRANT','RANT',
  'FLAME','FRAME','GRADE','GRAVE','BRAVE','BRAVO','FAVOR','LABOR',
  'MANOR','MANOR','MINOR','MINER','LINER','DINER','DIVER','LIVER',
  'LIGHT','NIGHT','MIGHT','FIGHT','RIGHT','SIGHT','TIGHT','BIGHT',
  'BLOOD','FLOOD','FLOOR','BLOOM','BROOM','BROOD','BROAD','BREAD',
  'DREAM','CREAM','STEAM','GLEAM','PLEAD','PLEAT','WHEAT','CHEAT',
  'CHEAP','CLEAN','CLEAR','SMEAR','SPEAR','SWEAR','SWEAT','SWEET',
  'SPEED','CREED','GREED','GREET','GREAT','TREAT','TREAD','BREAD',
  'BREAK','BLEAK','FREAK','SPEAK','SNEAK','STEAK','STEAN','STEAM',
  'STORM','STORE','SCORE','SHORE','SHARE','SPARE','SCARE','SCALE',
  'SHALE','SHAKE','SHAME','SHAPE','SHADE','SPADE','GRADE','GRAVE',
  'GLOVE','GROVE','PROVE','PROBE','PRUDE','PRUNE','PRONE','DRONE',
  'DRIVE','TRIBE','TRIBE','PRICE','PRIDE','PRIME','CRIME','GRIME',
  'GRIPE','GRAPE','DRAPE','DRAPE','DRAKE','BRAKE','BRACE','GRACE',
  'PLACE','PLAGE','PLANK','BLANK','CLANK','CLAMP','CLAM','CLAD',
  'CLASP','CLASH','FLASH','FLASK','FLAPS','FLARE','GLARE','BLARE',
  'BLAME','FLAME','FLAKE','FLAKE','FLAKY','SHAKY','SHALE','WHALE',
  'WHILE','WHITE','WRITE','WROTE','QUOTE','QUITE','QUITE','QUITE',
  'FOUND','BOUND','MOUND','ROUND','SOUND','WOUND','HOUND','POUND',
  'MOUNT','COUNT','COURT','SPORT','SHORT','SHIRT','SKIRT','BIRTH',
  'MIRTH','WORTH','WRATH','DRAFT','CRAFT','CRAVE','SHAVE','BRAVE',
  'KNAVE','KNIFE','SNIFF','CLIFF','THIEF','GRIEF','BRIEF','TRIED',
  'DRIED','CRIED','FRIED','PRICY','SPICY','JUICY','FANCY','HANDY',
  'SANDY','CANDY','BANDY','MANDY','PANDY','RANDY','TANDY','DANDY',
  'WINDY','MINDY','CINDY','HINDI','NINJA','PIANO','RADIO','RATIO',
  'PATIO','SERUM','FORUM','FIORD','FJORD','FJORD','FLAIR','STAIR',
  'CHAIR','CHAIN','CHINA','RHINA','RHINO','RHYME','THYME','THEME',
  'THESE','THOSE','THERE','THREE','THREW','THROE','TROVE','DROVE',
  'STOVE','SHOVE','ABOVE','GLOVE','CLOVE','CLOSE','CHOSE','THOSE',
  'PHONE','STONE','STOKE','SMOKE','SPOKE','SPORE','STORE','SCORE',
  'SCONE','SHONE','SWORE','SWORE','SWORD','WORDS','WORLD','WRIST',
  'TRUST','TRYST','TWIST','TWICE','TRICE','TRICK','TRACK','CRACK',
  'CREAK','BREAK','FREAK','BLEAK','SPEAK','SNEAK','STEAK','STUCK',
  'STOCK','CLOCK','BLOCK','BLACK','SLACK','TRACK','CRACK','STACK',
  'SNACK','KNACK','QUACK','WHACK','SHACK','SMACK','MANGO','TANGO',
  'LINGO','BINGO','DINGO','LINGO','LINGO','FLING','CLING','SLING',
  'BRING','SWING','STING','THING','THINK','DRINK','BRINK','CLINK',
  'BLINK','FLINK','PLUNK','CHUNK','SKUNK','SKUNK','DRUNK','TRUNK',
  'CLUNK','FLUNK','SPUNK','STUNK','SHRUNK','FRANK','FLANK','PLANK',
  'THANK','SHANK','SWANK','BLANK','CLANK','DRANK','PRANK','CRANK',
  'BRAND','BLAND','BLEND','BLENT','SPENT','SCENT','DENTED','VENT',
  'SPENT','MEANT','LEANT','GRANT','SLANT','PLANT','CHANT','RANT',
];

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

// ── Local guess checker ────────────────────────────────────
function checkGuess(guess, answer) {
  const result = Array(WORD_LENGTH).fill(null);
  const answerArr = answer.split('');
  const guessArr  = guess.split('');
  const used      = Array(WORD_LENGTH).fill(false);

  // First pass: mark correct letters
  guessArr.forEach((letter, i) => {
    if (letter === answerArr[i]) {
      result[i] = { guess: letter, result: 'correct' };
      used[i]   = true;
    }
  });

  // Second pass: mark present / absent
  guessArr.forEach((letter, i) => {
    if (result[i]) return; // already marked correct
    const j = answerArr.findIndex((a, idx) => a === letter && !used[idx]);
    if (j !== -1) {
      result[i] = { guess: letter, result: 'present' };
      used[j]   = true;
    } else {
      result[i] = { guess: letter, result: 'absent' };
    }
  });

  return result;
}

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
        isWide              && styles.keyWide,
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
  const [answer,       setAnswer]       = useState(getRandomWord);
  const [board,        setBoard]        = useState(makeEmptyBoard());
  const [currentRow,   setCurrentRow]   = useState(0);
  const [currentCol,   setCurrentCol]   = useState(0);
  const [keyStates,    setKeyStates]    = useState({});
  const [gameOver,     setGameOver]     = useState(false);
  const [message,      setMessage]      = useState('Guess the 5-letter word!');
  const [messageColor, setMessageColor] = useState('#5a5a6a');
  const [streak,       setStreak]       = useState(0);

  function showMessage(msg, color = '#5a5a6a') {
    setMessage(msg);
    setMessageColor(color);
  }

  // ── Submit guess (local, no API) ─────────────────────────
  function submitGuess(row, col) {
    if (col < WORD_LENGTH) {
      showMessage('Not enough letters', '#f87171');
      return;
    }

    const guessWord = board[row].map(t => t.letter).join('');
    const result    = checkGuess(guessWord, answer);

    // Update board tiles
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

    // Update keyboard colours
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
      showMessage(`The word was ${answer}`, '#f87171');
      setStreak(0);
      setGameOver(true);
    } else {
      showMessage(`Guess ${nextRow + 1} of ${MAX_GUESSES}`, '#5a5a6a');
      setCurrentRow(nextRow);
      setCurrentCol(0);
    }
  }

  // ── Handle key press ─────────────────────────────────────
  const handleKey = useCallback((key) => {
    if (gameOver) return;

    if (key === '⌫') {
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

    if (currentCol >= WORD_LENGTH) return;
    setBoard(prev => {
      const next = prev.map(r => [...r]);
      next[currentRow][currentCol] = { letter: key, state: 'filled' };
      return next;
    });
    setCurrentCol(c => c + 1);

  }, [gameOver, currentRow, currentCol, board, answer]);

  // ── Reset game ───────────────────────────────────────────
  function resetGame() {
    setAnswer(getRandomWord());
    setBoard(makeEmptyBoard());
    setCurrentRow(0);
    setCurrentCol(0);
    setKeyStates({});
    setGameOver(false);
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

      {/* Play again — shows when game is over */}
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
  message: {
    fontSize: 13,
    marginBottom: 14,
    letterSpacing: 0.4,
  },
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
