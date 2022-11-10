import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, Animated, TextInput, } from 'react-native'
import SelectDialog from '../Common/SelectDialog'
import TimeDialog from '../Common/TimeDialog'
import Colors from '../Common/Colos'
import I18n from '../lang/i18n';
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import * as Utils from '../Common/Utils'
import Orientation from 'react-native-orientation'
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-community/async-storage';
import User from '../Common/User';
import FastImage from 'react-native-fast-image';
import ServerUrl from '../Common/ServerUrl'
import CategoriesDialog from '../Common/CategoriesDialog'
import CurationCategoriesDialog from '../Common/CategoriesDialog'
import Moment from 'moment'
import LanguageDialog from '../Common/LagnuageDialog';
import * as NetworkCall from '../Common/NetworkCall'
import FetchingIndicator from 'react-native-fetching-indicator'

const TAG = "ContentsTabs";
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

export default class ContentsTabs extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        active: 0,
        xTabOne: 0, //x co-ordinate of tab one
        xTabTwo: 0, //x co-ordinate of tab two
        translateX: new Animated.Value(0),
        translateXTabOne: new Animated.Value(0),
        translateXTabTwo: new Animated.Value(screenWidth),
        translateY: -1000,
        screenWidth: screenWidth,
        trendingDatas: [],
        morePlaceDatas: [],
        orientationType: 'portrait',
        categoryDialogVisible: false,
        categorySelectedTextDatas: [],
        curationCategoryDialogVisible: false,
        curationCategorySelectedTextDatas: [],
        languageSelectedTextDatas: [],
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
        isRefreshing: false,
        searchText: '',
        curationSearchText: '',
        curationDatas: [],
        curationOffset: 0,
        trendingOffset: 0,
        moreOffset: 0,
        moreTotal: 0,
        trendingTotal: 0,
        curationTotal: 0,
    }

    componentWillReceiveProps() {
        this.setState({
            selectedCountryNo: this.props.route.params.country,
            selectedCityNo: this.props.route.params.city,
            selectedRegionNo: this.props.route.params.region,
            selectedCountry: this.props.route.params.country != -1 && Utils.Grinder(User.country.filter((el) => el.country_no == this.props.route.params.country)[0]),
            selectedCity: this.props.route.params.city != -1 && Utils.Grinder(User.city.filter((el) => el.city_no == this.props.route.params.city)[0]),
            selectedRegion: this.props.route.params.region != -1 && Utils.Grinder(User.region.filter((el) => el.town_no == this.props.route.params.region)[0]),
            categorySelectedTextDatas: this.props.route.params.categories,
            trendingDatas: [],
            morePlaceDatas: [],
            curationDatas: [],
            trendingOffset: 0,
            trendingTotal: 0,
            moreOffset: 0,
            moreTotal: 0,
            curationOffset: 0,
            curationTotal: 0,
            isFetching: true,
        }, () => this._ContentsTrandingPlace())
    }

    componentDidMount() {
        AsyncStorage.getItem('firstRegion', (err, result) => {
            if (result != null) {
                const firstRegion = JSON.parse(result);
                this.state.selectedCountryNo = firstRegion.countryNo
                this.state.selectedCityNo = firstRegion.cityNo || -1
                this.state.selectedRegionNo = firstRegion.regionNo || -1
                this.state.selectedCountry = Utils.Grinder(User.country.filter((el) => el.country_no == firstRegion.countryNo)[0])
                this.state.selectedCity = Utils.Grinder(User.city.filter((el) => el.city_no == firstRegion.cityNo)[0])
                this.state.selectedRegion = Utils.Grinder(User.region.filter((el) => el.town_no == firstRegion.regionNo)[0])
                this._ContentsTrandingPlace()
            }
        })
    }

    _MakeStar(value, reviewCnt) {
        let result = [];
        if (reviewCnt == 0) {
            result = result.concat(
                <Text key={0} style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, }}>{I18n.t('homeNewExperience')}</Text>
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
                datas = User.city.filter((value) => value.country_no == this.state.selectedCountryNo)
            }
            else if (type == '3' && this.state.selectedCityNo != -1) {
                title = I18n.t('homeRegion')
                datas = User.region.filter((value) => value.city_no == this.state.selectedCityNo)
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
                showSelectedScheduleDate: this.state._markedDates.length == 0 ? [] : Moment(this.state._markedDates[0]).format('MMMM').substring(0, 3) + ' ' + Moment(this.state._markedDates[0]).format('D') + ' - ' + Moment(this.state._markedDates[this.state._markedDates.length - 1]).format('MMMM').substring(0, 3) + ' ' + Moment(this.state._markedDates[this.state._markedDates.length - 1]).format('D'),
                trendingDatas: [],
                morePlaceDatas: [],
                curationDatas: [],
                curationOffset: 0,
                curationTotal: 0,
                trendingTotal: 0,
                trendingOffset: 0,
                moreTotal: 0,
                moreOffset: 0,
                isFetching: true,
            }, () => this._ContentsTrandingPlace());
        } else if (value.type == '3') {
            this.setState({
                selectDialogVisible: false,
                selectedRegion: Utils.Grinder(User.region.filter((el) => el.town_no == value.no)[0]),
                selectedRegionNo: value.no,
                selectedRegionPosition: value.selectedPosition,
                trendingDatas: [],
                morePlaceDatas: [],
                curationDatas: [],
                curationOffset: 0,
                curationTotal: 0,
                trendingTotal: 0,
                trendingOffset: 0,
                moreTotal: 0,
                moreOffset: 0,
                isFetching: true,
            }, () => {
                this._ContentsTrandingPlace()
                this._ContentsCuration()
            });
        } else if (value.type == '2') {
            this.regionDatas = [];
            this.setState({
                selectDialogVisible: false,
                selectedCity: Utils.Grinder(User.city.filter((el) => el.city_no == value.no)[0]),
                selectedRegion: '',
                selectedRegionPosition: -1,
                selectedRegionNo: -1,
                regionDatas: [],
                selectedCityNo: value.no,
                selectedCityPosition: value.selectedPosition,
                trendingDatas: [],
                morePlaceDatas: [],
                curationDatas: [],
                curationOffset: 0,
                curationTotal: 0,
                trendingTotal: 0,
                trendingOffset: 0,
                moreTotal: 0,
                moreOffset: 0,
                isFetching: true,
            }, () => {
                this._ContentsTrandingPlace()
                this._ContentsCuration()
            });
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
                trendingDatas: [],
                morePlaceDatas: [],
                curationDatas: [],
                curationOffset: 0,
                curationTotal: 0,
                trendingTotal: 0,
                trendingOffset: 0,
                moreTotal: 0,
                moreOffset: 0,
                isFetching: true,
            }, () => {
                this._ContentsTrandingPlace()
                this._ContentsCuration()
            });
        } else if (value.type == '5') {
            this.setState({
                selectDialogVisible: false,
            });
        } else if (value.type == '6') {
            this.setState({
                categoryDialogVisible: false,
                categorySelectedTextDatas: value.selectedTextDatas,
                trendingDatas: [],
                morePlaceDatas: [],
                trendingTotal: 0,
                trendingOffset: 0,
                moreTotal: 0,
                moreOffset: 0,
                isFetching: true,
            }, () => this._ContentsTrandingPlace());
        } else if (value.type == '7') {
            this.setState({
                categoryDialogVisible: false,
                languageSelectedTextDatas: value.selectedTextDatas.sort((a, b) => a.no - b.no),
                trendingDatas: [],
                morePlaceDatas: [],
                trendingTotal: 0,
                trendingOffset: 0,
                moreTotal: 0,
                moreOffset: 0,
                isFetching: true,
            }, () => this._ContentsTrandingPlace());
        } else if (value.type == '8') {
            this.setState({
                categoryDialogVisible: false,
                curationCategorySelectedTextDatas: value.selectedTextDatas,
                isFetching: true,
                curationDatas: [],
                curationOffset: 0,
                curationTotal: 0,
            }, () => this._ContentsCuration());
        } else if (value.type == '10') {
            this.setState({
                categoryDialogVisible: false,
            });
        }
    }

    _CategoryDialog() {
        if (this.state.categoryDialogVisible) {
            console.log(this.state.categorySelectedTextDatas)
            let type = this.state.selectedDialogType;
            if (type == '6') {
                return <CategoriesDialog title={I18n.t('contentsCategories')} datas={User.contentsCategory} type={type} click={this._ClickDialog} selectedTextDatas={this.state.categorySelectedTextDatas} ></CategoriesDialog>
            } else if (type == '7') {
                return <TimeDialog title={I18n.t('contentsTime')} datas={Utils.TimeCategorys()} type={type} click={this._ClickDialog} selectedTextDatas={this.state.languageSelectedTextDatas} ></TimeDialog>
            } else if (type == '8') {
                return <CurationCategoriesDialog title={I18n.t('contentsCategories')} datas={User.contentsCategory} type={type} click={this._ClickDialog} selectedTextDatas={this.state.curationCategorySelectedTextDatas} ></CurationCategoriesDialog>
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

    async _ContentsTrandingPlace() {
        // if (User.level == 99) {
        const url = ServerUrl.SearchContentsPlace
        const timeSelected = this.state.languageSelectedTextDatas.map(
            el => el.no === el.no ? { start: el.start, end: el.end } : el
        )
        let formBody = {};
        let categoriesList = [];
        this.state.categorySelectedTextDatas.map((item, index) => categoriesList.push(item.category_no))
        const condition = [{
            "q": "=",
            "f": this.state.selectedRegion.length != 0 ? 'town' : this.state.selectedCity.length != 0 ? 'city' : 'country',
            "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
        }, {
            "op": "AND",
            "q": "order",
            "f": "e_dt",
            "o": "ASC"
        }, {
            "op": "AND",
            "q": "=",
            "f": "status",
            "v": 1
        }]
        if (this.state._markedDates.length > 0) {
            if (timeSelected.length > 0) {
                if (categoriesList.length == 0) {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.trendingOffset,
                        "start_dt": this.state._markedDates[0],
                        "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                        "timezone": timeSelected,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.trendingOffset,
                        "start_dt": this.state._markedDates[0],
                        "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                        "categories": categoriesList.length == 0 ? null : categoriesList,
                        "timezone": timeSelected,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                }
            } else {
                if (categoriesList.length == 0) {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.trendingOffset,
                        "start_dt": this.state._markedDates[0],
                        "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.trendingOffset,
                        "start_dt": this.state._markedDates[0],
                        "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                        "categories": categoriesList.length == 0 ? null : categoriesList,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                }
            }
        } else {
            if (timeSelected.length > 0) {
                if (categoriesList.length == 0) {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.trendingOffset,
                        "timezone": timeSelected,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.trendingOffset,
                        "categories": categoriesList.length == 0 ? null : categoriesList,
                        "timezone": timeSelected,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                }
            } else {
                if (categoriesList.length == 0) {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.trendingOffset,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.trendingOffset,
                        "categories": categoriesList.length == 0 ? null : categoriesList,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                }
            }
        }
        const json = await NetworkCall.Select(url, formBody)

        if (json.list.length > 0) {
            this.state.trendingTotal = json.total;
            for (let i = 0; i < json.list.length; i++) {
                if (json.list[i].image_representative != null) {
                    const obj = {
                        title: Utils.GrinderContents(JSON.parse(json.list[i].place_name.replace(/&#039;/gi, '\'').replace(/&quot;/gi, '\"'))),
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
                    this.state.trendingDatas.push(obj)
                }
            }
            if (this.state.moreTotal == 0) {
                this._ContentsMorePlace()
            } else {
                this.setState({
                    isFetching: false,
                    isRefreshing: false,
                })
            }
        } else {
            this.setState({
                isFetching: false,
                isRefreshing: false,
            })
        }
    }

    async _ContentsMorePlace() {
        // if (User.level == 99) {
        const url = ServerUrl.SearchContentsPlace
        const timeSelected = this.state.languageSelectedTextDatas.map(
            el => el.no === el.no ? { start: el.start, end: el.end } : el
        )
        let formBody = {};
        let categoriesList = [];
        this.state.categorySelectedTextDatas.map((item, index) => categoriesList.push(item.category_no))

        const condition = [{
            "q": "=",
            "f": this.state.selectedRegion.length != 0 ? 'town' : this.state.selectedCity.length != 0 ? 'city' : 'country',
            "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
        }, {
            "op": "AND",
            "q": "order",
            "f": "e_dt",
            "o": "ASC"
        }, {
            "op": "AND",
            "q": "=",
            "f": "status",
            "v": 1
        }]

        if (this.state._markedDates.length > 0) {
            if (timeSelected.length > 0) {
                if (categoriesList.length == 0) {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.moreOffset,
                        "start_dt": this.state._markedDates[0],
                        "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                        "timezone": timeSelected,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.moreOffset,
                        "start_dt": this.state._markedDates[0],
                        "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                        "categories": categoriesList.length == 0 ? null : categoriesList,
                        "timezone": timeSelected,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                }
            } else {
                if (categoriesList.length == 0) {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.moreOffset,
                        "start_dt": this.state._markedDates[0],
                        "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.moreOffset,
                        "start_dt": this.state._markedDates[0],
                        "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                        "categories": categoriesList.length == 0 ? null : categoriesList,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                }
            }
        } else {
            if (timeSelected.length > 0) {
                if (categoriesList.length == 0) {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.moreOffset,
                        "timezone": timeSelected,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.moreOffset,
                        "categories": categoriesList.length == 0 ? null : categoriesList,
                        "timezone": timeSelected,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                }
            } else {
                if (categoriesList.length == 0) {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.moreOffset,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.moreOffset,
                        "categories": categoriesList.length == 0 ? null : categoriesList,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                }
            }
        }
        const json = await NetworkCall.Select(url, formBody)
        for (let i = 0; i < json.list.length; i++) {
            if (json.list[i].image_representative != null) {
                const obj = {
                    title: Utils.GrinderContents(JSON.parse(json.list[i].place_name.replace(/&#039;/gi, '\'').replace(/&quot;/gi, '\"'))),
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
                this.state.morePlaceDatas.push(obj)
            }
        }
        this.setState({
            isFetching: false,
            isRefreshing: false,
            moreTotal: json.total
        })
    }

    async _ContentsCuration() {
        // if (User.level == 99) {
        const url = ServerUrl.SearchCurations
        let formBody = {};
        let categoriesList = [];
        this.state.curationCategorySelectedTextDatas.map((item, index) => categoriesList.push(item.category_no))

        if (categoriesList.length == 0) {
            formBody = JSON.stringify({
                "keyword": this.state.curationSearchText,
                "conditions": [
                    {
                        "op": "AND",
                        "q": "=",
                        "f": this.state.selectedRegion.length != 0 ? 'town' : this.state.selectedCity.length != 0 ? 'city' : 'country',
                        "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
                    },
                    {
                        "op": "AND",
                        "q": "=",
                        "f": "status",
                        "v": 1
                    }, {
                        "op": "AND",
                        "q": "page",
                        "limit": 8,
                        "offset": this.state.curationOffset,
                    }
                ]
            })
        } else {
            formBody = JSON.stringify({
                "keyword": this.state.curationSearchText,
                "categories": categoriesList.length == 0 ? null : categoriesList,
                "conditions": [
                    {
                        "op": "AND",
                        "q": "=",
                        "f": this.state.selectedRegion.length != 0 ? 'town' : this.state.selectedCity.length != 0 ? 'city' : 'country',
                        "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
                    },
                    {
                        "op": "AND",
                        "q": "=",
                        "f": "status",
                        "v": 1
                    }, {
                        "op": "AND",
                        "q": "page",
                        "limit": 8,
                        "offset": this.state.curationOffset
                    }
                ]
            })
        }
        const json = await NetworkCall.Select(url, formBody)

        for (let i = 0; i < json.list.length; i++) {
            const obj = {
                curationNo: json.list[i].curations_no,
                title: JSON.parse(json.list[i].title),
                town: json.list[i].town,
                city: json.list[i].city,
                country: json.list[i].country,
                category: JSON.parse(json.list[i].categories.replace(/'/gi, '')),
                refImage: JSON.parse(json.list[i].curations_image_representative) != null ? JSON.parse(json.list[i].curations_image_representative) : [],
            }
            this.state.curationDatas.push(obj)
        }
        this.setState({
            isFetching: false,
            isRefreshing: false,
            curationTotal: json.total,
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
        if (User.exSaved == undefined) {
            User.exSaved = [];
            User.placeSaved = [];
        }
        console.log(User.placeSaved)
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    {this._CallDialog()}
                    {this._CategoryDialog()}
                    <View style={{ paddingLeft: 16, justifyContent: 'center', paddingTop: 11 }}>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('contentsTitle')}</Text>
                    </View>

                    <View style={{ marginTop: 24, height: 1, backgroundColor: Colors.color2D7DC8 }}></View>

                    <View style={{ width: "100%", }}>
                        <View style={{ marginTop: 0, height: 46, }}>
                            <View style={{ width: '100%', height: 8, flexDirection: "row" }}>
                                <View style={{ flex: 1, backgroundColor: Colors.color2D7DC8, opacity: this.state.active == 0 ? 1 : 0 }}></View>
                                <View style={{ flex: 1, backgroundColor: Colors.color2D7DC8, opacity: this.state.active == 1 ? 1 : 0 }}></View>
                            </View>
                            <View style={{ flexDirection: "row", height: 38 }}>
                                <TouchableOpacity style={{ flex: 1, justifyContent: "center", alignItems: "center", }} onPress={() => this.setState({ active: 0, xTabOne: 0 })}>
                                    <Text style={{ fontSize: 15, color: (this.state.active == 0 ? Colors.color2D7DC8 : Colors.color5B5B5B), fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('contentsTabPlaces')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flex: 1, justifyContent: "center", alignItems: "center", }} onPress={() => this.setState({ active: 1, xTabTwo: screenWidth / 2, }, () => this.state.curationDatas.length == 0 && this._ContentsCuration())}>
                                    <Text style={{ fontSize: 15, color: (this.state.active == 1 ? Colors.color2D7DC8 : Colors.color5B5B5B), fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('contentsTabCurations')}</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                    {this.state.active == 0 ? (
                        <View style={{ justifyContent: "center", alignItems: "center", }}>
                            <FlatList key={'_'} keyExtractor={(item, index) => '_' + index.toString()} style={{ width: '100%' }} numColumns={2} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} data={this.state.morePlaceDatas}
                                onRefresh={() => this.setState({ isRefreshing: true, trendingTotal: 0, trendingOffset: 0, moreTotal: 0, moreOffset: 0, morePlaceDatas: [], trendingDatas: [], }, () => this._ContentsTrandingPlace())}
                                refreshing={this.state.isRefreshing}
                                ListHeaderComponent={
                                    <View style={{ width: '100%' }}>
                                        <View style={{ width: '100%', padding: 16, backgroundColor: Colors.colorE9F4FF }}>
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
                                                <TextInput onSubmitEditing={() => this.setState({ isFetching: true, trendingDatas: [], morePlaceDatas: [], trendingOffset: 0, trendingTotal: 0, moreOffset: 0, moreTotal: 0 }, () => this._ContentsTrandingPlace())} style={{ flex: 1, fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginLeft: 8, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('savedSearch')} placeholderTextColor={Colors.colorB7B7B7} onChangeText={(text) => this.setState({ searchText: text })}></TextInput>
                                                <Image source={imgSearch} style={{ width: 15, height: 15, resizeMode: 'contain', marginRight: 8 }}></Image>
                                            </View>
                                        </View>

                                        <View style={{ marginTop: 12, marginBottom: 12, marginLeft: 16, marginRight: 16, flexDirection: 'row' }}>
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

                                            <TouchableOpacity style={{ flex: 1, }} onPress={() => this.setState({ categoryDialogVisible: true, selectedDialogType: '7' })} >
                                                <View style={{ borderRadius: 40, borderWidth: 1, borderColor: this.state.languageSelectedTextDatas.length > 0 ? Colors.color046BCC : Colors.colorBABABA, backgroundColor: this.state.languageSelectedTextDatas.length > 0 ? 'rgba(154, 206, 255, 0.22)' : Colors.colorFFFFFF, paddingBottom: 8, paddingTop: 7, alignItems: 'center', justifyContent: 'center', marginLeft: 11, }}>
                                                    <Text style={{ color: this.state.languageSelectedTextDatas.length > 0 ? Colors.color2D7DC8 : Colors.color000000, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('contentsTime') + (this.state.languageSelectedTextDatas.length > 0 ? ' (' + this.state.languageSelectedTextDatas.length + ')' : '')}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ paddingLeft: 16, paddingRight: 16, }}>
                                            {/* {this.state.trendingDatas.length > 0 ? ( */}
                                            <View>
                                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, }}>{I18n.t('contentsTrending')}</Text>
                                                <FlatList keyExtractor={(item, index) => index.toString()} style={{ marginTop: 12 }} horizontal showsHorizontalScrollIndicator={false} data={this.state.trendingDatas}
                                                    onEndReached={() => (this.state.trendingTotal > this.state.trendingDatas.length) && this.setState({ isFetching: true, trendingOffset: this.state.trendingOffset + 12 }, () => { this._ContentsTrandingPlace() })}
                                                    // onEndReachedThreshold={0.5}
                                                    renderItem={(obj) => {
                                                        return (
                                                            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('PlaceDetail', { placeNo: obj.item.place_no })}>
                                                                <View style={{ width: 155, borderRadius: 4, marginLeft: (obj.index == 0 ? 0 : 12), }}>
                                                                    <View>
                                                                        <FastImage style={{ width: '100%', height: 155 * 1.3937, borderRadius: 4 }} source={{ uri: obj.item.representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                        <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7 }}>
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
                                                    }}>

                                                </FlatList>

                                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, marginTop: 28 }}>{I18n.t('contentsMorePlace')}</Text>
                                            </View>
                                            {/* ) : (
                                                <View style={{ width: '100%', height: 300, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color2D7DC8, }}>{"Coming Soon"}</Text>
                                                    <Text style={{ fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, marginTop: 12 }}>{"Budify is coming soon to this area.\nPlease search for another region."}</Text>
                                                </View>
                                            )} */}
                                        </View>
                                    </View>
                                }
                                onEndReached={() => (this.state.moreTotal > this.state.morePlaceDatas.length) && this.setState({ isFetching: true, moreOffset: this.state.moreOffset + 12 }, () => { this._ContentsMorePlace() })}
                                // onEndReachedThreshold={0.5}
                                renderItem={(obj) => {
                                    return (
                                        <View key={obj.index} style={{ paddingLeft: 16, marginTop: 8, marginBottom: 8 }}>
                                            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('PlaceDetail', { placeNo: obj.item.place_no })}>
                                                <View style={{ width: (screenWidth - 46) / 2, borderRadius: 4, marginLeft: 0, }}>
                                                    <FastImage style={{ width: '100%', height: ((screenWidth - 46) / 2) * 1.3953, borderRadius: 4 }} source={{ uri: obj.item.representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                    <TouchableOpacity style={{ position: 'absolute', top: 8, right: 7, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._Bookmark(2, obj.item.place_no)}>
                                                        <ImageBackground source={imgCircleSaveBg} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                                            <Image source={User.placeSaved != null && User.placeSaved.includes(obj.item.place_no) == true ? imgBookmarkBlack : imgBookmark} style={{ width: 12, height: 15, tintColor: Colors.colorFFFFFF }}></Image>
                                                        </ImageBackground>
                                                    </TouchableOpacity>

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
                                        </View>
                                    )
                                }} ListFooterComponent={
                                    <View style={{ height: 120 }}></View>
                                }>

                            </FlatList>


                        </View>
                    ) : (
                        <View style={{ justifyContent: "center", alignItems: "center", }}>
                            <FlatList key={'#'} keyExtractor={(item, index) => '#' + index.toString()} style={{ width: '100%' }} numColumns={1} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} data={this.state.curationDatas}
                                onRefresh={() => this.setState({ isRefreshing: true, curationDatas: [], curationOffset: 0, curationTotal: 0 }, () => this._ContentsCuration())}
                                refreshing={this.state.isRefreshing}
                                onEndReached={() => this.state.curationTotal > this.state.curationDatas.length && this.setState({ isFetching: true, curationOffset: this.state.moreOffset + 8 }, () => { this._ContentsCuration() })}
                                // onEndReachedThreshold={0.5}
                                ListHeaderComponent={
                                    <View style={{ width: '100%' }}>
                                        <View style={{ width: '100%', padding: 16, backgroundColor: Colors.colorE9F4FF }}>
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
                                                <TextInput onSubmitEditing={() => this.setState({ isFetching: true, curationDatas: [], curationOffset: 0, curationTotal: 0, }, () => this._ContentsCuration())} style={{ flex: 1, fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginLeft: 8, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('savedSearch')} placeholderTextColor={Colors.colorB7B7B7} onChangeText={(text) => this.setState({ curationSearchText: text })}></TextInput>
                                                <Image source={imgSearch} style={{ width: 15, height: 15, resizeMode: 'contain', marginRight: 8 }}></Image>
                                            </View>
                                        </View>

                                        <View style={{ marginTop: 12, marginBottom: 12, marginLeft: 16, marginRight: 16, flexDirection: 'row' }}>
                                            <TouchableOpacity style={{ flex: 1, }} onPress={() => this.setState({ categoryDialogVisible: true, selectedDialogType: '8' })}>
                                                <View style={{ flex: 1, borderRadius: 40, borderWidth: 1, borderColor: this.state.curationCategorySelectedTextDatas.length > 0 ? Colors.color046BCC : Colors.colorBABABA, backgroundColor: this.state.curationCategorySelectedTextDatas.length > 0 ? 'rgba(154, 206, 255, 0.22)' : Colors.colorFFFFFF, paddingBottom: 8, paddingTop: 7, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ color: this.state.curationCategorySelectedTextDatas.length > 0 ? Colors.color2D7DC8 : Colors.color000000, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('contentsCategories') + (this.state.curationCategorySelectedTextDatas.length > 0 ? ' (' + this.state.curationCategorySelectedTextDatas.length + ')' : '')}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>

                                        {this.state.curationDatas.length == 0 && (
                                            <View style={{ width: '100%', height: 300, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color2D7DC8, }}>{"Coming Soon"}</Text>
                                                <Text style={{ fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, marginTop: 12 }}>{"Budify is coming soon to this area.\nPlease search for another region."}</Text>
                                            </View>
                                        )}
                                    </View>
                                } renderItem={(obj) => {
                                    return (
                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('CurationDetail', { curationNo: obj.item.curationNo })}>
                                            <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 12 }}>
                                                <FastImage style={{ width: '100%', height: (screenWidth) * 1.2290, borderRadius: 4 }} source={{ uri: ServerUrl.Server + obj.item.refImage, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                <Text style={{ position: "absolute", bottom: 24, fontSize: 25, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF, marginLeft: 43, marginRight: 43 }}>{Utils.GrinderContents(obj.item.title)}</Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    )
                                }} ListFooterComponent={
                                    <View style={{ height: 120 }}></View>
                                }></FlatList>
                        </View>
                    )}
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}