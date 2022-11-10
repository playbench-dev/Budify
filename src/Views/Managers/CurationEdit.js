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
import SelectDropdown from 'react-native-select-dropdown'
import FetchingIndicator from 'react-native-fetching-indicator'
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist"
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';

const TAG = "CurationEdit";
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

export default class CurationEdit extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this._ContentsPlace()
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
        placeDatas: [],
        placeInfoSingleLineDatas: [],
        placeInfoDatas: [],
        lat: 37.564214,
        lng: 127.001699,
        mapSearchText: '',
        placeTimeDatas: [],
        goodsDatas: [],
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
        searchText: '',
        searchDatas: [],
        selectDatas: [],
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
        if (this.state.selectDatas.filter((el) => el.place_no == item.place_no).length > 0) {
            const newList = this.state.selectDatas.filter((el) => el.place_no !== item.place_no);
            this.setState({ selectDatas: newList })
        } else {
            this.state.selectDatas.push(item)
            this.setState({
                isLoading: true
            })
        }
    }

    async _ContentsUpdate() {
        let placeObj = {
            default: this.state.placeDatas.filter((el) => el.language == 'default').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'default')[0].place.replace(/"/gi, '&quot;').replace(/'/gi, '&#039;') || '',
            ko: this.state.placeDatas.filter((el) => el.language == 'ko').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'ko')[0].place.replace(/"/gi, '&quot;').replace(/'/gi, '&#039;') || '',
            en: this.state.placeDatas.filter((el) => el.language == 'en').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'en')[0].place.replace(/"/gi, '&quot;').replace(/'/gi, '&#039;') || '',
            ja: this.state.placeDatas.filter((el) => el.language == 'ja').length == 0 ? '' : this.state.placeDatas.filter((el) => el.language == 'ja')[0].place.replace(/"/gi, '&quot;').replace(/'/gi, '&#039;') || '',
        }
        console.log(placeObj)
        let placeSingleInfoObj = {
            default: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'default').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'default')[0].placeInfo.replace(/"/gi, '&quot;').replace(/'/gi, '&#039;') || '',
            ko: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ko').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ko')[0].placeInfo.replace(/"/gi, '&quot;').replace(/'/gi, '&#039;') || '',
            en: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'en').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'en')[0].placeInfo.replace(/"/gi, '&quot;').replace(/'/gi, '&#039;') || '',
            ja: this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ja').length == 0 ? '' : this.state.placeInfoSingleLineDatas.filter((el) => el.language == 'ja')[0].placeInfo.replace(/"/gi, '&quot;').replace(/'/gi, '&#039;') || '',
        }
        console.log(placeSingleInfoObj)

        let placeList = [];
        for (let i = 0; i < this.state.selectDatas.length; i++) {
            const obj = {
                priority: i,
                place_no: this.state.selectDatas[i].place_no,
                categories: this.state.selectDatas[i].categories,
                place_name: this.state.selectDatas[i].place_name,
                country: this.state.selectDatas[i].country,
                city: this.state.selectDatas[i].city,
                town: this.state.selectDatas[i].town,
                images_urls: this.state.selectDatas[i].images_urls
            }
            placeList.push(obj)
        }

        const url = ServerUrl.UpdateCurations
        let formBody = {};
        formBody = JSON.stringify({
            "curations_no": this.props.route.params.curationNo,
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
            this._UpdatePlaceImageRepresentative()
            // this.setState({
            //     isFetching: false,
            // })
        } else {
            this.setState({
                isFetching: false,
            })
        }
    }

    _UpdatePlaceImageRepresentative() {
        var url = "";
        let formdata = new FormData();
        url = ServerUrl.UpdateCurationImageRep
        formdata.append('curations_no', this.props.route.params.curationNo)

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
                formdata.append("curations_image_representative", photo);
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

    async _ContentsPlace() {
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
        console.log('aa', json)
        const coverUrl = JSON.parse(json.list[0].curations_image_representative)
        const categoryToInt = [];
        JSON.parse(json.list[0].categories.replace((/'/gi), '')).map((item, index) => {
            categoryToInt.push(item)
        })
        const placeTitle = JSON.parse(json.list[0].title);
        const placeContents = JSON.parse(json.list[0].introduce);
        //장소이름
        if (placeTitle.default != undefined && placeTitle.default.length > 0) {
            const placeObj = {
                no: this.state.placeDatas.length,
                language: 'default',
                place: placeTitle.default
            }
            this.state.placeDatas.push(placeObj)
        }
        if (placeTitle.ko != undefined && placeTitle.ko.length > 0) {
            const placeObj = {
                no: this.state.placeDatas.length,
                language: 'ko',
                place: placeTitle.ko
            }
            this.state.placeDatas.push(placeObj)
        }
        if (placeTitle.en != undefined && placeTitle.en.length > 0) {
            const placeObj = {
                no: this.state.placeDatas.length,
                language: 'en',
                place: placeTitle.en
            }
            this.state.placeDatas.push(placeObj)
        }
        if (placeTitle.ja != undefined && placeTitle.ja.length > 0) {
            const placeObj = {
                no: this.state.placeDatas.length,
                language: 'ja',
                place: placeTitle.ja
            }
            this.state.placeDatas.push(placeObj)
        }
        console.log(this.state.placeDatas.length)
        //설명
        if (placeContents.default != undefined && placeContents.default.length > 0) {
            const placeObj = {
                no: this.state.placeInfoSingleLineDatas.length,
                language: 'default',
                placeInfo: placeContents.default
            }
            this.state.placeInfoSingleLineDatas.push(placeObj)
        }
        if (placeContents.ko != undefined && placeContents.ko.length > 0) {
            const placeObj = {
                no: this.state.placeInfoSingleLineDatas.length,
                language: 'ko',
                placeInfo: placeContents.ko
            }
            this.state.placeInfoSingleLineDatas.push(placeObj)
        }
        if (placeContents.en != undefined && placeContents.en.length > 0) {
            const placeObj = {
                no: this.state.placeInfoSingleLineDatas.length,
                language: 'en',
                placeInfo: placeContents.en
            }
            this.state.placeInfoSingleLineDatas.push(placeObj)
        }
        if (placeContents.ja != undefined && placeContents.ja.length > 0) {
            const placeObj = {
                no: this.state.placeInfoSingleLineDatas.length,
                language: 'ja',
                placeInfo: placeContents.ja
            }
            this.state.placeInfoSingleLineDatas.push(placeObj)
        }
        console.log(JSON.parse(json.list[0].place_list))
        this.setState({
            selectCategoryList: categoryToInt,
            isFetching: false,
            selectedCountryNo: json.list[0].country,
            selectedCityNo: json.list[0].city,
            selectedRegionNo: json.list[0].town,
            selectedCountry: json.list[0].country == -1 ? '' : Utils.Grinder(User.country.filter((el) => el.country_no == json.list[0].country)[0]),
            selectedCity: json.list[0].city == -1 ? '' : Utils.Grinder(User.city.filter((el) => el.city_no == json.list[0].city)[0]),
            selectedRegion: json.list[0].town == -1 ? '' : Utils.Grinder(User.region.filter((el) => el.town_no == json.list[0].town)[0]),
            coverDatas: coverUrl.map((item, index) => ({ path: ServerUrl.Server + coverUrl[index], fileName: coverUrl[index], mime: 'image/' + coverUrl[index].split('.').pop() })),
            selectDatas: JSON.parse(json.list[0].place_list)
        })
        // console.log(this.state.selectCategoryList)
    }

    async _SearchPlace() {
        const url = ServerUrl.SearchContentsPlace
        let formBody = {};
        this.state.searchDatas = [];
        formBody = JSON.stringify({
            "keyword": this.state.searchText,
            "conditions": [
                {
                    "q": "=",
                    "f": "user_no",
                    "v": User.userNo
                },
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
            console.log('namename', json.list[i].place_no)
            if (json.list[i].image_urls != null) {
                for (let j = 0; j < JSON.parse(json.list[i].image_urls).length; j++) {
                    FastImage.preload([{ uri: ServerUrl.Server + JSON.parse(json.list[i].image_urls)[j], headers: { Authorization: 'authToken' }, }])
                    newImage.push(ServerUrl.Server + JSON.parse(json.list[i].image_urls)[j])
                }
            }
            const obj = {
                place_no: json.list[i].place_no,
                place_name: JSON.parse(json.list[i].place_name),
                town: json.list[i].town,
                city: json.list[i].city,
                country: json.list[i].country,
                categories: JSON.parse(json.list[i].categories.replace(/'/gi, '')),
                images_urls: newImage,
            }
            this.state.searchDatas.push(obj)
        }
        this.setState({
            isFetching: false,
        })
    }

    render() {
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
                                    <TouchableOpacity onPress={() => this._CategoryView('' + item.category_no)} style={{ justifyContent: 'center', marginTop: 12 }}>
                                        <View style={{ borderWidth: 1, borderColor: Colors.color4D4A4A, borderRadius: 4, height: 48, width: (screenWidth - 44) / 2, marginLeft: index % 2 == 0 ? 0 : 12, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ color: Colors.color4D4A4A, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{item.ko}</Text>
                                        </View>
                                        {this.state.selectCategoryList.includes('' + item.category_no) && <View style={{ position: 'absolute', width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: Colors.color2D7DC8, left: index % 2 == 0 ? 12 : 24, alignItems: 'center', justifyContent: 'center', }}>
                                            <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 14, }}>{this.state.selectCategoryList.indexOf('' + item.category_no) + 1}</Text>
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
                                            <TextInput onChangeText={(text) => this._PlaceInsert({ type: 3, place: text, no: index1 })} value={item.place} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('curationInsertObjectHint')} placeholderTextColor={Colors.colorC4C4C4}></TextInput>
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
                                            <TextInput onChangeText={(text) => this._PlaceSingleInfoInsert({ type: 3, placeInfo: text, no: index1 })} value={item.placeInfo} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('curationInsertSingleLine')} placeholderTextColor={Colors.colorC4C4C4}></TextInput>
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
                                <TextInput onSubmitEditing={() => this._SearchPlace()} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 11 }} placeholder={I18n.t('curationInsertSearchHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => this.setState({ searchText: text })}></TextInput>
                            </View>

                        </View>

                        {this.state.searchDatas.map((item, index) => (
                            <View style={{ flexDirection: 'row', marginTop: 20, paddingLeft: 16 }}>
                                <TouchableOpacity style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }} onPress={() => this._ContentsView(item)}>
                                    <Image source={this.state.selectDatas.filter((el) => el.place_no == item.place_no).length > 0 ? imgCheckOn : imgCheckOff} style={{ width: 17, height: 17, resizeMode: 'contain' }}></Image>
                                </TouchableOpacity>
                                <View style={{ marginLeft: 13, }}>
                                    <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{Utils.GrinderContents(item.place_name)}</Text>
                                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                        <Image style={{ width: 10, height: 13, resizeMode: 'contain' }} source={imgLocation}></Image>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 6 }}>{Utils.Grinder(User.region.filter((el) => el.town_no == item.town)[0]) + " ・ " + Utils.Grinder(User.city.filter((el) => el.city_no == item.city)[0])}</Text>
                                        <Text style={{ color: Colors.color5B5B5B, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == item.categories[0])[0])}</Text>
                                    </View>
                                    <FlatList style={{ marginTop: 16 }} horizontal keyExtractor={(item, index) => index.toString()} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
                                        data={item.images_urls} renderItem={(obj) => {
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
                                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{Utils.GrinderContents(item.place_name)}</Text>
                                                        <View style={{ flex: 1 }}></View>
                                                        <TouchableOpacity style={{ width: 15, height: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorE94D3E, borderRadius: 8 }} onPress={() => this._ContentsView(item)}>
                                                            <Image source={imgDelete} style={{ width: 7, height: 8, resizeMode: 'contain' }}></Image>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                                        <Image style={{ width: 10, height: 13, resizeMode: 'contain' }} source={imgLocation}></Image>
                                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 6 }}>{Utils.Grinder(User.region.filter((el) => el.town_no == item.town)[0]) + " ・ " + Utils.Grinder(User.city.filter((el) => el.city_no == item.city)[0])}</Text>
                                                        <Text style={{ color: Colors.color5B5B5B, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == parseInt(item.categories[0]))[0])}</Text>
                                                    </View>
                                                    <FlatList style={{ marginTop: 16 }} horizontal keyExtractor={(item, index) => index.toString()} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
                                                        data={item.images_urls} renderItem={(obj1) => {
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
                                <TouchableOpacity onPress={() => this.setState({ isFetching: true }, () => this._ContentsUpdate())} >
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