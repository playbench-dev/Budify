import React from 'react';
import { StatusBar, SafeAreaView, View, Text, Image, FlatList, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, Animated, TextInput, KeyboardAvoidingView, Platform, ScrollView, PermissionsAndroid, SectionList } from 'react-native'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import * as Utils from '../../Common/Utils'
import User from '../../Common/User';
import BasicDialog from '../../Common/BasicDialog'
// import Moment from 'moment'
import Moment from 'moment/min/moment-with-locales'
import Collapsible from 'react-native-collapsible';
import ServerUrl from '../../Common/ServerUrl';
import FetchingIndicator from 'react-native-fetching-indicator'
import * as NetworkCall from '../../Common/NetworkCall'
import SelectDropdown from 'react-native-select-dropdown'

const hours = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
const minutes = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
    "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
    "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
    "30", "31", "32", "33", "34", "35", "36", "37", "38", "39",
    "40", "41", "42", "43", "44", "45", "46", "47", "48", "49",
    "50", "51", "52", "53", "54", "55", "56", "57", "58", "59",
]

const TAG = 'HostReserveManager';
const imgBack = require('../../../assets/ic_back.png');
const imgCheckOn = require('../../../assets/ic_check_on.png')
const imgCheckOff = require('../../../assets/ic_check_off.png')
const imgLeftArrow = require('../../../assets/ic_calendar_arrow_left.png');
const imgRightArrow = require('../../../assets/ic_calendar_arrow_right.png');
const imgRegionBg = require('../../../assets/img_region_bg.png');
const imgClose = require('../../../assets/ic_close.png')
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgSchedule = require('../../../assets/ic_schedule.png');
const imgAccount = require('../../../assets/account_circle.png')

const { width: screenWidth } = Dimensions.get('window');
const colorDatas = ['#E94D3E', '#F19837', '#F7CD46', '#2196F3', '#3F51B5', '#9C27B0', '#00BCD4', '#4CAF50', '#009688', '#795548']
export default class HostReserveManager extends React.Component {
    constructor(props) {
        super(props)
    }
    state = {
        selectedExperienceNo: -1,
        listItem: [],
        allSlotFlag: true,
        today: Moment(),
        selectedDay: '',
        dayTitleTextKo: ["일", "월", "화", "수", "목", "금", "토"],
        dayTitleTextEn: ["SU", "MO", "TU", "WE", "TH", "FR", "SA"],
        dayTitleTextJa: ["日", "月", "火", "水", "木", "金", "土"],
        dayTitleText: [],
        dayTextKo: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
        dayTextEn: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
        dayTextJa: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
        firstWeek: '',
        lastWeek: '',
        calendarHeight: 0,
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
        waitingDialogVisible: false,
        isFetching: true,
        upcomingDatas: [],
        pastDatas: [],
        cancelDatas: [],
        collapsPosition: -1,
        managementCollaps: true,
        acceptPosition: -1,
        declinePosition: -1,
        addDialogVisible: false,
        managementDialogVisible: false,
        scheduleDialogVisivle: false,
        deleteDialogVisible: false,
        exScheduleList: [],
        sameExNo: [],
        isFetching: true,
        //add
        addExSchedulesList: [],
        repeat: -1, //1 - days, 2 - weeks, 3 - months
        amount: '',
        period: '',
        selecthour: '',
        selectminutes: '',
        //
        //manageSchedule
        manageScheduleData: {},
        updateAmount: -1,
        //
        //guest
        guestListData: [],
        approvalGeustList: 0,

        acceptOrderNo: -1,
        animation: new Animated.Value(0),
        reserveSuccess: false,
    }

    componentDidMount() {
        this._MyExperiences()
    }

    _MakeListItem(date) {
        if (this.state.selectedExperienceNo != -1) { //schedule add
            this.setState({
                selectedDay: date,
                calendarStatus: 1,
                addDialogVisible: true,
                // managementDialogVisible: true,
                // scheduleDialogVisivle: true
            })
        } else {
            this.setState({
                selectedDay: date,
                calendarStatus: 1,
                // addDialogVisible: true,
                // managementDialogVisible: true,
                scheduleDialogVisivle: true
            })
        }
    }

    _SameExInsertRemove(value) {
        if (this.state.sameExNo.includes(value)) {
            const newList = this.state.sameExNo.filter((item) => item !== value);
            this.setState({ sameExNo: newList })
        } else {
            this.state.sameExNo.push(value)
            this.setState({ isFetching: false })
        }
        console.log()
    }

