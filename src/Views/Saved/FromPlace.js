import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, FlatList, ImageBackground, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';
import * as Utils from '../../Common/Utils'
import User from '../../Common/User'
import ServerUrl from '../../Common/ServerUrl';
import FetchingIndicator from 'react-native-fetching-indicator'
import * as NetworkCall from '../../Common/NetworkCall'
import FastImage from 'react-native-fast-image';
import SelectDialog from '../../Common/SelectDialog'

const TAG = "FromPlace"
const imgBack = require('../../../assets/ic_back.png');
const imgSearch = require('../../../assets/ic_search.png');
const imgRegionBg = require('../../../assets/img_region_bg.png');
const imgCircleSaveBg = require('../../../assets/ic_circle_saved.png');
const imgBookmark = require('../../../assets/ic_bookmark.png');
const imgBookmarkBlack = require('../../../assets/ic_bookmark_black.png');
const imgStarOn = require('../../../assets/ic_star.png');
const imgStarOff = require('../../../assets/ic_star_off.png');
const imgCategory = require('../../../assets/img_saved_category.png')
const imgAdd = require('../../../assets/add.png');

const { width: screenWidth } = Dimensions.get('window');

export default class FromPlace extends React.Component {
    constructor(props) {
        super(props)
        this.backAction = this.backAction.bind(this);
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
        this._SelectPlaceSaved()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    }

    backAction() {
        this.props.route.params.parentFuntion(null, -1, 11)
        this.props.navigation.goBack()
        return true;
    };

