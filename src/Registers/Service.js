import React from 'react';
import { SafeAreaView, View, Text, Image, TouchableWithoutFeedback, ScrollView, Platform } from 'react-native';
import Webview from 'react-native-webview';
const TAG = "Service";
const imgBack = require('../../assets/ic_back.png');

export default class Service extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        webheight: 100,
    }

    _html() {
        if (Platform.OS === 'ios' && this.props.route.params.mode == '1') {
            return (
                <Webview style={{ backgroundColor: 'white', flex: 1 }} source={require('../../assets/service_en.html')} javaScriptEnabled={true} domStorageEnabled={true}></Webview>
            )
        } else if (Platform.OS === 'ios' && this.props.route.params.mode == '2') {
            return (
                <Webview style={{ backgroundColor: 'white', flex: 1 }} source={require('../../assets/person_en.html')} javaScriptEnabled={true} domStorageEnabled={true}></Webview>
            )
        } else if (Platform.OS === 'android' && this.props.route.params.mode == '1') {
            return (
                <Webview style={{ backgroundColor: 'white', flex: 1 }} source={{ uri: 'file:///android_asset/service_en.html' }}></Webview>
            )
        } else if (Platform.OS === 'android' && this.props.route.params.mode == '2') {
            return (
                <Webview style={{ backgroundColor: 'white', flex: 1 }} source={{ uri: 'file:///android_asset/person_en.html' }}></Webview>
            )
        }
    }

    render() {
        let title = '';

        if (this.props.route.params.mode == '1') {
            title = "개인정보처리 약관"
        } else if (this.props.route.params.mode == '2') {
            title = "개인정보 제3자 제공 동의"
        } else if (this.props.route.params.mode == '3') {
            title = "서비스 이용약관"
        }

        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: '#fff', paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ width: '100%', height: 40 }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 40, height: 40, justifyContent: 'center' }}>
                                <Image source={imgBack} style={{ width: 24, height: 24, resizeMode: 'contain', }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>

                    <View style={{ backgroundColor: 'white', flex: 1, }}>
                        {this._html()}
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}