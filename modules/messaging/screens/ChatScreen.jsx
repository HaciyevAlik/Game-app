import { useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../shared/AuthContext';

export default function ChatScreen({ channelId = 'general', onBack }) {
  const insets = useSafeAreaInsets();
  const { userId, username } = useAuth();
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hey everyone! 👋', userId: 'dad', username: 'Dad' },
    { id: '2', text: 'Who wants to play a game? 🎮', userId: 'sara', username: 'Sara' },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      userId: userId || 'me',
      username: username || 'You',
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.userId === (userId || 'me');
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.username?.[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          {!isMe && <Text style={styles.senderName}>{item.username}</Text>}
          <Text style={isMe ? styles.bubbleTextMe : styles.bubbleTextThem}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top - 24 }]}>
      <View style={styles.header}>
  <TouchableOpacity onPress={onBack} style={styles.backButton}>
    <Text style={styles.backText}>← Back</Text>
  </TouchableOpacity>
  <Text style={styles.headerText}># {channelId}</Text>
  <Text style={styles.onlineText}>4 online</Text>
</View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  headerText: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  onlineText: { fontSize: 12, color: '#22c55e', marginTop: 2 },
  messageList: { padding: 16, gap: 12 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  messageRowMe: { flexDirection: 'row-reverse' },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#B5D4F4',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '600', color: '#0C447C' },
  bubble: { maxWidth: '75%', padding: 10, borderRadius: 16 },
  bubbleMe: { backgroundColor: '#185FA5', borderBottomRightRadius: 4 },
  bubbleThem: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  senderName: { fontSize: 11, color: '#888', marginBottom: 3 },
  bubbleTextMe: { color: '#fff', fontSize: 14 },
  bubbleTextThem: { color: '#1a1a1a', fontSize: 14 },
  backButton: {
    marginBottom: 4,
  },
  backText: {
    fontSize: 15,
    color: '#185FA5',
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1, backgroundColor: '#f5f5f5',
    borderRadius: 20, paddingHorizontal: 14,
        paddingVertical: 8, fontSize: 14, color: '#1a1a1a',
  },
  sendButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#185FA5',
    alignItems: 'center', justifyContent: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});