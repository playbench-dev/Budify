import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, TouchableOpacity, } from 'react-native'
import SelectDialog from '../Common/SelectDialog'
import Colors from '../Common/Colos'
import I18n from '../lang/i18n';
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import * as Utils from '../Common/Utils'
import User from '../Common/User'
import ServerUrl from '../Common/ServerUrl';
import FetchingIndicator from 'react-native-fetching-indicator'
import * as NetworkCall from '../Common/NetworkCall'

const TAG = "SavedTabs";
const imgPlus = require('../../assets/ic_plus.png');
const imgDownArrow = require('../../assets/ic_down_arrow.png');
const imgCanlendar = require('../../assets/ic_calendar_icon.png');
const imgRightArrow = require('../../assets/ic_arrow_right.png');
const imgCircleSaveBg = require('../../assets/ic_circle_saved.png');
const imgBookmark = require('../../assets/ic_bookmark.png');
const imgStarOn = require('../../assets/ic_star.png');
const imgStarOff = require('../../assets/ic_star_off.png');
const imgBack = require('../../assets/ic_back.png');
const imgCalendarPrevious = require('../../assets/ic_calendar_arrow_left.png');
const imgCalendarNext = require('../../assets/ic_calendar_arrow_right.png');
const imgSearch = require('../../assets/ic_search.png');
const imgCountryBg = require('../../assets/img_country_bg.png');
const imgRegionBg = require('../../assets/img_region_bg.png');

const { width: screenWidth } = Dimensions.get('window');

