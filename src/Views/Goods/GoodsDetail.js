import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, TouchableOpacity, Animated, Linking, } from 'react-native'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import * as Utils from '../../Common/Utils'
import * as NetworkCall from '../../Common/NetworkCall'
import ServerUrl from '../../Common/ServerUrl'
import PageList from 'react-native-page-list'
import ImageViewer from 'react-native-image-zoom-viewer';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Toast from 'react-native-toast-message';
import User from '../../Common/User';
import ReadMore from '@fawazahmed/react-native-read-more';
import FastImage from 'react-native-fast-image'
import PagerView from 'react-native-pager-view';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe'
import FetchingIndicator from 'react-native-fetching-indicator'
import Geocoder from 'react-native-geocoding';
import Moment from 'moment';
import RNFetchBlob from 'rn-fetch-blob'
import Share from 'react-native-share'

const TAG = "GoodsDetail"
const imgBack = require('../../../assets/ic_close_white.png');
const imgShared = require('../../../assets/ic_shared.png');
const imgBookmark = require('../../../assets/ic_bookmark.png');
const imgBookmarkBlack = require('../../../assets/ic_bookmark_black.png');
const imgStarOn = require('../../../assets/ic_star.png');
const imgStarOff = require('../../../assets/ic_star_off.png');
const imgCircleSaveBg = require('../../../assets/ic_circle_saved.png');
const imgLinkBg = require('../../../assets/ic_link_bg.png');
const imgInstargramBg = require('../../../assets/ic_link_instagram_bg.png');
const imgLinkKakao = require('../../../assets/ic_link_kakao.png');
const imgLinkMore = require('../../../assets/ic_link_more.png');
const imgLink = require('../../../assets/ic_link.png');
const imgAccount = require('../../../assets/account_circle.png')

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default class GoodsDetail extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        Geocoder.init("AIzaSyCePbzWSXlyg8wUqrB0yvWPOLzq0maVfdI");
        console.log('componentDidMount')
        // this._Reviews()
        this._Experience()
    }

    state = {
        pagerViewPosition: 0,
        experienceAboutTextLength: 0,
        experienceAboutTextFlag: false,
        experienceBuddyTextLength: 0,
        experienceBuddyTextFlag: false,
        imgMagnify: false,
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
        reviewDatas: [],
        similarDatas: [],
        recommendedFalg: 0, // 0 - place, 1- Experience
        specialExperienceDatas: [],
        specialPlaceDatas: [],
        sharedDialogVisible: false,
        reviewContentsLineLength1: 0,
        reviewContentsLineLength2: 0,
        reviewContentsLineLength3: 0,
        mapWidth: '100%',
        exNo: this.props.route.params.exNo,
        country: -1,
        city: -1,
        town: -1,
        address: '',
        addressDetail: '',
        lat: 37.541,
        lng: 126.986,
        categories: [],
        hashTags: [],
        title: '',
        description: '',
        price: 0,
        currency: '',
        minGuest: 0,
        maxGuest: 0,
        shortVideoLink: '',
        videoLink: '',
        includedItems: [],
        bringItems: [],
        criteria: '',
        imagesUrl: [],
        minutes: '',
        languages: '',
        representativeFileUrl: [],
        rate: 0,
        reviewCnt: 0,
        orderCnt: 0,
        createrInfo: {},
        isFetching: true,
        buddyProfile: '',
        totalCnt: 0,
        backBtnY: 0,
    }

    _MakeSpecialExperienceChild() {
        let result = [];
        let size = this.state.specialExperienceDatas.length;

        if (size > 0) {
            for (let i = 0; i < size / 2; i++) {
                result = result.concat(
                    <View key={i} style={{ flexDirection: 'row', marginTop: (i == 0 ? 15 : 12) }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('GoodsDetail', { exNo: this.state.specialExperienceDatas[(i * 2)].ex_no })}>
                            <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 0, }}>
                                <FastImage style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, borderRadius: 4 }} source={{ uri: this.state.specialExperienceDatas[(i * 2)].representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(1, this.state.specialExperienceDatas[(i * 2)].ex_no)}>
                                    <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={User.exSaved.includes(this.state.specialExperienceDatas[(i * 2)].ex_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                    </ImageBackground>
                                </TouchableOpacity>

                                <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, }} numberOfLines={2} ellipsizeMode="tail">{this.state.specialExperienceDatas[(i * 2)].title}</Text>

                                <View style={{ width: '55%', flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                                    {this._MakeStar(this.state.specialExperienceDatas[(i * 2)].rate, this.state.specialExperienceDatas[(i * 2)].reviewCnt)}
                                    <View style={{ width: '100%', }}>
                                        <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{"・" + this.state.specialExperienceDatas[(i * 2)].currency + Utils.numberWithCommas(this.state.specialExperienceDatas[(i * 2)].price)}</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 10, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{Utils.Grinder(this.state.specialExperienceDatas[(i * 2)].category[0]) + "・" + this.state.specialExperienceDatas[(i * 2)].town}</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>

                        {this.state.specialExperienceDatas.length != ((i * 2) + 1) && <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('GoodsDetail', { exNo: this.state.specialExperienceDatas[(i * 2) + 1].ex_no })}>
                            <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 14, }}>
                                <FastImage style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, borderRadius: 4 }} source={{ uri: this.state.specialExperienceDatas[(i * 2) + 1].representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(1, this.state.specialExperienceDatas[(i * 2) + 1].ex_no)}>
                                    <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={User.exSaved.includes(this.state.specialExperienceDatas[(i * 2) + 1].ex_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                    </ImageBackground>
                                </TouchableOpacity>

                                <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, }} numberOfLines={2} ellipsizeMode="tail">{this.state.specialExperienceDatas[(i * 2) + 1].title}</Text>

                                <View style={{ width: '55%', flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                                    {this._MakeStar(this.state.specialExperienceDatas[(i * 2) + 1].rate, this.state.specialExperienceDatas[(i * 2) + 1].reviewCnt)}
                                    <View style={{ width: '100%', }}>
                                        <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{"・" + this.state.specialExperienceDatas[(i * 2) + 1].currency + Utils.numberWithCommas(this.state.specialExperienceDatas[(i * 2) + 1].price)}</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 10, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{Utils.Grinder(this.state.specialExperienceDatas[(i * 2) + 1].category[0]) + "・" + this.state.specialExperienceDatas[(i * 2) + 1].town}</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        }
                    </View >
                )
            }
        }
        return result
    }

    _MakeSpecialPlaceChild() {
        let result = [];
        let size = this.state.specialPlaceDatas.length;

        if (size > 0) {
            for (let i = 0; i < size / 2; i++) {
                result = result.concat(
                    <View key={i} style={{ flexDirection: 'row', marginTop: (i == 0 ? 15 : 12) }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('PlaceDetail', { placeNo: this.state.specialPlaceDatas[(i * 2)].place_no })}>
                            <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 0, }}>
                                <FastImage style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, borderRadius: 4 }} source={{ uri: this.state.specialPlaceDatas[(i * 2)].representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(2, this.state.specialPlaceDatas[(i * 2)].place_no)}>
                                    <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={User.placeSaved.includes(this.state.specialPlaceDatas[(i * 2)].place_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                    </ImageBackground>
                                </TouchableOpacity>

                                <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, }} numberOfLines={1} ellipsizeMode="tail">{this.state.specialPlaceDatas[(i * 2)].title}</Text>

                                <View style={{ width: '55%', flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                                    {this._MakeStar(this.state.specialPlaceDatas[(i * 2)].rate, this.state.specialPlaceDatas[(i * 2)].reviewCnt)}
                                    <View style={{ width: '100%', }}>
                                        <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{"・" + this.state.specialPlaceDatas[(i * 2)].saved + " saved"}</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 10, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == this.state.specialPlaceDatas[(i * 2)].category[0])[0]) + "・" + this.state.specialPlaceDatas[(i * 2)].town}</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>

                        {this.state.specialExperienceDatas.length != ((i * 2) + 1) && <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('PlaceDetail', { placeNo: this.state.specialPlaceDatas[(i * 2) + 1].place_no })}>
                            <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 14, }}>
                                <FastImage style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, borderRadius: 4 }} source={{ uri: this.state.specialPlaceDatas[(i * 2) + 1].representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(2, this.state.specialPlaceDatas[(i * 2) + 1].place_no)}>
                                    <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={User.placeSaved.includes(this.state.specialPlaceDatas[(i * 2) + 1].place_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                    </ImageBackground>
                                </TouchableOpacity>

                                <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, }} numberOfLines={1} ellipsizeMode="tail">{this.state.specialPlaceDatas[(i * 2) + 1].title}</Text>

                                <View style={{ width: '55%', flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                                    {this._MakeStar(this.state.specialPlaceDatas[(i * 2) + 1].rate, this.state.specialPlaceDatas[(i * 2) + 1].reviewCnt)}
                                    <View style={{ width: '100%', }}>
                                        <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{"・" + this.state.specialPlaceDatas[(i * 2) + 1].saved + " saved"}</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 10, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == this.state.specialPlaceDatas[(i * 2) + 1].category[0])[0]) + "・" + this.state.specialPlaceDatas[(i * 2) + 1].town}</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        }
                    </View >
                )
            }
        }
        return result
    }

    _Bookmark = (flag, no) => {
        if (flag == 1) {
            if (User.exSaved.includes(no)) {
                this._DelectSaved(flag, no)
            } else {
                this._SelectSaved(flag, no)
            }
            console.log(User.exSaved)
        } else {
            if (User.placeSaved.includes(no)) {
                this._DelectSaved(flag, no)
            } else {
                this._SelectSaved(flag, no)
            }
        }
    }

    _MakeStar(value, reviewCnt) {
        let result = [];
        if (reviewCnt == 0) {
            result = result.concat(
                <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, }}>{I18n.t('homeNewExperience')}</Text>
            )
        } else {
            for (let i = 0; i < value; i++) {
                result = result.concat(
                    <Image key={i} source={imgStarOn} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                )
            }
            for (let i = 0; i < 5 - value; i++) {
                result = result.concat(
                    <Image key={i + value} source={imgStarOff} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                )
            }
            result = result.concat(
                <Text style={{ marginLeft: 1, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }}>{"(" + reviewCnt + ")"}</Text>
            )
        }
        return result
    }

    _ReviewStar(value) {
        let result = [];
        for (let i = 0; i < value; i++) {
            result = result.concat(
                <Image key={i} source={imgStarOn} style={{ width: 11, height: 11, resizeMode: 'contain' }}></Image>
            )
        }
        return result
    }

    _TranslateEnToKo(value, translateStr) {
        if (I18n.currentLocale() == 'en-US') {
            return translateStr + value
        } else {
            return value + translateStr
        }
    }

    _AboutTextLine = event => {
        this.state.experienceAboutTextLength = event.nativeEvent.lines.length
    }

    _BuddyTextLine = event => {
        this.state.experienceBuddyTextLength = event.nativeEvent.lines.length
        // this.setState({
        //     experienceAboutTextLength: this.state.experienceAboutTextLength,
        //     experienceBuddyTextLength: this.state.experienceBuddyTextLength
        // })
    }

    _ImageMagnify() {
        return (
            <Modal transparent={true} visible={this.state.imgMagnify} >
                <View>
                    <TouchableWithoutFeedback onPress={() => this.setState({ imgMagnify: false })}>
                        <View style={{ height: '100%', width: '100%', justifyContent: "center", alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', }}>
                            <ImageViewer style={{ width: '100%', height: '100%' }} imageUrls={this.state.imagesUrl} onChange={(index) => console.log('_ImageMagnify', index)} saveToLocalByLongPress={false} enableSwipeDown={true} onSwipeDown={() => this.setState({ imgMagnify: false })}></ImageViewer>
                            <TouchableOpacity onPress={() => this.setState({ imgMagnify: false })} style={{ position: 'absolute', top: 0, width: '100%', height: (screenHeight - screenWidth) / 2.5 }}>
                                <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
                                    {/* <Image source={imgBack} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image> */}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.setState({ imgMagnify: false })} style={{ position: 'absolute', bottom: 0, width: '100%', height: (screenHeight - screenWidth) / 2.5 }}>
                                <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
                                    {/* <Image source={imgBack} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image> */}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </Modal >
        )
    }

    onShare = async () => {
        try {
            const result = await Share.shareSingle(
                {
                    message: '공유에 보이는 메세지 이거를 복붙할 수도 있엉!',
                    social: Share.Social.WHATSAPP,
                    url: 'data:image/jpeg;base64,'
                }
            );

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('activityType!');
                } else {
                    console.log('Share!');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('dismissed');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    shareImage() {
        // .then((res) => { console.log(res) })
        // .catch((err) => { err && console.log(err); });
        let shareOptions = {
            title: 'Title',
            url: 'https://www.budify.io/Experiences/107',
            type: '/image',
            message: 'Budify에서 이 경험을 확인해보세요!',
            subject: 'Subject',
            social: Share.Social.WHATSAPP,
        };
        Share.shareSingle(shareOptions)
        // Linking.openURL('whatsapp://send?text=' + 'budify.io/Experiences/82' + '&image=' + 'https://budify.info/images/ex/36/images/2022090901005720220831104450ScreenShot2022-08-28at3.29.35PM.png')
        // RNFetchBlob.fetch('GET', 'https://budify.info/images/ex/36/images/2022090901005720220831104450ScreenShot2022-08-28at3.29.35PM.png')
        //     .then(resp => {
        //         let base64image = resp.data;
        //         // share('data:image/png;base64,' + base64image);

        //     })
        //     .catch(err => errorHandler(err));
        // share = base64image => {
        //     let shareOptions = {
        //         title: 'Title',
        //         url: base64image,
        //         message: 'https://www.budify.io/Experiences/107',
        //         subject: 'Subject',
        //         social: Share.Social.WHATSAPP,
        //     };
        //     Share.shareSingle(shareOptions)
        //     // .then((res) => { console.log(res) })
        //     // .catch((err) => { err && console.log(err); });

        //     // Share.shareSingle(shareOptions)
        //     //     .then(res => {
        //     //         console.log(res);
        //     //     })
        //     //     .catch(err => {
        //     //         err && console.log(err);
        //     //     });
        // };

    };

    shareTheProductDetails(imagesPath) {
        // let {productDetails} = this.state;
        let imagePath = null;
        RNFetchBlob.config({
            fileCache: true,
        })
            .fetch('GET', 'https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013')
            // the image is now dowloaded to device's storage
            .then((resp) => {
                // the image path you can use it directly with Image component
                imagePath = resp.path();
                return resp.readFile('base64');
            })
            .then((base64Data) => {
                // here's base64 encoded image
                var imageUrl = 'data:image/png;base64,' + base64Data;
                let shareImage = {
                    title: 'title', //string
                    message:
                        'Description ' +
                        ' http://beparr.com/', //string
                    url: imageUrl,
                    social: Share.Social.WHATSAPP
                    // urls: [imageUrl, imageUrl], // eg.'http://img.gemejo.com/product/8c/099/cf53b3a6008136ef0882197d5f5.jpg',
                };
                Share.shareSingle(shareImage)
                    .then((res) => {
                        console.log('aaaaa : ', res);
                    })
                    .catch((err) => {
                        err && console.log(err);
                    });
                // remove the file from storage
                return fs.unlink(imagePath);
            });
    }

    _SharedDialog() {
        return (
            <Modal transparent={true} visible={this.state.sharedDialogVisible}>
                <TouchableWithoutFeedback onPress={() => this.setState({ sharedDialogVisible: false })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                        <TouchableWithoutFeedback >
                            <View style={{ width: '100%', backgroundColor: Colors.colorFFFFFF, borderTopLeftRadius: 8, borderTopRightRadius: 8, paddingTop: 16, paddingLeft: 16, paddingRight: 16, paddingBottom: 38 }}>
                                <Text style={{ fontSize: 20, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('share')}</Text>
                                <View style={{ marginTop: 12, height: 1, backgroundColor: Colors.colorBFBFBF }}></View>

                                <View style={{ marginTop: 20 }}>
                                    <TouchableWithoutFeedback >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }} imageStyle={{ tintColor: Colors.color569BEF }}>
                                                <Image source={imgLink} style={{ width: 17, height: 9 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareCopyLink')}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback onPress={() => Linking.openURL('kakaoTalk://')}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={imgLinkKakao} style={{ width: 20, height: 16 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnKakao')}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                            <ImageBackground source={imgInstargramBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image style={{ width: 20, height: 16 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnInstagram')}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback onPress={() => this.shareImage()}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }} imageStyle={{ tintColor: Colors.color569BEF }}>
                                                <Image style={{ width: 17, height: 9 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnWhatsApp')}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }} imageStyle={{ tintColor: Colors.colorD9D9D9 }}>
                                                <Image source={imgLinkMore} style={{ width: 13, height: 3 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareMore')}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal >
        )
    }

    async _Experience() {
        const url = ServerUrl.SelectExperience
        let formBody = JSON.stringify({
            "conditions": [
                {
                    "q": "=",
                    "f": "ex_no",
                    "v": this.state.exNo,
                }
            ]
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log(json)
        if (json.length > 0) {

            let imagesItemUrl = [];
            let representative = [];
            if (json[0].image_urls == null || json[0].image_urls.length == 0) {
                imagesItemUrl.push({ url: 'https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013' })
                representative.push('https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013')
            } else {
                const urls = JSON.parse(json[0].image_urls)
                for (let i = 0; i < urls.length; i++) {
                    imagesItemUrl.push({ url: ServerUrl.Server + urls[i] })
                    representative.push(ServerUrl.Server + + urls[i])
                }
            }

            let includs = [];
            if (json[0].description_cost_included == null || json[0].description_cost_included.length == 0) {

            } else {
                const inclusItem = JSON.parse(json[0].description_cost_included)
                for (let i = 0; i < inclusItem.length; i++) {
                    includs.push(inclusItem[i])
                }
            }

            let brings = [];
            if (json[0].description_guest_equipments == null || json[0].description_guest_equipments.length == 0) {

            } else {
                const bringsItem = JSON.parse(json[0].description_guest_equipments)
                for (let i = 0; i < bringsItem.length; i++) {
                    brings.push(bringsItem[i])
                }
            }

            let languageItems = '';
            for (let i = 0; i < json[0].languages.length; i++) {
                if (i != 0) {
                    languageItems += ', '
                }
                languageItems += Utils.Grinder(json[0].languages[i])
            }
            let mintuesObject = '';
            if (parseInt(json[0].minutes) > 60 && parseInt(json[0].minutes) < 1440) {
                if (parseInt(json[0].minutes) % 60 == 0) {
                    mintuesObject = Math.floor(parseInt(json[0].minutes) / 60) + I18n.t('goodsHours')
                } else {
                    mintuesObject = Math.floor(parseInt(json[0].minutes) / 60) + I18n.t('goodsHours') + ' ' + parseInt(json[0].minutes) % 60 + I18n.t('goodsMinutes')
                }
            } else if (parseInt(json[0].minutes) > 1440) {
                mintuesObject = Math.floor(parseInt(json[0].minutes) / 60 / 24) + I18n.t('goodsDays')
            } else {
                mintuesObject = json[0].minutes + I18n.t('goodsMinutes')
            }
            console.log(representative)
            this.state.country = json[0].country;
            this.state.city = json[0].city;
            this.state.town = json[0].town;
            this.state.address = json[0].address;
            this.state.lat = json[0].lat;
            this.state.lng = json[0].lng;
            this.state.addressDetail = json[0].address_detail;
            this.state.categories = json[0].categories;
            this.state.hashTags = json[0].hashtags;
            this.state.title = json[0].title;
            this.state.description = json[0].description;
            this.state.price = json[0].price;
            this.state.currency = json[0].currency == "USD" ? "$" : json[0].currency == "KRW" ? "₩" : json[0].currency == "EUR" ? "€" : json[0].currency == "JPY" ? "¥" : json[0].currency;
            this.state.minGuest = json[0].min_guest || 0;
            this.state.maxGuest = json[0].max_guest || 0;
            this.state.shortVideoLink = json[0].short_video_link;
            this.state.videoLink = json[0].video_link;
            this.state.includedItems = includs;
            this.state.bringItems = brings;
            this.state.criteria = json[0].description_criteria;
            this.state.imagesUrl = imagesItemUrl;
            this.state.minutes = mintuesObject;
            this.state.languages = languageItems;
            this.state.representativeFileUrl = representative;
            this.state.rate = json[0].rate;
            this.state.reviewCnt = json[0].review_cnt;
            this.state.orderCnt = json[0].order_cnt;
            this.state.createrInfo = json[0].userInfo;
            this.state.isFetching = false;
            this.state.buddyProfile = json[0].userInfo.avatar_url || '';
            this._Reviews()
        } else {
            this._Reviews()
        }
    }

    async _Reviews() {
        const url = ServerUrl.SelectReview
        let formBody = JSON.stringify({
            "conditions": [
                {
                    "q": "=",
                    "f": "ex_no",
                    "v": this.state.exNo
                    // "v": 178
                },
                {
                    "q": "page",
                    "limit": "8",
                    "offset": 0
                }, {
                    "q": "order",
                    "f": "c_dt",
                    "o": "DESC"
                }
            ]
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log('Review', json)
        if (json.reviewInfo.length > 0) {
            for (let i = 0; i < json.reviewInfo.length; i++) {

                const obj = {
                    profilePath: json.reviewInfo[i].userInfo.avatar_url || '',
                    userName: json.reviewInfo[i].userInfo.nickname,
                    startScore: json.reviewInfo[i].rate,
                    contents: json.reviewInfo[i].content,
                    pictureUrl: json.reviewInfo[i].image_urls == null ? [] : JSON.parse(json.reviewInfo[i].image_urls.replace(/'/gi, '')),
                    reviewNo: json.reviewInfo[i].review_no,
                    reviewDate: json.reviewInfo[i].e_dt
                }
                this.state.reviewDatas.push(obj)
                // console.log(this.state.reviewDatas[i].pictureUrl.length)
            }
            this.state.totalCnt = json.total;
            this._SimilarExperience()
        } else {
            this._SimilarExperience()
        }
    }

    async _SimilarExperience() {

        let formBodyExperience = JSON.stringify({
            "ex_no": this.state.exNo,
            "user_no": User.userNo,
            "town": this.state.town,
            "city": this.state.city,
            "categoryList": JSON.stringify(this.state.categories)
        })
        const jsonEx = await NetworkCall.Select(ServerUrl.SearchSimilarExperience, formBodyExperience)

        for (let i = 0; i < jsonEx.length; i++) {
            let test = [];
            if (jsonEx[i].representative_file_url == null || jsonEx[i].representative_file_url.length == 0) {
                // test.push('https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013')
            } else {
                const representativeItem = JSON.parse(jsonEx[i].representative_file_url)
                for (let i = 0; i < representativeItem.length; i++) {
                    test.push(ServerUrl.Server + representativeItem[i])
                    // FastImage.preload([{ uri: ServerUrl.Server + representativeItem[i], headers: { Authorization: 'authToken' }, }])
                }
                const obj = {
                    title: jsonEx[i].title,
                    rate: jsonEx[i].rate,
                    reviewCnt: jsonEx[i].review_cnt,
                    currency: jsonEx[i].currency == "USD" ? "$" : jsonEx[i].currency == "KRW" ? "₩" : jsonEx[i].currency == "EUR" ? "€" : jsonEx[i].currency == "JPY" ? "¥" : jsonEx[i].currency,
                    price: jsonEx[i].price,
                    city: jsonEx[i].city,
                    country: jsonEx[i].country,
                    town: Utils.Grinder(User.region.filter((el) => el.town_no == jsonEx[i].town)[0]),
                    ex_no: jsonEx[i].ex_no,
                    representative_file_url: test[0],
                    category: jsonEx[i].categories
                }
                this.state.similarDatas.push(obj)
            }
        }
        this._RecommendPlaceExperience()
    }

    async _RecommendPlaceExperience() {
        let formBodyExperience = JSON.stringify({
            "conditions": [
                { "q": "order", "f": "distance", "o": "ASC" },
                { "q": "!=", "f": "ex_no", "v": this.state.exNo },
                // {"q":"having","f":"distance","opt":"<= 5"},
                { "q": "=", "f": 'status', "v": 1 },
                { "q": "page", "limit": 6, "offset": 0 }
            ],
            "lat": this.state.lat,
            "lng": this.state.lng,
        })
        const jsonEx = await NetworkCall.Select(ServerUrl.SearchRecommendedExperience, formBodyExperience)

        // console.log(jsonEx)

        for (let i = 0; i < jsonEx.length; i++) {
            let test = [];
            if (jsonEx[i].representative_file_url == null || jsonEx[i].representative_file_url.length == 0) {
                // test.push('https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013')
            } else {
                const representativeItem = JSON.parse(jsonEx[i].representative_file_url)
                for (let i = 0; i < representativeItem.length; i++) {
                    test.push(ServerUrl.Server + representativeItem[i])
                    // FastImage.preload([{ uri: ServerUrl.Server + representativeItem[i], headers: { Authorization: 'authToken' }, }])
                }
                const obj = {
                    title: jsonEx[i].title,
                    rate: jsonEx[i].rate,
                    reviewCnt: jsonEx[i].review_cnt,
                    currency: jsonEx[i].currency == "USD" ? "$" : jsonEx[i].currency == "KRW" ? "₩" : jsonEx[i].currency == "EUR" ? "€" : jsonEx[i].currency == "JPY" ? "¥" : jsonEx[i].currency,
                    price: jsonEx[i].price,
                    city: jsonEx[i].city,
                    country: jsonEx[i].country,
                    town: Utils.Grinder(User.region.filter((el) => el.town_no == jsonEx[i].town)[0]),
                    ex_no: jsonEx[i].ex_no,
                    representative_file_url: test[0],
                    category: jsonEx[i].categories
                }
                this.state.specialExperienceDatas.push(obj)
            }

        }

        let formBodyPlace = JSON.stringify({
            "conditions": [
                { "q": "order", "f": "distance", "o": "ASC" },
                // {"q":"!=","f":"place_no","v":29},
                // {"q":"having","f":"distance","opt":"<= 5"},
                { "q": "=", "f": 'status', "v": 1 },
                { "q": "page", "limit": 6, "offset": 0 }
            ],
            "lat": this.state.lat,
            "lng": this.state.lng,
        })
        const jsonPlace = await NetworkCall.Select(ServerUrl.SearchRecommendedPlace, formBodyPlace)

        for (let i = 0; i < jsonPlace.length; i++) {
            if (jsonPlace[i].image_representative != null) {
                const obj = {
                    title: Utils.GrinderContents(JSON.parse(jsonPlace[i].place_name)),
                    rate: jsonPlace[i].rate,
                    reviewCnt: jsonPlace[i].review_cnt,
                    // currency: json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency,
                    price: jsonPlace[i].price,
                    city: jsonPlace[i].city,
                    country: jsonPlace[i].country,
                    saved: 0,
                    town: Utils.Grinder(User.region.filter((el) => el.town_no == jsonPlace[i].town)[0]),
                    place_no: jsonPlace[i].place_no,
                    representative_file_url: ServerUrl.Server + JSON.parse(jsonPlace[i].image_representative),
                    category: JSON.parse(jsonPlace[i].categories.replace(/'/gi, ''))
                }
                this.state.specialPlaceDatas.push(obj)
            }
        }

        this.setState({
            isFetching: false,
        })
        // console.log(jsonPlace)
    }

    test = e => {
        console.log(e.nativeEvent.layout.y)
        this.state.backBtnY = e.nativeEvent.layout.y
    }

    async _SelectSaved(flag, no) {
        const url = ServerUrl.InsertSaved
        let formBody = {};

        formBody = JSON.stringify({
            "user_no": User.userNo,
            "flag": flag,
            "content_no": no
        })

        const json = await NetworkCall.Select(url, formBody)
        console.log('_SelectSaved', json)
        if (json.length > 0) {
            Toast.show({ text1: I18n.t('savedToast') });
            if (flag == 1) {
                User.exSaved.push(no)
            } else {
                User.placeSaved.push(no)
            }
        }
        this.setState({ isFetching: false })
    }

    async _DelectSaved(flag, no) {
        const url = ServerUrl.DeleteSavedEx
        let formBody = {};

        formBody = JSON.stringify({
            "user_no": User.userNo,
            "flag": flag,
            "content_no": no
        })

        const json = await NetworkCall.Select(url, formBody)
        console.log('_DelectSaved', json)
        if (json.affectedRows == 1) {
            if (flag == 1) {
                const newList = User.exSaved.filter((item) => item !== no);
                User.exSaved = newList
            } else {
                const newList = User.placeSaved.filter((item) => item !== no);
                User.placeSaved = newList
            }
        }
        this.setState({ isFetching: false })
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ backgroundColor: Colors.colorFFFFFF, width: '100%', height: '100%' }}>
                    {this._ImageMagnify()}
                    {this._SharedDialog()}
                    <ScrollView style={{ backgroundColor: Colors.colorFFFFFF }}>
                        {this.state.imagesUrl.length == 1 ? <Image source={{ uri: this.state.imagesUrl[0].url }} style={{ width: '100%', height: (screenWidth - 0) * 0.8113, marginTop: - 58 }}></Image> : (
                            <PagerView style={{ width: '100%', height: (screenWidth - 0) * 0.8113, showsHorizontalScrollIndicator: false, marginTop: - 58 }} showPageIndicator={false} onPageSelected={(e) => this.setState({ pagerViewPosition: e.nativeEvent.position })}>
                                {this.state.imagesUrl.map((item, index) => (
                                    <View key={index} style={{ flex: 1 }}>
                                        <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover' }} source={{ uri: item.url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                    </View>
                                ))}
                            </PagerView>
                        )}

                        <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 8, }}>
                            <View style={{ backgroundColor: Colors.colorF3F3F3, borderRadius: 10, height: 4, width: '100%', flexDirection: 'row' }}>
                                {this.state.imagesUrl.map((item, index) => (
                                    <View style={{ flex: 1, backgroundColor: Colors.color232223, borderRadius: 10, opacity: index == this.state.pagerViewPosition ? 1 : 0 }}></View>
                                ))}
                            </View>

                            <View style={{ marginTop: 16, }}>
                                <Text style={{ fontSize: 24, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{this.state.title}</Text>

                                <View style={{ width: '100%', flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>

                                    {this.state.reviewCnt == 0 ? <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, }}>{I18n.t('homeNewExperience') + ' '}</Text> : (
                                        <View style={{ flexDirection: 'row' }}>
                                            <Image source={imgStarOn} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, marginLeft: 2 }}>{this.state.rate}</Text>
                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }}>{" (" + this.state.reviewCnt + ") "}</Text>
                                        </View>
                                    )}
                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, textDecorationLine: 'underline' }} >{'Experience' + "・" + Utils.Grinder(this.state.town.length != 0 ? User.region.filter((el) => el.town_no == this.state.town)[0] : this.state.city.length != 0 ? User.city.filter((el) => el.city_no == this.state.city)[0] : User.country.filter((el) => el.country_no == this.state.country)[0])}</Text>
                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} >{" | " + Utils.Grinder(this.state.categories[0])}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ marginTop: 15, backgroundColor: Colors.colorF4F4F4, height: 8 }}></View>

                        <View style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                            <View style={{ flexDirection: 'row' }}>
                                {this.state.buddyProfile.length == 0 ? <Image style={{ width: 40, height: 40, resizeMode: 'cover', borderRadius: 20, }} resizeMethod="resize" source={imgAccount}></Image> : (
                                    <FastImage style={{ width: 40, height: 40, resizeMode: 'cover', borderRadius: 20 }} source={{ uri: ServerUrl.Server + this.state.buddyProfile, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                )}
                                <View style={{ marginLeft: 16 }}>
                                    <Text style={{ fontSize: 15, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{this._TranslateEnToKo(this.state.createrInfo.nickname, I18n.t('goodsExperienceHostedBy'))}</Text>
                                    <Text style={{ marginTop: 4, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{this.state.minutes + "・" + this._TranslateEnToKo(this.state.languages, I18n.t('goodsHostedIn'))}</Text>
                                    <Text style={{ marginTop: 4, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{this.state.minGuest + " - " + this.state.maxGuest + I18n.t('goodsParticipant')}</Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 16, backgroundColor: Colors.colorE5E5E5, height: 1, width: '100%' }}></View>
                            <Text style={{ marginTop: 16, fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsAboutExperience')}</Text>
                            <Text style={{ marginTop: 8, marginBottom: 16, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }} numberOfLines={(this.state.experienceAboutTextFlag == false ? 4 : Number.MAX_VALUE)} ellipsizeMode="tail" onTextLayout={(event) => this._AboutTextLine(event)}>{this.state.description}</Text>

                            {(this.state.experienceAboutTextLength >= 4 && this.state.experienceAboutTextFlag == false) && (
                                <TouchableOpacity onPress={() => this.setState({ experienceAboutTextFlag: true })}>
                                    <View style={{}}>
                                        <Text style={{ textDecorationLine: 'underline', fontSize: 14, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsReadMore')}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {this.state.categories.length > 0 && (
                                (this.state.categories[0].category_no == 8 || this.state.categories[0].category_no == 9) ? (
                                    <View>
                                        {this.state.videoLink.length > 0 && <YoutubePlayer videoId={this.state.videoLink.split("=")[1].replace("&t", "")} width={"100%"} height={(screenWidth - 32) / 1.70} apiKey="AIzaSyB7EdD-qaEtQwtBjK_QigokkAJFZmNfwXo"
                                            fullscreen={false}
                                            loop={false}>
                                        </YoutubePlayer>
                                        }
                                        {this.state.imagesUrl.length > 0 && (
                                            <TouchableOpacity onPress={() => this.setState({ imgMagnify: true })}>
                                                <View style={{ marginTop: 4, borderColor: Colors.color000000, borderWidth: 1, borderRadius: 4, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsShowAll') + this.state.imagesUrl.length + I18n.t('goodsPhotos')}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                        <View style={{ height: 0.5, backgroundColor: Colors.colorE5E5E5, marginBottom: 16 }}></View>
                                    </View>
                                )
                                    :
                                    this.state.imagesUrl.length > 0 && (
                                        <View style={{ width: '100%' }}>
                                            <View style={{ marginTop: 24, flexDirection: 'row', height: 200, width: '100%', marginBottom: 16 }}>
                                                <TouchableWithoutFeedback onPress={() => this.setState({ imgMagnify: true })}>
                                                    <View style={{ flex: 1 }}>
                                                        <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: this.state.imagesUrl[0].url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                    </View>
                                                </TouchableWithoutFeedback>


                                                {this.state.imagesUrl.length > 1 && (
                                                    <View style={{ flex: 1, marginLeft: 6 }}>
                                                        <TouchableWithoutFeedback onPress={() => this.setState({ imgMagnify: true })}>
                                                            <View style={{ flex: 1 }}>
                                                                <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: this.state.imagesUrl[1].url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                            </View>
                                                        </TouchableWithoutFeedback>


                                                        {this.state.imagesUrl.length > 2 && (
                                                            <TouchableWithoutFeedback onPress={() => this.setState({ imgMagnify: true })}>
                                                                <View style={{ flex: 1, marginTop: 6 }}>
                                                                    <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: this.state.imagesUrl[2].url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                </View>
                                                            </TouchableWithoutFeedback>

                                                        )}
                                                    </View>
                                                )}
                                            </View>

                                            {this.state.imagesUrl.length > 3 && (
                                                <TouchableOpacity onPress={() => this.setState({ imgMagnify: true })}>
                                                    <View style={{ marginTop: 4, borderColor: Colors.color000000, borderWidth: 1, borderRadius: 4, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                                        <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsShowAll') + this.state.imagesUrl.length + I18n.t('goodsPhotos')}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                            <View style={{ height: 0.5, backgroundColor: Colors.colorE5E5E5, marginBottom: 16 }}></View>
                                        </View>
                                    )
                            )}

                            {/* Included */}
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsIncluded')}</Text>
                            {this.state.includedItems.length > 0 ? (
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
                                    {this.state.includedItems.map((item, index) => (
                                        <View style={{ height: 60, padding: 12, borderRadius: 4, borderWidth: 0.5, borderColor: Colors.colorC4C4C4, marginLeft: index == 0 ? 0 : 8 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{item.factor}</Text>
                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, marginTop: 4 }}>{item.description}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <View style={{ marginTop: 16 }}>
                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsNotIncluded')}</Text>
                                </View>
                            )}

                            <View style={{ height: 0.5, backgroundColor: Colors.colorE5E5E5, marginBottom: 16, marginTop: 16 }}></View>

                            {/* Bring */}
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsPrepare')}</Text>
                            {this.state.bringItems.length > 0 ? (
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
                                    {this.state.bringItems.map((item, index) => (
                                        <View style={{ height: 60, padding: 12, borderRadius: 4, borderWidth: 0.5, borderColor: Colors.colorC4C4C4, marginLeft: index == 0 ? 0 : 8 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{item.factor}</Text>
                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, marginTop: 4 }}>{item.description}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            ) : (
                                <View style={{ marginTop: 16 }}>
                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsNotPrepare')}</Text>
                                </View>
                            )}


                        </View>

                        {/* Google Map */}
                        {this.state.lat == 0 && this.state.lng == 0 ? null : (
                            <View>
                                <View style={{ height: 0.5, backgroundColor: Colors.colorE5E5E5, marginBottom: 16, marginTop: 16 }}></View>
                                <View style={{ paddingLeft: 16, paddingRight: 16 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsPlace')}</Text>
                                </View>
                                <View style={{ width: '100%', height: 240, marginTop: 12 }}>
                                    {this.state.title.length > 0 && <MapView
                                        style={{
                                            flex: 1,
                                            height: '100%',
                                        }}
                                        provider={PROVIDER_GOOGLE}
                                        initialRegion={{
                                            latitude: this.state.lat,
                                            longitude: this.state.lng,
                                            latitudeDelta: 0.00222,
                                            longitudeDelta: 0.00121,
                                        }}
                                        // onMapReady={() => {
                                        //     this.setState({ mapWidth: '100%', lat: this.state.lat, lng: this.state.lng })
                                        // }}
                                        // showsMyLocationButton={true}
                                        toolbarEnabled={false}
                                    >
                                        <Marker
                                            coordinate={{ latitude: this.state.lat, longitude: this.state.lng }}
                                            title="this is a marker"
                                            description="this is a marker example"
                                        />
                                    </MapView>}
                                </View>
                            </View>
                        )}

                        {/* Meeting Point */}
                        {this.state.categories.length > 0 && (
                            (this.state.categories[0].category_no == 8 || this.state.categories[0].category_no == 9) ? (
                                this.state.categories[0].category_no == 9 ?
                                    <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 12 }}>
                                        <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{'VR & AR Location'}</Text>
                                        <View style={{ width: '100%', paddingTop: 12, paddingBottom: 11, backgroundColor: Colors.colorF4F4F4, marginTop: 12, paddingLeft: 13 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{Utils.Grinder(User.city.filter((el) => el.city_no == this.state.city)[0]) + ', ' + Utils.Grinder(User.country.filter((el) => el.country_no == this.state.country)[0])}</Text>
                                        </View>
                                        <Text style={{ fontSize: 14, fontFamily: 'Raleway-Regular', includeFontPadding: false, color: Colors.color000000, marginTop: 12, marginBottom: 16 }}>{'Your experience link will be sent to you via e-mail after your reservation is created.'}</Text>
                                    </View>
                                    :
                                    <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 12 }}>
                                        <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{'Online Experience Location'}</Text>
                                        <View style={{ width: '100%', paddingTop: 12, paddingBottom: 11, backgroundColor: Colors.colorF4F4F4, marginTop: 12, paddingLeft: 13 }}>
                                            <Text style={{ fontSize: 14, fontFamily: 'Raleway-Regular', includeFontPadding: false, color: Colors.color000000 }}>{Utils.Grinder(User.city.filter((el) => el.city_no == this.state.city)[0]) + ', ' + Utils.Grinder(User.country.filter((el) => el.country_no == this.state.country)[0])}</Text>
                                        </View>
                                        <Text style={{ fontSize: 14, fontFamily: 'Raleway-Regular', includeFontPadding: false, color: Colors.color000000, marginTop: 12, marginBottom: 16 }}>{'Your experience link will be sent to you via e-mail after your reservation is created.'}</Text>
                                    </View>
                            ) : (
                                <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 12 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsMeteeingPoint')}</Text>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, marginTop: 12 }}>{this.state.addressDetail}</Text>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, marginTop: 12 }}>{this.state.address}</Text>
                                    <View style={{ height: 0.5, backgroundColor: Colors.colorE5E5E5, marginBottom: 16, marginTop: 16 }}></View>
                                    {/* Requirements */}
                                    <View style={{ marginBottom: 16, }}>
                                        <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsRequirements')}</Text>
                                        <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, marginTop: 12 }}>{this.state.criteria}</Text>
                                    </View>
                                </View>
                            ))}

                        <View style={{ height: 8, backgroundColor: Colors.colorF4F4F4, }}></View>

                        {/* About Buddy */}
                        <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 16 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsAboutBuddy')}</Text>
                            <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                                {this.state.buddyProfile.length == 0 ? <Image style={{ width: 28, height: 28, resizeMode: 'cover', borderRadius: 20, }} resizeMethod="resize" source={imgAccount}></Image> : (
                                    <FastImage style={{ width: 28, height: 28, resizeMode: 'cover', borderRadius: 14 }} source={{ uri: ServerUrl.Server + this.state.buddyProfile, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                )}
                                <Text style={{ fontSize: 15, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, marginLeft: 8 }}>{this.state.createrInfo.nickname}</Text>
                            </View>

                            <Text style={{ marginTop: 12, marginBottom: 16, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }} numberOfLines={(this.state.experienceBuddyTextFlag == false ? 8 : Number.MAX_VALUE)} ellipsizeMode="tail" onTextLayout={(event) => this._BuddyTextLine(event)}>{this.state.createrInfo.description}</Text>

                            {(this.state.experienceBuddyTextLength >= 8 && this.state.experienceBuddyTextFlag == false) && (
                                <TouchableOpacity onPress={() => this.setState({ experienceBuddyTextFlag: true })}>
                                    <View style={{}}>
                                        <Text style={{ textDecorationLine: 'underline', fontSize: 14, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsReadMore')}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Review */}
                        <View style={{ marginTop: 25, paddingTop: 16, paddingBottom: 16, backgroundColor: Colors.colorF1F8FF }}>
                            <View style={{ flexDirection: 'row', paddingLeft: 16, paddingRight: 16, alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsReview')}</Text>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color046BCC, marginLeft: 4 }}>{"(" + this.state.totalCnt + ")"}</Text>
                                </View>
                                {this.state.reviewDatas.length > 0 && <TouchableOpacity onPress={() => this.props.navigation.navigate('ReviewList', { exNo: this.state.exNo, })}>
                                    <Text style={{ textDecorationLine: 'underline', fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsShowAll2')}</Text>
                                </TouchableOpacity>}
                            </View>

                            <ScrollView horizontal={true} style={{}} showsHorizontalScrollIndicator={false}>
                                {this.state.reviewDatas.map((item, index) => (
                                    <View style={{ marginTop: 16, marginLeft: 16, width: 280, }}>
                                        <View style={{ borderRadius: 8, borderWidth: 1, borderColor: Colors.colorB7B9B8, backgroundColor: Colors.colorFFFFFF, padding: 16, }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {item.profilePath.length == 0 ? <Image source={imgAccount} style={{ width: 52, height: 52, resizeMode: 'cover', borderRadius: 26 }}></Image> : (
                                                    <FastImage style={{ width: 52, height: 52, resizeMode: 'cover', borderRadius: 26 }} source={{ uri: ServerUrl.Server + item.profilePath, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                )}
                                                <View style={{ justifyContent: 'center', flex: 1, marginLeft: 12 }}>
                                                    <Text style={{ fontSize: 14, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{item.userName}</Text>
                                                    <View style={{ marginTop: 5, flexDirection: 'row' }}>
                                                        {this._ReviewStar(item.starScore)}
                                                    </View>
                                                    <Text style={{ marginTop: 5, fontSize: 8, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{Moment(item.reviewDate).format('YYYY.MM.DD HH:mm')}</Text>
                                                </View>
                                            </View>

                                            <View style={{ height: 75, marginTop: 16 }}>
                                                <ReadMore numberOfLines={4} onSeeMoreBlocked={() => this.props.navigation.navigate('ReviewList', { exNo: this.state.exNo, position: index })} seeMoreText={I18n.t('goodsReadMore')} seeMoreStyle={{ textDecorationLine: 'underline', fontSize: 12, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, marginTop: 4, backgroundColor: Colors.colorFFFFFF }}>{item.contents}</ReadMore>
                                            </View>

                                            {item.pictureUrl.length > 0 && (
                                                <View style={{ width: '100%' }}>
                                                    <View style={{ marginTop: 16, height: 176, width: '100%', }}>
                                                        {item.pictureUrl.length <= 3 ? (
                                                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                                                <View style={{ flex: 1 }}>
                                                                    <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl[0], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                </View>

                                                                {item.pictureUrl.length > 1 && (
                                                                    <View style={{ flex: 1, marginLeft: 6 }}>
                                                                        <View style={{ flex: 1 }}>
                                                                            <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl[1], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                        </View>

                                                                        {item.pictureUrl.length > 2 && (
                                                                            <View style={{ flex: 1, marginTop: 6 }}>
                                                                                <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl[2], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                )}
                                                            </View>
                                                        ) : (
                                                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                                                <View style={{ flex: 1, }}>
                                                                    <View style={{ flex: 1 }}>
                                                                        <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl[0], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                    </View>

                                                                    <View style={{ flex: 1 }}>
                                                                        <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, marginTop: 6 }} source={{ uri: ServerUrl.Server + item.pictureUrl[1], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                    </View>
                                                                </View>

                                                                <View style={{ flex: 1, marginLeft: 6 }}>
                                                                    <View style={{ flex: 1 }}>
                                                                        <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl[2], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                    </View>

                                                                    <View style={{ flex: 1 }}>
                                                                        <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, marginTop: 6 }} source={{ uri: ServerUrl.Server + item.pictureUrl[3], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        )}

                                                    </View>
                                                </View>
                                            )}
                                        </View>

                                    </View>
                                ))}

                                {this.state.reviewDatas.length > 0}{
                                    <View style={{ width: 20 }}></View>
                                }
                            </ScrollView>
                        </View>

                        {/* Similar */}
                        <View style={{ marginTop: 20, paddingLeft: 16, paddingRight: 16 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsSimilar')}</Text>
                            <ScrollView horizontal={true} style={{ marginTop: 12 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.similarDatas.map((item, index) => (
                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.push('GoodsDetail', { exNo: item.ex_no })}>
                                            <View style={{ width: 160, borderRadius: 4, marginLeft: index == 0 ? 0 : 8, }}>
                                                <FastImage style={{ width: '100%', height: 160 * 1.3937, borderRadius: 4 }} source={{ uri: item.representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(1, item.ex_no)}>
                                                    <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Image source={User.placeSaved.includes(item.ex_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                                    </ImageBackground>
                                                </TouchableOpacity>

                                                <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, }} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>

                                                <View style={{ width: '55%', flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                                                    {this._MakeStar(item.rate, item.reviewCnt)}
                                                    <View style={{ width: '100%', }}>
                                                        <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{"・" + item.currency + Utils.numberWithCommas(item.price)}</Text>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{Utils.Grinder(item.category[0]) + "・" + item.town}</Text>
                                                </View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        <View style={{ marginTop: 20, height: 8, width: '100%', backgroundColor: Colors.colorF4F4F4 }}></View>

                        <View style={{ marginTop: 16, paddingLeft: 16, paddingRight: 16 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsRecommended')}</Text>
                            <View style={{ marginTop: 15, backgroundColor: Colors.colorF4F4F4, borderRadius: 4, paddingTop: 3, paddingBottom: 3, paddingLeft: 4, paddingRight: 4, height: 46, flexDirection: 'row' }}>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ recommendedFalg: 0 })}>
                                    <View style={{ flex: 1, backgroundColor: (this.state.recommendedFalg == 0 ? Colors.colorFFFFFF : Colors.colorF4F4F4), alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 15, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: (this.state.recommendedFalg == 0 ? Colors.color000000 : Colors.color5B5B5B) }}>{I18n.t('goodsPlaceText')}</Text>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ width: 14 }}></View>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ recommendedFalg: 1 })}>
                                    <View style={{ flex: 1, backgroundColor: (this.state.recommendedFalg == 1 ? Colors.colorFFFFFF : Colors.colorF4F4F4), alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 15, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: (this.state.recommendedFalg == 1 ? Colors.color000000 : Colors.color5B5B5B) }}>{I18n.t('goodsExperienceText')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {this.state.recommendedFalg == 1 && this._MakeSpecialExperienceChild()}
                            {this.state.recommendedFalg == 0 && this._MakeSpecialPlaceChild()}
                        </View>

                        <View style={{ height: 20 }}></View>
                    </ScrollView>

                    <View style={{ position: 'absolute', top: 0, width: '100%' }}>
                        <View style={{ width: '100%', alignItems: 'center', paddingLeft: 16, paddingRight: 16, flexDirection: 'row' }} >
                            <TouchableOpacity onPress={() => this.props.navigation.goBack()} onLayout={(nativeEvent) => this.test(nativeEvent)} style={{ marginTop: 30 }}>
                                <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 14 }} >
                                    <Image source={imgBack} style={{ width: 12, height: 12, resizeMode: 'contain' }} ></Image>
                                </View>
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}></View>
                            <TouchableOpacity onPress={() => this._Bookmark(1, this.state.exNo)}>
                                <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 14, }}>
                                    <Image source={User.exSaved.includes(this.state.exNo) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.color000000 }}></Image>
                                </View>
                            </TouchableOpacity>
                            {/* <TouchableOpacity style={{ width: 28, height: 28, marginLeft: 10 }} onPress={() => this.setState({ sharedDialogVisible: true })}>
                                <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 14 }}>
                                    <Image source={imgShared} style={{ width: 16, height: 14, resizeMode: 'contain', marginLeft: -2 }}></Image>
                                </View>
                            </TouchableOpacity> */}
                        </View>
                    </View>

                    <View style={{
                        width: '100%', shadowOpacity: 1, height: 65, backgroundColor: '#fff', shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        elevation: 10,
                    }}>
                        <View style={{ paddingLeft: 16, paddingRight: 16 }}>
                            <View style={{ marginTop: 8, flexDirection: 'row', height: 48 }}>
                                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 18, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{this.state.currency + ' ' + Utils.numberWithCommas(this.state.price)}</Text>
                                    <Text style={{ fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{' / ' + I18n.t('goodsPerson')}</Text>
                                </View>
                                <View style={{ flex: 1 }}></View>
                                <TouchableOpacity style={{}} onPress={() => this.props.navigation.navigate('Reserve', { exNo: this.state.exNo })}>
                                    {/* <TouchableOpacity style={{}} onPress={() => Linking.openURL(`${'https://www.budify.io/Experiences/'}` + this.props.route.params.exNo)}> */}
                                    <View style={{ backgroundColor: Colors.color289FAF, borderRadius: 4, alignItems: 'center', justifyContent: 'center', height: 48, paddingLeft: 27, paddingRight: 27 }}>
                                        <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('goodsReserve')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView >
        )
    }
}