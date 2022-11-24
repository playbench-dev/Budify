import React from 'react'
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, TextInput, TouchableOpacity } from 'react-native'
import I18n from './lang/i18n'
import Colors from './Common/Colos'
import User from './Common/User';

const imgLogo = require('../assets/ic_splash_logo.png');
const TAG = "Loading"
export default class Loading extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {

    }

    componentDidMount() {

    }

    render() {
        User.placeSaved = [];
        User.exSaved = [];
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorFFFFFF }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image style={{ alignItems: 'center', height: 38, resizeMode: 'contain', opacity: this.state.animation }} source={imgLogo}></Image>
                    </View>

                    <View style={{ width: '100%', paddingLeft: 16, paddingRight: 16 }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('Login')}>
                            <View style={{ width: '100%', height: 48, backgroundColor: Colors.colorF8F8F8, alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                                <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('login')}</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('SignUp')}>
                            <View style={{ width: '100%', height: 48, backgroundColor: Colors.color2D7DC8, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginTop: 12 }}>
                                <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('signUp')}</Text>
                            </View>
                        </TouchableWithoutFeedback>

                        <TouchableOpacity onPress={() => {
                            User.guest = true;
                            this.props.navigation.navigate('SignUpRegion')
                        }}>
                            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 24 }}>
                                <Text style={{ fontSize: 12, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, textDecorationLine: 'underline', marginBottom: 58 }}>{I18n.t('guest')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}