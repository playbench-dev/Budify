import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, FlatList, ImageBackground, TouchableOpacity, Dimensions, Platform, BackHandler, Share, Linking } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';
import * as Utils from '../../Common/Utils'
import User from '../../Common/User'
import ServerUrl from '../../Common/ServerUrl';
import FetchingIndicator from 'react-native-fetching-indicator'
import * as NetworkCall from '../../Common/NetworkCall'
import FastImage from 'react-native-fast-image';
import SelectDialog from '../../Common/SelectDialog'
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import Moment from 'moment/min/moment-with-locales'
import Collapsible from 'react-native-collapsible';
import MemoDialog from '../../Common/MemoDialog'
import { NestableScrollContainer, NestableDraggableFlatList } from "react-native-draggable-flatlist"
import { getDistance, getPreciseDistance } from 'geolib';
import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';
import ShareLib from 'react-native-share'
import { firebase } from '@react-native-firebase/dynamic-links';
import KakaoShareLink from 'react-native-kakao-share-link';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

const TAG = 'SavedScheduleMain'
const imgBack = require('../../../assets/ic_back.png');
const imgShared = require('../../../assets/ic_shared.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgBud = require('../../../assets/ic_saved_bud.png');
const imgGoogle = require('../../../assets/ic_saved_google.png');
const imgDrag = require('../../../assets/ic_drag.png');
const imgDelete = require('../../../assets/ic_delete.png');
const imgChange = require('../../../assets/ic_change.png');
const imgClose = require('../../../assets/ic_close.png')
const imgBoraCircle = require('../../../assets/ic_bora_circle.png')
const imgCircleSaveBg = require('../../../assets/ic_circle_saved.png');
const imgLinkBg = require('../../../assets/ic_link_bg.png');
const imgInstargramBg = require('../../../assets/ic_link_instagram_bg.png');
const imgInstargram = require('../../../assets/ic_instagram.png');
const imgLinkKakao = require('../../../assets/ic_link_kakao.png');
const imgLinkMore = require('../../../assets/ic_link_more.png');
const imgLink = require('../../../assets/ic_link.png');
const imgWhatapp = require('../../../assets/ic_whatapp.png');
const imgLine = require('../../../assets/ic_line.png');

const { width: screenWidth } = Dimensions.get('window');

export default class SavedScheduleMain extends React.Component {
    constructor(props) {
        super(props)
        this.backAction = this.backAction.bind(this);
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
        console.log('componentDidMount', this.props.route.params.select)
        Geocoder.init("AIzaSyCePbzWSXlyg8wUqrB0yvWPOLzq0maVfdI");
        if (this.props.route.params.travelNo == undefined) {
            this.state.selectedCountryNo = this.props.route.params.country
            this.state.selectedCountry = Utils.Grinder(User.country.filter((el) => el.country_no == this.props.route.params.country)[0])
            if (this.props.route.params.city != -1) {
                this.state.selectedCityNo = this.props.route.params.city
                this.state.selectedCity = Utils.Grinder(User.city.filter((el) => el.city_no == this.props.route.params.city)[0])
            }
            this.state.marked = this.props.route.params.marked
            this.state._markedDates = this.props.route.params._markedDates
            this.state._markedDates.map((item, index) => this.state.collapsList.push({ status: index == 0 ? false : true, idx: index }))
            this.state._markedDates.map((item, index) => this.state._memoDatas.push({ memo: '', idx: index, date: item, agendas: [] }))
            this.state.showSelectedScheduleDate = Moment(this.props.route.params._markedDates[0]).format('MMM DD') + ' - ' + Moment(this.props.route.params._markedDates[this.props.route.params._markedDates.length - 1]).format('MMM DD')
            this.setState({ isFetching: false })
        } else {
            this.setState({ isFetching: true }, () => this._Travel(1))
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    }

    _goBack() {
        if (this.state.savedFlag == true) {
            if (this.props.route.params.position == 'Search') {
                this.props.navigation.reset({ index: 1, routes: [{ name: 'Main', params: { screen: I18n.t('saved') } }, { name: 'SavedSearch', params: { select: this.state.select } }] })
            } else if (this.props.route.params.position == 'Main') {
                this.props.navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
            } else if (this.props.route.params.position == 'Profile') {
                this.props.navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: I18n.t('profile') } }] })
            }
        } else {
            this.props.navigation.goBack()
        }
    }

    backAction() {
        if (this.state.savedFlag == true) {
            if (this.props.route.params.position == 'Search') {
                this.props.navigation.reset({ index: 1, routes: [{ name: 'Main', params: { screen: I18n.t('saved') } }, { name: 'SavedSearch', params: { select: this.state.select } }] })
            } else if (this.props.route.params.position == 'Main') {
                this.props.navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
            } else if (this.props.route.params.position == 'Profile') {
                this.props.navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: I18n.t('profile') } }] })
            }
        } else {
            this.props.navigation.goBack()
        }
        return true;
    };

    state = {
        title: '',
        selectedCountyPosition: -1,
        selectedCityPosition: -1,
        selectedCountryNo: -1,
        selectedCityNo: -1,
        selectedCountry: '',
        selectedCity: '',
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
        selectedDate: [],
        _markedDates: [],
        _memoDatas: [],
        marked: null,
        markedType: 'dot',
        selectedDialogType: '1', // 1 - 국가, 2 - 도시, 3 - 지역, 4 - 일정
        showSelectedScheduleDate: '',
        lat: 0,
        lng: 0,
        collapsList: [],
        collapsPosition: 0,
        memoPosition: -1,
        memoContents: '',
        addAgendaDialogVisible: false,
        agendaPosition: -1,
        mapsRefs: [],
        saveDialog: false,
        isFetching: false,
        select: this.props.route.params.select != undefined ? this.props.route.params.select : {},
        deleteDialog: false,
        sharedDialogVisible: false,
        travelNo: -1,
        savedFlag: false,
    }

    _Collaps = params => {
        this.setState({
            collapsList: this.state.collapsList.map(
                item => params.index == item.idx
                    ? { idx: item.idx, status: item.status == false ? true : false }
                    : item
            )
        })
        console.log(this.state.collapsList)
    }

    async _Travel(value) {
        let url = '';
        let formBody = {};
        if (value == 0) { // 0 - insert, 1 - select, 2 - update, 3 - delete, 4 - insert 후 shared
            this.state.savedFlag = true;
            if (this.state.travelNo == -1) {
                url = ServerUrl.InsertTravel
                formBody = JSON.stringify({
                    "user_no": User.userNo,
                    "start_dt": this.state._markedDates[0],
                    "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                    "title": this.state.title,
                    "country_no": this.state.selectedCountryNo,
                    "city_no": this.state.selectedCityNo,
                    "contents_list": JSON.stringify(this.state._memoDatas),
                })
            } else {
                url = ServerUrl.UpdateTravel
                formBody = JSON.stringify({
                    "travel_no": this.state.travelNo,
                    "start_dt": "\'" + this.state._markedDates[0] + "\'",
                    "end_dt": "\'" + this.state._markedDates[this.state._markedDates.length - 1] + "\'",
                    "title": "\'" + this.state.title + "\'",
                    "country_no": this.state.selectedCountryNo,
                    "city_no": this.state.selectedCityNo,
                    "contents_list": "\'" + JSON.stringify(this.state._memoDatas) + "\'",
                })
            }
        } else if (value == 1) {
            console.log(this.props.route.params.travelNo)
            url = ServerUrl.SelectTravel
            formBody = JSON.stringify({
                "conditions": [{
                    "q": "=",
                    "f": "travel_no",
                    "v": this.props.route.params.travelNo,
                }],
            })
        } else if (value == 2) {
            this.state.savedFlag = true;
            url = ServerUrl.UpdateTravel
            formBody = JSON.stringify({
                "travel_no": this.props.route.params.travelNo,
                "start_dt": "\'" + this.state._markedDates[0] + "\'",
                "end_dt": "\'" + this.state._markedDates[this.state._markedDates.length - 1] + "\'",
                "title": "\'" + this.state.title + "\'",
                "country_no": this.state.selectedCountryNo,
                "city_no": this.state.selectedCityNo,
                "contents_list": "\'" + JSON.stringify(this.state._memoDatas) + "\'",
            })
        } else if (value == 3) {
            this.state.savedFlag = true;
            url = ServerUrl.DeleteTravel
            formBody = JSON.stringify({
                "travel_no": this.props.route.params.travelNo,
                // "conditions": [{
                //     "q": "=",
                //     "f": "travel_no",
                //     "v": this.props.route.params.travelNo,
                // }],
            })
        } else if (value == 4) {
            this.state.savedFlag = true;
            url = ServerUrl.InsertTravel
            formBody = JSON.stringify({
                "user_no": User.userNo,
                "start_dt": this.state._markedDates[0],
                "end_dt": this.state._markedDates[this.state._markedDates.length - 1],
                "title": this.state.title,
                "country_no": this.state.selectedCountryNo,
                "city_no": this.state.selectedCityNo,
                "contents_list": JSON.stringify(this.state._memoDatas),
            })
        }
        const json = await NetworkCall.Select(url, formBody)
        console.log('_Travel', json)
        if (json.length > 0) {
            if (value == 0 || value == 2) {
                this.setState({ isFetching: false, travelNo: json[0].travel_no })
            } else if (value == 1) {
                this.state.selectedCountryNo = json[0].country_no
                this.state.selectedCountry = Utils.Grinder(User.country.filter((el) => el.country_no == json[0].country_no)[0])
                this.state.title = json[0].title
                this.state.travelNo = json[0].travel_no
                if (json[0].city_no == -1 || json[0].city_no == 0) {
                    this.state.selectedCityNo = 0
                    this.state.selectedCity = ''
                    this.state.select = { country_no: this.state.selectedCountryNo, city_no: 0, ko: '전체', en: 'All', ja: '全国' }
                } else {
                    this.state.selectedCityNo = json[0].city_no
                    this.state.selectedCity = Utils.Grinder(User.city.filter((el) => el.city_no == json[0].city_no)[0])
                    this.state.select = { country_no: this.state.selectedCountryNo, city_no: json[0].city_no, ko: User.city.filter((el) => el.city_no == json[0].city_no)[0].ko, en: User.city.filter((el) => el.city_no == json[0].city_no)[0].en, ja: User.city.filter((el) => el.city_no == json[0].city_no)[0].ja }
                }

                this._setSelectedDates(Moment(json[0].start_dt).format('YYYY-MM-DD'))
                this._setSelectedDates(Moment(json[0].end_dt).format('YYYY-MM-DD'))

                const contentsList = JSON.parse(json[0].contents_list)
                for (let i = 0; i < contentsList.length; i++) {
                    this.state.collapsList.push({ status: i == 0 ? false : true, idx: i })
                    this.state._memoDatas.push({ memo: contentsList[i].memo, idx: contentsList[i].idx, date: contentsList[i].date, agendas: contentsList[i].agendas })
                }
                console.log(this.state._markedDates)
                this.state.showSelectedScheduleDate = Moment(this.state._markedDates[0]).format('MMM DD') + ' - ' + Moment(this.state._markedDates[this.state._markedDates.length - 1]).format('MMM DD')
                this.setState({ isFetching: false })
            } else if (value == 4) {
                this.setState({
                    isFetching: false,
                    travelNo: json[0].travel_no,
                    sharedDialogVisible: true,
                })
            }
        } else {
            if (value == 3) {
                this.props.navigation.reset({ index: 1, routes: [{ name: 'Main', params: { screen: I18n.t('saved') } }, { name: 'SavedSearch', params: { select: this.state.select } }] })
            }
        }
    }

    render() {
        console.log(this.state._memoDatas)
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, }}>
                    {this._CallDialog()}
                    {this._AddAgendaDialog()}
                    {this._Dialog()}
                    {this._DeleteDialog()}
                    {this._SharedDialog()}
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableOpacity onPress={() => this._goBack()}>
                            <View style={{ width: 40, height: 20, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableOpacity>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderColor: Colors.color5B5B5B, borderWidth: 1, height: 36, borderRadius: 4, marginLeft: 8, marginRight: 8 }}>
                            <TextInput style={{ width: '100%', height: '100%', padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, textAlign: 'center' }} placeholder={I18n.t('savedTitleHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => this.setState({ title: text })}>{this.state.title}</TextInput>
                        </View>
                        <TouchableOpacity onPress={() => this.state.travelNo == -1 ? this._Travel(4) : this.setState({ sharedDialogVisible: true })}>
                            <View style={{ width: 40, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgShared} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginTop: 17, paddingRight: 16, paddingLeft: 16 }}>
                        <View style={{ flexDirection: 'row', backgroundColor: Colors.colorFFFFFF, borderWidth: 1, borderColor: Colors.colorBFBFBF, borderRadius: 4, height: 36 }}>
                            <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 1 })}>
                                <View style={{ flex: 0.25, paddingLeft: 8, justifyContent: 'center', }}>
                                    <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('homeCountry')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedCountry}</TextInput>
                                    <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                </View>
                            </TouchableWithoutFeedback >
                            <View style={{ width: 1, backgroundColor: Colors.colorBFBFBF }}></View>
                            <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 2 })}>
                                <View style={{ flex: 0.3, paddingLeft: 8, justifyContent: 'center' }}>
                                    <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('homeCity')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedCity}</TextInput>
                                    <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={{ width: 1, backgroundColor: Colors.colorBFBFBF }}></View>
                            <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: '4' })}>
                                <View style={{ flex: 0.45, paddingLeft: 8, justifyContent: 'center', }}>
                                    <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('homeDate')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.showSelectedScheduleDate}</TextInput>
                                    <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                    <NestableScrollContainer showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ marginTop: 16, marginBottom: 120 }}>
                        {this.state._memoDatas.map((item1, index1) => {
                            let newArr = [];
                            item1.agendas.map((item, index) => newArr.push({ latitude: item.lat, longitude: item.lng }))
                            console.log(newArr)
                            return (
                                <View style={{ marginTop: 27 }}>
                                    <View style={{ paddingLeft: 16, paddingRight: 16, flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{`Day ${index1 + 1}`}</Text>
                                        <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorC4C4C4, marginLeft: 8 }}>{`${Moment(item1.date).format('MMM DD')} (${Moment(item1.date).format('ddd')})`}</Text>
                                        <View style={{ flex: 1 }}></View>
                                        <TouchableOpacity style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }} onPress={() => this.setState({ collapsPosition: this.state.collapsPosition == index1 ? -1 : index1 })}>
                                            <View style={{}}>
                                                <Image source={imgDownArrow} style={{ width: 13, height: 7, resizeMode: 'contain', marginLeft: 4, transform: [{ rotate: this.state.collapsPosition == index1 ? '180deg' : '0deg' }] }} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <Collapsible collapsed={this.state.collapsPosition == index1 ? false : true} >
                                        <View style={{ width: '100%', height: 240, marginTop: 12 }}>
                                            <MapView
                                                ref={(ref) => this.state.mapsRefs.push(ref)}
                                                key={index1}
                                                style={{
                                                    flex: 1,
                                                    height: '100%',
                                                }}
                                                provider={PROVIDER_GOOGLE}
                                                initialRegion={{
                                                    latitude: newArr.length == 0 ? 37.564214 : newArr[0].latitude,
                                                    longitude: newArr.length == 0 ? 127.001699 : newArr[0].longitude,
                                                    latitudeDelta: 0.00222,
                                                    longitudeDelta: 0.00221,
                                                }}
                                                region={{
                                                    latitude: newArr.length == 0 ? 37.564214 : newArr[0].latitude,
                                                    longitude: newArr.length == 0 ? 127.001699 : newArr[0].longitude,
                                                    latitudeDelta: 0.00222,
                                                    longitudeDelta: 0.00221,
                                                }}
                                                toolbarEnabled={false}
                                                onMapReady={() => console.log('text')}
                                                onMapLoaded={() => this.props.route.params.travelNo != undefined && item1.agendas.length > 0 && this.state.mapsRefs[index1].fitToCoordinates(newArr, { edgePadding: { top: Platform.OS == 'android' ? 10 : 40, right: Platform.OS == 'android' ? 10 : 10, bottom: Platform.OS == 'android' ? 10 : 0, left: Platform.OS == 'android' ? 10 : 10 }, animated: false, })}>

                                                {newArr.length > 1 && <Polyline
                                                    strokeColor="#5b5b5b" // fallback for when `strokeColors` is not supported by the map-provider
                                                    strokeWidth={3}
                                                    coordinates={newArr}
                                                    tappable={true}
                                                    lineCap="square"
                                                    lineDashPattern={Platform.OS == 'android' ? [10, 10] : [30, 30]}

                                                />}
                                                {item1.agendas.map((item, index5) => (
                                                    <Marker key={index5} coordinate={{ latitude: item.lat, longitude: item.lng }} >
                                                        {Platform.OS == "ios" && <View style={{ width: 25, height: 25, borderRadius: 25, backgroundColor: item.type == 0 ? Colors.color985EFD : item.type == 1 ? Colors.colorFD6268 : Colors.color289FAF, alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{index5 + 1}</Text>
                                                        </View>}
                                                    </Marker>
                                                ))}
                                            </MapView>
                                        </View>

                                        <NestableDraggableFlatList
                                            containerStyle={{ width: '100%', }}
                                            data={item1.agendas}
                                            renderItem={({ item, index, drag, isActive }) => {
                                                return (
                                                    <View style={{ width: '100%', }}>
                                                        <View style={{ flexDirection: 'row', width: '100%', flexDirection: 'row', paddingLeft: 26, paddingRight: 20, marginTop: index == 0 ? 40 : 0, alignItems: 'center' }}>
                                                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                                <View style={{ flex: 1, width: 2, backgroundColor: Colors.colorE5E5E5, opacity: index == 0 ? 0 : 1 }}></View>
                                                                <View style={{ width: 25, height: 25, borderRadius: 25, backgroundColor: item.type == 0 ? Colors.color985EFD : item.type == 1 ? Colors.colorFD6268 : Colors.color289FAF, alignItems: 'center', justifyContent: 'center' }}>
                                                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{index + 1}</Text>
                                                                </View>
                                                                <View style={{ flex: 1, width: 2, backgroundColor: Colors.colorE5E5E5, opacity: item1.agendas.length - 1 != index ? 1 : this.state._memoDatas[index1].memo.length > 0 ? 1 : 0 }}></View>
                                                            </View>
                                                            {(item.type == 0 || item.type == 1) && <Image style={{ marginLeft: 21, borderRadius: 4, width: 72, height: 72, resizeMode: 'cover', marginTop: 12, marginBottom: 12 }} source={{ uri: item.repPath }}></Image>}
                                                            <View style={{
                                                                flex: 1,
                                                                height: 72,
                                                                backgroundColor: Colors.colorFFFFFF,
                                                                marginBottom: item.type == 0 || item.type == 1 ? 0 : 12,
                                                                marginTop: item.type == 0 || item.type == 1 ? 0 : 12,
                                                                marginLeft: item.type == 0 || item.type == 1 ? 4 : 21, ...Platform.select({
                                                                    ios: {
                                                                        shadowColor: 'black',
                                                                        shadowOffset: {
                                                                            width: 1,
                                                                            height: 1,
                                                                        },
                                                                        shadowOpacity: 0.25,
                                                                        shadowRadius: 3,
                                                                    },
                                                                    android: {
                                                                        elevation: 3,
                                                                    },
                                                                }),
                                                                paddingLeft: 7, paddingTop: 6, paddingBottom: 6, paddingRight: 6,
                                                            }}>
                                                                <View style={{ flexDirection: 'row', }}>
                                                                    <Text style={{ flex: 1, fontSize: 12, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>

                                                                    <TouchableOpacity style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center', }} >
                                                                        <Image source={imgChange} style={{ width: 10, height: 11, resizeMode: 'contain' }}></Image>
                                                                    </TouchableOpacity>
                                                                </View>
                                                                <View style={{ flex: 1 }}></View>
                                                                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                                                    <Text style={{ fontSize: 10, fontFamily: 'Raleway-Regular', includeFontPadding: false, color: Colors.color5B5B5B }} >{Utils.Grinder(item.type == 0 ? User.category.filter((el) => el.category_no == item.category)[0] : User.contentsCategory.filter((el) => el.category_no == item.category[0])[0]) + ' ・ ' + Utils.Grinder(User.region.filter((el) => el.town_no == item.city)[0])}</Text>
                                                                    <View style={{ flex: 1 }}></View>
                                                                    <TouchableOpacity style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorE94D3E, borderRadius: 10 }} onPress={() => this._DeleteData(index1, index)}>
                                                                        <Image source={imgDelete} style={{ width: 10, height: 11, resizeMode: 'contain' }}></Image>
                                                                    </TouchableOpacity>
                                                                </View>

                                                            </View>
                                                            <TouchableOpacity onPressIn={drag}>
                                                                <Image source={imgDrag} style={{ width: 25, height: 25, resizeMode: 'contain', marginLeft: 11 }}></Image>
                                                            </TouchableOpacity>

                                                        </View>
                                                        {item1.agendas.length - 1 != index && (
                                                            <View style={{ width: '100%', }}>
                                                                <View style={{ alignItems: 'center', justifyContent: 'center', paddingLeft: 7, paddingRight: 7, paddingTop: 5, paddingBottom: 5, borderRadius: 2, backgroundColor: Colors.color5B5B5B, marginLeft: 8, width: 75, }}>
                                                                    <AutoSizeText style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, textAlign: 'center' }} fontSize={12} numberOfLines={1} mode={ResizeTextMode.max_lines}>{item.dis > 1000 ? `${item.dis / 1000}km` : `${item.dis}m`}</AutoSizeText>
                                                                </View>
                                                            </View>
                                                        )}
                                                    </View>
                                                )
                                            }}
                                            keyExtractor={(item, index) => index.toString()}
                                            onDragEnd={({ data }) => {
                                                // console.log(index1)
                                                this._DragData(data, index1)
                                            }}
                                        />

                                        {this.state._memoDatas[index1].memo.length > 0 && (
                                            <View style={{ flexDirection: 'row', width: '100%', flexDirection: 'row', paddingLeft: 26, paddingRight: 20, alignItems: 'center', marginTop: this.state._memoDatas[index1].agendas.length == 0 ? 40 : 0 }}>
                                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                                    <View style={{ flex: 1, width: 2, backgroundColor: Colors.colorE5E5E5, opacity: this.state._memoDatas[index1].agendas.length == 0 ? 0 : 1 }}></View>
                                                    <View style={{ width: 25, height: 25, borderRadius: 25, backgroundColor: Colors.colorB7B7B7, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text style={{ fontSize: 12, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{'M'}</Text>
                                                    </View>
                                                    <View style={{ flex: 1, width: 2, backgroundColor: Colors.colorE5E5E5, opacity: 0 }}></View>
                                                </View>
                                                <View style={{
                                                    flex: 1,
                                                    minHeight: 72,
                                                    backgroundColor: Colors.colorFFFFFF,
                                                    marginRight: 36,
                                                    marginLeft: 21, ...Platform.select({
                                                        ios: {
                                                            shadowColor: 'black',
                                                            shadowOffset: {
                                                                width: 1,
                                                                height: 1,
                                                            },
                                                            shadowOpacity: 0.25,
                                                            shadowRadius: 3,
                                                        },
                                                        android: {
                                                            elevation: 3,
                                                        },
                                                    }),
                                                    paddingLeft: 10, paddingTop: 6, paddingBottom: 6, paddingRight: 12, justifyContent: 'center'
                                                }}>
                                                    {/* <Image source={imgDrag} style={{ width: 25, height: 25, resizeMode: 'contain', marginLeft: 11, opacity: 0 }}></Image> */}
                                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }} >{this.state._memoDatas[index1].memo}</Text>
                                                </View>
                                            </View>
                                        )}

                                        <View style={{ paddingLeft: 16, paddingRight: 16, flexDirection: 'row', height: 48, marginTop: 12, width: '100%' }}>
                                            <TouchableOpacity style={{ flex: 1, }} onPress={() => this.setState({ agendaPosition: index1, addAgendaDialogVisible: true })}>
                                                <View style={{ flex: 1, backgroundColor: Colors.color289FAF, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('savedAddAgenda')}</Text>
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={{ flex: 1, marginLeft: 8 }} onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 6, memoPosition: index1, memoContents: item1.memo })}>
                                                <View style={{ flex: 1, borderColor: Colors.color289FAF, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color289FAF }}>{I18n.t('savedAddMemo')}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>

                                    </Collapsible>

                                </View>
                            )
                        })}

                        <TouchableOpacity style={{ height: 48, width: '100%', paddingLeft: 16, paddingRight: 16, marginTop: 42, }} onPress={() => this.setState({ isFetching: true, }, () => this.props.route.params.travelNo == undefined ? this._Travel(0) : this._Travel(2))}>
                            <View style={{ flex: 1, backgroundColor: Colors.color289FAF, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('savedSaveBtn')}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* {this.props.route.params.travelNo != undefined && (
                            <TouchableOpacity style={{ height: 48, width: '100%', paddingLeft: 16, paddingRight: 16, marginTop: 12, }} onPress={() => this.setState({ deleteDialog: true, })}>
                                <View style={{ flex: 1, borderColor: Colors.color289FAF, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color289FAF }}>{I18n.t('savedRemoveBtn')}</Text>
                                </View>
                            </TouchableOpacity>
                        )} */}

                    </NestableScrollContainer>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }

    _Between(lat, lng, lat1, lng1) {
        console.log(lat, lng, lat1, lng1)
        var distance = getDistance({ latitude: parseFloat(lat), longitude: parseFloat(lng) }, { latitude: parseFloat(lat1), longitude: parseFloat(lng1) })
        console.log(distance)
        return distance;
    }

    parentFuntion = (value, mapsIndex, type) => { //type 0 - ex, 1 - place, 2 - google, 11 - backHandler 
        console.log(value)
        if (type == 11) {
            BackHandler.addEventListener("hardwareBackPress", this.backAction);
        } else {
            if (this.state._memoDatas[mapsIndex].agendas.length > 0) {
                console.log('aa')
                const newArr = [];
                for (let i = 0; i < value.length; i++) {
                    const newCategory = [];
                    if (type == 0) {
                        value[i].category.map((item, index) => newCategory.push(item.category_no))
                    } else if (type == 1) {
                        value[i].category.map((item, index) => newCategory.push(item))
                    }
                    this.state._memoDatas[mapsIndex].agendas.push({ contentNo: type == 0 ? value[i].ex_no : type == 1 ? value[i].place_no : -1, title: value[i].title, repPath: value[i].representative_file_url, category: newCategory, type: type, city: value[i].city, lat: value[i].lat, lng: value[i].lng, dis: 0 })
                }
                const MARKERS = [];
                this.state._memoDatas[mapsIndex].agendas.map(item => MARKERS.push({ latitude: item.lat, longitude: item.lng }))

                this.setState({
                    _memoDatas: this.state._memoDatas.map(
                        (item, index) => index === mapsIndex
                            ? {
                                memo: item.memo, idx: item.idx, date: item.date, agendas: item.agendas.map(
                                    (item1, index1) => index1 === index1 ? { contentNo: item1.contentNo, title: item1.title, repPath: item1.repPath, category: item1.category, type: item1.type, city: item1.city, lat: item1.lat, lng: item1.lng, dis: index1 != this.state._memoDatas[mapsIndex].agendas.length - 1 && this._Between(item1.lat, item1.lng, this.state._memoDatas[mapsIndex].agendas[index1 + 1].lat, this.state._memoDatas[mapsIndex].agendas[index1 + 1].lng) } : item1
                                )
                            }
                            : item
                    )
                }, () => this.state.mapsRefs[mapsIndex].fitToCoordinates(MARKERS, { edgePadding: { top: Platform.OS == 'android' ? 10 : 40, right: Platform.OS == 'android' ? 10 : 10, bottom: Platform.OS == 'android' ? 10 : 10, left: Platform.OS == 'android' ? 10 : 10 }, animated: false, }))
                console.log(this.state._memoDatas[mapsIndex].agendas)

            } else {
                console.log('bb')
                for (let i = 0; i < value.length; i++) {
                    const newCategory = [];
                    if (type == 0) {
                        value[i].category.map((item, index) => newCategory.push(item.category_no))
                    } else if (type == 1) {
                        value[i].category.map((item, index) => newCategory.push(item))
                    }
                    console.log(newCategory)
                    this.state._memoDatas[mapsIndex].agendas.push({ contentNo: type == 0 ? value[i].ex_no : type == 1 ? value[i].place_no : -1, title: value[i].title, repPath: value[i].representative_file_url, category: newCategory, type: type, city: value[i].city, lat: value[i].lat, lng: value[i].lng, dis: i != value.length - 1 ? this._Between(value[i].lat, value[i].lng, value[i + 1].lat, value[i + 1].lng) : 0 })
                }
                const MARKERS = [];
                this.state._memoDatas[mapsIndex].agendas.map(item => MARKERS.push({ latitude: item.lat, longitude: item.lng }))

                this.setState({ isFetching: false, }, () => this.state.mapsRefs[mapsIndex].fitToCoordinates(MARKERS, { edgePadding: { top: Platform.OS == 'android' ? 10 : 40, right: Platform.OS == 'android' ? 10 : 10, bottom: Platform.OS == 'android' ? 10 : 10, left: Platform.OS == 'android' ? 10 : 10 }, animated: false, }))
            }
        }
    }

    _DragData = (value, mapsIndex) => {
        this.state._memoDatas[mapsIndex].agendas = [];
        value.map((item) => this.state._memoDatas[mapsIndex].agendas.push(item))
        const MARKERS = [];
        this.state._memoDatas[mapsIndex].agendas.map(item => MARKERS.push({ latitude: item.lat, longitude: item.lng }))

        this.setState({
            _memoDatas: this.state._memoDatas.map(
                (item, index) => index === mapsIndex
                    ? {
                        memo: item.memo, idx: item.idx, date: item.date, agendas: item.agendas.map(
                            (item1, index1) => index1 === index1 ? { contentNo: item1.contentNo, title: item1.title, repPath: item1.repPath, category: item1.category, type: item1.type, city: item1.city, lat: item1.lat, lng: item1.lng, dis: index1 != this.state._memoDatas[mapsIndex].agendas.length - 1 && this._Between(item1.lat, item1.lng, this.state._memoDatas[mapsIndex].agendas[index1 + 1].lat, this.state._memoDatas[mapsIndex].agendas[index1 + 1].lng) } : item1
                        )
                    }
                    : item
            )
        }, () => this.state.mapsRefs[mapsIndex].fitToCoordinates(MARKERS, { edgePadding: { top: Platform.OS == 'android' ? 10 : 40, right: Platform.OS == 'android' ? 10 : 10, bottom: Platform.OS == 'android' ? 10 : 10, left: Platform.OS == 'android' ? 10 : 10 }, animated: false, }))
    }

    _DeleteData = (mapsIndex, idx) => {
        const newList = this.state._memoDatas[mapsIndex].agendas.filter((item, index) => index !== idx);
        this.state._memoDatas[mapsIndex].agendas = [];
        newList.map((item) => this.state._memoDatas[mapsIndex].agendas.push(item))
        const MARKERS = [];
        this.state._memoDatas[mapsIndex].agendas.map(item => MARKERS.push({ latitude: item.lat, longitude: item.lng }))

        this.setState({
            _memoDatas: this.state._memoDatas.map(
                (item, index) => index === mapsIndex
                    ? {
                        memo: item.memo, idx: item.idx, date: item.date, agendas: item.agendas.map(
                            (item1, index1) => index1 === index1 ? { contentNo: item1.contentNo, title: item1.title, repPath: item1.repPath, category: item1.category, type: item1.type, city: item1.city, lat: item1.lat, lng: item1.lng, dis: index1 != this.state._memoDatas[mapsIndex].agendas.length - 1 && this._Between(item1.lat, item1.lng, this.state._memoDatas[mapsIndex].agendas[index1 + 1].lat, this.state._memoDatas[mapsIndex].agendas[index1 + 1].lng) } : item1
                        )
                    }
                    : item
            )
        }, () => this.state.mapsRefs[mapsIndex].fitToCoordinates(MARKERS, { edgePadding: { top: Platform.OS == 'android' ? 10 : 40, right: Platform.OS == 'android' ? 10 : 10, bottom: Platform.OS == 'android' ? 10 : 10, left: Platform.OS == 'android' ? 10 : 10 }, animated: false, }))
    }

    _CallDialog = () => {
        if (this.state.selectDialogVisible) {
            let datas = [];
            let title = I18n.t('homeCountry');
            let type = this.state.selectedDialogType;
            console.log(this.state.memoContents)
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
            else if (type == '4') {
                title = I18n.t('homeDate')
            } else if (type == '6') {
                title = I18n.t('savedAddMemo')
            }

            if (type == '4' || datas.length > 0) {
                return <SelectDialog title={title} datas={datas} type={type} _markedDates={this.state._markedDates} selectedPosition={(type == '1' ? this.state.selectedCountyPosition : (type == '2' ? this.state.selectedCityPosition : this.state.selectedRegionPosition))} markedType={this.state._markedDates.length > 1 ? 'period' : 'dot'} marked={this.state.marked} click={this._ClickDialog} selectedString={(type == '1' ? this.state.selectedCountry : (type == '2' ? this.state.selectedCity : this.state.selectedRegion))} no={(type == '1' ? this.state.selectedCountryNo : (type == '2' ? this.state.selectedCityNo : this.state.selectedRegionNo))}></SelectDialog>
            } else if (type == '6') {
                return <MemoDialog title={title} type={type} contents={this.state.memoContents} index={this.state.memoPosition} click={this._ClickDialog}></MemoDialog>
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
            let filterArr = [];
            let collapseArr = [];
            for (let i = 0; i < this.state._markedDates.length; i++) {
                console.log('' + i, this.state._memoDatas.filter((el) => el.date == this.state._markedDates[i]))
                filterArr.push({ memo: this.state._memoDatas.filter((el) => el.date == this.state._markedDates[i]).length > 0 ? this.state._memoDatas.filter((el) => el.date == this.state._markedDates[i])[0].memo : '', idx: i, date: this.state._markedDates[i], agendas: this.state._memoDatas.filter((el) => el.date == this.state._markedDates[i]).length > 0 ? this.state._memoDatas.filter((el) => el.date == this.state._markedDates[i])[0].agendas : [] })
                collapseArr.push({ status: false, idx: i })
            }

            this.setState({
                selectDialogVisible: false,
                showSelectedScheduleDate: Moment(this.state._markedDates[0]).format('MMM DD') + ' - ' + Moment(this.state._markedDates[this.state._markedDates.length - 1]).format('MMM DD'),
                _memoDatas: [...filterArr],
                isFetching: true,
                collapsList: [...collapseArr],
            });

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
                specialExperienceDatas: [],
                restaurantsPlaceDatas: [],
                restaurantsOffset: 0,
                restaurantsTotal: 0,
                select: { country_no: this.state.selectedCountryNo, city_no: value.no, ko: value.no == 0 ? '전체' : User.city.filter((el) => el.city_no == value.no)[0].ko, en: value.no == 0 ? 'All' : User.city.filter((el) => el.city_no == value.no)[0].en, ja: value.no == 0 ? '全国' : User.city.filter((el) => el.city_no == value.no)[0].ja }
            })
        } else if (value.type == '1') {
            console.log(User.country.filter((el) => el.country_no == value.no))
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
                specialExperienceDatas: [],
                restaurantsPlaceDatas: [],
                restaurantsOffset: 0,
                restaurantsTotal: 0,
                select: { country_no: value.no, city_no: 0, ko: '전체', en: 'All', ja: '全国' },
            })
        } else if (value.type == '5') {
            this.setState({
                selectDialogVisible: false,
            });
        } else if (value.type == '6') {
            console.log(value)
            this.setState({
                selectDialogVisible: false,
                _memoDatas: this.state._memoDatas.map(
                    (item, index) => index == value.index
                        ? { date: item.date, idx: item.idx, memo: value.contents, agendas: item.agendas }
                        : item
                )
            })
        }
    }

    _FromEx = (value) => {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
        const newArr = [];
        console.log('_FromEx', newArr)
        if (value[this.state.agendaPosition].agendas.length > 0) {
            value[this.state.agendaPosition].agendas.map((item, index) => item.type == 0 && newArr.push(item.contentNo))
        }
        this.props.navigation.navigate('FromEx', { select: this.state.select, parentFuntion: this.parentFuntion, mapsIndex: this.state.agendaPosition, selectDatas: newArr })
    }

    _FromPlace = (value) => {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
        const newArr = [];
        console.log('_FromPlace', newArr)
        if (value[this.state.agendaPosition].agendas.length > 0) {
            value[this.state.agendaPosition].agendas.map((item, index) => item.type == 1 && newArr.push(item.contentNo))
        }
        this.props.navigation.navigate('FromPlace', { select: this.state.select, parentFuntion: this.parentFuntion, mapsIndex: this.state.agendaPosition, selectDatas: newArr })
    }

    _AddAgendaDialog() {
        return (
            <Modal transparent={true} visible={this.state.addAgendaDialogVisible}>
                <TouchableWithoutFeedback onPress={() => this.setState({ addAgendaDialogVisible: false })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '100%', padding: 15, backgroundColor: Colors.colorFFFFFF, borderRadius: 8, maxHeight: '80%' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <TouchableOpacity style={{ width: 40, height: 30, justifyContent: 'center' }} onPress={() => this.setState({ addAgendaDialogVisible: false })}>
                                        <FastImage style={{ width: 16, height: 16, resizeMode: 'contain' }} source={imgBack} resizeMode={FastImage.resizeMode.contain}></FastImage>
                                    </TouchableOpacity>
                                    <Text style={{ flex: 1, paddingRight: 40, fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t('savedAddAgenda')}</Text>
                                </View>

                                <View style={{ marginTop: 25, flexDirection: 'row', paddingLeft: 12, paddingRight: 12, marginBottom: 40 }}>
                                    <View style={{ flex: 0.65, alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{ flex: 1, flexDirection: 'row', height: 120, }}>
                                            <TouchableOpacity onPress={() => this.setState({ addAgendaDialogVisible: false, }, () => this._FromEx(this.state._memoDatas))}>
                                                <View style={{ width: 80, height: '100%', backgroundColor: Colors.color2D7DC8, alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                                                    <Image source={imgBud} style={{ width: 49, height: 49, resizeMode: 'contain' }}></Image>
                                                    <Text style={{ fontSize: 10, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF, }}>{I18n.t('experiences')}</Text>
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => this.setState({ addAgendaDialogVisible: false, }, () => this._FromPlace(this.state._memoDatas))}>
                                                <View style={{ width: 80, height: '100%', backgroundColor: Colors.color2D7DC8, marginLeft: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                                                    <Image source={imgBud} style={{ width: 49, height: 49, resizeMode: 'contain' }}></Image>
                                                    <Text style={{ fontSize: 10, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF, }}>{I18n.t('contents')}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={{ fontSize: 10, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, marginTop: 12 }}>{'From Saved'}</Text>
                                    </View>

                                    <View style={{ width: 1, height: 120, backgroundColor: Colors.colorE5E5E5, marginRight: 16, marginLeft: 16 }}></View>

                                    <View style={{ flex: 0.3, alignItems: 'center', justifyContent: 'center' }}>
                                        <TouchableOpacity style={{ flex: 1, height: 120 }} onPress={() => this.setState({ addAgendaDialogVisible: false, }, () => {
                                            this.props.navigation.navigate('FromGoogle', { parentFuntion: this.parentFuntion, mapsIndex: this.state.agendaPosition, })
                                            BackHandler.removeEventListener('hardwareBackPress', this.backAction)
                                        })}>
                                            <View style={{ flex: 1, height: 120 }}>
                                                <View style={{ width: 80, height: '100%', backgroundColor: Colors.color289FAF, alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                                                    <Image source={imgGoogle} style={{ width: 54, height: 40, resizeMode: 'contain' }}></Image>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        <Text style={{ fontSize: 10, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, marginTop: 12 }}>{'From Google'}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }

    _Dialog() {
        return (
            <Modal visible={this.state.saveDialog} transparent={true}>
                <TouchableWithoutFeedback onPress={() => this.setState({ saveDialog: false })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '90%', height: 211, backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                                <View style={{ alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16, marginTop: 14 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t('savedReturn')}</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t('savedReturnContent')}</Text>
                                </View>
                                <View style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 19, flexDirection: 'row' }}>
                                    <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ isFetching: true, saveDialog: false, }, () => this.props.route.params.travelNo == undefined ? this._Travel(0) : this._Travel(2))}>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.color2D7DC8, borderRadius: 4, width: '100%', height: 48 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('savedReturnDone')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ flex: 1, marginLeft: 12 }} onPress={() => this.props.navigation.goBack()}>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', borderColor: Colors.color2D7DC8, borderRadius: 4, borderWidth: 1, width: '100%', height: 48 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color2D7DC8 }}>{I18n.t('savedReturnCancel')}</Text>
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

    _DeleteDialog() {
        return (
            <Modal visible={this.state.deleteDialog} transparent={true}>
                <TouchableWithoutFeedback onPress={() => this.setState({ deleteDialog: false })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '90%', height: 211, backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 14, marginRight: 16 }} onPress={() => this.setState({ deleteDialog: false })}>
                                        <Image source={imgClose} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t('savedRemoveDialogText')}</Text>
                                </View>
                                <View style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 19, flexDirection: 'row' }}>
                                    <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ isFetching: true, deleteDialog: false, }, () => this._Travel(3))}>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorE94D3E, borderRadius: 4, width: '100%', height: 48 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('savedRemoveDialogBtn')}</Text>
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

    _setSelectedDates = (date) => {
        if (this.state._markedDates.length === 0) {
            this.state._markedDates = [date]
            let obj = this.state._markedDates.reduce((c, v) => Object.assign(c, {
                [v]: {
                    startingDay: true,
                    endingDay: false,
                    color: '#E8FBFE',
                    textColor: 'black',
                    selected: true,            //'dot'
                    selectedColor: '#B8EBF2',  //'dot'
                    selectedTextColor: 'black' //'dot'
                }
            }), {});
            console.log(obj)
            this.setState({ marked: obj, markedType: 'dot' });

        } else if (this.state._markedDates.length >= 2) {
            this.state._markedDates = [];
            this.state._markedDates = [date]
            let obj = this.state._markedDates.reduce((c, v) => Object.assign(c, {
                [v]: {
                    startingDay: true,
                    endingDay: false,
                    color: '#E8FBFE',
                    textColor: 'black',
                    selected: true,
                    selectedColor: '#B8EBF2',
                    selectedTextColor: 'black'
                }
            }), {});
            this.setState({ marked: obj, markedType: 'dot' });
        } else {
            if (this.state._markedDates.includes(date)) {
                this.state._markedDates = [];
                this.setState({ marked: null });
            } else if (parseInt(this.state._markedDates[0].replace(/-/gi, '')) > parseInt(date.replace(/-/gi, ''))) {
                this.state._markedDates = [];
                this.state._markedDates = [date]
                let obj = this.state._markedDates.reduce((c, v) => Object.assign(c, {
                    [v]: {
                        startingDay: true,
                        endingDay: false,
                        color: '#E8FBFE',
                        textColor: 'black',
                        selected: true,
                        selectedColor: '#B8EBF2',
                        selectedTextColor: 'black'
                    }
                }), {});
                this.setState({ marked: obj, markedType: 'dot' });
            } else {
                this.getDatesStartToLast(this.state._markedDates[0], date)
                this.state._markedDates = this.state._markedDates.concat(date)
                let obj = this.state._markedDates.reduce((c, v) => Object.assign({}, this.state.marked, {
                    [v]: {
                        startingDay: false,
                        endingDay: true,
                        color: '#E8FBFE',
                        textColor: 'black'
                    }
                }), {});
                console.log(obj)
                this.setState({ marked: obj, markedType: 'period' });
            }
        }
    }

    getDatesStartToLast(startDate, lastDate) {
        var regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
        if (!(regex.test(startDate) && regex.test(lastDate))) return "Not Date Format";
        var result = [];
        var curDate = new Date(startDate);
        while (curDate < new Date(lastDate)) {
            result.push(curDate.toISOString().split("T")[0]);
            if (this.state._markedDates.includes(curDate.toISOString().split("T")[0]) == false) {
                this.state._markedDates.push(curDate.toISOString().split("T")[0]);
                let obj = this.state._markedDates.reduce((c, v) => Object.assign({}, this.state.marked, {
                    [v]: {
                        startingDay: false,
                        endingDay: false,
                        color: '#E8FBFE',
                        textColor: 'black'
                    }
                }), {});
                this.state.marked = obj
                // this.setState({ marked: obj });
            }
            curDate.setDate(curDate.getDate() + 1);
        }
        console.log(this.state.marked)

        return result;
    }

    _TranslateLink() {
        if (I18n.currentLocale() == 'en-US') {
            return `You have been invited to ${User.nickname}'s ${this.state.title}`
        } else if (I18n.currentLocale() == 'ko-KR') {
            return `${User.nickname}님의 '${this.state.title}'에 초대 되었어요!`
        } else {
            return `${User.nickname}さんの「${this.state.title}」へ招待されました!`
        }
    }

    async DynamicLink(params, value, type) {
        const repPath = (this.state.selectedCityNo == 0 || this.state.selectedCityNo == -1) ? User.country.filter(el => el.country_no == this.state.selectedCountryNo)[0].img_path : User.city.filter(el => el.city_no == this.state.selectedCityNo)[0].img_path;
        console.log(ServerUrl.Server + repPath)
        const link = await firebase.dynamicLinks().buildShortLink({
            link: `https://www.budify.io/${params}/${value}`,
            // domainUriPrefix is created in your Firebase console
            // optional setup which updates Firebase analytics campaign
            // "banner". This also needs setting up before hand
            ios: {
                bundleId: 'org.ReactNativeBudify'
            },
            android: {
                packageName: 'com.reactnativebudify'
            },
            domainUriPrefix: 'https://reactnativebudify.page.link',
            social: {
                title: this.state.title,
                descriptionText: this._TranslateLink(),
                imageUrl: ServerUrl.Server + repPath,
            }
        }).then((shortLink) => {
            if (type == 1) {
                this.setState({ sharedDialogVisible: false, }, () => {
                    Toast.show({ text1: 'Copied.' });
                    Clipboard.setString(shortLink)
                })
            } else if (type == 2) {
                Linking.openURL('whatsapp://send?text=' + shortLink)
            } else if (type == 3) {
                this.setState({ sharedDialogVisible: false, }, () => this.props.navigation.navigate('InstagramShared', { link: shortLink, repPath: this.state.selectedCityNo == 0 || this.state.selectedCityNo == -1 ? User.country.filter(el => el.country_no == this.state.selectedCountryNo)[0].img_path : User.city.filter(el => el.city_no == this.state.selectedCityNo)[0].img_path, title: this.state.title, contents: this._TranslateLink(), category: this.state.showSelectedScheduleDate, city: this.state.selectedCity.length == 0 ? this.state.selectedCountry : this.state.selectedCity }))
            } else if (type == 4) {
                KakaoShareLink.sendFeed({
                    content: {
                        title: this.state.title,
                        description: this._TranslateLink(),
                        imageHeight: 120,
                        imageUrl: ServerUrl.Server + repPath,
                        link: {
                            webUrl: `https://www.budify.io/${params}/${value}`,
                            mobileWebUrl: shortLink,
                        },
                    },
                    buttons: [
                        {
                            title: '앱에서 보기',
                            link: {
                                androidExecutionParams: [{ key: params, value: '' + value }],
                                iosExecutionParams: [{ key: params, value: '' + value }],
                            },
                        },
                    ],
                });
            } else if (type == 5) {
                Linking.openURL('http://line.me/R/msg/text/?' + shortLink)
            } else if (type == 6) {
                Share.share({
                    title: shortLink,
                    url: shortLink
                })
                // ShareLib.open({
                //     title: shortLink,
                //     url: shortLink
                // })
            }
        });
    }

    _SharedDialog() {
        return (
            <Modal transparent={true} visible={this.state.sharedDialogVisible}>
                <TouchableWithoutFeedback onPress={() => this.setState({ sharedDialogVisible: false })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                        <TouchableWithoutFeedback >
                            <View style={{ width: '100%', backgroundColor: Colors.colorFFFFFF, borderTopLeftRadius: 8, borderTopRightRadius: 8, paddingTop: 16, paddingLeft: 16, paddingRight: 16, paddingBottom: 38 }}>
                                <Text style={{ fontSize: 20, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('share')}</Text>
                                <View style={{ marginTop: 12, height: 1, backgroundColor: Colors.colorBFBFBF }}></View>

                                <View style={{ marginTop: 20 }}>
                                    <TouchableOpacity style={{}} onPress={() => this.DynamicLink('Travel', this.props.route.params.travelNo == undefined ? this.state.travelNo : this.props.route.params.travelNo, 1)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }} imageStyle={{ tintColor: Colors.color569BEF }}>
                                                <Image source={imgLink} style={{ width: 17, height: 9 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareCopyLink')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink('Travel', this.props.route.params.travelNo == undefined ? this.state.travelNo : this.props.route.params.travelNo, 2)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <Image style={{ width: 32, height: 32, resizeMode: 'contain' }} source={imgWhatapp}></Image>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnWhatsApp')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink('Travel', this.props.route.params.travelNo == undefined ? this.state.travelNo : this.props.route.params.travelNo, 3)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgInstargramBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image style={{ width: 20, height: 16, resizeMode: 'contain' }} source={imgInstargram}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnInstagram')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink('Travel', this.props.route.params.travelNo == undefined ? this.state.travelNo : this.props.route.params.travelNo, 4)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                                <Image source={imgLinkKakao} style={{ width: 20, height: 16 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnKakao')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink('Travel', this.props.route.params.travelNo == undefined ? this.state.travelNo : this.props.route.params.travelNo, 5)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <Image style={{ width: 32, height: 32, resizeMode: 'contain' }} source={imgLine}></Image>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareOnLine')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.DynamicLink('Travel', this.props.route.params.travelNo == undefined ? this.state.travelNo : this.props.route.params.travelNo, 6)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                            <ImageBackground source={imgLinkBg} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }} imageStyle={{ tintColor: Colors.colorD9D9D9 }}>
                                                <Image source={imgLinkMore} style={{ width: 13, height: 3 }}></Image>
                                            </ImageBackground>
                                            <Text style={{ marginLeft: 9, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('shareMore')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal >
        )
    }
}