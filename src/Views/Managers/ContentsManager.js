import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, Animated, TextInput, } from 'react-native'
import SelectDialog from '../../Common/SelectDialog'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import * as Utils from '../../Common/Utils'
import Orientation from 'react-native-orientation'
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-community/async-storage';
import User from '../../Common/User';
import FastImage from 'react-native-fast-image';
import ServerUrl from '../../Common/ServerUrl'
import * as NetworkCall from '../../Common/NetworkCall'
import CategoriesDialog from '../../Common/CategoriesDialog'
import CurationCategoriesDialog from '../../Common/CategoriesDialog'
import Moment from 'moment'
import LanguageDialog from '../../Common/LagnuageDialog';
import TimeDialog from '../../Common/TimeDialog'
import FetchingIndicator from 'react-native-fetching-indicator'

const TAG = "ContentsManager";
const imgPlus = require('../../../assets/ic_plus.png');
const imgRegionBg = require('../../../assets/img_region_bg.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgCanlendar = require('../../../assets/ic_calendar_icon.png');
const imgRightArrow = require('../../../assets/ic_arrow_right.png');
const imgCircleSaveBg = require('../../../assets/ic_circle_saved.png');
const imgBookmark = require('../../../assets/ic_bookmark.png');
const imgStarOn = require('../../../assets/ic_star.png');
const imgStarOff = require('../../../assets/ic_star_off.png');
const imgCalendarPrevious = require('../../../assets/ic_calendar_arrow_left.png');
const imgCalendarNext = require('../../../assets/ic_calendar_arrow_right.png');
const imgSearch = require('../../../assets/ic_search.png');
const imgBack = require('../../../assets/ic_back.png');
const imgClose = require('../../../assets/ic_close.png')

const { width: screenWidth } = Dimensions.get('window');

export default class ContentsManager extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        AsyncStorage.getItem('firstRegion', (err, result) => {
            console.log(result)
            if (result != null) {
                const firstRegion = JSON.parse(result);
                this.setState({
                    selectedCountryNo: firstRegion.countryNo,
                    selectedCityNo: firstRegion.cityNo || -1,
                    selectedRegionNo: firstRegion.regionNo || -1,
                    selectedCountry: Utils.Grinder(User.country.filter((el) => el.country_no == firstRegion.countryNo)[0]),
                    selectedCity: Utils.Grinder(User.city.filter((el) => el.city_no == firstRegion.cityNo)[0]),
                    selectedRegion: Utils.Grinder(User.region.filter((el) => el.town_no == firstRegion.regionNo)[0]),
                })
                this._ContentsPlace()
            }
        })
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
        isFetching: true,
        offset: 0,
        selectedCountyPosition: -1,
        selectedCityPosition: -1,
        selectedRegionPosition: -1,
        selectedCountryNo: -1,
        selectedCityNo: -1,
        selectedRegionNo: -1,
        datas: [],
        dialogVisible: false,
        deleteNo: -1,
        searchText: '',
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
            else if (type == '3') {
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
                showSelectedScheduleDate: Moment(this.state._markedDates[0]).format('MMMM').substring(0, 3) + ' ' + Moment(this.state._markedDates[0]).format('D') + ' - ' + Moment(this.state._markedDates[this.state._markedDates.length - 1]).format('MMMM').substring(0, 3) + ' ' + Moment(this.state._markedDates[this.state._markedDates.length - 1]).format('D'),
                total: 0,
                offset: 0,
                isFetching: true,
            }, () => this._ContentsPlace());
        } else if (value.type == '3') {
            this.setState({
                selectDialogVisible: false,
                selectedRegion: Utils.Grinder(User.region.filter((el) => el.town_no == value.no)[0]),
                selectedRegionNo: value.no,
                selectedRegionPosition: value.selectedPosition,
                total: 0,
                offset: 0,
                isFetching: true,
            }, () => this._ContentsPlace());
        } else if (value.type == '2') {
            this.regionDatas = [];
            this.setState({
                selectDialogVisible: false,
                selectedCity: Utils.Grinder(User.city.filter((el) => el.city_no == value.no)[0]),
                selectedRegion: '',
                selectedRegionPosition: -1,
                regionDatas: [],
                selectedCityNo: value.no,
                selectedCityPosition: value.selectedPosition,
                total: 0,
                offset: 0,
                isFetching: true,
            }, () => this._ContentsPlace());
        } else if (value.type == '1') {
            this.cityDatas = [];
            this.setState({
                selectDialogVisible: false,
                selectedCountry: Utils.Grinder(User.country.filter((el) => el.country_no == value.no)[0]),
                selectedCity: '',
                selectedRegion: '',
                selectedCityPosition: -1,
                selectedRegionPosition: -1,
                selectedCountryNo: value.no,
                selectedCountyPosition: value.selectedPosition,
                cityDatas: [],
                regionDatas: [],
                total: 0,
                offset: 0,
                isFetching: true,
            }, () => this._ContentsPlace());
        } else if (value.type == '5') {
            this.setState({
                selectDialogVisible: false,
            });
        } else if (value.type == '6') {
            this.setState({
                categoryDialogVisible: false,
                categorySelectedTextDatas: value.selectedTextDatas,
                total: 0,
                offset: 0,
                isFetching: true,
            }, () => this._ContentsPlace());
        } else if (value.type == '7') {
            this.setState({
                categoryDialogVisible: false,
                languageSelectedTextDatas: value.selectedTextDatas.sort((a, b) => a.no - b.no),
                total: 0,
                offset: 0,
                isFetching: true,
            }, () => this._ContentsPlace());
        } else if (value.type == '8') {
            this.setState({
                categoryDialogVisible: false,
                curationCategorySelectedTextDatas: value.selectedTextDatas,
                total: 0,
                offset: 0,
                isFetching: true,
            }, () => this._ContentsPlace());
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
                return <CategoriesDialog title={I18n.t('contentsCategories')} datas={User.contentsCategory} type={type} click={this._ClickDialog} selectedTextDatas={this.state.categorySelectedTextDatas} ></CategoriesDialog>
            } else if (type == '7') {
                return <TimeDialog title={I18n.t('contentsCategories')} datas={Utils.TimeCategorys()} type={type} click={this._ClickDialog} selectedTextDatas={this.state.languageSelectedTextDatas} ></TimeDialog>
            } else if (type == '8') {
                return <CurationCategoriesDialog title={I18n.t('contentsCategories')} datas={User.contentsCategory} type={type} click={this._ClickDialog} selectedTextDatas={this.state.curationCategorySelectedTextDatas} ></CurationCategoriesDialog>
            }
        }
    }

    async _ContentsPlace() {
        const url = ServerUrl.SearchContentsPlace
        const timeSelected = this.state.languageSelectedTextDatas.map(
            el => el.no === el.no ? { start: el.start, end: el.end } : el
        )
        let formBody = {};
        let categoriesList = [];
        this.state.datas = [];
        this.state.categorySelectedTextDatas.map((item, index) => categoriesList.push(item.category_no))
        const condition = [
            {
                "q": "=",
                "f": "user_no",
                "v": User.userNo
            },
            {
                "op": "AND",
                "q": "=",
                "f": this.state.selectedRegion.length != 0 ? 'town' : this.state.selectedCity.length != 0 ? 'city' : 'country',
                "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
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
            },]
        if (this.state._markedDates.length > 0) {
            if (timeSelected.length > 0) {
                if (categoriesList.length == 0) {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.offset,
                        "start_dt": this.state._markedDates[0],
                        "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                        "timezone": timeSelected,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.offset,
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
                        "offset": this.state.offset,
                        "start_dt": this.state._markedDates[0],
                        "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.offset,
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
                        "offset": this.state.offset,
                        "timezone": timeSelected,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.offset,
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
                        "offset": this.state.offset,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                } else {
                    formBody = JSON.stringify({
                        "limit": 12,
                        "offset": this.state.offset,
                        "categories": categoriesList.length == 0 ? null : categoriesList,
                        "keyword": this.state.searchText,
                        "conditions": condition
                    })
                }
            }
        }
        const json = await NetworkCall.Select(url, formBody)
        console.log(TAG, json)
        for (let i = 0; i < json.list.length; i++) {
            console.log(JSON.parse(json.list[i].image_representative).length)
            console.log(json.list[i].place_no == 75 && JSON.parse(json.list[i].place_name).default)
            const obj = {
                placeNo: json.list[i].place_no,
                repPath: JSON.parse(json.list[i].image_representative),
                category: JSON.parse(json.list[i].categories.replace(/'/gi, '')),
                placeName: JSON.parse(json.list[i].place_name),
                countryNo: json.list[i].country,
                cityNo: json.list[i].city,
                regionNo: json.list[i].town
            }
            this.state.datas.push(obj)
        }
        this.setState({
            isFetching: false,
        })
    }

    async _ContentsDelete(value) {
        const url = ServerUrl.UpdateContentsPlace
        let formBody = {};
        formBody = JSON.stringify({
            "place_no": value,
            "status": 2,
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log(json)
        if (json.length > 0) {
            this._ContentsPlace()
        } else {
            this.setState({
                isFetching: false,
            })
        }
    }

    parentFunction = value => {
        this.setState({ isFetching: true, datas: [] }, () => this._ContentsPlace())
    }

    _Dialog() {
        return (
            <Modal visible={this.state.dialogVisible} transparent={true}>
                <TouchableWithoutFeedback onPress={() => this.setState({ dialogVisible: false })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '90%', height: 211, backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 14, marginRight: 16 }} onPress={() => this.setState({ dialogVisible: false })}>
                                        <Image source={imgClose} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t('managerContentsRemoveTitle')}</Text>
                                </View>
                                <View style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 19 }}>
                                    <TouchableOpacity onPress={() => this.setState({ dialogVisible: false, isFetching: true, datas: [] }, () => this._ContentsDelete(this.state.deleteNo))}>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.type == 0 ? Colors.color2D7DC8 : Colors.colorE94D3E, borderRadius: 4, width: '100%', height: 48 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('managerContentsRemoveButton')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    {this._CallDialog()}
                    {this._CategoryDialog()}
                    {this._Dialog()}
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('managerContentsTitle')}</Text>
                        </View>
                    </TouchableOpacity>

                    <FlatList ListHeaderComponent={
                        <View style={{ width: '100%', marginTop: 16 }}>
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
                                    <TextInput style={{ flex: 1, fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginLeft: 0, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('savedSearch')} placeholderTextColor={Colors.colorB7B7B7} onChangeText={(text) => this.state.searchText = text} onSubmitEditing={() => this._ContentsPlace()}></TextInput>
                                    <Image source={imgSearch} style={{ width: 15, height: 15, resizeMode: 'contain', marginRight: 8 }}></Image>
                                </View>
                            </View>

                            <View style={{ marginTop: 12, marginLeft: 16, marginRight: 16, flexDirection: 'row' }}>
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
                                        <Text style={{ color: this.state.languageSelectedTextDatas.length > 0 ? Colors.color2D7DC8 : Colors.color000000, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('contentsTime') + (this.state.languageSelectedTextDatas.length > 0 ? ' (' + this.state.languageSelectedTextDatas.length + ')' : '')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    } keyExtractor={(item, index) => index.toString()} data={this.state.datas} renderItem={(obj) => {
                        return (
                            <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('PlaceDetail', { placeNo: obj.item.placeNo })}>
                                <View style={{ flexDirection: 'row', paddingLeft: 16, paddingRight: 16, marginTop: 20, alignItems: 'center' }}>
                                    <FastImage style={{ width: 80, height: 80, resizeMode: 'cover', borderRadius: 40 }} source={{ uri: ServerUrl.Server + obj.item.repPath, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                    <View style={{ marginLeft: 15, flex: 1 }}>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16 }}>{Utils.GrinderContents(obj.item.placeName).replace(/&#039;/gi, '\'').replace(/&quot;/gi, '\"')}</Text>
                                        <Text style={{ color: Colors.color5B5B5B, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginTop: 4 }}>{Utils.Grinder(User.contentsCategory.filter((el) => el.category_no == obj.item.category[0])[0]) + "・" + Utils.Grinder(obj.item.regionNo != -1 ? User.region.filter((el) => el.town_no == obj.item.regionNo)[0] : obj.item.cityNo != -1 ? User.city.filter((el) => el.city_no == obj.item.cityNo)[0] : User.country.filter((el) => el.country_no == obj.item.countryNo)[0])}</Text>
                                        <View style={{ flexDirection: 'row', marginTop: 9 }}>
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('ContentsEdit', { parentFunction: this.parentFunction, placeNo: obj.item.placeNo })}>
                                                <View style={{ backgroundColor: Colors.color2D7DC8, paddingTop: 5, paddingBottom: 5, paddingLeft: 25, paddingRight: 24, borderRadius: 40 }}>
                                                    <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 10 }} >{I18n.t('managerEdit')}</Text>
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => this.setState({ dialogVisible: true, deleteNo: obj.item.placeNo })}>
                                                <View style={{ borderColor: Colors.color2D7DC8, borderWidth: 1, paddingTop: 5, paddingBottom: 5, paddingLeft: 25, paddingRight: 24, borderRadius: 40, marginLeft: 4 }}>
                                                    <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 10 }} >{I18n.t('managerDelete')}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <Image style={{ width: 10, height: 17, resizeMode: 'contain', tintColor: Colors.color5B5B5B }} source={imgRightArrow}></Image>
                                </View>
                            </TouchableWithoutFeedback>
                        )
                    }}
                        ListFooterComponent={
                            <View style={{ height: 88 }}></View>
                        }>

                    </FlatList>

                    <View style={{ paddingLeft: 16, paddingRight: 16, position: 'absolute', bottom: 28, width: '100%' }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('ContentsInsert', { parentFunction: this.parentFunction })}>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.color2D7DC8, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorFFFFFF }}>
                                <Image style={{ width: 16, height: 16, resizeMode: 'contain', tintColor: Colors.color2D7DC8 }} source={imgPlus}></Image>
                                <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginLeft: 9 }}>{I18n.t('managerAddContents')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}