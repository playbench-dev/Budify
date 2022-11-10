import React, { Component } from "react";
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, TextInput } from 'react-native'
import I18n from '../lang/i18n'
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import FastImage from 'react-native-fast-image'

import Colors from './Colos'
const imgBack = require('../../assets/ic_back.png');
const imgRadioOn = require('../../assets/ic_radio_on.png');
const imgRadioOff = require('../../assets/ic_radio_off.png');

class MemoDialog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            title: props.title,
            type: props.type,
            contents: props.contents,
            index: props.index,
        }
    }

    _click() {
        this.props.click({ type: this.state.type, contents: this.state.contents, index: this.state.index, })
    }

    render() {
        return (
            <Modal transparent={true} visible={true}>
                {/* <TouchableWithoutFeedback onPress={() => this.props.click({ type: '5' })}> */}
                <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <TouchableWithoutFeedback onPress={() => console.log('')}>
                        <View style={{ width: '100%', padding: 15, backgroundColor: Colors.colorFFFFFF, borderRadius: 8, maxHeight: '80%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <TouchableOpacity style={{ width: 40, height: 30, justifyContent: 'center' }} onPress={() => this.props.click({ type: '5' })}>
                                    <FastImage style={{ width: 16, height: 16, resizeMode: 'contain' }} source={imgBack} resizeMode={FastImage.resizeMode.contain}></FastImage>
                                </TouchableOpacity>
                                <Text style={{ flex: 1, paddingRight: 40, fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{this.state.title}</Text>
                            </View>

                            <View style={{ margin: 5 }}></View>

                            <View style={{ borderWidth: 1, borderRadius: 4, height: 227, borderColor: 'rgba(156, 159, 161, 0.5)', marginTop: 0, padding: 12, flexWrap: 'wrap' }}>
                                <TextInput onChangeText={(text) => this.setState({ contents: text })} style={{ color: Colors.color000000, padding: 0, margin: 0, width: '100%', height: '100%', fontSize: 14, fontFamily: 'Raleway-Regular', includeFontPadding: false, textAlignVertical: 'top' }} multiline={true}>{this.state.contents}</TextInput>
                            </View>

                            <TouchableOpacity onPress={() => this._click()}>
                                <View style={{ width: '100%', height: 48, backgroundColor: Colors.color2D7DC8, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
                                    <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: "Raleway-Bold", includeFontPadding: false }}>{I18n.t('homeDone')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                {/* </TouchableWithoutFeedback> */}
            </Modal>
        )
    }
}
export default MemoDialog;