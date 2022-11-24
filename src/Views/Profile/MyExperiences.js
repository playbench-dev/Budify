import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, FlatList, SectionList, TouchableOpacity } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';
import * as NetworkCall from '../../Common/NetworkCall'
import User from '../../Common/User';
import ServerUrl from '../../Common/ServerUrl';
import Moment from 'moment';
import FetchingIndicator from 'react-native-fetching-indicator'

const TAG = "MyExperiences"
const imgBack = require('../../../assets/ic_back.png');
const imgRegionBg = require('../../../assets/img_region_bg.png');
export default class MyExperiences extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this._MyExperiences()
    }

    state = {
        tabStatus: 0, //0 - upcoming, 1- past, 2- cancel
        isFetching: true,
        upcomingDatas: [],
        pastDatas: [],
        cancelDatas: [],
    }

    parentFunction = value => {
        this.setState({ isFetching: true, }, () => this._MyExperiences())
    }

    async _MyExperiences() {
        this.state.upcomingDatas = [];
        this.state.pastDatas = [];
        this.state.cancelDatas = [];
        const url = ServerUrl.SelectMyExperienceOrder
        let formBody = JSON.stringify({
            "conditions": [
                {
                    "q": "=",
                    "f": "user_no",
                    "v": User.userNo,
                },
                // {
                //     "op": "AND",
                //     "q": ">=",
                //     "f": "datetime",
                //     "v": "\'" + Moment(new Date()).format('YYYY-MM-DD') + "\'"
                // }
            ]
        })
        const json = await NetworkCall.Select(url, formBody)

        // console.log(json)

        let upComingList = [];
        let pastList = [];
        let cancelList = [];

        if (json.length > 0) {
            for (let i = 0; i < json.length; i++) {
                if ((parseInt(Moment(new Date()).format('YYYYMMDD')) <= parseInt(json[i].exScheduleInfo.datetime.substring(0, 10).replace(/-/gi, ''))) && json[i].status == 2) {
                    const upComingObj = {
                        title: json[i].exScheduleInfo.datetime.substring(0, 4),
                        data: {
                            date: json[i].exScheduleInfo.datetime,
                            pictureUrl: JSON.parse(json[i].exInfo.representative_file_url)[0],
                            title: json[i].title,
                            numberParticipants: json[i].amount,
                            payment: (json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency) + JSON.parse(json[i].payInfo).amount,
                            status: 1,
                            orderNo: json[i].order_no,
                            exNo: json[i].ex_no,
                        }
                    }
                    upComingList.push(upComingObj)
                } else if ((parseInt(Moment(new Date()).format('YYYYMMDD')) > parseInt(json[i].exScheduleInfo.datetime.substring(0, 10).replace(/-/gi, ''))) && json[i].status == 2) {
                    const pastObj = {
                        title: json[i].exScheduleInfo.datetime.substring(0, 4),
                        data: {
                            date: json[i].exScheduleInfo.datetime,
                            pictureUrl: JSON.parse(json[i].exInfo.representative_file_url)[0],
                            title: json[i].title,
                            numberParticipants: json[i].amount,
                            payment: (json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency) + JSON.parse(json[i].payInfo).amount,
                            status: 1,
                            orderNo: json[i].order_no,
                            exNo: json[i].ex_no,
                            reviewNo: json[i].review_no || '',
                            description: json[i].description,
                        }
                    }
                    pastList.push(pastObj)
                } else if (json[i].status == '3') {
                    if (json[i].payInfo != null) {
                        const cancelObj = {
                            title: json[i].exScheduleInfo.datetime.substring(0, 4),
                            data: {
                                date: json[i].exScheduleInfo.datetime,
                                pictureUrl: JSON.parse(json[i].exInfo.representative_file_url)[0],
                                title: json[i].title,
                                numberParticipants: json[i].amount,
                                payment: (json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency) + JSON.parse(json[i].payInfo).amount,
                                status: 1,
                                orderNo: json[i].order_no,
                                reseaon: json[i].cancel_reason,
                                exNo: json[i].ex_no,
                            }
                        }
                        cancelList.push(cancelObj)
                    }
                } else {
                    console.log('else')
                }
            }

            let upcomingTitle = '';
            let upcomingDataList = [];
            let pastTitle = '';
            let pastDataList = [];
            let cancelTitle = '';
            let cancelDataList = [];

            console.log(upComingList.length)

            for (let i = 0; i < upComingList.length; i++) {
                if (upcomingTitle.length == 0) {
                    upcomingTitle = upComingList[i].title;
                    upcomingDataList.push(upComingList[i].data)
                    if (upComingList.length == 1) {
                        const obj = {
                            title: upcomingTitle,
                            data: upcomingDataList,
                        }
                        this.state.upcomingDatas.push(obj)
                    }
                } else if (upcomingTitle != upComingList[i].title) {
                    const obj = {
                        title: upcomingTitle,
                        data: upcomingDataList,
                    }
                    this.state.upcomingDatas.push(obj)
                    upcomingTitle = upComingList[i].title;
                    upcomingDataList = [];
                    upcomingDataList.push(upComingList[i].data)
                } else {
                    upcomingDataList.push(upComingList[i].data)
                    if (i == upComingList.length - 1) {
                        const obj = {
                            title: upcomingTitle,
                            data: upcomingDataList,
                        }
                        this.state.upcomingDatas.push(obj)
                    }
                }
            }
            for (let i = 0; i < pastList.length; i++) {
                if (pastTitle.length == 0) {
                    pastTitle = pastList[i].title;
                    pastDataList.push(pastList[i].data)
                    if (pastList.length == 1) {
                        const obj = {
                            title: pastTitle,
                            data: pastDataList,
                        }
                        this.state.pastDatas.push(obj)
                    }
                } else if (pastTitle != pastList[i].title) {
                    const obj = {
                        title: pastTitle,
                        data: pastDataList,
                    }
                    this.state.pastDatas.push(obj)
                    pastTitle = pastList[i].title;
                    pastDataList = [];
                    pastDataList.push(pastList[i].data)
                } else {
                    pastDataList.push(pastList[i].data)
                    if (i == pastList.length - 1) {
                        const obj = {
                            title: pastTitle,
                            data: pastDataList,
                        }
                        this.state.pastDatas.push(obj)
                    }
                }
            }
            console.log('cancel ' + cancelList.length)
            for (let i = 0; i < cancelList.length; i++) {
                if (cancelTitle.length == 0) {
                    cancelTitle = cancelList[i].title;
                    cancelDataList.push(cancelList[i].data)
                    if (cancelList.length == 1) {
                        const obj = {
                            title: cancelTitle,
                            data: cancelDataList,
                        }
                        this.state.cancelDatas.push(obj)
                    }
                } else if (cancelTitle != cancelList[i].title) {
                    const obj = {
                        title: cancelTitle,
                        data: cancelDataList,
                    }
                    this.state.cancelDatas.push(obj)
                    cancelTitle = cancelList[i].title;
                    cancelDataList = [];
                    cancelDataList.push(cancelList[i].data)
                } else {
                    cancelDataList.push(cancelList[i].data)
                    if (i == cancelList.length - 1) {
                        const obj = {
                            title: cancelTitle,
                            data: cancelDataList,
                        }
                        this.state.cancelDatas.push(obj)
                    }
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

    parentFunction = value => {
        console.log(value)
        this.setState({ isFetching: true }, () => this._MyExperiences())
    }

    render() {
        console.log(this.state.upcomingDatas.length)
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('myExperiences')}</Text>
                    </View>

                    <View style={{ marginTop: 16, flexDirection: 'row', paddingTop: 8, paddingBottom: 8, paddingLeft: 25, paddingRight: 25, width: '100%' }}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ tabStatus: 0 })}>
                            <Text style={{ fontSize: 15, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, textAlign: 'center' }}>{I18n.t('myExperiencesTabUpcoming')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ tabStatus: 1 })}>
                            <Text style={{ fontSize: 15, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, textAlign: 'center' }}>{I18n.t('myExperiencesTabPast')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ tabStatus: 2 })}>
                            <Text style={{ fontSize: 15, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, textAlign: 'center' }}>{I18n.t('myExperiencesTabCancel')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', height: 4, backgroundColor: Colors.colorD9D9D9, paddingLeft: 25, paddingRight: 25 }}>
                        <View style={{ flex: 1, backgroundColor: Colors.color2D7DC8, opacity: this.state.tabStatus == 0 ? 1 : 0 }}></View>
                        {/* <View style={{ flex: 1, }}></View> */}
                        <View style={{ flex: 1, backgroundColor: Colors.color2D7DC8, opacity: this.state.tabStatus == 1 ? 1 : 0 }}></View>
                        {/* <View style={{ flex: 1, }}></View> */}
                        <View style={{ flex: 1, backgroundColor: Colors.color2D7DC8, opacity: this.state.tabStatus == 2 ? 1 : 0 }}></View>
                    </View>

                    {/* upcoming */}
                    {this.state.tabStatus == 0 && (
                        <SectionList
                            sections={this.state.upcomingDatas}
                            style={{}}
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
                                            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.colorD9D9D9, marginTop: 2 }}></View>
                                            <View style={{ flex: 1, backgroundColor: Colors.colorD9D9D9, width: 1 }}></View>
                                        </View>
                                        <View style={{ marginLeft: 4, flex: 1, }}>
                                            <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{item.date.substring(5, 10)}</Text>
                                            <View style={{ marginTop: 8, flexDirection: 'row', flex: 1, }}>
                                                <Image style={{ width: 60, height: 60, resizeMode: 'stretch', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl }} resizeMethod={"resize"}></Image>
                                                <View style={{ marginLeft: 4, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD9D9D9, flex: 1, padding: 8 }}>
                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{item.title}</Text>
                                                    <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesNumber') + " : "}</Text>
                                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.numberParticipants}</Text>
                                                    </View>
                                                    <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesDate') + " : "}</Text>
                                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.date}</Text>
                                                    </View>
                                                    <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesPayment') + " : "}</Text>
                                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.payment}</Text>
                                                    </View>
                                                    <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesStatus') + " : "}</Text>
                                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.status == "1" ? I18n.t('myExperiencesReserveConfirm') : I18n.t('myExperiencesWaiting')}</Text>
                                                    </View>
                                                    <View style={{ marginTop: 12, flexDirection: 'row' }}>
                                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('ReserveCancel', { data: item, parentFunction: this.parentFunction })}>
                                                            <View style={{ borderWidth: 1, borderColor: Colors.color2D7DC8, paddingLeft: 22, paddingRight: 22, paddingTop: 5, paddingBottom: 5, borderRadius: 20 }}>
                                                                <Text style={{ fontSize: 10, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesCancel')}</Text>
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
                        </SectionList>
                    )}

                    {/* past */}
                    {this.state.tabStatus == 1 && (
                        <SectionList sections={this.state.pastDatas}
                            style={{}}
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
                                            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.colorD9D9D9, marginTop: 2 }}></View>
                                            <View style={{ flex: 1, backgroundColor: Colors.colorD9D9D9, width: 1 }}></View>
                                        </View>
                                        <View style={{ marginLeft: 4, flex: 1, }}>
                                            <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{item.date.substring(5, 10)}</Text>
                                            <View style={{ marginTop: 8, flexDirection: 'row', flex: 1, }}>
                                                <Image style={{ width: 60, height: 60, resizeMode: 'stretch', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl }} resizeMethod={"resize"}></Image>
                                                <View style={{ marginLeft: 4, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD9D9D9, flex: 1, padding: 8 }}>
                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{item.title}</Text>
                                                    <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesNumber') + " : "}</Text>
                                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.numberParticipants}</Text>
                                                    </View>
                                                    <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesDate') + " : "}</Text>
                                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.date}</Text>
                                                    </View>
                                                    <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesPayment') + " : "}</Text>
                                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.payment}</Text>
                                                    </View>
                                                    <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesStatus') + " : "}</Text>
                                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.status == "1" ? I18n.t('myExperiencesReserveConfirm') : I18n.t('myExperiencesWaiting')}</Text>
                                                    </View>
                                                    <View style={{ marginTop: 12, flexDirection: 'row' }}>
                                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('GoodsDetail', { exNo: item.exNo })}>
                                                            <View style={{ backgroundColor: Colors.color2D7DC8, paddingLeft: 22, paddingRight: 22, paddingTop: 5, paddingBottom: 5, borderRadius: 20 }}>
                                                                <Text style={{ fontSize: 10, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesReserveAgain')}</Text>
                                                            </View>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity onPress={() => item.reviewNo.length == 0 ? this.props.navigation.navigate('ReviewInsert', { data: item, parentFunction: this.parentFunction }) : this.props.navigation.navigate('GoodsDetail', { exNo: item.exNo, })}>
                                                            <View style={{ borderWidth: 1, borderColor: Colors.color2D7DC8, paddingLeft: 22, paddingRight: 22, paddingTop: 5, paddingBottom: 5, borderRadius: 20, marginLeft: 4 }}>
                                                                <Text style={{ fontSize: 10, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t(item.reviewNo.length == 0 ? 'myExperiencesSubmitReview' : 'myExperiencesSeeReview')}</Text>
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

                        </SectionList>
                    )}

                    {/* cancel */}
                    {this.state.tabStatus == 2 && (
                        <SectionList sections={this.state.cancelDatas}
                            style={{}}
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
                                            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.colorD9D9D9, marginTop: 2 }}></View>
                                            <View style={{ flex: 1, backgroundColor: Colors.colorD9D9D9, width: 1 }}></View>
                                        </View>
                                        <View style={{ marginLeft: 4, flex: 1, }}>
                                            <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{item.date.substring(5, 10)}</Text>
                                            <View style={{ marginTop: 8, flexDirection: 'row', flex: 1, }}>
                                                <Image style={{ width: 60, height: 60, resizeMode: 'stretch', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl }} resizeMethod={"resize"}></Image>
                                                <View style={{ marginLeft: 4, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD9D9D9, flex: 1, padding: 8 }}>
                                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                                        <View style={{ backgroundColor: Colors.colorD9D9D9, borderRadius: 2, paddingTop: 3, paddingBottom: 3, paddingLeft: 4, paddingRight: 4, flexDirection: 'row' }}>
                                                            <Text style={{ fontSize: 8, color: Colors.colorAF2828, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesReasonCancel')}</Text>
                                                            <Text style={{ fontSize: 8, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.reseaon}</Text>
                                                        </View>
                                                    </View>

                                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 8 }}>{item.title}</Text>
                                                    <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesNumber') + " : "}</Text>
                                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.numberParticipants}</Text>
                                                    </View>
                                                    <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesPayment') + " : "}</Text>
                                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.payment}</Text>
                                                    </View>
                                                    <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                                        <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesStatus') + " : "}</Text>
                                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{item.status == "1" ? I18n.t('myExperiencesReserveConfirm') : I18n.t('myExperiencesWaiting')}</Text>
                                                    </View>
                                                    <View style={{ marginTop: 12, flexDirection: 'row' }}>
                                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('GoodsDetail', { exNo: item.exNo })}>
                                                            <View style={{ borderWidth: 1, borderColor: Colors.color2D7DC8, paddingLeft: 22, paddingRight: 22, paddingTop: 5, paddingBottom: 5, borderRadius: 20 }}>
                                                                <Text style={{ fontSize: 10, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesReserveAgain')}</Text>
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
                        ></SectionList>)}
                    <View style={{ height: 20 }}></View>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView >
        )
    }
}