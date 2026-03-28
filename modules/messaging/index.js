import { AuthProvider } from '../../shared/AuthContext';
import ChannelListScreen from './screens/ChannelListScreen';

export default function MessagingModule() {
  return (
    <AuthProvider>
      <ChannelListScreen />
    </AuthProvider>
  );
}