import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import I18n from './lang/i18n';
import Colors from './Common/Colos';
import FetchingIndicator from 'react-native-fetching-indicator'
import ServerUrl from './Common/ServerUrl'

const TAG = "PasswordSearch"
const imgBack = require('../assets/ic_back.png');
const imgEyes = require('../assets/ic_eyes.png');
const imgFacebook = require('../assets/ic_facebook.png');
const imgGoogle = require('../assets/ic_google.png');
const imgApple = require('../assets/ic_apple.png');

export default class PasswordSearch extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        isFetching: false,
        email: '',
        emailFail: 0, // 1-success, 2-fail, 3- social 
    }

    componentDidMount() {
        console.log('abcd')
    }

    _SelectUser() {
        this.setState({ isFetching: true })
        var url = "";
        var formBody = '';
        formBody = JSON.stringify({
            'conditions': [{
                "q": "=",
                "f": "email",
                "v": `\'${this.state.email}\'`
            }]
        });

        url = ServerUrl.SelectUserUrl

        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'default',
            body: formBody,
        }).then(
            response => response.json()
        ).then(
            json => {
                console.log(TAG, json);
                if (json.length == 1) {
                    if (json[0].auth_provider == 'Facebook' || json[0].auth_provider == 'Google' || json[0].auth_provider == 'Apple') {
                        this.setState({ isFetching: false, emailFail: 3 })
                    } else {
                        this.setState({ isFetching: false, emailFail: 1 })
                    }
                } else {
                    this.setState({ isFetching: false, emailFail: 2 })
                }
            })
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('pwdTitle')}</Text>
                    </View>

                    <Text style={{ fontSize: 16, color: Colors.color000000, marginTop: 10, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('pwdInfor')}</Text>

                    <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginTop: 36 }}>{I18n.t('email')}</Text>
                    <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center' }}>
                        <TextInput onChangeText={(text) => { this.setState({ email: text.trim() }) }} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('emailHint')} autoCapitalize="none" returnKeyType="next"></TextInput>
                    </View>

                    {this.state.emailFail != 0 && <Text style={{ fontSize: 14, color: (this.state.emailFail == 1 ? Colors.color2D7DC8 : Colors.colorFD6268), marginTop: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{(this.state.emailFail == 1 ? I18n.t('pwdEmailSuccess') : this.state.emailFail == 2 ? I18n.t('pwdEmailSuccess') : I18n.t('emailCheckSNS'))}</Text>}

                    <View style={{ flex: 1 }}></View>

                    <TouchableOpacity onPress={() => this._SelectUser()}>
                        <View style={{ width: '100%', height: 48, backgroundColor: Colors.color2D7DC8, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginBottom: 49, }}>
                            <Text style={{ color: Colors.colorFFFFFF, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('pwdButtonText')}</Text>
                        </View>
                    </TouchableOpacity>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}