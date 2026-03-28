import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { db } from '../firebase';
import { ref, push } from 'firebase/database';

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const KEYBOARD_ROWS = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

const WORDS = [
    'CRANE','SLATE','AUDIO','RAISE','AROSE','STARE','SNARE','IRATE',
    'TEARS','LATER','ALERT','ALTER','PLANE','PLANT','BLAND','BLANK',
    'BRAND','BRAID','BRAIN','TRAIN','TRAIL','GRAIL','GRAIN','DRAIN',
    'DRANK','GRAND','GRANT','FLAME','FRAME','GRADE','GRAVE','BRAVE',
    'FAVOR','LABOR','MANOR','MINOR','MINER','LINER','DINER','DIVER',
    'LIVER','LIGHT','NIGHT','MIGHT','FIGHT','RIGHT','SIGHT','TIGHT',
    'BLOOD','FLOOD','FLOOR','BLOOM','BROOM','BROOD','BROAD','BREAD',
    'DREAM','CREAM','STEAM','GLEAM','PLEAD','PLEAT','WHEAT','CHEAT',
    'CHEAP','CLEAN','CLEAR','SMEAR','SPEAR','SWEAR','SWEAT','SWEET',
    'SPEED','CREED','GREED','GREET','GREAT','TREAT','TREAD','BREAK',
    'BLEAK','FREAK','SPEAK','SNEAK','STEAK','STORM','STORE','SCORE',
    'SHORE','SHARE','SPARE','SCARE','SCALE','SHALE','SHAKE','SHAME',
    'SHAPE','SHADE','SPADE','GLOVE','GROVE','PROVE','PROBE','PRUNE',
    'PRONE','DRONE','DRIVE','PRICE','PRIDE','PRIME','CRIME','GRIME',
    'GRIPE','GRAPE','DRAPE','DRAKE','BRAKE','BRACE','GRACE','PLACE',
    'PLANK','CLANK','CLASP','CLASH','FLASH','FLASK','FLARE','GLARE',
    'BLARE','BLAME','FLAKE','FLAKY','SHAKY','WHALE','WHILE','WHITE',
    'WRITE','WROTE','QUOTE','QUITE','FOUND','BOUND','MOUND','ROUND',
    'SOUND','WOUND','HOUND','POUND','MOUNT','COUNT','COURT','SPORT',
    'SHORT','SHIRT','SKIRT','BIRTH','WORTH','WRATH','DRAFT','CRAFT',
    'CRAVE','SHAVE','KNIFE','SNIFF','CLIFF','THIEF','GRIEF','BRIEF',
    'TRIED','DRIED','CRIED','FRIED','SPICY','JUICY','FANCY','HANDY',
    'SANDY','CANDY','PIANO','RADIO','RATIO','PATIO','SERUM','FORUM',
    'FLAIR','STAIR','CHAIR','CHAIN','CHINA','RHINO','RHYME','THYME',
    'THEME','THERE','THREE','THREW','TROVE','DROVE','STOVE','SHOVE',
    'ABOVE','CLOVE','CLOSE','CHOSE','PHONE','STONE','STOKE','SMOKE',
    'SPOKE','SPORE','SCONE','SHONE','SWORE','SWORD','WORDS','WORLD',
    'WRIST','TRUST','TWIST','TWICE','TRICE','TRICK','TRACK','CRACK',
    'STUCK','STOCK','CLOCK','BLOCK','BLACK','SLACK','STACK','SNACK',
    'KNACK','QUACK','WHACK','SHACK','SMACK','MANGO','TANGO','BINGO',
    'FLING','CLING','SLING','BRING','SWING','STING','THING','THINK',
    'DRINK','BRINK','CLINK','BLINK','CHUNK','SKUNK','DRUNK','TRUNK',
    'CLUNK','FLUNK','SPUNK','FRANK','FLANK','THANK','SHANK','PRANK',
    'CRANK','BLEND','SPENT','SCENT','MEANT','LEANT','GRANT','SLANT',
];

function getRandomWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function checkGuess(guess, answer) {
    const result = Array(WORD_LENGTH).fill(null);
    const answerArr = answer.split('');
    const guessArr = guess.split('');
    const used = Array(WORD_LENGTH).fill(false);

    guessArr.forEach((letter, i) => {
        if (letter === answerArr[i]) {
            result[i] = { guess: letter, result: 'correct' };
            used[i] = true;
        }
    });

    guessArr.forEach((letter, i) => {
        if (result[i]) return;
        const j = answerArr.findIndex((a, idx) => a === letter && !used[idx]);
        if (j !== -1) {
            result[i] = { guess: letter, result: 'present' };
            used[j] = true;
        } else {
            result[i] = { guess: letter, result: 'absent' };
        }
    });

    return result;
}

function GameTile({ letter, state }) {
    return (
        <View style={[
            styles.tile,
            state === 'correct' && styles.tileCorrect,
            state === 'present' && styles.tilePresent,
            state === 'absent' && styles.tileAbsent,
            state === 'filled' && styles.tileFilled,
        ]}>
            <Text style={styles.tileText}>{letter}</Text>
        </View>
    );
}

