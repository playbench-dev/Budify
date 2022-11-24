import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import I18n from '../lang/i18n';
import Colors from '../Common/Colos';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import SelectImageDialog from '../Common/ImageSelectDialog';
import * as Utils from '../Common/Utils'
import BasicDialog from '../Common/BasicDialog'
import DatePicker from 'react-native-date-picker'
import Moment from 'moment';
import ServerUrl from '../Common/ServerUrl'
import FetchingIndicator from 'react-native-fetching-indicator'
import User from '../Common/User'
import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const TAG = "SignUpProfile"
const imgBack = require('../../assets/ic_back.png');
const imgDownArrow = require('../../assets/ic_down_arrow.png');
const imgAccount = require('../../assets/account_circle.png')
const imgCheckOn = require('../../assets/ic_check_on.png')
const imgCheckOff = require('../../assets/ic_check_off.png')

const options = {
    title: 'Load Photo',
    customButtons: [
        { name: 'button_id_1', title: 'CustomButton 1' },
        { name: 'button_id_2', title: 'CustomButton 2' }
    ],
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};

export default class SignUp extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        isFetching: true,
        nickName: '',
        region: '',
        gender: '',
        year: '',
        month: '',
        day: '',
        degreeCheck: false,
        showDegreeText: false,
        loginType: 0, //0 - email, 1 - sns
        profileData: [],
        profileUrl: '',
        profileTypeDialogVisible: false,
        basicDialogVisible: false,
        type: 1, // 1 - 국적, 2 - 성별
        selectedNationalityPosition: -1,
        selectedGenderPosition: -1,
        selectedNationality: '',
        selectedNationalityNo: -1,
        selectedGender: '',
        open: false,
        birthDay: Moment(new Date()).format('YYYY-MM-DD'),
        selectedBirthDay: '',
        nationality: [],
        provider: 'Email',
        emailFail: 0, //1-success, 2-fail
        nickNameFail: 0, //1-success, 2-fail
        email: '',
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
    }

    componentDidMount() {
        // console.log(Utils.Nationality())
        this._NationList()
    }

    _SignUpNextClick() {
        if (this.state.degreeCheck == false) {
            this.setState({
                showDegreeText: true
            })
        } else {
            this.setState({ isFetching: true }, () => {
                this._SelectEmailUser()
            })
            // this.props.navigation.navigate('SignUpRegion')
        }
    }

    async hasAndroidPermission() {
        const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

        const hasPermission = await PermissionsAndroid.check(permission);
        if (hasPermission) {
            console.log(hasPermission)
            this.setState({ profileTypeDialogVisible: true })
            return true;
        }

        const status = await PermissionsAndroid.request(permission);
        console.log(status)
        if (status === 'granted') {
            this.setState({ profileTypeDialogVisible: true })
        }
        return status === 'granted';
    }

    _SelectProfileTypeDialog() {
        if (this.state.profileTypeDialogVisible) {
            return <SelectImageDialog click={this._TakeImage}></SelectImageDialog>
        } else {
            return null
        }
    }

    _TakeImage = value => {
        // launchImageLibrary(options, (response) => {
        //     console.log(response)
        // })
        if (value.type == 'cancel') {
            this.setState({
                profileTypeDialogVisible: false,
            })
        } else if (value.type == 'camera') {
            this.setState({
                profileTypeDialogVisible: false,
            }, () => {
                launchCamera(options, (response) => {
                    console.log(response)
                    if (response.didCancel) {

                    } else if (response.error) {

                    } else if (response.assets) {
                        this.setState({
                            profileData: response.assets,
                            profileUrl: response.assets[0].uri
                        })

                    }
                })
            })
        } else if (value.type == 'gallery') {
            this.setState({
                profileTypeDialogVisible: false,
            }, () => {
                launchImageLibrary(options, (response) => {
                    console.log(response)
                    if (response.didCancel) {

                    } else if (response.error) {

                    } else if (response.assets) {
                        this.setState({
                            profileData: response.assets,
                            profileUrl: response.assets[0].uri
                        })
                        console.log(this.state.profileData)
                    }
                })
            })
        }
    }

    _LangSelectText(str1, str2, str3) {
        if (this.state.lang == 'ko') {
            return str2
        } else if (this.state.lang == 'ja') {
            return str3
        } else {
            return str1
        }
    }

    _BasicDialogVisible() {
        if (this.state.basicDialogVisible) {
            // this.setState({ isFetching: false })
            if (this.state.type == 1) {
                return <BasicDialog datas={this.state.nationality} type={this.state.type} title={I18n.t('region')} selectedPosition={this.state.selectedNationalityPosition} click={this._BasicDialogClick} no={this.state.selectedNationalityNo}></BasicDialog>
            } else if (this.state.type == 2) {
                return <BasicDialog datas={Utils.Gender()} type={this.state.type} title={I18n.t('gender')} selectedPosition={this.state.selectedGenderPosition} click={this._BasicDialogClick}></BasicDialog>
            }
        } else {
            return null
        }
    }

    _BasicDialogClick = value => {
        console.log(value)
        if (value.type == '5') {
            this.setState({
                basicDialogVisible: false
            })
        } else {
            if (value.type == '1') {
                this.setState({
                    basicDialogVisible: false,
                    selectedNationalityPosition: value.selectedPosition,
                    selectedNationalityNo: value.no,
                    selectedNationality: this._LangSelectText(this.state.nationality[value.selectedPosition].en, this.state.nationality[value.selectedPosition].ko, this.state.nationality[value.selectedPosition].ja)
                })
            } else {
                this.setState({
                    basicDialogVisible: false,
                    selectedGenderPosition: value.selectedPosition,
                    selectedGender: Utils.Gender()[value.selectedPosition]
                })
            }
        }
    }

    _DatePicker() {
        return (
            <Modal transparent={true} visible={this.state.open}>
                <TouchableWithoutFeedback onPress={() => this.setState({ open: false })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '100%', padding: 15, backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <TouchableWithoutFeedback onPress={() => this.setState({ open: false })}>
                                        <Image source={imgBack} style={{ width: 16, height: 16, resizeMode: 'contain' }}></Image>
                                    </TouchableWithoutFeedback>
                                    <Text style={{ flex: 1, paddingRight: 16, fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t('birth')}</Text>
                                </View>

                                <View style={{ margin: 12 }}></View>

                                <View style={{ width: '100%', height: 216, justifyContent: "center", alignItems: 'center' }}>
                                    <DatePicker
                                        locale={I18n.currentLocale()}
                                        modal={false}
                                        mode="date"
                                        open={true}
                                        theme="auto"
                                        date={new Date()}
                                        onDateChange={(date) => {
                                            console.log('DatePicker', 'date : ' + date + ' moment : ' + Moment(date).format('yyyy-MM-DD'));
                                            this.state.birthDay = Moment(date).format('yyyy-MM-DD');
                                        }}
                                    />
                                </View>

                                <TouchableWithoutFeedback onPress={() => this.setState({ open: false, selectedBirthDay: this.state.birthDay })}>
                                    <View style={{ width: '100%', height: 48, backgroundColor: Colors.color2D7DC8, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginTop: 28 }}>
                                        <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: "Raleway-Bold", includeFontPadding: false }}>{I18n.t('homeDone')}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }

    _NationList() {
        var url = "";
        var formBody = '';

        url = ServerUrl.SelectNation
        formBody = JSON.stringify({
            'conditions': [{}]
        })
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
                if (json.length > 0) {
                    for (let i = 0; i < json.length; i++) {
                        if (i == 0) {
                            this.state.selectedNationalityNo = json[i].nation_no
                        }
                        const obj = {
                            nation_no: json[i].nation_no,
                            ko: json[i].ko,
                            en: json[i].en,
                            ja: json[i].ja,
                        }
                        this.state.nationality.push(obj)
                    }
                    this.setState({
                        isFetching: false
                    })
                }
            })
    }

    _InsertUser() {
        var url = "";
        let formdata = new FormData();

        url = ServerUrl.InsertUserUrl

        console.log(User.fcmToken)

        if (this.state.loginType == 0) {
            formdata.append('email', this.props.route.params.email)
            formdata.append('password', this.props.route.params.password)
            formdata.append('auth_provider', this.state.provider)
        } else {
            formdata.append('token', this.props.route.params.snsId)
            formdata.append('email', this.state.email)
            formdata.append('auth_provider', this.props.route.params.snsType == 1 ? 'Facebook' : this.props.route.params.snsType == 2 ? 'Google' : 'Apple')
        }
        formdata.append('os', Platform == 'ios' ? 2 : 1)
        formdata.append('fcm_token', User.fcmToken)
        formdata.append('nickname', this.state.nickName)
        if (this.state.selectedNationalityPosition != -1) {
            formdata.append('nationality', this.state.selectedNationalityNo)
        } else {
            // formdata.append('nationality', null)
        }
        if (this.state.selectedGenderPosition != -1) {
            formdata.append('gender', this.state.selectedGenderPosition + 1)
        } else {
            // formdata.append('gender', null)
        }
        if (this.state.selectedBirthDay.length != 0) {
            formdata.append('birth', this.state.selectedBirthDay)
        } else {
            // formdata.append('birth', null)
        }

        if (this.state.profileData.length > 0) {
            for (let i = 0; i < this.state.profileData.length; i++) {
                let imageName = this.state.profileData[i].uri.split('/').pop();
                let imageType = this.state.profileData[i].uri.split('.').pop();
                const photo = {
                    uri: this.state.profileData[i].uri,
                    type: 'image/' + imageType,
                    filename: imageName,
                    name: imageName,
                };
                formdata.append("avatar_url", photo);
            }
        }

        console.log(formdata)

        fetch(url, {
            method: 'POST',
            body: formdata,
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
                    User.guest = false

                    AsyncStorage.getItem('firstRegion', (err, result) => {
                        if (result != null) {
                            this.props.navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
                        } else {
                            this.props.navigation.reset({ index: 0, routes: [{ name: 'SignUpRegion' }] })
                        }
                    })
                    this.setState({ isFetching: false })
                } else {
                    this.setState({ isFetching: false })
                }

            })
    }

    validate = (email) => {
        const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        return expression.test(String(email).toLowerCase())
    }

    _SelectEmailUser() {
        var url = "";
        var formBody = '';
        if (this.state.loginType == 0) {
            formBody = JSON.stringify({
                'conditions': [{
                    "q": "=",
                    "f": "nickname",
                    "v": `\'${this.state.nickName}\'`
                }]
            });
        } else {
            if (this.validate(this.state.email) == false) {
                this.setState({ emailFail: 2, isFetching: false })
                return;
            }
            formBody = JSON.stringify({
                'conditions': [{
                    "q": "=",
                    "f": (this.state.emailFail == 1 ? "nickname" : "email"),
                    "v": `\'${(this.state.emailFail == 1 ? this.state.nickName : this.state.email)}\'`
                }]
            });
        }

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
                    if (this.state.loginType == 0) {
                        this.setState({
                            isFetching: false,
                            nickNameFail: 2,
                        })
                    } else {
                        if (this.state.emailFail == 1) {
                            this.setState({
                                isFetching: false,
                                nickNameFail: 2,
                            })
                        } else {
                            this.setState({
                                isFetching: false,
                                emailFail: 2,
                            })
                        }
                    }
                } else {
                    if (this.state.loginType == 0) {
                        this._InsertUser()
                    } else {
                        if (this.state.emailFail != 1) {
                            this.setState({
                                emailFail: 1,
                            })
                        } else if (this.state.emailFail == 1 && this.state.nickNameFail != 1) {
                            this.setState({
                                nickNameFail: 1,
                            })
                        }

                        if (this.state.emailFail == 1 && this.state.nickNameFail == 1) {
                            if (this.state.selectedNationalityPosition != -1 && this.state.selectedGenderPosition != -1 && this.state.birthDay.length > 0) {
                                this._InsertUser()
                            } else {
                                this.setState({
                                    isFetching: false,
                                })
                            }
                        } else {
                            this._SelectEmailUser()
                        }
                    }
                }
            })
    }

    render() {
        this.state.loginType = this.props.route.params.loginType
        if (this.props.route.params.loginType == 1) {
            if (this.props.route.params.snsType == 3) {
                this.state.email = this.props.route.params.appleEmail
            }
        }
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>

                    {this._BasicDialogVisible()}
                    {this._SelectProfileTypeDialog()}
                    {this._DatePicker()}
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('signUp')}</Text>
                    </View>

                    <KeyboardAwareScrollView style={{ marginTop: 27 }} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} >

                        <TouchableWithoutFeedback onPress={() => this.setState({ profileTypeDialogVisible: true })}>
                            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.colorF5F5F5, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
                                <Image source={imgAccount} style={{ width: 50, height: 50, }}></Image>
                                <Image style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 200, resizeMode: 'cover' }} source={(this.state.profileUrl.length > 0 ? { uri: this.state.profileUrl } : null)}></Image>
                            </View>
                        </TouchableWithoutFeedback>

                        <TouchableOpacity onPress={() => this.setState({ profileTypeDialogVisible: true })}>
                            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 14 }}>
                                <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('profileUpload')}</Text>
                            </View>
                        </TouchableOpacity>

                        {this.state.loginType == 1 && (
                            <View>
                                <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginTop: 40 }}>{`*${I18n.t('email')}`}</Text>
                                <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center' }}>
                                    <TextInput editable={this.props.route.params.snsType == 3 ? false : true} selectTextOnFocus={this.props.route.params.snsType == 3 ? false : true} onChangeText={(text) => { this.setState({ email: text.trim(), emailFail: 0 }) }} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('emailHint')} autoCapitalize="none" returnKeyType="next">{this.state.email}</TextInput>
                                </View>
                            </View>
                        )}

                        {this.state.emailFail == 2 && <Text style={{ fontSize: 14, color: Colors.colorFD6268, marginTop: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('emailCheckFail')}</Text>}

                        <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginTop: (this.state.loginType != 1 ? 40 : 12) }}>{`*${I18n.t('nickName')}`}</Text>
                        <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center' }}>
                            <TextInput style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} onChangeText={(value) => this.setState({ nickName: value.trim(), nickNameFail: 0 })} placeholder={I18n.t('nickNameHint')} autoCapitalize="none" returnKeyType="next"></TextInput>
                        </View>

                        {this.state.nickNameFail == 2 && <Text style={{ fontSize: 14, color: Colors.colorFD6268, marginTop: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('nickNameFail')}</Text>}

                        <Text style={{ fontSize: 16, color: Colors.color000000, marginTop: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('region')}</Text>

                        <TouchableWithoutFeedback onPress={() => this.setState({ type: 1, basicDialogVisible: true, })}>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4 }}>
                                <TextInput style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('regionHint')} autoCapitalize="none" editable={false} pointerEvents="none">{this.state.selectedNationality}</TextInput>
                                <Image style={{ position: 'absolute', right: 12, width: 12, height: '100%', resizeMode: 'contain' }} source={imgDownArrow}></Image>
                            </View>
                        </TouchableWithoutFeedback>

                        <Text style={{ fontSize: 16, color: Colors.color000000, marginTop: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('gender')}</Text>

                        <TouchableWithoutFeedback onPress={() => this.setState({ type: 2, basicDialogVisible: true })}>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4 }}>
                                <TextInput style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('genderHint')} autoCapitalize="none" editable={false} pointerEvents="none">{this.state.selectedGender}</TextInput>
                                <Image style={{ position: 'absolute', right: 12, width: 12, height: '100%', resizeMode: 'contain' }} source={imgDownArrow}></Image>
                            </View>
                        </TouchableWithoutFeedback>

                        <Text style={{ fontSize: 16, color: Colors.color000000, marginTop: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('birth')}</Text>

                        <View style={{ width: '100%', height: 48, flexDirection: 'row', marginTop: 4 }}>
                            <TouchableWithoutFeedback onPress={() => this.setState({ open: true })}>
                                <View style={{ flex: 1, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1 }}>
                                    <TextInput placeholder={I18n.t('birthHint')} placeholderTextColor={Colors.colorD0D0D0} style={{ fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, color: Colors.color000000, height: '100%', paddingLeft: 12 }} editable={false} pointerEvents="none">{this.state.selectedBirthDay}</TextInput>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', marginTop: 35 }}>
                            <View>
                                <TouchableWithoutFeedback onPress={() => this.setState({ degreeCheck: this.state.degreeCheck == false ? true : false, showDegreeText: this.state.showDegreeText == true ? false : false })}>
                                    <Image source={(this.state.degreeCheck == false ? imgCheckOff : imgCheckOn)} style={{ width: 15, height: 15, resizeMode: 'contain' }}></Image>
                                </TouchableWithoutFeedback>
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginLeft: 9, }}>
                                <Text style={{ color: Colors.color000000, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('degree01')}</Text>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('Service', { mode: 1 })}>
                                    <Text style={{ color: Colors.color2D7DC8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('degreeServiceClick')}</Text>
                                </TouchableOpacity>

                                <Text style={{ color: Colors.color000000, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('degree02')}</Text>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('Service', { mode: 2 })}>
                                    <Text style={{ color: Colors.color2D7DC8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('degreePersonClick')}</Text>
                                </TouchableOpacity>

                                <Text style={{ color: Colors.color000000, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('degree03')}</Text>
                                <Text style={{ color: Colors.color000000, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('degree04')}</Text>
                            </View>
                        </View>

                        <TouchableWithoutFeedback onPress={() => this._SignUpNextClick()} disabled={((this.state.loginType != 0 ? this.state.email.length > 0 : true) && this.state.nickName.length > 0 && this.state.degreeCheck == true) ? false : true}>
                            <View style={{ width: '100%', height: 48, backgroundColor: ((this.state.loginType != 0 ? this.state.email.length > 0 : true) && this.state.nickName.length > 0 && this.state.degreeCheck == true) ? Colors.color2D7DC8 : Colors.colorBABABA, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginTop: 12, flexDirection: 'row' }}>
                                <Text style={{ color: Colors.colorFFFFFF, fontSize: 14, marginLeft: 6, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('nextBtn01')}</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        {(this.state.showDegreeText == true && this.state.degreeCheck == false) && (
                            <View style={{ width: '100%', flexDirection: 'row', marginTop: 4, alignItems: 'center', marginTop: 19 }}>
                                <Text style={{ color: Colors.colorFD6268, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('degreeNotCheck')}</Text>
                            </View>
                        )}

                        <View style={{ height: 20 }}></View>
                    </KeyboardAwareScrollView>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}