import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
} from 'react-native';

export default function Lobby({ navigation }) {
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [mode, setMode] = useState(null);

    const generateRoomCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const handleCreate = () => {
        if (!name.trim()) {
            Alert.alert('Enter your name first!');
            return;
        }
        const code = generateRoomCode();
        Alert.alert(`Your room code is: ${code}`, 'Share this with your family!');
        navigation.navigate('Game', { name, roomCode: code, isHost: true });
    };

    const handleJoin = () => {
        if (!name.trim()) {
            Alert.alert('Enter your name first!');
            return;
        }
        if (!roomCode.trim()) {
            Alert.alert('Enter a room code!');
            return;
        }
        navigation.navigate('Game', { name, roomCode, isHost: false });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>FamHack 🏠</Text>
            <Text style={styles.subtitle}>Family Game Night</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
            />

            {!mode && (
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.createButton]}
                        onPress={() => setMode('create')}
                    >
                        <Text style={styles.buttonText}>Create Room</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.joinButton]}
                        onPress={() => setMode('join')}
                    >
                        <Text style={styles.buttonText}>Join Room</Text>
                    </TouchableOpacity>
                </View>
            )}

            {mode === 'create' && (
                <View style={styles.section}>
                    <TouchableOpacity style={[styles.button, styles.createButton]} onPress={handleCreate}>
                        <Text style={styles.buttonText}>Generate Room Code</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMode(null)}>
                        <Text style={styles.back}>← Back</Text>
                    </TouchableOpacity>
                </View>
            )}

            {mode === 'join' && (
                <View style={styles.section}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter room code"
                        placeholderTextColor="#888"
                        value={roomCode}
                        onChangeText={setRoomCode}
                        autoCapitalize="characters"
                    />
                    <TouchableOpacity style={[styles.button, styles.joinButton]} onPress={handleJoin}>
                        <Text style={styles.buttonText}>Join!</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMode(null)}>
                        <Text style={styles.back}>← Back</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 40,
    },
    input: {
        width: '100%',
        backgroundColor: '#1e1e1e',
        color: '#fff',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    createButton: {
        backgroundColor: '#4f46e5',
    },
    joinButton: {
        backgroundColor: '#059669',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        width: '100%',
        alignItems: 'center',
        gap: 12,
    },
    back: {
        color: '#888',
        marginTop: 8,
        fontSize: 14,
    },
});