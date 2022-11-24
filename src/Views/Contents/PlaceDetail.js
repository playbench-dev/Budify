import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, TouchableOpacity, Animated, Linking, Share } from 'react-native'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import * as Utils from '../../Common/Utils'
import PageList from 'react-native-page-list'
import ImageViewer from 'react-native-image-zoom-viewer';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Toast from 'react-native-toast-message';
import ReadMore from '@fawazahmed/react-native-read-more';
import FastImage from 'react-native-fast-image'
import PagerView from 'react-native-pager-view';
import ScrollIndicator from "react-native-custom-scroll-indicator";
import * as NetworkCall from '../../Common/NetworkCall'
import ServerUrl from '../../Common/ServerUrl'
import Carousel from 'react-native-snap-carousel'
import User from '../../Common/User';
import FetchingIndicator from 'react-native-fetching-indicator'
import Moment from 'moment'
import Clipboard from '@react-native-clipboard/clipboard';
import { firebase } from '@react-native-firebase/dynamic-links';
import KakaoShareLink from 'react-native-kakao-share-link';
import ShareLib from 'react-native-share'

const TAG = "PlaceDetail"
const imgBack = require('../../../assets/ic_back.png');
const imgShared = require('../../../assets/ic_shared.png');
const imgBookmark = require('../../../assets/ic_bookmark.png');
const imgBookmarkBlack = require('../../../assets/ic_bookmark_black.png');
const imgStarOn = require('../../../assets/ic_star.png');
const imgStarOff = require('../../../assets/ic_star_off.png');
const imgCircleSaveBg = require('../../../assets/ic_circle_saved.png');
const imgLinkBg = require('../../../assets/ic_link_bg.png');
const imgInstargramBg = require('../../../assets/ic_link_instagram_bg.png');
const imgInstargram = require('../../../assets/ic_instagram.png');
const imgLinkKakao = require('../../../assets/ic_link_kakao.png');
const imgLinkMore = require('../../../assets/ic_link_more.png');
const imgLink = require('../../../assets/ic_link.png');
const imgWhatapp = require('../../../assets/ic_whatapp.png');
const imgLine = require('../../../assets/ic_line.png');
const imgAccount = require('../../../assets/account_circle.png')

const { width: screenWidth } = Dimensions.get('window');

