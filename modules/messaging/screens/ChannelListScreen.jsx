import { useState } from 'react';
import {
  View, Text, FlatList,
  TouchableOpacity, StyleSheet, SafeAreaView
} from 'react-native';
import ChatScreen from './ChatScreen';

const CHANNELS = [
  { id: 'general', name: 'general', lastMessage: 'Dad: who wants chess? ♟️', unread: 3 },
  { id: 'game-room', name: 'game-room', lastMessage: 'Sara: my turn!', unread: 0 },
  { id: 'announcements', name: 'announcements', lastMessage: 'Sunday dinner @ 6pm', unread: 1 },
];

export default function ChannelListScreen({navigation}) {
  const [activeChannel, setActiveChannel] = useState(null);

  if (activeChannel) {
  return (
    <View style={{ flex: 1 }}>
      <ChatScreen channelId={activeChannel} onBack={() => setActiveChannel(null)} />
    </View>
  );
}

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Text style={styles.backText}>← Lobby</Text>
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Family Hub 🏠</Text>
  <Text style={styles.headerSub}>{CHANNELS.length} channels</Text>
</View>

      <FlatList
        data={CHANNELS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.channelRow}
            onPress={() => setActiveChannel(item.id)}
          >
            <View style={styles.channelIcon}>
              <Text style={styles.channelIconText}>#</Text>
            </View>
            <View style={styles.channelInfo}>
              <Text style={styles.channelName}># {item.name}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#fff',
  padding: 16,
  paddingTop: 64,
  borderBottomWidth: 0.5,
  borderBottomColor: '#e0e0e0', 
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    gap: 12,
  },
  channelIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#E6F1FB',
    alignItems: 'center', justifyContent: 'center',
  },
  channelIconText: { fontSize: 18, color: '#185FA5', fontWeight: '700' },
  channelInfo: { flex: 1 },
  channelName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  lastMessage: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: {
    backgroundColor: '#185FA5', borderRadius: 10,
    minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  separator: { height: 0.5, backgroundColor: '#e0e0e0' },
  backText: {
  fontSize: 15,
  color: '#185FA5',
  fontWeight: '500',
  marginBottom: 6,
},
});