    _CalendarArr = (value) => {

        let result = [];
        let week = this.state.firstWeek;
        let heightDivide = 0;

        if (this.state.calendarStatus == 0) {
            heightDivide = this.state.calendarHeight / (this.state.lastWeek - week + 1)
        } else {
            heightDivide = 65
        }
        for (week; week <= this.state.lastWeek; week++) {
            result = result.concat(
                <View key={week} style={{ flexDirection: 'row', flexWrap: 'nowrap', height: heightDivide, }} >
                    {Array(7).fill(0).map((data, index) => {
                        let days = this.state.today.clone().startOf('year').week(week).startOf('week').add(index, 'day');
                        if (Moment().format('YYYYMMDD') === days.format('YYYYMMDD') && days.format('MM') === this.state.today.format('MM')) {        //today
                            let filterArr = this.state.sameExNo.length == 0 ? this.state.exScheduleList.filter(el => el.date == days.format('YYYYMMDD')) : this.state.exScheduleList.filter(el => el.date == days.format('YYYYMMDD') && this.state.sameExNo.includes(el.exNo));
                            return (
                                <TouchableWithoutFeedback onPress={() => this._MakeListItem(days.format('YYYYMMDD'))}>
                                    <View key={index} style={{ flex: 1, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                        <View style={{ width: '100%', }}>
                                            <View style={{ justifyContent: 'center', }}>
                                                <Text style={{ color: Colors.color4D4A4A, fontSize: 14, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{days.format('D')}</Text>
                                                <View style={{}}>
                                                    {filterArr.map((item, index) => (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: index == 0 ? 4 : 0 }}>
                                                            {index < 3 && (
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: index == 0 ? 0 : 0 }}>
                                                                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: item.colors }}></View>
                                                                    <Text style={{ marginLeft: 2, color: Colors.color000000, fontSize: 6, fontFamily: 'Raleway-Medium', includeFontPadding: false }} numberOfLines={1} ellipsizeMode="tail">{`${item.time} (${item.min}/${item.max})`}</Text>
                                                                </View>)}
                                                        </View>
                                                    ))}
                                                    {filterArr.length >= 4 && (
                                                        <View style={{ marginTop: 2 }}>
                                                            <Text style={{ color: Colors.color5B5B5B, fontSize: 7, fontFamily: 'Raleway-Bold', includeFontPadding: false, textDecorationLine: 'underline' }} numberOfLines={1} ellipsizeMode="tail">{this.state.lang == 'ko' ? (filterArr.length - 3 + I18n.t('reserveMore')) : this.state.lang == 'ja' ? I18n.t('reserveMore') : `View ${filterArr.length - 3} More`}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>)
                        } else if (days.format('MM') !== this.state.today.format('MM')) {      //disable
                            return (
                                <View key={index} style={{ flex: 1, alignItems: 'center', }}>
                                    <Text style={{ color: '#000', fontSize: 12, }}></Text>
                                </View>
                            )
                        } else {                                                              //month
                            let filterArr = this.state.sameExNo.length == 0 ? this.state.exScheduleList.filter(el => el.date == days.format('YYYYMMDD')) : this.state.exScheduleList.filter(el => el.date == days.format('YYYYMMDD') && this.state.sameExNo.includes(el.exNo));
                            return (
                                <TouchableWithoutFeedback onPress={() => this._MakeListItem(days.format('YYYYMMDD'))}>
                                    <View key={index} style={{ flex: 1, alignItems: 'center', }}>
                                        <View style={{ width: '100%', }}>
                                            <View style={{ justifyContent: 'center', }}>
                                                <Text style={{ color: Colors.color4D4A4A, fontSize: 14, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{days.format('D')}</Text>
                                                <View style={{}}>
                                                    {filterArr.map((item, index) => (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: index == 0 ? 4 : 0 }}>
                                                            {index < 3 && (
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: index == 0 ? 0 : 0 }}>
                                                                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: item.colors }}></View>
                                                                    <Text style={{ marginLeft: 2, color: Colors.color000000, fontSize: 6, fontFamily: 'Raleway-Medium', includeFontPadding: false }} numberOfLines={1} ellipsizeMode="tail">{`${item.time} (${item.min}/${item.max})`}</Text>
                                                                </View>)}
                                                        </View>
                                                    ))}
                                                    {filterArr.length >= 4 && (
                                                        <View style={{ marginTop: 2 }}>
                                                            <Text style={{ color: Colors.color5B5B5B, fontSize: 7, fontFamily: 'Raleway-Bold', includeFontPadding: false, textDecorationLine: 'underline' }} numberOfLines={1} ellipsizeMode="tail">{this.state.lang == 'ko' ? (filterArr.length - 3 + I18n.t('reserveMore')) : this.state.lang == 'ja' ? I18n.t('reserveMore') : `View ${filterArr.length - 3} More`}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>

                                    </View>
                                </TouchableWithoutFeedback>)
                        }
                    })
                    }
                </View >);
        }
        return result;
    }

    _CalendarMove(value) {
        if (value != undefined) {
            if (value == "1") {//저번달
                this.state.today = this.state.today.clone().subtract(1, 'month');
                this.state.requestType = 1;
                this.setState({
                    isLoading: true,
                })
            } else {//다음달
                this.state.today = this.state.today.clone().add(1, 'month');
                this.state.requestType = 1;
                this.setState({
                    isLoading: true,
                })
            }
        }
    }

    _AcceptNetwork() {
        console.log('accept ' + this.state.acceptPosition)
        this.setState({ acceptPosition: -1, declinePosition: -1 })
    }

    _DeclineNetwork() {

        console.log('decline ' + this.state.declinePosition)
        this.setState({ acceptPosition: -1, declinePosition: -1 })
    }

    _render() {
        return (
            <Image></Image>
        )
    }

    async _MyExperiences() {
        const url = ServerUrl.callExAndSchedules
        this.state.listItem = [];
        this.state.exScheduleList = [];
        let formBody = {};
        const condition = [
            {
                "q": "=",
                "f": "user_no",
                "v": User.userNo
            },
            {
                "op": "AND",
                "q": "order",
                "f": "e_dt",
                "o": "DESC"
            },
            // {
            //     "op": "AND",
            //     "q": "like",
            //     "f": "datetime",
            //     "str": '2022-10'
            // },
            {
                "op": "AND",
                "q": "=",
                "f": "status",
                "v": 1
            }
        ]

        formBody = JSON.stringify({
            "conditions": condition
        })

        const json = await NetworkCall.Select(url, formBody)
        console.log('Ex', json)
        if (json[0].length > 0) {
            for (let i = 0; i < json[0].length; i++) {
                const obj = {
                    exNo: json[0][i].ex_no,
                    title: json[0][i].title,
                    repImage: JSON.parse(json[0][i].representative_file_url),
                    colors: colorDatas[i]
                }
                this._ExperienceOrder(json[0][i].ex_no)
                this.state.listItem.push(obj)
            }

            for (let i = 0; i < json[1].length; i++) {
                if (json[1][i].status == 1) {
                    if (this.state.allSlotFlag == true) {
                        const obj = {
                            exNo: json[1][i].ex_no,
                            exSchedulesNo: json[1][i].ex_schedules_no,
                            min: json[1][i].people_current,
                            max: json[1][i].people_capacity,
                            date: Moment(json[1][i].datetime).format('YYYYMMDD'),
                            time: Moment(json[1][i].datetime).format('HH:mm'),
                            sort: Moment(json[1][i].datetime).format('HHmm'),
                            dateTime: json[1][i].datetime,
                            colors: this.state.listItem.filter((el) => el.exNo == json[1][i].ex_no)[0].colors
                        }
                        this.state.exScheduleList.push(obj)
                    } else {
                        if (json[1][i].people_current > 0) {
                            const obj = {
                                exNo: json[1][i].ex_no,
                                exSchedulesNo: json[1][i].ex_schedules_no,
                                min: json[1][i].people_current,
                                max: json[1][i].people_capacity,
                                date: Moment(json[1][i].datetime).format('YYYYMMDD'),
                                time: Moment(json[1][i].datetime).format('HH:mm'),
                                sort: Moment(json[1][i].datetime).format('HHmm'),
                                dateTime: json[1][i].datetime,
                                colors: this.state.listItem.filter((el) => el.exNo == json[1][i].ex_no)[0].colors
                            }
                            this.state.exScheduleList.push(obj)
                        }
                    }

                }
            }
            this.state.exScheduleList.sort((a, b) => a.sort - b.sort)

            this.setState({
                isFetching: false,
                isRefreshing: false,
                repeat: -1,
                period: '',
                amount: '',
                reserveSuccess: false,
                acceptPosition: -1,
                declinePosition: -1,
            })
        } else {
            this.setState({
                isFetching: false,
                isRefreshing: false,
                repeat: -1,
                period: '',
                amount: '',
                reserveSuccess: false,
                acceptPosition: -1,
                declinePosition: -1,
            })
        }
    }

    async _AddSchedule() {
        if (this.state.repeat == -1) {
            let dateTime = `${Moment(this.state.selectedDay).format('YYYY-MM-DD')} ${this.state.selecthour}:${this.state.selectminutes}:00`
            let filterArr = this.state.exScheduleList.filter((el) => Moment(el.dateTime).format('YYYY-MM-DD HH') == Moment(dateTime).format('YYYY-MM-DD HH'))
            if (filterArr.length > 0) {
                return console.log('filter!!!!!');
            } else {
                const obj = {
                    "ex_no": this.state.selectedExperienceNo,
                    "datetime": dateTime,
                    "people_capacity": this.state.amount,
                }
                this.state.addExSchedulesList.push(obj)
            }

        } else if (this.state.repeat == 1) {
            for (let i = 0; i < parseInt(this.state.period); i++) {
                let dateTime = `${Moment(this.state.selectedDay).add(i, 'days').format('YYYY-MM-DD')} ${this.state.selecthour}:${this.state.selectminutes}:00`
                let filterArr = this.state.exScheduleList.filter((el) => Moment(el.dateTime).format('YYYY-MM-DD HH') == Moment(dateTime).format('YYYY-MM-DD HH'))
                if (filterArr.length > 0) {
                    return console.log('filter!!!!!');
                } else {
                    const obj = {
                        "ex_no": this.state.selectedExperienceNo,
                        "datetime": dateTime,
                        "people_capacity": this.state.amount,
                    }
                    this.state.addExSchedulesList.push(obj)
                }
            }

        } else if (this.state.repeat == 2) {
            for (let i = 0; i < parseInt(this.state.period) * 7; i++) {
                let dateTime = `${Moment(this.state.selectedDay).add(i, 'days').format('YYYY-MM-DD')} ${this.state.selecthour}:${this.state.selectminutes}:00`
                let filterArr = this.state.exScheduleList.filter((el) => Moment(el.dateTime).format('YYYY-MM-DD HH') == Moment(dateTime).format('YYYY-MM-DD HH'))
                if (filterArr.length > 0) {
                    return console.log('filter!!!!!');
                } else {
                    const obj = {
                        "ex_no": this.state.selectedExperienceNo,
                        "datetime": dateTime,
                        "people_capacity": this.state.amount,
                    }
                    this.state.addExSchedulesList.push(obj)
                }
            }
        } else if (this.state.repeat == 3) {
            for (let i = 0; i < parseInt(this.state.period) * 31; i++) {
                let dateTime = `${Moment(this.state.selectedDay).add(i, 'days').format('YYYY-MM-DD')} ${this.state.selecthour}:${this.state.selectminutes}:00`
                let filterArr = this.state.exScheduleList.filter((el) => Moment(el.dateTime).format('YYYY-MM-DD HH') == Moment(dateTime).format('YYYY-MM-DD HH'))
                if (filterArr.length > 0) {
                    return console.log('filter!!!!!');
                } else {
                    const obj = {
                        "ex_no": this.state.selectedExperienceNo,
                        "datetime": dateTime,
                        "people_capacity": this.state.amount,
                    }
                    this.state.addExSchedulesList.push(obj)
                }
            }
        }
        const url = ServerUrl.AddScheduleEx
        let formBody = {};

        formBody = JSON.stringify({
            exSchedules: this.state.addExSchedulesList
        })

        const json = await NetworkCall.Select(url, formBody)
        console.log(TAG, json);

        if (json.length > 0) {
            this._MyExperiences()
        } else {
            this.setState({
                isFetching: false,
                repeat: -1,
                period: '',
                amount: ''
            })
        }
    }

    async _ScheduleByGuest() {
        const url = ServerUrl.SelectScheduleByGuest
        this.state.guestListData = [];
        let formBody = {};
        const condition = [
            {
                q: "=",
                f: "ex_schedules_no",
                v: this.state.manageScheduleData.exSchedulesNo
            }
        ]

        formBody = JSON.stringify({
            "conditions": condition
        })

        const json = await NetworkCall.Select(url, formBody)
        // console.log('Guest', json)
        if (json.length > 0) {
            for (let i = 0; i < json.length; i++) {
                if (json[i].payInfo != null) {
                    const obj = {
                        amount: json[i].amount,
                        avatar_url: json[i].avatar_url,
                        currency: json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency,
                        message: json[i].message,
                        nickname: json[i].nickname,
                        price: json[i].price,
                        phone: json[i].phone,
                    }
                    this.state.guestListData.push(obj)
                }
            }
            this.setState({
                isFetching: false,
            })
        } else {
            this.setState({
                isFetching: false,
            })
        }
    }

    async _ScheduleDelete() {
        const url = ServerUrl.ScheduleDelete
        let formBody = {};

        formBody = JSON.stringify({
            "ex_schedules_no": this.state.manageScheduleData.exSchedulesNo
        })

        const json = await NetworkCall.Select(url, formBody)

        if (json.length > 0) {
            this._MyExperiences()
        } else {
            this.setState({
                isFetching: false,
            })
        }
    }

    async _ScheduleUpdate() {
        const url = ServerUrl.ScheduleUpdate
        let formBody = {};

        formBody = JSON.stringify({
            "ex_schedules_no": this.state.manageScheduleData.exSchedulesNo,
            "people_capacity": this.state.updateAmount
        })

        const json = await NetworkCall.Select(url, formBody)

        if (json.length > 0) {
            this._MyExperiences()
        } else {
            this.setState({
                isFetching: false,
            })
        }
    }

    async _ExperienceOrder(value) {
        const url = ServerUrl.SelectMyExperienceOrder
        this.state.upcomingDatas = [];
        let formBody = JSON.stringify({
            "conditions": [
                {
                    "q": "=",
                    "f": "ex_no",
                    "v": value,
                },
            ]
        })
        const json = await NetworkCall.Select(url, formBody)
        let upComingList = [];
        console.log('Waiting', json)
        if (json.length > 0) {
            for (let i = 0; i < json.length; i++) {
                if (json[i].status == 2 && (json[i].approval == null || json[i].approval == 1)) {
                    const upComingObj = {
                        title: json[i].exScheduleInfo.datetime.substring(0, 4),
                        exNo: json[i].ex_no,
                        date: json[i].exScheduleInfo.datetime,
                        data: {
                            date: json[i].exScheduleInfo.datetime,
                            pictureUrl: JSON.parse(json[i].exInfo.representative_file_url)[0],
                            title: json[i].title,
                            numberParticipants: json[i].amount,
                            payment: (json[0].currency == "USD" ? "$" : json[0].currency == "KRW" ? "₩" : json[0].currency == "EUR" ? "€" : json[0].currency == "JPY" ? "¥" : json[0].currency) + JSON.parse(json[i].payInfo).amount,
                            status: 1,
                            orderNo: json[i].order_no,
                            exNo: json[i].ex_no,
                            guestInfo: json[i].user_info,
                            phone: json[i].phone,
                            message: json[i].message,
                            amount: json[i].amount,
                            price: JSON.parse(json[i].payInfo).amount,
                            currency: json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency,
                        }
                    }
                    upComingList.push(upComingObj)
                }
            }
            this.state.approvalGeustList = upComingList.length
            let upcomingTitle = '';
            let upcomingDataList = [];
            for (let i = 0; i < upComingList.length; i++) {
                if (upcomingTitle.length == 0) {
                    upcomingTitle = upComingList[i].title;
                    upcomingDataList.push(upComingList[i].data)
                    if (upComingList.length == 1) {
                        const obj = {
                            title: upcomingTitle,
                            data: upcomingDataList,
                            exNo: upComingList[i].exNo,
                            date: upComingList[i].date
                        }
                        this.state.upcomingDatas.push(obj)
                        // this.state.upcomingDatas.sort((a, b) => new Date(b.date.replace(' ', 'T')).getTime() - new Date(a.date.replace(' ', 'T')).getTime())
                    }
                } else if (upcomingTitle != upComingList[i].title) {
                    const obj = {
                        title: upcomingTitle,
                        data: upcomingDataList,
                        exNo: upComingList[i].exNo,
                        date: upComingList[i].date
                    }
                    this.state.upcomingDatas.push(obj)
                    // this.state.upcomingDatas.sort((a, b) => new Date(b.date.replace(' ', 'T')).getTime() - new Date(a.date.replace(' ', 'T')).getTime())
                    upcomingTitle = upComingList[i].title;
                    upcomingDataList = [];
                    upcomingDataList.push(upComingList[i].data)
                } else {
                    upcomingDataList.push(upComingList[i].data)
                    if (i == upComingList.length - 1) {
                        const obj = {
                            title: upcomingTitle,
                            data: upcomingDataList,
                            exNo: upComingList[i].exNo,
                            date: upComingList[i].date,
                        }
                        this.state.upcomingDatas.push(obj)
                        // this.state.upcomingDatas.sort((a, b) => new Date(b.date.replace(' ', 'T')).getTime() - new Date(a.date.replace(' ', 'T')).getTime())
                    }
                }
            }
            this.setState({ isRefreshing: false, })
        } else {
            this.setState({
                isFetching: false,
                isRefreshing: false,
                repeat: -1,
                period: '',
                amount: ''
            })
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
            Animated.timing(
                this.state.animation,
                {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }
            ).start((o) => {
                if (o.finished) {
                    this._MyExperiences()
                }
            });
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
        this._MyExperiences()
    }

    render() {
        this.state.firstWeek = this.state.today.clone().startOf('month').week();
        this.state.lastWeek = this.state.today.clone().endOf('month').week() === 1 ? 53 : this.state.today.clone().endOf('month').week();
        this.state.dayTitleText = this.state.lang == 'ko' ? this.state.dayTitleTextKo : this.state.lang == 'ja' ? this.state.dayTitleTextJa : this.state.dayTitleTextEn
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, }}>
                    {this._ScheduleDialog()}
                    {this._WaitingDialog()}
                    {this._AddDialog()}
                    {this._ManagementDialog()}
                    {this._Dialog()}
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('reserveTitle')}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ marginLeft: 16, marginRight: 16, height: 1, backgroundColor: 'rgba(156, 159, 161, 0.5)', marginTop: 20 }}></View>

                    <ScrollView>
                        <View style={{
                            paddingLeft: 16, paddingRight: 16, width: '100%',
                            backgroundColor: Colors.colorFFFFFF,
                            ...Platform.select({
                                ios: {
                                    shadowColor: 'black',
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3,
                                },
                                android: {
                                    elevation: 5,
                                },
                            }),
                        }}>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 12 }}>{I18n.t('reserveAdd')}</Text>

                            <FlatList style={{ marginTop: 12 }} keyExtractor={(item, index) => index.toString()} horizontal data={this.state.listItem} renderItem={(obj) => {
                                return (
                                    <TouchableOpacity onPress={() => this.setState({ selectedExperienceNo: this.state.selectedExperienceNo == obj.item.exNo ? -1 : obj.item.exNo })}>
                                        <View style={{ width: 64, marginLeft: obj.index == 0 ? 0 : 20, alignItems: 'center', justifyContent: 'center' }}>
                                            <View style={{ position: 'absolute', backgroundColor: this.state.selectedExperienceNo == obj.item.exNo ? Colors.color2D7DC8 : Colors.colorFFFFFF, width: 64, height: 64, top: 0, borderRadius: 32 }}></View>
                                            <Image source={{ uri: ServerUrl.Server + obj.item.repImage }} style={{ width: 60, height: 60, resizeMode: 'cover', borderRadius: 30, marginTop: 2 }}></Image>
                                            <Text style={{ fontSize: 8, color: this.state.selectedExperienceNo == obj.item.exNo ? Colors.color2D7DC8 : Colors.color5B5B5B, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginTop: 5, textAlign: 'center' }} numberOfLines={2} ellipsizeMode="tail">{obj.item.title}</Text>
                                            <View style={{ marginTop: 4, width: 6, height: 6, backgroundColor: obj.item.colors, borderRadius: 3 }}></View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}></FlatList>

                            <View style={{ height: 16 }}></View>
                        </View>

                        <View style={{ width: '100%', backgroundColor: Colors.colorFFFFFF, marginTop: 24 }}>
                            <View style={{ flexDirection: 'row', paddingLeft: 16 }}>
                                <TouchableOpacity style={{}} onPress={() => this.setState({ allSlotFlag: true, }, () => this._MyExperiences())}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image source={(this.state.allSlotFlag == false ? imgCheckOff : imgCheckOn)} style={{ width: 17, height: 17, resizeMode: 'contain' }}></Image>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{I18n.t('reserveAll')}</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => this.setState({ allSlotFlag: false, }, () => this._MyExperiences())}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image source={(this.state.allSlotFlag == true ? imgCheckOff : imgCheckOn)} style={{ width: 17, height: 17, resizeMode: 'contain' }}></Image>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{I18n.t('reserveSlots')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: 'row', marginTop: 16, paddingRight: 16 }}>
                                <View style={{ flex: 1 }}></View>
                                <TouchableOpacity onPress={() => this.setState({ waitingDialogVisible: true })}>
                                    <View style={{ backgroundColor: Colors.color2D7DC8, borderRadius: 50, paddingLeft: 15, paddingRight: 14, paddingTop: 5, paddingBottom: 5 }}>
                                        {console.log(this.state.upcomingDatas)}
                                        <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 10 }}>{`${I18n.t('reservePending')}${this.state.approvalGeustList}${I18n.t('reservePendingText')}`}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={{ marginTop: 12, paddingLeft: 16, paddingRight: 16 }}>
                                <View style={{ borderWidth: 1, borderRadius: 8, borderColor: Colors.colorCFCFCF }}>

                                    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 12, alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => this._CalendarMove("1")} style={{ width: 60, height: 30, alignItems: 'flex-end', justifyContent: 'center' }}>
                                            <Image source={imgLeftArrow} style={{ width: 13, height: 13, resizeMode: 'contain', }}></Image>
                                        </TouchableOpacity>

                                        <View style={{ alignItems: 'center', justifyContent: 'center', marginLeft: 20, marginRight: 20 }}>
                                            <Text style={{ color: Colors.color000000, fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{this.state.today.format('MMMM YYYY')}</Text>
                                        </View>

                                        <TouchableOpacity onPress={() => this._CalendarMove("2")} style={{ width: 60, height: 30, justifyContent: 'center' }}>
                                            <Image source={imgRightArrow} style={{ width: 13, height: 13, resizeMode: 'contain', }}></Image>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'nowrap', paddingLeft: 16, marginTop: 15 }}>
                                        {this.state.dayTitleText.map((item, index) =>
                                            <View key={index} style={{ flex: 1, }}>
                                                <Text style={{ color: Colors.color4D4A4A, fontSize: 14, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{this.state.dayTitleText[index]}</Text>
                                            </View>)}
                                    </View>
                                    <View style={{ paddingLeft: 16, marginTop: 16 }}>
                                        {this._CalendarArr()}
                                    </View>
                                </View>

                                <View style={{ height: 1, backgroundColor: 'rgba(156, 159, 161, 0.5)', marginTop: 24 }}></View>

                                {this.state.selectedExperienceNo == -1 ? (
                                    <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
                                        <Text style={{ color: Colors.color000000, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('reserveExperience')}</Text>
                                        {this.state.listItem.map((item, index) => (
                                            <TouchableOpacity onPress={() => this._SameExInsertRemove(item.exNo)}>
                                                <View style={{ marginLeft: 20, width: 16, height: 16, borderRadius: 8, backgroundColor: this.state.sameExNo.includes(item.exNo) == true ? Colors.color2D7DC8 : Colors.colorFFFFFF, alignItems: 'center', justifyContent: 'center' }}>
                                                    <View style={{ width: 12, height: 12, backgroundColor: colorDatas[index], borderRadius: 6, }}></View>
                                                </View>

                                            </TouchableOpacity>

                                        ))}
                                    </View>
                                ) : (
                                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 12, }}>
                                        <Text style={{ color: Colors.color000000, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('reserveAddSlotInfo1')}</Text>
                                        <Text style={{ color: Colors.color000000, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('reserveAddSlotInfo2')}</Text>
                                    </View>
                                )}

                                <View style={{ height: 1, backgroundColor: 'rgba(156, 159, 161, 0.5)', marginTop: 12 }}></View>
                            </View>
                        </View>
                    </ScrollView>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }

    _ScheduleDialog() {
        let filterArr = this.state.sameExNo.length == 0 ? this.state.exScheduleList.filter(el => el.date == Moment(this.state.selectedDay).format('YYYYMMDD')) : this.state.exScheduleList.filter(el => el.date == Moment(this.state.selectedDay).format('YYYYMMDD') && this.state.sameExNo.includes(el.exNo));
        return (
            <Modal visible={this.state.scheduleDialogVisivle} transparent={true}>
                <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: '90%', maxHeight: 500, backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: 40, marginTop: 12, paddingLeft: 16 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, }}>{(this.state.lang == 'ko' || this.state.lang == 'ja') ? Moment(this.state.selectedDay).format(this.state.lang == 'ko' ? 'M월 D일' : 'M月D日') + I18n.t('reserveReservations') : I18n.t('reserveReservations') + Moment(this.state.selectedDay).format('MMM Do')}</Text>
                            <TouchableOpacity style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 14, marginRight: 16, position: 'absolute', right: 8 }} onPress={() => this.setState({ scheduleDialogVisivle: false })}>
                                <Image source={imgClose} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 16 }}></View>

                        <FlatList style={{ marginLeft: 16, marginRight: 16 }} numColumns={2} keyExtractor={(item, index) => index.toString()} data={filterArr} renderItem={(obj) => {
                            return (
                                <TouchableOpacity style={{ flex: 1, }} onPress={() => this.setState({ scheduleDialogVisivle: false, managementDialogVisible: true, manageScheduleData: obj.item, isFetching: true, updateAmount: obj.item.max }, () => this._ScheduleByGuest())}>
                                    <View style={{ flex: 1, borderWidth: 1, borderRadius: 4, borderColor: Colors.colorB7B7B7, marginLeft: obj.index % 2 == 0 ? 0 : 8, height: 32, marginTop: obj.index < 2 ? 0 : 8, alignItems: 'center', paddingLeft: 13, flexDirection: 'row' }}>
                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: obj.item.colors }}></View>
                                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }}>{`${obj.item.time} (${obj.item.min}/${obj.item.max})`}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                            )
                        }}></FlatList>

                        <TouchableOpacity style={{ marginTop: 16, marginBottom: 16, paddingRight: 16, paddingLeft: 16 }} onPress={() => this.setState({ scheduleDialogVisivle: false, })}>
                            <View style={{ borderRadius: 4, backgroundColor: Colors.color2D7DC8, alignItems: 'center', justifyContent: 'center', height: 48 }}>
                                <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{I18n.t('reserveDone')}</Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal >
        )
    }

    _WaitingDialog() {
        for (let i = 0; i < this.state.upcomingDatas.length; i++) {
            this.state.upcomingDatas[i].data.sort((a, b) => new Date(a.date.replace(' ', 'T')).getTime() - new Date(b.date.replace(' ', 'T')).getTime())
        }
        return (
            <Modal visible={this.state.waitingDialogVisible} transparent={true}>
                {/* <TouchableWithoutFeedback onPress={() => this.setState({ waitingDialogVisible: false })}> */}
                <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    {/* <TouchableWithoutFeedback onPress={() => console.log('')} disabled={true}> */}
                    <View style={{ width: '90%', maxHeight: 500, backgroundColor: Colors.colorFFFFFF, borderRadius: 8, minHeight: 250 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t('reservePendingApproval')}</Text>
                            <TouchableOpacity style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 14, marginRight: 16, position: 'absolute', right: 8 }} onPress={() => this.setState({ waitingDialogVisible: false })}>
                                <Image source={imgClose} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                            </TouchableOpacity>
                        </View>

                        {this.state.upcomingDatas.length > 0 ? <SectionList sections={this.state.upcomingDatas}
                            style={{ maxHeight: 450, minHeight: 200, marginLeft: 20, marginRight: 24, marginBottom: 24 }}
                            renderSectionHeader={({ section }) => {
                                return (
                                    <View style={{ backgroundColor: Colors.colorFFFFFF, height: 50, paddingTop: 16 }}>
                                        <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{section.title}</Text>
                                    </View>
                                )
                            }}
                            renderItem={({ item, index, section }) => {
                                return (
                                    <View style={{ flexDirection: 'row', flex: 1, }}>
                                        <View style={{ width: 12, alignItems: 'center' }}>
                                            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.color2D7DC8, marginTop: 2 }}></View>
                                            <View style={{ flex: 1, backgroundColor: Colors.colorD9D9D9, width: 1 }}></View>
                                        </View>
                                        <View style={{ marginLeft: 4, flex: 1, }}>
                                            <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{item.date.substring(5, 10)}</Text>
                                            <View style={{ marginTop: 8, flexDirection: 'row', flex: 1, }}>
                                                <Image style={{ width: 60, height: 60, resizeMode: 'stretch', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl }} resizeMethod={"resize"}></Image>
                                                <View style={{ marginLeft: 4, flex: 1, padding: 8 }}>
                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{item.title}</Text>
                                                    <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.2)', fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.date.substring(0, 10) + ' (' + item.date.substring(11, 16) + ')' + '・' + item.amount + I18n.t('reserveAddDialogNum')}</Text>
                                                    </View>
                                                    <TouchableOpacity onPress={() => this.setState({ collapsPosition: this.state.collapsPosition == index ? -1 : index })}>
                                                        <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                                            <Text style={{ fontSize: 12, color: Colors.color289FAF, fontFamily: 'Raleway-Medium', includeFontPadding: false, textDecorationLine: 'underline' }}>{I18n.t(this.state.collapsPosition == index ? 'reserveCloseGuest' : 'reserveGuestDetail')}</Text>
                                                        </View>
                                                    </TouchableOpacity>

                                                    <Collapsible collapsed={this.state.collapsPosition == index ? false : true} >
                                                        <View style={{ borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD9D9D9, paddingTop: 8, paddingLeft: 8, flexDirection: 'row', paddingBottom: 9, marginTop: 8 }}>
                                                            <Image source={item.guestInfo.avatar_url == null || item.guestInfo.avatar_url.length == 0 ? imgAccount : { uri: item.guestInfo.avatar_url }} style={{ width: 32, height: 32, resizeMode: 'cover', borderRadius: 16 }}></Image>
                                                            <View style={{ marginLeft: 12 }}>
                                                                <Text style={{ fontSize: 12, color: Colors.color046BCC, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{item.guestInfo.nickname}</Text>
                                                                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{`${I18n.t('reserveManagementPhone')}: `}</Text>
                                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{item.phone}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: 'row', marginTop: 0 }}>
                                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{`${I18n.t('reserveManagementAmount')}: `}</Text>
                                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{item.amount + I18n.t('reserveAddDialogNum')}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: 'row', marginTop: 0 }}>
                                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{`${I18n.t('reserveManagementMessage')}: `}</Text>
                                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{item.message}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: 'row', marginTop: 0 }}>
                                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{`${I18n.t('reserveManagementPrice')}: `}</Text>
                                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{item.currency + item.price}</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </Collapsible>

                                                    {this.state.acceptPosition != -1 && this.state.acceptPosition == index && (
                                                        <View style={{ marginTop: 12 }}>
                                                            <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('reserveAcceptWant')}</Text>
                                                        </View>
                                                    )}

                                                    {this.state.declinePosition != -1 && this.state.declinePosition == index && (
                                                        <View style={{ marginTop: 12 }}>
                                                            <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('reserveDeclineWant')}</Text>
                                                        </View>
                                                    )}

                                                    <View style={{ marginTop: 12, flexDirection: 'row' }}>
                                                        <TouchableOpacity onPress={() => this.state.acceptPosition == -1 && this.state.declinePosition == -1 ? this.setState({ acceptPosition: index }) : (this.state.acceptPosition != -1 && this.state.acceptPosition == index) ? this.setState({ isFetching: true, reserveSuccess: true, }, () => this._UpdateOrder(item.orderNo, 2)) : (this.state.acceptPosition != -1 && this.state.acceptPosition != index) ? this.setState({ acceptPosition: index }) : (this.state.declinePosition != -1 && this.state.declinePosition == index) ? this.setState({ isFetching: true, }, () => this._UpdateOrder(item.orderNo, 3)) : this.setState({ acceptPosition: index, declinePosition: -1 })}>
                                                            <View style={{ backgroundColor: Colors.color2D7DC8, paddingLeft: 22, paddingRight: 22, paddingTop: 5, paddingBottom: 5, borderRadius: 20 }}>
                                                                <Text style={{ fontSize: 10, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t((this.state.acceptPosition == -1 && this.state.declinePosition == -1) ? 'reserveAccept' : (this.state.acceptPosition == index || this.state.declinePosition == index) ? 'reserveYes' : 'reserveAccept')}</Text>
                                                            </View>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity onPress={() => (this.state.acceptPosition == -1 && this.state.declinePosition == -1) ? this.setState({ declinePosition: index }) : (this.state.acceptPosition != -1 && this.state.acceptPosition == index) ? this.setState({ acceptPosition: -1 }) : (this.state.acceptPosition != -1 && this.state.acceptPosition != index) ? this.setState({ declinePosition: index, acceptPosition: -1 }) : this.state.declinePosition != index ? this.setState({ declinePosition: index, acceptPosition: -1 }) : this.setState({ declinePosition: -1 })}>
                                                            <View style={{ borderWidth: 1, borderColor: Colors.color2D7DC8, paddingLeft: 22, paddingRight: 22, paddingTop: 5, paddingBottom: 5, borderRadius: 20, marginLeft: 4 }}>
                                                                <Text style={{ fontSize: 10, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t((this.state.acceptPosition == -1 && this.state.declinePosition == -1) ? 'reserveDecline' : (this.state.acceptPosition == index || this.state.declinePosition == index) ? 'reserveNo' : 'reserveDecline')}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                        <View style={{ flex: 1 }}></View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                )
                            }}
                            keyExtractor={(item, index) => index}
                            stickySectionHeadersEnabled
                        >

                        </SectionList> : <TouchableOpacity style={{ flex: 1 }} onPress={() => this.dropDown.openDropdown()}><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                            <Text style={{ marginBottom: 40, fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('reserveNoPending')}</Text>
                        </View></TouchableOpacity>}

                        {this.state.reserveSuccess == true && <Animated.View style={{ height: 50, alignItems: 'center', }}>
                            <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('reserveConfirmed')}</Text>
                        </Animated.View>}
                    </View>
                    {/* </TouchableWithoutFeedback> */}

                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>
        )
    }

    _AddDialog() {
        return (
            <Modal visible={this.state.addDialogVisible} transparent={true}>
                <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: '90%', backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: 40, marginTop: 12, paddingLeft: 16 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, }}>{(this.state.lang == 'ko' || this.state.lang == 'ja') ? Moment(this.state.selectedDay).format(this.state.lang == 'ko' ? 'M월 D일' : 'M月D日') + I18n.t('reserveAddDialogTitle') : I18n.t('reserveAddDialogTitle') + Moment(this.state.selectedDay).format('MMM Do')}</Text>
                            <TouchableOpacity style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 14, marginRight: 16, position: 'absolute', right: 8 }} onPress={() => this.setState({ addDialogVisible: false, amount: '', period: '', repeat: -1 })}>
                                <Image source={imgClose} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                            </TouchableOpacity>
                        </View>

                        <Text style={{ marginTop: 17, marginLeft: 16, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, }}>{I18n.t('reserveAddDialogTime')}</Text>
                        <View style={{ marginTop: 4, marginLeft: 16, marginRight: 16, flexDirection: 'row', borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, paddingTop: 6, paddingBottom: 7, paddingLeft: 16, alignItems: 'center' }}>
                            <Image source={imgSchedule} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            <View style={{ marginLeft: 10 }}></View>
                            <View style={{ width: 114, height: 35, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                <SelectDropdown
                                    style={{ marginLeft: 10 }}
                                    data={hours}
                                    dropdownIconPosition='right'
                                    buttonStyle={{ width: '100%', height: '100%', alignItems: 'center', backgroundColor: Colors.colorFFFFFF, padding: 0, margin: 0, borderRadius: 4, justifyContent: 'center' }}
                                    buttonTextStyle={{ alignItems: 'center', justifyContent: 'center', margin: 0, marginHorizontal: 0, textAlign: 'left', fontSize: 14, textAlignVertical: 'center', fontFamily: 'Raleway-Medium', includeFontPadding: false }}
                                    renderDropdownIcon={isOpened => {
                                        return <Image source={imgDownArrow} style={{ width: 13, height: 7, resizeMode: 'contain' }} />;
                                    }}
                                    defaultButtonText={I18n.t('reserveAddDialogTime')}
                                    onSelect={(selectedItem, index) => {
                                        this.setState({
                                            selecthour: selectedItem
                                        })
                                    }}
                                />
                            </View>
                            <View style={{ marginLeft: 6 }}></View>
                            <View style={{ width: 114, height: 35, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                <SelectDropdown
                                    data={minutes}
                                    dropdownIconPosition='right'
                                    buttonStyle={{ width: '100%', height: '100%', alignItems: 'center', backgroundColor: Colors.colorFFFFFF, padding: 0, margin: 0, borderRadius: 4, justifyContent: 'center' }}
                                    buttonTextStyle={{ alignItems: 'center', justifyContent: 'center', margin: 0, marginHorizontal: 0, textAlign: 'left', fontSize: 14, textAlignVertical: 'center', fontFamily: 'Raleway-Medium', includeFontPadding: false }}
                                    renderDropdownIcon={isOpened => {
                                        return <Image source={imgDownArrow} style={{ width: 13, height: 7, resizeMode: 'contain' }} />;
                                    }}
                                    defaultButtonText={I18n.t('reserveAddDialogMinute')}
                                    onSelect={(selectedItem, index) => {
                                        this.setState({
                                            selectminutes: selectedItem
                                        })
                                    }}
                                />
                            </View>
                        </View>
                        <Text style={{ marginTop: 16, marginLeft: 16, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, }}>{I18n.t('reserveAddDialogRepeat')}</Text>
                        <View style={{ marginTop: 4, marginLeft: 16, marginRight: 16, borderWidth: 1, borderRadius: 4, borderColor: Colors.colorD0D0D0, }}>
                            <View style={{ paddingTop: 12, paddingLeft: 12, paddingBottom: 13, paddingRight: 16 }}>
                                <View style={{ flexDirection: 'row', }}>
                                    <TouchableOpacity onPress={() => this.setState({ repeat: 1 })}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={(this.state.repeat != 1 ? imgCheckOff : imgCheckOn)} style={{ width: 17, height: 17, resizeMode: 'contain' }}></Image>
                                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 5 }}>{I18n.t('reserveAddDialogRepeatDay')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => this.setState({ repeat: 2 })}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={(this.state.repeat != 2 ? imgCheckOff : imgCheckOn)} style={{ width: 17, height: 17, resizeMode: 'contain' }}></Image>
                                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 5 }}>{I18n.t('reserveAddDialogRepeatWeek')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => this.setState({ repeat: 3 })}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={(this.state.repeat != 3 ? imgCheckOff : imgCheckOn)} style={{ width: 17, height: 17, resizeMode: 'contain' }}></Image>
                                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 5 }}>{I18n.t('reserveAddDialogRepeatMonth')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 15, alignItems: 'center' }}>
                                    <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, }}>{I18n.t('reserveAddDialogRepeatPeriod')}</Text>
                                    <View style={{ flex: 1, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderBottomColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: 12, paddingLeft: 4 }}>
                                        <TextInput onChangeText={(text) => this.setState({ period: text.replace(/[^0-9]/g, '') })} value={this.state.period} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 14 }} keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'} placeholder={""} autoCapitalize="none" returnKeyType="next" placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                                    </View>
                                </View>

                                <View style={{ marginTop: 13 }}>
                                    <Text style={{ color: Colors.colorE94D3E, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 10, }}>{I18n.t('reserveAddDialogInfo1')}</Text>
                                    <Text style={{ color: Colors.colorE94D3E, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 10, }}>{I18n.t('reserveAddDialogInfo2')}</Text>
                                    <Text style={{ color: Colors.colorE94D3E, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 10, }}>{I18n.t('reserveAddDialogInfo3')}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={{ marginTop: 16, marginLeft: 16, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, }}>{I18n.t('reserveAddDialogNumTitle')}</Text>
                        <View style={{ marginTop: 4, flexDirection: 'row', height: 48, borderWidth: 1, borderRadius: 4, borderColor: Colors.colorD0D0D0, marginLeft: 16, marginRight: 16, paddingLeft: 16, paddingRight: 16, alignItems: 'center' }}>
                            <TextInput onChangeText={(text) => this.setState({ amount: text.replace(/[^0-9]/g, '') })} value={this.state.amount} style={{ flex: 1, height: 48, padding: 0, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }} keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'} placeholder={""} autoCapitalize="none" returnKeyType="next" placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 16, }}>{I18n.t('reserveAddDialogNum')}</Text>
                        </View>
                        <TouchableOpacity style={{ marginTop: 20, marginBottom: 16, paddingRight: 16, paddingLeft: 16 }} onPress={() => this.setState({ addDialogVisible: false, }, () => this._AddSchedule())} disabled={(this.state.selecthour.length == 0 || this.state.selectminutes.length == 0 || (this.state.period.length > 0 && this.state.repeat == -1) || this.state.amount.length == 0) ? true : false}>
                            <View style={{ borderRadius: 4, backgroundColor: (this.state.selecthour.length == 0 || this.state.selectminutes.length == 0 || (this.state.period.length > 0 && this.state.repeat == -1) || this.state.amount.length == 0) ? Colors.colorB7B7B7 : Colors.color2D7DC8, alignItems: 'center', justifyContent: 'center', height: 48 }}>
                                <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{I18n.t('reserveAddDialogBtnDone')}</Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        )
    }

    _ManagementDialog() {
        return (
            <Modal visible={this.state.managementDialogVisible} transparent={true}>
                <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: '90%', maxHeight: 700, backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: 40, marginTop: 12, paddingLeft: 16 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, }}>{(this.state.lang == 'ko' || this.state.lang == 'ja') ? Moment(this.state.manageScheduleData.dateTime).format(this.state.lang == 'ko' ? 'M월 D일 HH:mm' : 'M月D日 HH:mm') + I18n.t('reserveManagementTitle') : I18n.t('reserveManagementTitle') + Moment(this.state.manageScheduleData.dateTime).format('HH:mm, MMM Do')}</Text>
                            <TouchableOpacity style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 14, marginRight: 16, position: 'absolute', right: 8 }} onPress={() => this.setState({ scheduleDialogVisivle: true, managementDialogVisible: false })}>
                                <Image source={imgClose} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                            </TouchableOpacity>
                        </View>

                        <Text style={{ marginTop: 16, marginLeft: 16, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, }}>{I18n.t('reserveManagementStatus')}</Text>
                        <TouchableOpacity onPress={() => this.setState({ managementCollaps: this.state.managementCollaps == true ? false : true })}>
                            <View style={{ marginTop: 4, flexDirection: 'row', height: 48, borderWidth: 1, borderRadius: 4, borderColor: Colors.colorD0D0D0, marginLeft: 16, marginRight: 16, paddingLeft: 16, paddingRight: 16, alignItems: 'center' }}>
                                <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{this.state.manageScheduleData.min + '/' + this.state.manageScheduleData.max}</Text>
                                <View style={{ flex: 1 }} ></View>
                                <Text style={{ color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, }}>{I18n.t(this.state.managementCollaps == true ? 'reserveManagementOpen' : 'reserveManagementClose')}</Text>
                                <Image source={imgDownArrow} style={{ width: 13, height: 7, resizeMode: 'contain', marginLeft: 4, transform: [{ rotate: this.state.managementCollaps == true ? '0' + 'deg' : '180' + 'deg' }] }} />
                            </View>
                        </TouchableOpacity>

                        <Collapsible collapsed={this.state.managementCollaps} >
                            <FlatList style={{ maxHeight: 220 }} keyExtractor={(item, index) => index.toString()} showsHorizontalScrollIndicator={false} data={this.state.guestListData} renderItem={(obj) => {
                                return (
                                    <View style={{ paddingLeft: 16, flexDirection: 'row', marginTop: 12 }}>
                                        <Image source={obj.item.avatar_url == null || obj.item.avatar_url.length == 0 ? imgAccount : { uri: obj.item.avatar_url }} style={{ width: 60, height: 60, resizeMode: 'cover', borderRadius: 30 }}></Image>
                                        <View style={{ marginLeft: 14 }}>
                                            <Text style={{ fontSize: 16, color: Colors.color046BCC, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{obj.item.nickname}</Text>
                                            <View style={{ flexDirection: 'row', marginTop: 12 }}>
                                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{`${I18n.t('reserveManagementPhone')}: `}</Text>
                                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{obj.item.phone}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 0 }}>
                                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{`${I18n.t('reserveManagementAmount')}: `}</Text>
                                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{obj.item.amount + I18n.t('reserveAddDialogNum')}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 0 }}>
                                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{`${I18n.t('reserveManagementMessage')}: `}</Text>
                                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{obj.item.message}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 0 }}>
                                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{`${I18n.t('reserveManagementPrice')}: `}</Text>
                                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{obj.item.currency + obj.item.price}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )
                            }}>
                            </FlatList>
                        </Collapsible>

                        <Text style={{ marginTop: 16, marginLeft: 16, fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, }}>{I18n.t('reserveManagementEdit')}</Text>
                        <View style={{ marginTop: 4, flexDirection: 'row', height: 48, borderWidth: 1, borderRadius: 4, borderColor: Colors.colorD0D0D0, marginLeft: 16, marginRight: 16, paddingLeft: 16, paddingRight: 16, alignItems: 'center' }}>
                            <TextInput style={{ flex: 1, height: 48, padding: 0, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }} keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'} placeholder={""} autoCapitalize="none" onChangeText={(text) => this.setState({ updateAmount: text.replace(/[^0-9]/g, '') })}>{this.state.updateAmount}</TextInput>
                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 16, }}>{I18n.t('reserveAddDialogNum')}</Text>
                        </View>

                        <TouchableOpacity style={{ marginTop: 20, paddingRight: 16, paddingLeft: 16 }} onPress={() => this.setState({ managementDialogVisible: false, deleteDialogVisible: true, })}>
                            <View style={{ borderRadius: 4, borderColor: Colors.color2D7DC8, alignItems: 'center', justifyContent: 'center', height: 48, borderWidth: 1 }}>
                                <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{I18n.t('reserveManagementDelete')}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ marginTop: 8, marginBottom: 16, paddingRight: 16, paddingLeft: 16 }} onPress={() => this.setState({ isFetching: true, managementDialogVisible: false, managementCollaps: true, scheduleDialogVisivle: false, }, () => this._ScheduleUpdate())}>
                            <View style={{ borderRadius: 4, backgroundColor: Colors.color2D7DC8, alignItems: 'center', justifyContent: 'center', height: 48 }}>
                                <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{I18n.t('reserveManagementSave')}</Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal >
        )
    }

    _Dialog() {
        return (
            <Modal visible={this.state.deleteDialogVisible} transparent={true}>
                <TouchableWithoutFeedback onPress={() => this.setState({ deleteDialogVisible: false })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '90%', height: 211, backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 14, marginRight: 16 }} onPress={() => this.setState({ deleteDialogVisible: false, managementDialogVisible: true, })}>
                                        <Image source={imgClose} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t('reserveScheduleDeleteText')}</Text>
                                </View>
                                <View style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 19, flexDirection: 'row' }}>
                                    <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ isFetching: true, deleteDialogVisible: false, managementDialogVisible: false, managementCollaps: true, scheduleDialogVisivle: false, }, () => this._ScheduleDelete())}>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorE94D3E, borderRadius: 4, width: '100%', height: 48 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('reserveScheduleDeleteBtnDone')}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ flex: 1, marginLeft: 12 }} onPress={() => this.setState({ deleteDialogVisible: false, managementDialogVisible: true, })}>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.color2D7DC8, borderRadius: 4, width: '100%', height: 48 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('reserveScheduleDeleteBtnCancel')}</Text>
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
}