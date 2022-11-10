/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging from '@react-native-firebase/messaging';
import codePush from 'react-native-code-push';

const codePushOptions = {
    checkFrequency: codePush.CheckFrequency.ON_APP_START,
    installMode: codePush.InstallMode.IMMEDIATE,
}

if (Platform.OS == 'android') {
    PushNotification.createChannel(
        {
            channelId: "test", // (required)
            channelName: "test", // (required)
            channelDescription: "test", // (optional) default: undefined.
            soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
            importance: 4, // (optional) default: 4. Int value of the Android notification importance
            vibrate: true, // (optional) default: true. Creates the default vibration patten if true.

        },
        (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
}
AppRegistry.registerComponent(appName, () => codePush(codePushOptions)(App));

