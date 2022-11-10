import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, FlatList, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';
import * as Utils from '../../Common/Utils'
import User from '../../Common/User'
import ServerUrl from '../../Common/ServerUrl';
import FetchingIndicator from 'react-native-fetching-indicator'
import * as NetworkCall from '../../Common/NetworkCall'
import FastImage from 'react-native-fast-image';
import SelectDialog from '../../Common/SelectDialog'

const TAG = "SavedSearch"
const imgBack = require('../../../assets/ic_back.png');
const imgSearch = require('../../../assets/ic_search.png');
const imgRegionBg = require('../../../assets/img_region_bg.png');
const imgCircleSaveBg = require('../../../assets/ic_circle_saved.png');
const imgBookmark = require('../../../assets/ic_bookmark.png');
const imgBookmarkBlack = require('../../../assets/ic_bookmark_black.png');
const imgStarOn = require('../../../assets/ic_star.png');
const imgStarOff = require('../../../assets/ic_star_off.png');
const imgCategory = require('../../../assets/img_saved_category.png')

const { width: screenWidth } = Dimensions.get('window');

export default class SavedSearch extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this._SelectExSaved(0)
    }

    state = {
        specialExperienceDatas: [],
        morePlaceDatas: [],
        tabType: 1,
        exCategoryList: [{
            category_no: 0,
            ko: '전체',
            en: 'All',
            ja: ''
        }, ...User.category],
        placeCategoryList: [{
            category_no: 0,
            ko: '전체',
            en: 'All',
            ja: ''
        }, ...User.contentsCategory],
        exCategoryNum: {
            category_no: 0,
            ko: '전체',
            en: 'All',
            ja: ''
        },
        placeCategoryNum: {
            category_no: 0,
            ko: '전체',
            en: 'All',
            ja: ''
        },
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
        selectedDate: [],
        _markedDates: [],
        marked: null,
        markedType: 'dot',
        selectedDialogType: '1', // 1 - 국가, 2 - 도시, 3 - 지역, 4 - 일정
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

    _Bookmark = (flag, no) => {
        if (flag == 1) {
            if (User.exSaved.includes(no)) {
                this._DelectSaved(flag, no)
            } else {
                this._InsertSaved(flag, no)
            }
            console.log(User.exSaved)
        } else {
            if (User.placeSaved.includes(no)) {
                this._DelectSaved(flag, no)
            } else {
                this._InsertSaved(flag, no)
            }
        }
    }

    async _SelectExSaved(value) {
        const url = ServerUrl.SelectSavedEx
        let formBody = {};
        this.state.specialExperienceDatas = [];
        formBody = JSON.stringify({
            "conditions": [
                { "op": "AND", "q": "=", "f": "user_no", "v": User.userNo },
                { "op": "AND", "q": "=", "f": "flag", "v": 1 },
            ]
        })

        const exjson = await NetworkCall.Select(url, formBody)
        console.log(exjson)
        for (let i = 0; i < exjson.length; i++) {
            if (this.props.route.params.select.city_no == 0) {
                if (exjson[i].info.country == this.props.route.params.select.country_no) {
                    let test = [];
                    if (exjson[i].info.representative_file_url == null || exjson[i].info.representative_file_url.length == 0) {
                        test.push('https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013')
                    } else {
                        const representativeItem = JSON.parse(exjson[i].info.representative_file_url)
                        for (let i = 0; i < representativeItem.length; i++) {
                            test.push(ServerUrl.Server + representativeItem[i])
                        }
                    }
                    if (this.state.exCategoryNum.category_no == 0) {
                        const obj = {
                            title: exjson[i].info.title,
                            rate: exjson[i].info.rate,
                            reviewCnt: exjson[i].info.review_cnt,
                            currency: exjson[i].info.currency == "USD" ? "$" : exjson[i].info.currency == "KRW" ? "₩" : exjson[i].info.currency == "EUR" ? "€" : exjson[i].info.currency == "JPY" ? "¥" : exjson[i].info.currency,
                            price: exjson[i].info.price,
                            city: exjson[i].info.city,
                            country: exjson[i].info.country,
                            town: Utils.Grinder(User.region.filter((el) => el.town_no == exjson[i].info.town)[0]),
                            ex_no: exjson[i].info.ex_no,
                            representative_file_url: test[0],
                            category: exjson[i].info.categories
                        }
                        this.state.specialExperienceDatas.push(obj)
                    } else {
                        if (exjson[i].info.categories[0].category_no == this.state.exCategoryNum.category_no) {
                            const obj = {
                                title: exjson[i].info.title,
                                rate: exjson[i].info.rate,
                                reviewCnt: exjson[i].info.review_cnt,
                                currency: exjson[i].info.currency == "USD" ? "$" : exjson[i].info.currency == "KRW" ? "₩" : exjson[i].info.currency == "EUR" ? "€" : exjson[i].info.currency == "JPY" ? "¥" : exjson[i].info.currency,
                                price: exjson[i].info.price,
                                city: exjson[i].info.city,
                                country: exjson[i].info.country,
                                town: Utils.Grinder(User.region.filter((el) => el.town_no == exjson[i].info.town)[0]),
                                ex_no: exjson[i].info.ex_no,
                                representative_file_url: test[0],
                                category: exjson[i].info.categories
                            }
                            this.state.specialExperienceDatas.push(obj)
                        }
                    }
                }
            } else {
                if (exjson[i].info.city == this.props.route.params.select.city_no) {
                    let test = [];
                    if (exjson[i].info.representative_file_url == null || exjson[i].info.representative_file_url.length == 0) {
                        test.push('https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013')
                    } else {
                        const representativeItem = JSON.parse(exjson[i].info.representative_file_url)
                        for (let i = 0; i < representativeItem.length; i++) {
                            test.push(ServerUrl.Server + representativeItem[i])
                            FastImage.preload([{ uri: ServerUrl.Server + representativeItem[i], headers: { Authorization: 'authToken' }, }])
                        }
                    }
                    if (this.state.exCategoryNum.category_no == 0) {
                        const obj = {
                            title: exjson[i].info.title,
                            rate: exjson[i].info.rate,
                            reviewCnt: exjson[i].info.review_cnt,
                            currency: exjson[i].info.currency == "USD" ? "$" : exjson[i].info.currency == "KRW" ? "₩" : exjson[i].info.currency == "EUR" ? "€" : exjson[i].info.currency == "JPY" ? "¥" : exjson[i].info.currency,
                            price: exjson[i].info.price,
                            city: exjson[i].info.city,
                            country: exjson[i].info.country,
                            town: Utils.Grinder(User.region.filter((el) => el.town_no == exjson[i].info.town)[0]),
                            ex_no: exjson[i].info.ex_no,
                            representative_file_url: test[0],
                            category: exjson[i].info.categories
                        }
                        this.state.specialExperienceDatas.push(obj)
                    } else {
                        if (exjson[i].info.categories[0].category_no == this.state.exCategoryNum.category_no) {
                            const obj = {
                                title: exjson[i].info.title,
                                rate: exjson[i].info.rate,
                                reviewCnt: exjson[i].info.review_cnt,
                                currency: exjson[i].info.currency == "USD" ? "$" : exjson[i].info.currency == "KRW" ? "₩" : exjson[i].info.currency == "EUR" ? "€" : exjson[i].info.currency == "JPY" ? "¥" : exjson[i].info.currency,
                                price: exjson[i].info.price,
                                city: exjson[i].info.city,
                                country: exjson[i].info.country,
                                town: Utils.Grinder(User.region.filter((el) => el.town_no == exjson[i].info.town)[0]),
                                ex_no: exjson[i].info.ex_no,
                                representative_file_url: test[0],
                                category: exjson[i].info.categories
                            }
                            this.state.specialExperienceDatas.push(obj)
                        }
                    }
                }
            }
        }
        // this.setState({ isFetching: false })
        if (value == 0) {
            this._SelectPlaceSaved()
        } else {
            this.setState({ isFetching: false })
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
        this.setState({ isFetching: false })
    }

    async _InsertSaved(flag, no) {
        const url = ServerUrl.InsertSaved
        let formBody = {};

        formBody = JSON.stringify({
            "user_no": User.userNo,
            "flag": flag,
            "content_no": no
        })

        const json = await NetworkCall.Select(url, formBody)
        console.log('_InsertSaved', json)
        if (json.length > 0) {
            Toast.show({ text1: I18n.t('savedToast') });
            if (flag == 1) {
                User.exSaved.push(no)
                this._SelectExSaved()
            } else {
                User.placeSaved.push(no)
                this._SelectPlaceSaved()
            }
        }
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
                this._SelectExSaved()
            } else {
                const newList = User.placeSaved.filter((item) => item !== no);
                User.placeSaved = newList
                this._SelectPlaceSaved()
            }
        }
    }

    render() {
        let categorys = this.state.tabType == 1 ? this.state.exCategoryList : this.state.placeCategoryList
        let tripText = (this.props.route.params.select.city_no == 0 ? Utils.Grinder(User.country.filter((el) => el.country_no == this.props.route.params.select.country_no)[0]) : Utils.Grinder(this.props.route.params.select))
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    {this._CallDialog()}
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{Utils.Grinder(this.props.route.params.select)}</Text>
                    </View>

                    <View style={{ marginTop: 10, flexDirection: 'row', opacity: 1 }}>
                        <View style={{ position: 'absolute', height: 4, backgroundColor: Colors.colorD9D9D9, width: '100%', bottom: 0, }}></View>
                        <TouchableOpacity onPress={() => this.setState({ tabType: 1 })}>
                            <View style={{ justifyContent: 'flex-end' }}>
                                <View style={{ paddingLeft: 18, paddingRight: 18, marginBottom: 8 }}>
                                    <Text style={{ color: this.state.tabType == 1 ? Colors.color2D7DC8 : Colors.color5B5B5B, fontFamily: 'Raleway-Bold', fontSize: 15, includeFontPadding: false }}>{I18n.t('experiences')}</Text>
                                </View>
                                <View style={{ height: 4, backgroundColor: Colors.color2D7DC8, opacity: this.state.tabType == 1 ? 1 : 0 }}></View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.setState({ tabType: 2 })}>
                            <View style={{ justifyContent: 'flex-end' }}>
                                <View style={{ paddingLeft: 18, paddingRight: 18, marginBottom: 8 }}>
                                    <Text style={{ color: this.state.tabType == 2 ? Colors.color2D7DC8 : Colors.color5B5B5B, fontFamily: 'Raleway-Bold', fontSize: 15, includeFontPadding: false }}>{I18n.t('contentsTabPlaces')}</Text>
                                </View>
                                <View style={{ height: 4, backgroundColor: Colors.color2D7DC8, opacity: this.state.tabType == 2 ? 1 : 0 }}></View>
                            </View>
                        </TouchableOpacity>

                        <View style={{ flex: 1 }}></View>
                    </View>

                    <View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                            <View style={{ flexDirection: 'row' }}>
                                {categorys.map((item, index) => (
                                    <TouchableOpacity style={{ marginLeft: index == 0 ? 0 : 20 }} onPress={() => this.state.tabType == 1 ? this.setState({ exCategoryNum: item }, () => this._SelectExSaved(1)) : this.setState({ placeCategoryNum: item }, () => this._SelectPlaceSaved())}>
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
                                                    ) : <Image source={imgCategory} style={{ width: 60, height: 60, resizeMode: 'contain', }}></Image>}
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

                    {this.state.tabType == 1 && <FlatList keyExtractor={(item, index) => index.toString()} numColumns={2} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} data={this.state.specialExperienceDatas} renderItem={(obj) => {
                        return (
                            <View key={obj.index} style={{ paddingLeft: obj.index % 2 != 0 ? 16 : 0, marginTop: 8, marginBottom: 8 }}>
                                <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('GoodsDetail', { exNo: obj.item.ex_no })}>
                                    <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 0, }}>
                                        <FastImage style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, borderRadius: 4 }} source={{ uri: obj.item.representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                        <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(1, obj.item.ex_no)}>
                                            <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={User.exSaved.includes(obj.item.ex_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                            </ImageBackground>
                                        </TouchableOpacity>

                                        <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, }} numberOfLines={2} ellipsizeMode="tail">{obj.item.title}</Text>

                                        <View style={{ width: '55%', flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                                            {this._MakeStar(obj.item.rate, obj.item.reviewCnt)}
                                            <View style={{ width: '100%', }}>
                                                <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{"・" + obj.item.currency + Utils.numberWithCommas(obj.item.price)}</Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                                            <Text style={{ fontSize: 10, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{Utils.Grinder(obj.item.category[0]) + "・" + obj.item.town}</Text>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        )
                    }}
                        ListFooterComponent={
                            <View style={{ height: 80 }}></View>
                        }></FlatList>}

                    {this.state.tabType == 2 && <FlatList keyExtractor={(item, index) => index.toString()} numColumns={2} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} data={this.state.morePlaceDatas} renderItem={(obj) => {
                        return (
                            <View key={obj.index} style={{ paddingLeft: obj.index % 2 != 0 ? 16 : 0, marginTop: 8, marginBottom: 8 }}>
                                <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('PlaceDetail', { placeNo: obj.item.place_no })}>
                                    <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 0, }}>
                                        <FastImage style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, borderRadius: 4 }} source={{ uri: obj.item.representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                        <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(2, obj.item.place_no)}>
                                            <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={User.placeSaved.includes(obj.item.place_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                            </ImageBackground>
                                        </TouchableOpacity>

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
                                </TouchableWithoutFeedback>
                            </View>
                        )
                    }}
                        ListFooterComponent={
                            <View style={{ height: 80 }}></View>
                        }></FlatList>
                    }

                    <TouchableOpacity style={{ position: 'absolute', bottom: 20, alignItems: 'center', justifyContent: 'center', width: '100%', marginLeft: 16 }} onPress={() => this.setState({ selectedDialogType: 4, selectDialogVisible: true })}>
                        <View style={{ backgroundColor: Colors.color289FAF, width: '100%', height: 48, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{this.state.lang == 'en' ? I18n.t('savedPlan') + tripText : tripText + I18n.t('savedPlan')}</Text>
                        </View>
                    </TouchableOpacity>

                </View>
            </SafeAreaView >
        )
    }

    _CallDialog() {
        if (this.state.selectDialogVisible) {
            let datas = [];
            let title = I18n.t('homeCountry');
            let type = this.state.selectedDialogType;

            if (type == '4') {
                title = I18n.t('homeDate')
            }

            if (type == '4' || datas.length > 0) {
                return <SelectDialog title={title} datas={datas} type={type} _markedDates={this.state._markedDates} selectedPosition={(type == '1' ? this.state.selectedCountyPosition : (type == '2' ? this.state.selectedCityPosition : this.state.selectedRegionPosition))} markedType={this.state._markedDates.length > 1 ? 'period' : 'dot'} marked={this.state.marked} click={this._ClickDialog} selectedString={(type == '1' ? this.state.selectedCountry : (type == '2' ? this.state.selectedCity : this.state.selectedRegion))} no={(type == '1' ? this.state.selectedCountryNo : (type == '2' ? this.state.selectedCityNo : this.state.selectedRegionNo))}></SelectDialog>
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    _ClickDialog = value => {

        if (value.type == '4') {
            this.state.marked = value.marked
            this.state._markedDates = value._markedDates
            this.setState({
                selectDialogVisible: false,
                showSelectedScheduleDate: this.state._markedDates[0] + ' ~ ' + this.state._markedDates[this.state._markedDates.length - 1],
                isFetching: true,
            }, () => this.props.navigation.navigate('SavedScheduleMain', { country: this.props.route.params.select.country_no, city: this.props.route.params.select.city_no == 0 ? -1 : this.props.route.params.select.city_no, marked: this.state.marked, _markedDates: this.state._markedDates, select: this.props.route.params.select }));
        } else if (value.type == '5') {
            this.setState({
                selectDialogVisible: false,
            });
        }
    }
}