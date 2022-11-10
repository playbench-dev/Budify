import React, { Component } from "react";
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, } from 'react-native'
import I18n from '../lang/i18n'

import Colors from './Colos'
const imgBack = require('../../assets/ic_back.png');

class ImageSelectDialog extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    _click() {

    }

    render() {

        return (
            <Modal transparent={true} visible={true}>
                <TouchableWithoutFeedback onPress={() => this.props.click({ type: 'cancel' })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'flex-end', padding: 20 }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '100%', paddingTop: 15, backgroundColor: '#363739', borderRadius: 8 }}>
                                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 14, color: Colors.color808080, fontFamily: 'Raleway-Regular', includeFontPadding: false }}>{"프로필 설정"}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: Colors.color808080, marginTop: 15 }}></View>
                                <TouchableWithoutFeedback onPress={() => this.props.click({ type: 'camera' })}>
                                    <View style={{ width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{"Camera"}</Text>
                                    </View>
                                </TouchableWithoutFeedback>

                                <View style={{ height: 1, backgroundColor: Colors.color808080, marginTop: 0 }}></View>
                                <TouchableWithoutFeedback onPress={() => this.props.click({ type: 'gallery' })}>
                                    <View style={{ width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{"Gallery"}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback onPress={() => this.props.click({ type: 'cancel' })}>
                            <View style={{ width: '100%', backgroundColor: '#363739', borderRadius: 8, marginTop: 8 }}>
                                <View style={{ width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{"Cancel"}</Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }
}
export default ImageSelectDialog;