import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, Animated, TextInput, } from 'react-native'
import SelectDialog from '../../Common/SelectDialog'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import * as Utils from '../../Common/Utils'
import AsyncStorage from '@react-native-community/async-storage';
import User from '../../Common/User';
import FastImage from 'react-native-fast-image';
import ServerUrl from '../../Common/ServerUrl'
import * as NetworkCall from '../../Common/NetworkCall'
import CategoriesDialog from '../../Common/CategoriesDialog'
import CurationCategoriesDialog from '../../Common/CategoriesDialog'
import Moment from 'moment'
import LanguageDialog from '../../Common/LagnuageDialog';
import FetchingIndicator from 'react-native-fetching-indicator'

const TAG = "CurationManager";
const imgPlus = require('../../../assets/ic_plus.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgRightArrow = require('../../../assets/ic_arrow_right.png');
const imgSearch = require('../../../assets/ic_search.png');
const imgBack = require('../../../assets/ic_back.png');
const imgClose = require('../../../assets/ic_close.png')

const { width: screenWidth } = Dimensions.get('window');

export default class CurationManager extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        AsyncStorage.getItem('firstRegion', (err, result) => {
            console.log(result)
            if (result != null) {
                const firstRegion = JSON.parse(result);
                this.setState({
                    selectedCountryNo: firstRegion.countryNo,
                    selectedCityNo: firstRegion.cityNo || -1,
                    selectedRegionNo: firstRegion.regionNo || -1,
                    selectedCountry: Utils.Grinder(User.country.filter((el) => el.country_no == firstRegion.countryNo)[0]),
                    selectedCity: Utils.Grinder(User.city.filter((el) => el.city_no == firstRegion.cityNo)[0]),
                    selectedRegion: Utils.Grinder(User.region.filter((el) => el.town_no == firstRegion.regionNo)[0]),
                })
                this._ContentsPlace()
            }
        })
    }

    state = {
        screenWidth: screenWidth,
        categoryDialogVisible: false,
        categorySelectedTextDatas: [],
        curationCategoryDialogVisible: false,
        curationCategorySelectedTextDatas: [],
        languageSelectedTextDatas: [],
        selectDialogVisible: false,
        selectedPosition: 0,
        selectedConfirmPosition: 0,
        countryDatas: [],
        selectedCountry: '',
        cityDatas: [],
        selectedCity: '',
        regionDatas: [],
        selectedRegion: '',
        multiAvailability: false,
        selectedDate: [],
        _markedDates: [],
        marked: null,
        markedType: 'dot',
        selectedDialogType: '1', // 1 - 국가, 2 - 도시, 3 - 지역, 4 - 일정
        showSelectedScheduleDate: '',
        isLoading: false,
        isFetching: false,
        total: 0,
        offset: 0,
        selectedCountyPosition: -1,
        selectedCityPosition: -1,
        selectedRegionPosition: -1,
        selectedCountryNo: -1,
        selectedCityNo: -1,
        selectedRegionNo: -1,
        datas: [],
        dialogVisible: false,
        deleteNo: -1,
        searchText: '',
    }

    _CallDialog() {
        if (this.state.selectDialogVisible) {
            let datas = [];
            let title = I18n.t('homeCountry');
            let type = this.state.selectedDialogType;

            if (type == '1') {
                title = I18n.t('homeCountry')
                datas = User.country
            }
            else if (type == '2') {
                title = I18n.t('homeCity')
                datas = User.city.filter((value) => value.country_no == this.state.selectedCountryNo)
            }
            else if (type == '3') {
                title = I18n.t('homeRegion')
                datas = User.region.filter((value) => value.city_no == this.state.selectedCityNo)
            }
            else if (type == '4') {
                title = I18n.t('homeDate')
            }

            if (type == '4' || datas.length > 0) {
                return <SelectDialog title={title} datas={datas} type={type} _markedDates={this.state._markedDates} selectedPosition={(type == '1' ? this.state.selectedCountyPosition : (type == '2' ? this.state.selectedCityPosition : this.state.selectedRegionPosition))} markedType={this.state._markedDates.length > 1 ? 'period' : 'dot'} marked={this.state.marked} click={this._ClickDialog} selectedString={(type == '1' ? this.state.selectedCountry : (type == '2' ? this.state.selectedCity : this.state.selectedRegion))} no={(type == '1' ? this.state.selectedCountryNo : (type == '2' ? this.state.selectedCityNo : this.state.selectedRegionNo))}></SelectDialog>
            } else {
                return null;
            }

        } else {
            return null;
        }
    }

    _ClickDialog = value => {

        if (value.type == '4') {
            this.state.marked = value.marked
            this.state._markedDates = value._markedDates
            this.setState({
                selectDialogVisible: false,
                showSelectedScheduleDate: Moment(this.state._markedDates[0]).format('MMMM').substring(0, 3) + ' ' + Moment(this.state._markedDates[0]).format('D') + ' - ' + Moment(this.state._markedDates[this.state._markedDates.length - 1]).format('MMMM').substring(0, 3) + ' ' + Moment(this.state._markedDates[this.state._markedDates.length - 1]).format('D'),
            });
        } else if (value.type == '3') {
            this.setState({
                selectDialogVisible: false,
                selectedRegion: Utils.Grinder(User.region.filter((el) => el.town_no == value.no)[0]),
                selectedRegionNo: value.no,
                selectedRegionPosition: value.selectedPosition,
                offset: 0,
                total: 0,
                datas: [],
            }, () => this._ContentsPlace())
        } else if (value.type == '2') {
            this.regionDatas = [];
            this.setState({
                selectDialogVisible: false,
                selectedCity: Utils.Grinder(User.city.filter((el) => el.city_no == value.no)[0]),
                selectedRegion: '',
                selectedRegionPosition: -1,
                regionDatas: [],
                selectedCityNo: value.no,
                selectedCityPosition: value.selectedPosition,
                offset: 0,
                total: 0,
                datas: [],
            }, () => this._ContentsPlace())
        } else if (value.type == '1') {
            this.cityDatas = [];
            this.setState({
                selectDialogVisible: false,
                selectedCountry: Utils.Grinder(User.country.filter((el) => el.country_no == value.no)[0]),
                selectedCity: '',
                selectedRegion: '',
                selectedCityPosition: -1,
                selectedRegionPosition: -1,
                selectedCountryNo: value.no,
                selectedCountyPosition: value.selectedPosition,
                cityDatas: [],
                regionDatas: [],
                offset: 0,
                total: 0,
                datas: [],
            }, () => this._ContentsPlace())
        } else if (value.type == '5') {
            this.setState({
                selectDialogVisible: false,
            });
        } else if (value.type == '6') {
            this.setState({
                categoryDialogVisible: false,
                categorySelectedTextDatas: value.selectedTextDatas
            });
        } else if (value.type == '7') {
            this.setState({
                categoryDialogVisible: false,
                languageSelectedTextDatas: value.selectedTextDatas
            });
        } else if (value.type == '8') {
            this.setState({
                categoryDialogVisible: false,
                curationCategorySelectedTextDatas: value.selectedTextDatas,
                offset: 0,
                total: 0,
                datas: [],
            }, () => this._ContentsPlace())
        } else if (value.type == '10') {
            this.setState({
                categoryDialogVisible: false,
            });
        }
    }

    _CategoryDialog() {
        if (this.state.categoryDialogVisible) {
            let type = this.state.selectedDialogType;
            if (type == '6') {
                return <CategoriesDialog title={I18n.t('contentsCategories')} datas={User.contentsCategory} type={type} click={this._ClickDialog} selectedTextDatas={this.state.categorySelectedTextDatas} ></CategoriesDialog>
            } else if (type == '7') {
                return <LanguageDialog title={I18n.t('contentsCategories')} datas={User.language} type={type} click={this._ClickDialog} selectedTextDatas={this.state.languageSelectedTextDatas} ></LanguageDialog>
            } else if (type == '8') {
                return <CurationCategoriesDialog title={I18n.t('contentsCategories')} datas={User.contentsCategory} type={type} click={this._ClickDialog} selectedTextDatas={this.state.curationCategorySelectedTextDatas} ></CurationCategoriesDialog>
            }
        }
    }

    async _ContentsPlace() {
        const url = ServerUrl.SearchCurations
        let formBody = {};
        this.state.datas = [];
        let categoriesList = [];
        this.state.curationCategorySelectedTextDatas.map((item, index) => categoriesList.push(item.category_no))
        console.log(categoriesList)
        if (categoriesList.length == 0) {
            formBody = JSON.stringify({
                "keyword": this.state.searchText,
                "conditions": [
                    {
                        "op": "AND",
                        "q": "=",
                        "f": this.state.selectedRegion.length != 0 ? 'town' : this.state.selectedCity.length != 0 ? 'city' : 'country',
                        "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
                    },
                    {
                        "op": "AND",
                        "q": "=",
                        "f": "status",
                        "v": 1
                    }, {
                        "op": "AND",
                        "q": "page",
                        "limit": 12,
                        "offset": this.state.offset
                    }
                ]
            })
        } else {
            formBody = JSON.stringify({
                "keyword": this.state.searchText,
                "categories": categoriesList.length == 0 ? null : categoriesList,
                "conditions": [
                    {
                        "op": "AND",
                        "q": "=",
                        "f": this.state.selectedRegion.length != 0 ? 'town' : this.state.selectedCity.length != 0 ? 'city' : 'country',
                        "v": this.state.selectedRegion.length != 0 ? this.state.selectedRegionNo : this.state.selectedCity.length != 0 ? this.state.selectedCityNo : this.state.selectedCountryNo
                    },
                    {
                        "op": "AND",
                        "q": "=",
                        "f": "status",
                        "v": 1
                    }, {
                        "op": "AND",
                        "q": "page",
                        "limit": 12,
                        "offset": this.state.offset
                    }
                ]
            })
        }

        const json = await NetworkCall.Select(url, formBody)
        console.log(TAG, json)

        for (let i = 0; i < json.list.length; i++) {
            const obj = {
                curationNo: json.list[i].curations_no,
                title: JSON.parse(json.list[i].title),
                town: json.list[i].town,
                city: json.list[i].city,
                country: json.list[i].country,
                category: JSON.parse(json.list[i].categories.replace(/'/gi, '')),
                refImage: JSON.parse(json.list[i].curations_image_representative) != null ? JSON.parse(json.list[i].curations_image_representative) : [],
            }
            this.state.datas.push(obj)
        }
        this.setState({
            isFetching: false,
        })
    }

    async _ContentsDelete(value) {
        const url = ServerUrl.UpdateCurations
        let formBody = {};
        formBody = JSON.stringify({
            "curations_no": value,
            "status": 2,
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log(json)
        if (json.length > 0) {
            this._ContentsPlace()
        } else {
            this.setState({
                isFetching: false,
            })
        }
    }

    parentFunction = value => {
        this.setState({ isFetching: true, datas: [] }, () => this._ContentsPlace())
    }

    _Dialog() {
        return (
            <Modal visible={this.state.dialogVisible} transparent={true}>
                <TouchableWithoutFeedback onPress={() => this.setState({ dialogVisible: false })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '90%', height: 211, backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 14, marginRight: 16 }} onPress={() => this.setState({ dialogVisible: false })}>
                                        <Image source={imgClose} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t('managerContentsRemoveTitle')}</Text>
                                </View>
                                <View style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 19 }}>
                                    <TouchableOpacity onPress={() => this.setState({ dialogVisible: false, isFetching: true, datas: [] }, () => this._ContentsDelete(this.state.deleteNo))}>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.type == 0 ? Colors.color2D7DC8 : Colors.colorE94D3E, borderRadius: 4, width: '100%', height: 48 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('managerContentsRemoveButton')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    {this._CallDialog()}
                    {this._CategoryDialog()}
                    {this._Dialog()}
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('managerCurationTitle')}</Text>
                        </View>
                    </TouchableOpacity>

                    <FlatList ListHeaderComponent={
                        <View style={{ width: '100%', marginTop: 16 }}>
                            <View style={{ width: '100%', padding: 16, backgroundColor: Colors.colorE9F4FF }}>
                                <View style={{ flexDirection: 'row', backgroundColor: Colors.colorFFFFFF, borderWidth: 1, borderColor: Colors.colorBFBFBF, borderRadius: 4, height: 40 }}>
                                    <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: '1' })}>
                                        <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center', }}>
                                            <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('homeCountry')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedCountry}</TextInput>
                                            <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                        </View>
                                    </TouchableWithoutFeedback >
                                    <View style={{ width: 1, backgroundColor: Colors.colorBFBFBF }}></View>
                                    <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: '2' })}>
                                        <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center' }}>
                                            <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} placeholder={I18n.t('homeCity')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedCity}</TextInput>
                                            <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={{ width: 1, backgroundColor: Colors.colorBFBFBF }}></View>
                                    <TouchableWithoutFeedback onPress={() => this.setState({ selectDialogVisible: true, selectedDialogType: '3' })}>
                                        <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center' }}>
                                            <TextInput style={{ fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginRight: 14, padding: 0 }} placeholder={I18n.t('homeRegion')} placeholderTextColor={Colors.colorB7B7B7} editable={false} pointerEvents="none">{this.state.selectedRegion}</TextInput>
                                            <Image source={imgDownArrow} style={{ width: 8, height: 16, resizeMode: 'contain', position: 'absolute', right: 8 }}></Image>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>

                                <View style={{ marginTop: 12, backgroundColor: Colors.colorFFFFFF, borderWidth: 1, borderColor: Colors.colorBFBFBF, borderRadius: 4, height: 40, flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 10 }}>
                                    <TextInput onSubmitEditing={() => this._ContentsPlace()} style={{ flex: 1, fontSize: 12, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false, marginLeft: 0, padding: 0 }} ellipsizeMode="tail" placeholder={I18n.t('savedSearch')} placeholderTextColor={Colors.colorB7B7B7} onChangeText={(text) => this.setState({ searchText: text })}></TextInput>
                                    <Image source={imgSearch} style={{ width: 15, height: 15, resizeMode: 'contain', marginRight: 8 }}></Image>
                                </View>
                            </View>

                            <View style={{ marginTop: 12, marginLeft: 16, marginRight: 16, flexDirection: 'row' }}>
                                <TouchableOpacity style={{ flex: 1, }} onPress={() => this.setState({ categoryDialogVisible: true, selectedDialogType: '8' })}>
                                    <View style={{ flex: 1, borderRadius: 40, borderWidth: 1, borderColor: this.state.curationCategorySelectedTextDatas.length > 0 ? Colors.color046BCC : Colors.colorBABABA, backgroundColor: this.state.curationCategorySelectedTextDatas.length > 0 ? 'rgba(154, 206, 255, 0.22)' : Colors.colorFFFFFF, paddingBottom: 8, paddingTop: 7, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: this.state.curationCategorySelectedTextDatas.length > 0 ? Colors.color2D7DC8 : Colors.color000000, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('contentsCategories') + (this.state.curationCategorySelectedTextDatas.length > 0 ? ' (' + this.state.curationCategorySelectedTextDatas.length + ')' : '')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    } keyExtractor={(item, index) => index.toString()} data={this.state.datas} renderItem={(obj) => {
                        return (
                            <TouchableWithoutFeedback>
                                <View style={{ flexDirection: 'row', paddingLeft: 16, paddingRight: 16, marginTop: 20, alignItems: 'center' }}>
                                    {console.log(obj.item.refImage)}
                                    {/* <FastImage style={{ width: 80, height: 80, resizeMode: 'cover', borderRadius: 40 }} source={{ uri: ServerUrl.Server + obj.item.refImage, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage> */}
                                    <Image style={{ width: 80, height: 80, resizeMode: 'cover', borderRadius: 40 }} source={{ uri: ServerUrl.Server + obj.item.refImage }}></Image>
                                    <View style={{ marginLeft: 15, flex: 1 }}>

                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16 }} numberOfLines={2} ellipsizeMode={"tail"}>{Utils.GrinderContents(obj.item.title)}</Text>

                                        <View style={{ flexDirection: 'row', marginTop: 15 }}>
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('CurationEdit', { parentFunction: this.parentFunction, curationNo: obj.item.curationNo })}>
                                                <View style={{ backgroundColor: Colors.color2D7DC8, paddingTop: 5, paddingBottom: 5, paddingLeft: 25, paddingRight: 24, borderRadius: 40 }}>
                                                    <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 10 }} >{I18n.t('managerEdit')}</Text>
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => this.setState({ dialogVisible: true, deleteNo: obj.item.curationNo })}>
                                                <View style={{ borderColor: Colors.color2D7DC8, borderWidth: 1, paddingTop: 5, paddingBottom: 5, paddingLeft: 25, paddingRight: 24, borderRadius: 40, marginLeft: 4 }}>
                                                    <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 10 }} >{I18n.t('managerDelete')}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <Image style={{ width: 10, height: 17, resizeMode: 'contain', tintColor: Colors.color5B5B5B }} source={imgRightArrow}></Image>
                                </View>
                            </TouchableWithoutFeedback>
                        )
                    }}
                        ListFooterComponent={
                            <View style={{ height: 88 }}></View>
                        }>

                    </FlatList>

                    <View style={{ paddingLeft: 16, paddingRight: 16, position: 'absolute', bottom: 28, width: '100%' }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('CurationInsert', { parentFunction: this.parentFunction })}>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.color2D7DC8, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorFFFFFF }}>
                                <Image style={{ width: 16, height: 16, resizeMode: 'contain', tintColor: Colors.color2D7DC8 }} source={imgPlus}></Image>
                                <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginLeft: 9 }}>{I18n.t('managerCurationAdd')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}