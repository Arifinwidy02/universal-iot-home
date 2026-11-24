import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DeviceListScreen } from '../screens/DeviceListScreen';

export type RootStackParamList = {
  DeviceList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="DeviceList"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="DeviceList" component={DeviceListScreen} />
    </Stack.Navigator>
  );
}
