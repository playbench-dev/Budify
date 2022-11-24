import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, Animated, TextInput, PermissionsAndroid, ScrollView, Platform } from 'react-native'
import SelectDialog from '../../Common/SelectDialog'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import * as NetworkCall from '../../Common/NetworkCall'
import * as Utils from '../../Common/Utils'
import Orientation from 'react-native-orientation'
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-community/async-storage';
import User from '../../Common/User';
import FastImage from 'react-native-fast-image';
import ServerUrl from '../../Common/ServerUrl'
import CategoriesDialog from '../../Common/CategoriesDialog'
import CurationCategoriesDialog from '../../Common/CategoriesDialog'
import Moment from 'moment'
import LanguageDialog from '../../Common/LagnuageDialog';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import ImageEditor from "@react-native-community/image-editor";
import { KeyboardAwareScrollView, KeyboardAwareSectionList, KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import RNFetchBlob from "rn-fetch-blob";
import SelectDropdown from 'react-native-select-dropdown'
import DatePicker from 'react-native-date-picker'
import FetchingIndicator from 'react-native-fetching-indicator'
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';

const TAG = "ContentsInsert";
const imgPlus = require('../../../assets/ic_plus.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgBack = require('../../../assets/ic_back.png');
const imgLocation = require('../../../assets/ic_location.png');
const imgCamera = require('../../../assets/ic_review_camera.png');
const imgCheckOn = require('../../../assets/ic_check_on.png')
const imgCheckOff = require('../../../assets/ic_check_off.png')
const imgRejected = require('../../../assets/ic_rejected.png')
const imgDelete = require('../../../assets/ic_delete.png');
const imgClose = require('../../../assets/ic_close.png')

const { width: screenWidth } = Dimensions.get('window');
const fs = RNFetchBlob.fs;
let imagePath = null;

export default class ContentsInsert extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        Geocoder.init("AIzaSyCePbzWSXlyg8wUqrB0yvWPOLzq0maVfdI");
    }

    state = {
        screenWidth: screenWidth,
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
        isFetching: false,
        offset: 0,
        selectedCountyPosition: -1,
        selectedCityPosition: -1,
        selectedRegionPosition: -1,
        selectedCountryNo: -1,
        selectedCityNo: -1,
        selectedRegionNo: -1,
        datas: ['', '', ''],
        placeDatas: [{ 'no': 0, 'language': 'default', 'place': '' }],
        placeInfoSingleLineDatas: [{ 'no': 0, 'language': 'default', 'placeInfo': '' }],
        placeInfoDatas: [{ 'no': 0, 'language': 'default', 'placeInfo': '' }],
        lat: 37.564214,
        lng: 127.001699,
        mapSearchText: '',
        placeTimeDatas: [{ 'day': I18n.t('managerContentsInsertMon'), 'bTime': '', 'aTime': '' }, { 'day': I18n.t('managerContentsInsertTue'), 'bTime': '', 'aTime': '' }, { 'day': I18n.t('managerContentsInsertWed'), 'bTime': '', 'aTime': '' }, { 'day': I18n.t('managerContentsInsertThu'), 'bTime': '', 'aTime': '' }, { 'day': I18n.t('managerContentsInsertFri'), 'bTime': '', 'aTime': '' }, { 'day': I18n.t('managerContentsInsertSat'), 'bTime': '', 'aTime': '' }, { 'day': I18n.t('managerContentsInsertSun'), 'bTime': '', 'aTime': '' }],
        goodsDatas: [{ 'no': 0, 'currency': 'KRW', 'price': '', 'default': '', 'trans': [] }],
        photoWidth: screenWidth - 80,
        degreeCheck: false,
        photoType: 1, //1-creator (2), 2-images (1), 3-representative (2)
        photoDatas: [],
        coverDatas: [],
        creatorDatas: [],
        tagDatas: [],
        placeNo: 0,
        selectCategoryList: [],
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
        addressDetail: '',
        placeTel: '',
        placeWeb: '',
        creatorName: '',
        creatorUrl: '',
        datePicker: false,
        detePickerSelected: false,
        defaultTime: Moment().format('HH:mm'),
        selectDay: '',
        datePickerIndex: 0,
        goodsCnt: 0,
    }

    async hasAndroidPermission() {
        const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

        const hasPermission = await PermissionsAndroid.check(permission);
        if (hasPermission) {

            this.openPicker()
            return true;
        }

        const status = await PermissionsAndroid.request(permission);
        if (status === 'granted') {

            this.openPicker()
        }
        return status === 'granted';
    }

    parentFunction = value => {
        if (this.state.photoType == 1) {
            this.state.creatorDatas = [];
            for (let i = 0; i < Object.keys(value).length; i++) {
                console.log(TAG, JSON.stringify(value[i]))
                this.state.creatorDatas.push(value[i])
                // }
            }
        } else if (this.state.photoType == 2) {
            this.state.photoDatas = [];
            for (let i = 0; i < Object.keys(value).length; i++) {
                console.log(TAG, JSON.stringify(value[i]))
                this.state.photoDatas.push(value[i])
                // }
            }
        } else {
            this.state.coverDatas = [];
            for (let i = 0; i < Object.keys(value).length; i++) {
                console.log(TAG, JSON.stringify(value[i]))
                this.state.coverDatas.push(value[i])
                // }
            }
        }
        this.setState({
            isLoading: false,
        })
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
                datas = User.city.filter((value) => value.country_no == this.state.selectedCountryNo)
            }
            else if (type == '3' && this.state.selectedCityNo != -1) {
                console.log(this.state.selectedCityNo)
                title = I18n.t('homeRegion')
                // datas = this.state.regionDatas
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
                showSelectedScheduleDate: this.state._markedDates[0] + ' ~ ' + this.state._markedDates[this.state._markedDates.length - 1],
            })
        } else if (value.type == '3') {
            this.setState({
                selectDialogVisible: false,
                selectedRegion: Utils.Grinder(User.region.filter((el) => el.town_no == value.no)[0]),
                selectedRegionNo: value.no,
                selectedRegionPosition: value.selectedPosition,
            })
        } else if (value.type == '2') {
            this.setState({
                selectDialogVisible: false,
                selectedCity: Utils.Grinder(User.city.filter((el) => el.city_no == value.no)[0]),
                selectedRegion: '',
                selectedRegionPosition: -1,
                selectedRegionNo: -1,
                regionDatas: [],
                selectedCityNo: value.no,
                selectedCityPosition: value.selectedPosition,
            })
        } else if (value.type == '1') {
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
            })
        } else if (value.type == '5') {
            this.setState({
                selectDialogVisible: false,
            });
        } else if (value.type == '6') {
            this.setState({
                categoryDialogVisible: false,
                categorySelectedTextDatas: value.selectedTextDatas
            });
        } else if (value.type == '7') {
            this.setState({
                categoryDialogVisible: false,
                languageSelectedTextDatas: value.selectedTextDatas
            });
        } else if (value.type == '8') {
            this.setState({
                categoryDialogVisible: false,
                curationCategorySelectedTextDatas: value.selectedTextDatas
            });
        } else if (value.type == '10') {
            this.setState({
                categoryDialogVisible: false,
            });
        }
    }

    _CategoryDialog() {
        if (this.state.categoryDialogVisible) {
            let type = this.state.selectedDialogType;
            if (type == '6') {
                return <CategoriesDialog title={I18n.t('contentsCategories')} datas={User.category} type={type} click={this._ClickDialog} selectedTextDatas={this.state.categorySelectedTextDatas} ></CategoriesDialog>
            } else if (type == '7') {
                return <LanguageDialog title={I18n.t('contentsCategories')} datas={User.language} type={type} click={this._ClickDialog} selectedTextDatas={this.state.languageSelectedTextDatas} ></LanguageDialog>
            } else if (type == '8') {
                return <CurationCategoriesDialog title={I18n.t('contentsCategories')} datas={User.category} type={type} click={this._ClickDialog} selectedTextDatas={this.state.curationCategorySelectedTextDatas} ></CurationCategoriesDialog>
            }
        }
    }

    _PlaceInsert = params => { // 1-insert, 2-lang change, 3-place change , 4-delete
        if (params.type == 1) {
            const obj = {
                'no': this.state.placeDatas.length, 'language': '', 'place': ''
            }
            if (this.state.placeDatas.length < 4) {
                this.state.placeDatas.push(obj)
                this.setState({
                    placeDatas: this.state.placeDatas
                })
            }
        } else if (params.type == 2) {
            this.setState({
                placeDatas: this.state.placeDatas.map(
                    item => params.no === item.no
                        ? { no: item.no, language: params.language, place: item.place }
                        : item
                )
            })
        } else if (params.type == 3) {
            this.setState({
                placeDatas: this.state.placeDatas.map(
                    item => params.no === item.no
                        ? { no: item.no, language: item.language, place: params.place }
                        : item
                )
            })
        } else {
            const newList = this.state.placeDatas.filter((item) => item.no !== params.no);
            this.setState({ placeDatas: newList })
        }
    }


    _PlaceSingleInfoInsert = params => { // 1-insert, 2-lang change, 3-place change , 4-delete
        if (params.type == 1) {
            const obj = {
                'no': this.state.placeInfoSingleLineDatas.length, 'language': '', 'placeInfo': ''
            }
            if (this.state.placeInfoSingleLineDatas.length < 4) {
                this.state.placeInfoSingleLineDatas.push(obj)
                this.setState({
                    placeInfoSingleLineDatas: this.state.placeInfoSingleLineDatas
                })
            }
        } else if (params.type == 2) {
            this.setState({
                placeInfoSingleLineDatas: this.state.placeInfoSingleLineDatas.map(
                    item => params.no === item.no
                        ? { no: item.no, language: params.language, placeInfo: item.placeInfo }
                        : item
                )
            })
        } else if (params.type == 3) {
            this.setState({
                placeInfoSingleLineDatas: this.state.placeInfoSingleLineDatas.map(
                    item => params.no === item.no
                        ? { no: item.no, language: item.language, placeInfo: params.placeInfo }
                        : item
                )
            })
        } else {
            const newList = this.state.placeInfoSingleLineDatas.filter((item) => item.no !== params.no);
            this.setState({ placeInfoSingleLineDatas: newList })
        }
    }

    _PlaceInfoInsert = params => { // 1-insert, 2-lang change, 3-place change , 4-delete
        if (params.type == 1) {
            const obj = {
                'no': this.state.placeInfoDatas.length, 'language': '', 'placeInfo': ''
            }
            if (this.state.placeInfoDatas.length < 4) {
                this.state.placeInfoDatas.push(obj)
                this.setState({
                    placeInfoDatas: this.state.placeInfoDatas
                })
            }
        } else if (params.type == 2) {
            this.setState({
                placeInfoDatas: this.state.placeInfoDatas.map(
                    item => params.no === item.no
                        ? { no: item.no, language: params.language, placeInfo: item.placeInfo }
                        : item
                )
            })
        } else if (params.type == 3) {
            this.setState({
                placeInfoDatas: this.state.placeInfoDatas.map(
                    item => params.no === item.no
                        ? { no: item.no, language: item.language, placeInfo: params.placeInfo }
                        : item
                )
            })
        } else {
            const newList = this.state.placeInfoDatas.filter((item) => item.no !== params.no);
            this.setState({ placeInfoDatas: newList })
        }
    }

    _GoodsInsert = params => { // 1-insert, 2-transInsert, 4-currency, 5-price , 6-delete, 7 - default , 8 - language, 9 - value
        if (params.type == 1) {
            const obj = {
                'no': this.state.goodsDatas.length, 'currency': 'KRW', 'price': '', 'default': '', 'trans': []
            }
            this.state.goodsDatas.push(obj)
            this.setState({
                goodsDatas: this.state.goodsDatas
            })
        } else if (params.type == 2) {
            this.setState({
                goodsDatas: this.state.goodsDatas.map(
                    item => params.no === item.no
                        ? { no: item.no, default: item.default, currency: item.currency, price: item.price, trans: [...item.trans, params.obj] }
                        : item
                )
            })
        } else if (params.type == 7) {
            this.setState({
                goodsDatas: this.state.goodsDatas.map(
                    item => params.no === item.no
                        ? { no: item.no, default: params.value, currency: item.currency, price: item.price, trans: [...item.trans] }
                        : item
                )
            })
        } else if (params.type == 8) {
            this.setState({
                goodsDatas: this.state.goodsDatas.map(
                    item => params.no === item.no
                        ? {
                            no: item.no, default: item.default, currency: item.currency, price: item.price, trans: item.trans.map(
                                item1 => params.trans.no === item1.no
                                    ? {
                                        no: item1.no, language: params.trans.language, value: item1.value,
                                    }
                                    : item1
                            )
                        }
                        : item
                )
            })
        } else if (params.type == 9) {
            this.setState({
                goodsDatas: this.state.goodsDatas.map(
                    item => params.no === item.no
                        ? {
                            no: item.no, default: item.default, currency: item.currency, price: item.price, trans: item.trans.map(
                                item1 => params.trans.no === item1.no
                                    ? {
                                        no: item1.no, language: item1.language, value: params.trans.value,
                                    }
                                    : item1
                            )
                        }
                        : item
                )
            })
        } else if (params.type == 4) {
            this.setState({
                goodsDatas: this.state.goodsDatas.map(
                    item => params.no === item.no
                        ? { no: item.no, default: item.default, currency: params.currency, price: item.price, trans: [...item.trans] }
                        : item
                )
            })
        } else if (params.type == 5) {
            this.setState({
                goodsDatas: this.state.goodsDatas.map(
                    item => params.no === item.no
                        ? { no: item.no, default: item.default, currency: item.currency, price: params.price, trans: [...item.trans] }
                        : item
                )
            })
        } else {
            const newList = this.state.goodsDatas[params.no].trans.filter((item) => item.no !== params.trans.no);
            this.setState({
                goodsDatas: this.state.goodsDatas.map(
                    item => params.no === item.no
                        ? { no: item.no, default: item.default, currency: item.currency, price: item.price, trans: [...newList] }
                        : item
                )
            })
        }

        console.log(this.state.goodsDatas[0].trans)
    }

    _MapSearch(value) {
        Geocoder.from(value)
            .then(json => {
                var location = json.results[0].geometry.location;
                this.setState({
                    lat: location.lat,
                    lng: location.lng
                })
                console.log(location);
            })
            .catch(error => console.warn(error));
    }

    _TagView() {
        this.state.tagDatas.push(this.state.tagText.trim())
        this.tagTextInput.clear()
        this.setState({ tagText: '' })
    }

    _TagDelete(text) {
        const newList = this.state.tagDatas.filter((item) => item !== text);
        this.setState({ tagDatas: newList })
    }

    _PhotoUrlsDelete(item) {
        const newList = this.state.photoDatas.filter((el) => el.path !== item.path);
        this.setState({ photoDatas: newList })
    }

    _CategoryView(item) {
        console.log(item)
        if (this.state.selectCategoryList.includes(item)) {
            const newList = this.state.selectCategoryList.filter((el) => el !== item);
            this.setState({ selectCategoryList: newList })
        } else {
            if (this.state.selectCategoryList.length < 3) {
                this.state.selectCategoryList.push(item)
                this.setState({
                    isLoading: true
                })
            }
        }
    }

    _PlaceTime = params => {
        console.log(params.index)
        if (this.state.datePickerIndex < 15) {
            this.setState({
                placeTimeDatas: this.state.placeTimeDatas.map(
                    item => params.day === item.day
                        ? { day: item.day, bTime: params.time, aTime: item.aTime }
                        : item),
                datePicker: false,
                detePickerSelected: true,
                defaultTime: Moment().format('HH:mm')
            })
        } else {
            this.setState({
                placeTimeDatas: this.state.placeTimeDatas.map(
                    item => params.day === item.day
                        ? { day: item.day, bTime: item.bTime, aTime: params.time }
                        : item),
                datePicker: false,
                detePickerSelected: true,
                defaultTime: Moment().format('HH:mm')
            })
        }
    }

    _DatePicker() {
        return (
            <Modal transparent={true} visible={this.state.datePicker}>
                <View style={{ height: '100%', width: '100%', justifyContent: "center", alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', }}>
                    <View style={{ height: 320, width: '90%', backgroundColor: "#fff", borderRadius: 12, justifyContent: "center", alignItems: 'center' }}>
                        <View style={{ width: '100%', height: 50, justifyContent: "center", alignItems: 'center', paddingTop: 10 }}>
                            {/* <Text style={{ fontSize: 16, color: "#000", fontFamily: 'KHNPHDotfR' }}>생년월일</Text> */}
                            <TouchableOpacity style={{ position: 'absolute', right: 16 }} onPress={() => this.setState({ datePicker: false, detePickerSelected: false })}>
                                <Image source={imgClose} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%', height: 216, justifyContent: "center", alignItems: 'center' }}>
                            <DatePicker
                                locale={this.state.lang}
                                // modal
                                mode="time"
                                open={true}
                                date={new Date()}
                                theme={"light"}
                                onDateChange={(date) => {
                                    console.log('DatePicker', Moment(date).format('HH:mm'));
                                    this.state.defaultTime = Moment(date).format('HH:mm')
                                }}
                            />
                        </View>
                        <View style={{ width: '100%', height: 48, marginBottom: 20, paddingLeft: 16, paddingRight: 16 }}>
                            <TouchableWithoutFeedback onPress={() => this._PlaceTime({ day: this.state.selectDay, time: this.state.defaultTime, index: this.state.datePickerIndex })}>
                                <View style={{ flex: 1, borderRadius: 4, justifyContent: "center", alignItems: 'center', backgroundColor: Colors.color2D7DC8, }}>
                                    <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>확인</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </View>
            </Modal >
        )
    }

    async _ContentsInsert() {
        let placeObj = {
            default: this.state.placeDatas.filter((el) => el.language == 'default').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'default')[0].place.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
            ko: this.state.placeDatas.filter((el) => el.language == 'ko').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'ko')[0].place.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
            en: this.state.placeDatas.filter((el) => el.language == 'en').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'en')[0].place.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
            ja: this.state.placeDatas.filter((el) => el.language == 'ja').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'ja')[0].place.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
        }
        console.log(placeObj)
        let placeSingleInfoObj = {
            default: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'default').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'default')[0].placeInfo.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
            ko: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ko').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ko')[0].placeInfo.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
            en: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'en').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'en')[0].placeInfo.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
            ja: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ja').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ja')[0].placeInfo.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
        }

        let placeInfoObj = {
            default: this.state.placeInfoDatas.filter((el) => el.language == 'default').length == 0 ? '' : this.state.placeInfoDatas.filter((el) => el.language == 'default')[0].placeInfo.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
            ko: this.state.placeInfoDatas.filter((el) => el.language == 'ko').length == 0 ? '' : this.state.placeInfoDatas.filter((el) => el.language == 'ko')[0].placeInfo.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
            en: this.state.placeInfoDatas.filter((el) => el.language == 'en').length == 0 ? '' : this.state.placeInfoDatas.filter((el) => el.language == 'en')[0].placeInfo.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
            ja: this.state.placeInfoDatas.filter((el) => el.language == 'ja').length == 0 ? '' : this.state.placeInfoDatas.filter((el) => el.language == 'ja')[0].placeInfo.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
        }
        console.log(placeInfoObj)

        let defaultList = [];
        console.log('click')
        for (let i = 0; i < this.state.goodsDatas.length; i++) {
            console.log(this.state.goodsDatas)
            const defaultObj = {
                no: i,
                name: this.state.goodsDatas[i].default.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;'),
                currency: this.state.goodsDatas[i].currency,
                price: this.state.goodsDatas[i].price,
                ko: this.state.goodsDatas[i].trans.filter((el) => el.language == 'ko').length > 0 ? this.state.goodsDatas[i].trans.filter((el) => el.language == 'ko')[0].value.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;') : '',
                en: this.state.goodsDatas[i].trans.filter((el) => el.language == 'en').length > 0 ? this.state.goodsDatas[i].trans.filter((el) => el.language == 'en')[0].value.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;') : '',
                ja: this.state.goodsDatas[i].trans.filter((el) => el.language == 'ja').length > 0 ? this.state.goodsDatas[i].trans.filter((el) => el.language == 'ja')[0].value.replace(/'/gi, '&#039;').replace(/"/gi, '&quot;') : '',
            }
            defaultList.push(defaultObj)
        }
        console.log(defaultList)

        let moObj = {
            open: this.state.placeTimeDatas[0].bTime,
            close: this.state.placeTimeDatas[0].aTime,
        }
        let tuObj = {
            open: this.state.placeTimeDatas[1].bTime,
            close: this.state.placeTimeDatas[1].aTime,
        }
        let weObj = {
            open: this.state.placeTimeDatas[2].bTime,
            close: this.state.placeTimeDatas[2].aTime,
        }
        let thObj = {
            open: this.state.placeTimeDatas[3].bTime,
            close: this.state.placeTimeDatas[3].aTime,
        }
        let frObj = {
            open: this.state.placeTimeDatas[4].bTime,
            close: this.state.placeTimeDatas[4].aTime,
        }
        let saObj = {
            open: this.state.placeTimeDatas[5].bTime,
            close: this.state.placeTimeDatas[5].aTime,
        }
        let suObj = {
            open: this.state.placeTimeDatas[6].bTime,
            close: this.state.placeTimeDatas[6].aTime,
        }
        let placeTime = {
            mo: moObj,
            tu: tuObj,
            we: weObj,
            th: thObj,
            fr: frObj,
            sa: saObj,
            su: suObj,
        }
        console.log(placeTime)

        const url = ServerUrl.InsertContentsPlace
        let formBody = {};
        formBody = JSON.stringify({
            "user_no": User.userNo,
            "hashtags": this.state.tagDatas,
            "categories": this.state.selectCategoryList,
            "place_name": placeObj,
            "title": placeSingleInfoObj,
            "content": placeInfoObj,
            "country": this.state.selectedCountryNo,
            "city": this.state.selectedCityNo,
            "town": this.state.selectedRegionNo,
            "address": this.state.mapSearchText,
            "address_detail": this.state.addressDetail,
            "lat": this.state.lat,
            "lng": this.state.lng,
            "tel": this.state.placeTel,
            "web": this.state.placeWeb,
            "operate_hours": placeTime,
            "product_list": JSON.stringify(defaultList),
            "creator_name": this.state.creatorName,
            "creator_url": this.state.creatorUrl,
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log(json)
        if (json.length > 0) {
            this.state.placeNo = json[0].place_no
            this._UpdatePlaceImageRepresentative()
        } else {
            this.setState({
                isFetching: false,
            })
        }
    }

    _UpdatePlaceImageRepresentative() {
        var url = "";
        let formdata = new FormData();
        url = ServerUrl.UpdateContentsPlaceImageRep
        console.log(this.state.placeNo)
        formdata.append('place_no', this.state.placeNo)

        if (this.state.coverDatas.length > 0) {
            for (let i = 0; i < this.state.coverDatas.length; i++) {
                let imageName = this.state.coverDatas[i].fileName;
                // let imageType = this.state.coverDatas[i].filename == undefined ? this.state.coverDatas[i].uri.split('.').pop() : this.state.coverDatas[i].filename.split('.')[1];
                const photo = {
                    uri: this.state.coverDatas[i].path,
                    type: this.state.coverDatas[i].mime,
                    filename: imageName,
                    name: imageName,
                };
                formdata.append("place_image_representative", photo);
            }
        }
        fetch(url, {
            method: 'POST',
            body: formdata,
        }).then(
            response => response.json()
        ).then(
            json => {
                console.log(TAG, json);
                if (json.affectedRows == 1) {
                    this._UpdatePlaceImageUrls()
                } else {
                    this.setState({ isFetching: false })
                }
            })
    }

    _UpdatePlaceImageUrls() {
        var url = "";
        let formdata = new FormData();
        url = ServerUrl.InsertContentsPlaceImages
        console.log(this.state.placeNo)
        formdata.append('place_no', this.state.placeNo)

        if (this.state.photoDatas.length > 0) {
            for (let i = 0; i < this.state.photoDatas.length; i++) {
                let imageName = this.state.photoDatas[i].fileName;
                // let imageType = this.state.photoDatas[i].filename == undefined ? this.state.photoDatas[i].uri.split('.').pop() : this.state.photoDatas[i].filename.split('.')[1];
                const photo = {
                    uri: this.state.photoDatas[i].path,
                    type: this.state.photoDatas[i].mime,
                    filename: imageName,
                    name: imageName,
                };
                formdata.append("place_image_urls", photo);
            }
        }
        fetch(url, {
            method: 'POST',
            body: formdata,
        }).then(
            response => response.json()
        ).then(
            json => {
                console.log(TAG, json);
                if (json.affectedRows == 1) {
                    this._UpdatePlaceImageCreator()
                } else {
                    this.setState({ isFetching: false })
                }
            })
    }

    _UpdatePlaceImageCreator() {
        var url = "";
        let formdata = new FormData();
        url = ServerUrl.InsertContentsPlaceCreator
        console.log(this.state.placeNo)
        formdata.append('place_no', this.state.placeNo)

        if (this.state.creatorDatas.length > 0) {
            for (let i = 0; i < this.state.creatorDatas.length; i++) {
                let imageName = this.state.creatorDatas[i].fileName
                // let imageType = this.state.creatorDatas[i].uri.split('.').pop();

                const photo = {
                    uri: this.state.creatorDatas[i].path,
                    type: this.state.creatorDatas[i].mime,
                    filename: imageName,
                    name: imageName,
                };
                formdata.append("place_image_creator", photo);
            }
        }
        fetch(url, {
            method: 'POST',
            body: formdata,
        }).then(
            response => response.json()
        ).then(
            json => {
                console.log(TAG, json);
                if (json.affectedRows == 1) {
                    this.setState({ isFetching: false })
                    this.props.route.params.parentFunction('Success');
                    this.props.navigation.goBack()
                } else {
                    this.setState({ isFetching: false })
                }
            })
    }

    async openPicker() {
        try {
            const response1 = await MultipleImagePicker.openPicker({
                usedCameraButton: false,
                maxVideo: 0,
                maxSelectedAssets: this.state.photoType == 2 ? 20 : 1,
                selectedAssets: this.state.photoType == 1 ? this.state.creatorDatas : this.state.photoType == 2 ? this.state.photoDatas : this.state.coverDatas,
                isExportThumbnail: true,
                singleSelectedMode: false,
                isCrop: true,
                isCropCircle: true,
            }).then((response) => {
                console.log('aaa ', response)

                if (this.state.photoType == 1) {
                    this.setState({
                        isFetching: false,
                        creatorDatas: response
                    })
                } else if (this.state.photoType == 2) {
                    this.setState({
                        isFetching: false,
                        photoDatas: response
                    })
                } else {
                    this.setState({
                        isFetching: false,
                        coverDatas: response
                    })
                }

            }).catch((e) => {
                console.log('catch', e)
            });


        } catch (e) {
            console.log(e.code, e.message);

        }
    };

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    {this._CallDialog()}
                    {this._DatePicker()}
                    {/* {this._CategoryDialog()} */}
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('managerContentsInsertTitle')}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center', paddingLeft: 16, paddingRight: 16, marginTop: 20 }}>
                        <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(156, 159, 161, 0.5)', }}></View>
                    </View>

                    <KeyboardAwareScrollView style={{ marginTop: 16 }} enableOnAndroid={true} extraHeight={Platform.OS == 'ios' ? 100 : 65} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                        <View style={{ paddingLeft: 16, paddingRight: 16 }}>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('managerContentsInsertCategory')}</Text>

                            <View style={{ flexWrap: 'wrap', flexDirection: 'row' }}>
                                {User.contentsCategory.map((item, index) => (
                                    <TouchableOpacity onPress={() => this._CategoryView(item.category_no)} style={{ justifyContent: 'center', marginTop: 12 }}>
                                        <View style={{ borderWidth: 1, borderColor: Colors.color4D4A4A, borderRadius: 4, height: 48, width: (screenWidth - 44) / 2, marginLeft: index % 2 == 0 ? 0 : 12, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ color: Colors.color4D4A4A, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{item.ko}</Text>
                                        </View>
                                        {this.state.selectCategoryList.includes(item.category_no) && <View style={{ position: 'absolute', width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: Colors.color2D7DC8, left: index % 2 == 0 ? 12 : 24, alignItems: 'center', justifyContent: 'center', }}>
                                            <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 14, }}>{this.state.selectCategoryList.indexOf(item.category_no) + 1}</Text>
                                        </View>}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, flex: 1 }}>{I18n.t('managerContentsInsertName')}</Text>
                                <TouchableOpacity onPress={() => this._PlaceInsert({ type: 1, })}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 5, paddingBottom: 5, paddingLeft: 24, paddingRight: 27, borderRadius: 20, borderWidth: 1, borderColor: Colors.color2D7DC8 }}>
                                        <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 10, }}>{I18n.t('managerContentsLanguageAdd')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                {this.state.placeDatas.map((item, index1) => (
                                    <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                        {index1 != 0 && (
                                            <View style={{ flex: 0.3, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                                <SelectDropdown
                                                    style={{ marginLeft: 10 }}
                                                    data={this.state.lang == 'ko' ? ['한국어', '영어', '일본어'] : ['Korean', 'English', 'Japanese']}
                                                    dropdownIconPosition='right'
                                                    buttonStyle={{ width: '100%', height: '100%', alignItems: 'center', backgroundColor: Colors.colorFFFFFF, padding: 0, margin: 0, borderRadius: 4, justifyContent: 'center' }}
                                                    buttonTextStyle={{ alignItems: 'center', justifyContent: 'center', margin: 0, marginHorizontal: 0, textAlign: 'left', fontSize: 14, textAlignVertical: 'center', fontFamily: 'Raleway-Regular', includeFontPadding: false }}
                                                    renderDropdownIcon={isOpened => {
                                                        return <Image source={imgDownArrow} style={{ width: 13, height: 7, resizeMode: 'contain' }} />;
                                                    }}
                                                    defaultButtonText={I18n.t('managerContentsInsertLanguage')}
                                                    onSelect={(selectedItem, index) => {
                                                        this._PlaceInsert({ type: 2, language: index == 0 ? 'ko' : index == 1 ? 'en' : 'ja', no: index1 })
                                                    }} />
                                            </View>
                                        )}

                                        <View style={{ flex: index1 == 0 ? 1 : 0.7, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: index1 == 0 ? 0 : 15, paddingLeft: 18 }}>
                                            <TextInput onChangeText={(text) => this._PlaceInsert({ type: 3, place: text, no: index1 })} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('managerContentsInsertNameHint')} placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                                            {index1 > 0 && <TouchableOpacity style={{ position: 'absolute', right: 9 }} onPress={() => this._PlaceInsert({ type: 4, no: index1 })}>
                                                <View style={{ width: 25, height: 25, borderRadius: 20, backgroundColor: Colors.colorE94D3E, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image source={imgDelete} style={{ width: 12, height: 13, resizeMode: 'contain' }}></Image>
                                                </View>
                                            </TouchableOpacity>}

                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, flex: 1 }}>{I18n.t('managerContentsInsertLineInfo')}</Text>
                                <TouchableOpacity onPress={() => this._PlaceSingleInfoInsert({ type: 1 })}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 5, paddingBottom: 5, paddingLeft: 24, paddingRight: 27, borderRadius: 20, borderWidth: 1, borderColor: Colors.color2D7DC8 }}>
                                        <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 10, }}>{I18n.t('managerContentsLanguageAdd')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                {this.state.placeInfoSingleLineDatas.map((item, index1) => (
                                    <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                        {index1 != 0 && (
                                            <View style={{ flex: 0.3, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                                <SelectDropdown
                                                    style={{ marginLeft: 10 }}
                                                    data={this.state.lang == 'ko' ? ['한국어', '영어', '일본어'] : ['Korean', 'English', 'Japanese']}
                                                    dropdownIconPosition='right'
                                                    buttonStyle={{ width: '100%', height: '100%', alignItems: 'center', backgroundColor: Colors.colorFFFFFF, padding: 0, margin: 0, borderRadius: 4 }}
                                                    buttonTextStyle={{ alignItems: 'center', justifyContent: 'center', margin: 0, marginHorizontal: 0, textAlign: 'left', fontSize: 14, textAlignVertical: 'center', fontFamily: 'Raleway-Regular', includeFontPadding: false }}
                                                    renderDropdownIcon={isOpened => {
                                                        return <Image source={imgDownArrow} style={{ width: 13, height: 7, resizeMode: 'contain' }} />;
                                                    }}
                                                    defaultButtonText={I18n.t('managerContentsInsertLanguage')}
                                                    onSelect={(selectedItem, index) => {
                                                        this._PlaceSingleInfoInsert({ type: 2, language: index == 0 ? 'ko' : index == 1 ? 'en' : 'ja', no: index1 })
                                                    }} />
                                            </View>
                                        )}

                                        <View style={{ flex: index1 == 0 ? 1 : 0.7, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: index1 == 0 ? 0 : 15, paddingLeft: 18 }}>
                                            <TextInput onChangeText={(text) => this._PlaceSingleInfoInsert({ type: 3, placeInfo: text, no: index1 })} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('managerContentsInsertLineInfoHint')} placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                                            {index1 > 0 && <TouchableOpacity style={{ position: 'absolute', right: 9 }} onPress={() => this._PlaceSingleInfoInsert({ type: 4, no: index1 })}>
                                                <View style={{ width: 25, height: 25, borderRadius: 20, backgroundColor: Colors.colorE94D3E, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image source={imgDelete} style={{ width: 12, height: 13, resizeMode: 'contain' }}></Image>
                                                </View>
                                            </TouchableOpacity>}
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, flex: 1 }}>{I18n.t('managerContentsInsertContents')}</Text>
                                <TouchableOpacity onPress={() => this._PlaceInfoInsert({ type: 1 })}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 5, paddingBottom: 5, paddingLeft: 24, paddingRight: 27, borderRadius: 20, borderWidth: 1, borderColor: Colors.color2D7DC8 }}>
                                        <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 10, }}>{I18n.t('managerContentsLanguageAdd')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                {this.state.placeInfoDatas.map((item, index1) => (
                                    <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                        {index1 != 0 && (
                                            <View style={{ flex: 0.3, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                                <SelectDropdown
                                                    style={{ marginLeft: 10 }}
                                                    data={this.state.lang == 'ko' ? ['한국어', '영어', '일본어'] : ['Korean', 'English', 'Japanese']}
                                                    dropdownIconPosition='right'
                                                    buttonStyle={{ width: '100%', height: '100%', alignItems: 'center', backgroundColor: Colors.colorFFFFFF, padding: 0, margin: 0, borderRadius: 4 }}
                                                    buttonTextStyle={{ alignItems: 'center', justifyContent: 'center', margin: 0, marginHorizontal: 0, textAlign: 'left', fontSize: 14, textAlignVertical: 'center', fontFamily: 'Raleway-Regular', includeFontPadding: false }}
                                                    renderDropdownIcon={isOpened => {
                                                        return <Image source={imgDownArrow} style={{ width: 13, height: 7, resizeMode: 'contain' }} />;
                                                    }}
                                                    defaultButtonText={I18n.t('managerContentsInsertLanguage')}
                                                    onSelect={(selectedItem, index) => {
                                                        this._PlaceInfoInsert({ type: 2, language: index == 0 ? 'ko' : index == 1 ? 'en' : 'ja', no: index1 })
                                                    }} />
                                            </View>
                                        )}

                                        <View style={{ flex: index1 == 0 ? 1 : 0.7, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: index1 == 0 ? 0 : 15, paddingLeft: 18 }}>
                                            <TextInput onChangeText={(text) => this._PlaceInfoInsert({ type: 3, placeInfo: text, no: index1 })} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={""} placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                                            {index1 > 0 && <TouchableOpacity style={{ position: 'absolute', right: 9 }} onPress={() => this._PlaceInfoInsert({ type: 4, no: index1 })}>
                                                <View style={{ width: 25, height: 25, borderRadius: 20, backgroundColor: Colors.colorE94D3E, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image source={imgDelete} style={{ width: 12, height: 13, resizeMode: 'contain' }}></Image>
                                                </View>
                                            </TouchableOpacity>}
                                        </View>
                                    </View>
                                ))}
                            </View>


                            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, flex: 1 }}>{I18n.t('managerContentsInsertLocation')}</Text>
                            </View>

                            <View style={{ alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                    <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 18 }}>
                                        <Image source={imgLocation} style={{ width: 14, height: 17, resizeMode: 'contain', position: 'absolute', left: 17 }}></Image>
                                        <TextInput style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 25 }} placeholder={I18n.t('managerContentsInsertAddress')} placeholderTextColor={Colors.colorC4C4C4} onSubmitEditing={() => this._MapSearch(this.state.mapSearchText)} onChangeText={(value) => this.state.mapSearchText = value}>{this.state.mapSearchText}</TextInput>
                                    </View>
                                </View>
                            </View>

                        </View>

                        {/* Google Map */}
                        <View style={{ width: '100%', height: 200, marginTop: 12 }}>
                            <MapView
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
                                region={{
                                    latitude: this.state.lat,
                                    longitude: this.state.lng,
                                    latitudeDelta: 0.00222,
                                    longitudeDelta: 0.00121,
                                }}
                                toolbarEnabled={false}
                            >
                                <Marker
                                    coordinate={{ latitude: this.state.lat, longitude: this.state.lng }}
                                />
                            </MapView>
                        </View>

                        <View style={{ marginTop: 20, paddingLeft: 16, paddingRight: 16 }}>
                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, flex: 1 }}>{I18n.t('managerContentsInsertLocation')}</Text>
                            <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                <TouchableOpacity style={{ flex: 1, }} onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 1 })}>
                                    <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 11 }}>{this.state.selectedCountry.length > 0 ? this.state.selectedCountry : I18n.t('managerContentsInsertCountry')}</Text>
                                        <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 18 }} source={imgDownArrow}></Image>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flex: 1, marginLeft: 8 }} onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 2 })}>
                                    <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 11 }}>{this.state.selectedCity.length > 0 ? this.state.selectedCity : I18n.t('managerContentsInsertCity')}</Text>
                                        <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 18 }} source={imgDownArrow}></Image>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flex: 1, marginLeft: 8 }} onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 3 })}>
                                    <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 11 }}>{this.state.selectedRegion.length > 0 ? this.state.selectedRegion : I18n.t('managerContentsInsertRegion')}</Text>
                                        <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 18 }} source={imgDownArrow}></Image>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={{ borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 18, height: 48, marginTop: 12 }}>
                                <TextInput style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('managerContentsInsertAddressDetailHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => this.setState({ addressDetail: text })}></TextInput>
                            </View>

                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginTop: 20 }}>{I18n.t('managerContentsInsertPhoneHint')}</Text>
                            <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                <TouchableOpacity style={{ flex: 0.3, }}>
                                    <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 11 }}>{"+82"}</Text>
                                        <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 18 }} source={imgDownArrow}></Image>
                                    </View>
                                </TouchableOpacity>

                                <View style={{ flex: 0.7, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderBottomColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: 12, paddingLeft: 4 }}>
                                    <TextInput keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={""} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => { this.setState({ placeTel: text.replace('-', '').replace('.', '') }) }} value={this.state.placeTel}></TextInput>
                                </View>
                            </View>

                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginTop: 20 }}>{I18n.t('managerContentsInsertWebLink')}</Text>
                            <View style={{ borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 18, height: 48, marginTop: 12 }}>
                                <TextInput style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={"https://"} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => this.setState({ placeWeb: text })}></TextInput>
                            </View>

                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginTop: 20 }}>{I18n.t('managerContentsInsertTime')}</Text>
                            {this.state.placeTimeDatas.map((item, index) => (
                                <View key={index} style={{ width: '100%', height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                                    <View style={{ flex: 0.3, justifyContent: 'center' }}>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 16, }}>{item.day}</Text>
                                    </View>
                                    <View style={{ flex: 0.7, flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ datePicker: true, datePickerIndex: index, selectDay: item.day })}>
                                            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1 }}>
                                                <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 16, }}>{item.bTime.length == 0 ? "00:00" : item.bTime}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <Text style={{ marginLeft: 16, marginRight: 16 }}>{"~"}</Text>
                                        <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ datePicker: true, datePickerIndex: (index + 20), selectDay: item.day })}>
                                            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1 }}>
                                                <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 16, }}>{item.aTime.length == 0 ? "00:00" : item.aTime}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}

                            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, flex: 1 }}>{I18n.t('managerContentsInsertPrice')}</Text>

                            </View>

                            {this.state.goodsDatas.map((item, index1) => (
                                <View style={{ marginTop: index1 == 0 ? 12 : 24, borderWidth: 1, borderColor: Colors.colorD0D0D0, borderRadius: 4, padding: 8 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ flex: 1 }}></View>
                                        <TouchableOpacity onPress={() => this.state.goodsDatas[index1].trans.length < 3 && this._GoodsInsert({ type: 2, obj: { no: this.state.goodsDatas[index1].trans.length == 0 ? 0 : this.state.goodsDatas[index1].trans[this.state.goodsDatas[index1].trans.length - 1].no + 1, value: undefined, language: undefined }, no: index1 })}>
                                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 5, paddingBottom: 5, paddingLeft: 24, paddingRight: 27, borderRadius: 20, borderWidth: 1, borderColor: Colors.color2D7DC8, height: 24 }}>
                                                <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 10, }}>{I18n.t('managerContentsLanguageAdd')}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12 }}>
                                        <View style={{ flex: 1, height: 48, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, paddingLeft: 12, justifyContent: 'center', marginLeft: 0 }}>
                                            <TextInput onChangeText={(text) => this._GoodsInsert({ type: 7, value: text, no: index1 })} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, }} placeholder={I18n.t('managerContentsInsertPriceHint')} placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                                        </View>
                                    </View>
                                    {this.state.goodsDatas[index1].trans.map((item1, index2) => (
                                        <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12 }}>
                                            <View style={{ flex: 0.3, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                                {console.log(item1)}
                                                <SelectDropdown
                                                    style={{ marginLeft: 10 }}
                                                    data={this.state.lang == 'ko' ? ['한국어', '영어', '일본어'] : ['Korean', 'English', 'Japanese']}
                                                    dropdownIconPosition='right'
                                                    buttonStyle={{ width: '100%', height: '100%', alignItems: 'center', backgroundColor: Colors.colorFFFFFF, padding: 0, margin: 0, borderRadius: 4 }}
                                                    buttonTextStyle={{ alignItems: 'center', justifyContent: 'center', margin: 0, marginHorizontal: 0, textAlign: 'left', fontSize: 14, textAlignVertical: 'center', fontFamily: 'Raleway-Regular', includeFontPadding: false }}
                                                    renderDropdownIcon={isOpened => {
                                                        return <Image source={imgDownArrow} style={{ width: 13, height: 7, resizeMode: 'contain' }} />;
                                                    }}
                                                    defaultButtonText={I18n.t('managerContentsInsertLanguage')}
                                                    onSelect={(selectedItem, index) => {
                                                        this._GoodsInsert({ type: 8, trans: { language: index == 0 ? 'ko' : index == 1 ? 'en' : 'ja', no: item1.no }, no: index1 })
                                                    }} />
                                            </View>

                                            <View style={{ flex: 0.7, height: 48, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, paddingLeft: 12, justifyContent: 'center', marginLeft: 15 }}>
                                                <TextInput onChangeText={(text) => this._GoodsInsert({ type: 9, trans: { value: text, no: item1.no }, no: index1 })} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, }} placeholder={I18n.t('managerContentsInsertPriceHint')} placeholderTextColor={Colors.colorC4C4C4}>{item1.value}</TextInput>
                                                <TouchableOpacity style={{ position: 'absolute', right: 9 }} onPress={() => this._GoodsInsert({ type: 6, no: index1, trans: { no: item1.no } })}>
                                                    <View style={{ width: 25, height: 25, borderRadius: 20, backgroundColor: Colors.colorE94D3E, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Image source={imgDelete} style={{ width: 12, height: 13, resizeMode: 'contain' }}></Image>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}

                                    <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                        <View style={{ flex: 0.3, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                            <SelectDropdown
                                                style={{ marginLeft: 10 }}
                                                data={this.state.lang == 'ko' ? ['원화 (₩)', '달러화 ($)', '엔화 (¥)'] : ['KRW (₩)', 'USD ($)', 'JPY (¥)']}
                                                dropdownIconPosition='right'
                                                buttonStyle={{ width: '100%', height: '100%', alignItems: 'center', backgroundColor: Colors.colorFFFFFF, padding: 0, margin: 0, borderRadius: 4 }}
                                                buttonTextStyle={{ alignItems: 'center', justifyContent: 'center', margin: 0, marginHorizontal: 0, textAlign: 'left', fontSize: 14, textAlignVertical: 'center', fontFamily: 'Raleway-Regular', includeFontPadding: false }}
                                                renderDropdownIcon={isOpened => {
                                                    return <Image source={imgDownArrow} style={{ width: 13, height: 7, resizeMode: 'contain' }} />;
                                                }}
                                                defaultButtonText={this.state.lang == 'ko' ? '원화 (₩)' : 'KRW (₩)'}
                                                onSelect={(selectedItem, index) => {
                                                    this._GoodsInsert({ type: 4, currency: index == 0 ? 'KRW' : index == 1 ? 'USD' : 'JPY', no: index1 })
                                                }} />
                                        </View>

                                        <View style={{ flex: 0.7, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderBottomColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: 12, paddingLeft: 4 }}>
                                            <TextInput keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'} onChangeText={(text) => this._GoodsInsert({ type: 5, price: text.replace('-', '').replace('.', ''), no: index1 })} value={this.state.goodsDatas[index1].price} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={""} placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                                        </View>
                                    </View>
                                </View>
                            ))}

                            <View style={{ width: '100%', marginTop: 20, }}>
                                <TouchableOpacity onPress={() => this._GoodsInsert({ type: 1 })}>
                                    <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.color2D7DC8, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image style={{ width: 16, height: 16, resizeMode: 'contain', tintColor: Colors.color2D7DC8 }} source={imgPlus}></Image>
                                        <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginLeft: 9 }}>{I18n.t('managerContentsInsertAddProduct')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginTop: 20 }}>{I18n.t('managerContentsInsertCreatorName')}</Text>
                            <View style={{ borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 18, height: 48, marginTop: 12 }}>
                                <TextInput style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('managerContentsInsertCreatorNameHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => this.setState({ creatorName: text })}></TextInput>
                            </View>

                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginTop: 20 }}>{I18n.t('managerContentsInsert')}</Text>
                            <View style={{ borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 18, height: 48, marginTop: 12 }}>
                                <TextInput style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={"https://"} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => this.setState({ creatorUrl: text })}></TextInput>
                            </View>

                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginTop: 20 }}>{I18n.t('managerContentsInsertCreatorProfile')}</Text>
                            <View style={{ marginTop: 12, flexDirection: 'row' }}>

                                <TouchableOpacity onPress={() => this.setState({ photoType: 1 }, () => Platform.OS == 'ios' ? this.openPicker() : this.hasAndroidPermission())}>
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorEDEDED, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={imgCamera} style={{ width: 20, height: 18, resizeMode: 'contain' }}></Image>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity >
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorFFFFFF, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                                        <Image source={this.state.creatorDatas.length > 0 ? { uri: this.state.creatorDatas[0].path } : null} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }}></Image>
                                        {/* <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={this.state.creatorDatas.length > 0 ? { uri: this.state.creatorDatas[0].uri, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal } : null} resizeMode={FastImage.resizeMode.cover}></FastImage> */}
                                        {this.state.creatorDatas.length > 0 && <TouchableOpacity style={{ position: 'absolute', right: 4, top: 2 }} onPress={() => this.setState({ creatorDatas: [] })}>
                                            <View style={{ width: 15, height: 15, borderRadius: 8, backgroundColor: Colors.colorE94D3E, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={imgDelete} style={{ width: 7, height: 8, resizeMode: 'contain' }}></Image>
                                            </View>
                                        </TouchableOpacity>}
                                    </View>
                                </TouchableOpacity>

                            </View>

                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 14, marginTop: 20 }}>{I18n.t('managerContentsInsertImages')}</Text>
                            <View style={{ marginTop: 12, flexDirection: 'row' }}>

                                <TouchableOpacity onPress={() => this.setState({ photoType: 2 }, () => Platform.OS == 'ios' ? this.openPicker() : this.hasAndroidPermission())}>
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorEDEDED, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={imgCamera} style={{ width: 20, height: 18, resizeMode: 'contain' }}></Image>
                                    </View>
                                </TouchableOpacity>

                                <View style={{ flexWrap: 'wrap', flexDirection: 'row' }}>
                                    {this.state.photoDatas.map((item, index) => (
                                        <TouchableWithoutFeedback>
                                            <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorFFFFFF, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 12, marginTop: index < 4 ? 0 : 12 }}>
                                                <Image source={this.state.photoDatas.length > index ? { uri: item.path } : null} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }}></Image>
                                                <TouchableOpacity style={{ position: 'absolute', right: 4, top: 2 }} onPress={() => this._PhotoUrlsDelete(item)}>
                                                    <View style={{ width: 15, height: 15, borderRadius: 8, backgroundColor: Colors.colorE94D3E, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Image source={imgDelete} style={{ width: 7, height: 8, resizeMode: 'contain' }}></Image>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    ))}
                                </View>
                            </View>

                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginTop: 20 }}>{I18n.t('managerContentsInsertRep')}</Text>
                            <View style={{ marginTop: 12, flexDirection: 'row' }}>

                                <TouchableOpacity onPress={() => this.setState({ photoType: 3 }, () => Platform.OS == 'ios' ? this.openPicker() : this.hasAndroidPermission())}>
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorEDEDED, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={imgCamera} style={{ width: 20, height: 18, resizeMode: 'contain' }}></Image>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <View style={{ width: this.state.photoWidth / 5, height: this.state.photoWidth / 5, backgroundColor: Colors.colorFFFFFF, borderColor: Colors.colorB7B7B7, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                                        <Image source={this.state.coverDatas.length > 0 ? { uri: this.state.coverDatas[0].path } : null} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }}></Image>
                                        {this.state.coverDatas.length > 0 && <TouchableOpacity style={{ position: 'absolute', right: 4, top: 2 }} onPress={() => this.setState({ coverDatas: [] })}>
                                            <View style={{ width: 15, height: 15, borderRadius: 8, backgroundColor: Colors.colorE94D3E, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={imgDelete} style={{ width: 7, height: 8, resizeMode: 'contain' }}></Image>
                                            </View>
                                        </TouchableOpacity>}
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginTop: 20 }}>{I18n.t('managerContentsInsertHashtag')}</Text>
                            {/* <View style={{ borderWidth: 1, borderColor: Colors.colorFFFFFF, borderBottomColor: Colors.colorD0D0D0, justifyContent: 'center', marginTop: 12 }}> */}
                            <TextInput ref={input => { this.tagTextInput = input }} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 14, width: '100%', height: 48, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderBottomColor: Colors.colorD0D0D0, }} onSubmitEditing={() => this._TagView()} placeholder={I18n.t('hostExperienceInsert02TagHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(value) => this.setState({ tagText: value })}>{this.state.tagText}</TextInput>

                            {this.state.tagDatas.length > 0 && (
                                <ScrollView style={{ marginTop: 12, }} horizontal showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                                    {this.state.tagDatas.map((item, index) => (
                                        <View style={{ backgroundColor: Colors.color2D7DC8, borderRadius: 50, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingLeft: 12, paddingRight: 13, paddingTop: 8, paddingBottom: 8, marginLeft: index == 0 ? 0 : 12 }}>
                                            <Text style={{ fontSize: 14, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, }}>{item}</Text>
                                            <TouchableOpacity onPress={() => this._TagDelete(item)}>
                                                <Image style={{ width: 13, height: 13, resizeMode: 'contain', marginLeft: 8, tintColor: Colors.color000000 }} source={imgRejected}></Image>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>)}
                            {/* </View> */}

                            <View style={{ flex: 1, flexDirection: 'row', marginTop: 28 }}>
                                <View>
                                    <TouchableWithoutFeedback onPress={() => this.setState({ degreeCheck: this.state.degreeCheck == false ? true : false, })}>
                                        <Image source={(this.state.degreeCheck == false ? imgCheckOff : imgCheckOn)} style={{ width: 15, height: 15, resizeMode: 'contain' }}></Image>
                                    </TouchableWithoutFeedback>
                                </View>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginLeft: 9, }}>
                                    <Text style={{ color: Colors.color000000, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('managerContentsInsertDegree')}</Text>
                                </View>
                            </View>

                            <View style={{ width: '100%', marginTop: 20, }}>
                                {/* <TouchableOpacity onPress={() => this.setState({ isFetching: false }, () => this._ContentsInsert())}> */}
                                <TouchableOpacity onPress={() => this.setState({ isFetching: true }, () => this._ContentsInsert())} disabled={(this.state.selectCategoryList.length > 0 && this.state.placeDatas.length > 0 && this.state.placeInfoSingleLineDatas.length > 0 && this.state.placeInfoDatas.length > 0 && this.state.mapSearchText.length > 0 && this.state.selectedCountryNo != -1 && this.state.selectedCityNo != -1 && this.state.selectedRegionNo != -1 && this.state.addressDetail.length > 0 && this.state.placeTel.length > 0 && this.state.placeWeb.length > 0 && this.state.goodsDatas.length > 0 && this.state.creatorName.length > 0 && this.state.creatorUrl.length > 0 && this.state.coverDatas.length > 0 && this.state.photoDatas.length > 0 && this.state.creatorDatas.length > 0 && this.state.degreeCheck == true) ? false : true}>
                                    <View style={{ width: '100%', height: 48, borderRadius: 4, backgroundColor: (this.state.selectCategoryList.length > 0 && this.state.placeDatas.length > 0 && this.state.placeInfoSingleLineDatas.length > 0 && this.state.placeInfoDatas.length > 0 && this.state.mapSearchText.length > 0 && this.state.selectedCountryNo != -1 && this.state.selectedCityNo != -1 && this.state.selectedRegionNo != -1 && this.state.addressDetail.length > 0 && this.state.placeTel.length > 0 && this.state.placeWeb.length > 0 && this.state.goodsDatas.length > 0 && this.state.creatorName.length > 0 && this.state.creatorUrl.length > 0 && this.state.coverDatas.length > 0 && this.state.photoDatas.length > 0 && this.state.creatorDatas.length > 0 && this.state.degreeCheck == true) ? Colors.color2D7DC8 : Colors.colorB7B7B7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginLeft: 9 }}>{I18n.t('managerContentsInsertAdd')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ height: 40 }}></View>

                    </KeyboardAwareScrollView>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView >
        )

    }
}