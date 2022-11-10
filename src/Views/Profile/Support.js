import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, TouchableOpacity } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Utils from '../../Common/Utils'
import User from '../../Common/User'
import ServerUrl from '../../Common/ServerUrl';
import FetchingIndicator from 'react-native-fetching-indicator'
import * as NetworkCall from '../../Common/NetworkCall'
import Toast from 'react-native-toast-message'

const TAG = "Support"
const imgBack = require('../../../assets/ic_back.png');

export default class Support extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        title: '',
        contents: '',
    }

    async _InsertInquiry() {
        const url = ServerUrl.InsertInquiry
        let formBody = {};

        formBody = JSON.stringify({
            "user_no": User.userNo,
            "title": this.state.title,
            "content": this.state.contents,
            "status": 1
        })

        const json = await NetworkCall.Select(url, formBody)
        console.log('_InsertInquiry', json)

        if (json.length > 0) {
            Toast.show({ text1: 'Send Success!' });
            this.props.navigation.goBack()
        }
    }

    render() {
        console.log(this.state.title.length, this.state.contents.length)
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('supportTitle')}</Text>
                    </View>

                    <KeyboardAwareScrollView style={{ marginTop: 15 }} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} >
                        <Text style={{ fontSize: 20, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('supportNewMessage')}</Text>

                        <View style={{ marginTop: 24 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 14, color: Colors.color5B5B5B, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{I18n.t('supportTo') + " : "}</Text>
                                <Text style={{ fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{"Budifycorp@gmail.com"}</Text>
                            </View>
                            <View style={{ height: 1, backgroundColor: 'rgba(156, 159, 161, 0.5)', marginTop: 12 }}></View>
                        </View>

                        <View style={{ marginTop: 0, height: 0, opacity: 0 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 14, color: Colors.color5B5B5B, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{I18n.t('supportFrom') + " : "}</Text>
                                <TextInput onChangeText={(text) => this.setState({ from: text })} style={{ color: Colors.color000000, padding: 0, margin: 0, flex: 1, fontSize: 14, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}></TextInput>
                            </View>
                            <View style={{ height: 1, backgroundColor: 'rgba(156, 159, 161, 0.5)', marginTop: 12, }}></View>
                        </View>

                        <View style={{ marginTop: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 14, color: Colors.color5B5B5B, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}>{I18n.t('supportTitleText') + " : "}</Text>
                                <TextInput onChangeText={(text) => this.setState({ title: text })} style={{ color: Colors.color000000, padding: 0, margin: 0, flex: 1, fontSize: 14, fontFamily: 'Raleway-Regular', includeFontPadding: false, }}></TextInput>
                            </View>
                            <View style={{ height: 1, backgroundColor: 'rgba(156, 159, 161, 0.5)', marginTop: 12 }}></View>
                        </View>

                        <View style={{ borderWidth: 1, borderRadius: 4, height: 300, borderColor: 'rgba(156, 159, 161, 0.5)', marginTop: 26, padding: 12, flexWrap: 'wrap' }}>
                            <TextInput onChangeText={(text) => this.setState({ contents: text })} style={{ color: Colors.color000000, padding: 0, margin: 0, width: '100%', height: '100%', fontSize: 14, fontFamily: 'Raleway-Regular', includeFontPadding: false, textAlignVertical: 'top' }} multiline={true}></TextInput>
                        </View>

                    </KeyboardAwareScrollView>

                    <TouchableOpacity onPress={() => this._InsertInquiry()} disabled={this.state.title == '' || this.state.contents == '' ? true : false}>
                        <View style={{ height: 48, backgroundColor: this.state.title.length > 0 && this.state.contents.length > 0 ? Colors.color2D7DC8 : Colors.colorB7B7B7, marginBottom: 20, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, }}>{I18n.t('supportSend')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView >
        )
    }
}