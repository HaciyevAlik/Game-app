import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

export default function Leaderboard({ navigation }) {
    const [scores, setScores] = useState([]);

    useEffect(() => {
        const scoresRef = ref(db, 'scores');
        const unsubscribe = onValue(scoresRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const parsed = Object.values(data)
                    .sort((a, b) => a.guesses - b.guesses);
                setScores(parsed);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>🏆 Leaderboard</Text>
            <FlatList
                data={scores}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.row}>
                        <Text style={styles.rank}>#{index + 1}</Text>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.score}>{item.guesses} guesses</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>No scores yet — play Wordle!</Text>
                }
            />
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>← Back</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f11', padding: 24 },
    title: { fontSize: 32, fontWeight: '800', color: '#f0ede8', marginBottom: 24, textAlign: 'center' },
    row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1f', borderRadius: 10, padding: 16, marginBottom: 10 },
    rank: { fontSize: 18, fontWeight: '800', color: '#fbbf24', width: 40 },
    name: { flex: 1, fontSize: 16, color: '#f0ede8', fontWeight: '600' },
    score: { fontSize: 14, color: '#818cf8' },
    empty: { color: '#5a5a6a', textAlign: 'center', marginTop: 40, fontSize: 14 },
    button: { backgroundColor: '#1a1a1f', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
    buttonText: { color: '#f0ede8', fontWeight: '600' },
});
