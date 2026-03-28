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

// ── Answer words (picked as the daily target) ──────────────
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
    'CREAK','STUCK','STOCK','CLOCK','BLOCK','BLACK','SLACK','STACK',
    'SNACK','KNACK','QUACK','WHACK','SHACK','SMACK','MANGO','TANGO',
    'BINGO','FLING','CLING','SLING','BRING','SWING','STING','THING',
    'THINK','DRINK','BRINK','CLINK','BLINK','CHUNK','SKUNK','DRUNK',
    'TRUNK','CLUNK','FLUNK','SPUNK','FRANK','FLANK','PLANK','THANK',
    'SHANK','SWANK','PRANK','CRANK','BLEND','SPENT','SCENT','MEANT',
    'LEANT','GRANT','SLANT','CHANT','SHELF','SHELL','SPELL','SPILL',
    'SKILL','SKULL','SKILL','SWILL','QUILL','QUILL','DRILL','GRILL',
    'FRILL','TRILL','STILL','SPILL','FILLED','SILLY','HILLY','BILLY',
    'KITTY','WITTY','DITTY','GIDDY','MUDDY','BUDDY','STUDY','DUSTY',
    'RUSTY','GUSTY','LUSTY','MUSTY','BUSTY','JUMPY','BUMPY','LUMPY',
    'DUMPY','HUMPY','RUMPY','CLUMP','SLUMP','PLUMP','STUMP','TRUMP',
];

