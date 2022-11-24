import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, LogBox, Animated, TouchableOpacity } from 'react-native'
import SelectDialog from '../Common/SelectDialog'
import Colors from '../Common/Colos'
import I18n from '../lang/i18n';
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import * as Utils from '../Common/Utils'
import ServerUrl from '../Common/ServerUrl'
import Orientation from 'react-native-orientation'
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-community/async-storage';
import FetchingIndicator from 'react-native-fetching-indicator'
import * as NetworkCall from '../Common/NetworkCall'
import User from '../Common/User';
import Moment from 'moment'
import FastImage from 'react-native-fast-image';

const TAG = "HomeTabs";
const imgPlus = require('../../assets/ic_plus.png');
const imgRegionBg = require('../../assets/img_region_bg.png');
const imgDownArrow = require('../../assets/ic_down_arrow.png');
const imgCanlendar = require('../../assets/ic_calendar_icon.png');
const imgRightArrow = require('../../assets/ic_arrow_right.png');
const imgCircleSaveBg = require('../../assets/ic_circle_saved.png');
const imgBookmark = require('../../assets/ic_bookmark.png');
const imgBookmarkBlack = require('../../assets/ic_bookmark_black.png');
const imgStarOn = require('../../assets/ic_star.png');
const imgStarOff = require('../../assets/ic_star_off.png');
const imgBack = require('../../assets/ic_back.png');
const imgCalendarPrevious = require('../../assets/ic_calendar_arrow_left.png');
const imgCalendarNext = require('../../assets/ic_calendar_arrow_right.png');

const { width: screenWidth } = Dimensions.get('window');

LogBox.ignoreLogs([
    'Each child in a list should have a unique "key" prop.', 'onAnimatedValueUpdate', 'Warning'
]);

export default class HomeTabs extends React.Component {
    constructor(props) {
        super(props)
        // this.backAction = this.backAction.bind(this);
        this.animated = new Animated.Value(0);
    }

    componentDidMount() {
        AsyncStorage.getItem('firstRegion', (err, result) => {
            if (result != null) {
                const firstRegion = JSON.parse(result);
                console.log(firstRegion)
                this.setState({
                    selectedCountryNo: firstRegion.countryNo,
                    selectedCityNo: firstRegion.cityNo,
                    selectedRegionNo: firstRegion.regionNo,
                    selectedCountry: Utils.Grinder(User.country.filter((el) => el.country_no == firstRegion.countryNo)[0]),
                    selectedCity: firstRegion.cityNo == 0 ? Utils.Grinder({ ko: '전체', en: 'All', ja: '全国' }) : Utils.Grinder(User.city.filter((el) => el.city_no == firstRegion.cityNo)[0]),
                    selectedRegion: firstRegion.regionNo == 0 ? Utils.Grinder({ ko: '전체', en: 'All', ja: '全国' }) : Utils.Grinder(User.region.filter((el) => el.town_no == firstRegion.regionNo)[0]),
                })
                if (User.guest == true) {
                    this._Experience()
                } else {
                    this._Travel()
                }
            }
        })
    }

    componentWillUnmount() {
        console.log(TAG, 'componentWillUnmount')
    }

    state = {
        tripPlanDatas: [],
        specialExperienceDatas: [],
        restaurantsPlaceDatas: [],
        repPlaceDatas: [],
        restaurantsOffset: 0,
        restaurantsTotal: 0,
        repOffset: 0,
        repTotal: 0,
        selectDialogVisible: false,
        selectedCountyPosition: -1,
        selectedCityPosition: -1,
        selectedRegionPosition: -1,
        selectedCountryNo: -1,
        selectedCityNo: -1,
        selectedRegionNo: -1,
        countryDatas: [],
        selectedCountry: '',
        cityDatas: [],
        selectedCity: '',
        regionDatas: [],
        selectedRegion: '',
        multiAvailability: false,
        selectedDate: [],
        _markedDates: [],
        marked: null,
        markedType: 'dot',
        selectedDialogType: '1', // 1 - 국가, 2 - 도시, 3 - 지역, 4 - 일정
        showSelectedScheduleDate: '',
        isLoading: false,
        duration: 500,
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
        isFetching: true,
        savedFlag: -1,
        savedContentNo: -1,
    }

