import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, FlatList, SectionList, TouchableOpacity } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';
import ServerUrl from '../../Common/ServerUrl'
import * as NetworkCall from '../../Common/NetworkCall'

const TAG = "ReserveCancel"
const imgBack = require('../../../assets/ic_back.png');
const imgRegionBg = require('../../../assets/img_region_bg.png');
export default class ReserveCancel extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        tabStatus: 0, //0 - upcoming, 1- past, 2- cancel
        datas: [{
            "title": "2022", "data": [{ "date": "08-18", "pictureUrl": "", "title": "첫번째 여행", "numberParticipants": "3", "time": "18:45", "payment": "100,000원", "status": "1" },
            { "date": "08-18", "pictureUrl": "", "title": "첫번째 여행", "numberParticipants": "3", "time": "18:45", "payment": "100,000원", "status": "1" },
            { "date": "08-18", "pictureUrl": "", "title": "첫번째 여행", "numberParticipants": "3", "time": "18:45", "payment": "100,000원", "status": "1" }]
        }, {
            "title": "2023", "data": [{ "date": "08-18", "pictureUrl": "", "title": "첫번째 여행", "numberParticipants": "3", "time": "18:45", "payment": "100,000원", "status": "1" },
            { "date": "08-18", "pictureUrl": "", "title": "첫번째 여행", "numberParticipants": "3", "time": "18:45", "payment": "100,000원", "status": "1" },
            { "date": "08-18", "pictureUrl": "", "title": "첫번째 여행", "numberParticipants": "3", "time": "18:45", "payment": "100,000원", "status": "1" },
            { "date": "08-18", "pictureUrl": "", "title": "첫번째 여행", "numberParticipants": "3", "time": "18:45", "payment": "100,000원", "status": "1" },
            { "date": "08-18", "pictureUrl": "", "title": "첫번째 여행", "numberParticipants": "3", "time": "18:45", "payment": "100,000원", "status": "1" }]
        }],
    }

    async _PayCancel() {
        const url = ServerUrl.Server + 'order/cancelOrder'
        console.log(this.props.route.params)
        let formBody = JSON.stringify({
            "order_no": this.props.route.params.data.orderNo,
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log(json)

        if (json.length > 0) {
            this.props.route.params.parentFunction('Success');
            this.props.navigation.goBack()
        }
        // if (json.ok == false) {
        //     console.log(json.data[0].reason)
        //     this.setState({
        //         reason: json.data[0].reason,
        //         dialogVisible: true,
        //     })
        // } else {
        //     this.props.navigation.navigate('PaymentWeb', { url: json.data.mobile_url })
        //     // Linking.openURL(json.data.mobile_url)
        // }
    }

    render() {
        console.log(this.props.route.params.data)
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

                    <View style={{ marginTop: 20 }}>
                        <View style={{ flexDirection: 'row', }}>
                            <Image style={{ width: 60, height: 60, resizeMode: 'stretch', borderRadius: 4, }} source={{ uri: ServerUrl.Server + this.props.route.params.data.pictureUrl }} resizeMethod={"resize"}></Image>
                            <View style={{ marginLeft: 8, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD9D9D9, flex: 1, padding: 8 }}>
                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{this.props.route.params.data.title}</Text>
                                <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', }}>
                                    <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesNumber') + " : "}</Text>
                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{this.props.route.params.data.numberParticipants}</Text>
                                </View>
                                <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                    <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesDate') + " : "}</Text>
                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{this.props.route.params.data.date}</Text>
                                </View>
                                <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                    <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesPayment') + " : "}</Text>
                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{this.props.route.params.data.payment}</Text>
                                </View>
                                <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', }}>
                                    <Text style={{ fontSize: 12, color: Colors.color808080, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperiencesStatus') + " : "}</Text>
                                    <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{this.props.route.params.data.status == "1" ? I18n.t('myExperiencesReserveConfirm') : I18n.t('myExperiencesWaiting')}</Text>
                                </View>

                            </View>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => this._PayCancel()}>
                        <View style={{ backgroundColor: Colors.color2D7DC8, height: 48, marginTop: 28, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{(I18n.currentLocale() == 'ko-KR' ? this.props.route.params.data.payment + I18n.t('myExperienceCancelReceiveRefund') : (I18n.currentLocale() == 'en-US' ? "Receive a " + this.props.route.params.data.payment + I18n.t('myExperienceCancelReceiveRefund') : this.props.route.params.data.payment + I18n.t('myExperienceCancelReceiveRefund')))}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('myExperienceCancelReceiveRefundInfo')}</Text>
                    </View>
                </View>
            </SafeAreaView >
        )
    }
}