import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../../shared/AuthContext';
import ChannelListScreen from './screens/ChannelListScreen';

export default function MessagingModule({ navigation }) {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ChannelListScreen navigation={navigation} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}