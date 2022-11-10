/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { Linking } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';

import Stack from './src/Common/Stack'
import { navigationRef } from './src/Common/RootNavigation'
import AsyncStorage from '@react-native-community/async-storage';
import I18n from './src/lang/i18n'
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import User from './src/Common/User'

const TAG = "App";

class App extends React.Component {
  constructor(props) {
    super(props)
  }

  async componentDidMount() {
    this.handleDeepLink();
    console.log(TAG, messaging().hasPermission());
    this._Notification();
    console.log('I18n ' + I18n.currentLocale())
    AsyncStorage.getItem('appLanguage', (err, result) => {
      if (result != null) {
        I18n.locale = result;
      } else {
        if (I18n.currentLocale() == 'ko-KR') {
          AsyncStorage.setItem('appLanguage', 'ko-KR')
          I18n.locale = 'ko-KR'
        } else if (I18n.currentLocale() == 'ja-JP') {
          AsyncStorage.setItem('appLanguage', 'ja-JP')
          I18n.locale = 'ja-JP'
        } else {
          AsyncStorage.setItem('appLanguage', 'en-US')
          I18n.locale = 'en-US'
        }
      }
    })
  }

  handleDeepLink() {
    Linking.getInitialURL().then(res => { //앱이 실행되지 않은 상태에서 요청이 왔을 때
      if (res == null || res == undefined || res == "") {
        return;
      } else {
        var params = urlParamtersToJson(res);
        console.log(params);
      }
    });
    Linking.addEventListener('url', (e) => {        // 앱이 실행되어있는 상태에서 요청이 왔을 때 처리하는 이벤트 등록
      var params = urlParamtersToJson(e.url);
      if (e.url == null || e.url == undefined || e.url == "") {
        return;
      } else {
        console.log(params);
      }
    });
  }

  componentWillUnmount() {
    // this.messageListener();
  }

  _Notification() {
    this.messageListener = messaging().onMessage(async remoteMessage => {
      PushNotification.configure({
        onNotification: function (notification) {
          // const channerId = notification.data.android_channel_id;
          console.log("NOTIFICATION:", "" + JSON.stringify(notification));
          console.log("channel : " + JSON.stringify(remoteMessage));
          // if (notification.foreground && notification.userInteraction) {
          //   if (remoteMessage.data.android_channel_id == "medicine") {
          //     navigationRef.current.navigate('MedicineCalendar', { orderNo: notification.no, medicineUpdate: Home._MedicineUpdate })
          //   } else if (remoteMessage.data.android_channel_id == "embryo") {
          //     navigationRef.current.navigate('CellDevelop', { orderNo: notification.no })
          //   } else if (remoteMessage.data.android_channel_id == "home") {
          //     navigationRef.current.navigate('Home', { orderNo: notification.no })
          //   } else if (remoteMessage.data.android_channel_id == "empty1") {
          //     navigationRef.current.navigate('AlarmList', { orderNo: notification.no })
          //   } else {
          //     navigationRef.current.navigate('Home', { orderNo: notification.no })
          //   }
          // }
        }
      });

      PushNotification.localNotification({
        channelId: remoteMessage.data.android_channel_id,
        vibrate: true,
        vibration: 300,
        priority: 'high',
        visibility: 'public',
        importance: 'hight',
        title: remoteMessage.data.title,
        message: remoteMessage.data.body, // (required)
        playSound: false,
        autoCancel: true,
        smallIcon: 'ic_logo',
        largeIcon: remoteMessage.data.image,
        no: remoteMessage.data.no,
        picture: remoteMessage.data.image,
        largeIconUrl: remoteMessage.data.image
      });

      // console.log("App", remoteMessage.data.image)
    });

    //background
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("App : ", 'remote : ' + JSON.stringify(remoteMessage));

      //  여기에 로직을 작성한다.
      //  remoteMessage.data로 메세지에 접근가능
      //  remoteMessage.from 으로 topic name 또는 message identifier
      //  remoteMessage.messageId 는 메시지 고유값 id
      //  remoteMessage.notification 메시지와 함께 보내진 추가 데이터
      //  remoteMessage.sentTime 보낸시간
    });

    // messaging().getToken().then(token => AsyncStorage.setItem('token',token));

    messaging().getToken().then(token => console.log(token));
    messaging().getToken().then(token => User.fcmToken = token);
    console.log(User.fcmToken)

    //ios background open app
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        "App onNotificationOpenedApp : ",
        remoteMessage.data
      );
      navigationRef.current.navigate('Splash', { orderNo: remoteMessage.data.no, channelId: remoteMessage.data.android_channel_id })
      // navigation.navigate(remoteMessage.data.type);
    });

    //android background open app
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            "App getInitialNotification : ",
            remoteMessage.data
          );
          console.log(TAG, "id : " + remoteMessage.data.android_channel_id + " no : " + remoteMessage.data.no);
          navigationRef.current.navigate('Splash', { orderNo: remoteMessage.data.no, channelId: remoteMessage.data.android_channel_id })
        }
      });
  }

  render() {
    return (
      <NavigationContainer ref={navigationRef}>
        <Stack />
        <Toast />
      </NavigationContainer>
    );
  }
}

export default App;