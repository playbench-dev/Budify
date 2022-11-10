import React from 'react'
import { SafeAreaView, View, Text, Image, ActivityIndicator, TouchableOpacity, Linking } from 'react-native'
import FastImage from 'react-native-fast-image'
import ImageViewer from 'react-native-image-zoom-viewer';
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import * as Utils from '../../Common/Utils'
import * as NetworkCall from '../../Common/NetworkCall'
import ServerUrl from '../../Common/ServerUrl'
import User from '../../Common/User';
import FetchingIndicator from 'react-native-fetching-indicator'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Moment from 'moment';
import Webview from 'react-native-webview'

const TAG = "PaymentWeb"
const imgBack = require('../../../assets/ic_back.png');

export default class PaymentWeb extends React.Component {
    constructor(props) {
        super(props)

    }

    state = {
        status: 1
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, }}>
                    <TouchableOpacity onPress={() => this.state.status == 1 ? this.props.navigation.goBack() : this.props.navigation.reset({ index: 1, routes: [{ name: 'Main' }, { name: 'MyExperiences' }] })}>
                        <View style={{ paddingLeft: 4, alignItems: 'center', paddingTop: 0, flexDirection: 'row', height: 50, }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            {/* <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('PaymentTitle')}</Text> */}
                        </View>
                    </TouchableOpacity>
                    <Webview onMessage={(event) => {
                        event.nativeEvent.data == 'success' ? this.setState({ status: 2 }, () => this.props.navigation.reset({ index: 1, routes: [{ name: 'Main' }, { name: 'MyExperiences' }] })) : event.nativeEvent.data == 'back' ? this.setState({ status: 2 }) : 'null'
                        console.log(event.nativeEvent.data)
                    }} style={{ backgroundColor: 'white', height: this.state.webheight, flex: 1, }} source={{ uri: this.props.route.params.url }}
                        onShouldStartLoadWithRequest={(event) => {
                            console.log('onShouldstart');
                            console.log(event.url);
                            // if (event.url.startsWith("http")) {
                            //     Linking.openURL(event.url);
                            // }
                            if (
                                Platform.OS === 'android' &&
                                event.url.startsWith("intent")
                            ) {
                                SendIntentAndroid.openChromeIntent(event.url)
                                    // SendIntentAndroid.openAppWithUri(event.url)
                                    .then((isOpened) => {
                                        if (!isOpened) {
                                            console.log('앱 실행에 실패했습니다')
                                        }
                                        return false;
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                                return false;
                            }
                            if (Platform.OS === 'ios') {
                                return true;
                            }
                            return true;
                        }} />
                    {/* <ActivityIndicator color="#234356" size="large" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}></ActivityIndicator> */}
                </View>
            </SafeAreaView>
        )
    }
}