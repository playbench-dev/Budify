import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, TouchableOpacity } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';
import AsyncStorage from '@react-native-community/async-storage';
import ServerUrl from '../../Common/ServerUrl'
import User from '../../Common/User'
import FetchingIndicator from 'react-native-fetching-indicator'

const TAG = "ChangePassword"
const imgBack = require('../../../assets/ic_back.png');
const imgEyes = require('../../../assets/ic_eyes.png');

export default class ChangePassword extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        currentPwFail: 0, //1-success, 2-fail
        newPwConfirmFail: 0, //1-success, 2-fail
        currentPw: '',
        newPw: '',
        newConfirmPw: '',
        password: '',
        currentPwSecret: true,
        newPwSecret: true,
        newConfirmPwSecret: true,
        userNo: '',
        isFetching: false,
        passwordMin: false,
    }

    componentDidMount() {
        AsyncStorage.getItem('userInfo', (err, result) => {
            if (result != null) {
                const UserInfo = JSON.parse(result);
                console.log(UserInfo)
                this.setState({
                    password: UserInfo.password,
                    userNo: UserInfo.user_no,
                })
            } else {
                this.props.navigation.goBack()
            }
        });
    }

    _NetworkUpdate() {
        this.setState({ isFetching: true })
        var url = "";
        var formBody = '';

        formBody = JSON.stringify({
            "user_no": this.state.userNo,
            "password": `\'${this.state.newPw}\'`,
        });
        url = ServerUrl.UpdateUserUrl

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
                if (json.length > 0) {
                    AsyncStorage.setItem('userInfo', JSON.stringify({
                        'user_no': json[0].user_no || '', 'profileUrl': json[0].avatar_url || '', 'password': json[0].password || '',
                        'nickname': json[0].nickname || '', 'userName': json[0].name || '', 'email': json[0].email || '',
                        'birth': json[0].birth || '', 'gender': json[0].gender || '', 'phone': json[0].phone || '',
                        'auth_provider': json[0].auth_provider || '', 'token': json[0].token || '', 'nationality': json[0].nationality, 'bio': json[0].bio,
                        'bank': json[0].bank, 'account_holder': json[0].account_holder, 'account_number': json[0].account_number,
                    }));
                    User.userNo = json[0].user_no
                    User.profileUrl = json[0].avatar_url
                    User.nickname = json[0].nickname
                    User.userName = json[0].name
                    User.email = json[0].email
                    User.birth = json[0].birth
                    User.gender = json[0].gender
                    User.phone = json[0].phone
                    User.snsLogin = json[0].auth_provider == 'Email' || json[0].auth_provider == '' || json[0].auth_provider == null ? false : true
                    User.level = json[0].level

                    this.setState({ isFetching: false })
                    this.props.navigation.goBack()
                } else {

                }
            })
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                            <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                                <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                    <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                                </View>
                            </TouchableWithoutFeedback>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('profileChangePassword')}</Text>
                        </View>

                        <View>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, marginTop: 24 }}>{I18n.t('profileCurrentPw')}</Text>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center', flexDirection: 'row' }}>
                                <TextInput onChangeText={(text) => { this.setState({ currentPw: text, currentPwFail: 0 }) }} secureTextEntry={this.state.currentPwSecret} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('profileCurrentPw')} autoCapitalize="none" returnKeyType="next"></TextInput>
                                <TouchableOpacity style={{ position: 'absolute', right: 12, width: 19, height: '100%' }} onPress={() => this.setState({ currentPwSecret: this.state.currentPwSecret ? false : true })}>
                                    <Image style={{ width: 19, height: '100%', resizeMode: 'contain' }} source={imgEyes}></Image>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {this.state.currentPwFail == 2 && <Text style={{ fontSize: 14, color: Colors.colorFD6268, fontFamily: 'Raleway-Regular', includeFontPadding: false, marginTop: 4 }}>{I18n.t('profilePwConfirmCurrentPail')}</Text>}

                        <View>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, marginTop: 16 }}>{I18n.t('profileNewPw')}</Text>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center', flexDirection: 'row' }}>
                                <TextInput onChangeText={(text) => { this.setState({ newPw: text.trim(), newPwConfirmFail: 0, passwordMin: text.trim().length > 7 ? false : true }) }} secureTextEntry={this.state.newPwSecret} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('profileNewPw')} autoCapitalize="none" returnKeyType="next"></TextInput>
                                <TouchableOpacity style={{ position: 'absolute', right: 12, width: 19, height: '100%' }} onPress={() => this.setState({ newPwSecret: this.state.newPwSecret ? false : true })}>
                                    <Image style={{ width: 19, height: '100%', resizeMode: 'contain' }} source={imgEyes}></Image>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, marginTop: 16 }}>{I18n.t('profileNewConfirmPw')}</Text>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center', flexDirection: 'row' }}>
                                <TextInput onChangeText={(text) => { this.setState({ newConfirmPw: text.trim(), newPwConfirmFail: 0, passwordMin: text.trim().length > 7 ? false : true }) }} secureTextEntry={this.state.newConfirmPwSecret} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('profileNewConfirmPw')} autoCapitalize="none" returnKeyType="next"></TextInput>
                                <TouchableOpacity style={{ position: 'absolute', right: 12, width: 19, height: '100%' }} onPress={() => this.setState({ newConfirmPwSecret: this.state.newConfirmPwSecret ? false : true })}>
                                    <Image style={{ width: 19, height: '100%', resizeMode: 'contain' }} source={imgEyes}></Image>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {this.state.passwordMin == true && <Text style={{ fontSize: 14, color: Colors.colorFD6268, marginTop: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('passwordMin')}</Text>}
                        {this.state.newPwConfirmFail == 2 && <Text style={{ fontSize: 14, color: Colors.colorFD6268, fontFamily: 'Raleway-Regular', includeFontPadding: false, marginTop: 4 }}>{I18n.t('profilePwConfirmNewPail')}</Text>}
                    </View>

                    <TouchableWithoutFeedback onPress={() => this.setState({ currentPwFail: this.state.password == this.state.currentPw ? 1 : 2, newPwConfirmFail: this.state.newPw == this.state.newConfirmPw ? 1 : 2 }, () => { this.state.currentPwFail == 1 && this.state.newPwConfirmFail == 1 && this._NetworkUpdate() })} disabled={this.state.currentPw.length > 0 && this.state.newPw.length > 0 && this.state.newConfirmPw.length > 0 ? false : true}>
                        <View style={{ height: 48, backgroundColor: this.state.currentPw.length > 0 && this.state.newPw.length > 0 && this.state.newConfirmPw.length > 0 ? Colors.color2D7DC8 : Colors.colorBABABA, marginBottom: 20, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, }}>{I18n.t('profileChange')}</Text>
                        </View>
                    </TouchableWithoutFeedback>

                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView >
        )
    }
}