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
    const [mode, setMode] = useState(null); // 'create' or 'join'

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
// TODO: save room to Firebase with this code
// navigation.navigate('Game', { name, roo