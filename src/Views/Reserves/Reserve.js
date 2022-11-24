import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, TouchableOpacity, Animated } from 'react-native'
import FastImage from 'react-native-fast-image'
import ImageViewer from 'react-native-image-zoom-viewer';
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import * as Utils from '../../Common/Utils'
import * as NetworkCall from '../../Common/NetworkCall'
import ServerUrl from '../../Common/ServerUrl'
import User from '../../Common/User';
import FetchingIndicator from 'react-native-fetching-indicator'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Moment from 'moment';

const TAG = "Reserve"
const imgBack = require('../../../assets/ic_back.png');
const imgRemove = require('../../../assets/remove.png');
const imgAdd = require('../../../assets/add.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgCheckOn = require('../../../assets/ic_check_on.png')
const imgCheckOff = require('../../../assets/ic_check_off.png')
const imgStarOn = require('../../../assets/ic_star.png');
const imgStarOff = require('../../../assets/ic_star_off.png');

export default class Reserve extends React.Component {
    constructor(props) {
        super(props)

    }

    state = {
        exNo: this.props.route.params.exNo,
        country: -1,
        city: -1,
        town: -1,
        address: '',
        addressDetail: '',
        lat: 37.541,
        lng: 126.986,
        categories: [],
        hashTags: [],
        title: '',
        description: '',
        price: 0,
        currency: '',
        currency1: '',
        minGuest: 0,
        maxGuest: 0,
        shortVideoLink: '',
        videoLink: '',
        includedItems: [],
        bringItems: [],
        criteria: '',
        imagesUrl: [],
        minutes: '',
        languages: '',
        representativeFileUrl: [],
        rate: 0,
        reviewCnt: 0,
        orderCnt: 0,
        createrInfo: {},
        isFetching: true,
        buddyProfile: '',
        totalCnt: 0,
        markedType: 'dot',
        _markedDates: [],
        marked: null,
        participants: 1,
        couponDatas: [],
        degreeCheck: false,
        selectDay: Moment(new Date()).format('YYYY-MM-DD'),
        calendarMonth: Moment(new Date()).format('YYYY-MM'),
        scheduleDatas: [],
        selectScheduleNo: -1,
        selectUserCouponNo: -1,
        phone: '',
        message: '',
        selectCoupon: null,
        isScheduleData: [],
        isScheduleMarked: null,
    }

    componentDidMount() {
        this.state._markedDates = [Moment(new Date()).format('YYYY-MM-DD')]
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
        this.state.marked = obj;
        this._Experience()
    }

    _ReviewStar(value) {
        let result = [];
        for (let i = 0; i < value; i++) {
            result = result.concat(
                <Image key={i} source={imgStarOn} style={{ width: 11, height: 11, resizeMode: 'contain' }}></Image>
            )
        }
        return result
    }

    async _Experience() {
        const url = ServerUrl.SelectExperience
        let formBody = JSON.stringify({
            "conditions": [
                {
                    "q": "=",
                    "f": "ex_no",
                    "v": this.props.route.params.exNo
                }
            ]
        })
        const json = await NetworkCall.Select(url, formBody)
        if (json.length > 0) {
            let representative = [];
            if (json[0].representative_file_url == null || json[0].representative_file_url.length == 0) {
                representative.push('https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013')
            } else {
                const representativeItem = JSON.parse(json[0].representative_file_url)
                for (let i = 0; i < representativeItem.length; i++) {
                    representative.push(ServerUrl.Server + representativeItem[i])
                }
            }

            let imagesItemUrl = [];

            if (json[0].image_urls == null || json[0].image_urls.length == 0) {
                imagesItemUrl.push({ url: 'https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013' })
            } else {
                const urls = JSON.parse(json[0].image_urls)
                for (let i = 0; i < urls.length; i++) {
                    imagesItemUrl.push({ url: ServerUrl.Server + urls[i] })
                }
            }

            let includs = [];
            if (json[0].description_cost_included == null || json[0].description_cost_included.length == 0) {

            } else {
                const inclusItem = JSON.parse(json[0].description_cost_included)
                for (let i = 0; i < inclusItem.length; i++) {
                    includs.push(inclusItem[i])
                }
            }

            let brings = [];
            if (json[0].description_guest_equipments == null || json[0].description_guest_equipments.length == 0) {

            } else {
                const bringsItem = JSON.parse(json[0].description_guest_equipments)
                for (let i = 0; i < bringsItem.length; i++) {
                    brings.push(bringsItem[i])
                }
            }

            let languageItems = '';
            if (this.state.lang == 'ko') {
                for (let i = 0; i < json[0].languages.length; i++) {
                    if (i != 0) {
                        languageItems += ', '
                    }
                    languageItems += json[0].languages[i].ko
                }
            } else if (this.state.lang == 'en') {
                for (let i = 0; i < json[0].languages.length; i++) {
                    if (i != 0) {
                        languageItems += ', '
                    }
                    languageItems += json[0].languages[i].en
                }
            } else if (this.state.lang == 'ja') {
                for (let i = 0; i < json[0].languages.length; i++) {
                    if (i != 0) {
                        languageItems += ', '
                    }
                    languageItems += json[0].languages[i].ja
                }
            }

            this.state.country = json[0].country;
            this.state.city = json[0].city;
            this.state.town = json[0].town;
            this.state.address = json[0].address;
            this.state.lat = json[0].lat;
            this.state.lng = json[0].lng;
            this.state.addressDetail = json[0].address_detail;
            this.state.categories = json[0].categories;
            this.state.hashTags = json[0].hashtags;
            this.state.title = json[0].title;
            this.state.description = json[0].description;
            this.state.price = json[0].price;
            this.state.currency = json[0].currency == "USD" ? "$" : json[0].currency == "KRW" ? "₩" : json[0].currency == "EUR" ? "€" : json[0].currency == "JPY" ? "¥" : json[0].currency;
            this.state.currency1 = json[0].currency
            this.state.minGuest = json[0].min_guest || 0;
            this.state.maxGuest = json[0].max_guest || 0;
            this.state.shortVideoLink = json[0].short_video_link;
            this.state.videoLink = json[0].video_link;
            this.state.includedItems = includs;
            this.state.bringItems = brings;
            this.state.criteria = json[0].description_criteria;
            this.state.imagesUrl = imagesItemUrl;
            this.state.minutes = json[0].minutes;
            this.state.languages = languageItems;
            this.state.representativeFileUrl = representative;
            this.state.rate = json[0].rate;
            this.state.reviewCnt = json[0].review_cnt;
            this.state.orderCnt = json[0].order_cnt;
            this.state.createrInfo = json[0].userInfo;
            this.state.isFetching = false;
            this.state.buddyProfile = json[0].userInfo.avatar_url || '';
            this._NetworkCoupon()
        } else {

        }
    }

    async _Schedule() {
        console.log('aa', this.state.calendarMonth)
        const url = ServerUrl.SelectExSchedule
        let formBody = JSON.stringify({
            // "ex_no": this.props.route.params.exNo,
            "ex_no": this.props.route.params.exNo,
            "conditions": [
                {
                    "op": "AND",
                    "q": "like",
                    "f": "datetime",
                    "str": this.state.calendarMonth
                },
                {
                    "op": "AND",
                    "q": "=",
                    "f": "ex_no",
                    "v": this.props.route.params.exNo
                }
            ]
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log(TAG, json[1]);
        if (json[1].length > 0) {
            for (let i = 0; i < json[1].length; i++) {
                const obj = {
                    scheduleNo: json[1][i].ex_schedules_no,
                    exNo: json[1][i].ex_no,
                    peopleCapacity: json[1][i].people_capacity,
                    peopleCurrent: json[1][i].people_current,
                    peopleCurrentList: json[1][i].people_current_list,
                    status: json[1][i].status,
                    dateTime: json[1][i].datetime
                }
                this._setIsSchedul(Moment(json[1][i].datetime).format('YYYY-MM-DD'))
                this.state.scheduleDatas.push(obj)
            }
        } else {

        }
        this.setState({
            isFetching: false,
            isRefreshing: false
        })
    }

    _NetworkCoupon() {
        var url = "";
        var formBody = '';
        this.state.couponDatas = [];
        formBody = JSON.stringify({
            'conditions': [{
                "q": "=",
                "f": "user_no",
                "v": User.userNo
            }]
        });
        url = ServerUrl.SelectUserCoupon

        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'default',
            body: formBody,
        }).then(
            response => response.json()
        ).then(
            json => {
                console.log('Coupon', json)
                if (json.length > 0) {
                    for (let i = 0; i < json.length; i++) {
                        if (json[i].status == 1) {
                            const obj = {
                                couponNo: json[i].coupon_no,
                                userCouponNo: json[i].user_coupon_no,
                                status: json[i].status,
                                expiredDt: Moment(json[i].expired_dt).format('YYYY-MM-DD'),
                                title: json[i].couponInfo.type == 1 ? (json[i].couponInfo.currency == "USD" ? "$" : json[i].couponInfo.currency == "KRW" ? "₩" : json[i].couponInfo.currency == "EUR" ? "€" : json[i].couponInfo.currency == "JPY" ? "¥" : json[i].couponInfo.currency) + Utils.numberWithCommas(json[i].couponInfo.price) + ' ' + json[i].couponInfo.name : json[i].couponInfo.price + "%" + ' ' + json[i].couponInfo.name,
                                type: json[i].couponInfo.type,
                                price: json[i].couponInfo.price,
                            }
                            this.state.couponDatas.push(obj)
                        }
                    }
                } else {

                }
                this._Schedule()
            })
    }

    _setIsSchedul = (date) => {
        this.state.isScheduleData = this.state.isScheduleData.concat(date)
        let obj = this.state.isScheduleData.reduce((c, v) => Object.assign({}, this.state.isScheduleMarked, {
            [v]: {
                marked: true,
                dotColor: Colors.color289FAF,
                selected: this.state.selectDay == date ? true : false,
            }
        }), {});
        this.state.isScheduleMarked = obj;
        // console.log(obj)
    }

    _setSelectedDates = (date) => {
        this.state.scheduleDatas = []
        this.state._markedDates = []
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
        this.state.marked = obj;
        this.state.selectDay = date;
        this._Schedule()
        // this.setState({ isFetching: false, marked: obj, selectDay: date })
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('ReserveTitle')}</Text>
                        </View>
                    </TouchableOpacity>

                    <KeyboardAwareScrollView>
                        <View style={{ paddingLeft: 16, paddingRight: 16, flexDirection: 'row', marginTop: 24, }}>
                            <Image style={{ width: 120, height: 92, resizeMode: 'cover' }} resizeMethod="resize" source={{ uri: this.state.representativeFileUrl[0] }}></Image>
                            <View style={{ marginLeft: 14, flex: 1 }}>
                                <Text style={{ fontFamily: 'Raleway-Medium', fontSize: 16, includeFontPadding: false, color: Colors.color000000 }}>{this.state.title}</Text>
                                <View style={{ marginTop: 12, flexDirection: 'row' }}>
                                    {this.state.reviewCnt == 0 ? <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, }}>{I18n.t('homeNewExperience') + ' '}</Text> : (
                                        <View style={{ flexDirection: 'row' }}>
                                            <Image source={imgStarOn} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, marginLeft: 2 }}>{this.state.rate}</Text>
                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }}>{" (" + this.state.reviewCnt + ") "}</Text>
                                        </View>
                                    )}
                                    <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, }} >{"・" + this.state.currency + Utils.numberWithCommas(this.state.price)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ marginTop: 28, height: 8, backgroundColor: Colors.colorF4F4F4 }}></View>

                        <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 16, }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, }}>{I18n.t('ReserveDateTime')}</Text>
                            <View style={{ borderColor: Colors.colorCFCFCF, padding: 4, borderRadius: 4, borderWidth: 1, marginTop: 12 }}>
                                <Calendar
                                    onDayPress={day => {
                                        this.state.selectUserCouponNo = -1
                                        this.state.selectCoupon = null
                                        this.state.selectScheduleNo = -1
                                        this._setSelectedDates(day.year + "-" + day.dateString.split('-')[1] + "-" + day.dateString.split('-')[2])
                                        // console.log(day)
                                    }}
                                    onMonthChange={month => this.setState({ calendarMonth: month.dateString.substring(0, 7), scheduleDatas: [], isFetching: true, isScheduleData: [], isScheduleMarked: null }, () => this._Schedule())}
                                    markingType={'dot'}
                                    style={{ width: '100%' }}
                                    markedDates={this.state.isScheduleMarked}
                                    enableSwipeMonths={true}
                                />
                            </View>
                            <ScrollView horizontal style={{ marginTop: 12 }}>
                                {this.state.scheduleDatas.filter(el => Moment(el.dateTime).format('YYYY-MM-DD') == this.state.selectDay).map((item, index) => (
                                    <TouchableOpacity onPress={() => item.peopleCapacity - item.peopleCurrent > 0 && this.setState({ selectScheduleNo: this.state.selectScheduleNo == item.scheduleNo ? -1 : item.scheduleNo })}>
                                        <View style={{ borderRadius: 4, borderWidth: 1, borderColor: this.state.selectScheduleNo == item.scheduleNo ? Colors.color2D7DC8 : Colors.colorB7B7B7, backgroundColor: this.state.selectScheduleNo == item.scheduleNo ? 'rgba(154, 206, 255, 0.22)' : Colors.colorFFFFFF, alignItems: 'center', justifyContent: 'center', paddingTop: 5, paddingBottom: 5, paddingLeft: 10, paddingRight: 10, marginLeft: index == 0 ? 0 : 12 }}>
                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: this.state.selectScheduleNo == item.scheduleNo ? Colors.color2D7DC8 : Colors.color000000, }}>{item.dateTime.substring(10, 16)}</Text>
                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: this.state.selectScheduleNo == item.scheduleNo ? Colors.color2D7DC8 : Colors.color000000, }}>{I18n.t('ReserveRemainigSeats') + ': ' + item.peopleCurrent + '/' + item.peopleCapacity}</Text>
                                        </View>
                                    </TouchableOpacity>

                                ))}
                            </ScrollView>
                        </View>

                        <View style={{ height: 1, backgroundColor: Colors.colorE5E5E5, marginTop: 20 }}></View>

                        <View style={{ flexDirection: 'row', paddingLeft: 16, paddingTop: 16, paddingBottom: 16 }}>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, }}>{I18n.t('ReserveNumofParticipants')}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <TouchableOpacity style={{ width: 60, height: 30, alignItems: 'center', justifyContent: 'center' }} onPress={() => this.setState({ participants: this.state.participants > 1 ? this.state.participants - 1 : this.state.participants })}>
                                    <Image style={{ width: 16, height: 16, resizeMode: 'contain' }} source={imgRemove}></Image>
                                </TouchableOpacity>
                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, }}>{this.state.participants}</Text>
                                <TouchableOpacity style={{ width: 60, height: 30, alignItems: 'center', justifyContent: 'center' }} onPress={() => this.setState({ participants: this.state.participants + 1 })}>
                                    <Image style={{ width: 16, height: 16, resizeMode: 'contain' }} source={imgAdd}></Image>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ height: 1, backgroundColor: Colors.colorE5E5E5, }}></View>

                        <View style={{ marginTop: 16, paddingLeft: 16, paddingRight: 14 }}>
                            <View style={{ flexDirection: 'row', height: 48, width: '100%', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, }}>{I18n.t('ReservePhone')}</Text>
                                <TouchableOpacity style={{ flex: 0.35, marginLeft: 4 }}>
                                    <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 11 }}>{"+82"}</Text>
                                        <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 18 }} source={imgDownArrow}></Image>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ flex: 0.65, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: 9, paddingLeft: 4, height: 48, borderRadius: 4 }}>
                                    <TextInput onChangeText={(text) => { this.setState({ phone: text.replace('-', '').replace('.', '') }) }} value={this.state.phone} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={"010-1111-1111"} autoCapitalize="none" returnKeyType="next" keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'} placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', height: 48, width: '100%', alignItems: 'center', marginTop: 16 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, }}>{I18n.t('ReserveMessage')}</Text>
                                <View style={{ flex: 1, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: 4, paddingLeft: 4, height: 48, borderRadius: 4 }}>
                                    <TextInput onChangeText={(text) => { this.setState({ message: text }) }} value={this.state.message} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('ReserveMessageHint')} autoCapitalize="none" returnKeyType="next" placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                                </View>
                            </View>
                        </View>

                        <View style={{ marginTop: 28, height: 8, backgroundColor: Colors.colorF4F4F4 }}></View>

                        <View style={{ paddingLeft: 16, paddingTop: 16, paddingBottom: 16, paddingRight: 16 }}>
                            <View style={{ justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, }}>{I18n.t('ReserveCouponsTitle')}</Text>
                            </View>
                            <FlatList style={{ marginBottom: 20 }} horizontal keyExtractor={(item, index) => index.toString()} data={this.state.couponDatas} renderItem={(obj) => {
                                return (
                                    <TouchableOpacity onPress={() => this.setState({ selectUserCouponNo: obj.item.userCouponNo, selectCoupon: obj.item, })}>
                                        <View key={obj.index} style={{ height: 95, backgroundColor: this.state.selectUserCouponNo == obj.item.userCouponNo ? 'rgba(154, 206, 255, 0.22)' : Colors.colorFFFFFF, marginTop: 12, padding: 12, borderWidth: 1, borderColor: this.state.selectUserCouponNo == obj.item.userCouponNo ? Colors.color2D7DC8 : Colors.colorC4C4C4, borderRadius: 4, marginLeft: obj.index == 0 ? 0 : 8 }}>
                                            <Text style={{ flex: 1, fontSize: 16, color: this.state.selectUserCouponNo == obj.item.userCouponNo ? Colors.color2D7DC8 : Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{obj.item.title}</Text>
                                            <View style={{ marginBottom: 4, flexDirection: 'row' }}>
                                                <Text style={{ fontSize: 12, color: this.state.selectUserCouponNo == obj.item.userCouponNo ? Colors.color2D7DC8 : Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('myCouponsExpiration')}</Text>
                                                <Text style={{ fontSize: 12, color: this.state.selectUserCouponNo == obj.item.userCouponNo ? Colors.color2D7DC8 : Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginLeft: 9 }}>{obj.item.expiredDt}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }} >
                            </FlatList>

                            <TouchableOpacity onPress={() => this.setState({ degreeCheck: this.state.degreeCheck == false ? true : false, })}>
                                <View style={{ flexDirection: 'row', paddingRight: 16 }}>
                                    <Image source={(this.state.degreeCheck == false ? imgCheckOff : imgCheckOn)} style={{ width: 15, height: 15, resizeMode: 'contain' }}></Image>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginLeft: 9, }}>
                                        <Text style={{ color: Colors.color000000, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('ReserveAgreeText')}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            <View style={{ marginTop: 20 }}>
                                <TouchableOpacity disabled={(this.state.selectScheduleNo != -1 && this.state.degreeCheck != false && this.state.phone.length > 0) ? false : true} onPress={() => this.props.navigation.navigate('Payment', { exNo: this.state.exNo, exScheduleNo: this.state.selectScheduleNo, title: this.state.title, price: this.state.price, currency: this.state.currency1, amount: this.state.participants, message: this.state.message, phone: this.state.phone, coupon: this.state.selectCoupon })}>
                                    <View style={{ width: '100%', height: 48, borderRadius: 4, backgroundColor: (this.state.selectScheduleNo != -1 && this.state.degreeCheck != false && this.state.phone.length > 0) ? Colors.color2D7DC8 : Colors.colorB7B7B7, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF, }}>{this.state.currency + Utils.numberWithCommas(this.state.selectCoupon == null ? (this.state.price * this.state.participants) : this.state.selectCoupon.type == 1 ? ((this.state.price * this.state.participants) > this.state.selectCoupon.price ? (this.state.price * this.state.participants) - this.state.selectCoupon.price : 0) : ((this.state.price * this.state.participants) - ((this.state.price * this.state.participants) * this.state.selectCoupon.price) / 100)) + ' ' + I18n.t('ReservePay')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.colorE94D3E, marginTop: 12, marginBottom: 20 }}>{I18n.t('ReserveInfoText')}</Text>
                        </View>
                    </KeyboardAwareScrollView>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}