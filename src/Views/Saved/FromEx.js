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

const TAG = "FromEx"
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

export default class FromEx extends React.Component {
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
        copySpecialExperienceDatas: [],
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
            const newArr = this.state.selectAgendaDatas.filter(el => el.ex_no !== item.ex_no)
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
                copySpecialExperienceDatas: this.state.specialExperienceDatas,
            })
        } else {
            this.state.copySpecialExperienceDatas = [];
            const newArr = this.state.specialExperienceDatas.filter(el => el.category.filter(el1 => el1.category_no == categoryNo.category_no).length > 0)
            this.setState({
                copySpecialExperienceDatas: newArr,
            })
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
        // console.log(exjson)
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
                            category: exjson[i].info.categories,
                            lat: exjson[i].info.lat,
                            lng: exjson[i].info.lng,
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
                                category: exjson[i].info.categories,
                                lat: exjson[i].info.lat,
                                lng: exjson[i].info.lng,
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
                            category: exjson[i].info.categories,
                            lat: exjson[i].info.lat,
                            lng: exjson[i].info.lng,
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
                                category: exjson[i].info.categories,
                                lat: exjson[i].info.lat,
                                lng: exjson[i].info.lng,
                            }
                            this.state.specialExperienceDatas.push(obj)
                        }
                    }
                }
            }
        }
        this.setState({ isFetching: false, copySpecialExperienceDatas: this.state.specialExperienceDatas })
    }

    _AddBack() {
        this.props.route.params.parentFuntion(this.state.selectAgendaDatas, this.props.route.params.mapsIndex, 0)
        this.props.navigation.goBack()
    }

    render() {
        console.log(this.props.route.params.select)
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
                                    <TouchableOpacity style={{ marginLeft: index == 0 ? 0 : 20 }} onPress={() => this.setState({ exCategoryNum: item }, () => this._ExCategorySelect(item))}>
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

                    {this.state.tabType == 1 && <FlatList keyExtractor={(item, index) => index.toString()} numColumns={2} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} data={this.state.copySpecialExperienceDatas} renderItem={(obj) => {
                        return (
                            <View key={obj.index} style={{ paddingLeft: obj.index % 2 != 0 ? 16 : 0, marginTop: 8, marginBottom: 8 }}>
                                <TouchableWithoutFeedback>
                                    <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 0, }}>
                                        <FastImage style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, borderRadius: 4 }} source={{ uri: obj.item.representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>

                                        <View style={{ position: 'absolute', width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, alignItems: 'center', justifyContent: 'center' }}>
                                            <TouchableOpacity onPress={() => this.state.selectDatas.includes(obj.item.ex_no) == false && this._ExSelectData(obj.item)}>
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
                            <View style={{ height: 20 }}></View>
                        }></FlatList>}

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