import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, Animated, TextInput, PermissionsAndroid, ScrollView, Platform, LogBox } from 'react-native'
import SelectDialog from '../../Common/SelectDialog'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import * as NetworkCall from '../../Common/NetworkCall'
import * as Utils from '../../Common/Utils'
import User from '../../Common/User';
import FastImage from 'react-native-fast-image';
import ServerUrl from '../../Common/ServerUrl'
import CategoriesDialog from '../../Common/CategoriesDialog'
import CurationCategoriesDialog from '../../Common/CategoriesDialog'
import Moment from 'moment'
import LanguageDialog from '../../Common/LagnuageDialog';
import RNFetchBlob from "rn-fetch-blob";
import SelectDropdown from 'react-native-select-dropdown'
import FetchingIndicator from 'react-native-fetching-indicator'
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist"
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';

LogBox.ignoreLogs([
    'Each child in a list should have a unique "key" prop.', 'onAnimatedValueUpdate', 'Warning', 'Possible Unhandled Promise Rejection'
]);

const TAG = "CurationInsert";
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
const imgSearch = require('../../../assets/ic_search.png');
const imgDrag = require('../../../assets/ic_drag.png');

const { width: screenWidth } = Dimensions.get('window');
const fs = RNFetchBlob.fs;
let imagePath = null;

