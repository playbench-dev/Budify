import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, FlatList, Dimensions, ImageBackground } from 'react-native';
import I18n from '../lang/i18n';
import Colors from '../Common/Colos';
import ServerUrl from '../Common/ServerUrl'
import AsyncStorage from '@react-native-community/async-storage';
import FetchingIndicator from 'react-native-fetching-indicator'
import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';
import FastImage from 'react-native-fast-image';
import * as Utils from '../Common/Utils'
import User from '../Common/User'

const TAG = "SignUpRegion"
const imgBack = require('../../assets/ic_back.png');
const imgCountryBg = require('../../assets/img_country_bg.png');
const imgRegionBg = require('../../assets/img_region_bg.png');
const imgBlur = require('../../assets/img_blur_bg.png');

const { width: screenWidth } = Dimensions.get('window');
export default class SignUp extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        isFetching: false,
        nickName: 'Budify',
        countryDatas: User.country,
        cityDatas: User.city.filter((el) => el.country_no == 1),
        selectedCountry: 1,
        selectedCity: -1,
        selectedPosition: -1,
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
        type: 0 // 0 - country, 1- city

    }

    componentDidMount() {
        console.log('componentDidMount')
    }

    componentDidUpdate(prefProps, prevState) {
        console.log('componentDidUpdate')
    }

    // _SelectCountry() {
    //     var url = "";
    //     var formBody = '';

    //     if (this.state.type == 0) {
    //         url = ServerUrl.SelectCountry
    //     } else {
    //         formBody = JSON.stringify({
    //             'conditions': [{
    //                 'q': '=',
    //                 'f': 'country_no',
    //                 'v': this.state.selectedCountry
    //             }]
    //         });
    //         url = ServerUrl.SelectCity
    //     }

    //     fetch(url, {
    //         method: 'POST',
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         },
    //         mode: 'cors',
    //         cache: 'default',
    //         body: formBody,
    //     }).then(
    //         response => response.json()
    //     ).then(
    //         json => {
    //             console.log(TAG, json);
    //             if (json.length > 0) {
    //                 if (this.state.type == 0) {
    //                     for (let i = 0; i < json.length; i++) {
    //                         const obj = {
    //                             country_no: json[i].country_no,
    //                             en: json[i].en,
    //                             ko: json[i].ko,
    //                             ja: json[i].ja,
    //                             img_path: json[i].img_path
    //                         }
    //                         this.state.countryDatas.push(obj)
    //                     }
    //                     if (this.state.cityDatas.length == 0) {
    //                         this.state.type = 1
    //                         this.state.selectedCountry = 1
    //                         this._SelectCountry()
    //                     }
    //                 } else if (this.state.type == 1) {
    //                     for (let i = 0; i < json.length; i++) {
    //                         const obj = {
    //                             country_no: json[i].country_no,
    //                             city_no: json[i].city_no,
    //                             en: json[i].en,
    //                             ko: json[i].ko,
    //                             ja: json[i].ja,
    //                             img_path: json[i].img_path
    //                         }
    //                         this.state.cityDatas.push(obj)
    //                     }
    //                 }
    //             } else {

    //             }
    //             this.setState({
    //                 isFetching: false
    //             })
    //         })
    // }

    _LangSelectText(str1, str2, str3) {
        if (this.state.lang == 'ko') {
            return str2
        } else if (this.state.lang == 'ja') {
            return str3
        } else {
            return str1
        }
    }

    // _MakeCityChild() {
    //     console.log(this.state.cityDatas.length / 2)
    //     let result = [];
    //     for (let i = 0; i < this.state.cityDatas.length / 2; i++) {
    //         result = result.concat(
    //             <View key={i} style={{ flexDirection: 'row', marginTop: (i == 0 ? 0 : 16) }}>
    //                 <TouchableWithoutFeedback onPress={() => this.setState({ selectedCity: this.state.cityDatas[(i * 2)].city_no, selectedPosition: (i * 2) })}>
    //                     <View style={{ width: ((screenWidth - 46) / 2), height: (((screenWidth - 46) / 2) * 1.1627), alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginLeft: 0, backgroundColor: (this.state.selectedCity == this.state.cityDatas[(i * 2)].city_no ? Colors.color2D7DC8 : Colors.colorFFFFFF) }}>
    //                         <View style={{ width: ((screenWidth - 46) / 2) - 5, height: (((screenWidth - 46) / 2) * 1.1627) - 4, borderRadius: 4, marginLeft: 0, }}>
    //                             <FastImage style={{ width: '100%', height: '100%', borderRadius: 4 }} source={{ uri: ServerUrl.Server + this.state.cityDatas[(i * 2)].img_path, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
    //                             <ImageBackground blurRadius={10} style={{ position: 'absolute', justifyContent: 'center', width: '100%', padding: 4, bottom: 0, paddingBottom: 8, backgroundColor: 'rgba(0,0,0,0.2)', height: 40, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, paddingLeft: 13, paddingRight: 12 }}>
    //                                 <AutoSizeText style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }} fontSize={14} numberOfLines={1} mode={ResizeTextMode.max_lines}>{Utils.Grinder(this.state.cityDatas[(i * 2)])}</AutoSizeText>
    //                             </ImageBackground>
    //                         </View>
    //                     </View>
    //                 </TouchableWithoutFeedback>

    //                 {this.state.cityDatas.length != ((i * 2) + 1) && (
    //                     <TouchableWithoutFeedback onPress={() => this.setState({ selectedCity: this.state.cityDatas[(i * 2) + 1].city_no, selectedPosition: (i * 2) + 1 })}>
    //                         <View style={{ width: (screenWidth - 46) / 2, height: ((screenWidth - 46) / 2) * 1.1627, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginLeft: 14, backgroundColor: (this.state.selectedCity == this.state.cityDatas[(i * 2) + 1].city_no ? Colors.color2D7DC8 : Colors.colorFFFFFF) }}>
    //                             <View style={{ width: ((screenWidth - 46) / 2) - 5, height: (((screenWidth - 46) / 2) * 1.1627) - 4, borderRadius: 4, marginLeft: 0, }}>
    //                                 <FastImage style={{ width: '100%', height: '100%', borderRadius: 4 }} source={{ uri: ServerUrl.Server + this.state.cityDatas[(i * 2) + 1].img_path, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
    //                                 <ImageBackground blurRadius={10} style={{ position: 'absolute', justifyContent: 'center', width: '100%', padding: 4, bottom: 0, paddingBottom: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: 4, borderBottomRightRadius: 4, height: 40, paddingLeft: 13, paddingRight: 12 }}>
    //                                     <AutoSizeText style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }} fontSize={14} numberOfLines={1} mode={ResizeTextMode.max_lines}>{Utils.Grinder(this.state.cityDatas[(i * 2) + 1])}</AutoSizeText>
    //                                 </ImageBackground>
    //                             </View>
    //                         </View>
    //                     </TouchableWithoutFeedback>
    //                 )}
    //             </View >
    //         )
    //     }
    //     return result
    // }

    _MakeCityChild() {
        let result = [];
        console.log(this.state.cityDatas)
        for (let i = 0; i < this.state.cityDatas.length / 2; i++) {
            result = result.concat(
                <View key={i} style={{ flexDirection: 'row', marginTop: (i == 0 ? 0 : 16) }}>
                    <TouchableWithoutFeedback onPress={() => this.setState({ selectedCity: this.state.cityDatas[(i * 2)].city_no, selectedPosition: (i * 2) })}>
                        <View style={{ width: ((screenWidth - 46) / 2), height: (((screenWidth - 46) / 2) * 1.1627), alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginLeft: 0, backgroundColor: (this.state.selectedCity == this.state.cityDatas[(i * 2)].city_no ? Colors.color2D7DC8 : Colors.colorFFFFFF) }}>
                            <View style={{ width: ((screenWidth - 46) / 2) - 5, height: (((screenWidth - 46) / 2) * 1.1627) - 4, borderRadius: 4, marginLeft: 0, }}>
                                <FastImage style={{ width: '100%', height: '100%', borderRadius: 4, backgroundColor: Colors.colorF4F3F3 }} source={{ uri: ServerUrl.Server + this.state.cityDatas[(i * 2)].img_path, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                <ImageBackground blurRadius={10} imageStyle={{ borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }} style={{ position: 'absolute', justifyContent: 'center', width: '100%', height: 40, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', paddingLeft: 13, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, paddingRight: 12 }}>
                                    <AutoSizeText style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }} fontSize={14} numberOfLines={1} mode={ResizeTextMode.max_lines}>{Utils.Grinder(this.state.cityDatas[(i * 2)])}</AutoSizeText>
                                </ImageBackground>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>

                    {this.state.cityDatas.length != ((i * 2) + 1) && (
                        <TouchableWithoutFeedback onPress={() => this.setState({ selectedCity: this.state.cityDatas[(i * 2) + 1].city_no, selectedPosition: (i * 2) + 1 })}>
                            <View style={{ width: (screenWidth - 46) / 2, height: ((screenWidth - 46) / 2) * 1.1627, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginLeft: 14, backgroundColor: (this.state.selectedCity == this.state.cityDatas[(i * 2) + 1].city_no ? Colors.color2D7DC8 : Colors.colorFFFFFF) }}>
                                <View style={{ width: ((screenWidth - 46) / 2) - 5, height: (((screenWidth - 46) / 2) * 1.1627) - 4, borderRadius: 4, marginLeft: 0, }}>
                                    <FastImage style={{ width: '100%', height: '100%', borderRadius: 4, backgroundColor: Colors.colorF4F3F3 }} removeClippedSubviews={true} source={{ uri: ServerUrl.Server + this.state.cityDatas[(i * 2) + 1].img_path, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal, }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                    <ImageBackground blurRadius={10} imageStyle={{ borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }} style={{ position: 'absolute', justifyContent: 'center', width: '100%', height: 40, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderBottomLeftRadius: 4, borderBottomRightRadius: 4, paddingLeft: 13, paddingRight: 12 }}>
                                        <AutoSizeText style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }} fontSize={14} numberOfLines={1} mode={ResizeTextMode.max_lines}>{Utils.Grinder(this.state.cityDatas[(i * 2) + 1])}</AutoSizeText>
                                    </ImageBackground>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                </View >
            )
        }
        return result
    }

    _SelectCountry(value) {
        console.log(this.state.selectedCountry)
        this.state.cityDatas = User.city.filter((el) => el.country_no == this.state.selectedCountry)
        this.setState({
            selectedCountry: this.state.selectedCountry,
        })
    }

    _SignUpDoneClick() {
        AsyncStorage.setItem('firstRegion', JSON.stringify({
            'countryNo': this.state.selectedCountry,
            'cityNo': this.state.selectedCity,
        }));
        this.props.navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('inforTitle')}</Text>
                    </View>

                    <Text style={{ marginTop: 14, fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{this.state.nickName + ' ' + I18n.t('inforText')}</Text>

                    <ScrollView style={{ marginTop: 36, }}>
                        <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('country')}</Text>
                        <FlatList style={{ marginTop: 16, height: 84 }} horizontal data={this.state.countryDatas} renderItem={(obj) => {
                            return <TouchableWithoutFeedback onPress={() => this.setState({ selectedCountry: obj.item.country_no, selectedCity: -1, type: 1, cityDatas: [] }, () => this._SelectCountry())}>
                                <View style={{ width: 84, height: 84, borderRadius: 100, marginLeft: (obj.index == 0 ? 0 : 12), }}>
                                    <View style={{ width: '100%', height: '100%', backgroundColor: (this.state.selectedCountry == obj.item.country_no ? Colors.color2D7DC8 : Colors.colorFFFFFF), alignItems: 'center', justifyContent: 'center', borderRadius: 100, }}>
                                        <FastImage style={{ width: 80, height: 80, borderRadius: 120 }} source={{ uri: ServerUrl.Server + obj.item.img_path, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, }}>
                                            <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }} >{Utils.Grinder(obj.item)}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>

                        }} keyExtractor={(item, index) => index.toString()}></FlatList>

                        <Text style={{ marginTop: 32, fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginBottom: 16 }}>{I18n.t('city')}</Text>

                        {this._MakeCityChild()}
                        <View style={{ height: 90 }}></View>

                    </ScrollView>

                    <TouchableWithoutFeedback onPress={() => this._SignUpDoneClick()} disabled={this.state.selectedCountry != -1 && this.state.selectedCity != -1 ? false : true}>
                        <View style={{ width: '100%', height: 48, backgroundColor: this.state.selectedCountry != -1 && this.state.selectedCity != -1 ? Colors.color2D7DC8 : Colors.colorBABABA, alignItems: 'center', justifyContent: 'center', borderRadius: 100, position: 'absolute', bottom: 20, left: 16, elevation: 10 }}>
                            <Text style={{ color: Colors.colorFFFFFF, fontSize: 14, marginLeft: 6, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('successBtnText')}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}