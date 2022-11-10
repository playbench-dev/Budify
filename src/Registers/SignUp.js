import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Platform, TouchableOpacity } from 'react-native';
import I18n from '../lang/i18n';
import Colors from '../Common/Colos';
import AsyncStorage from '@react-native-community/async-storage';
import FetchingIndicator from 'react-native-fetching-indicator'
import { LoginButton, AccessToken, GraphRequest, GraphRequestManager, LoginManager } from 'react-native-fbsdk';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import FirebaseApp from '@react-native-firebase/app'
import auth, { firebase } from '@react-native-firebase/auth'
import { appleAuth, AppleButton, appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import ServerUrl from '../Common/ServerUrl'
import { v4 as uuid } from 'uuid'
import jwt_decode from 'jwt-decode'
import User from '../Common/User'
import Moment from 'moment'

const TAG = "SignUp"
const imgBack = require('../../assets/ic_back.png');
const imgEyes = require('../../assets/ic_eyes.png');
const imgFacebook = require('../../assets/ic_facebook.png');
const imgGoogle = require('../../assets/ic_google.png');
const imgApple = require('../../assets/ic_apple.png');

export default class SignUp extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        email: '',
        emailCheck: false,
        password: '',
        passwordConfirm: '',
        passwordSecret: true,
        passwordConfirmSecret: true,
        snsType: 0, // 1 - facebook, 2- google, 3- apple
        snsId: '',
        loginType: 0,
        passwordMin: false,
        appleEmail: '',
    }

    componentDidMount() {

    }

    getInfoFromToken = token => {
        const PROFILE_REQUEST_PARAMS = {
            fields: {
                string: 'id,name,first_name,last_name',
            },
        };
        const profileRequest = new GraphRequest(
            '/me',
            { token, parameters: PROFILE_REQUEST_PARAMS },
            (error, user) => {
                if (error) {
                    console.log('login info has error: ' + error);
                } else {
                    this.setState({
                        snsId: user.id,
                        snsType: 1,
                        loginType: 1,
                    })
                    this._SelectUser()
                    console.log('result:', user.id);
                }
            },
        );
        new GraphRequestManager().addRequest(profileRequest).start();
    };

    loginWithFacebook = () => {
        // Attempt a login using the Facebook login dialog asking for default permissions.
        LoginManager.logInWithPermissions(['public_profile']).then(
            login => {
                if (login.isCancelled) {
                    console.log('Login cancelled');
                } else {
                    AccessToken.getCurrentAccessToken().then(data => {
                        const accessToken = data.accessToken.toString();
                        this.getInfoFromToken(accessToken);
                    });
                }
            },
            error => {
                console.log('Login fail with error: ' + error);
            },
        );
    };

    onGoogleButtonPress = async () => {
        this.state.snsType = 'google'
        try {
            await GoogleSignin.signOut();
            await GoogleSignin.hasPlayServices()
            const { accessToken, idToken } = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken, accessToken);
            const test = await auth().signInWithCredential(googleCredential)
            console.log(test.user.uid)
            this.state.snsId = test.user.uid
            this.state.loginType = 1
            this.state.snsType = 2
            this._SelectUser()
        } catch (error) {
            console.log(error)
        }
    }

    onAppleButtonPress = async () => {
        this.state.snsType = 'apple'
        // performs login request
        if (Platform.OS == 'ios') {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });

            console.log(appleAuthRequestResponse.user)

            // get current authentication state for user
            // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
            const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

            // use credentialState response to ensure the user is authenticated
            if (credentialState === appleAuth.State.AUTHORIZED) {
                // user is authenticated
            }
            const decodedIdToken = jwt_decode(appleAuthRequestResponse.identityToken);
            this.state.snsId = appleAuthRequestResponse.user
            this.state.loginType = 1
            this.state.snsType = 3
            this.state.appleEmail = decodedIdToken.email
            this._SelectUser()
        } else {
            const rawNonce = uuid();
            const state = uuid();

            // Configure the request
            appleAuthAndroid.configure({
                // The Service ID you registered with Apple
                clientId: 'org.ReactNative.budify',

                // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
                // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
                redirectUri: 'https://budify.io/auth/callback',

                // The type of response requested - code, id_token, or both.
                responseType: appleAuthAndroid.ResponseType.ALL,

                // The amount of user information requested from Apple.
                scope: appleAuthAndroid.Scope.ALL,

                // Random nonce value that will be SHA256 hashed before sending to Apple.
                nonce: rawNonce,

                // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
                state,
            });

            // Open the browser window for user sign in
            const response = await appleAuthAndroid.signIn();

            // console.log(parseJwt(response.id_token))
            const decodedIdToken = jwt_decode(response.id_token);
            console.log(decodedIdToken.sub)
            console.log(decodedIdToken.email)

            this.state.snsId = decodedIdToken.sub
            this.state.loginType = 1
            this.state.snsType = 3
            this.state.appleEmail = decodedIdToken.email
            this._SelectUser()
            // Send the authorization code to your backend for verification
        }
    }

    validate = (email) => {
        const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        return expression.test(String(email).toLowerCase())
    }

    _Login() {
        var url = "";
        var formBody = '';

        if (this.state.loginType == 0) {
            formBody = JSON.stringify({
                'email': this.state.email.trim(),
                'password': this.state.password.trim(),
                'fcm_token': User.fcmToken,
                'last_login': Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                'os': Platform.OS == 'android' ? '1' : '2',
                'conditions': []
            });
            url = ServerUrl.LoginUrl
        } else {
            formBody = JSON.stringify({
                'provider': this.state.snsType == 1 ? 'Facebook' : this.state.snsType == 2 ? 'Google' : 'Apple',
                'token': this.state.snsId,
                'fcm_token': User.fcmToken,
                'last_login': Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                'os': Platform.OS == 'android' ? '1' : '2',
                'conditions': []
            });
            url = ServerUrl.LoginSNSUrl
        }

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

                    AsyncStorage.getItem('firstRegion', (err, result) => {
                        if (result != null) {
                            this.props.navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
                        } else {
                            this.props.navigation.reset({ index: 0, routes: [{ name: 'SignUpRegion', }] })
                        }
                    })
                    this.setState({ isFetching: false })
                } else {
                    this.setState({
                        isFetching: false,
                        loginFail: true
                    })
                }
            })
    }

    _SelectUser() {
        this.setState({ isFetching: true })
        var url = "";
        var formBody = '';
        formBody = JSON.stringify({
            'conditions': [{
                "q": "=",
                "f": "token",
                "v": `\'${this.state.snsId}\'`
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
                    this._Login()
                } else {
                    this.props.navigation.navigate('SignUpProfile', { loginType: this.state.loginType, snsType: this.state.snsType, snsId: this.state.snsId, appleEmail: this.state.appleEmail })
                }
            })
    }

    _SelectEmailUser() {
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
                    this.setState({
                        isFetching: false,
                        emailCheck: true,
                    })
                } else {
                    this.props.navigation.navigate('SignUpProfile', { email: this.state.email, password: this.state.password, loginType: 0 })
                    this.setState({
                        isFetching: false,
                        emailCheck: false,
                    })
                }
            })
    }

    render() {
        console.log(this.validate(this.state.email))
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('signUp')}</Text>
                    </View>

                    <ScrollView style={{ marginTop: 32 }} >
                        <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('email')}</Text>
                        <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center' }}>
                            <TextInput onChangeText={(text) => { this.setState({ email: text }) }} onFocus={(value) => console.log(value)} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} onChangeText={(value) => this.setState({ email: value.trim() })} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('emailHint')} autoCapitalize="none" returnKeyType="next"></TextInput>
                        </View>

                        {this.state.emailCheck == true && <Text style={{ fontSize: 14, color: Colors.colorFD6268, marginTop: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('emailCheckFail')}</Text>}

                        <Text style={{ fontSize: 16, color: Colors.color000000, marginTop: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('password')}</Text>
                        <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4 }}>
                            <TextInput style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} secureTextEntry={this.state.passwordSecret} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('passwordHint')} onChangeText={(value) => this.setState({ password: value.trim(), passwordMin: value.trim().length > 7 ? false : true })} autoCapitalize="none"></TextInput>
                            <TouchableOpacity style={{ position: 'absolute', right: 12, width: 19, height: '100%', }} onPress={() => this.setState({ passwordSecret: this.state.passwordSecret == true ? false : true })}>
                                <Image style={{ width: 19, height: '100%', resizeMode: 'contain' }} source={imgEyes}></Image>
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: 16, color: Colors.color000000, marginTop: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('passwordConfirm')}</Text>
                        <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4 }}>
                            <TextInput style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} secureTextEntry={this.state.passwordConfirmSecret} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('passwordHint')} onChangeText={(value) => this.setState({ passwordConfirm: value.trim(), passwordMin: value.trim().length > 7 ? false : true })} autoCapitalize="none"></TextInput>
                            <TouchableOpacity style={{ position: 'absolute', right: 12, width: 19, height: '100%', }} onPress={() => this.setState({ passwordConfirmSecret: this.state.passwordConfirmSecret == true ? false : true })}>
                                <Image style={{ width: 19, height: '100%', resizeMode: 'contain' }} source={imgEyes}></Image>
                            </TouchableOpacity>
                        </View>

                        {this.state.passwordMin == true && <Text style={{ fontSize: 14, color: Colors.colorFD6268, marginTop: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('passwordMin')}</Text>}

                        <TouchableWithoutFeedback onPress={() => this._SelectEmailUser()} disabled={((this.state.email.length > 0 && this.validate(this.state.email)) && (this.state.password == this.state.passwordConfirm) && this.state.password.length > 7) ? false : true}>
                            <View style={{ width: '100%', height: 48, backgroundColor: ((this.state.email.length && this.validate(this.state.email)) > 0 && (this.state.password == this.state.passwordConfirm) && this.state.password.length > 0) ? Colors.color2D7DC8 : Colors.colorBABABA, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginTop: 36 }}>
                                <Text style={{ color: Colors.colorFFFFFF, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('signUp')}</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <View style={{ marginTop: 36, width: '100%', height: 1, backgroundColor: Colors.colorD0D0D0 }}></View>

                        <TouchableWithoutFeedback onPress={() => this.loginWithFacebook()}>
                            <View style={{ width: '100%', height: 48, backgroundColor: Colors.color2D7DC8, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginTop: 20, flexDirection: 'row' }}>
                                <Image source={imgFacebook} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                                <Text style={{ color: Colors.colorFFFFFF, fontSize: 14, marginLeft: 6, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('facebookStart')}</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback onPress={() => this.onGoogleButtonPress()}>
                            <View style={{ width: '100%', height: 48, backgroundColor: Colors.colorF8F8F8, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginTop: 12, flexDirection: 'row' }}>
                                <Image source={imgGoogle} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                                <Text style={{ color: Colors.color000000, fontSize: 14, marginLeft: 6, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('googleStart')}</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback onPress={() => this.onAppleButtonPress()}>
                            <View style={{ width: '100%', height: 48, backgroundColor: Colors.color000000, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginTop: 12, flexDirection: 'row' }}>
                                <Image source={imgApple} style={{ width: 36, height: 36, resizeMode: 'contain' }}></Image>
                                <Text style={{ color: Colors.colorFFFFFF, fontSize: 14, marginLeft: 6, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('appleStart')}</Text>
                            </View>
                        </TouchableWithoutFeedback>


                    </ScrollView>

                </View>
            </SafeAreaView>
        )
    }
}