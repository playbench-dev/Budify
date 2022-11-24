import React from 'react'
import { SafeAreaView, View, Text, Image, TouchableOpacity, BackHandler } from 'react-native'
import I18n from './lang/i18n';
import Colors from './Common/Colos';

export default class TravelInvite extends React.Component {
    constructor(props) {
        super(props)
        this.backAction = this.backAction.bind(this);
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    }

    backAction() {
        // this.setState({ saveDialog: true, })
        return true;
    };

    _TranslateContents() {
        if (I18n.currentLocale() == 'en-US') {
            return `You have been invited to ${'name'}'s '${'travel'}'`
        } else if (I18n.currentLocale() == 'ko-KR') {
            return `${'name'}님의 '${'travel'}'에 초대 되었어요!`
        } else {
            return `${'name'}さんの「${'travel'}」へ招待されました！`
        }
    }

    render() {
        return (
            <SafeAreaView >
                <View style={{ width: '100%', height: '100%', }}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ width: '90%', height: 211, backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16, marginTop: 14 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t('homeInvitation')}</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{this._TranslateContents()}</Text>
                            </View>
                            <View style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 19, flexDirection: 'row' }}>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.props.navigation.goBack()}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.color2D7DC8, borderRadius: 4, width: '100%', height: 48 }}>
                                        <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('homeAccept')}</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flex: 1, marginLeft: 12 }} onPress={() => this.props.navigation.goBack()}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', borderColor: Colors.color2D7DC8, borderRadius: 4, borderWidth: 1, width: '100%', height: 48 }}>
                                        <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color2D7DC8 }}>{I18n.t('homeDecline')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}
