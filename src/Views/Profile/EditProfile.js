import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, BackHandler, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import SelectImageDialog from '../../Common/ImageSelectDialog';
import * as Utils from '../../Common/Utils'
import BasicDialog from '../../Common/BasicDialog'
import DatePicker from 'react-native-date-picker'
// import Moment from 'moment';
import Moment from 'moment/min/moment-with-locales'
import AsyncStorage from '@react-native-community/async-storage';
import User from '../../Common/User'
import ServerUrl from '../../Common/ServerUrl'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FetchingIndicator from 'react-native-fetching-indicator'
import SelectDialog from '../../Common/SelectDialog'

const TAG = "EditProfile"
const imgBack = require('../../../assets/ic_back.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgAccount = require('../../../assets/account_circle.png')
const imgClose = require('../../../assets/ic_close.png')

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

export default class EditProfile extends React.Component {
    constructor(props) {
        super(props)
        this.backAction = this.backAction.bind(this);
    }

    state = {
        profileTypeDialogVisible: false,
        profileUrl: '',
        type: 1, // 1- 언어
        selectedPosition: 1, // 0-한국어, 1-영어, 2-일어
        selectedLanguage: '',
        languageChange: false,
        dialogVisible: false,
        type: 0, // 0-logout, 1-delete
        userName: '',
        userNickname: '',
        userPhone: '',
        userBio: '',
        userNo: -1,
        profileData: [],
        userEmail: '',
        userBankNum: '',
        userBankHolder: '',
        selectedCountyPosition: -1,
        selectedCountryNo: -1,
        selectedCountry: '',
        selectedBankPosition: -1,
        selectedBankNo: -1,
        selectedBank: '',
        selectDialogVisible: false,
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
        console.log(I18n.currentLocale())
        AsyncStorage.getItem('appLanguage', (err, result) => {
            if (result != null) {
                I18n.locale = result;
                if (result == 'en-US') {
                    this.setState({
                        selectedPosition: 1,
                        selectedLanguage: 'English'
                    })
                } else if (result == 'ko-KR') {
                    this.setState({
                        selectedPosition: 0,
                        selectedLanguage: '한국어'
                    })
                } else if (result == 'ja-JP') {
                    this.setState({
                        selectedPosition: 2,
                        selectedLanguage: '日本語'
                    })
                }
            } else {
                if (I18n.currentLocale() == 'ko-KR') {
                    I18n.locale = 'ko-KR'
                    this.setState({
                        selectedPosition: 0,
                        selectedLanguage: '한국어'
                    })
                } else if (I18n.currentLocale() == 'ja-JP') {
                    I18n.locale = 'ja-JP'
                    this.setState({
                        selectedPosition: 2,
                        selectedLanguage: '日本語'
                    })
                } else {
                    I18n.locale = 'en-US'
                    this.setState({
                        selectedPosition: 1,
                        selectedLanguage: 'English'
                    })
                }
                AsyncStorage.setItem('appLanguage', I18n.currentLocale())
            }
        })
        AsyncStorage.getItem('userInfo', (err, result) => {
            if (result != null) {
                const UserInfo = JSON.parse(result);
                console.log(UserInfo)
                this.setState({
                    userNo: UserInfo.user_no,
                    userNickname: UserInfo.nickname,
                    userName: UserInfo.userName,
                    profileUrl: UserInfo.profileUrl,
                    userPhone: UserInfo.phone,
                    userBio: UserInfo.bio == null ? '' : UserInfo.bio,
                    userEmail: UserInfo.email,
                    selectedBankNo: (UserInfo.bank == null || UserInfo.bank == -1) ? -1 : UserInfo.bank,
                    selectedBank: (UserInfo.bank == null || UserInfo.bank == -1) ? '' : Utils.Grinder(User.bank.filter((el) => el.bank_no == UserInfo.bank)[0]),
                    selectedCountry: (UserInfo.bank == null || UserInfo.bank == -1) ? '' : Utils.Grinder(User.country.filter((item) => item.country_no == User.bank.filter((el) => el.bank_no == UserInfo.bank)[0].country_no)[0]),
                    selectedCountryNo: (UserInfo.bank == null || UserInfo.bank == -1) ? -1 : User.country.filter((item) => item.country_no == User.bank.filter((el) => el.bank_no == UserInfo.bank)[0].country_no)[0].country_no,
                    userBankNum: UserInfo.account_number || '',
                    userBankHolder: UserInfo.account_holder || '',
                })
            } else {

            }
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    }

    backAction() {
        this.props.navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: I18n.t('profile') } }] });
        return true;
    };

    _goBack() {
        this.props.navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: I18n.t('profile') } }] });
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
                            isFetching: true,
                            profileData: response.assets
                        }, () => this._UpdateUserImage())
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
                            isFetching: true,
                            profileData: response.assets
                        }, () => this._UpdateUserImage())
                    }
                })
            })
        }
    }

    _BasicDialogVisible() {
        if (this.state.basicDialogVisible) {
            console.log(Utils.AppLanguage())
            if (this.state.type == 2) {
                return <BasicDialog datas={Utils.AppLanguage()} type={this.state.type} title={I18n.t('profileLanguage')} selectedPosition={this.state.selectedPosition} click={this._BasicDialogClick}></BasicDialog>
            } else if (this.state.type != 2) {
                return null
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
            if (value.type == '2') {
                let lang = (value.selectedPosition == 0 ? 'ko-KR' : value.selectedPosition == 1 ? 'en-US' : 'ja-JP')
                I18n.locale = lang;
                Moment.locale(value.selectedPosition == 0 ? 'ko' : value.selectedPosition == 1 ? 'en' : 'ja')
                AsyncStorage.setItem('appLanguage', lang, () => {
                    this.setState({
                        basicDialogVisible: false,
                        selectedPosition: value.selectedPosition,
                        selectedLanguage: Utils.AppLanguage()[value.selectedPosition],
                        languageChange: true,
                    })
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

    _CallDialog() {
        if (this.state.selectDialogVisible) {
            let datas = [];
            let title = I18n.t('profileBankCountry');
            let type = this.state.selectedDialogType;

            if (type == '1') {
                title = I18n.t('profileBankCountry')
                datas = User.country
            }
            else if (type == '6' && this.state.selectedCountryNo != -1) {
                title = I18n.t('profileBankName')
                datas = User.bank.filter((value) => value.country_no == this.state.selectedCountryNo)
            }

            if (datas.length > 0) {
                return <SelectDialog title={title} datas={datas} type={type} _markedDates={null} selectedPosition={(type == '1' ? this.state.selectedCountyPosition : this.state.selectedBankPosition)} markedType={''} marked={null} click={this._ClickDialog} selectedString={(type == '1' ? this.state.selectedCountry : this.state.selectedBank)} no={(type == '1' ? this.state.selectedCountryNo : this.state.selectedBankNo)}></SelectDialog>
            }
        } else {
            return null;
        }
    }

    _ClickDialog = value => {
        if (value.type == '1') {
            this.setState({
                selectDialogVisible: false,
                selectedCountry: Utils.Grinder(User.country.filter((el) => el.country_no == value.no)[0]),
                selectedCountryNo: value.no,
                selectedCountyPosition: value.selectedPosition,
                selectedBank: '',
                selectedBankNo: -1,
                selectedBankPosition: -1,
            })
        } else if (value.type == '6') { //bank
            this.setState({
                selectDialogVisible: false,
                selectedBank: Utils.Grinder(User.bank.filter((el) => el.bank_no == value.no)[0]),
                selectedBankNo: value.no,
                selectedBankPosition: value.selectedPosition,
            });
        } else if (value.type == '5') {
            this.setState({
                selectDialogVisible: false,
            });
        }
    }

    _Logout() {
        AsyncStorage.clear()
        User.exSaved = [];
        User.placeSaved = [];
        User.guest = true;
        this.props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
    }

    _DeleteAccount() {
        var url = "";
        var formBody = '';
        formBody = JSON.stringify({
            'user_no': User.userNo,
        });

        url = ServerUrl.UnregisterUrl

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
                AsyncStorage.clear()
                User.exSaved = [];
                User.placeSaved = [];
                User.guest = true;
                this.props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
            })
    }

    _UpdateUserImage() {
        var url = "";
        let formdata = new FormData();

        url = ServerUrl.UpdateUserUrl

        formdata.append("user_no", this.state.userNo);
        formdata.append("email", this.state.userEmail);

        console.log(this.state.profileData)

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

                    this.setState({ isFetching: false, profileUrl: json[0].avatar_url })
                } else {
                    this.setState({ isFetching: false })
                }

            })
    }

    _NetworkUpdate() {
        this.setState({ isFetching: true })
        var url = "";
        var formBody = '';

        formBody = JSON.stringify({
            "user_no": this.state.userNo,
            "name": `\'${this.state.userName}\'`,
            "nickname": `\'${this.state.userNickname}\'`,
            "phone": `\'${this.state.userPhone}\'`,
            "bio": `\'${this.state.userBio == null || this.state.userBio.length == 0 ? "" : this.state.userBio}\'`,
            "account_holder": this.state.userBankHolder.length == 0 ? null : `\'${this.state.userBankHolder}\'`,
            "account_number": this.state.userBankNum.length == 0 ? null : `\'${this.state.userBankNum}\'`,
            "bank": this.state.selectedBankNo == -1 ? null : `\'${this.state.selectedBankNo}\'`,
            "language": `\'${(this.state.selectedPosition + 1)}\'`,
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
                    User.guest = false

                    this.setState({ isFetching: false })
                    this.props.navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: I18n.t('profile') } }] });
                } else {

                }

            })
    }

    _Dialog() {
        return (
            <Modal visible={this.state.dialogVisible} transparent={true}>
                <TouchableWithoutFeedback onPress={() => this.setState({ dialogVisible: false })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '90%', height: 211, backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 14, marginRight: 16 }} onPress={() => this.setState({ dialogVisible: false })}>
                                        <Image source={imgClose} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t(this.state.type == 0 ? 'profileDialogLogoutText' : 'profileDialogDeleteText')}</Text>
                                </View>
                                <View style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 19 }}>
                                    <TouchableOpacity onPress={() => this.setState({ dialogVisible: false }, () => this.state.type == 0 ? this._Logout() : this._DeleteAccount())}>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.type == 0 ? Colors.color2D7DC8 : Colors.colorE94D3E, borderRadius: 4, width: '100%', height: 48 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t(this.state.type == 0 ? 'profileDialogLogoutBtn' : 'profileDialogDeleteBtn')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    {this._BasicDialogVisible()}
                    {this._SelectProfileTypeDialog()}
                    {this._Dialog()}
                    {this._CallDialog()}
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableWithoutFeedback onPress={() => this._goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('profileEditProfile')}</Text>
                    </View>

                    <KeyboardAwareScrollView style={{ marginTop: 27 }} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} >
                        <TouchableOpacity onPress={() => Platform.OS == 'ios' ? this.setState({ profileTypeDialogVisible: true }) : this.hasAndroidPermission()}>
                            <View>
                                <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.colorF5F5F5, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
                                    <Image source={imgAccount} style={{ width: 50, height: 50, }}></Image>
                                    <Image style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 200, }} source={(this.state.profileUrl.length > 0 ? { uri: ServerUrl.Server + this.state.profileUrl } : null)}></Image>
                                </View>

                                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 14 }}>
                                    <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('profileUploadProfile')}</Text>
                                </View>
                            </View>

                        </TouchableOpacity>

                        <View>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginTop: 20 }}>{I18n.t('profileName')}</Text>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center' }}>
                                <TextInput onChangeText={(text) => { this.setState({ userName: text }) }} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('profileName')} autoCapitalize="none" returnKeyType="next">{this.state.userName}</TextInput>
                            </View>
                        </View>

                        <View>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginTop: 16 }}>{I18n.t('profileUsername')}</Text>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center' }}>
                                <TextInput onChangeText={(text) => { this.setState({ userNickname: text }) }} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('profileUsername')} autoCapitalize="none" returnKeyType="next">{this.state.userNickname}</TextInput>
                            </View>
                        </View>

                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 16, marginTop: 16 }}>{I18n.t('profilePhone')}</Text>
                        <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                            <TouchableOpacity style={{ flex: 0.3, }}>
                                <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                    <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 11 }}>{"+82"}</Text>
                                    <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 18 }} source={imgDownArrow}></Image>
                                </View>
                            </TouchableOpacity>

                            <View style={{ flex: 0.7, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderBottomColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: 12, paddingLeft: 4 }}>
                                <TextInput onChangeText={(text) => { this.setState({ userPhone: text.replace('-', '').replace('.', '') }) }} value={this.state.userPhone} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={""} autoCapitalize="none" returnKeyType="next" keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'} placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                            </View>
                        </View>

                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 16, marginTop: 16 }}>{I18n.t('profileBankTitle')}</Text>
                        <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                            <TouchableOpacity style={{ flex: 1, }} onPress={() => this.setState({ selectedDialogType: 1, selectDialogVisible: true })}>
                                <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                    <TextInput style={{ fontSize: 14, color: Colors.color000000, fontFamily: "Raleway-Regular", includeFontPadding: false, marginRight: 14, padding: 0, marginLeft: 12 }} ellipsizeMode="tail" placeholder={I18n.t('profileBankCountry')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{Utils.Grinder(User.country.filter((el) => el.country_no == this.state.selectedCountryNo)[0])}</TextInput>
                                    <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 18 }} source={imgDownArrow}></Image>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ flex: 1, marginLeft: 12 }} onPress={() => this.setState({ selectedDialogType: 6, selectDialogVisible: true })}>
                                <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                    <TextInput style={{ fontSize: 14, color: Colors.color000000, fontFamily: "Raleway-Regular", includeFontPadding: false, marginRight: 14, padding: 0, marginLeft: 12 }} ellipsizeMode="tail" placeholder={I18n.t('profileBankName')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{Utils.Grinder(User.bank.filter((el) => el.bank_no == this.state.selectedBankNo)[0])}</TextInput>
                                    <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 18 }} source={imgDownArrow}></Image>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginLeft: 24 }}>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginTop: 16 }}>{I18n.t('profileBankNum')}</Text>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center' }}>
                                <TextInput onChangeText={(text) => { this.setState({ userBankNum: text }) }} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('profileBankNumHint')} autoCapitalize="none" returnKeyType="next">{this.state.userBankNum}</TextInput>
                            </View>
                        </View>

                        <View style={{ marginLeft: 24 }}>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginTop: 16 }}>{I18n.t('profileBankAccountName')}</Text>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center' }}>
                                <TextInput onChangeText={(text) => { this.setState({ userBankHolder: text }) }} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('profileBankAccountNameHint')} autoCapitalize="none" returnKeyType="next">{this.state.userBankHolder}</TextInput>
                            </View>
                        </View>

                        <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginTop: 16 }}>{I18n.t('profileLanguage')}</Text>
                        <TouchableWithoutFeedback onPress={() => this.setState({ type: 2, basicDialogVisible: true })}>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4 }}>
                                <TextInput style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('profileLanguage')} autoCapitalize="none" editable={false} pointerEvents="none">{this.state.selectedLanguage}</TextInput>
                                <Image style={{ position: 'absolute', right: 12, width: 12, height: '100%', resizeMode: 'contain' }} source={imgDownArrow}></Image>
                            </View>
                        </TouchableWithoutFeedback>

                        <View>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginTop: 16 }}>{I18n.t('profileBio')}</Text>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center' }}>
                                <TextInput onChangeText={(text) => { this.setState({ userBio: text }) }} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('profileBio')} autoCapitalize="none" returnKeyType="next">{this.state.userBio}</TextInput>
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => this._NetworkUpdate()}>
                            <View style={{ marginTop: 21, height: 48, borderRadius: 4, backgroundColor: Colors.color2D7DC8, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, }}>{I18n.t('profileSave')}</Text>
                            </View>
                        </TouchableOpacity>

                        {User.snsLogin == false && <TouchableOpacity onPress={() => this.props.navigation.navigate('ChangePassword')}>
                            <View style={{ marginTop: 12, height: 48, borderRadius: 4, borderColor: Colors.color2D7DC8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false, }}>{I18n.t('profileChangePassword')}</Text>
                            </View>
                        </TouchableOpacity>}

                        <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }} onPress={() => this.setState({ dialogVisible: true, type: 0 })}>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 12, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false, }}>{I18n.t('profileLogout')}</Text>
                                </View>
                            </TouchableOpacity>
                            <View>
                                <Text>{" | "}</Text>
                            </View>
                            <TouchableOpacity style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center' }} onPress={() => this.setState({ dialogVisible: true, type: 1 })}>
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 12, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false, }}>{I18n.t('profileDelete')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 20 }}></View>
                    </KeyboardAwareScrollView>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}