    state = {
        specialExperienceDatas: [],
        morePlaceDatas: [],
        copyMorePlaceDatas: [],
        tabType: 2,
        exCategoryList: [{
            category_no: 0,
            ko: '전체',
            en: 'All',
            ja: '全国'
        }, ...User.category],
        placeCategoryList: [{
            category_no: 0,
            ko: '전체',
            en: 'All',
            ja: '全国'
        }, ...User.contentsCategory],
        exCategoryNum: {
            category_no: 0,
            ko: '전체',
            en: 'All',
            ja: '全国'
        },
        placeCategoryNum: {
            category_no: 0,
            ko: '전체',
            en: 'All',
            ja: '全国'
        },
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
        selectedDate: [],
        _markedDates: [],
        marked: null,
        markedType: 'dot',
        selectedDialogType: '1', // 1 - 국가, 2 - 도시, 3 - 지역, 4 - 일정
        selectAgendaDatas: [],
        selectDatas: this.props.route.params.selectDatas
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

    _ExSelectData(item) {
        if (this.state.selectAgendaDatas.includes(item)) {
            const newArr = this.state.selectAgendaDatas.filter(el => el.place_no !== item.place_no)
            this.setState({
                selectAgendaDatas: newArr,
            })
        } else {
            this.state.selectAgendaDatas.push(item)
            this.setState({ isFetching: false, })
        }
    }

    _ExCategorySelect(categoryNo) {
        if (categoryNo.category_no == 0) {
            this.setState({
                copyMorePlaceDatas: this.state.morePlaceDatas,
            })
        } else {
            this.state.copyMorePlaceDatas = [];
            const newArr = this.state.morePlaceDatas.filter(el => el.category.filter(el1 => el1 == categoryNo.category_no).length > 0)
            this.setState({
                copyMorePlaceDatas: newArr,
            })
        }
    }

    async _SelectPlaceSaved() {
        const url = ServerUrl.SelectSavedEx
        let formBody = {};
        this.state.morePlaceDatas = [];
        formBody = JSON.stringify({
            "conditions": [
                { "op": "AND", "q": "=", "f": "user_no", "v": User.userNo },
                { "op": "AND", "q": "=", "f": "flag", "v": 2 },
            ]
        })
        const placejson = await NetworkCall.Select(url, formBody)
        console.log('Place', placejson.length)
        for (let i = 0; i < placejson.length; i++) {
            if (this.props.route.params.select.city_no == 0) {
                if (placejson[i].info.country == this.props.route.params.select.country_no) {
                    if (this.state.placeCategoryNum.category_no == 0) {
                        if (placejson[i].info.image_representative != null) {
                            const obj = {
                                title: Utils.GrinderContents(JSON.parse(placejson[i].info.place_name)),
                                rate: placejson[i].info.rate,
                                reviewCnt: placejson[i].info.review_cnt,
                                // currency: json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency,
                                price: placejson[i].info.price,
                                city: placejson[i].info.city,
                                country: placejson[i].info.country,
                                saved: placejson[i].count,
                                town: Utils.Grinder(User.region.filter((el) => el.town_no == placejson[i].info.town)[0]),
                                place_no: placejson[i].info.place_no,
                                lat: placejson[i].info.lat,
                                lng: placejson[i].info.lng,
                                representative_file_url: ServerUrl.Server + JSON.parse(placejson[i].info.image_representative),
                                category: JSON.parse(placejson[i].info.categories.replace(/'/gi, ''))
                            }
                            this.state.morePlaceDatas.push(obj)
                        }
                    } else {
                        if (JSON.parse(placejson[i].info.categories.replace(/'/gi, '').replace(/"/gi, '')).includes(this.state.placeCategoryNum.category_no)) {
                            if (placejson[i].info.image_representative != null) {
                                const obj = {
                                    title: Utils.GrinderContents(JSON.parse(placejson[i].info.place_name)),
                                    rate: placejson[i].info.rate,
                                    reviewCnt: placejson[i].info.review_cnt,
                                    // currency: json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency,
                                    price: placejson[i].info.price,
                                    city: placejson[i].info.city,
                                    country: placejson[i].info.country,
                                    saved: placejson[i].count,
                                    lat: placejson[i].info.lat,
                                    lng: placejson[i].info.lng,
                                    town: Utils.Grinder(User.region.filter((el) => el.town_no == placejson[i].info.town)[0]),
                                    place_no: placejson[i].info.place_no,
                                    representative_file_url: ServerUrl.Server + JSON.parse(placejson[i].info.image_representative),
                                    category: JSON.parse(placejson[i].info.categories.replace(/'/gi, ''))
                                }
                                this.state.morePlaceDatas.push(obj)
                            }
                        }
                    }
                }
            } else {
                if (placejson[i].info.city == this.props.route.params.select.city_no) {
                    if (this.state.placeCategoryNum.category_no == 0) {
                        if (placejson[i].info.image_representative != null) {
                            const obj = {
                                title: Utils.GrinderContents(JSON.parse(placejson[i].info.place_name)),
                                rate: placejson[i].info.rate,
                                reviewCnt: placejson[i].info.review_cnt,
                                // currency: json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency,
                                price: placejson[i].info.price,
                                city: placejson[i].info.city,
                                country: placejson[i].info.country,
                                saved: placejson[i].count,
                                lat: placejson[i].info.lat,
                                lng: placejson[i].info.lng,
                                town: Utils.Grinder(User.region.filter((el) => el.town_no == placejson[i].info.town)[0]),
                                place_no: placejson[i].info.place_no,
                                representative_file_url: ServerUrl.Server + JSON.parse(placejson[i].info.image_representative),
                                category: JSON.parse(placejson[i].info.categories.replace(/'/gi, ''))
                            }
                            this.state.morePlaceDatas.push(obj)
                        }
                    } else {
                        if (JSON.parse(placejson[i].info.categories.replace(/'/gi, '').replace(/"/gi, '')).includes(this.state.placeCategoryNum.category_no)) {
                            if (placejson[i].info.image_representative != null) {
                                const obj = {
                                    title: Utils.GrinderContents(JSON.parse(placejson[i].info.place_name)),
                                    rate: placejson[i].info.rate,
                                    reviewCnt: placejson[i].info.review_cnt,
                                    // currency: json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency,
                                    price: placejson[i].info.price,
                                    city: placejson[i].info.city,
                                    country: placejson[i].info.country,
                                    saved: placejson[i].count,
                                    lat: placejson[i].info.lat,
                                    lng: placejson[i].info.lng,
                                    town: Utils.Grinder(User.region.filter((el) => el.town_no == placejson[i].info.town)[0]),
                                    place_no: placejson[i].info.place_no,
                                    representative_file_url: ServerUrl.Server + JSON.parse(placejson[i].info.image_representative),
                                    category: JSON.parse(placejson[i].info.categories.replace(/'/gi, ''))
                                }
                                this.state.morePlaceDatas.push(obj)
                            }
                        }
                    }
                }
            }
        }
        this.setState({ isFetching: false, copyMorePlaceDatas: this.state.morePlaceDatas })
    }

    _AddBack() {
        this.props.route.params.parentFuntion(this.state.selectAgendaDatas, this.props.route.params.mapsIndex, 1)
        this.props.navigation.goBack()
    }

    render() {
        let categorys = this.state.tabType == 1 ? this.state.exCategoryList : this.state.placeCategoryList
        let tripText = (this.props.route.params.select.city_no == 0 ? Utils.Grinder(User.country.filter((el) => el.country_no == this.props.route.params.select.country_no)[0]) : Utils.Grinder(this.props.route.params.select))
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{Utils.Grinder(this.props.route.params.select)}</Text>
                    </View>

                    <View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                            <View style={{ flexDirection: 'row' }}>
                                {categorys.map((item, index) => (
                                    <TouchableOpacity style={{ marginLeft: index == 0 ? 0 : 20 }} onPress={() => this.setState({ placeCategoryNum: item }, () => this._ExCategorySelect(item))}>
                                        <View >
                                            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: item.category_no == (this.state.tabType == 1 ? this.state.exCategoryNum.category_no : this.state.placeCategoryNum.category_no) ? Colors.color289FAF : Colors.colorFFFFFF, alignItems: 'center', justifyContent: 'center', marginTop: 16, }}>
                                                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: index == 0 ? '#73808E' : Colors.colorFFFFFF, alignItems: 'center', justifyContent: 'center', }}>
                                                    {index == 0 ? (
                                                        <View style={{ width: 18, height: 18, }}>
                                                            <View style={{ flexDirection: 'row' }}>
                                                                <View style={{ width: 8, height: 8, backgroundColor: Colors.colorFFFFFF, }}></View>
                                                                <View style={{ width: 8, height: 8, backgroundColor: Colors.colorFFFFFF, marginLeft: 2 }}></View>
                                                            </View>

                                                            <View style={{ marginTop: 2, flexDirection: 'row' }}>
                                                                <View style={{ width: 8, height: 8, backgroundColor: Colors.colorFFFFFF, }}></View>
                                                                <View style={{ width: 8, height: 8, backgroundColor: Colors.colorFFFFFF, marginLeft: 2 }}></View>
                                                            </View>
                                                        </View>
                                                    ) : <FastImage style={{ width: 60, height: 60, borderRadius: 30 }} source={{ uri: ServerUrl.Server + item.image_path, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal, }} resizeMode={FastImage.resizeMode.cover}></FastImage>}
                                                </View>
                                            </View>

                                            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 10, }}>
                                                <Text style={{ color: Colors.color5B5B5B, fontFamily: 'Raleway-Medium', fontSize: 8, includeFontPadding: false }}>{Utils.Grinder(item)}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    <View style={{ marginTop: 12, backgroundColor: 'rgba(156, 159, 161, 0.5)', height: 1, width: '100%', marginBottom: 12 }}></View>

                    {this.state.tabType == 2 && <FlatList keyExtractor={(item, index) => index.toString()} numColumns={2} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} data={this.state.copyMorePlaceDatas} renderItem={(obj) => {
                        return (
                            <View key={obj.index} style={{ paddingLeft: obj.index % 2 != 0 ? 16 : 0, marginTop: 8, marginBottom: 8 }}>
                                {/* <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('PlaceDetail', { placeNo: obj.item.place_no })}> */}
                                <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 0, }}>
                                    <FastImage style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, borderRadius: 4 }} source={{ uri: obj.item.representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                    <View style={{ position: 'absolute', width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, alignItems: 'center', justifyContent: 'center' }}>
                                        <TouchableOpacity onPress={() => this.state.selectDatas.includes(obj.item.place_no) == false && this._ExSelectData(obj.item)}>
                                            {this.state.selectAgendaDatas.includes(obj.item) == false ? (
                                                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image style={{ width: 21, height: 21, resizeMode: 'contain', tintColor: Colors.colorFFFFFF }} source={imgAdd}></Image>
                                                </View>
                                            )
                                                : (
                                                    <View style={{ borderWidth: 2, borderColor: Colors.color289FAF, borderRadius: 30, width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ fontSize: 36, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color289FAF }}>{this.state.selectAgendaDatas.indexOf(obj.item) + 1}</Text>
                                                    </View>
                                                )}
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, }} numberOfLines={2} ellipsizeMode="tail">{obj.item.title}</Text>

                                    <View style={{ width: '55%', flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                                        {this._MakeStar(obj.item.rate, obj.item.reviewCnt)}
                                        <View style={{ width: '100%', }}>
                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{"・" + obj.item.saved + " saved"}</Text>
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                                        <Text style={{ fontSize: 10, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == obj.item.category[0])[0]) + "・" + obj.item.town}</Text>
                                    </View>
                                </View>
                                {/* </TouchableWithoutFeedback> */}
                            </View>
                        )
                    }}
                        ListFooterComponent={
                            <View style={{ height: 20 }}></View>
                        }></FlatList>
                    }

                    {this.state.selectAgendaDatas.length > 0 && <TouchableOpacity style={{ position: 'absolute', bottom: 20, alignItems: 'center', justifyContent: 'center', width: '100%', marginLeft: 16 }} onPress={() => this._AddBack()}>
                        <View style={{ backgroundColor: Colors.color289FAF, width: '100%', height: 48, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{this.state.lang == 'ko' ? this.state.selectAgendaDatas.length + '개의 일정 추가하기' : this.state.lang == 'ja' ? this.state.selectAgendaDatas.length + 'つのプランを追加' : `${'Add' + this.state.selectAgendaDatas.length + 'Agenda(s)'}`}</Text>
                        </View>
                    </TouchableOpacity>}

                </View>
            </SafeAreaView >
        )
    }
}