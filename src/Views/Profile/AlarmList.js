import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';

const TAG = "AlarmList"
const imgBack = require('../../../assets/ic_back.png');

export default class AlarmList extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {

    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('notification')}</Text>
                    </View>

                    <ScrollView style={{ marginTop: 27 }} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} >

                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }
}