// ── Valid guess words (answer words + extra common words) ──
const VALID_WORDS = new Set([
    ...WORDS,
    'ABOUT','ABOVE','ABUSE','ACTOR','ACUTE','ADMIT','ADOPT','ADULT',
    'AFTER','AGAIN','AGENT','AGREE','AHEAD','ALARM','ALBUM','ALERT',
    'ALGAE','ALIEN','ALIGN','ALIKE','ALIVE','ALLAY','ALLEY','ALLOT',
    'ALLOW','ALLOY','ALOFT','ALONE','ALONG','ALOOF','ALOUD','ALPHA',
    'ALTAR','AMBER','AMEND','AMUSE','ANGEL','ANGER','ANGLE','ANGRY',
    'ANIME','ANKLE','ANNEX','ANNOY','ANTIC','ANVIL','AORTA','APPLE',
    'APPLY','APRON','APTLY','ARENA','ARGUE','ARISE','ARMOR','AROMA',
    'ARRAY','ARROW','ARSON','ARTSY','ASHEN','ASHES','ASIDE','ASKED',
    'ATLAS','ATONE','ATTIC','AUDIT','AVAIL','AVIAN','AVOID','AWAKE',
    'AWARD','AWARE','AWFUL','AWOKE','AXIAL','AZURE','BACON','BADGE',
    'BADLY','BAGEL','BAGGY','BASIC','BASIL','BASIN','BASIS','BATCH',
    'BATHE','BAYOU','BEACH','BEADY','BEARD','BEAST','BEGAN','BEGIN',
    'BEING','BELLE','BELLY','BENCH','BERET','BIBLE','BIGOT','BISON',
    'BITER','BLIMP','BLISS','BLUNT','BLURB','BLURT','BLUSH','BOOZE',
    'BORAX','BORED','BOXER','BRACE','BRIDE','BRINE','BROIL','BROOK',
    'BROTH','BROWN','BRUNT','BRUSH','BUDGE','BUGLE','BULGE','BULLY',
    'BUNCH','BUNNY','BURNT','BURLY','BURRO','BURST','BUYER','CABAL',
    'CADET','CAMEL','CAMEO','CANAL','CARGO','CAROL','CARRY','CARVE',
    'CATCH','CAUSE','CEASE','CEDAR','CHAFE','CHAFF','CHALK','CHAOS',
    'CHARD','CHARM','CHART','CHASE','CHECK','CHEEK','CHEER','CHESS',
    'CHEST','CHIDE','CHIEF','CHILD','CHOIR','CHOKE','CHORD','CHORE',
    'CHOSE','CIVIC','CIVIL','CLACK','CLAIM','CLAMP','CLANG','CLANK',
    'CLASH','CLASS','CAULK','CLASP','CLEAN','CLICK','CLIFF','CLING',
    'CLINK','CLONE','CLOTH','CLOUD','CLOUT','COVER','COMET','COMIC',
    'COMMA','CONDO','CORAL','COUGH','COULD','COUPE','COVET','CRAWL',
    'CRIMP','CRISP','CROSS','CROWD','CROWN','CRUDE','CRUEL','CRUMB',
    'CRUSH','CRUST','CRYPT','CUBIC','CURLY','CURRY','CYCLE','DADDY',
    'DAILY','DAISY','DANCE','DATUM','DAUNT','DECOY','DEFER','DEITY',
    'DELAY','DELTA','DENSE','DEPOT','DEPTH','DERBY','DEVIL','DIGIT',
    'DIMLY','DISCO','DITCH','DITZY','DIZZY','DODGE','DOING','DOLLY',
    'DONOR','DOUBT','DOUGH','DOWDY','DOWRY','DOZEN','DRANK','DRAWL',
    'DRINK','DROOL','DROOP','DROVE','DROWN','DWARF','DWELL','DYING',
    'EAGER','EAGLE','EARLY','EARTH','EIGHT','ELECT','ELITE','EMAIL',
    'EMPTY','ENDOW','ENEMY','ENJOY','ENTER','ENTRY','ENVOY','EQUAL',
    'EQUIP','ERUPT','ESSAY','EVADE','EVENT','EVERY','EVICT','EVOKE',
    'EXACT','EXALT','EXERT','EXUDE','FABLE','FACET','FAITH','FALSE',
    'FATAL','FAINT','FAIRY','FEAST','FEIGN','FERRY','FETCH','FEWER',
    'FIBRE','FIELD','FIFTH','FIFTY','FIERY','FINCH','FIRST','FIXED',
    'FJORD','FLAGS','FLAIL','FLANK','FLARE','FLASK','FLAWY','FLESH',
    'FLEET','FLIER','FLIES','FLOCK','FLOOD','FLOSS','FLOUR','FLOUT',
    'FLOWN','FLUTE','FOAMY','FOCUS','FOLLY','FORGE','FORTH','FOUND',
    'FRAIL','FREED','FRESH','FRONT','FROST','FROTH','FROZE','FRUIT',
    'FULLY','FUNGI','FUNNY','FURRY','GAUDY','GAUZE','GAVEL','GECKO',
    'GENRE','GHOST','GHOUL','GIANT','GIRTH','GIVEN','GIZMO','GLAND',
    'GLARE','GLEAN','GLEAM','GLIDE','GLINT','GLOAT','GLOOM','GLOSS',
    'GLUED','GNASH','GOING','GOUGE','GOURD','GRASP','GRAZE','GREET',
    'GRIME','GROAN','GROPE','GROSS','GROUT','GROUP','GRUEL','GRUFF',
    'GRUNT','GUAVA','GUILE','GUISE','GULLY','GUSTO','GYPSY','HASTE',
    'HAVEN','HAVOC','HEADY','HEART','HEAVY','HEDGE','HERON','HIPPO',
    'HOARD','HOBBY','HOLLY','HOMER','HONEY','HONOR','HOPPY','HOVER',
    'HUMID','HUSKY','HYENA','IDIOT','IGLOO','IMAGE','IMPLY','INBOX',
    'INCUR','INDEX','INEPT','INERT','INFER','INFIX','INLAY','INPUT',
    'INTER','INTRO','IONIC','IRONY','ITCHY','IVORY','JAUNT','JAZZY',
    'JELLY','JEWEL','JIFFY','JOUST','JUDGE','JUICE','JUMBO','JUROR',
    'KAYAK','KEBAB','KNEEL','KNELT','KNIFE','KNOLL','KNOT','KNOWN',
    'KOALA','LABEL','LAPSE','LASER','LATCH','LATER','LATIN','LATTE',
    'LAUGH','LAYER','LEACH','LEAKY','LEAPT','LEARN','LEASE','LEASH',
    'LEGAL','LEMON','LEVEL','LILAC','LIMIT','LLAMA','LOCAL','LODGE',
    'LOGIC','LOOSE','LORRY','LOTUS','LOWLY','LUCID','LUCKY','LUMPY',
    'LUNAR','LUNCH','LUSTY','LYING','MAGIC','MAXIM','MEALY','MELEE',
    'MELON','MERCY','METAL','MIMIC','MIXER','MOCHA','MODAL','MODEL',
    'MOGUL','MONTH','MORAL','MORON','MORSE','MOTEL','MOTIF','MOTOR',
    'MOULD','MOURN','MOUTH','MUDDY','MULCH','MUMMY','MURKY','MUSIC',
    'MYRRH','NADIR','NASAL','NASTY','NAVAL','NICHE','NOBLE','NOISE',
    'NORTH','NOTCH','NOVEL','NUDGE','NURSE','NYMPH','OCCUR','OCEAN',
    'OFFER','OLIVE','ONSET','OPERA','OPTIC','ORBIT','ORDER','OTHER',
    'OTTER','OUGHT','OUTDO','OUTER','OUTWIT','OVARY','OVOID','OWING',
    'OXIDE','OZONE','PADDY','PAINT','PANDA','PANIC','PAPAL','PAPER',
    'PARTY','PASTE','PATCH','PAUSE','PAYEE','PEACE','PEACH','PEARL',
    'PETAL','PETTY','PHASE','PILOT','PIXEL','PIXIE','PLAIN','PLAIT',
    'PLAZA','PLEAT','PLUCK','PLUGS','PLUMB','PLUME','PLUSH','POACH',
    'POINTY','POKER','POLAR','PORCH','POSIT','POUCH','POUTY','POWER',
    'PRANK','PRESS','PRICE','PRIDE','PRIVY','PRUNE','PSALM','PUBIC',
    'PUDGY','PUNCH','PUPIL','PURGE','PUSHY','PYGMY','QUAFF','QUALM',
    'QUASH','QUEEN','QUERY','QUEST','QUICK','QUIET','QUIRK','QUOTA',
    'RABBI','RAINY','RALLY','RAMEN','RANCH','RAPID','RAVEN','REACH',
    'REACT','READY','REALM','REBEL','REBUS','RECAP','RECUT','REDID',
    'REIGN','RELAX','REPAY','REPEL','REPOT','RERUN','REUSE','RIDER',
    'RIDGE','RISKY','RIVET','ROBOT','ROCKY','ROUGE','ROUGH','ROWDY',
    'RULER','RURAL','SADLY','SAINT','SALAD','SAUCE','SAVVY','SCALP',
    'SCALD','SCARY','SCOFF','SCOLD','SCOOP','SCOUT','SCRAM','SCRAP',
    'SCRUB','SEIZE','SENSE','SERVE','SEVEN','SEVER','SEWER','SHAKE',
    'SHALL','SHANK','SHARP','SHEEP','SHEER','SHELF','SHIFT','SHINE',
    'SHINY','SHRUG','SIEGE','SILLY','SINCE','SIXTH','SIXTY','SIZED',
    'SKIMP','SKIRT','SLAIN','SLANG','SLANT','SLASH','SLAVE','SLEEK',
    'SLEEP','SLEET','SLEPT','SLICE','SLIDE','SLIME','SLIMY','SLOOP',
    'SLOSH','SLOTH','SLUMP','SLURP','SLYLY','SMASH','SMELL','SMELT',
    'SMILE','SMITE','SMOKY','SNAIL','SNAKE','SNARL','SNIDE','SNORE',
    'SOLAR','SONAR','SORRY','SOUTH','SPACE','SPANK','SPAWN','SPEED',
    'SPELL','SPEND','SPENT','SPICE','SPIKE','SPILL','SPINE','SPITE',
    'SPLAT','SPOIL','SPOOK','SPOON','SPOUT','SPREE','SPRIG','SQUAD',
    'SQUAT','SQUID','STAFF','STAGE','STAIN','STALE','STALL','STAMP',
    'STAND','STARK','START','STATE','STAYS','STEAL','STEEP','STEER',
    'STERN','STICK','STIFF','STILL','STOMP','STOOL','STOOP','STORY',
    'STOUT','STOMP','STRAY','STRIP','STRUT','STUDY','STUNT','STYLE',
    'SUGAR','SUITE','SULKY','SUNNY','SUPER','SURGE','SWAMP','SWATH',
    'SWEAR','SWEEP','SWIRL','SWOOP','SYNOD','TAFFY','TALON','TASTE',
    'TAUNT','TAWNY','TEETH','TEMPO','TERSE','THORN','THOSE','THUMB',
    'TIARA','TIGER','TIPSY','TIRED','TITAN','TITLE','TODAY','TOKEN',
    'TOPIC','TORCH','TOTAL','TOTEM','TOUCH','TOUGH','TOWEL','TOWER',
    'TOXIC','TRACE','TRASH','TRAWL','TRIAD','TRIAL','TRIBE','TRIPE',
    'TRITE','TROLL','TROOP','TROTH','TROUT','TRUCE','TRULY','TRUMP',
    'TUBER','TULIP','TUMOR','TUNER','TUNIC','TURBO','TWANG','TWEAK',
    'TWERP','TWIST','ULTRA','UNDUE','UNFIT','UNION','UNITE','UNITY',
    'UNTIL','UPPER','UPSET','URBAN','USHER','UTTER','VAGUE','VALID',
    'VALOR','VALUE','VALVE','VAPID','VAULT','VAUNT','VENOM','VERGE',
    'VERSE','VICAR','VIDEO','VIGIL','VIGOUR','VILLA','VIOLA','VIPER',
    'VISIT','VISOR','VISTA','VITAL','VIVID','VIXEN','VOCAL','VODKA',
    'VOILA','VOTER','VOUCH','VOWEL','VULVA','WACKY','WAFER','WALTZ',
    'WARTY','WATER','WEARY','WEAVE','WEDGE','WEEDY','WEIRD','WHELP',
    'WHIFF','WHIRL','WHISK','WHOLE','WHOSE','WIDEN','WIDER','WINCH',
    'WITCH','WITTY','WOMAN','WOMEN','WOODY','WOOZY','WORDY','WRACK',
    'WREAK','WRECK','WRING','WROTE','YEARN','YEAST','YIELD','YOUNG',
    'YOURS','YOUTH','ZESTY','ZILCH','ZIPPY','ZONAL',
]);

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

        if (!VALID_WORDS.has(guessWord)) {
            showMessage('Not a valid word!', '#f87171');
            return;
        }

        const result = checkGuess(guessWord, answer);

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
        marginTop: 8,
        paddingBottom: 20,
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
