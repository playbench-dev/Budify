import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, FlatList } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';
import FetchingIndicator from 'react-native-fetching-indicator'
import User from '../../Common/User'
import ServerUrl from '../../Common/ServerUrl'
import Moment from 'moment';

const TAG = "MyCoupons"
const imgBack = require('../../../assets/ic_back.png');
const imgAdd = require('../../../assets/ic_add.png');

export default class MyCoupons extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        isFetching: true,
        coupons: 0,
        couponDatas: [],
        type: 0, // 0-list
        isRefreshing: false,
    }

    componentDidMount() {
        this._NetworkCoupon()
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
                console.log(TAG, json);
                if (json.length > 0) {
                    for (let i = 0; i < json.length; i++) {

                        const obj = {
                            couponNo: json[i].coupon_no,
                            userCouponNo: json[i].user_coupon_no,
                            status: json[i].status,
                            expiredDt: Moment(json[i].expired_dt).format('YYYY-MM-DD'),
                            title: json[i].couponInfo.type == 1 ? (json[i].couponInfo.currency == "USD" ? "$" : json[i].couponInfo.currency == "KRW" ? "₩" : json[i].couponInfo.currency == "EUR" ? "€" : json[i].couponInfo.currency == "JPY" ? "¥" : json[i].couponInfo.currency) + json[i].couponInfo.price + ' ' + json[i].couponInfo.name : json[i].couponInfo.price + "%" + ' ' + json[i].couponInfo.name
                        }
                        this.state.couponDatas.push(obj)
                    }
                } else {

                }
                this.setState({
                    isFetching: false,
                    isRefreshing: false
                })
            })
    }

    parentFunction = value => {
        this.setState({ isFetching: true }, () => this._NetworkCoupon())
    }

    render() {
        const lang = I18n.currentLocale()
        console.log(lang)
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('myCoupons')}</Text>
                    </View>

                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('CouponAdd', { parentFunction: this.parentFunction })}>
                        <View style={{ borderWidth: 1, borderColor: Colors.color2D7DC8, borderRadius: 4, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 24, height: 48 }}>
                            <Image source={imgAdd} style={{ width: 14, height: 14, resizeMode: 'contain' }}></Image>
                            <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginLeft: 5 }}>{I18n.t('myCouponsAdd')}</Text>
                        </View>
                    </TouchableWithoutFeedback>

                    <View style={{ flex: 1, marginTop: 20, backgroundColor: Colors.colorF4F3F3, paddingLeft: 16, paddingRight: 16 }}>
                        <FlatList style={{ marginBottom: 20 }} keyExtractor={(item, index) => index.toString()} data={this.state.couponDatas} renderItem={(obj) => {
                            return (
                                <TouchableWithoutFeedback>
                                    <View key={obj.index} style={{ height: 99, backgroundColor: Colors.colorFFFFFF, marginTop: 12, padding: 12, borderWidth: 1, borderColor: Colors.colorC4C4C4, borderRadius: 4 }}>
                                        <Text style={{ flex: 1, fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{obj.item.title}</Text>
                                        <View style={{ marginBottom: 4, flexDirection: 'row' }}>
                                            <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('myCouponsExpiration')}</Text>
                                            <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, marginLeft: 9 }}>{obj.item.expiredDt}</Text>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        }} onRefresh={() => this.setState({ isRefreshing: true, couponDatas: [] }, () => this._NetworkCoupon())}
                            refreshing={this.state.isRefreshing}>
                        </FlatList>
                    </View>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}