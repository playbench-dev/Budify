import React, { Component } from "react";
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity } from 'react-native'
import I18n from '../lang/i18n'
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import FastImage from 'react-native-fast-image'

import Colors from './Colos'
const imgBack = require('../../assets/ic_back.png');
const imgRadioOn = require('../../assets/ic_radio_on.png');
const imgRadioOff = require('../../assets/ic_radio_off.png');

class BasicDialog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            datas: props.datas,
            title: props.title,
            type: props.type,   //1-nation, 2-gender, 3-language,
            selectedPosition: props.selectedPosition,
            lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
            no: props.no,
        }
    }

    _click() {
        if (this.state.selectedPosition != -1) {
            this.props.click({ type: this.state.type, selectedPosition: this.state.selectedPosition, no: this.state.no })
        }
    }

    _LangSelectText(str1, str2, str3) {
        if (this.state.lang == 'ko') {
            return str2
        } else if (this.state.lang == 'ja') {
            return str3
        } else {
            return str1
        }
    }

    render() {
        return (
            <Modal transparent={true} visible={true}>
                <TouchableWithoutFeedback onPress={() => this.props.click({ type: '5' })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '100%', padding: 15, backgroundColor: Colors.colorFFFFFF, borderRadius: 8, maxHeight: '80%' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <TouchableOpacity style={{ width: 40, height: 30, justifyContent: 'center' }} onPress={() => this.props.click({ type: '5' })}>
                                        {/* <Image source={imgBack} ></Image> */}
                                        <FastImage style={{ width: 16, height: 16, resizeMode: 'contain' }} source={imgBack} resizeMode={FastImage.resizeMode.contain}></FastImage>
                                    </TouchableOpacity>
                                    <Text style={{ flex: 1, paddingRight: 40, fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{this.state.title}</Text>
                                </View>

                                <View style={{ margin: 5 }}></View>

                                <FlatList showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} keyExtractor={(item, index) => index.toString()} data={this.state.datas} renderItem={(obj) => {
                                    return (
                                        <View>
                                            {this.state.type == '1' ? (<TouchableOpacity onPress={() => this.setState({ selectedPosition: obj.index, no: obj.item.nation_no })}>
                                                <View key={obj.index} style={{ flexDirection: 'row', height: 50, alignItems: 'center', }}>
                                                    <Text style={{ flex: 1, fontSize: 16, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false }}>{this._LangSelectText(obj.item.en, obj.item.ko, obj.item.ja)}</Text>
                                                    {/* <Image source={this.state.selectedPosition == index ? imgRadioOn : imgRadioOff} style={{ width: 16, height: 16, resizeMode: 'contain' }}></Image> */}
                                                    <FastImage style={{ width: 16, height: 16, resizeMode: 'contain' }} source={this.state.selectedPosition == obj.index ? imgRadioOn : imgRadioOff} resizeMode={FastImage.resizeMode.contain}></FastImage>
                                                </View>
                                            </TouchableOpacity>) : (this.state.type == 2 ? (<TouchableOpacity onPress={() => this.setState({ selectedPosition: obj.index })}>
                                                <View key={obj.index} style={{ flexDirection: 'row', height: 50, alignItems: 'center', }}>
                                                    <Text style={{ flex: 1, fontSize: 16, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false }}>{obj.item}</Text>
                                                    {/* <Image source={this.state.selectedPosition == index ? imgRadioOn : imgRadioOff} style={{ width: 16, height: 16, resizeMode: 'contain' }}></Image> */}
                                                    <FastImage style={{ width: 16, height: 16, resizeMode: 'contain' }} source={this.state.selectedPosition == obj.index ? imgRadioOn : imgRadioOff} resizeMode={FastImage.resizeMode.contain}></FastImage>
                                                </View>
                                            </TouchableOpacity>) : (<TouchableOpacity onPress={() => this.setState({ selectedPosition: obj.index, no: obj.item.no })}>
                                                <View key={obj.index} style={{ flexDirection: 'row', height: 50, alignItems: 'center', }}>
                                                    <Text style={{ flex: 1, fontSize: 16, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false }}>{this._LangSelectText(obj.item.en, obj.item.ko, obj.item.ja)}</Text>
                                                    <FastImage style={{ width: 16, height: 16, resizeMode: 'contain' }} source={this.state.selectedPosition == obj.index ? imgRadioOn : imgRadioOff} resizeMode={FastImage.resizeMode.contain}></FastImage>
                                                </View>
                                            </TouchableOpacity>))}
                                        </View>
                                    )
                                }}></FlatList>

                                <TouchableOpacity onPress={() => this._click()}>
                                    <View style={{ width: '100%', height: 48, backgroundColor: Colors.color2D7DC8, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginTop: 28 }}>
                                        <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: "Raleway-Bold", includeFontPadding: false }}>{I18n.t('homeDone')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }
}
export default BasicDialog;