export default class PlaceDetail extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        placeName: '',
        singleInfo: '',
        info: '',
        rate: 0,
        reviewCnt: 0,
        currency: '',
        price: 0,
        city: -1,
        country: -1,
        saved: 0,
        town: '',
        townNo: -1,
        representative_file_url: [],
        repPath: '',
        category: [],
        categoryRelated: [],
        pagerViewPosition: 0,
        experienceAboutTextLength: 0,
        experienceAboutTextFlag: false,
        experienceBuddyTextLength: 0,
        experienceBuddyTextFlag: false,
        // imagesUrl: [{ props: { source: imgRemove1 } }, { props: { source: imgRemove2 } }, { props: { source: imgRemove3 } }, { props: { source: imgRemove1 } }],
        placeTimeDatas: [],
        datas: [],
        imagesUrl: [],
        includedItems: [{ 'title': 'Food', 'contents': 'Free snacks' }, { 'title': 'Drinks', 'contents': 'Free coffee or traditional tea' }, { 'title': 'Equipment', 'contents': 'Equipment & Hand sanitiser i\'will provide ' }],
        bringItems: ['Water', 'Money'],
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
        selectPageIndex: 0,
        pageGap: 16,
        pageOffset: 8,
        pageWidthIndex: screenWidth - (16 + 8) * 2,
        pageWidth: screenWidth - (36 + 16) * 2,
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
        productDatas: [],
        isFetching: true,
        creatorName: '',
        totalCnt: 0,
    }

    componentDidMount() {
        this._ContentsTrandingPlace()
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
                                        <Image source={User.exSaved.includes(this.state.specialExperienceDatas[(i * 2)].ex_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF, resizeMode: 'contain' }}></Image>
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
                                        <Image source={User.exSaved.includes(this.state.specialExperienceDatas[(i * 2) + 1].ex_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF, resizeMode: 'contain' }}></Image>
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
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.push('PlaceDetail', { placeNo: this.state.specialPlaceDatas[(i * 2)].place_no })}>
                            <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 0, }}>
                                <FastImage style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, borderRadius: 4 }} source={{ uri: this.state.specialPlaceDatas[(i * 2)].representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(2, this.state.specialPlaceDatas[(i * 2)].place_no)}>
                                    <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={User.placeSaved.includes(this.state.specialPlaceDatas[(i * 2)].place_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF, resizeMode: 'contain' }}></Image>
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

                        {this.state.specialPlaceDatas.length != ((i * 2) + 1) && <TouchableWithoutFeedback onPress={() => this.props.navigation.push('PlaceDetail', { placeNo: this.state.specialPlaceDatas[(i * 2) + 1].place_no })}>
                            <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 14, }}>
                                <FastImage style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, borderRadius: 4 }} source={{ uri: this.state.specialPlaceDatas[(i * 2) + 1].representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(2, this.state.specialPlaceDatas[(i * 2) + 1].place_no)}>
                                    <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={User.placeSaved.includes(this.state.specialPlaceDatas[(i * 2) + 1].place_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF, resizeMode: 'contain' }}></Image>
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
        if (User.guest == true) {
            this.props.navigation.navigate('GuestLogin')
        } else {
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
        console.log(event.nativeEvent.lines.length)
        this.setState({
            experienceAboutTextLength: event.nativeEvent.lines.length
        })
    }

    _BuddyTextLine = event => {
        console.log(event.nativeEvent.lines.length)
        this.setState({
            experienceBuddyTextLength: event.nativeEvent.lines.length
        })
    }

    _ReviewTextLine = (event, index) => {
        console.log(event.nativeEvent.lines.length)
        if (index == 0) {
            this.setState({
                reviewContentsLineLength1: event.nativeEvent.lines.length
            })
        } else if (index == 1) {
            this.setState({
                reviewContentsLineLength2: event.nativeEvent.lines.length
            })
        } else if (index == 2) {
            this.setState({
                reviewContentsLineLength3: event.nativeEvent.lines.length
            })
        }
    }

    async DynamicLink(params, value, type) {
        console.log(ServerUrl.Server + this.state.repPath)
        const link = await firebase.dynamicLinks().buildShortLink({
            link: `https://www.budify.io/${params}/${value}`,
            // domainUriPrefix is created in your Firebase console

            // optional setup which updates Firebase analytics campaign
            // "banner". This also needs setting up before hand
            ios: {
                appStoreId: '1639221225',
                bundleId: 'org.ReactNativeBudify'
            },
            android: {
                packageName: 'com.reactnativebudify'
            },
            domainUriPrefix: 'https://reactnativebudify.page.link',
            social: {
                title: this.state.placeName,
                descriptionText: this.state.info,
                imageUrl: ServerUrl.Server + this.state.repPath
            }
        }).then((shortLink) => {
            console.log(shortLink)
            if (type == 1) {
                this.setState({ sharedDialogVisible: false, }, () => {
                    Toast.show({ text1: 'Copied.' });
                    Clipboard.setString(shortLink)
                })
            } else if (type == 2) {
                Linking.openURL('whatsapp://send?text=' + shortLink)
            } else if (type == 3) {
                this.setState({ sharedDialogVisible: false, }, () => this.props.navigation.navigate('InstagramShared', { link: shortLink, repPath: this.state.repPath, title: this.state.placeName, contents: this.state.info, category: Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == this.state.category[0])[0]), city: this.state.town }))
            } else if (type == 4) {
                KakaoShareLink.sendFeed({
                    content: {
                        title: this.state.placeName,
                        description: this.state.info,
                        imageHeight: 120,
                        imageUrl: ServerUrl.Server + this.state.repPath,
                        link: {
                            webUrl: `https://www.budify.io/${params}/${value}`,
                            mobileWebUrl: shortLink,
                        },
                    },
                    buttons: [
                        {
                            title: '앱에서 보기',
                            link: {
                                androidExecutionParams: [{ key: params, value: '' + value }],
                                iosExecutionParams: [{ key: params, value: '' + value }],
                            },
                        },
                    ],
                });
            } else if (type == 5) {
                Linking.openURL('http://line.me/R/msg/text/?' + shortLink)
            } else if (type == 6) {
                Share.share({
                    title: shortLink,
                    url: shortLink
                })
                // ShareLib.open({
                //     title: '',
                //     url: shortLink,
                //     message: '',
                //     subject: ''
                // })
            }
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
                                    <TouchableOpacity style={{}} onPress={() => this.DynamicLink('Place', this.props.route.params.placeNo, 1)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }} imageStyle={{ tintColor: Colors.color569BEF }}>
                                                <Image source={imgLink} style={{ width: 17, height: 9 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareCopyLink')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink('Place', this.props.route.params.placeNo, 2)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <Image style={{ width: 32, height: 32, resizeMode: 'contain' }} source={imgWhatapp}></Image>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnWhatsApp')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink('Place', this.props.route.params.placeNo, 3)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgInstargramBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image style={{ width: 20, height: 16, resizeMode: 'contain' }} source={imgInstargram}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnInstagram')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink('Place', this.props.route.params.placeNo, 4)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={imgLinkKakao} style={{ width: 20, height: 16 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnKakao')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink('Place', this.props.route.params.placeNo, 5)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <Image style={{ width: 32, height: 32, resizeMode: 'contain' }} source={imgLine}></Image>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnLine')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink('Place', this.props.route.params.placeNo, 6)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }} imageStyle={{ tintColor: Colors.colorD9D9D9 }}>
                                                <Image source={imgLinkMore} style={{ width: 13, height: 3 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareMore')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal >
        )
    }

    async _ContentsTrandingPlace() {
        const url = ServerUrl.SelectContentsPlace

        let formBody = {};
        formBody = JSON.stringify({
            "conditions": [
                {
                    "q": "=",
                    "f": "place_no",
                    "v": this.props.route.params.placeNo,
                }]
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log(json)
        for (let i = 0; i < json.length; i++) {
            if (json[0].image_urls != null) {
                console.log('TEST : ', JSON.parse(json[0].image_urls))
                for (let j = 0; j < JSON.parse(json[0].image_urls).length; j++) {
                    // FastImage.preload([{ uri: ServerUrl.Server + JSON.parse(json[0].image_urls)[j], headers: { Authorization: 'authToken' }, }])
                    this.state.imagesUrl.push(ServerUrl.Server + JSON.parse(json[0].image_urls)[j])
                }
            }
            const dateTimeList = json[0].operate_hours != undefined && JSON.parse(json[0].operate_hours)
            // const productList = json[0].product_list != undefined && JSON.parse(json[0].product_list)

            console.log('dateTimeList', dateTimeList)

            const moObj = {
                day: I18n.t('managerContentsInsertMon'),
                bTime: dateTimeList.mo.open,
                aTime: dateTimeList.mo.close,
            }
            this.state.placeTimeDatas.push(moObj)
            const tuObj = {
                day: I18n.t('managerContentsInsertTue'),
                bTime: dateTimeList.tu.open,
                aTime: dateTimeList.tu.close,
            }
            this.state.placeTimeDatas.push(tuObj)
            const weObj = {
                day: I18n.t('managerContentsInsertWed'),
                bTime: dateTimeList.we.open,
                aTime: dateTimeList.we.close,
            }
            this.state.placeTimeDatas.push(weObj)
            const thObj = {
                day: I18n.t('managerContentsInsertThu'),
                bTime: dateTimeList.th.open,
                aTime: dateTimeList.th.close,
            }
            this.state.placeTimeDatas.push(thObj)
            const frObj = {
                day: I18n.t('managerContentsInsertFri'),
                bTime: dateTimeList.fr.open,
                aTime: dateTimeList.fr.close,
            }
            this.state.placeTimeDatas.push(frObj)
            const saObj = {
                day: I18n.t('managerContentsInsertSat'),
                bTime: dateTimeList.sa.open,
                aTime: dateTimeList.sa.close,
            }
            this.state.placeTimeDatas.push(saObj)
            const suObj = {
                day: I18n.t('managerContentsInsertSun'),
                bTime: dateTimeList.su.open,
                aTime: dateTimeList.su.close,
            }
            //장소 가격정보
            // console.log('productList', JSON.parse(json[0].product_list))
            // console.log('type', json[0].product_list)
            if (json[0].product_list != null) {
                console.log('not null', json[0].product_list)
                for (let i = 0; i < JSON.parse(json[0].product_list).length; i++) {
                    console.log(JSON.parse(json[0].product_list)[i].no, JSON.parse(json[0].product_list)[i].ko)
                    if (this.state.lang == 'ko') {
                        const productObj = {
                            no: JSON.parse(json[0].product_list)[i].no,
                            language: this.state.lang,
                            name: JSON.parse(json[0].product_list)[i].ko.length == 0 ? JSON.parse(json[0].product_list)[i].name : JSON.parse(json[0].product_list)[i].ko,
                            currency: JSON.parse(json[0].product_list)[i].currency == "USD" ? "$" : JSON.parse(json[0].product_list)[i].currency == "KRW" ? "₩" : JSON.parse(json[0].product_list)[i].currency == "EUR" ? "€" : JSON.parse(json[0].product_list)[i].currency == "JPY" ? "¥" : JSON.parse(json[0].product_list)[i].currency,
                            price: JSON.parse(json[0].product_list)[i].price,
                        }
                        this.state.productDatas.push(productObj)
                    } else if (this.state.lang == 'ja') {
                        const productObj = {
                            no: JSON.parse(json[0].product_list)[i].no,
                            language: this.state.lang,
                            name: JSON.parse(json[0].product_list)[i].ja.length == 0 ? JSON.parse(json[0].product_list)[i].name : JSON.parse(json[0].product_list)[i].ja,
                            currency: JSON.parse(json[0].product_list)[i].currency == "USD" ? "$" : JSON.parse(json[0].product_list)[i].currency == "KRW" ? "₩" : JSON.parse(json[0].product_list)[i].currency == "EUR" ? "€" : JSON.parse(json[0].product_list)[i].currency == "JPY" ? "¥" : JSON.parse(json[0].product_list)[i].currency,
                            price: JSON.parse(json[0].product_list)[i].price,
                        }
                        this.state.productDatas.push(productObj)
                    } else {
                        const productObj = {
                            no: JSON.parse(json[0].product_list)[i].no,
                            language: this.state.lang,
                            name: JSON.parse(json[0].product_list)[i].en.length == 0 ? JSON.parse(json[0].product_list)[i].name : JSON.parse(json[0].product_list)[i].en,
                            currency: JSON.parse(json[0].product_list)[i].currency == "USD" ? "$" : JSON.parse(json[0].product_list)[i].currency == "KRW" ? "₩" : JSON.parse(json[0].product_list)[i].currency == "EUR" ? "€" : JSON.parse(json[0].product_list)[i].currency == "JPY" ? "¥" : JSON.parse(json[0].product_list)[i].currency,
                            price: JSON.parse(json[0].product_list)[i].price,
                        }
                        this.state.productDatas.push(productObj)
                    }
                }
            }
            this.state.placeTimeDatas.push(suObj)
            console.log('jj', json[i].title)
            this.state.placeName = Utils.GrinderContents(JSON.parse(json[i].place_name)).replace(/&#039;/gi, '\'').replace(/&quot;/gi, '\"')
            this.state.singleInfo = Utils.GrinderContents(JSON.parse(json[i].title)).replace(/&#039;/gi, '\'').replace(/&quot;/gi, '\"')
            this.state.info = Utils.GrinderContents(JSON.parse(json[i].content)).replace(/&#039;/gi, '\'').replace(/&quot;/gi, '\"')
            this.state.rate = json[i].rate
            this.state.reviewCnt = json[i].review_cnt
            // currency: json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency,
            this.state.price = json[i].price
            this.state.city = json[i].city
            this.state.country = json[i].country
            this.state.saved = 0
            this.state.town = Utils.Grinder(User.region.filter((el) => el.town_no == json[i].town)[0])
            this.state.townNo = json[i].town
            this.state.place_no = json[i].place_no
            this.state.representative_file_url = ServerUrl.Server + JSON.parse(json[i].image_representative)
            this.state.repPath = JSON.parse(json[i].image_representative)
            this.state.category = JSON.parse(json[i].categories.replace(/'/gi, ''))
            this.state.categoryRelated = json[i].categories
            this.state.creatorImage = ServerUrl.Server + JSON.parse(json[i].image_creator)
            this.state.creatorName = json[i].creator_name
            this.state.creatorProfileLink = json[i].creator_url
            this.state.lat = json[i].lat
            this.state.lng = json[i].lng
            this.state.address = json[i].address
            this.state.addressDetail = json[i].address_detail
            this.state.placeTel = json[i].tel
            this.state.placeWeb = json[i].web
        }
        console.log('bbbb')
        this._ReviewSelect(0)
    }

    async _ReviewSelect(value) {
        const url = ServerUrl.SelectPlaceReview
        let formBody = JSON.stringify({
            "conditions": [
                {
                    "q": "=",
                    "f": "place_no",
                    "v": this.props.route.params.placeNo
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
                    reviewDate: Moment(json.reviewInfo[i].e_dt).format('YYYY.MM.DD HH:mm')
                }
                this.state.reviewDatas.push(obj)
                console.log(this.state.reviewDatas[i].pictureUrl.length)
            }
            this.state.totalCnt = json.total;
            // console.log(this.state.pictureUrl.length)

            if (value == 0) {
                this._SimilarPlace()
            } else {
                this.setState({
                    isFetching: false,
                })
            }
        } else {
            if (value == 0) {
                this._SimilarPlace()
            } else {
                this.setState({
                    isFetching: false,
                })
            }
        }
    }

    async _SimilarPlace() {
        let test = [];
        this.state.category.map((item) => test.push(parseInt(item)))
        // console.log(test)

        let formBodyPlace = JSON.stringify({
            "place_no": this.props.route.params.placeNo,
            "town": this.state.townNo,
            "city": this.state.city,
            "categoryList": JSON.stringify(test),
        })
        // console.log(formBodyPlace)
        const jsonPlace = await NetworkCall.Select(ServerUrl.SearchSimilarPlace, formBodyPlace)
        // console.log(jsonPlace)

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
                this.state.similarDatas.push(obj)
            }
        }
        this._RecommendPlaceExperience()
    }

    async _RecommendPlaceExperience() {
        // console.log('abababababab')
        let formBodyExperience = JSON.stringify({
            "conditions": [
                { "op": "AND", "q": "order", "f": "distance", "o": "ASC" },
                // { "q": "!=", "f": "ex_no", "v": this.state.exNo },
                // {"q":"having","f":"distance","opt":"<= 5"},
                { "op": "AND", "q": "=", "f": "status", "v": 1 },
                { "op": "AND", "q": "page", "limit": 6, "offset": 0 }
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
                { "op": "AND", "q": "order", "f": "distance", "o": "ASC" },
                { "op": "AND", "q": "!=", "f": "place_no", "v": this.props.route.params.placeNo },
                // {"q":"having","f":"distance","opt":"<= 5"},
                { "op": "AND", "q": "=", "f": "status", "v": 1 },
                { "op": "AND", "q": "page", "limit": 6, "offset": 0 }
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

    onScroll = (e) => {
        const newPage = Math.round(
            e.nativeEvent.contentOffset.x / (this.state.selectPageIndex == 0 ? this.state.pageWidth - (this.state.pageGap + this.state.pageOffset) : this.state.selectPageIndex == 1 ? this.state.pageWidth + (this.state.pageGap - 18) : this.state.pageWidth + (this.state.pageGap - 8)),
        );
        console.log(newPage)
        this.setState({
            selectPageIndex: newPage
        })
    }

    _OpenGps = (lat, lng) => {
        // var scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
        // var url = scheme + `${lat},${lng}`;
        // Linking.openURL(url);

        const url = Platform.select({
            ios: `maps:0,0?q=${this.state.address + this.state.addressDetail}`,
            android: `geo:0,0?q=${this.state.address + this.state.addressDetail}`,
        })

        Linking.openURL(url)
    }

    _carouselItem = ({ item, index }) => {
        console.log('!!!!' + item)
        return (
            <View style={{ width: this.state.pageWidth, height: (screenWidth - 90) / 0.8, marginLeft: index == 0 ? 0 : 16, paddingLeft: index == 0 ? 0 : 0 }}>
                {/* <FastImage style={{ width: '100%', height: '100%', }} source={{ uri: item, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage> */}
                <Image style={{ width: '100%', height: '100%', resizeMode: 'cover', }} source={{ uri: item }}></Image>
            </View>
        )
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
            if (flag == 1) {
                Toast.show({ text1: I18n.t('savedToast') });
                User.exSaved.push(no)
            } else {
                Toast.show({ text1: I18n.t('savedContentsToast') });
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

    parentFunction = value => {
        this.setState({ isFetching: true, reviewDatas: [] }, () => this._ReviewSelect(1))
    }

    render() {
        console.log(User.guest)
        return (
            <SafeAreaView>
                <View style={{ backgroundColor: Colors.colorFFFFFF, width: '100%', height: '100%' }}>
                    {this._SharedDialog()}
                    <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', height: 50, paddingLeft: 16, paddingRight: 16 }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <View style={{ flex: 1 }}></View>
                        <TouchableOpacity onPress={() => this._Bookmark(2, this.props.route.params.placeNo)}>
                            <Image source={User.placeSaved.includes(this.props.route.params.placeNo) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 14, height: 18, tintColor: Colors.color000000, resizeMode: 'contain' }}></Image>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: 24, height: 24, marginLeft: 14 }} onPress={() => this.setState({ sharedDialogVisible: true })} >
                            <Image source={imgShared} style={{ width: 19, height: 16, resizeMode: 'contain', marginTop: 5, }}></Image>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ backgroundColor: Colors.colorFFFFFF }}>
                        <View style={{ paddingLeft: 16, marginTop: 16, paddingRight: 19 }}>
                            <Text style={{ fontSize: 20, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{this.state.placeName}</Text>

                            <View style={{ marginTop: 12, flexDirection: 'row' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Regular', includeFontPadding: false, color: Colors.color000000, }}>{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == this.state.category[0])[0]) + "・" + this.state.town}</Text>

                                    <View style={{ width: '100%', flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
                                        {this._MakeStar(this.state.rate, this.state.reviewCnt)}
                                        <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} >{"・" + this.state.saved + ' saved'}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity onPress={() => User.guest == true ? this.props.navigation.navigate('GuestLogin') : this.props.navigation.navigate('ContentReviewInsert', { placeNo: this.props.route.params.placeNo, repPath: this.state.representative_file_url, title: this.state.placeName, contents: this.state.singleInfo, parentFunction: this.parentFunction })} >
                                    <View style={{ paddingTop: 5, paddingBottom: 6, paddingLeft: 18, paddingRight: 17, backgroundColor: Colors.color2D7DC8, borderRadius: 100, opacity: 1 }}>
                                        <Text style={{ fontSize: 14, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('placeDetailReviewInsert')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ paddingLeft: 0 }}>
                            {this.state.imagesUrl.length > 1 ? (
                                <ScrollIndicator
                                    viewBoxStyle={{
                                        marginTop: 16,
                                        alignItems: 'center'
                                    }}
                                    indicatorBackgroundStyle={{
                                        height: 4,
                                        width: screenWidth - 32 - (screenWidth - 32) / this.state.imagesUrl.length,
                                        borderRadius: 5,
                                        backgroundColor: Colors.colorF3F3F3,
                                    }} indicatorStyle={{
                                        height: 4,
                                        width: (screenWidth - 32) / this.state.imagesUrl.length,
                                        borderRadius: 4,
                                        backgroundColor: '#232223'
                                    }} indicatorBoxStyle={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        marginLeft: 2
                                    }} scrollViewBoxStyle={{
                                        width: screenWidth,
                                    }}>
                                    {this.state.imagesUrl.map((item, index) => (
                                        <View key={index} style={{ width: screenWidth - 90, height: (screenWidth - 90) / 0.8, marginLeft: index == 0 ? 0 : 24 }}>
                                            {/* <Image style={{ width: '100%', height: '100%', resizeMode: 'cover', }} source={{ uri: item }}></Image> */}
                                            <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', }} source={{ uri: item, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                        </View>
                                    ))}
                                </ScrollIndicator>
                            ) : (
                                <View style={{ width: screenWidth, height: (screenWidth - 90) / 0.8, marginBottom: 16, marginTop: 16 }}>
                                    <Image style={{ width: '100%', height: '100%', resizeMode: 'cover', }} source={{ uri: this.state.imagesUrl[0] }}></Image>
                                    <View style={{ marginTop: 12, marginLeft: 16, marginRight: 16, borderRadius: 4, height: 4, backgroundColor: Colors.color000000 }}></View>
                                </View>
                            )}

                        </View>

                        <View style={{ marginTop: 15, backgroundColor: Colors.colorF4F4F4, height: 8 }}></View>

                        <View style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 16 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{this.state.singleInfo}</Text>
                            <Text style={{ marginTop: 8, marginBottom: 16, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }} numberOfLines={(Number.MAX_VALUE)} ellipsizeMode="tail" onTextLayout={(event) => this._AboutTextLine(event)}>{this.state.info}</Text>

                            <View style={{ marginTop: 16, backgroundColor: Colors.colorE5E5E5, height: 1, width: '100%' }}></View>

                            <View style={{ flexDirection: 'row', marginTop: 16, }}>
                                <Image style={{ width: 56, height: 56, resizeMode: 'cover', borderRadius: 28, }} resizeMethod="resize" source={{ uri: this.state.creatorImage }}></Image>
                                <View style={{ marginLeft: 16 }}>
                                    <Text style={{ fontSize: 15, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{this._TranslateEnToKo(this.state.creatorName, I18n.t('placeDetailProvided'))}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity style={{ marginTop: 8 }} onPress={() => Linking.openURL(this.state.creatorProfileLink.includes('https://') ? this.state.creatorProfileLink : 'https://' + this.state.creatorProfileLink)}>
                                            <View style={{ paddingTop: 7, paddingBottom: 7, paddingLeft: 15, paddingRight: 14, borderColor: Colors.color2D7DC8, borderRadius: 100, borderWidth: 1 }}>
                                                <Text style={{ fontSize: 14, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color2D7DC8 }}>{I18n.t('placeDetailProfile')}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <View style={{ flex: 1 }}></View>
                                    </View>
                                </View>
                            </View>

                        </View>

                        <View style={{ marginTop: 15, backgroundColor: Colors.colorF4F4F4, height: 8 }}></View>

                        {/* Google Map */}
                        <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 16 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('placeDetailInfo')}</Text>
                        </View>
                        <View style={{ width: '100%', height: 240, marginTop: 12 }}>
                            {this.state.lat != null && (
                                <MapView
                                    style={{
                                        flex: 1,
                                        width: this.state.mapWidth,
                                        height: '100%',
                                    }}
                                    provider={PROVIDER_GOOGLE}
                                    initialRegion={{
                                        latitude: this.state.lat,
                                        longitude: this.state.lng,
                                        latitudeDelta: 0.00222,
                                        longitudeDelta: 0.00121,
                                    }}

                                    toolbarEnabled={false}
                                >
                                    <Marker
                                        coordinate={{ latitude: this.state.lat, longitude: this.state.lng }}
                                        title="this is a marker"
                                        description="this is a marker example"
                                    />
                                </MapView>
                            )}

                        </View>

                        <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 12, }}>
                            <View style={{ paddingLeft: 12, paddingTop: 8, paddingBottom: 8, paddingRight: 12, backgroundColor: Colors.colorF4F4F4, borderRadius: 4 }}>
                                <TouchableOpacity onPress={() => this._OpenGps(this.state.lat, this.state.lng)}>
                                    <View style={{ flexDirection: 'row', }}>
                                        <Text style={{ flex: 0.2, fontSize: 12, fontFamily: 'Raleway-Regular', includeFontPadding: false, color: Colors.color4D4A4A }}>{I18n.t('placeDetailAddress')}</Text>
                                        <Text style={{ flex: 0.8, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{this.state.address + ', ' + this.state.addressDetail}</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => Linking.openURL(`tel:${this.state.placeTel}`)}>
                                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                        <Text style={{ flex: 0.2, fontSize: 12, fontFamily: 'Raleway-Regular', includeFontPadding: false, color: Colors.color4D4A4A }}>{I18n.t('placeDetailTel')}</Text>
                                        <Text style={{ flex: 0.8, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{'+82 ' + this.state.placeTel}</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => Linking.openURL(this.state.placeWeb.includes('https://') ? this.state.placeWeb : 'https://' + this.state.placeWeb)}>
                                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                        <Text style={{ flex: 0.2, fontSize: 12, fontFamily: 'Raleway-Regular', includeFontPadding: false, color: Colors.color4D4A4A }}>{I18n.t('placeDetailWeb')}</Text>
                                        <Text style={{ flex: 0.8, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{this.state.placeWeb}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={{ height: 0.5, backgroundColor: Colors.colorE5E5E5, marginBottom: 16, marginTop: 16 }}></View>
                        </View>

                        {/* Hours */}
                        <View style={{ paddingLeft: 16, paddingRight: 16, marginBottom: 16, }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('placeDetailHours')}</Text>
                            {this.state.placeTimeDatas.map((item, index) => (
                                <View >
                                    {item.bTime.length > 0 && item.aTime.length > 0 && (
                                        <View style={{ flexDirection: 'row', marginTop: 12 }}>
                                            <Text style={{ flex: 0.2, fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorB7B7B7 }}>{item.day}</Text>
                                            <Text style={{ flex: 0.8, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.colorC4C4C4 }}>{item.bTime + ' - ' + item.aTime}</Text>
                                        </View>)}
                                </View>
                            ))}
                            <View style={{ height: 0.5, backgroundColor: Colors.colorE5E5E5, marginTop: 16 }}></View>
                        </View>

                        {/* PriceInfo */}

                        {this.state.productDatas.length > 0 && <View style={{ paddingLeft: 16, paddingRight: 16, }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('placeDetailPriceInfo')}</Text>
                            {this.state.productDatas.map((item, index) => (
                                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, flex: 1 }}>{item.name}</Text>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, flex: 1 }}>{item.currency + Utils.numberWithCommas(item.price)}</Text>
                                </View>
                            ))}

                        </View>}

                        {/* Review */}
                        <View style={{ marginTop: 25, paddingTop: 16, paddingBottom: 16, backgroundColor: Colors.colorF1F8FF }}>
                            <View style={{ flexDirection: 'row', paddingLeft: 16, paddingRight: 16, alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsReview')}</Text>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color046BCC, marginLeft: 4 }}>{"(" + this.state.totalCnt + ")"}</Text>
                                </View>
                                {this.state.reviewDatas.length > 0 && <TouchableOpacity onPress={() => this.props.navigation.navigate('ContentReviewList', { placeNo: this.props.route.params.placeNo })}>
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
                                                    <Text style={{ marginTop: 5, fontSize: 8, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{item.reviewDate}</Text>
                                                </View>
                                            </View>

                                            <View style={{ height: 60, marginTop: 16 }}>
                                                <ReadMore numberOfLines={3} onPress={() => console.log('abcd')} onSeeMoreBlocked={() => this.props.navigation.navigate('ReviewList')} seeMoreText={I18n.t('goodsReadMore')} seeMoreStyle={{ textDecorationLine: 'underline', fontSize: 12, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, marginTop: 4 }}>{item.contents}</ReadMore>
                                            </View>


                                            {item.pictureUrl.length > 0 && (
                                                <View style={{ width: '100%' }}>
                                                    <View style={{ marginTop: 16, height: 176, width: '100%', }}>
                                                        {item.pictureUrl.length <= 3 ? (
                                                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                                                <View style={{ flex: 1 }}>
                                                                    <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: ServerUrl.Server + item.pictureUrl[0], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                </View>

                                                                {item.pictureUrl.length > 1 && (
                                                                    <View style={{ flex: 1, marginLeft: 6 }}>
                                                                        <View style={{ flex: 1 }}>
                                                                            <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: ServerUrl.Server + item.pictureUrl[1], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                        </View>

                                                                        {item.pictureUrl.length > 2 && (
                                                                            <View style={{ flex: 1, marginTop: 6 }}>
                                                                                <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: ServerUrl.Server + item.pictureUrl[2], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                )}
                                                            </View>
                                                        ) : (
                                                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                                                <View style={{ flex: 1, }}>
                                                                    <View style={{ flex: 1 }}>
                                                                        <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: ServerUrl.Server + item.pictureUrl[0], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                    </View>

                                                                    <View style={{ flex: 1 }}>
                                                                        <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, marginTop: 6 }} source={{ uri: ServerUrl.Server + item.pictureUrl[1], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                    </View>
                                                                </View>

                                                                <View style={{ flex: 1, marginLeft: 6 }}>
                                                                    <View style={{ flex: 1 }}>
                                                                        <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: ServerUrl.Server + item.pictureUrl[2], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
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
                        {this.state.similarDatas.length > 0 && (
                            <View style={{ marginTop: 20, paddingLeft: 16, paddingRight: 16 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('placeDetailRelated')}</Text>
                                <ScrollView horizontal={true} style={{ marginTop: 12 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {this.state.similarDatas.map((item, index) => (
                                            <TouchableWithoutFeedback onPress={() => this.props.navigation.push('PlaceDetail', { placeNo: item.place_no })}>
                                                <View key={index} style={{ width: 160, borderRadius: 4, marginLeft: (index == 0 ? 0 : 12), }}>
                                                    <View>
                                                        <FastImage style={{ width: '100%', height: 160 * 1.3937, borderRadius: 4 }} source={{ uri: item.representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                        <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(2, item.place_no)}>
                                                            <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Image source={User.placeSaved.includes(item.place_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF, resizeMode: 'contain' }}></Image>
                                                            </ImageBackground>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, }} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>

                                                    <View style={{ width: '55%', flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                                                        {this._MakeStar(item.starCnt, item.reviewCnt)}
                                                        <View style={{ width: '100%', }}>
                                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{"・" + item.saved + " saved"}</Text>
                                                        </View>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                                                        <Text style={{ fontSize: 10, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == item.category[0])[0]) + "・" + item.town}</Text>
                                                    </View>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}

                        <View style={{ marginTop: 20, height: 8, width: '100%', backgroundColor: Colors.colorF4F4F4 }}></View>

                        <View style={{ marginTop: 16, paddingLeft: 16, paddingRight: 16 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsRecommended')}</Text>
                            <View style={{ marginTop: 15, backgroundColor: Colors.colorF4F4F4, borderRadius: 4, paddingTop: 3, paddingBottom: 3, paddingLeft: 4, paddingRight: 4, height: 46, flexDirection: 'row' }}>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ recommendedFalg: 0 })}>
                                    <View style={{ flex: 1, backgroundColor: (this.state.recommendedFalg == 0 ? Colors.colorFFFFFF : Colors.colorF4F4F4), alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 15, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: (this.state.recommendedFalg == 0 ? Colors.color000000 : Colors.color5B5B5B) }}>{I18n.t('contents')}</Text>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ width: 14 }}></View>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ recommendedFalg: 1 })}>
                                    <View style={{ flex: 1, backgroundColor: (this.state.recommendedFalg == 1 ? Colors.colorFFFFFF : Colors.colorF4F4F4), alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 15, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: (this.state.recommendedFalg == 1 ? Colors.color000000 : Colors.color5B5B5B) }}>{I18n.t('experiences')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {this.state.recommendedFalg == 1 && this._MakeSpecialExperienceChild()}
                            {this.state.recommendedFalg == 0 && this._MakeSpecialPlaceChild()}
                        </View>

                        <View style={{ height: 20 }}></View>
                    </ScrollView>

                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView >
        )
    }
}