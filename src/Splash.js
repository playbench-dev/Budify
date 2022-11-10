import React from 'react'
import { SafeAreaView, View, Animated } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import Colors from './Common/Colos'
import User from './Common/User'
import ServerUrl from './Common/ServerUrl'
import Moment from 'moment'
import * as NetworkCall from './Common/NetworkCall'

const imgLogo = require('../assets/ic_splash_logo.png');

const TAG = "Splash"

export default class Splash extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        animation: new Animated.Value(0),
        email: '',
        password: '',
        token: '',
        provider: '',
    }

    componentDidMount() {

        Animated.timing(
            this.state.animation,
            {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            }
        ).start((o) => {
            if (o.finished) {

                // this.props.navigation.reset({ index: 0, routes: [{ name: 'HostExperiencesInsert03' }] })

                this.Country();

                //     remoteConfig().setDefaults({ version: '1', check: false })
                //       .then(() => remoteConfig().fetchAndActivate())
                //       .then((fetchedRemotely) => {
                //         if (Platform.OS === 'android') {
                //           console.log(TAG, remoteConfig().getValue('version'));
                //           console.log(TAG, remoteConfig().getValue('check'));
                //           console.log(`VersionInfo.appVersion : ${VersionInfo.buildVersion} , fetchedRemotely : ${fetchedRemotely}`)
                //           if (parseInt(remoteConfig().getValue('version').asString()) <= parseInt(VersionInfo.buildVersion)) {
                //             AsyncStorage.getItem('userInfo', (err, result) => {
                //               if (result != null) {
                //                 const UserInfo = JSON.parse(result);
                //                 console.log(TAG, UserInfo.user_name + " " + UserInfo.patient_no);
                //                 this.state.name = UserInfo.user_name;
                //                 this.state.patientNo = UserInfo.patient_no;
                //                 this._Login();
                //                 // this.props.navigation.reset({index:0, routes:[{name: 'AgreeDetail',mode : '2'}]})
                //               } else {
                //                 this.props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
                //               }
                //             });
                //           } else {
                //             this.setState({
                //               oneBtnDialogVisible: true,
                //             })
                //           }
                //         } else {
                //           console.log(TAG, remoteConfig().getValue('version'));
                //           console.log(TAG, remoteConfig().getValue('check'));
                //           console.log(`VersionInfo.appVersion : ${VersionInfo.appVersion} , fetchedRemotely : ${fetchedRemotely}`)
                //           if (parseInt(remoteConfig().getValue('version').asString().replace('.', '')) <= parseInt(VersionInfo.appVersion.replace('.', ''))) {
                //             AsyncStorage.getItem('userInfo', (err, result) => {
                //               if (result != null) {
                //                 const UserInfo = JSON.parse(result);
                //                 console.log(TAG, UserInfo.user_name + " " + UserInfo.patient_no);
                //                 this.state.name = UserInfo.user_name;
                //                 this.state.patientNo = UserInfo.patient_no;
                //                 this._Login();
                //                 // this.props.navigation.reset({index:0, routes:[{name: 'AgreeDetail',mode : '2'}]})
                //               } else {
                //                 this.props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
                //               }
                //             });
                //           } else {
                //             this.setState({
                //               oneBtnDialogVisible: true,
                //             })
                //           }
                //         }
                //       })
            }
        });
    }

    async Country() {
        console.log('aa')
        let url = ''
        let formBody = ''
        url = ServerUrl.SelectCountry
        formBody = JSON.stringify({
            "conditions": []
        })
        User.country = await NetworkCall.Select(url, formBody)

        url = ServerUrl.SelectCity
        User.city = await NetworkCall.Select(url, formBody)

        url = ServerUrl.SelectRegion
        User.region = await NetworkCall.Select(url, formBody)

        url = ServerUrl.SelectCategory
        User.category = await NetworkCall.Select(url, formBody)

        url = ServerUrl.SelectLanguage
        User.language = await NetworkCall.Select(url, formBody)

        url = ServerUrl.SelectNation
        User.nation = await NetworkCall.Select(url, formBody)

        url = ServerUrl.SelectContentsCategory
        User.contentsCategory = await NetworkCall.Select(url, formBody)

        url = ServerUrl.SelectBank
        User.bank = await NetworkCall.Select(url, formBody)

        AsyncStorage.getItem('userInfo', (err, result) => {
            if (result != null) {
                const UserInfo = JSON.parse(result);
                console.log(UserInfo)
                this.setState({
                    email: UserInfo.email,
                    password: UserInfo.password,
                    token: UserInfo.token,
                    provider: UserInfo.auth_provider,
                })
                this._Login();
            } else {
                this.props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
            }
        });
    }

    _Login() {
        var url = "";
        var formBody = '';

        if (this.state.password.length > 0) {
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
                'provider': this.state.provider,
                'token': this.state.token,
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

                    this._Saved(json[0].user_no)
                } else {
                    this.props.navigation.reset({ index: 0, routes: [{ name: 'Loading' }] })
                }
            })
    }

    async _Saved(value) {
        console.log('bb')
        var formBody = '';
        const url = ServerUrl.SelectSavedEx
        formBody = JSON.stringify({
            "conditions": [
                { "op": "AND", "q": "=", "f": "user_no", "v": value },
                { "op": "AND", "q": "=", "f": "flag", "v": 1 }
            ]
        })

        const exSaved = await NetworkCall.Select(url, formBody)
        let exSavedList = [];
        console.log('exSaved', exSaved)
        if (exSaved.length > 0) {
            for (let i = 0; i < exSaved.length; i++) {
                console.log(exSaved[i].content_no)
                exSavedList.push(exSaved[i].content_no)
            }
        }
        User.exSaved = exSavedList

        formBody = JSON.stringify({
            "conditions": [
                { "op": "AND", "q": "=", "f": "user_no", "v": value },
                { "op": "AND", "q": "=", "f": "flag", "v": 2 }
            ]
        })

        const placeSaved = await NetworkCall.Select(url, formBody)
        let placeSavedList = [];
        if (placeSaved.length > 0) {
            for (let i = 0; i < placeSaved.length; i++) {
                placeSavedList.push(placeSaved[i].content_no)
            }
        }
        User.placeSaved = placeSavedList

        AsyncStorage.getItem('firstRegion', (err, result) => {
            if (result != null) {
                this.props.navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
            } else {
                this.props.navigation.reset({ index: 0, routes: [{ name: 'SignUpRegion', }] })
            }
        })
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorFFFFFF }}>
                    <Animated.Image style={{ alignItems: 'center', height: 38, resizeMode: 'contain', opacity: this.state.animation }} source={imgLogo}></Animated.Image>
                </View>
            </SafeAreaView>
        )
    }
}