    _CallDialog() {
        if (this.state.selectDialogVisible) {
            let datas = [];
            let title = I18n.t('homeCountry');
            let type = this.state.selectedDialogType;

            if (type == '1') {
                title = I18n.t('homeCountry')
                // datas = this.state.countryDatas
                datas = User.country
            }
            else if (type == '2') {
                title = I18n.t('homeCity')
                // datas = this.state.cityDatas
                datas = [{
                    category_no: this.state.selectedCountryNo,
                    city_no: 0,
                    ko: '전체',
                    en: 'All',
                    ja: '全国'
                }, ...User.city.filter((value) => value.country_no == this.state.selectedCountryNo)]
            }
            else if (type == '3' && this.state.selectedCityNo != -1 && this.state.selectedCityNo != 0) {
                title = I18n.t('homeRegion')
                // datas = this.state.regionDatas
                datas = [{
                    category_no: this.state.selectedCountryNo,
                    city_no: this.state.selectedCityNo,
                    town_no: 0,
                    ko: '전체',
                    en: 'All',
                    ja: '全国'
                }, ...User.region.filter((value) => value.city_no == this.state.selectedCityNo)]

            }
            else if (type == '4') {
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
                specialExperienceDatas: [],
                restaurantsPlaceDatas: [],
                restaurantsOffset: 0,
                restaurantsTotal: 0,
                repPlaceDatas: [],
                repOffset: 0,
                repTotal: 0,
            }, () => this._Experience());
            AsyncStorage.setItem('firstRegion', JSON.stringify({
                'countryNo': this.state.selectedCountryNo, 'cityNo': this.state.selectedCityNo, 'regionNo': this.state.selectedRegionNo,
            }));
        } else if (value.type == '3') {
            this.setState({
                selectDialogVisible: false,
                // selectedRegion: this._LangSelectText(this.state.regionDatas[value.selectedPosition].en, this.state.regionDatas[value.selectedPosition].ko, this.state.regionDatas[value.selectedPosition].ja),
                selectedRegion: value.no == 0 ? Utils.Grinder({ ko: '전체', en: 'All', ja: '全国' }) : Utils.Grinder(User.region.filter((el) => el.town_no == value.no)[0]),
                selectedRegionNo: value.no,
                selectedRegionPosition: value.selectedPosition,
                isFetching: true,
                specialExperienceDatas: [],
                restaurantsPlaceDatas: [],
                repPlaceDatas: [],
                repOffset: 0,
                repTotal: 0,
                restaurantsOffset: 0,
                restaurantsTotal: 0,
            }, () => this._Experience())
            AsyncStorage.setItem('firstRegion', JSON.stringify({
                'countryNo': this.state.selectedCountryNo, 'cityNo': this.state.selectedCityNo, 'regionNo': value.no,
            }));
        } else if (value.type == '2') {
            this.setState({
                selectDialogVisible: false,
                // selectedCity: this._LangSelectText(this.state.cityDatas[value.selectedPosition].en, this.state.cityDatas[value.selectedPosition].ko, this.state.cityDatas[value.selectedPosition].ja),
                selectedCity: value.no == 0 ? Utils.Grinder({ ko: '전체', en: 'All', ja: '全国' }) : Utils.Grinder(User.city.filter((el) => el.city_no == value.no)[0]),
                selectedRegion: '',
                selectedRegionPosition: -1,
                selectedRegionNo: -1,
                regionDatas: [],
                selectedCityNo: value.no,
                selectedCityPosition: value.selectedPosition,
                isFetching: true,
                specialExperienceDatas: [],
                restaurantsPlaceDatas: [],
                repPlaceDatas: [],
                repOffset: 0,
                repTotal: 0,
                restaurantsOffset: 0,
                restaurantsTotal: 0,
            }, () => this._Experience())
            AsyncStorage.setItem('firstRegion', JSON.stringify({
                'countryNo': this.state.selectedCountryNo, 'cityNo': value.no, 'regionNo': -1,
            }));
        } else if (value.type == '1') {
            this.setState({
                selectDialogVisible: false,
                // selectedCountry: this._LangSelectText(this.state.countryDatas[value.selectedPosition].en, this.state.countryDatas[value.selectedPosition].ko, this.state.countryDatas[value.selectedPosition].ja),
                selectedCountry: Utils.Grinder(User.country.filter((el) => el.country_no == value.no)[0]),
                selectedCity: '',
                selectedRegion: '',
                selectedCityPosition: -1,
                selectedRegionPosition: -1,
                selectedCityNo: -1,
                selectedRegionNo: -1,
                selectedCountryNo: value.no,
                selectedCountyPosition: value.selectedPosition,
                cityDatas: [],
                regionDatas: [],
                isFetching: true,
                specialExperienceDatas: [],
                restaurantsPlaceDatas: [],
                repPlaceDatas: [],
                repOffset: 0,
                repTotal: 0,
                restaurantsOffset: 0,
                restaurantsTotal: 0,
            }, () => this._Experience())
            AsyncStorage.setItem('firstRegion', JSON.stringify({
                'countryNo': value.no, 'cityNo': -1, 'regionNo': -1,
            }));
        } else if (value.type == '5') {
            this.setState({
                selectDialogVisible: false,
            });
        }
    }

    _TranslateEatDrink(value) {
        if (I18n.currentLocale() == 'en-US') {
            return 'The Authentic Taste of ' + value
        } else if (I18n.currentLocale() == 'ko-KR') {
            return value + '의 맛을 느껴보세요'
        } else {
            return `グルメ特集：${value}編`
        }
    }

    _TranslateSpecial(value) {
        if (I18n.currentLocale() == 'en-US') {
            return `Appreciate ${value} in a Special Way`
        } else if (I18n.currentLocale() == 'ko-KR') {
            return value + '을(를) 즐기는 특별한 방법'
        } else {
            return value + 'を楽しむ特別な方法'
        }
    }

    _MakeSpecialExperienceChild() {
        let result = [];
        let size = this.state.specialExperienceDatas.length;
        if (size >= 4) {
            size = 4;
        }
        if (size > 0) {
            for (let i = 0; i < size / 2; i++) {
                result = result.concat(
                    <View key={i} style={{ flexDirection: 'row', marginTop: (i == 0 ? 15 : 12) }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('GoodsDetail', { exNo: this.state.specialExperienceDatas[(i * 2)].ex_no })}>
                            <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 0, }}>
                                <ImageBackground resizeMethod='resize' style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, }} imageStyle={{ borderRadius: 4 }} source={{ uri: this.state.specialExperienceDatas[(i * 2)].representative_file_url }}>
                                    <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(1, this.state.specialExperienceDatas[(i * 2)].ex_no)}>
                                        <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={User.exSaved != null && User.exSaved.includes(this.state.specialExperienceDatas[(i * 2)].ex_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                </ImageBackground>

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
                                <ImageBackground resizeMethod='resize' style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, }} imageStyle={{ borderRadius: 4 }} source={{ uri: this.state.specialExperienceDatas[(i * 2) + 1].representative_file_url }}>
                                    <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(1, this.state.specialExperienceDatas[(i * 2) + 1].ex_no)}>
                                        <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={User.exSaved != null && User.exSaved.includes(this.state.specialExperienceDatas[(i * 2) + 1].ex_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                </ImageBackground>

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
        if (User.guest == true) {
            this.props.navigation.navigate('GuestLogin')
        } else {
            if (flag == 1) {
                if (User.exSaved != null) {
                    if (User.exSaved.includes(no)) {
                        this._DelectSaved(flag, no)
                    } else {
                        this._SelectSaved(flag, no)
                    }
                } else {
                    this._SelectSaved(flag, no)
                }
            } else {
                if (User.exSaved != null) {
                    if (User.placeSaved.includes(no)) {
                        this._DelectSaved(flag, no)
                    } else {
                        this._SelectSaved(flag, no)
                    }
                } else {
                    this._SelectSaved(flag, no)
                }
            }
        }
    }

    async _Travel() {
        const url = ServerUrl.SelectTravel
        let formBody = {};
        formBody = JSON.stringify({
            "conditions": [
                {
                    "q": "=",
                    "f": "user_no",
                    "v": User.userNo
                }, {
                    "op": "AND",
                    "q": ">=",
                    "f": "end_dt",
                    "v": "\'" + Moment(new Date()).format('YYYY-MM-DD') + "\'"
                }
            ]
        })

        const json = await NetworkCall.Select(url, formBody)
        // console.log('_Travel', json)

        if (json.length > 0) {
            for (let i = 0; i < json.length; i++) {
                const obj = {
                    travelNo: json[i].travel_no,
                    repPath: JSON.parse(json[i].contents_list).length > 0 && JSON.parse(json[i].contents_list)[0].agendas.length > 0 && JSON.parse(json[i].contents_list)[0].agendas[0].repPath,
                    title: json[i].title,
                    cityNo: json[i].city_no,
                    countryNo: json[i].country_no,
                }
                this.state.tripPlanDatas.push(obj)
            }
            this._Experience()
        } else {
            this._Experience()
        }
    }

    async _Experience() {
        const url = ServerUrl.SelectExperienceSchedule

        let formBody = {};
        if (this.state._markedDates.length > 0) {
            formBody = JSON.stringify({
                "start_dt": this.state._markedDates[0],
                "end_dt": Moment(this.state._markedDates[this.state._markedDates.length - 1], "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD'),
                "conditions": [
                    {
                        "q": "page",
                        "limit": "4",
                        "offset": 0
                    }, {
                        "q": "order",
                        "f": "rate",
                        "o": "DESC"
                    }, {
                        "q": "=",
                        "f": (this.state.selectedRegion.length != 0 && this.state.selectedRegionNo != 0) ? 'town' : (this.state.selectedCity.length != 0 && this.state.selectedCityNo != 0) ? 'city' : 'country',
                        // "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
                        "v": (this.state.selectedRegion.length != 0 && this.state.selectedRegionNo != 0) ? this.state.selectedRegionNo : (this.state.selectedCity.length != 0 && this.state.selectedCityNo != 0) ? this.state.selectedCityNo : this.state.selectedCountryNo
                    }
                ]
            })
        } else {
            formBody = JSON.stringify({
                "conditions": [
                    {
                        "q": "page",
                        "limit": "4",
                        "offset": 0
                    }, {
                        "q": "order",
                        "f": "rate",
                        "o": "DESC"
                    }, {
                        "q": "=",
                        "f": (this.state.selectedRegion.length != 0 && this.state.selectedRegionNo != 0) ? 'town' : (this.state.selectedCity.length != 0 && this.state.selectedCityNo != 0) ? 'city' : 'country',
                        // "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
                        "v": (this.state.selectedRegion.length != 0 && this.state.selectedRegionNo != 0) ? this.state.selectedRegionNo : (this.state.selectedCity.length != 0 && this.state.selectedCityNo != 0) ? this.state.selectedCityNo : this.state.selectedCountryNo
                    }
                ]
            })
        }
        const json = await NetworkCall.Select(url, formBody)
        for (let i = 0; i < json.exList.length; i++) {
            let test = [];
            if (json.exList[i].representative_file_url == null || json.exList[i].representative_file_url.length == 0) {
                test.push('https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013')
            } else {
                const representativeItem = JSON.parse(json.exList[i].representative_file_url)
                for (let i = 0; i < representativeItem.length; i++) {
                    test.push(ServerUrl.Server + representativeItem[i])
                }
            }
            const obj = {
                title: json.exList[i].title,
                rate: json.exList[i].rate,
                reviewCnt: json.exList[i].review_cnt,
                currency: json.exList[i].currency == "USD" ? "$" : json.exList[i].currency == "KRW" ? "₩" : json.exList[i].currency == "EUR" ? "€" : json.exList[i].currency == "JPY" ? "¥" : json.exList[i].currency,
                price: json.exList[i].price,
                city: json.exList[i].city,
                country: json.exList[i].country,
                town: Utils.Grinder(User.region.filter((el) => el.town_no == json.exList[i].town)[0]),
                ex_no: json.exList[i].ex_no,
                representative_file_url: test[0],
                category: json.exList[i].categories
            }
            this.state.specialExperienceDatas.push(obj)
        }
        this._RestaurantsPlace(0)
    }

    async _RestaurantsPlace(type) {
        const url = ServerUrl.SearchContentsPlace
        let formBody = {};
        let categoriesList = [1, 2];

        const condition = [{
            "q": "=",
            "f": (this.state.selectedRegion.length != 0 && this.state.selectedRegionNo != 0) ? 'town' : (this.state.selectedCity.length != 0 && this.state.selectedCityNo != 0) ? 'city' : 'country',
            // "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
            "v": (this.state.selectedRegion.length != 0 && this.state.selectedRegionNo != 0) ? this.state.selectedRegionNo : (this.state.selectedCity.length != 0 && this.state.selectedCityNo != 0) ? this.state.selectedCityNo : this.state.selectedCountryNo
        }, {
            "op": "AND",
            "q": "order",
            "f": "e_dt",
            "o": "DESC"
        }, {
            "op": "AND",
            "q": "=",
            "f": "status",
            "v": 1
        }]
        if (this.state._markedDates.length > 0) {
            formBody = JSON.stringify({
                "limit": 8,
                "offset": this.state.moreOffset,
                "start_dt": this.state._markedDates[0],
                "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                "categories": categoriesList,
                "conditions": condition
            })
        } else {
            formBody = JSON.stringify({
                "limit": 8,
                "offset": this.state.moreOffset,
                "categories": categoriesList,
                "conditions": condition
            })
        }

        console.log(formBody)

        const json = await NetworkCall.Select(url, formBody)

        for (let i = 0; i < json.list.length; i++) {
            if (json.list[i].image_representative != null) {
                const obj = {
                    title: Utils.GrinderContents(JSON.parse(json.list[i].place_name)).replace(/&#039;/gi, '\'').replace(/&quot;/gi, '\"'),
                    rate: json.list[i].rate,
                    reviewCnt: json.list[i].review_cnt,
                    // currency: json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency,
                    price: json.list[i].price,
                    city: json.list[i].city,
                    country: json.list[i].country,
                    saved: 0,
                    town: Utils.Grinder(User.region.filter((el) => el.town_no == json.list[i].town)[0]),
                    place_no: json.list[i].place_no,
                    representative_file_url: ServerUrl.Server + JSON.parse(json.list[i].image_representative),
                    category: JSON.parse(json.list[i].categories.replace(/'/gi, ''))
                }
                this.state.restaurantsPlaceDatas.push(obj)
            }
        }
        this.state.restaurantsTotal = json.total;
        if (type == 0) {
            this._RepPlace()
        } else {
            this.setState({
                isFetching: false,
                isRefreshing: false,
            })
        }
    }

    async _RepPlace() {
        const url = ServerUrl.SearchContentsPlace
        let formBody = {};
        let categoriesList = [4, 6, 8, 9];

        const condition = [{
            "q": "=",
            "f": (this.state.selectedRegion.length != 0 && this.state.selectedRegionNo != 0) ? 'town' : (this.state.selectedCity.length != 0 && this.state.selectedCityNo != 0) ? 'city' : 'country',
            // "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
            "v": (this.state.selectedRegion.length != 0 && this.state.selectedRegionNo != 0) ? this.state.selectedRegionNo : (this.state.selectedCity.length != 0 && this.state.selectedCityNo != 0) ? this.state.selectedCityNo : this.state.selectedCountryNo
        }, {
            "op": "AND",
            "q": "order",
            "f": "e_dt",
            "o": "DESC"
        }, {
            "op": "AND",
            "q": "=",
            "f": "status",
            "v": 1
        }]
        if (this.state._markedDates.length > 0) {
            formBody = JSON.stringify({
                "limit": 8,
                "offset": this.state.moreOffset,
                "start_dt": this.state._markedDates[0],
                "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                "categories": categoriesList,
                "conditions": condition
            })
        } else {
            formBody = JSON.stringify({
                "limit": 8,
                "offset": this.state.moreOffset,
                "categories": categoriesList,
                "conditions": condition
            })
        }

        // console.log(formBody)

        const json = await NetworkCall.Select(url, formBody)
        for (let i = 0; i < json.list.length; i++) {
            const obj = {
                title: Utils.GrinderContents(JSON.parse(json.list[i].place_name)).replace(/&#039;/gi, '\'').replace(/&quot;/gi, '\"'),
                rate: json.list[i].rate,
                reviewCnt: json.list[i].review_cnt,
                // currency: json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency,
                price: json.list[i].price,
                city: json.list[i].city,
                country: json.list[i].country,
                saved: 0,
                town: Utils.Grinder(User.region.filter((el) => el.town_no == json.list[i].town)[0]),
                place_no: json.list[i].place_no,
                representative_file_url: json.list[i].image_representative != null ? ServerUrl.Server + JSON.parse(json.list[i].image_representative) : null,
                category: JSON.parse(json.list[i].categories.replace(/'/gi, ''))
            }
            this.state.repPlaceDatas.push(obj)
        }
        this.setState({
            isFetching: false,
            isRefreshing: false,
            repTotal: json.total
        })
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
        console.log(User.guest)
        if (User.exSaved == undefined) {
            User.exSaved = [];
            User.placeSaved = [];
        }
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    {this._CallDialog()}
                    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                        <View>
                            <View style={{ width: '100%', paddingLeft: 16, paddingTop: 11, paddingBottom: 15 }}>
                                <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('homeTabTitle')}</Text>
                                <ScrollView horizontal={true} style={{ marginTop: 12 }} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                                    <TouchableWithoutFeedback onPress={() => User.guest == true ? this.props.navigation.navigate('GuestLogin') : this.props.navigation.navigate('Main', { screen: I18n.t('saved'), })}>
                                        {/* <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('TravelInvite')}> */}
                                        <View style={{ width: 60, height: 60, backgroundColor: Colors.colorF5F5F5, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={imgPlus} style={{ width: 14, height: 14, resizeMode: 'contain' }}></Image>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    {this.state.tripPlanDatas.map((item, index) => (
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('SavedScheduleMain', { travelNo: item.travelNo, position: 'Main' })}>
                                            <View key={index} style={{ marginLeft: 12, alignItems: 'center', justifyContent: 'center', }}>
                                                <FastImage style={{ width: 60, height: 60, borderRadius: 30, resizeMode: 'cover', backgroundColor: Colors.colorB7B7B7 }} source={{ uri: ServerUrl.Server + ((item.cityNo == -1 || item.cityNo == 0) == true ? User.country.filter(el => el.country_no == item.countryNo)[0].img_path : User.city.filter(el => el.city_no == item.cityNo)[0].img_path), headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal, }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                <Text style={{ fontSize: 11, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginTop: 4 }}>{item.title}</Text>
                                            </View>
                                        </TouchableOpacity>

                                    ))}
                                    <View style={{ marginRight: 16 }}></View>
                                </ScrollView>
                            </View>

                            <View style={{ padding: 16, backgroundColor: Colors.colorE9F4FF }}>
                                <View style={{ flexDirection: 'row', backgroundColor: Colors.colorFFFFFF, borderWidth: 1, borderColor: Colors.colorBFBFBF, borderRadius: 4, height: 40 }}>
                                    <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 1 })}>
                                        <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center', }}>
                                            <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('homeCountry')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedCountry}</TextInput>
                                            <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                        </View>
                                    </TouchableWithoutFeedback >
                                    <View style={{ width: 1, backgroundColor: Colors.colorBFBFBF }}></View>
                                    <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 2 })}>
                                        <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center' }}>
                                            <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('homeCity')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedCity}</TextInput>
                                            <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={{ width: 1, backgroundColor: Colors.colorBFBFBF }}></View>
                                    <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 3 })}>
                                        <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center' }}>
                                            <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('homeRegion')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedRegion}</TextInput>
                                            <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>

                                <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: '4' })}>
                                    <View style={{ marginTop: 12, backgroundColor: Colors.colorFFFFFF, borderWidth: 1, borderColor: Colors.colorBFBFBF, borderRadius: 4, height: 40, flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 10 }}>
                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false }}>{I18n.t("homeDate")}</Text>
                                        <Text style={{ fontSize: 12, color: Colors.colorB7B7B7, fontFamily: "Raleway-Medium", includeFontPadding: false, marginLeft: 15 }}>{this.state.showSelectedScheduleDate}</Text>
                                        <Image source={imgCanlendar} style={{ width: 15, height: 17, resizeMode: 'contain', position: 'absolute', right: 10 }}></Image>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>

                            <View style={{ padding: 16 }}>
                                <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Main', { screen: I18n.t('experiences'), params: { country: this.state.selectedCountryNo, city: this.state.selectedCityNo, region: this.state.selectedRegionNo } })}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                        <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: "Raleway-Bold", includeFontPadding: false }}>{I18n.t('homeExperiencesTitle')}</Text>
                                        <Image source={imgRightArrow} style={{ width: 8, height: 14, marginLeft: 9 }} ></Image>
                                    </View>
                                </TouchableWithoutFeedback>

                                {this._MakeSpecialExperienceChild()}

                                {this.state.restaurantsPlaceDatas.length > 0 && <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Main', { screen: I18n.t('contents'), params: { country: this.state.selectedCountryNo, city: this.state.selectedCityNo, region: this.state.selectedRegionNo, categories: [User.contentsCategory[0], User.contentsCategory[1]] } })}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 32 }}>
                                        <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: "Raleway-Bold", includeFontPadding: false }}>{this._TranslateEatDrink((this.state.selectedRegion.length > 0 && this.state.selectedRegionNo != 0) ? this.state.selectedRegion : (this.state.selectedCity.length > 0 && this.state.selectedCityNo != 0) ? this.state.selectedCity : this.state.selectedCountry)}</Text>
                                        <Image source={imgRightArrow} style={{ width: 8, height: 14, marginLeft: 9 }} ></Image>
                                    </View>
                                </TouchableWithoutFeedback>}

                                <FlatList keyExtractor={(item, index) => index.toString()} style={{ marginTop: 18 }} horizontal showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} data={this.state.restaurantsPlaceDatas}
                                    onEndReached={() => {
                                        (this.state.restaurantsTotal > this.state.restaurantsPlaceDatas.length) && this.setState({ isFetching: true, restaurantsOffset: this.state.restaurantsOffset + 8 }, () => { this._RestaurantsPlace(1) })

                                    }}
                                    // onEndReachedThreshold={0.5}
                                    renderItem={(obj) => {
                                        return (
                                            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('PlaceDetail', { placeNo: obj.item.place_no })}>
                                                <View style={{ width: 160, borderRadius: 4, marginLeft: (obj.index == 0 ? 0 : 12), }}>
                                                    <View>
                                                        <FastImage style={{ width: '100%', height: 160 * 1.3937, borderRadius: 4 }} source={{ uri: obj.item.representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                        <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7 }} onPress={() => this._Bookmark(2, obj.item.place_no)}>
                                                            <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Image source={User.placeSaved != null && User.placeSaved.includes(obj.item.place_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                                            </ImageBackground>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, }} numberOfLines={1} ellipsizeMode="tail">{obj.item.title}</Text>

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
                                        )
                                    }}></FlatList>

                                {this.state.repPlaceDatas.length > 0 && <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Main', { screen: I18n.t('contents'), params: { country: this.state.selectedCountryNo, city: this.state.selectedCityNo, region: this.state.selectedRegionNo, categories: [User.contentsCategory[3], User.contentsCategory[5], User.contentsCategory[7], User.contentsCategory[8]] } })}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 32 }}>
                                        <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: "Raleway-Bold", includeFontPadding: false }}>{this._TranslateSpecial((this.state.selectedRegion.length > 0 && this.state.selectedRegionNo != 0) ? this.state.selectedRegion : (this.state.selectedCity.length > 0 && this.state.selectedCityNo != 0) ? this.state.selectedCity : this.state.selectedCountry)}</Text>
                                        <Image source={imgRightArrow} style={{ width: 8, height: 14, marginLeft: 9 }} ></Image>
                                    </View>
                                </TouchableWithoutFeedback>}

                                <FlatList keyExtractor={(item, index) => index.toString()} style={{ marginTop: 18 }} horizontal showsHorizontalScrollIndicator={false} data={this.state.repPlaceDatas}
                                    onEndReached={() => {
                                        (this.state.repTotal > this.state.repPlaceDatas.length) && this.setState({ isFetching: true, repOffset: this.state.repOffset + 8 }, () => { this._RepPlace() })

                                    }}
                                    // onEndReachedThreshold={0.5}
                                    renderItem={(obj) => {
                                        return (
                                            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('PlaceDetail', { placeNo: obj.item.place_no })}>
                                                <View style={{ width: 160, borderRadius: 4, marginLeft: (obj.index == 0 ? 0 : 12), }}>
                                                    <View>
                                                        {obj.item.representative_file_url != null ? <FastImage style={{ width: '100%', height: 160 * 1.3937, borderRadius: 4 }} source={{ uri: obj.item.representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage> : <View style={{ width: '100%', height: 160 * 1.3937, borderRadius: 4, backgroundColor: Colors.colorF4F4F4 }}></View>}
                                                        <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7 }} onPress={() => this._Bookmark(2, obj.item.place_no)}>
                                                            <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Image source={User.placeSaved != null && User.placeSaved.includes(obj.item.place_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                                            </ImageBackground>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, }} numberOfLines={1} ellipsizeMode="tail">{obj.item.title}</Text>

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
                                        )
                                    }}></FlatList>

                                <View style={{ height: 0 }}></View>
                            </View>
                        </View>

                    </ScrollView>
                    {/* <Animated.View style={{ width: '100%', height: 48, paddingLeft: 16, paddingRight: 16, position: 'absolute', bottom: 20, shadowOpacity: 10, transform: [{ translateY: this.animated }] }}>
                        <View style={{
                            backgroundColor: Colors.colorFFFFFF, height: 48, width: '100%', shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 2,
                            elevation: 2,
                            borderRadius: 24,
                            alignItems: 'center',
                            justifyContent: 'center',

                        }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color046BCC }}>{I18n.t('savedToast')}</Text>
                        </View>
                    </Animated.View> */}

                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}