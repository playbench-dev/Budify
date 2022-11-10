import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, TouchableOpacity, Animated, PermissionsAndroid, Platform } from 'react-native'
import FastImage from 'react-native-fast-image'
import ImageViewer from 'react-native-image-zoom-viewer';
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import * as Utils from '../../Common/Utils'
import User from '../../Common/User';
import * as NetworkCall from '../../Common/NetworkCall'
import ServerUrl from '../../Common/ServerUrl'
import FetchingIndicator from 'react-native-fetching-indicator'
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';

const TAG = "ContentReviewInsert"
const imgBack = require('../../../assets/ic_back.png');
const imgRegionBg = require('../../../assets/img_region_bg.png');
const imgStartOff = require('../../../assets/ic_review_start_off.png');
const imgCamera = require('../../../assets/ic_review_camera.png');

const { width: screenWidth } = Dimensions.get('window');

export default class ContentReviewInsert extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        type: 0, // 0-experience, 1-place
        score: 0,
        photoWidth: screenWidth - 80,
        photoDatas: [],
        contents: '',
        isFetching: false,
    }

    componentDidMount() {

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
                maxSelectedAssets: 4,
                selectedAssets: this.state.photoDatas,
                isExportThumbnail: true,
                singleSelectedMode: false,
                isCrop: true,
                isCropCircle: true,
            }).then((response) => {
                console.log('aaa ', response)
                this.setState({
                    isFetching: false,
                    photoDatas: response
                })
            }).catch((e) => {
                console.log('catch', e)
            });
        } catch (e) {
            console.log(e.code, e.message);

        }
    };

    parentFunction = value => {
        this.state.photoDatas = [];
        for (let i = 0; i < Object.keys(value).length; i++) {
            console.log(TAG, JSON.stringify(value[i]))
            this.state.photoDatas.push(value[i])
            // }
        }
        this.setState({
            isLoading: false,
        })
    }

    _goBack(value) {
        this.props.route.params.parentFunction(value);
        this.props.navigation.goBack();
    }

    _InsertReview() {
        var url = "";
        let formdata = new FormData();
        url = ServerUrl.ContentInsertReview

        formdata.append('rate', this.state.score)
        formdata.append('content', this.state.contents)
        formdata.append('user_no', User.userNo)
        formdata.append('place_no', this.props.route.params.placeNo)

        if (this.state.photoDatas.length > 0) {
            for (let i = 0; i < this.state.photoDatas.length; i++) {
                // if (Platform.OS == 'android') {
                //     let imageName = this.state.photoDatas[i].uri.split('/').pop();
                //     let imageType = this.state.photoDatas[i].uri.split('.').pop();
                //     const photo = {
                //         uri: this.state.photoDatas[i].uri,
                //         type: 'image/' + imageType,
                //         filename: imageName + i,
                //         name: imageName + i,
                //     };
                //     formdata.append("review_images", photo);
                // } else {
                //     let imageName = this.state.photoDatas[i].filename.split('.')[0];
                //     let imageType = this.state.photoDatas[i].filename.split('.')[1];
                //     const photo = {
                //         uri: this.state.photoDatas[i].uri,
                //         type: 'image/' + imageType,
                //         filename: imageName + i,
                //         name: imageName + i,
                //     };
                //     formdata.append("review_images", photo);
                // }
                let imageName = this.state.photoDatas[i].fileName;
                const photo = {
                    uri: this.state.photoDatas[i].path,
                    type: this.state.photoDatas[i].mime,
                    filename: imageName,
                    name: imageName,
                };
                formdata.append("place_review_images", photo);
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
                    this.setState({ isFetching: false }, () => this._goBack('Success'))
                } else {
                    this.setState({ isFetching: false })
                }
            })
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, }}>
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 16 }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('reviewTitle')}</Text>
                    </View>
                    <ScrollView>
                        <ImageBackground source={{ uri: this.props.route.params.repPath }} style={{ width: '100%', height: screenWidth * 0.3692, marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 20, color: Colors.colorFFFFFF }}>{this.props.route.params.title}</Text>
                            <Text style={{ fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 14, color: Colors.colorFFFFFF, marginTop: 16 }}>{this.props.route.params.contents}</Text>
                        </ImageBackground>

                        <View style={{ width: '100%', paddingLeft: 16, paddingRight: 16, marginTop: 24 }}>
                            <Text style={{ fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, color: Colors.color000000 }}>{I18n.t('reviewRating')}</Text>
                            <Text style={{ fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 14, color: Colors.color000000, marginTop: 8 }}>{this.state.type == 0 ? I18n.t('reviewRatingText') : I18n.t('reviewPlaceRatingText')}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 16 }}>
                                <TouchableOpacity onPress={() => this.setState({ score: 1 })}>
                                    <Image style={{ width: 40, height: 40, resizeMode: 'contain', tintColor: this.state.score > 0 ? Colors.color2D7DC8 : Colors.colorD9D9D9 }} source={imgStartOff}></Image>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.setState({ score: 2 })}>
                                    <Image style={{ width: 40, height: 40, resizeMode: 'contain', marginLeft: 11, tintColor: this.state.score > 1 ? Colors.color2D7DC8 : Colors.colorD9D9D9 }} source={imgStartOff}></Image>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.setState({ score: 3 })}>
                                    <Image style={{ width: 40, height: 40, resizeMode: 'contain', marginLeft: 11, tintColor: this.state.score > 2 ? Colors.color2D7DC8 : Colors.colorD9D9D9 }} source={imgStartOff}></Image>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.setState({ score: 4 })}>
                                    <Image style={{ width: 40, height: 40, resizeMode: 'contain', marginLeft: 11, tintColor: this.state.score > 3 ? Colors.color2D7DC8 : Colors.colorD9D9D9 }} source={imgStartOff}></Image>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.setState({ score: 5 })}>
                                    <Image style={{ width: 40, height: 40, resizeMode: 'contain', marginLeft: 11, tintColor: this.state.score > 4 ? Colors.color2D7DC8 : Colors.colorD9D9D9 }} source={imgStartOff}></Image>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ marginTop: 20, height: 8, width: '100%', backgroundColor: Colors.colorF4F4F4 }}></View>

                        <View style={{ width: '100%', paddingLeft: 16, paddingRight: 16, marginTop: 24 }}>
                            <Text style={{ fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, color: Colors.color000000 }}>{I18n.t('reviewDetailTitle')}</Text>
                            <Text style={{ fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 14, color: Colors.color000000, marginTop: 8 }}>{this.state.type == 0 ? I18n.t('reviewDetailText') : I18n.t('reviewPlaceRatingDetailText')}</Text>
                            <View style={{ borderWidth: 1, borderRadius: 4, height: 152, borderColor: Colors.colorB7B7B7, marginTop: 8, padding: 8 }}>
                                <TextInput style={{ color: Colors.color000000, padding: 0, margin: 0, flex: 1, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, textAlignVertical: 'top' }} placeholderTextColor={Colors.colorB7B7B7} multiline={true} placeholder={this.state.type == 0 ? I18n.t('reviewHint') : I18n.t('reviewPlaceHint')} onChangeText={(text) => this.setState({ contents: text })}></TextInput>
                            </View>
                        </View>

                        <View style={{ marginTop: 20, height: 8, width: '100%', backgroundColor: Colors.colorF4F4F4 }}></View>

                        <View style={{ width: '100%', paddingLeft: 16, paddingRight: 16, marginTop: 24 }}>
                            <Text style={{ fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, color: Colors.color000000 }}>{I18n.t('reviewPhotoTitle')}</Text>
                            <Text style={{ fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 14, color: Colors.color000000, marginTop: 8 }}>{this.state.type == 0 ? I18n.t('reviewPhotoText') : I18n.t('reviewPlacePhoto')}</Text>
                            <View style={{ marginTop: 12, flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => Platform.OS == 'ios' ? this.openPicker() : this.hasAndroidPermission()}>
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorEDEDED, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={imgCamera} style={{ width: 20, height: 18, resizeMode: 'contain' }}></Image>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorFFFFFF, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                                        <Image source={this.state.photoDatas.length > 0 ? { uri: this.state.photoDatas[0].path } : null} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }}></Image>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorFFFFFF, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                                        <Image source={this.state.photoDatas.length > 1 ? { uri: this.state.photoDatas[1].path } : null} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }}></Image>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorFFFFFF, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                                        <Image source={this.state.photoDatas.length > 2 ? { uri: this.state.photoDatas[2].path } : null} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }}></Image>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorFFFFFF, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                                        <Image source={this.state.photoDatas.length > 3 ? { uri: this.state.photoDatas[3].path } : null} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }}></Image>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={() => this.setState({ isFetching: true }, () => this._InsertReview())} disabled={this.state.score == 0 || this.state.contents.length == 0 ? true : false}>
                                <View style={{ height: 48, backgroundColor: this.state.score == 0 || this.state.contents.length == 0 ? Colors.colorBABABA : Colors.color2D7DC8, marginBottom: 20, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginTop: 36 }}>
                                    <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, }}>{I18n.t('reviewUpload')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>


                    </ScrollView>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}