import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, TouchableOpacity, Animated } from 'react-native'
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

const TAG = "CurationDetail"
const imgBack = require('../../../assets/ic_back.png');
const imgShared = require('../../../assets/ic_shared.png');
const imgBookmark = require('../../../assets/ic_bookmark.png');
const imgLinkBg = require('../../../assets/ic_link_bg.png');
const imgInstargramBg = require('../../../assets/ic_link_instagram_bg.png');
const imgLinkKakao = require('../../../assets/ic_link_kakao.png');
const imgLinkMore = require('../../../assets/ic_link_more.png');
const imgLink = require('../../../assets/ic_link.png');
const imgLocation = require('../../../assets/ic_location.png');

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
        isFetching: false,
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

                                    <TouchableWithoutFeedback>
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

                                    <TouchableWithoutFeedback>
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
                        <TouchableOpacity onPress={() => Toast.show({ text1: I18n.t('savedToast') })}>
                            <Image source={imgBookmark} style={{ width: 14, height: 18, resizeMode: 'contain', tintColor: Colors.color000000 }}></Image>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: 24, height: 24, marginLeft: 14 }} onPress={() => this.setState({ sharedDialogVisible: true })}>
                            <Image source={imgShared} style={{ width: 19, height: 16, resizeMode: 'contain', marginTop: 5 }}></Image>
                        </TouchableOpacity>
                    </View>

                    <ScrollView >

                        <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 20 }}>
                            <Text style={{ fontSize: 20, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{this.state.title}</Text>
                            <View style={{ marginTop: 7, flexDirection: 'row' }}>
                                <Image source={imgLocation} style={{ width: 11, height: 13, resizeMode: 'contain' }}></Image>
                                <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, marginLeft: 6 }}>{this.state.selectedRegion + "・" + this.state.selectedCountry}</Text>
                                <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, marginLeft: 8 }}>{this.state.category}</Text>
                            </View>
                        </View>

                        {this.state.selectDatas.map((item, index) => (
                            <View style={{ width: '100%', marginTop: index == 0 ? 23 : 45, }}>
                                <View style={{ flexDirection: 'row', paddingRight: 12, paddingLeft: 16, }}>
                                    <Text style={{ flex: 1, fontSize: 20, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{Utils.GrinderContents(item.place_name)}</Text>
                                    <TouchableOpacity onPress={() => Toast.show({ text1: I18n.t('savedToast') })}>
                                        <Image source={imgBookmark} style={{ width: 14, height: 18, resizeMode: 'contain', tintColor: Colors.color000000 }}></Image>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ width: 24, height: 24, marginLeft: 14, marginBottom: -5 }} onPress={() => this.setState({ sharedDialogVisible: true })}>
                                        <Image source={imgShared} style={{ width: 19, height: 16, resizeMode: 'contain', marginTop: 3 }}></Image>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginTop: 7, flexDirection: 'row', paddingLeft: 16, }}>
                                    <Image source={imgLocation} style={{ width: 11, height: 13, resizeMode: 'contain' }}></Image>
                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, marginLeft: 6 }}>{Utils.Grinder(User.region.filter((el) => el.town_no == item.town)[0]) + "・" + Utils.Grinder(User.country.filter((el) => el.country_no == item.country)[0])}</Text>
                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, marginLeft: 8 }}>{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == item.categories[0])[0])}</Text>
                                </View>

                                <View style={{ paddingLeft: 0 }}>
                                    {item.images_urls.length > 1 ? (
                                        <ScrollIndicator
                                            viewBoxStyle={{
                                                marginTop: 16,
                                                alignItems: 'center'
                                            }}
                                            indicatorBackgroundStyle={{
                                                height: 4,
                                                width: screenWidth - 32 - (screenWidth - 32) / item.images_urls.length,
                                                borderRadius: 5,
                                                backgroundColor: Colors.colorF3F3F3,
                                            }} indicatorStyle={{
                                                height: 4,
                                                width: (screenWidth - 32) / item.images_urls.length,
                                                borderRadius: 4,
                                                backgroundColor: '#232223'
                                            }} indicatorBoxStyle={{
                                                justifyContent: "center",
                                                alignItems: "center",
                                                marginLeft: 2
                                            }} scrollViewBoxStyle={{
                                                width: screenWidth,
                                            }}>
                                            {item.images_urls.map((item, index) => (
                                                <View key={index} style={{ width: screenWidth - 90, height: (screenWidth - 90) / 0.8, marginLeft: index == 0 ? 0 : 24 }}>
                                                    {/* <Image style={{ width: '100%', height: '100%', resizeMode: 'cover', }} source={{ uri: item }}></Image> */}
                                                    <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', }} source={{ uri: item, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                </View>
                                            ))}
                                        </ScrollIndicator>
                                    ) : (
                                        <View key={index} style={{ width: screenWidth, height: (screenWidth - 90) / 0.8, marginBottom: 16, marginTop: 16 }}>
                                            <Image style={{ width: '100%', height: '100%', resizeMode: 'cover', }} source={{ uri: item.images_urls[0] }}></Image>
                                            <View style={{ marginTop: 12, marginLeft: 16, marginRight: 16, borderRadius: 4, height: 4, backgroundColor: Colors.color000000 }}></View>
                                        </View>
                                    )}

                                </View>

                                <View style={{ marginTop: 16, paddingRight: 16, paddingLeft: 16, }}>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('PlaceDetail', { placeNo: item.place_no })}>
                                        <View style={{ borderRadius: 4, borderWidth: 1, borderColor: Colors.color2D7DC8, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color2D7DC8 }}>More Info</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        <View style={{ height: 30 }}></View>
                    </ScrollView>



                </View>
            </SafeAreaView >
        )
    }
}