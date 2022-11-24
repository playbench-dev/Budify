import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, TouchableOpacity } from 'react-native'
import SelectDialog from '../Common/SelectDialog'
import Colors from '../Common/Colos'
import I18n from '../lang/i18n';
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import * as Utils from '../Common/Utils'
import Toast from 'react-native-toast-message'
import FetchingIndicator from 'react-native-fetching-indicator'
import * as NetworkCall from '../Common/NetworkCall'
import User from '../Common/User';
import ServerUrl from '../Common/ServerUrl'
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-community/async-storage';
import CategoriesDialog from '../Common/CategoriesDialog'
import Moment from 'moment'
import LanguageDialog from '../Common/LagnuageDialog';

const TAG = "ExperienceTabs";
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
const imgSearch = require('../../assets/ic_search.png');

const { width: screenWidth } = Dimensions.get('window');

export default class ExperienceTabs extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        specialExperienceDatas: [],
        selectDialogVisible: false,
        selectedPosition: 0,
        selectedConfirmPosition: 0,
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
        isFetching: true,
        offset: 0,
        selectedCountyPosition: -1,
        selectedCityPosition: -1,
        selectedRegionPosition: -1,
        selectedCountryNo: -1,
        selectedCityNo: -1,
        selectedRegionNo: -1,
        categoryDialogVisible: false,
        categorySelectedTextDatas: [],
        languageSelectedTextDatas: [],
        isRefreshing: false,
        searchText: '',
        totalCnt: 0,
    }
    componentWillReceiveProps() {
        console.log('componentWillReceiveProps')
        if (this.props.route.params != undefined) {
            console.log(TAG, this.props.route.params)
            if ((this.props.route.params.country != -1 && this.props.route.params.country != this.state.selectedCountryNo) ||
                (this.props.route.params.city != -1 && this.props.route.params.city != this.state.selectedCityNo) ||
                (this.props.route.params.region != -1 && this.props.route.params.region != this.state.selectedRegionNo)) {
                this.state.selectedCountryNo = this.props.route.params.country
                this.state.selectedCityNo = this.props.route.params.city
                this.state.selectedRegionNo = this.props.route.params.region
                this.state.selectedCountry = Utils.Grinder(User.country.filter((el) => el.country_no == this.props.route.params.country)[0])
                this.state.selectedCity = this.props.route.params.city == 0 ? Utils.Grinder({ ko: '전체', en: 'All', ja: '全国' }) : Utils.Grinder(User.city.filter((el) => el.city_no == this.props.route.params.city)[0])
                this.state.selectedRegion = this.props.route.params.region == 0 ? Utils.Grinder({ ko: '전체', en: 'All', ja: '全国' }) : Utils.Grinder(User.region.filter((el) => el.town_no == this.props.route.params.region)[0])
                this.state.specialExperienceDatas = [];
                this.state.totalCnt = 0;
                this.state.offset = 0;
                this._Experience()
            }
        }
    }

    componentDidMount() {
        // Moment.locale('ko')
        console.log('componentDidMount')
        AsyncStorage.getItem('firstRegion', (err, result) => {
            console.log(result)
            if (result != null) {
                const firstRegion = JSON.parse(result);
                this.state.selectedCountryNo = firstRegion.countryNo;
                this.state.selectedCityNo = firstRegion.cityNo;
                this.state.selectedRegionNo = firstRegion.regionNo;
                this.state.selectedCountry = Utils.Grinder(User.country.filter((el) => el.country_no == firstRegion.countryNo)[0]);
                this.state.selectedCity = firstRegion.cityNo == 0 ? Utils.Grinder({ ko: '전체', en: 'All', ja: '全国' }) : Utils.Grinder(User.city.filter((el) => el.city_no == firstRegion.cityNo)[0]);
                this.state.selectedRegion = firstRegion.regionNo == 0 ? Utils.Grinder({ ko: '전체', en: 'All', ja: '全国' }) : Utils.Grinder(User.region.filter((el) => el.town_no == firstRegion.regionNo)[0]);
                this._Experience()
            }
        })
    }

    _CallDialog() {
        if (this.state.selectDialogVisible) {
            let datas = [];
            let title = I18n.t('homeCountry');
            let type = this.state.selectedDialogType;

            if (type == '1') {
                title = I18n.t('homeCountry')
                datas = User.country
            }
            else if (type == '2') {
                title = I18n.t('homeCity')
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
        console.log(value)
        if (value.type == '4') {
            this.state.marked = value.marked
            this.state._markedDates = value._markedDates
            this.setState({
                selectDialogVisible: false,
                showSelectedScheduleDate: Moment(this.state._markedDates[0]).format('MMMM').substring(0, 3) + ' ' + Moment(this.state._markedDates[0]).format('D') + ' - ' + Moment(this.state._markedDates[this.state._markedDates.length - 1]).format('MMMM').substring(0, 3) + ' ' + Moment(this.state._markedDates[this.state._markedDates.length - 1]).format('D'),
                isFetching: true,
                specialExperienceDatas: [],
                totalCnt: 0,
                offset: 0,
            }, () => this._Experience());
        } else if (value.type == '3') {
            this.setState({
                selectDialogVisible: false,
                selectedRegion: value.no == 0 ? Utils.Grinder({ ko: '전체', en: 'All', ja: '全国' }) : Utils.Grinder(User.region.filter((el) => el.town_no == value.no)[0]),
                selectedRegionNo: value.no,
                selectedRegionPosition: value.selectedPosition,
                isFetching: true,
                specialExperienceDatas: [],
                totalCnt: 0,
                offset: 0,
            }, () => this._Experience());
            AsyncStorage.setItem('firstRegion', JSON.stringify({
                'countryNo': this.state.selectedCountryNo, 'cityNo': this.state.selectedCityNo, 'regionNo': value.no,
            }));
        } else if (value.type == '2') {
            this.regionDatas = [];
            this.setState({
                selectDialogVisible: false,
                selectedCity: value.no == 0 ? Utils.Grinder({ ko: '전체', en: 'All', ja: '全国' }) : Utils.Grinder(User.city.filter((el) => el.city_no == value.no)[0]),
                selectedRegion: '',
                selectedRegionPosition: -1,
                selectedRegionNo: -1,
                regionDatas: [],
                selectedCityNo: value.no,
                selectedCityPosition: value.selectedPosition,
                isFetching: true,
                specialExperienceDatas: [],
                totalCnt: 0,
                offset: 0,
            }, () => this._Experience());
            AsyncStorage.setItem('firstRegion', JSON.stringify({
                'countryNo': this.state.selectedCountryNo, 'cityNo': value.no, 'regionNo': -1,
            }));
        } else if (value.type == '1') {
            this.cityDatas = [];
            this.setState({
                selectDialogVisible: false,
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
                totalCnt: 0,
                offset: 0,
            }, () => this._Experience());
            AsyncStorage.setItem('firstRegion', JSON.stringify({
                'countryNo': value.no, 'cityNo': -1, 'regionNo': -1,
            }));
        } else if (value.type == '5') {
            this.setState({
                selectDialogVisible: false,
            });
        } else if (value.type == '6') {
            this.setState({
                categoryDialogVisible: false,
                categorySelectedTextDatas: value.selectedTextDatas,
                specialExperienceDatas: [],
                totalCnt: 0,
                offset: 0,
            }, () => this._Experience());

        } else if (value.type == '7') {
            this.setState({
                categoryDialogVisible: false,
                languageSelectedTextDatas: value.selectedTextDatas,
                specialExperienceDatas: [],
                totalCnt: 0,
                offset: 0,
            }, () => this._Experience());
        } else if (value.type == '10') {
            this.setState({
                categoryDialogVisible: false,
            });
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

    _CategoryDialog() {
        if (this.state.categoryDialogVisible) {
            let type = this.state.selectedDialogType;
            if (type == '6') {
                return <CategoriesDialog title={I18n.t('contentsCategories')} datas={User.category} type={type} click={this._ClickDialog} selectedTextDatas={this.state.categorySelectedTextDatas} ></CategoriesDialog>
            } else if (type == '7') {
                return <LanguageDialog title={I18n.t('contentsCategories')} datas={User.language} type={type} click={this._ClickDialog} selectedTextDatas={this.state.languageSelectedTextDatas} ></LanguageDialog>
            }
        }
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
                console.log(User.exSaved)
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

    async _Experience() {
        let categoriesList = [];
        this.state.categorySelectedTextDatas.map((item, index) => categoriesList.push(item.category_no))
        let languagesList = [];
        this.state.languageSelectedTextDatas.map((item, index) => languagesList.push(item.language_no))
        // this.state.specialExperienceDatas = [];
        const url = ServerUrl.SelectExperienceSchedule
        let formBody = {};
        if (this.state._markedDates.length > 0) {
            formBody = JSON.stringify({
                "start_dt": this.state._markedDates[0],
                "end_dt": Moment(this.state._markedDates[this.state._markedDates.length - 1], "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD'),
                "categoryList": JSON.stringify(categoriesList),
                "languageList": JSON.stringify(languagesList),
                "keyword": this.state.searchText,
                "conditions": [
                    {
                        "q": "page",
                        "limit": "10",
                        "offset": this.state.offset
                    }, {
                        "q": "order",
                        "f": "rate",
                        "o": "DESC"
                    },
                    {
                        "q": "=",
                        "f": (this.state.selectedRegion.length != 0 && this.state.selectedRegionNo != 0) ? 'town' : (this.state.selectedCity.length != 0 && this.state.selectedCityNo != 0) ? 'city' : 'country',
                        // "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
                        "v": (this.state.selectedRegion.length != 0 && this.state.selectedRegionNo != 0) ? this.state.selectedRegionNo : (this.state.selectedCity.length != 0 && this.state.selectedCityNo != 0) ? this.state.selectedCityNo : this.state.selectedCountryNo
                    }
                ]
            })
        } else {
            formBody = JSON.stringify({
                "categoryList": JSON.stringify(categoriesList),
                "languageList": JSON.stringify(languagesList),
                "keyword": this.state.searchText,
                "conditions": [
                    {
                        "q": "page",
                        "limit": "10",
                        "offset": this.state.offset,
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
                    FastImage.preload([{ uri: ServerUrl.Server + representativeItem[i], headers: { Authorization: 'authToken' }, }])
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
        this.setState({
            isFetching: false,
            isRefreshing: false,
            totalCnt: json.total,
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

        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    {this._CallDialog()}
                    {this._CategoryDialog()}
                    <FlatList
                        showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
                        onRefresh={() => this.setState({ isRefreshing: true, offset: 0, specialExperienceDatas: [], }, () => this._Experience())}
                        refreshing={this.state.isRefreshing}
                        ListHeaderComponent={
                            <View>
                                <View style={{ paddingLeft: 16, justifyContent: 'center', paddingTop: 11, marginBottom: 16 }}>
                                    <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('experiences')}</Text>
                                </View>
                                <View style={{ padding: 16, backgroundColor: Colors.colorE9F4FF }}>
                                    <View style={{ flexDirection: 'row', backgroundColor: Colors.colorFFFFFF, borderWidth: 1, borderColor: Colors.colorBFBFBF, borderRadius: 4, height: 40 }}>
                                        <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: '1' })}>
                                            <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center', }}>
                                                <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('homeCountry')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedCountry}</TextInput>
                                                <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                            </View>
                                        </TouchableWithoutFeedback >
                                        <View style={{ width: 1, backgroundColor: Colors.colorBFBFBF }}></View>
                                        <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: '2' })}>
                                            <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center' }}>
                                                <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} placeholder={I18n.t('homeCity')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedCity}</TextInput>
                                                <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        <View style={{ width: 1, backgroundColor: Colors.colorBFBFBF }}></View>
                                        <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: '3' })}>
                                            <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center' }}>
                                                <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} placeholder={I18n.t('homeRegion')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedRegion}</TextInput>
                                                <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>

                                    <View style={{ marginTop: 12, backgroundColor: Colors.colorFFFFFF, borderWidth: 1, borderColor: Colors.colorBFBFBF, borderRadius: 4, height: 40, flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 10 }}>
                                        <TextInput onSubmitEditing={() => this.setState({ specialExperienceDatas: [], isFetching: true }, () => this._Experience())} style={{ flex: 1, fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginLeft: 0, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('savedSearch')} onChangeText={(text) => this.setState({ searchText: text })} placeholderTextColor={Colors.colorB7B7B7}></TextInput>
                                        <Image source={imgSearch} style={{ width: 15, height: 15, resizeMode: 'contain', marginRight: 8 }}></Image>
                                    </View>
                                </View>

                                <View style={{ marginTop: 16, marginLeft: 16, marginRight: 16, flexDirection: 'row', marginBottom: 8 }}>
                                    <TouchableOpacity style={{ flex: 1, }} onPress={() => this.setState({ categoryDialogVisible: true, selectedDialogType: '6' })}>
                                        <View style={{ flex: 1, borderRadius: 40, borderWidth: 1, borderColor: this.state.categorySelectedTextDatas.length > 0 ? Colors.color046BCC : Colors.colorBABABA, backgroundColor: this.state.categorySelectedTextDatas.length > 0 ? 'rgba(154, 206, 255, 0.22)' : Colors.colorFFFFFF, paddingBottom: 8, paddingTop: 7, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ color: this.state.categorySelectedTextDatas.length > 0 ? Colors.color2D7DC8 : Colors.color000000, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('contentsCategories') + (this.state.categorySelectedTextDatas.length > 0 ? ' (' + this.state.categorySelectedTextDatas.length + ')' : '')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ flex: 1, }} onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: '4' })}>
                                        <View style={{ borderRadius: 40, borderWidth: 1, borderColor: this.state.showSelectedScheduleDate.length > 0 ? Colors.color046BCC : Colors.colorBABABA, backgroundColor: this.state.showSelectedScheduleDate.length > 0 ? 'rgba(154, 206, 255, 0.22)' : Colors.colorFFFFFF, paddingBottom: 8, paddingTop: 7, alignItems: 'center', justifyContent: 'center', marginLeft: 11 }}>
                                            <Text style={{ color: this.state.showSelectedScheduleDate.length > 0 ? Colors.color2D7DC8 : Colors.color000000, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{this.state.showSelectedScheduleDate.length == 0 ? I18n.t('contentsDate') : this.state.showSelectedScheduleDate}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ flex: 1, }} onPress={() => this.setState({ categoryDialogVisible: true, selectedDialogType: '7' })}>
                                        <View style={{ borderRadius: 40, borderWidth: 1, borderColor: this.state.languageSelectedTextDatas.length > 0 ? Colors.color046BCC : Colors.colorBABABA, backgroundColor: this.state.languageSelectedTextDatas.length > 0 ? 'rgba(154, 206, 255, 0.22)' : Colors.colorFFFFFF, paddingBottom: 8, paddingTop: 7, alignItems: 'center', justifyContent: 'center', marginLeft: 11 }}>
                                            <Text style={{ color: this.state.languageSelectedTextDatas.length > 0 ? Colors.color2D7DC8 : Colors.color000000, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('experienceLanguage') + (this.state.languageSelectedTextDatas.length > 0 ? ' (' + this.state.languageSelectedTextDatas.length + ')' : '')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }
                        data={this.state.specialExperienceDatas}
                        keyExtractor={(item, index) => index.toString()}
                        onEndReached={() => this.state.totalCnt > this.state.specialExperienceDatas.length && this.setState({ isFetching: true, offset: this.state.offset + 10 }, () => { this._Experience() })}
                        onEndReachedThreshold={0.5}
                        renderItem={(obj) => {
                            return (
                                <View key={obj.index} style={{ paddingLeft: 16, marginTop: 8, marginBottom: 8 }}>
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
                        numColumns={2}
                    >
                    </FlatList>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}