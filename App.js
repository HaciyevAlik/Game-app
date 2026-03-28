import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Lobby from './screens/Lobby';
import Game from './screens/Game';
import Chat from './screens/Chat';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Lobby" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Lobby" component={Lobby} />
          <Stack.Screen name="Game" component={Game} />
          <Stack.Screen name="Chat" component={Chat} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}