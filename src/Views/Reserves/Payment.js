import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, TouchableOpacity, Animated, Linking } from 'react-native'
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
import PaySelectDialog from '../../Common/PaySelectDialog'

const TAG = "Payment"
const imgBack = require('../../../assets/ic_back.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgPayAmericanExpress = require('../../../assets/img_pay_american_express.png');
const imgPayBc = require('../../../assets/img_pay_bc.png');
const imgPayHana = require('../../../assets/img_pay_hana.png');
const imgPayHyundai = require('../../../assets/img_pay_hyundai.png');
const imgPayJcb = require('../../../assets/img_pay_jcb.png');
const imgPayKakao = require('../../../assets/img_pay_kakao.png');
const imgPayKb = require('../../../assets/img_pay_kb.png');
const imgPayLotte = require('../../../assets/img_pay_lotte.png');
const imgPayMasterCard = require('../../../assets/img_pay_master_card.png');
const imgPayNaver = require('../../../assets/img_pay_naver.png');
const imgPayNh = require('../../../assets/img_pay_nh.png');
const imgPayPayPal = require('../../../assets/img_pay_paypal.png');
const imgPaySamsung = require('../../../assets/img_pay_samsung.png');
const imgPaySamsungPay = require('../../../assets/img_pay_samsungpay.png');
const imgPaySinhan = require('../../../assets/img_pay_sinhan.png');
const imgPayToss = require('../../../assets/img_pay_toss.png');
const imgPayUnionpay = require('../../../assets/img_pay_unionpay.png');
const imgPayVisa = require('../../../assets/img_pay_visa.png');
const imgClose = require('../../../assets/ic_close.png')
const global = [
    { text: 'Credit Card(Amex)', value: 'PLCreditCard' }, // { text: '해외카드(비인증)', value: 'PLCreditCard' },
    // { text: 'Credit Card(Visa/Master/JCB)', value: 'PLCreditCardMpi' },
    // { text: '해외카드(인증)', value: 'PLCreditCardMpi' },
    // { text: '사이버소스 해외카드', value: 'PLCreditCard_CY' },
    { text: 'UnionPay', value: 'PLUnionPay' }, // { text: '유니온페이', value: 'PLUnionPay' },
    { text: 'PayPal', value: 'PaypalExpressCheckout' }, // { text: '페이팔', value: 'PaypalExpressCheckout' },
    // { text: '체리크레디트(선불카드 결제)', value: 'CCCherryCredits' },
    // { text: 'Degica (선불카드 결제)', value: 'DegicaBitCash' },
    // { text: 'Degica (신용카드 결제)', value: 'DegicaCreditCard' },
    // { text: 'Degica (편의점 결제)', value: 'DegicaKonbini' },
    // { text: 'Degica (넷캐시 선불카드 결제)', value: 'DegicaNetCash' },
    // { text: 'Degica (전자지갑 결제)', value: 'DegicaWebMoney' },
    // { text: 'ICB(전자지갑 결제)', value: 'ICBAlipay' },
    // { text: 'MOL(은행송금 뱅킹)', value: 'MOLDragonPay' },
    // { text: 'MOL(선불카드 결제)', value: 'MOLLoadCentral' },
    // { text: 'MOL(선불카드 결제)', value: 'MOLMOLPoint_PP' },
    // { text: 'MOL(전자지갑 결제)', value: 'MOLzGold-MOLPoints' },
    // { text: '위챗페이(H5 결제)', value: 'WeChatPayH5Payment' },
    // { text: '위챗페이(QRCode 결제)', value: 'WeChatPayQRCodePayment' },
];
const domestic = [
    { text: 'Credit Card', value: 'creditcard' }, // { text: '신용카드', value: 'creditcard' },
    // { text: '인터넷뱅킹(금융결제원)', value: 'banktransfer' },
    { text: 'Virtual Account', value: 'virtualaccount' }, // { text: '가상계좌', value: 'virtualaccount' },
    // { text: '휴대폰', value: 'mobile' },
    // { text: '도서문화상품권', value: 'book' },
    // { text: '문화상품권', value: 'culture' },
    // { text: '스마트문상', value: 'smartculture' },
    // { text: '해피머니상품권', value: 'happymoney' },
    // { text: '모바일팝', value: 'mobilepop' },
    // { text: '틴캐시', value: 'teencash' },
    // { text: '교통카드결제', value: 'tmoney' },
    // { text: '편의점캐시', value: 'cvs' },
    // { text: '에그머니', value: 'eggmoney' },
    // { text: '온캐시', value: 'oncash' },
    // { text: '폰빌', value: 'phonebill' },
    // { text: '캐시비', value: 'cashbee' },
    { text: 'KakaoPay', value: 'kakaopay' }, // { text: '카카오페이', value: 'kakaopay' },
    // { text: '페이코', value: 'payco' },
    // { text: '체크페이', value: 'checkpay' },
    { text: 'Toss', value: 'toss' }, // { text: '토스', value: 'toss' },
    { text: 'SSGPAY', value: 'ssgpay' }, // { text: 'SSG페이', value: 'ssgpay' },

    // { text: 'L.Pay', value: 'lpay' },
    { text: 'Naver Pay', value: 'naverpay' }, // { text: '네이버페이', value: 'naverpay' },
    { text: 'Samsung Pay', value: 'samsungpay' }, // { text: '삼성페이', value: 'samsungpay' },
    // { text: '차이', value: 'chai' },
    // { text: '스마일페이', value: 'smilepay' },
]
export default class Payment extends React.Component {
    constructor(props) {
        super(props)

    }

    componentDidMount() {
        console.log(this.props.route.params)
        if (this.props.route.params.coupon != null) {
            console.log('not null')
        } else {
            console.log('null')
        }
    }

    state = {
        paymentUrl: '',
        result: '',
        dialogVisible: false,
        reason: '',
        globalPosition: -1,
        globalSelectedText: '',
        domesticPosition: -1,
        domesticSelectedText: '',
        selectedDialogType: -1, //1 - global, 2 - domestic
        selectDialogVisible: false,
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
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{this.state.reason}</Text>
                                </View>
                                <View style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 19 }}>
                                    <TouchableOpacity onPress={() => this.setState({ dialogVisible: false })}>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.type == 0 ? Colors.color2D7DC8 : Colors.colorE94D3E, borderRadius: 4, width: '100%', height: 48 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('reserveDone')}</Text>
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

    _CallDialog() {
        if (this.state.selectDialogVisible) {
            let datas = [];
            let title = '';
            let type = this.state.selectedDialogType;

            if (type == '1') {
                datas = global
            }
            else if (type == '2') {
                datas = domestic
            }

            if (type == '4' || datas.length > 0) {
                return <PaySelectDialog title={title} datas={datas} type={type} no={0} selectedPosition={type == 1 ? this.state.globalPosition : this.state.domesticPosition} click={this._ClickDialog} selectedString={type == 1 ? this.state.globalSelectedText : this.state.domesticSelectedText} ></PaySelectDialog>
            } else {
                return null;
            }

        } else {
            return null;
        }
    }

    _ClickDialog = value => {

        if (value.type == '1') {
            this.setState({
                selectDialogVisible: false,
                domesticPosition: -1,
                domesticSelectedText: '',
                globalPosition: value.selectedPosition,
                globalSelectedText: global[value.selectedPosition].text
            });
        } else if (value.type == '2') {
            this.setState({
                selectDialogVisible: false,
                domesticPosition: value.selectedPosition,
                domesticSelectedText: domestic[value.selectedPosition].text,
                globalPosition: -1,
                globalSelectedText: ''
            });
        } else if (value.type == '5') {
            this.setState({
                selectDialogVisible: false,
            });
        }
    }

    async _Pay(status) {
        let url = '';
        if (status == 1) {
            url = ServerUrl.Server + 'global/payM'
        } else {
            url = ServerUrl.Server + 'domestic/payM'
        }
        let formBody = null

        if (this.props.route.params.coupon != null) {
            const obj = {
                user_coupon_no: this.props.route.params.coupon.couponNo,
                couponInfo: {
                    type: this.props.route.params.coupon.type,
                    price: this.props.route.params.coupon.price
                }
            }
            formBody = JSON.stringify({
                "ex_no": this.props.route.params.exNo,
                "ex_schedules_no": this.props.route.params.exScheduleNo,
                "currency": this.props.route.params.currency,
                "price": this.props.route.params.price,
                "title": this.props.route.params.title,
                "amount": this.props.route.params.amount,
                "user_no": User.userNo,
                "name": User.userName,
                "pg_code": this.state.selectedDialogType == 1 ? global[this.state.globalPosition].value : domestic[this.state.domesticPosition].value,
                "message": this.props.route.params.message,
                "email": User.email,
                "phone": this.props.route.params.phone,
                "scheme": 'budifyapp://',
                "user_coupon": obj
            })
        } else {
            formBody = JSON.stringify({
                "ex_no": this.props.route.params.exNo,
                "ex_schedules_no": this.props.route.params.exScheduleNo,
                "currency": this.props.route.params.currency,
                "price": this.props.route.params.price,
                "title": this.props.route.params.title,
                "amount": this.props.route.params.amount,
                "user_no": User.userNo,
                "name": User.userName,
                "pg_code": this.state.selectedDialogType == 1 ? global[this.state.globalPosition].value : domestic[this.state.domesticPosition].value,
                "message": this.props.route.params.message,
                "email": User.email,
                "phone": this.props.route.params.phone,
                "scheme": 'budifyapp://'
            })
        }

        const json = await NetworkCall.Select(url, formBody)
        console.log(formBody)

        if (json.ok == false) {
            console.log(json.data[0].reason)
            this.setState({
                reason: json.data[0].reason,
                dialogVisible: true,
            })
        } else {
            this.props.navigation.navigate('PaymentWeb', { url: json.data.mobile_url })
            // Linking.openURL(json.data.mobile_url)
        }
    }

    render() {
        return (
            <SafeAreaView>
                {this._Dialog()}
                {this._CallDialog()}
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('PaymentTitle')}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ marginTop: 24, paddingLeft: 16, paddingRight: 16 }}>
                        <View style={{ borderRadius: 8, borderWidth: 1, borderColor: Colors.color046BCC, }}>
                            <View style={{ borderRadius: 6, backgroundColor: Colors.color2D7DC8, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 18, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('PaymentGlobalTitle')}</Text>
                            </View>

                            <View style={{ paddingLeft: 21, paddingRight: 27 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                                    <View style={{ flex: 1 }}></View>
                                    <Image style={{ width: 72, height: 40 }} source={imgPayVisa}></Image>
                                    <Image style={{ width: 72, height: 40 }} source={imgPayMasterCard}></Image>
                                    <Image style={{ width: 72, height: 40 }} source={imgPayAmericanExpress}></Image>
                                    <Image style={{ width: 72, height: 40 }} source={imgPayPayPal}></Image>
                                    <View style={{ flex: 1 }}></View>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 0 }}>
                                    <View style={{ flex: 1 }}></View>
                                    <Image style={{ width: 72, height: 40 }} source={imgPayJcb}></Image>
                                    <Image style={{ width: 72, height: 40 }} source={imgPayUnionpay}></Image>
                                    <Image style={{ width: 72, height: 40, opacity: 0 }} source={imgPayJcb}></Image>
                                    <Image style={{ width: 72, height: 40, opacity: 0 }} source={imgPayUnionpay}></Image>
                                    <View style={{ flex: 1 }}></View>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 25, marginBottom: 20 }}>
                                    <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ selectedDialogType: 1, selectDialogVisible: true })}>
                                        <View style={{ borderWidth: 1, borderColor: Colors.colorD0D0D0, borderRadius: 4, height: 32, justifyContent: 'center', paddingLeft: 4, paddingRight: 20 }}>
                                            <Text style={{ fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{this.state.globalPosition == -1 ? I18n.t('PaymentSelectMethod') : this.state.globalSelectedText}</Text>
                                            <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 8 }} source={imgDownArrow}></Image>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.state.selectedDialogType != -1 && this._Pay(1)}>
                                        <View style={{ marginLeft: 17, width: 100, backgroundColor: Colors.color2D7DC8, borderRadius: 100, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 14, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('PaymentTitle')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={{ borderRadius: 8, borderWidth: 1, borderColor: Colors.color289FAF, marginTop: 24 }}>
                            <View style={{ borderRadius: 6, backgroundColor: Colors.color289FAF, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 18, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('PaymentKoreanTitle')}</Text>
                            </View>

                            <View style={{ paddingLeft: 21, paddingRight: 27 }}>
                                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                    <View style={{ flex: 1 }}></View>
                                    <Image style={{ width: 80, height: 32 }} source={imgPaySamsung}></Image>
                                    <Image style={{ width: 80, height: 32 }} source={imgPayKb}></Image>
                                    <Image style={{ width: 80, height: 32 }} source={imgPayHana}></Image>
                                    <Image style={{ width: 80, height: 32 }} source={imgPayBc}></Image>
                                    <View style={{ flex: 1 }}></View>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 0 }}>
                                    <View style={{ flex: 1 }}></View>
                                    <Image style={{ width: 80, height: 32 }} source={imgPayLotte}></Image>
                                    <Image style={{ width: 80, height: 32 }} source={imgPaySinhan}></Image>
                                    <Image style={{ width: 80, height: 32 }} source={imgPayHyundai}></Image>
                                    <Image style={{ width: 80, height: 32 }} source={imgPayNh}></Image>
                                    <View style={{ flex: 1 }}></View>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 0 }}>
                                    <View style={{ flex: 1 }}></View>
                                    <Image style={{ width: 80, height: 32 }} source={imgPayKakao}></Image>
                                    <Image style={{ width: 80, height: 32 }} source={imgPayToss}></Image>
                                    <Image style={{ width: 80, height: 32 }} source={imgPayNaver}></Image>
                                    <Image style={{ width: 80, height: 32 }} source={imgPaySamsungPay}></Image>
                                    <View style={{ flex: 1 }}></View>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 25, marginBottom: 20 }}>
                                    <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ selectedDialogType: 2, selectDialogVisible: true })}>
                                        <View style={{ borderWidth: 1, borderColor: Colors.colorD0D0D0, borderRadius: 4, height: 32, justifyContent: 'center', paddingLeft: 4, paddingRight: 20 }}>
                                            <Text style={{ fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{this.state.domesticPosition == -1 ? I18n.t('PaymentSelectMethod') : this.state.domesticSelectedText}</Text>
                                            <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 8 }} source={imgDownArrow}></Image>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.state.selectedDialogType != -1 && this._Pay(2)}>
                                        <View style={{ marginLeft: 17, width: 100, backgroundColor: Colors.color289FAF, borderRadius: 100, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 14, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('PaymentTitle')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                </View>
            </SafeAreaView>
        )
    }
}