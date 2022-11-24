import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, Button, TouchableOpacity } from 'react-native'
import SelectDialog from '../Common/SelectDialog'
import Colors from '../Common/Colos'
import I18n from '../lang/i18n';
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import { getProfileData } from 'react-native-calendars/src/Profiler';
import AsyncStorage from '@react-native-community/async-storage';
import ServerUrl from '../Common/ServerUrl'
import * as NetworkCall from '../Common/NetworkCall'
import * as Utils from '../Common/Utils'
import User from '../Common/User';
import FastImage from 'react-native-fast-image';
import Moment from 'moment'
import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';
import FetchingIndicator from 'react-native-fetching-indicator'

const TAG = "ProfileTabs";
const imgPlus = require('../../assets/ic_plus.png');
const imgRegionBg = require('../../assets/img_region_bg.png');
const imgDownArrow = require('../../assets/ic_down_arrow.png');
const imgCanlendar = require('../../assets/ic_calendar_icon.png');
const imgRightArrow = require('../../assets/ic_arrow_right.png');
const imgCircleSaveBg = require('../../assets/ic_circle_saved.png');
const imgBookmark = require('../../assets/ic_bookmark.png');
const imgStarOn = require('../../assets/ic_star.png');
const imgStarOff = require('../../assets/ic_star_off.png');
const imgBack = require('../../assets/ic_back.png');
const imgCalendarPrevious = require('../../assets/ic_calendar_arrow_left.png');
const imgCalendarNext = require('../../assets/ic_calendar_arrow_right.png');
const imgNotification = require('../../assets/ic_notification.png');
const imgAccount = require('../../assets/account_circle.png')
const imgRejected = require('../../assets/ic_rejected.png')
const imgAccept = require('../../assets/ic_accept.png')

const { width: screenWidth } = Dimensions.get('window');

