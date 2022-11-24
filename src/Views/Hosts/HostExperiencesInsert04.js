import React from 'react';
import { StatusBar, SafeAreaView, View, Text, Image, FlatList, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, Animated, TextInput, KeyboardAvoidingView, Platform, ScrollView, PermissionsAndroid } from 'react-native'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import { KeyboardAwareScrollView, KeyboardAwareSectionList, KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import * as Utils from '../../Common/Utils'
import User from '../../Common/User';
import BasicDialog from '../../Common/BasicDialog'
import ServerUrl from '../../Common/ServerUrl';
import * as NetworkCall from '../../Common/NetworkCall'
import FetchingIndicator from 'react-native-fetching-indicator'
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import AsyncStorage from '@react-native-community/async-storage';

const TAG = 'HostExperiencesInsert04';

const imgBack = require('../../../assets/ic_back.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgLocation = require('../../../assets/ic_location.png');
const imgRejected = require('../../../assets/ic_rejected.png')
const imgCheckOn = require('../../../assets/ic_check_on.png')
const imgCheckOff = require('../../../assets/ic_check_off.png')
const imgPlus = require('../../../assets/ic_plus.png');
const imgCamera = require('../../../assets/ic_review_camera.png');
const imgDelete = require('../../../assets/ic_delete.png');

const { width: screenWidth } = Dimensions.get('window');

export default class HostExperiencesInsert04 extends React.Component {
    constructor(props) {
        super(props)
    }
    state = {
        type: 0,
        photoWidth: screenWidth - 80,
        photoDatas: [],
        coverDatas: [],
        degreeCheck: false,
        exNo: '',
        isFetching: false,
    }

    componentDidMount() {
        console.log(this.props.route.params)
        if (this.props.route.params.editData.length != 0) {
            this.setState({
                photoDatas: this.props.route.params.editData.images.map((item, index) => ({ path: ServerUrl.Server + item, fileName: item, mime: 'image/' + item.split('.').pop() })),
                coverDatas: this.props.route.params.editData.repImage.map((item, index) => ({ path: ServerUrl.Server + item, fileName: item, mime: 'image/' + item.split('.').pop() })),
                degreeCheck: true,
            })
        }
    }

    _Next() {

    }

    async hasAndroidPermission() {
        const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        const hasPermission = await PermissionsAndroid.check(permission);
        if (hasPermission) {
            this.openPicker()
            return true;
        }
        const status = await PermissionsAndroid.request(permission);
        if (status === 'granted') {
            this.openPicker()
        }
        return status === 'granted';
    }

    async openPicker() {
        try {
            const response1 = await MultipleImagePicker.openPicker({
                usedCameraButton: false,
                maxVideo: 0,
                maxSelectedAssets: this.state.type == 1 ? 20 : 1,
                selectedAssets: this.state.type == 1 ? this.state.photoDatas : this.state.coverDatas,
                isExportThumbnail: true,
                singleSelectedMode: false,
                isCrop: true,
                isCropCircle: true,
            }).then((response) => {
                console.log('aaa ', response)
                if (this.state.type == 1) {
                    this.setState({
                        isFetching: false,
                        photoDatas: response
                    })
                } else {
                    this.setState({
                        isFetching: false,
                        coverDatas: response
                    })
                }
            }).catch((e) => {
                console.log('catch', e)
            });
        } catch (e) {
            console.log(e.code, e.message);

        }
    };

    _PhotoUrlsDelete(item) {
        const newList = this.state.photoDatas.filter((el) => el.uri !== item.uri);
        this.setState({ photoDatas: newList })
    }

    parentFunction = value => {
        if (this.state.type == 1) {
            this.state.photoDatas = [];
            for (let i = 0; i < Object.keys(value).length; i++) {
                console.log(TAG, JSON.stringify(value[i]))
                this.state.photoDatas.push(value[i])
                // }
            }
        } else {
            this.state.coverDatas = [];
            for (let i = 0; i < Object.keys(value).length; i++) {
                console.log(TAG, JSON.stringify(value[i]))
                this.state.coverDatas.push(value[i])
                // }
            }
        }
        this.setState({
            isLoading: false,
        })
    }

    async _InsertExperience() {
        let url = '';
        if (this.props.route.params.editData.length != 0) {
            url = ServerUrl.UpdateExperience;
        } else {
            url = ServerUrl.InsertExperience;
        }
        let categories = [];
        categories.push("\'" + this.props.route.params.step2.categories.category_no + "\'")
        let languages = [];
        this.props.route.params.step2.languages.map((item) => languages.push("\'" + item + "\'"))
        let hashTags = [];
        this.props.route.params.step2.hashtag.map((item) => hashTags.push(item))
        let formBody = null;
        // console.log('url : ', url)
        console.log('lat : ', this.props.route.params.step1.lat.length)
        console.log('lng : ', this.props.route.params.step1.lng.length)
        console.log('lng : ', this.props.route.params.step1.shortLink)
        console.log('lng : ', this.props.route.params.step1.videoLink)
        console.log('lng : ', this.props.route.params.step3.price)
        console.log('lng : ', this.props.route.params.step3.address)
        console.log('lng : ', this.props.route.params.step3.address_detail)
        console.log('lng : ', this.props.route.params.step3.costDatas.length)
        console.log('lng : ', this.props.route.params.step3.bringDatas.length)
        console.log('lng : ', this.props.route.params.step3.requirement.length)
        if (this.props.route.params.editData.length != 0) {
            formBody = JSON.stringify({
                // step1 parameter
                "ex_no": this.props.route.params.editData.exNo,
                "user_no": User.userNo,
                "type": this.props.route.params.step1.type, //1-offline, 2-online, 3-ar/vr
                "approval": 2,
                "lat": this.props.route.params.step1.lat.length > 0 ? this.props.route.params.step1.lat : 0,
                "lng": this.props.route.params.step1.lng.length > 0 ? this.props.route.params.step1.lng : 0,
                "country": this.props.route.params.step1.country,
                "city": this.props.route.params.step1.city,
                "town": this.props.route.params.step1.region,
                "address": (this.props.route.params.step1.address == undefined || this.props.route.params.step1.address == null || this.props.route.params.step1.address.length == 0) ? null : "\'" + this.props.route.params.step1.address + "\'",
                "address_detail": (this.props.route.params.step1.addressDetail == undefined || this.props.route.params.step1.addressDetail == null || this.props.route.params.step1.addressDetail.length == 0) ? null : "\'" + this.props.route.params.step1.addressDetail + "\'",
                "short_video_link": "\'" + this.props.route.params.step1.shortLink + "\'",
                "video_link": "\'" + this.props.route.params.step1.videoLink + "\'",
                // step2 parameter
                "languages": JSON.stringify(languages),
                "categories": JSON.stringify(categories),
                "hashtags": hashTags,
                "title": "\'" + this.props.route.params.step3.name + "\'",
                "description": "\'" + this.props.route.params.step3.descript + "\'",
                "minutes": "\'" + this.props.route.params.step3.runningTime + "\'",
                "currency": "\'" + this.props.route.params.step3.currency + "\'",
                "price": this.props.route.params.step3.price == null ? 0 : this.props.route.params.step3.price,
                // step3 parameter
                "min_guest": this.props.route.params.step3.min == null ? null : this.props.route.params.step3.min,
                "max_guest": this.props.route.params.step3.max == null ? null : this.props.route.params.step3.max,
                "description_cost_included": this.props.route.params.step3.costDatas.length == 0 ? null : JSON.stringify(this.props.route.params.step3.costDatas),
                "description_guest_equipments": this.props.route.params.step3.bringDatas.length == 0 ? null : JSON.stringify(this.props.route.params.step3.bringDatas),
                "description_criteria": this.props.route.params.step3.requirement.length == 0 ? null : "\'" + this.props.route.params.step3.requirement + "\'",
            })
        } else {
            formBody = JSON.stringify({
                // step1 parameter
                "user_no": User.userNo,
                "type": this.props.route.params.step1.type, //1-offline, 2-online, 3-ar/vr
                "approval": 2,
                "lat": this.props.route.params.step1.lat.length > 0 ? this.props.route.params.step1.lat : 0,
                "lng": this.props.route.params.step1.lng.length > 0 ? this.props.route.params.step1.lng : 0,
                "country": this.props.route.params.step1.country,
                "city": this.props.route.params.step1.city,
                "town": this.props.route.params.step1.region,
                "address": this.props.route.params.step1.address,
                "address_detail": this.props.route.params.step1.addressDetail,
                "short_video_link": this.props.route.params.step1.shortLink,
                "video_link": this.props.route.params.step1.videoLink,
                // step2 parameter
                "languages": JSON.stringify(languages),
                "categories": JSON.stringify(categories),
                "hashtags": this.props.route.params.step2.hashtag,
                "title": this.props.route.params.step3.name,
                "description": this.props.route.params.step3.descript,
                "minutes": this.props.route.params.step3.runningTime,
                "currency": this.props.route.params.step3.currency,
                "price": this.props.route.params.step3.price.length == 0 ? 0 : this.props.route.params.step3.price,
                // step3 parameter
                "min_guest": this.props.route.params.step3.min == null ? null : this.props.route.params.step3.min,
                "max_guest": this.props.route.params.step3.max == null ? null : this.props.route.params.step3.max,
                "description_cost_included": this.props.route.params.step3.costDatas.length == 0 ? null : JSON.stringify(this.props.route.params.step3.costDatas),
                "description_guest_equipments": this.props.route.params.step3.bringDatas.length == 0 ? null : JSON.stringify(this.props.route.params.step3.bringDatas),
                "description_criteria": this.props.route.params.step3.requirement.length == 0 ? null : this.props.route.params.step3.requirement,
            })
        }
        console.log(formBody)
        const json = await NetworkCall.Select(url, formBody)
        console.log(json)
        if (json.length > 0) {
            this.state.exNo = json[0].ex_no;
            this._UpdateRep();
        } else {
            this.setState({ isFetching: false })
        }
    }

    _UpdateRep() {
        var url = "";
        let formdata = new FormData();
        url = ServerUrl.InsertExperienceCover
        formdata.append('ex_no', this.state.exNo)

        if (this.state.coverDatas.length > 0) {
            for (let i = 0; i < this.state.coverDatas.length; i++) {
                let imageName = this.state.coverDatas[i].fileName;
                const photo = {
                    uri: this.state.coverDatas[i].path,
                    type: this.state.coverDatas[i].mime,
                    filename: imageName,
                    name: imageName,
                };
                formdata.append("representative_file_url", photo);
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
                if (json.affectedRows == 1) {
                    this._UpdateExUrls();
                } else {
                    this.setState({ isFetching: false })
                }
            })
    }

    _UpdateExUrls() {
        var url = "";
        let formdata = new FormData();
        url = ServerUrl.InsertExperienceImages
        formdata.append('ex_no', this.state.exNo)

        if (this.state.photoDatas.length > 0) {
            for (let i = 0; i < this.state.photoDatas.length; i++) {
                let imageName = this.state.photoDatas[i].fileName;
                const photo = {
                    uri: this.state.photoDatas[i].path,
                    type: this.state.photoDatas[i].mime,
                    filename: imageName,
                    name: imageName,
                };
                formdata.append("image_urls", photo);
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
                if (json.affectedRows == 1) {
                    if (User.level == 1) {
                        this._NetworkUpdate()
                    } else {
                        this.setState({ isFetching: false })
                        this.props.navigation.reset({ index: 1, routes: [{ name: 'Main', params: { screen: I18n.t('profile') } }, { name: 'HostExperiencesManage' }] })
                    }
                } else {
                    this.setState({ isFetching: false })
                }
            })
    }

    async _NetworkUpdate() {
        console.log('asdasdsad1111')
        var url = "";
        var formBody = '';

        formBody = JSON.stringify({
            "user_no": User.userNo,
            "level": 2,
        });

        url = ServerUrl.UpdateUserUrl

        const json = await NetworkCall.Select(url, formBody)
        console.log('aaaaa', json)

        if (json.length > 0) {
            AsyncStorage.setItem('userInfo', JSON.stringify({
                'user_no': json[0].user_no || '', 'profileUrl': json[0].avatar_url || '', 'password': json[0].password || '',
                'nickname': json[0].nickname || '', 'userName': json[0].name || '', 'email': json[0].email || '',
                'birth': json[0].birth || '', 'gender': json[0].gender || '', 'phone': json[0].phone || '',
                'auth_provider': json[0].auth_provider || '', 'token': json[0].token || '', 'nationality': json[0].nationality, 'bio': json[0].bio,
                'bank': json[0].bank, 'account_holder': json[0].account_holder, 'account_number': json[0].account_number,
            }));
            console.log('asdasdsad22')
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

            console.log('asdasdsad')
            this.setState({ isFetching: false })
            this.props.navigation.reset({ index: 1, routes: [{ name: 'Main', params: { screen: I18n.t('profile') } }, { name: 'HostExperiencesManage' }] })
        } else {
            this.setState({ isFetching: false })
            this.props.navigation.reset({ index: 1, routes: [{ name: 'Main', params: { screen: I18n.t('profile') } }, { name: 'HostExperiencesManage' }] })
        }
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceInsert01Title')}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ marginLeft: 16, marginRight: 16, height: 1, backgroundColor: 'rgba(156, 159, 161, 0.5)', marginTop: 20 }}></View>

                    <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 16 }}>
                        <KeyboardAwareScrollView enableOnAndroid={true}>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceInsert04Photos')}</Text>

                            <View style={{ width: '100%', }}>
                                <View style={{ marginTop: 12, flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={() => this.setState({ type: 1 }, () => Platform.OS == 'ios' ? this.openPicker() : this.hasAndroidPermission())}>
                                        <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorEDEDED, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={imgCamera} style={{ width: 20, height: 18, resizeMode: 'contain' }}></Image>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={{ flexWrap: 'wrap', flexDirection: 'row' }}>
                                        {this.state.photoDatas.map((item, index) => (
                                            <TouchableWithoutFeedback>
                                                <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorFFFFFF, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 12, marginTop: index < 4 ? 0 : 12 }}>
                                                    <Image source={this.state.photoDatas.length > index ? { uri: item.path } : null} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }}></Image>
                                                    <TouchableOpacity style={{ position: 'absolute', right: 4, top: 2 }} onPress={() => this._PhotoUrlsDelete(item)}>
                                                        <View style={{ width: 15, height: 15, borderRadius: 8, backgroundColor: Colors.colorE94D3E, alignItems: 'center', justifyContent: 'center' }}>
                                                            <Image source={imgDelete} style={{ width: 7, height: 8, resizeMode: 'contain' }}></Image>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert04Cover')}</Text>
                            <View style={{ marginTop: 12, flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => this.setState({ type: 2 }, () => Platform.OS == 'ios' ? this.openPicker() : this.hasAndroidPermission())}>
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorEDEDED, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={imgCamera} style={{ width: 20, height: 18, resizeMode: 'contain' }}></Image>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorFFFFFF, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                                        <Image source={this.state.coverDatas.length > 0 ? { uri: this.state.coverDatas[0].path } : null} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }}></Image>
                                        {this.state.coverDatas.length > 0 && <TouchableOpacity style={{ position: 'absolute', right: 4, top: 2 }} onPress={() => this.setState({ coverDatas: [] })}>
                                            <View style={{ width: 15, height: 15, borderRadius: 8, backgroundColor: Colors.colorE94D3E, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={imgDelete} style={{ width: 7, height: 8, resizeMode: 'contain' }}></Image>
                                            </View>
                                        </TouchableOpacity>}
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={{ flex: 1, marginTop: 12, }} onPress={() => this.setState({ degreeCheck: this.state.degreeCheck == false ? true : false, })}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image source={(this.state.degreeCheck == false ? imgCheckOff : imgCheckOn)} style={{ width: 15, height: 15, resizeMode: 'contain' }}></Image>
                                    <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{I18n.t('hostExperienceInsert04Degree')}</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={{ height: 168 }}></View>
                        </KeyboardAwareScrollView>
                    </View>
                    <TouchableOpacity style={{ width: '100%', height: 48, position: 'absolute', bottom: 20, paddingLeft: 16, paddingRight: 16 }} onPress={() => this.setState({ isFetching: true }, () => this._InsertExperience())} disabled={(this.state.degreeCheck == true && this.state.coverDatas.length > 0 && this.state.photoDatas.length > 0) ? false : true}>
                        <View style={{ width: '100%', height: 48, borderRadius: 4, backgroundColor: (this.state.degreeCheck == true && this.state.coverDatas.length > 0 && this.state.photoDatas.length > 0) ? Colors.color2D7DC8 : Colors.colorB7B7B7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{I18n.t('hostExperienceInsert04Done')}</Text>
                        </View>
                    </TouchableOpacity>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}