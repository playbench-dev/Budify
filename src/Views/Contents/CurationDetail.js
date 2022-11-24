import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, TouchableOpacity, Animated, Linking, Share } from 'react-native'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import * as NetworkCall from '../../Common/NetworkCall'
import * as Utils from '../../Common/Utils'
import User from '../../Common/User';
import FastImage from 'react-native-fast-image';
import ServerUrl from '../../Common/ServerUrl'
import Toast from 'react-native-toast-message';
import ScrollIndicator from "react-native-custom-scroll-indicator";
import Carousel from 'react-native-snap-carousel'
import Clipboard from '@react-native-clipboard/clipboard';
import { firebase } from '@react-native-firebase/dynamic-links';
import KakaoShareLink from 'react-native-kakao-share-link';
import ShareLib from 'react-native-share'
import FetchingIndicator from 'react-native-fetching-indicator'

const TAG = "CurationDetail"
const imgBack = require('../../../assets/ic_back.png');
const imgShared = require('../../../assets/ic_shared.png');
const imgBookmark = require('../../../assets/ic_bookmark.png');
const imgBookmarkBlack = require('../../../assets/ic_bookmark_black.png');
const imgLocation = require('../../../assets/ic_location.png');
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
        this._carousel = React.createRef()
    }

    componentDidMount() {
        this._ContentsCuration()
    }

    state = {
        entries: [{ '': '' }, { '': '' }, { '': '' }],
        sharedDialogVisible: false,
        imagesUrl: [{ url: "https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FelNDZe%2FbtqNcF91238%2FjewKNblkVB4n798mGFLqzK%2Fimg.jpg" }, { url: "https://blog.kakaocdn.net/dn/bVQKdP/btqGgkxfDTy/bX20mCxhBG68oFlRWlpMgK/img.jpg" }, { url: "https://blog.kakaocdn.net/dn/bVQKdP/btqGgkxfDTy/bX20mCxhBG68oFlRWlpMgK/img.jpg" }, { url: "https://blog.kakaocdn.net/dn/bVQKdP/btqGgkxfDTy/bX20mCxhBG68oFlRWlpMgK/img.jpg" }],
        indicator: new Animated.Value(0),
        visibleHeight: 0,
        scrollIndicatorSize: 0,
        pageWidth: screenWidth - 100,
        selectCategoryList: [],
        isFetching: true,
        selectedCountryNo: -1,
        selectedCityNo: -1,
        selectedRegionNo: -1,
        selectedCountry: '',
        selectedCity: '',
        selectedRegion: '',
        coverDatas: [],
        selectDatas: [],
        positionDatas: [],
        title: '',
        introduce: '',
        category: '',
        repPath: '',
        sharedTitle: '',
        sharedTitle: '',
        sharedIntroduce: '',
        sharedRepPath: '',
        sharedCategory: '',
        sharedCity: '',
        sharedType: 'Curation',
        sharedNo: this.props.route.params.curationNo,
    }

    _carouselItem = ({ item, index }) => {
        console.log('!!!!' + item)
        return (
            <View style={{ width: this.state.pageWidth, height: (screenWidth - 90) / 0.8, marginLeft: index == 0 ? 16 : 16, paddingLeft: index == 0 ? 0 : 0 }}>
                {/* <FastImage style={{ width: '100%', height: '100%', }} source={{ uri: item, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage> */}
                <Image style={{ width: '100%', height: '100%', resizeMode: 'cover', }} source={{ uri: item }}></Image>
            </View>
        )
    }

    async _ContentsCuration() {
        const url = ServerUrl.SearchCurations

        let formBody = {};
        formBody = JSON.stringify({
            "conditions": [{
                "q": "=",
                "f": "curations_no",
                "v": this.props.route.params.curationNo
            }]
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log(json)
        const coverUrl = JSON.parse(json.list[0].curations_image_representative)
        const categoryToInt = [];
        JSON.parse(json.list[0].categories.replace((/'/gi), '')).map((item, index) => {
            categoryToInt.push(item)
        })
        for (let i = 0; i < JSON.parse(json.list[0].place_list).length; i++) {
            const obj = {
                no: i,
                position: 0,
            }
            this.state.positionDatas.push(obj)
        }
        this.setState({
            title: Utils.GrinderContents(JSON.parse(json.list[0].title)),
            introduce: Utils.GrinderContents(JSON.parse(json.list[0].introduce)),
            repPath: JSON.parse(json.list[0].curations_image_representative)[0],
            selectCategoryList: categoryToInt,
            category: Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == categoryToInt[0])[0]),
            isFetching: false,
            selectedCountryNo: json.list[0].country,
            selectedCityNo: json.list[0].city,
            selectedRegionNo: json.list[0].town,
            selectedCountry: json.list[0].country == -1 ? '' : Utils.Grinder(User.country.filter((el) => el.country_no == json.list[0].country)[0]),
            selectedCity: json.list[0].city == -1 ? '' : Utils.Grinder(User.city.filter((el) => el.city_no == json.list[0].city)[0]),
            selectedRegion: json.list[0].town == -1 ? '' : Utils.Grinder(User.region.filter((el) => el.town_no == json.list[0].town)[0]),
            coverDatas: coverUrl.map((item, index) => ({ uri: ServerUrl.Server + coverUrl[index] })),
            selectDatas: JSON.parse(json.list[0].place_list),
        })
        // console.log(this.state.selectCategoryList)
    }

    _PositionInsert = params => {
        console.log(params)
        this.setState({
            positionDatas: this.state.positionDatas.map(
                item => params.no === item.no
                    ? { no: item.no, position: item.position }
                    : item
            )
        })
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
                title: this.state.sharedTitle,
                descriptionText: this.state.sharedIntroduce,
                imageUrl: ServerUrl.Server + this.state.sharedRepPath
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
                this.setState({ sharedDialogVisible: false, }, () => this.props.navigation.navigate('InstagramShared', { link: shortLink, repPath: this.state.sharedRepPath, title: this.state.sharedTitle, contents: this.state.sharedIntroduce, category: this.state.sharedCategory, city: this.state.sharedCity }))
            } else if (type == 4) {
                KakaoShareLink.sendFeed({
                    content: {
                        title: this.state.sharedTitle,
                        description: this.state.sharedIntroduce,
                        imageHeight: 120,
                        imageUrl: ServerUrl.Server + this.state.sharedRepPath,
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
                //     title: shortLink,
                //     url: shortLink
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
                                    <TouchableOpacity style={{}} onPress={() => this.DynamicLink(this.state.sharedType, this.state.sharedNo, 1)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }} imageStyle={{ tintColor: Colors.color569BEF }}>
                                                <Image source={imgLink} style={{ width: 17, height: 9 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareCopyLink')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink(this.state.sharedType, this.state.sharedNo, 2)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <Image style={{ width: 32, height: 32, resizeMode: 'contain' }} source={imgWhatapp}></Image>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnWhatsApp')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink(this.state.sharedType, this.state.sharedNo, 3)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgInstargramBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image style={{ width: 20, height: 16, resizeMode: 'contain' }} source={imgInstargram}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnInstagram')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink(this.state.sharedType, this.state.sharedNo, 4)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={imgLinkKakao} style={{ width: 20, height: 16 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnKakao')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink(this.state.sharedType, this.state.sharedNo, 5)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <Image style={{ width: 32, height: 32, resizeMode: 'contain' }} source={imgLine}></Image>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnLine')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink(this.state.sharedType, this.state.sharedNo, 6)}>
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

    render() {
        console.log(this.state.selectDatas.length)
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
                        {/* <TouchableOpacity onPress={() => Toast.show({ text1: I18n.t('savedToast') })}>
                            <Image source={imgBookmark} style={{ width: 14, height: 18, resizeMode: 'contain', tintColor: Colors.color000000 }}></Image>
                        </TouchableOpacity> */}
                        <TouchableOpacity style={{ width: 24, height: 24, marginLeft: 14 }} onPress={() => this.setState({ sharedTitle: this.state.title, sharedIntroduce: this.state.introduce, sharedRepPath: this.state.repPath, sharedCategory: this.state.category, sharedCity: this.state.selectedRegion, sharedType: 'Curation', sharedNo: this.props.route.params.curationNo, sharedDialogVisible: true })}>
                            <Image source={imgShared} style={{ width: 19, height: 16, resizeMode: 'contain', marginTop: 5 }}></Image>
                        </TouchableOpacity>
                    </View>

                    <FlatList keyExtractor={(item, index) => index.toString()} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} data={this.state.selectDatas}
                        ListHeaderComponent={
                            <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 20 }}>
                                <Text style={{ fontSize: 20, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{this.state.title}</Text>
                                <View style={{ marginTop: 7, flexDirection: 'row' }}>
                                    <Image source={imgLocation} style={{ width: 11, height: 13, resizeMode: 'contain' }}></Image>
                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, marginLeft: 6 }}>{this.state.selectedRegion + "・" + this.state.selectedCountry}</Text>
                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, marginLeft: 8 }}>{this.state.category}</Text>
                                </View>
                            </View>}
                        ListFooterComponent={
                            <View style={{ height: 20 }}></View>
                        }
                        renderItem={(obj) => {
                            return (
                                <View style={{ width: '100%', marginTop: obj.index == 0 ? 23 : 45, }}>
                                    <View style={{ flexDirection: 'row', paddingRight: 12, paddingLeft: 16, }}>
                                        <Text style={{ flex: 1, fontSize: 20, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{Utils.GrinderContents(obj.item.place_name)}</Text>
                                        <TouchableOpacity onPress={() => this._Bookmark(2, obj.item.place_no)}>
                                            <Image source={User.placeSaved.includes(obj.item.place_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 14, height: 18, resizeMode: 'contain', tintColor: Colors.color000000 }}></Image>
                                        </TouchableOpacity>
                                        {console.log(obj.item.categories[0])}
                                        <TouchableOpacity style={{ width: 24, height: 24, marginLeft: 14, marginBottom: -5 }} onPress={() => this.setState({ sharedTitle: Utils.GrinderContents(obj.item.place_name), sharedIntroduce: Utils.GrinderContents(obj.item.info), sharedRepPath: obj.item.repPath, sharedCategory: Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == obj.item.categories[0])[0]), sharedCity: Utils.Grinder(User.region.filter((el) => el.town_no == obj.item.town)[0]), sharedType: 'Place', sharedNo: obj.item.place_no, sharedDialogVisible: true })}>
                                            <Image source={imgShared} style={{ width: 19, height: 16, resizeMode: 'contain', marginTop: 3 }}></Image>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ marginTop: 7, flexDirection: 'row', paddingLeft: 16, }}>
                                        <Image source={imgLocation} style={{ width: 11, height: 13, resizeMode: 'contain' }}></Image>
                                        <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, marginLeft: 6 }}>{Utils.Grinder(User.region.filter((el) => el.town_no == obj.item.town)[0]) + "・" + Utils.Grinder(User.country.filter((el) => el.country_no == obj.item.country)[0])}</Text>
                                        <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, marginLeft: 8 }}>{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == obj.item.categories[0])[0])}</Text>
                                    </View>

                                    <View style={{ paddingLeft: 0 }}>
                                        {obj.item.images_urls.length > 1 ? (
                                            <ScrollIndicator
                                                viewBoxStyle={{
                                                    marginTop: 16,
                                                    alignItems: 'center'
                                                }}
                                                indicatorBackgroundStyle={{
                                                    height: 4,
                                                    width: screenWidth - 32 - (screenWidth - 32) / obj.item.images_urls.length,
                                                    borderRadius: 5,
                                                    backgroundColor: Colors.colorF3F3F3,
                                                }} indicatorStyle={{
                                                    height: 4,
                                                    width: (screenWidth - 32) / obj.item.images_urls.length,
                                                    borderRadius: 4,
                                                    backgroundColor: '#232223'
                                                }} indicatorBoxStyle={{
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    marginLeft: 2
                                                }} scrollViewBoxStyle={{
                                                    width: screenWidth,
                                                }}>
                                                {obj.item.images_urls.map((item, index) => (
                                                    <View key={index} style={{ width: screenWidth - 90, height: (screenWidth - 90) / 0.8, marginLeft: index == 0 ? 0 : 24 }}>
                                                        {/* <Image style={{ width: '100%', height: '100%', resizeMode: 'cover', }} source={{ uri: item }} resizeMethod="resize"></Image> */}
                                                        {<FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', }} source={{ uri: item, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>}
                                                    </View>
                                                ))}
                                            </ScrollIndicator>
                                        ) : (
                                            <View style={{ width: screenWidth, height: (screenWidth - 90) / 0.8, marginBottom: 16, marginTop: 16 }}>
                                                <Image style={{ width: '100%', height: '100%', resizeMode: 'cover', }} source={{ uri: obj.item.images_urls[0] }}></Image>
                                                <View style={{ marginTop: 12, marginLeft: 16, marginRight: 16, borderRadius: 4, height: 4, backgroundColor: Colors.color000000 }}></View>
                                            </View>
                                        )}

                                    </View>

                                    <View style={{ marginTop: 16, paddingRight: 16, paddingLeft: 16, }}>
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('PlaceDetail', { placeNo: obj.item.place_no })}>
                                            <View style={{ borderRadius: 4, borderWidth: 1, borderColor: Colors.color2D7DC8, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color2D7DC8 }}>More Info</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )
                        }}></FlatList>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView >
        )
    }
}