export default class ProfileTabs extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // BackHandler.addEventListener("hardwareBackPress", this.backAction);
        AsyncStorage.getItem('userInfo', (err, result) => {
            if (result != null) {
                const UserInfo = JSON.parse(result);
                console.log(TAG, UserInfo);
                this.setState({
                    nickName: UserInfo.nickname,
                    profileUrl: UserInfo.profileUrl,
                    level: UserInfo.level,
                })
            } else {

            }
        });
        this._Travel()
    }
    componentWillUnmount() {
        // BackHandler.removeEventListener('hardwareBackPress', this.backAction);
        console.log(TAG, 'componentWillUnmount')
    }
    componentDidUpdate() {
        console.log(TAG, 'componentDidUpdate')
    }

    state = {
        isLoading: false,
        profileUrl: '',
        nickName: '',
        profileType: 1, //1-basic, 2-host
        tabType: 1, //1-reserve, 2-history
        tripComing: [],
        tripPast: [],
        newOrder: [],
        payHistory: [],
        isFetching: true,
        isRefreshing: false,
    }

    render() {
        console.log('rerender')
        var newArr = this.state.profileType == 1 ? this.state.tabType == 1 ? this.state.tripComing : this.state.tripPast : this.state.tabType == 1 ? this.state.newOrder : this.state.payHistory
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    {/* <ScrollView>
                        
                    </ScrollView> */}

                    <FlatList showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} keyExtractor={(item, index) => index.toString()} data={newArr}
                        onRefresh={() => this.setState({ isRefreshing: true, tripComing: [], tripPast: [], newOrder: [], payHistory: [], }, () => this._Travel())}
                        refreshing={this.state.isRefreshing}
                        ListHeaderComponent={(
                            <View>
                                <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('AlarmList')} disabled={true}>
                                        <View style={{ flexDirection: 'row', opacity: 0 }}>
                                            <Image style={{ width: 16, height: 20, resizeMode: 'contain' }} source={imgNotification}></Image>
                                            <View style={{ width: 6, height: 6, backgroundColor: Colors.colorE94D3E, borderRadius: 3 }}></View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={{ flex: 1 }}></View>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('EditProfile')}>
                                        <Text style={{ fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Medium', marginRight: 19, textDecorationLine: 'underline', includeFontPadding: false }}>{I18n.t('profileShowProfile')}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ width: 60, height: 60, borderRadius: 50, backgroundColor: Colors.colorF5F5F5, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 10 }}>
                                    <Image source={imgAccount} style={{ width: 40, height: 40, }}></Image>
                                    <Image style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 200, }} source={(this.state.profileUrl.length > 0 ? { uri: ServerUrl.Server + this.state.profileUrl } : null)}></Image>
                                </View>

                                <View style={{ marginTop: 4, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{this.state.nickName}</Text>
                                </View>

                                <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center', opacity: 1 }}>
                                    <View style={{ backgroundColor: this.state.profileType == 1 ? 'rgba(154,206,255,0.5)' : 'rgba(40, 159, 175, 0.3)', flexDirection: 'row', borderRadius: 14, paddingTop: 2, paddingBottom: 2, paddingLeft: 3, paddingRight: 3, }}>
                                        <TouchableOpacity onPress={() => this.setState({ profileType: 1, isFetching: true, }, () => this._TabClick())}>
                                            <View style={{ paddingTop: 3, paddingBottom: 4, paddingLeft: 11, paddingRight: 11, backgroundColor: (this.state.profileType == 1 ? Colors.colorFFFFFF : 'rgba(154,206,255,0)'), borderRadius: 12 }}>
                                                <Text style={{ fontSize: 12, color: (this.state.profileType == 1 ? Colors.color000000 : Colors.color289FAF), fontFamily: 'Raleway-Regular', includeFontPadding: false }}>{I18n.t('profileTraveler')}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.setState({ profileType: 2, isFetching: true, }, () => this._TabClick())}>
                                            <View style={{ paddingTop: 3, paddingBottom: 4, paddingLeft: 11, paddingRight: 11, backgroundColor: (this.state.profileType == 2 ? Colors.colorFFFFFF : 'rgba(154,206,255,0)'), borderRadius: 12 }}>
                                                <Text style={{ fontSize: 12, color: (this.state.profileType == 2 ? Colors.color000000 : Colors.color2D7DC8), fontFamily: 'Raleway-Regular', includeFontPadding: false }}>{I18n.t('profileHost')}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={{ marginTop: 58, marginLeft: 24, marginRight: 25, shadowOpacity: 0.2, padding: 5, }}>
                                    <View style={{
                                        width: '100%', height: 97, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorFFFFFF,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 2,
                                        elevation: 2,
                                        borderRadius: 2
                                    }}>
                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate(this.state.profileType == 1 ? 'MyExperiences' : 'HostExperiencesManage')}>
                                            <View style={{ height: 48, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t(this.state.profileType == 1 ? 'profileMyExperiences' : 'profileAddExperiences')}</Text>
                                                <Image style={{ width: 10, height: 17, position: 'absolute', right: 12 }} source={imgRightArrow}></Image>
                                            </View>
                                        </TouchableWithoutFeedback>

                                        <View style={{ height: 0.5, backgroundColor: Colors.color5B5B5B, width: '100%' }}></View>

                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate(this.state.profileType == 1 ? 'MyCoupons' : 'HostReserveManager')}>
                                            <View style={{ height: 48, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t(this.state.profileType == 1 ? 'profileMyCoupons' : 'profileReserveExperiences')}</Text>
                                                <Image style={{ width: 10, height: 17, position: 'absolute', right: 12 }} source={imgRightArrow}></Image>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                </View>

                                <TouchableOpacity onPress={() => this.props.navigation.navigate('Support')}>
                                    <View style={{ marginTop: 9, alignItems: 'flex-end', paddingRight: 27, opacity: 1 }}>
                                        <Text style={{ textDecorationLine: 'underline', color: Colors.color5B5B5B, fontFamily: 'Raleway-Regular', fontSize: 12, includeFontPadding: false }}>{I18n.t('profileSupport')}</Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={{ marginTop: 41, paddingLeft: 16, paddingRight: 16, flexDirection: 'row', opacity: 1 }}>
                                    <View style={{ position: 'absolute', height: 4, backgroundColor: Colors.colorD9D9D9, width: '100%', bottom: 0, left: 16 }}></View>
                                    <TouchableOpacity onPress={() => this.setState({ tabType: 1, isFetching: true, }, () => this._TabClick())}>
                                        <View style={{ justifyContent: 'flex-end' }}>
                                            <View style={{ paddingLeft: 18, paddingRight: 18, marginBottom: 8 }}>
                                                <Text style={{ color: this.state.tabType == 1 ? Colors.color2D7DC8 : Colors.color5B5B5B, fontFamily: 'Raleway-Bold', fontSize: 15, includeFontPadding: false }}>{I18n.t(this.state.profileType == 1 ? 'profileUpcomingTrips' : 'profileHostRecent')}</Text>
                                            </View>
                                            <View style={{ height: 4, backgroundColor: Colors.color2D7DC8, opacity: this.state.tabType == 1 ? 1 : 0 }}></View>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => this.setState({ tabType: 2, isFetching: true, }, () => this._TabClick())}>
                                        <View style={{ justifyContent: 'flex-end' }}>
                                            <View style={{ paddingLeft: 18, paddingRight: 18, marginBottom: 8 }}>
                                                <Text style={{ color: this.state.tabType == 2 ? Colors.color2D7DC8 : Colors.color5B5B5B, fontFamily: 'Raleway-Bold', fontSize: 15, includeFontPadding: false }}>{I18n.t(this.state.profileType == 1 ? 'profilePastTripMemories' : 'profileHostHistory')}</Text>
                                            </View>
                                            <View style={{ height: 4, backgroundColor: Colors.color2D7DC8, opacity: this.state.tabType == 2 ? 1 : 0 }}></View>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={{ flex: 1 }}></View>

                                </View>
                            </View>
                        )}
                        renderItem={(obj) => {
                            return (
                                <TouchableOpacity onPress={() => this.state.profileType == 1 ? this.props.navigation.navigate('SavedScheduleMain', { travelNo: obj.item.travelNo, position: 'Profile' }) : this.props.navigation.navigate('HostReserveManager')}>

                                    {this.state.profileType == 1 ? (
                                        <View style={{ height: 80, flexDirection: 'row', paddingLeft: 16, paddingRight: 16, marginTop: 12 }}>
                                            <View style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
                                                <FastImage style={{ width: 80, height: 80, borderRadius: 40, resizeMode: 'cover', backgroundColor: Colors.colorB7B7B7 }} source={{ uri: ServerUrl.Server + obj.item.repPath, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal, }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.2)', position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                                                    <AutoSizeText style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, textAlign: 'center' }} fontSize={16} numberOfLines={1} mode={ResizeTextMode.max_lines}>{obj.item.repName}</AutoSizeText>
                                                </View>
                                            </View>
                                            <View style={{ justifyContent: 'center', marginLeft: 16, }}>
                                                <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', fontSize: 16, includeFontPadding: false }}>{obj.item.title}</Text>
                                                <Text style={{ color: Colors.color5B5B5B, fontFamily: 'Raleway-Medium', fontSize: 12, includeFontPadding: false, marginTop: 8 }}>{`${Moment(obj.item.startDt).format('YYYY.MM.DD')} ~ ${Moment(obj.item.endDt).format('MM.DD')}`}</Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <View>
                                            {this.state.tabType == 1 && (
                                                <View style={{ flexDirection: 'row', paddingLeft: 16, paddingRight: 16, marginTop: 20, alignItems: 'center' }}>
                                                    <Image style={{ width: 80, height: 80, resizeMode: 'cover', borderRadius: 40 }} source={{ uri: ServerUrl.Server + obj.item.repPath }}></Image>
                                                    <View style={{ marginLeft: 15, flex: 1 }}>
                                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16 }}>{obj.item.title}</Text>
                                                        <Text style={{ color: Colors.color5B5B5B, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginTop: 4 }}>{Moment(obj.item.dateTime).format('YYYY.MM.DD (HH:mm)') + '・' + obj.item.amount + I18n.t('reserveAddDialogNum')}</Text>
                                                        {obj.item.approval == 1 ? (
                                                            <View style={{ flexDirection: 'row', marginTop: 9 }}>
                                                                <TouchableOpacity onPress={() => this.setState({ isFetching: true, }, () => this._UpdateOrder(obj.item.orderNo, 2))}>
                                                                    <View style={{ backgroundColor: Colors.color2D7DC8, paddingTop: 5, paddingBottom: 5, paddingLeft: 25, paddingRight: 24, borderRadius: 40 }}>
                                                                        <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 10 }} >{I18n.t('reserveAccept')}</Text>
                                                                    </View>
                                                                </TouchableOpacity>

                                                                <TouchableOpacity onPress={() => this.setState({ isFetching: true, }, () => this._UpdateOrder(obj.item.orderNo, 3))}>
                                                                    <View style={{ borderColor: Colors.color2D7DC8, borderWidth: 1, paddingTop: 5, paddingBottom: 5, paddingLeft: 25, paddingRight: 24, borderRadius: 40, marginLeft: 4 }}>
                                                                        <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 10 }} >{I18n.t('reserveDecline')}</Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            </View>
                                                        )
                                                            : obj.item.approval == 2 ? (
                                                                <View>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 9, }}>
                                                                        <Image source={imgAccept} style={{ width: 14, height: 14, resizeMode: 'contain', }}></Image>
                                                                        <Text style={{ color: Colors.color64B465, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 12, marginLeft: 5 }}>{I18n.t('profileExAccept')}</Text>
                                                                    </View>
                                                                </View>
                                                            ) : (
                                                                <View>
                                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 9, }}>
                                                                        <Image source={imgRejected} style={{ width: 14, height: 14, resizeMode: 'contain', }}></Image>
                                                                        <Text style={{ color: Colors.colorE94D3E, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 12, marginLeft: 5 }}>{I18n.t('profileExRejected')}</Text>
                                                                    </View>
                                                                </View>
                                                            )}

                                                    </View>
                                                    <Image style={{ width: 10, height: 17, resizeMode: 'contain', tintColor: Colors.color5B5B5B }} source={imgRightArrow}></Image>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )
                        }}
                        ListFooterComponent={<View style={{ height: 20 }}></View>}></FlatList>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView >
        )
    }

    _TabClick() {
        if (this.state.profileType == 1 && this.state.tabType == 1 && this.state.tripComing.length == 0) {
            this._Travel()
        } else if (this.state.profileType == 1 && this.state.tabType == 2 && this.state.tripPast.length == 0) {
            this._Travel()
        } else if (this.state.profileType == 2 && this.state.tabType == 1 && this.state.newOrder.length == 0) {
            this._Travel()
        } else {
            this.setState({ isFetching: false, isRefreshing: false, })
            return;
        }
    }

    async _Travel() {
        let url = ServerUrl.SelectTravel
        let formBody = {};
        console.log(this.state.profileType, this.state.tabType)
        if (this.state.profileType == 1 && this.state.tabType == 1) {
            this.state.tripComing = [];
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
        } else if (this.state.profileType == 1 && this.state.tabType == 2) {
            this.state.tripPast = [];
            formBody = JSON.stringify({
                "conditions": [
                    {
                        "q": "=",
                        "f": "user_no",
                        "v": User.userNo
                    }, {
                        "op": "AND",
                        "q": "<",
                        "f": "end_dt",
                        "v": "\'" + Moment(new Date()).format('YYYY-MM-DD') + "\'"
                    }
                ]
            })
        } else if (this.state.profileType == 2 && this.state.tabType == 1) {
            console.log('aaaa')
            url = ServerUrl.SelectRecentOrder
            formBody = JSON.stringify({
                "user_no": User.userNo,
                "conditions": [
                    { "q": ">", "f": "es.datetime", "v": "NOW()" },
                    { "q": "group", "f": "order_no" }
                ],
            })
        } else {
            this.setState({ isFetching: false, isRefreshing: false, })
            return;
        }

        const json = await NetworkCall.Select(url, formBody)
        console.log('_Travel', json)
        if (json.length > 0) {
            for (let i = 0; i < json.length; i++) {
                if (this.state.profileType == 1) {
                    const obj = {
                        travelNo: json[i].travel_no,
                        repPath: ((json[i].city_no == -1 || json[i].city_no == 0) == true ? User.country.filter(el => el.country_no == json[i].country_no)[0].img_path : User.city.filter(el => el.city_no == json[i].city_no)[0].img_path),
                        repName: ((json[i].city_no == -1 || json[i].city_no == 0) == true ? Utils.Grinder(User.country.filter(el => el.country_no == json[i].country_no)[0]) : Utils.Grinder(User.city.filter(el => el.city_no == json[i].city_no)[0])),
                        title: json[i].title,
                        startDt: json[i].start_dt,
                        endDt: json[i].end_dt,
                    }
                    if (this.state.profileType == 1 && this.state.tabType == 1) {
                        this.state.tripComing.push(obj)
                    } else if (this.state.profileType == 1 && this.state.tabType == 2) {
                        this.state.tripPast.push(obj)
                    }
                } else {
                    const obj = {
                        orderNo: json[i].order_no,
                        amount: json[i].amount,
                        title: json[i].title,
                        exScheduleNo: json[i].ex_schedules_no,
                        exNo: json[i].ex_no,
                        dateTime: json[i].datetime,
                        repPath: JSON.parse(json[i].exInfo.representative_file_url)[0],
                        approval: json[i].approval
                    }
                    this.state.newOrder.push(obj)
                }
            }
            this.setState({ isFetching: false, isRefreshing: false, })
        } else {
            this.setState({ isFetching: false, isRefreshing: false, })
        }
    }

    async _UpdateOrder(value, approval) {
        console.log(value)
        const url = ServerUrl.Server + 'mOrder/updateOrder'
        let formBody = JSON.stringify({
            "order_no": value,
            "approval": approval
        })
        console.log(formBody)
        const json = await NetworkCall.Select(url, formBody)
        console.log('_UpdateOrder', json)

        if (approval == 3) {
            this._CancelOrder(value)
        } else {
            this.state.newOrder = [];
            this._Travel()
        }
    }

    //승인, 거절
    async _CancelOrder(value) {
        const url = ServerUrl.Server + 'mOrder/cancelOrder'
        console.log(this.props.route.params)
        let formBody = JSON.stringify({
            "order_no": value,
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log('_CancelOrder', json)
        this.state.newOrder = [];
        this._Travel()
    }
}