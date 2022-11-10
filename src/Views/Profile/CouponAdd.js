import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, LogBox } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';
import * as NetworkCall from '../../Common/NetworkCall'
import User from '../../Common/User';
import ServerUrl from '../../Common/ServerUrl'

const TAG = "CouponAdd"
const imgBack = require('../../../assets/ic_back.png');

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);

export default class CouponAdd extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        couponCheck: 0, //1-success , 2-fail
        code: '',
    }

    componentDidMount() {

    }

    async _CouponAdd() {
        const url = ServerUrl.EnrollCoupon
        let formBody = JSON.stringify({
            "user_no": User.userNo,
            "code": this.state.code,
            "conditions": [

            ]
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log(json)
        if (json.length > 0) {
            this.setState({
                couponCheck: 1
            })
            this.props.route.params.parentFunction('Success');
        } else {
            this.setState({
                couponCheck: 2
            })
        }
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ flex: 1 }}>
                        <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                            <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                                <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                    <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                                </View>
                            </TouchableWithoutFeedback>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('myCouponsAdd')}</Text>
                        </View>

                        <View>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, marginTop: 24 }}>{I18n.t('myCouponsCode')}</Text>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: this.state.couponCheck == 2 ? Colors.colorFD6268 : this.state.couponCheck == 1 ? Colors.color64B465 : Colors.colorD0D0D0, borderWidth: 1, marginTop: 4, alignItems: 'center', flexDirection: 'row' }}>
                                <TextInput onChangeText={(text) => { this.setState({ code: text }) }} style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, borderRadius: 12, paddingLeft: 12, fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false }} placeholderTextColor={Colors.colorD0D0D0} placeholder={I18n.t('myCouponsCodeEnter')} autoCapitalize="none" returnKeyType="next"></TextInput>
                            </View>
                        </View>

                        {this.state.couponCheck != 0 && <Text style={{ fontSize: 14, color: this.state.couponCheck == 2 ? Colors.colorFD6268 : Colors.color64B465, fontFamily: 'Raleway-Regular', includeFontPadding: false, marginTop: 8 }}>{I18n.t(this.state.couponCheck == 2 ? 'myCouponsAddFail' : 'myCouponsAddSuccess')}</Text>}
                    </View>

                    <TouchableWithoutFeedback onPress={() => this._CouponAdd()}>
                        <View style={{ height: 48, backgroundColor: Colors.color2D7DC8, marginBottom: 20, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, }}>{I18n.t('myCouponsAddDone')}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </SafeAreaView>
        )
    }
}