export default class CurationInsert extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // this._ContentsPlace()
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
        goodsDatas: [{ 'no': 0, 'name': '', 'currency': 'KRW', 'price': '', 'language': 'default' }],
        photoWidth: screenWidth - 80,
        degreeCheck: false,
        photoType: 1, //1-creator (2), 2-images (1), 3-representative (2)
        photoDatas: [],
        coverDatas: [],
        creatorDatas: [],
        tagDatas: [],
        curationNo: 0,
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
        searchText: '',
        searchDatas: [],
        selectDatas: [],
        scrollFlag: true,
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

    _ContentsView(item) {
        if (this.state.selectDatas.filter((el) => el.placeNo == item.placeNo).length > 0) {
            const newList = this.state.selectDatas.filter((el) => el.placeNo !== item.placeNo);
            this.setState({ selectDatas: newList })
        } else {
            this.state.selectDatas.push(item)
            this.setState({
                isLoading: true
            })
        }
    }

    async _CurationInsert() {
        let placeObj = {
            default: this.state.placeDatas.filter((el) => el.language == 'default').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'default')[0].place || '',
            ko: this.state.placeDatas.filter((el) => el.language == 'ko').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'ko')[0].place || '',
            en: this.state.placeDatas.filter((el) => el.language == 'en').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'en')[0].place || '',
            ja: this.state.placeDatas.filter((el) => el.language == 'ja').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'ja')[0].place || '',
        }
        console.log(placeObj)
        let placeSingleInfoObj = {
            default: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'default').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'default')[0].placeInfo || '',
            ko: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ko').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ko')[0].placeInfo || '',
            en: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'en').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'en')[0].placeInfo || '',
            ja: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ja').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ja')[0].placeInfo || '',
        }
        console.log(placeSingleInfoObj)
        let placeList = [];
        for (let i = 0; i < this.state.selectDatas.length; i++) {
            const obj = {
                priority: i,
                place_no: this.state.selectDatas[i].placeNo,
                categories: this.state.selectDatas[i].category,
                place_name: this.state.selectDatas[i].placeName,
                info: this.state.selectDatas[i].info,
                country: this.state.selectDatas[i].country,
                city: this.state.selectDatas[i].city,
                town: this.state.selectDatas[i].town,
                images_urls: this.state.selectDatas[i].imageUrls,
                repPath: this.state.selectDatas[i].repPath,
            }
            placeList.push(obj)
        }

        const url = ServerUrl.InsertCuration
        let formBody = {};
        formBody = JSON.stringify({
            "user_no": User.userNo,
            "title": placeObj,
            "introduce": placeSingleInfoObj,
            "categories": this.state.selectCategoryList,
            "country": this.state.selectedCountryNo,
            "city": this.state.selectedCityNo,
            "town": this.state.selectedRegionNo,
            "place_list": JSON.stringify(placeList),
        })
        console.log(formBody)
        const json = await NetworkCall.Select(url, formBody)
        console.log(json)
        if (json.length > 0) {
            this.state.curationNo = json[0].curations_no
            this._UpdateCurationImageRepresentative()
        } else {
            this.setState({
                isFetching: false,
            })
        }
    }

    _UpdateCurationImageRepresentative() {
        var url = "";
        let formdata = new FormData();
        url = ServerUrl.UpdateCurationImageRep
        console.log(this.state.curationNo)
        formdata.append('curations_no', this.state.curationNo)

        if (this.state.coverDatas.length > 0) {
            // for (let i = 0; i < this.state.coverDatas.length; i++) {
            //     if (Platform.OS == 'android') {
            //         let imageName = this.state.coverDatas[i].uri.split('/').pop();
            //         let imageType = this.state.coverDatas[i].uri.split('.').pop();

            //         const photo = {
            //             uri: this.state.coverDatas[i].uri,
            //             type: 'image/' + imageType,
            //             filename: imageName,
            //             name: imageName,
            //         };
            //         formdata.append("curations_image_representative", photo);
            //     } else {
            //         let imageName = this.state.coverDatas[i].filename == undefined ? this.state.coverDatas[i].uri.split('/').pop() : this.state.coverDatas[i].filename;
            //         let imageType = this.state.coverDatas[i].filename == undefined ? this.state.coverDatas[i].uri.split('.').pop() : this.state.coverDatas[i].filename.split('.')[1];
            //         const photo = {
            //             uri: this.state.coverDatas[i].uri,
            //             type: 'image/' + imageType,
            //             filename: imageName,
            //             name: imageName,
            //         };
            //         formdata.append("curations_image_representative", photo);
            //     }
            // }
            for (let i = 0; i < this.state.coverDatas.length; i++) {
                let imageName = this.state.coverDatas[i].fileName;
                // let imageType = this.state.coverDatas[i].filename == undefined ? this.state.coverDatas[i].uri.split('.').pop() : this.state.coverDatas[i].filename.split('.')[1];
                const photo = {
                    uri: this.state.coverDatas[i].path,
                    type: this.state.coverDatas[i].mime,
                    filename: imageName,
                    name: imageName,
                };
                formdata.append("curations_image_representative", photo);
            }
        }
        console.log(formdata)
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

    async _ContentsPlace() {
        const url = ServerUrl.SearchContentsPlace
        let formBody = {};
        this.state.searchDatas = [];
        formBody = JSON.stringify({
            "keyword": this.state.searchText,
            "conditions": [
                {
                    "op": "AND",
                    "q": "=",
                    "f": "status",
                    "v": 1
                },
            ]
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log(TAG, json)

        for (let i = 0; i < json.list.length; i++) {
            let newImage = [];
            if (json.list[i].image_urls != null) {
                for (let j = 0; j < JSON.parse(json.list[i].image_urls).length; j++) {
                    // FastImage.preload([{ uri: ServerUrl.Server + JSON.parse(json.list[i].image_urls)[j], headers: { Authorization: 'authToken' }, }])
                    newImage.push(ServerUrl.Server + JSON.parse(json.list[i].image_urls)[j])
                }
            }
            const obj = {
                placeNo: json.list[i].place_no,
                placeName: JSON.parse(json.list[i].place_name),
                info: JSON.parse(json.list[i].content),
                town: json.list[i].town,
                city: json.list[i].city,
                country: json.list[i].country,
                category: JSON.parse(json.list[i].categories.replace(/'/gi, '')),
                imageUrls: newImage,
                repPath: JSON.parse(json.list[i].image_representative)[0]
            }
            this.state.searchDatas.push(obj)
        }
        this.setState({
            isFetching: false,
        })
    }

    renderItem = ({ item, drag }) => (
        <TouchableOpacity onLongPress={drag} onPress={() => this.setState({ scrollFlag: this.state.scrollFlag == false ? true : false })}>
            <View style={{ flexDirection: 'row', marginTop: 20, width: '100%', paddingLeft: 16, }}>
                <TouchableOpacity style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }} >
                    <Image source={imgDrag} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                </TouchableOpacity>
                <View style={{ marginLeft: 13, flex: 1 }}>
                    <View style={{ flexDirection: 'row', paddingRight: 20 }}>
                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{Utils.GrinderContents(item.placeName)}</Text>
                        <View style={{ flex: 1 }}></View>
                        <TouchableOpacity style={{ width: 15, height: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorE94D3E, borderRadius: 8 }} onPress={() => this._ContentsView(item)}>
                            <Image source={imgDelete} style={{ width: 7, height: 8, resizeMode: 'contain' }}></Image>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                        <Image style={{ width: 10, height: 13, resizeMode: 'contain' }} source={imgLocation}></Image>
                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 6 }}>{Utils.Grinder(User.region.filter((el) => el.town_no == item.town)[0]) + " ・ " + Utils.Grinder(User.city.filter((el) => el.city_no == item.city)[0])}</Text>
                        {/* <Text style={{ color: Colors.color5B5B5B, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == item.category[0])[0])}</Text> */}
                    </View>
                    <FlatList style={{ marginTop: 16 }} horizontal keyExtractor={(item, index) => index.toString()} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
                        data={item.imageUrls} renderItem={(obj1) => {
                            return (
                                <View style={{ width: 100, height: 100, marginLeft: obj1.index == 0 ? 0 : 8 }}>
                                    <FastImage style={{ width: '100%', height: '100%', borderRadius: 4 }} source={{ uri: obj1.item, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                </View>
                            )
                        }}></FlatList>
                </View>
            </View>
        </TouchableOpacity>
    );

    render() {
        console.log(this.state.searchDatas.length)
        // const data1111 = [
        //     {
        //         id: 1,
        //         name: '',
        //         rows: this.state.selectDatas.map((item, index) =>
        //             item.placeNo === item.placeNo ? { id: '' + index + 1, placeNo: item.placeNo, placeName: item.placeName, town: item.town, city: item.city, category: item.category, imageUrls: item.imageUrls, } : item)
        //     }
        // ]
        // const boardRepository = new BoardRepository(data1111);
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    {this._CallDialog()}
                    {/* {this._CategoryDialog()} */}
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('curationInsertTitle')}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center', paddingLeft: 16, paddingRight: 16, marginTop: 20 }}>
                        <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(156, 159, 161, 0.5)', }}></View>
                    </View>

                    <NestableScrollContainer showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
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
                                <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, flex: 1 }}>{I18n.t('curationInsertObject')}</Text>
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
                                            <TextInput onChangeText={(text) => this._PlaceInsert({ type: 3, place: text, no: index1 })} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('curationInsertObjectHint')} placeholderTextColor={Colors.colorC4C4C4}></TextInput>
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
                                <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, flex: 1 }}>{I18n.t('curationInsertSingleLine')}</Text>
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
                                            <TextInput onChangeText={(text) => this._PlaceSingleInfoInsert({ type: 3, placeInfo: text, no: index1 })} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('curationInsertSingleLine')} placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                                            {index1 > 0 && <TouchableOpacity style={{ position: 'absolute', right: 9 }} onPress={() => this._PlaceSingleInfoInsert({ type: 4, no: index1 })}>
                                                <View style={{ width: 25, height: 25, borderRadius: 20, backgroundColor: Colors.colorE94D3E, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image source={imgDelete} style={{ width: 12, height: 13, resizeMode: 'contain' }}></Image>
                                                </View>
                                            </TouchableOpacity>}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={{ marginTop: 20, paddingLeft: 16, paddingRight: 16 }}>
                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, flex: 1 }}>{I18n.t('curationInsertLocationTitle')}</Text>
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

                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginTop: 20 }}>{I18n.t('curationInsertSearchTitle')}</Text>
                            <View style={{ borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, alignItems: 'center', paddingLeft: 12, height: 48, marginTop: 12, flexDirection: 'row' }}>
                                <Image source={imgSearch} style={{ width: 18, height: 18, resizeMode: 'contain' }}></Image>
                                <TextInput onSubmitEditing={() => this._ContentsPlace()} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 11 }} placeholder={I18n.t('curationInsertSearchHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => this.setState({ searchText: text })}></TextInput>
                            </View>

                        </View>

                        {this.state.searchDatas.map((item, index) => (
                            <View style={{ flexDirection: 'row', marginTop: 20, paddingLeft: 16 }}>
                                <TouchableOpacity style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._ContentsView(item)}>
                                    <Image source={this.state.selectDatas.filter((el) => el.placeNo == item.placeNo).length > 0 ? imgCheckOn : imgCheckOff} style={{ width: 17, height: 17, resizeMode: 'contain' }}></Image>
                                </TouchableOpacity>
                                <View style={{ marginLeft: 13, }}>
                                    <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{Utils.GrinderContents(item.placeName)}</Text>
                                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                        <Image style={{ width: 10, height: 13, resizeMode: 'contain' }} source={imgLocation}></Image>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 6 }}>{Utils.Grinder(User.region.filter((el) => el.town_no == item.town)[0]) + " ・ " + Utils.Grinder(User.city.filter((el) => el.city_no == item.city)[0])}</Text>
                                        <Text style={{ color: Colors.color5B5B5B, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == item.category[0])[0])}</Text>
                                    </View>
                                    <FlatList style={{ marginTop: 16 }} horizontal keyExtractor={(item, index) => index.toString()} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
                                        data={item.imageUrls} renderItem={(obj) => {
                                            return (
                                                <View style={{ width: 100, height: 100, marginLeft: obj.index == 0 ? 0 : 8 }}>
                                                    <FastImage style={{ width: '100%', height: '100%', borderRadius: 4 }} source={{ uri: obj.item, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                </View>
                                            )
                                        }}></FlatList>
                                </View>
                            </View>
                        ))}

                        {this.state.selectDatas.length > 0 && (
                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, flex: 1, marginLeft: 16, marginRight: 16, marginTop: 27 }}>{I18n.t('curationInsertLocationTitle')}</Text>
                        )}
                        {this.state.selectDatas.length > 0 && (

                            <View style={{ borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, paddingRight: 16, paddingLeft: 16, marginLeft: 16, marginRight: 16, marginTop: 12, paddingBottom: 20 }}>
                                <NestableDraggableFlatList
                                    containerStyle={{ width: '100%', }}
                                    data={this.state.selectDatas}
                                    renderItem={({ item, drag, isActive }) => {
                                        return (
                                            <View style={{ flexDirection: 'row', marginTop: 20, width: '100%', paddingLeft: 16, }}>
                                                <TouchableOpacity style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }} onPressIn={drag}>
                                                    <Image source={imgDrag} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                                                </TouchableOpacity>
                                                <View style={{ marginLeft: 13, flex: 1 }}>
                                                    <View style={{ flexDirection: 'row', paddingRight: 20 }}>
                                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{Utils.GrinderContents(item.placeName)}</Text>
                                                        <View style={{ flex: 1 }}></View>
                                                        <TouchableOpacity style={{ width: 15, height: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorE94D3E, borderRadius: 8 }} onPress={() => this._ContentsView(item)}>
                                                            <Image source={imgDelete} style={{ width: 7, height: 8, resizeMode: 'contain' }}></Image>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                                        <Image style={{ width: 10, height: 13, resizeMode: 'contain' }} source={imgLocation}></Image>
                                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 6 }}>{Utils.Grinder(User.region.filter((el) => el.town_no == item.town)[0]) + " ・ " + Utils.Grinder(User.city.filter((el) => el.city_no == item.city)[0])}</Text>
                                                        <Text style={{ color: Colors.color5B5B5B, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == item.category[0])[0])}</Text>
                                                    </View>
                                                    <FlatList style={{ marginTop: 16 }} horizontal keyExtractor={(item, index) => index.toString()} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
                                                        data={item.imageUrls} renderItem={(obj1) => {
                                                            return (
                                                                <View style={{ width: 100, height: 100, marginLeft: obj1.index == 0 ? 0 : 8 }}>
                                                                    <FastImage style={{ width: '100%', height: '100%', borderRadius: 4 }} source={{ uri: obj1.item, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                </View>
                                                            )
                                                        }}></FlatList>
                                                </View>
                                            </View>
                                        )
                                    }}
                                    keyExtractor={(item, index) => index.toString()}
                                    onDragEnd={({ data }) => this.setState({ selectDatas: data })}
                                />
                            </View>
                        )}


                        <View style={{ paddingLeft: 16, paddingRight: 16 }}>
                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginTop: 20 }}>{I18n.t('curationInsertRep')}</Text>
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

                            <View style={{ width: '100%', marginTop: 20, }}>
                                <TouchableOpacity onPress={() => this.setState({ isFetching: true }, () => this._CurationInsert())} >
                                    <View style={{ width: '100%', height: 48, borderRadius: 4, backgroundColor: this.state.selectCategoryList.length > 0 ? Colors.color2D7DC8 : Colors.colorB7B7B7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginLeft: 9 }}>{I18n.t('curationInsertUpload')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ height: 80 }}></View>
                    </NestableScrollContainer>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView >
        )

    }
}