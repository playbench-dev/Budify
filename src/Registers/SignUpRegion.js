import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, FlatList, Dimensions, ImageBackground } from 'react-native';
import I18n from '../lang/i18n';
import Colors from '../Common/Colos';
import ServerUrl from '../Common/ServerUrl'
import AsyncStorage from '@react-native-community/async-storage';
import FetchingIndicator from 'react-native-fetching-indicator'

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
        isFetching: true,
        nickName: 'Budify',
        countryDatas: [],
        cityDatas: [],
        selectedCountry: -1,
        selectedCity: -1,
        selectedPosition: -1,
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
        type: 0 // 0 - country, 1- city

    }

    componentDidMount() {
        console.log('componentDidMount')
        this._SelectCountry()
    }

    componentDidUpdate(prefProps, prevState) {
        console.log('componentDidUpdate')
    }

    _SelectCountry() {
        var url = "";
        var formBody = '';

        if (this.state.type == 0) {
            url = ServerUrl.SelectCountry
        } else {
            formBody = JSON.stringify({
                'conditions': [{
                    'q': '=',
                    'f': 'country_no',
                    'v': this.state.selectedCountry
                }]
            });
            url = ServerUrl.SelectCity
        }

        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'default',
            body: formBody,
        }).then(
            response => response.json()
        ).then(
            json => {
                console.log(TAG, json);
                if (json.length > 0) {
                    if (this.state.type == 0) {
                        for (let i = 0; i < json.length; i++) {
                            const obj = {
                                country_no: json[i].country_no,
                                en: json[i].en,
                                ko: json[i].ko,
                                ja: json[i].ja,
                                img_path: json[i].img_path
                            }
                            this.state.countryDatas.push(obj)
                        }
                        if (this.state.cityDatas.length == 0) {
                            this.state.type = 1
                            this.state.selectedCountry = 1
                            this._SelectCountry()
                        }
                    } else if (this.state.type == 1) {
                        for (let i = 0; i < json.length; i++) {
                            const obj = {
                                country_no: json[i].country_no,
                                city_no: json[i].city_no,
                                en: json[i].en,
                                ko: json[i].ko,
                                ja: json[i].ja,
                                img_path: json[i].img_path
                            }
                            this.state.cityDatas.push(obj)
                        }
                    }
                } else {

                }
                this.setState({
                    isFetching: false
                })
            })
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

    _MakeCityChild() {
        console.log(this.state.cityDatas.length / 2)
        let result = [];
        for (let i = 0; i < this.state.cityDatas.length / 2; i++) {
            result = result.concat(
                <View key={i} style={{ flexDirection: 'row', marginTop: (i == 0 ? 0 : 16) }}>
                    <TouchableWithoutFeedback onPress={() => this.setState({ selectedCity: this.state.cityDatas[(i * 2)].city_no, selectedPosition: (i * 2) })}>
                        <View style={{ width: ((screenWidth - 46) / 2), height: (((screenWidth - 46) / 2) * 1.1627), alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginLeft: 0, backgroundColor: (this.state.selectedCity == this.state.cityDatas[(i * 2)].city_no ? Colors.color2D7DC8 : Colors.colorFFFFFF) }}>
                            <View style={{ width: ((screenWidth - 46) / 2) - 5, height: (((screenWidth - 46) / 2) * 1.1627) - 4, borderRadius: 4, marginLeft: 0, }}>
                                <Image source={imgRegionBg} style={{ resizeMode: 'stretch', width: '100%', height: '100%' }}></Image>
                                <ImageBackground blurRadius={10} style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', padding: 4, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', }}>
                                    <Text style={{ fontSize: 24, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }} >{this._LangSelectText(this.state.cityDatas[(i * 2)].en, this.state.cityDatas[(i * 2)].ko, this.state.cityDatas[(i * 2)].ja)}</Text>
                                </ImageBackground>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>

                    {this.state.cityDatas.length != ((i * 2) + 1) && (
                        <TouchableWithoutFeedback onPress={() => this.setState({ selectedCity: this.state.cityDatas[(i * 2) + 1].city_no, selectedPosition: (i * 2) + 1 })}>
                            <View style={{ width: (screenWidth - 46) / 2, height: ((screenWidth - 46) / 2) * 1.1627, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginLeft: 14, backgroundColor: (this.state.selectedCity == this.state.cityDatas[(i * 2) + 1].city_no ? Colors.color2D7DC8 : Colors.colorFFFFFF) }}>
                                <View style={{ width: ((screenWidth - 46) / 2) - 5, height: (((screenWidth - 46) / 2) * 1.1627) - 4, borderRadius: 4, marginLeft: 0, }}>
                                    <Image source={imgRegionBg} style={{ resizeMode: 'stretch', width: '100%', height: '100%' }}></Image>
                                    <ImageBackground blurRadius={10} style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', padding: 4, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
                                        <Text style={{ fontSize: 24, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }} >{this._LangSelectText(this.state.cityDatas[(i * 2) + 1].en, this.state.cityDatas[(i * 2) + 1].ko, this.state.cityDatas[(i * 2) + 1].ja)}</Text>
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

    _SignUpDoneClick() {
        AsyncStorage.setItem('firstRegion', JSON.stringify({
            'countryNo': this.state.selectedCountry, 'cityNo': this.state.selectedCity,
            'countryNameKo': this.state.selectedCountry != -1 ? this.state.countryDatas[this.state.selectedCountry - 1].ko : '',
            'countryNameEn': this.state.selectedCountry != -1 ? this.state.countryDatas[this.state.selectedCountry - 1].en : '',
            'countryNameJa': this.state.selectedCountry != -1 ? this.state.countryDatas[this.state.selectedCountry - 1].ja : '',
            'cityNameKo': this.state.selectedCity != -1 ? this.state.cityDatas[this.state.selectedPosition].ko : '',
            'cityNameEn': this.state.selectedCity != -1 ? this.state.cityDatas[this.state.selectedPosition].en : '',
            'cityNameJa': this.state.selectedCity != -1 ? this.state.cityDatas[this.state.selectedPosition].ja : '',
        }));
        this.props.navigation.navigate('Main', {
            countryNo: this.state.selectedCountry, cityNo: this.state.selectedCity,
            countryNameKo: this.state.countryDatas[this.state.selectedCountry - 1].ko,
            countryNameEn: this.state.countryDatas[this.state.selectedCountry - 1].en,
            countryNameJa: this.state.countryDatas[this.state.selectedCountry - 1].ja,
            cityNameKo: this.state.cityDatas[this.state.selectedPosition].ko,
            cityNameEn: this.state.cityDatas[this.state.selectedPosition].en,
            cityNameJa: this.state.cityDatas[this.state.selectedPosition].ja,
        })
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
                        <FlatList style={{ marginTop: 16, height: 124 }} horizontal data={this.state.countryDatas} renderItem={(obj) => {
                            return <TouchableWithoutFeedback onPress={() => this.setState({ selectedCountry: obj.item.country_no, selectedCity: -1, type: 1, cityDatas: [] }, () => this._SelectCountry())}>
                                <View style={{ width: 124, height: 124, borderRadius: 100, marginLeft: (obj.index == 0 ? 0 : 12), }}>
                                    <View style={{ width: '100%', height: '100%', backgroundColor: (this.state.selectedCountry == obj.item.country_no ? Colors.color2D7DC8 : Colors.colorFFFFFF), alignItems: 'center', justifyContent: 'center', borderRadius: 100, }}>
                                        <Image source={imgCountryBg} style={{ width: 120, height: 120, resizeMode: 'contain' }}></Image>
                                        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 120, height: 120, }}>
                                            <Text style={{ fontSize: 24, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }} >{this._LangSelectText(obj.item.en, obj.item.ko, obj.item.ja)}</Text>
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