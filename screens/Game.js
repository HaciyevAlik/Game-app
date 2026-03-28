import { View, Text } from 'react-native';

export default function Game({ route }) {
    const { name, roomCode } = route.params;
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f0f' }}>
            <Text style={{ color: '#fff', fontSize: 24 }}>Game Screen</Text>
            <Text style={{ color: '#888' }}>Room: {roomCode} | Player: {name}</Text>
        </View>
    );
}