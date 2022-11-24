import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, TouchableOpacity, Animated, Linking, Share, Platform } from 'react-native'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import FastImage from 'react-native-fast-image'
import RNStoryShare from "react-native-story-share";
import ViewShot, { captureScreen, captureRef } from "react-native-view-shot";
import ServerUrl from '../../Common/ServerUrl'

const imgBack = require('../../../assets/ic_back.png');
const imgLogo = require('../../../assets/ic_shared_logo.png');

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default class InstagramShared extends React.Component {
    constructor(props) {
        super(props)
        this.captureView = React.createRef()
    }

    state = {

    }

    componentDidMount() {

    }

    _Shared() {
        if (Platform.OS == 'ios') {
            this.captureView.capture().then(uri => {
                console.log('AA', uri)
                RNStoryShare.shareToInstagram({
                    type: RNStoryShare.FILE, // or RNStoryShare.FILE
                    attributionLink: this.props.route.params.shortLink,
                    // backgroundAsset: uri,
                    stickerAsset: uri,
                    backgroundBottomColor: '#ffffff',
                    backgroundTopColor: '#ffffff',
                });

                // let shareOptions = {
                //     title: 'aatitle',
                //     message: 'aamessage',
                //     url: uri,
                //     subject: 'bbsubject',
                //     social: ShareLib.Social.INSTAGRAM,
                //     type: 'image/*'  // required for sharing to INSTAGRAM
                // };
                // ShareLib.shareSingle(shareOptions)
            })
            // Linking.canOpenURL('instagram://').then((val) => val == true && ).catch((e) => console.log('e', e))
        } else {
            this.captureView.capture().then(uri => {
                console.log('AA', uri)
                RNStoryShare.shareToInstagram({
                    type: RNStoryShare.FILE, // or RNStoryShare.BASE64
                    attributionLink: this.props.route.params.shortLink,
                    // backgroundAsset: uri,
                    stickerAsset: uri,
                    backgroundBottomColor: '#ffffff',
                    backgroundTopColor: '#ffffff',
                });
            })
        }
        // this.props.navigation.goBack()
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ backgroundColor: Colors.colorFFFFFF, width: '100%', height: '100%' }}>

                    <View style={{ position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <ViewShot style={{ width: '100%', height: '100%', }} ref={(ref) => this.captureView = ref} options={{ fileName: "Your-File-Name", format: "png", quality: 1 }}>
                            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', marginTop: -20, }}>
                                <Image source={imgLogo} style={{ width: 60, height: 20, resizeMode: 'contain' }}></Image>
                                <FastImage style={{ width: screenWidth * 0.512, height: screenWidth * 0.717, resizeMode: 'cover', borderRadius: 8, marginTop: 18 }} source={{ uri: ServerUrl.Server + this.props.route.params.repPath, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                <Text style={{ width: screenWidth * 0.512, marginTop: 18, fontSize: 14, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }} numberOfLines={2} ellipsizeMode="tail">{this.props.route.params.title}</Text>
                                <Text style={{ width: screenWidth * 0.512, marginTop: 8, fontSize: 10, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} >{this.props.route.params.category + "・" + this.props.route.params.city}</Text>
                                <Text style={{ width: screenWidth * 0.512, marginTop: 8, fontSize: 12, fontFamily: 'Raleway-Regular', includeFontPadding: false, color: Colors.color000000 }} numberOfLines={3} ellipsizeMode="tail">{this.props.route.params.contents}</Text>
                            </View>
                        </ViewShot>
                    </View>

                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{ }</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}></View>

                    <TouchableOpacity style={{ bottom: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 16, marginRight: 16 }} onPress={() => this._Shared()}>
                        <View style={{ backgroundColor: Colors.color289FAF, width: '100%', height: 48, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('shareOnInstagram')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
}