export default class SavedTabs extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        console.log(I18n.currentLocale() + ' ' + I18n.defaultLocale)
        let citys = User.city.filter((el) => el.country_no == 1)
        this.setState({
            cityDatas: [{
                city_no: 0,
                country_no: 1,
                ko: '전체',
                en: 'All',
                ja: ''
            }, ...citys]
        })
    }

    state = {
        countryDatas: User.country,
        cityDatas: [],
        selectedCountry: 1,
        selectedCity: '',
    }

    _MakeCityChild() {
        let result = [];
        for (let i = 0; i < this.state.cityDatas.length / 2; i++) {
            result = result.concat(
                <View key={i} style={{ flexDirection: 'row', marginTop: (i == 0 ? 0 : 16) }}>
                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('SavedSearch', { select: this.state.cityDatas[(i * 2)] })}>
                        {/* <View style={{ width: ((screenWidth - 46) / 2), height: (((screenWidth - 46) / 2) * 1.1627), alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginLeft: 0, backgroundColor: (this.state.selectedCity == this.state.cityDatas[(i * 2)].no ? Colors.color2D7DC8 : Colors.colorFFFFFF) }}> */}
                        <View style={{ width: ((screenWidth - 46) / 2), height: (((screenWidth - 46) / 2) * 1.1627), borderRadius: 4, marginLeft: 0, }}>
                            <Image source={imgRegionBg} style={{ resizeMode: 'stretch', width: '100%', height: '100%' }}></Image>
                            <ImageBackground blurRadius={10} style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: 40, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', }}>
                                <Text style={{ fontSize: 24, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }} >{Utils.Grinder(this.state.cityDatas[(i * 2)])}</Text>
                            </ImageBackground>
                        </View>
                        {/* </View> */}
                    </TouchableWithoutFeedback>

                    {this.state.cityDatas.length != ((i * 2) + 1) && (
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('SavedSearch', { select: this.state.cityDatas[(i * 2) + 1] })}>
                            {/* // <View style={{ width: (screenWidth - 46) / 2, height: ((screenWidth - 46) / 2) * 1.1627, alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginLeft: 14, backgroundColor: (this.state.selectedCity == this.state.cityDatas[(i * 2) + 1].no ? Colors.color2D7DC8 : Colors.colorFFFFFF) }}> */}
                            <View style={{ width: ((screenWidth - 46) / 2), height: (((screenWidth - 46) / 2) * 1.1627), borderRadius: 4, marginLeft: 14, }}>
                                <Image source={imgRegionBg} style={{ resizeMode: 'stretch', width: '100%', height: '100%' }}></Image>
                                <ImageBackground blurRadius={10} style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: '100%', height: 40, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
                                    <Text style={{ fontSize: 24, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }} >{Utils.Grinder(this.state.cityDatas[(i * 2) + 1])}</Text>
                                </ImageBackground>
                            </View>
                            {/* </View> */}
                        </TouchableWithoutFeedback>
                    )}
                </View >
            )
        }
        return result
    }

    _SearchText(value) {
        this.state.countryDatas = [];
        this.setState({
            countryDatas: [],
            cityDatas: []
        })
        if (value == '') {
            let citys = User.city.filter((el) => el.country_no == 1)
            this.setState({
                countryDatas: User.country,
                cityDatas: [{
                    city_no: 0,
                    country_no: 1,
                    ko: '전체',
                    en: 'All',
                    ja: ''
                }, ...citys],
                selectedCountry: 1,
            })
            return;
        }
        if (User.country.find(data => data.ko === value || data.en === value || data.ja === value)) {
            console.log('Find', User.country.find(data => data.ko === value || data.en === value || data.ja === value))
            this.setState({
                countryDatas: User.country.filter(data => data.ko === value || data.en === value || data.ja === value),
                selectedCountry: User.country.filter(data => data.ko === value || data.en === value || data.ja === value)[0].country_no,
                cityDatas: [{
                    city_no: 0,
                    country_no: User.country.filter(data => data.ko === value || data.en === value || data.ja === value)[0].country_no,
                    ko: '전체',
                    en: 'All',
                    ja: ''
                }, ...User.city.filter(data => data.country_no === User.country.filter(data => data.ko === value || data.en === value || data.ja === value)[0].country_no)]
            })
        } else {
            if (User.city.find(data => data.ko === value || data.en === value || data.ja === value)) {
                console.log('Find', User.city.find(data => data.ko === value || data.en === value || data.ja === value))
                this.setState({
                    countryDatas: User.country.filter(data => data.country_no === User.city.filter(data => data.ko === value || data.en === value || data.ja === value)[0].country_no),
                    selectedCountry: User.city.filter(data => data.ko === value || data.en === value || data.ja === value)[0].country_no,
                    cityDatas: User.city.filter(data => data.ko === value || data.en === value || data.ja === value)
                })
            }
        }
    }

    _SelectCountry(value) {
        this.state.cityDatas = [{
            city_no: 0,
            country_no: value,
            ko: '전체',
            en: 'All',
            ja: ''
        }, ...User.city.filter((el) => el.country_no == value)]
        this.setState({
            selectedCountry: value,
        })
    }

    render() {
        console.log(this.state.selectedCountry)
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    <ScrollView>
                        <View style={{ paddingLeft: 16, justifyContent: 'center', paddingTop: 11 }}>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('savedTitle')}</Text>
                        </View>

                        <View style={{ padding: 16, width: '100%' }}>
                            <View style={{ borderRadius: 4, borderWidth: 1, borderColor: Colors.color5B5B5B, height: 40, flexDirection: 'row', alignItems: 'center' }}>
                                <TextInput style={{ flex: 1, fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, paddingLeft: 8 }} ellipsizeMode="tail" placeholder={I18n.t('savedSearch')} placeholderTextColor={Colors.colorB7B7B7} onChangeText={(text) => this._SearchText(text)}></TextInput>
                                <Image source={imgSearch} style={{ width: 15, height: 15, resizeMode: 'contain', marginRight: 8 }}></Image>
                            </View>

                            <Text style={{ marginTop: 20, fontSize: 16, color: Colors.color000000, fontFamily: "Raleway-Bold", includeFontPadding: false }}>{I18n.t('savedByCountry')}</Text>

                            <FlatList style={{ marginTop: 16, height: 128 }} horizontal data={this.state.countryDatas} renderItem={(obj) => {
                                return <TouchableWithoutFeedback onPress={() => this._SelectCountry(obj.item.country_no)}>
                                    <View style={{ width: 128, height: 128, alignItems: 'center', justifyContent: 'center', borderRadius: 78, marginLeft: (obj.index == 0 ? 0 : 12), backgroundColor: this.state.selectedCountry == obj.item.country_no ? Colors.color2D7DC8 : Colors.colorFFFFFF }}>
                                        <View key={obj.index} style={{ width: 124, height: 124, borderRadius: 100, alignItems: 'center', justifyContent: 'center', }}>
                                            <Image source={imgCountryBg} style={{ width: 120, height: 120, resizeMode: 'contain' }}></Image>
                                            <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 120, height: 120, }}>
                                                <Text style={{ fontSize: 24, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, }} >{Utils.Grinder(obj.item)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>

                            }} keyExtractor={(item, index) => index.toString()}></FlatList>

                            <Text style={{ marginTop: 32, fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginBottom: 16 }}>{I18n.t('savedByCity')}</Text>

                            {this._MakeCityChild()}
                            <View style={{ height: 20 }}></View>
                        </View>

                        {/* <View style={{ width: '100%', height: 300, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color2D7DC8, }}>{"Coming Soon"}</Text>
                            <Text style={{ fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, marginTop: 12 }}>{"Budify is coming soon to this area.\nPlease search for another region."}</Text>
                        </View> */}
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }
}