function Key({ label, state, onPress }) {
    const isWide = label === 'ENTER' || label === '⌫';
    return (
        <TouchableOpacity
            style={[
                styles.key,
                isWide && styles.keyWide,
                state === 'correct' && styles.keyCorrect,
                state === 'present' && styles.keyPresent,
                state === 'absent' && styles.keyAbsent,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.keyText}>{label}</Text>
        </TouchableOpacity>
    );
}

function makeEmptyBoard() {
    return Array.from({ length: MAX_GUESSES }, () =>
        Array.from({ length: WORD_LENGTH }, () => ({ letter: '', state: 'empty' }))
    );
}

export default function WordleScreen({ route }) {
    const playerName = route?.params?.name || 'Player';

    const [answer, setAnswer] = useState(getRandomWord);
    const [board, setBoard] = useState(makeEmptyBoard());
    const [currentRow, setCurrentRow] = useState(0);
    const [currentCol, setCurrentCol] = useState(0);
    const [keyStates, setKeyStates] = useState({});
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('Guess the 5-letter word!');
    const [messageColor, setMessageColor] = useState('#5a5a6a');
    const [streak, setStreak] = useState(0);

    function showMessage(msg, color = '#5a5a6a') {
        setMessage(msg);
        setMessageColor(color);
    }

    function submitGuess(row, col) {
        if (col < WORD_LENGTH) {
            showMessage('Not enough letters', '#f87171');
            return;
        }

        const guessWord = board[row].map(t => t.letter).join('');
        const result = checkGuess(guessWord, answer);

        setBoard(prev => {
            const next = prev.map(r => [...r]);
            result.forEach((tile, i) => {
                next[row][i] = { letter: tile.guess.toUpperCase(), state: tile.result };
            });
            return next;
        });

        setKeyStates(prev => {
            const next = { ...prev };
            const priority = { correct: 3, present: 2, absent: 1 };
            result.forEach(tile => {
                const k = tile.guess.toUpperCase();
                if (!next[k] || priority[tile.result] > priority[next[k]]) {
                    next[k] = tile.result;
                }
            });
            return next;
        });

        const won = result.every(t => t.result === 'correct');
        const nextRow = row + 1;

        if (won) {
            const winMessages = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'];
            showMessage(winMessages[row] || 'You got it!', '#4ade80');
            setStreak(s => s + 1);
            setGameOver(true);
            push(ref(db, 'scores'), {
                name: playerName,
                guesses: row + 1,
                timestamp: Date.now(),
            });
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

    function resetGame() {
        setAnswer(getRandomWord());
        setBoard(makeEmptyBoard());
        setCurrentRow(0);
        setCurrentCol(0);
        setKeyStates({});
        setGameOver(false);
        showMessage('Guess the 5-letter word!', '#5a5a6a');
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>W<Text style={styles.headerAccent}>.</Text>ORDLE</Text>
                <View style={styles.streakBadge}>
                    <Text style={styles.streakLabel}>streak </Text>
                    <Text style={styles.streakNum}>{streak}</Text>
                </View>
            </View>

            <Text style={[styles.message, { color: messageColor }]}>{message}</Text>

            <View style={styles.board}>
                {board.map((row, r) => (
                    <View key={r} style={styles.row}>
                        {row.map((tile, c) => (
                            <GameTile key={c} letter={tile.letter} state={tile.state} />
                        ))}
                    </View>
                ))}
            </View>

            {gameOver && (
                <TouchableOpacity style={styles.playAgainBtn} onPress={resetGame}>
                    <Text style={styles.playAgainText}>Play Again</Text>
                </TouchableOpacity>
            )}

            <View style={styles.keyboard}>
                {KEYBOARD_ROWS.map((row, r) => (
                    <View key={r} style={styles.keyRow}>
                        {row.map(key => (
                            <Key key={key} label={key} state={keyStates[key]} onPress={() => handleKey(key)} />
                        ))}
                    </View>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f11', alignItems: 'center' },
    header: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2a2a32', marginBottom: 12 },
    headerTitle: { fontWeight: '800', fontSize: 22, color: '#f0ede8', letterSpacing: 2 },
    headerAccent: { color: '#818cf8' },
    streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1f', borderWidth: 1, borderColor: '#2a2a32', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    streakLabel: { fontSize: 11, color: '#5a5a6a' },
    streakNum: { fontSize: 13, fontWeight: '700', color: '#fbbf24' },
    message: { fontSize: 13, marginBottom: 14, letterSpacing: 0.4 },
    board: { gap: 6, marginBottom: 16 },
    row: { flexDirection: 'row', gap: 6 },
    tile: { width: 54, height: 54, borderWidth: 1.5, borderColor: '#2a2a32', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
    tileFilled: { borderColor: '#5a5a6a' },
    tileCorrect: { backgroundColor: '#14532d', borderColor: '#4ade80' },
    tilePresent: { backgroundColor: '#78350f', borderColor: '#fbbf24' },
    tileAbsent: { backgroundColor: '#27272a', borderColor: '#27272a' },
    tileText: { fontSize: 22, fontWeight: '800', color: '#f0ede8' },
    playAgainBtn: { backgroundColor: '#818cf8', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8, marginBottom: 14 },
    playAgainText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
    keyboard: { width: '100%', paddingHorizontal: 6, gap: 6, marginTop: 'auto', paddingBottom: 12 },
    keyRow: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
    key: { height: 52, minWidth: 30, paddingHorizontal: 5, backgroundColor: '#1a1a1f', borderWidth: 1, borderColor: '#2a2a32', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
    keyWide: { minWidth: 52 },
    keyCorrect: { backgroundColor: '#14532d', borderColor: '#4ade80' },
    keyPresent: { backgroundColor: '#78350f', borderColor: '#fbbf24' },
    keyAbsent: { backgroundColor: '#18181b', borderColor: '#18181b' },
    keyText: { color: '#f0ede8', fontWeight: '700', fontSize: 12 },
});
