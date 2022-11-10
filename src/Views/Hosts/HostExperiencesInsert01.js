import React from 'react';
import { SafeAreaView, View, Text, Image, FlatList, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, Animated, TextInput, ScrollView, } from 'react-native'
import SelectDialog from '../../Common/SelectDialog'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import * as Utils from '../../Common/Utils'
import User from '../../Common/User';

const TAG = 'HostExperiencesInsert01';
const imgBack = require('../../../assets/ic_back.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgLocation = require('../../../assets/ic_location.png');

export default class HostExperiencesInsert01 extends React.Component {
    constructor(props) {
        super(props)
    }
    state = {
        type: 0, //1-offline, 2-online, 3-vr/ar
        mapSearchText: '',
        lat: 0,
        lng: 0,
        selectDialogVisible: false,
        selectedDialogType: '1', // 1 - 국가, 2 - 도시, 3 - 지역, 4 - 일정
        selectedCountyPosition: -1,
        selectedCityPosition: -1,
        selectedRegionPosition: -1,
        selectedCountryNo: -1,
        selectedCityNo: -1,
        selectedRegionNo: -1,
        selectedCountry: '',
        selectedCity: '',
        selectedRegion: '',
        addressDetail: '',
        shortLink: '',
        vrarLink: '',
        editData: '',
    }
    componentDidMount() {
        Geocoder.init("AIzaSyCePbzWSXlyg8wUqrB0yvWPOLzq0maVfdI", { language: "ko" });
        if (this.props.route.params != undefined) {
            this.setState({
                type: this.props.route.params.data.type,
                mapSearchText: this.props.route.params.data.address,
                addressDetail: this.props.route.params.data.addressDetail,
                lat: this.props.route.params.data.lat,
                lng: this.props.route.params.data.lng,
                selectedCountryNo: this.props.route.params.data.country,
                selectedCityNo: this.props.route.params.data.city,
                selectedRegionNo: this.props.route.params.data.region,
                selectedCountry: Utils.Grinder(User.country.filter((el) => el.country_no == this.props.route.params.data.country)[0]),
                selectedCity: Utils.Grinder(User.city.filter((el) => el.city_no == this.props.route.params.data.city)[0]),
                selectedRegion: Utils.Grinder(User.region.filter((el) => el.town_no == this.props.route.params.data.region)[0]),
                shortLink: this.props.route.params.data.shortLink,
                vrarLink: this.props.route.params.data.videoLink,
                editData: this.props.route.params.data,
            })
        }
    }

    _MapSearch(value) {
        Geocoder.from(value)
            .then(json => {
                if (json.results.length > 0) {
                    console.log(json.results);
                    var location = json.results[0].geometry.location;
                    this.setState({
                        lat: location.lat,
                        lng: location.lng
                    })
                    console.log(location);
                } else {
                    console.log('location');
                }
            })
            .catch();
    }

    _CallDialog() {
        if (this.state.selectDialogVisible) {
            let datas = [];
            let title = I18n.t('homeCountry');
            let type = this.state.selectedDialogType;

            if (type == '1') {
                title = I18n.t('homeCountry')
                // datas = this.state.countryDatas
                datas = User.country
            }
            else if (type == '2') {
                title = I18n.t('homeCity')
                // datas = this.state.cityDatas
                datas = User.city.filter((value) => value.country_no == this.state.selectedCountryNo)
            }
            else if (type == '3' && this.state.selectedCityNo != -1) {
                console.log(this.state.selectedCityNo)
                title = I18n.t('homeRegion')
                // datas = this.state.regionDatas
                datas = User.region.filter((value) => value.city_no == this.state.selectedCityNo)

            }
            else if (type == '4') {
                title = I18n.t('homeDate')
            }

            if (type == '4' || datas.length > 0) {
                return <SelectDialog title={title} datas={datas} type={type} _markedDates={null} selectedPosition={(type == '1' ? this.state.selectedCountyPosition : (type == '2' ? this.state.selectedCityPosition : this.state.selectedRegionPosition))} markedType={''} marked={null} click={this._ClickDialog} selectedString={(type == '1' ? this.state.selectedCountry : (type == '2' ? this.state.selectedCity : this.state.selectedRegion))} no={(type == '1' ? this.state.selectedCountryNo : (type == '2' ? this.state.selectedCityNo : this.state.selectedRegionNo))}></SelectDialog>
            } else {
                return null;
            }

        } else {
            return null;
        }
    }

    _ClickDialog = value => {
        if (value.type == '3') {
            this.setState({
                selectDialogVisible: false,
                selectedRegion: Utils.Grinder(User.region.filter((el) => el.town_no == value.no)[0]),
                selectedRegionNo: value.no,
                selectedRegionPosition: value.selectedPosition,
                isFetching: true,
                specialExperienceDatas: [],
            })
        } else if (value.type == '2') {
            this.setState({
                selectDialogVisible: false,
                selectedCity: Utils.Grinder(User.city.filter((el) => el.city_no == value.no)[0]),
                selectedRegion: '',
                selectedRegionPosition: -1,
                selectedRegionNo: -1,
                regionDatas: [],
                selectedCityNo: value.no,
                selectedCityPosition: value.selectedPosition,
                isFetching: true,
                specialExperienceDatas: [],
            })
        } else if (value.type == '1') {
            this.setState({
                selectDialogVisible: false,
                selectedCountry: Utils.Grinder(User.country.filter((el) => el.country_no == value.no)[0]),
                selectedCity: '',
                selectedRegion: '',
                selectedCityPosition: -1,
                selectedRegionPosition: -1,
                selectedCityNo: -1,
                selectedRegionNo: -1,
                selectedCountryNo: value.no,
                selectedCountyPosition: value.selectedPosition,
                cityDatas: [],
                regionDatas: [],
                isFetching: true,
                specialExperienceDatas: [],
            })
        } else if (value.type == '5') {
            this.setState({
                selectDialogVisible: false,
            });
        }
    }

    _Next() {
        this.props.navigation.navigate('HostExperiencesInsert02', { type: this.state.type, address: this.state.mapSearchText, addressDetail: this.state.addressDetail, lat: '' + this.state.lat, lng: '' + this.state.lng, country: this.state.selectedCountryNo, city: this.state.selectedCityNo, region: this.state.selectedRegionNo, videoLink: this.state.vrarLink, shortLink: this.state.shortLink, editData: this.state.editData })
        // if (this.state.type == 1) {
        //     if (this.state.mapSearchText.length == 0 || this.state.selectedCountryNo == -1 || this.state.selectedCityNo == -1 || this.state.selectedRegionNo == -1 || this.state.addressDetail.length == 0) {

        //     } else {
        //         //gogo

        //     }
        // } else if (this.state.type == 2) {
        //     if (this.state.selectedCountryNo == -1 || this.state.selectedCityNo == -1 || this.state.selectedRegionNo == -1) {

        //     } else {
        //         //gogo
        //         this.props.navigation.navigate('HostExperiencesInsert02', { type: this.state.type, address: this.state.mapSearchText, addressDetail: this.state.addressDetail, lat: this.state.lat, lng: this.state.lng, country: this.state.selectedCountryNo, city: this.state.selectedCityNo, region: this.state.selectedRegionNo, videoLink: this.state.vrarLink, shortLink: this.state.shortLink })
        //     }
        // } else if (this.state.type == 3) {
        //     if (this.state.selectedCountryNo == -1 || this.state.selectedCityNo == -1 || this.state.selectedRegionNo == -1) {

        //     } else {
        //         //gogo
        //         this.props.navigation.navigate('HostExperiencesInsert02', { type: this.state.type, address: this.state.mapSearchText, addressDetail: this.state.addressDetail, lat: this.state.lat, lng: this.state.lng, country: this.state.selectedCountryNo, city: this.state.selectedCityNo, region: this.state.selectedRegionNo, videoLink: this.state.vrarLink, shortLink: this.state.shortLink })
        //     }
        // }
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    {this._CallDialog()}
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceInsert01Title')}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ marginLeft: 16, marginRight: 16, height: 1, backgroundColor: 'rgba(156, 159, 161, 0.5)', marginTop: 20 }}></View>

                    <ScrollView style={{ marginTop: 16 }} enableOnAndroid={true} extraHeight={Platform.OS == 'ios' ? 110 : 65} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                        <View style={{ paddingLeft: 16, paddingRight: 16 }}>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceInsert01Type')}</Text>
                            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => this.setState({ type: 1, mapSearchText: '', selectedCountyPosition: -1, selectedCountryNo: -1, selectedCountry: '', selectedCityPosition: -1, selectedCityNo: -1, selectedCity: '', selectedRegionPosition: -1, selectedRegionNo: -1, selectedRegion: '', shortLink: '', vrarLink: '', addressDetail: '' })}>
                                <View style={{ borderRadius: 4, height: 48, width: '100%', backgroundColor: this.state.type == 1 ? Colors.colorE9F4FF : Colors.colorFFFFFF, borderWidth: 1, borderColor: this.state.type == 1 ? Colors.color2D7DC8 : Colors.color4D4A4A, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 16, color: this.state.type == 1 ? Colors.color2D7DC8 : Colors.color4D4A4A, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceInsert01Offline')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => this.setState({ type: 2, mapSearchText: '', selectedCountyPosition: -1, selectedCountryNo: -1, selectedCountry: '', selectedCityPosition: -1, selectedCityNo: -1, selectedCity: '', selectedRegionPosition: -1, selectedRegionNo: -1, selectedRegion: '', shortLink: '', vrarLink: '', addressDetail: '' })}>
                                <View style={{ borderRadius: 4, height: 48, width: '100%', backgroundColor: this.state.type == 2 ? Colors.colorE9F4FF : Colors.colorFFFFFF, borderWidth: 1, borderColor: this.state.type == 2 ? Colors.color2D7DC8 : Colors.color4D4A4A, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 16, color: this.state.type == 2 ? Colors.color2D7DC8 : Colors.color4D4A4A, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceInsert01Online')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => this.setState({ type: 3, mapSearchText: '', selectedCountyPosition: -1, selectedCountryNo: -1, selectedCountry: '', selectedCityPosition: -1, selectedCityNo: -1, selectedCity: '', selectedRegionPosition: -1, selectedRegionNo: -1, selectedRegion: '', shortLink: '', vrarLink: '', addressDetail: '' })}>
                                <View style={{ borderRadius: 4, height: 48, width: '100%', backgroundColor: this.state.type == 3 ? Colors.colorE9F4FF : Colors.colorFFFFFF, borderWidth: 1, borderColor: this.state.type == 3 ? Colors.color2D7DC8 : Colors.color4D4A4A, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 16, color: this.state.type == 3 ? Colors.color2D7DC8 : Colors.color4D4A4A, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceInsert01VRAR')}</Text>
                                </View>
                            </TouchableOpacity>

                            {this.state.type == 1 && (
                                <View>
                                    <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert01LocationTitle')}</Text>
                                    <View style={{ alignItems: 'center' }}>
                                        <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                            <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 18 }}>
                                                <Image source={imgLocation} style={{ width: 14, height: 17, resizeMode: 'contain', position: 'absolute', left: 17 }}></Image>
                                                <TextInput style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 25 }} placeholder={I18n.t('hostExperienceInsert01LocationHint')} placeholderTextColor={Colors.colorC4C4C4} onSubmitEditing={() => this._MapSearch(this.state.mapSearchText)} onChangeText={(value) => this.setState({ mapSearchText: value })}>{this.state.mapSearchText}</TextInput>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}

                        </View>

                        {/* Google Map */}
                        {this.state.type == 1 && (
                            <View style={{ width: '100%', height: 200, marginTop: 12 }}>
                                <MapView
                                    style={{
                                        flex: 1,
                                        height: '100%',
                                    }}
                                    provider={PROVIDER_GOOGLE}
                                    initialRegion={{
                                        latitude: this.state.lat == 0 ? 37.564214 : this.state.lat,
                                        longitude: this.state.lng == 0 ? 127.001699 : this.state.lng,
                                        latitudeDelta: 0.00222,
                                        longitudeDelta: 0.00121,
                                    }}
                                    region={{
                                        latitude: this.state.lat == 0 ? 37.564214 : this.state.lat,
                                        longitude: this.state.lng == 0 ? 127.001699 : this.state.lng,
                                        latitudeDelta: 0.00222,
                                        longitudeDelta: 0.00121,
                                    }}
                                    toolbarEnabled={false}>
                                    <Marker
                                        coordinate={{ latitude: this.state.lat, longitude: this.state.lng }}
                                    // title="this is a marker"
                                    // description="this is a marker example"
                                    />
                                </MapView>
                            </View>
                        )}

                        {this.state.type != 0 && (
                            <View style={{ paddingLeft: 16, paddingRight: 16 }}>
                                <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t(this.state.type == 1 ? 'hostExperienceInsert01DetailAddressType1' : 'hostExperienceInsert01DetailAddressType2')}</Text>
                                <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                    <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 1 })}>
                                        <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center', borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0 }}>
                                            <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('homeCountry')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedCountry}</TextInput>
                                            <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                        </View>
                                    </TouchableWithoutFeedback >
                                    <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 2 })}>
                                        <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center', borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, marginLeft: 8 }}>
                                            <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('homeCity')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedCity}</TextInput>
                                            <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: 3, })}>
                                        <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center', borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, marginLeft: 8 }}>
                                            <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('homeRegion')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedRegion}</TextInput>
                                            <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                                {this.state.type == 1 && (
                                    <View style={{ height: 48, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 8, marginTop: 12 }}>
                                        <TextInput style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, }} placeholder={I18n.t('hostExperienceInsert01DetailAddressHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(value) => this.setState({ addressDetail: value })}>{this.state.addressDetail}</TextInput>
                                    </View>
                                )}

                                {(this.state.type == 2 || this.state.type == 3) && (
                                    <View>
                                        <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert01ShortLinkTitle')}</Text>
                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, marginTop: 8 }}>{I18n.t('hostExperienceInsert01ShortLinkInfo')}</Text>
                                        <View style={{ height: 48, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 8, marginTop: 12 }}>
                                            <TextInput style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, }} placeholder={I18n.t('hostExperienceInsert01ShortLinkHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(value) => this.state.shortLink = value}>{this.state.shortLink}</TextInput>
                                        </View>
                                        {this.state.type == 3 && (
                                            <View>
                                                <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert01VRLinkTitle')}</Text>
                                                <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, marginTop: 8 }}>{I18n.t('hostExperienceInsert01VRLinkInfo')}</Text>
                                                <View style={{ height: 48, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 8, marginTop: 12 }}>
                                                    <TextInput style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, }} placeholder={I18n.t('hostExperienceInsert01ShortLinkHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(value) => this.state.vrarLink = value}>{this.state.vrarLink}</TextInput>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                        <View style={{ height: 88 }}></View>
                    </ScrollView>

                    <TouchableOpacity style={{ width: '100%', position: 'absolute', bottom: 20, height: 48, paddingLeft: 16, paddingRight: 16 }} onPress={() => this._Next()} disabled={(this.state.type == 1 && (this.state.mapSearchText.length == 0 || this.state.selectedCountryNo == -1 || this.state.selectedCityNo == -1 || this.state.selectedRegionNo == -1 || this.state.addressDetail.length == 0)) ? true : (this.state.type == 2 || this.state.type == 3) && (this.state.selectedCountryNo == -1 || this.state.selectedCityNo == -1 || this.state.selectedRegionNo == -1) ? true : this.state.type == 0 ? true : false}>
                        <View style={{ width: '100%', height: 48, borderRadius: 4, backgroundColor: (this.state.type == 1 && (this.state.mapSearchText.length == 0 || this.state.selectedCountryNo == -1 || this.state.selectedCityNo == -1 || this.state.selectedRegionNo == -1 || this.state.addressDetail.length == 0)) ? Colors.colorB7B7B7 : (this.state.type == 2 || this.state.type == 3) && (this.state.selectedCountryNo == -1 || this.state.selectedCityNo == -1 || this.state.selectedRegionNo == -1) ? Colors.colorB7B7B7 : this.state.type == 0 ? Colors.colorB7B7B7 : Colors.color2D7DC8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{I18n.t('hostExperienceInsert01Done')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
}