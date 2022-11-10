import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, Animated, TextInput, } from 'react-native'
import SelectDialog from '../../Common/SelectDialog'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import * as Utils from '../../Common/Utils'
import Orientation from 'react-native-orientation'
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-community/async-storage';
import User from '../../Common/User';
import FastImage from 'react-native-fast-image';
import ServerUrl from '../../Common/ServerUrl';
import * as NetworkCall from '../../Common/NetworkCall'
import FetchingIndicator from 'react-native-fetching-indicator'

const TAG = "HostExperiencesManage";
const imgPlus = require('../../../assets/ic_plus.png');
const imgRegionBg = require('../../../assets/img_region_bg.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgCanlendar = require('../../../assets/ic_calendar_icon.png');
const imgRightArrow = require('../../../assets/ic_arrow_right.png');
const imgCircleSaveBg = require('../../../assets/ic_circle_saved.png');
const imgBookmark = require('../../../assets/ic_bookmark.png');
const imgStarOn = require('../../../assets/ic_star.png');
const imgStarOff = require('../../../assets/ic_star_off.png');
const imgCalendarPrevious = require('../../../assets/ic_calendar_arrow_left.png');
const imgCalendarNext = require('../../../assets/ic_calendar_arrow_right.png');
const imgSearch = require('../../../assets/ic_search.png');
const imgBack = require('../../../assets/ic_back.png');
const imgRejected = require('../../../assets/ic_rejected.png')
const imgClose = require('../../../assets/ic_close.png')

const { width: screenWidth } = Dimensions.get('window');

export default class HostExperiencesManage extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this._ExperiencesPlace()
    }

    state = {
        screenWidth: screenWidth,
        deleteDialogVisible: false,
        datas: [],
        offset: 0,
        exNo: -1,
        isFetching: true,
    }

    async _ExperiencesPlace() {
        const url = ServerUrl.SearchMyExperience
        let formBody = {};
        const condition = [
            {
                "q": "=",
                "f": "user_no",
                "v": User.userNo
            }, {
                "op": "AND",
                "q": "order",
                "f": "e_dt",
                "o": "DESC"
            }, {
                "op": "AND",
                "q": "=",
                "f": "status",
                "v": 1
            }, {
                "op": "AND",
                "q": "page",
                "limit": "12",
                "offset": this.state.offset
            },]

        formBody = JSON.stringify({
            "conditions": condition
        })

        const json = await NetworkCall.Select(url, formBody)
        console.log(TAG, json)
        for (let i = 0; i < json.exList.length; i++) {
            console.log(JSON.parse(json.exList[i].representative_file_url).length)
            console.log(json.exList[i].categories)
            const obj = {
                exNo: json.exList[i].ex_no,
                title: json.exList[i].title,
                category: json.exList[i].categories,
                status: json.exList[i].status,
                repImage: JSON.parse(json.exList[i].representative_file_url),
                images: JSON.parse(json.exList[i].image_urls),
                address: json.exList[i].address,
                addressDetail: json.exList[i].address_detail,
                country: json.exList[i].country,
                city: json.exList[i].city,
                region: json.exList[i].town,
                currency: json.exList[i].currency,
                description: json.exList[i].description,
                costDatas: JSON.parse(json.exList[i].description_cost_included),
                bringDatas: JSON.parse(json.exList[i].description_guest_equipments),
                criteria: json.exList[i].description_criteria,
                hashTags: json.exList[i].hashtags,
                languages: json.exList[i].languages,
                lat: json.exList[i].lat,
                lng: json.exList[i].lng,
                min: json.exList[i].min_guest,
                max: json.exList[i].max_guest,
                minutes: json.exList[i].minutes,
                price: json.exList[i].price,
                shortLink: json.exList[i].short_video_link,
                type: json.exList[i].type,
                videoLink: json.exList[i].video_link,
                approval: json.exList[i].approval,
            }
            this.state.datas.push(obj)
        }
        this.setState({
            isFetching: false,
        })
    }

    async _ExperiencesDelete() {
        console.log(this.state.exNo)
        const url = ServerUrl.DeleteExperience
        let formBody = {};
        formBody = JSON.stringify({
            "ex_no": this.state.exNo,
        })
        const json = await NetworkCall.Select(url, formBody)
        console.log(json)
        if (json.length > 0) {
            this.state.datas = [];
            this.state.offset = 0;
            this._ExperiencesPlace()
        } else {
            this.setState({
                isFetching: false,
            })
        }
    }

    _Dialog() {
        return (
            <Modal visible={this.state.deleteDialogVisible} transparent={true}>
                <TouchableWithoutFeedback onPress={() => this.setState({ deleteDialogVisible: false })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '90%', height: 211, backgroundColor: Colors.colorFFFFFF, borderRadius: 8 }}>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <TouchableOpacity style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 14, marginRight: 16 }} onPress={() => this.setState({ deleteDialogVisible: false })}>
                                        <Image source={imgClose} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{I18n.t('hostExperienceDeleteText')}</Text>
                                </View>
                                <View style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 19 }}>
                                    <TouchableOpacity onPress={() => this.setState({ deleteDialogVisible: false, isFetching: true }, () => this._ExperiencesDelete())}>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.color2D7DC8, borderRadius: 4, width: '100%', height: 48 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.colorFFFFFF }}>{I18n.t('hostExperienceDeleteBtn')}</Text>
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
                    {this._Dialog()}
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceTitle')}</Text>
                        </View>
                    </TouchableOpacity>

                    {this.state.datas.length > 0 && (
                        <View style={{ marginTop: 20, paddingLeft: 16 }}>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceMyHistory')}</Text>
                        </View>
                    )}

                    {this.state.datas.length == 0 ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 16, paddingRight: 16 }}>
                            <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false, textAlign: 'center' }}>{I18n.t('hostExperienceNoItem')}</Text>
                            <View style={{ position: 'absolute', bottom: 92, backgroundColor: Colors.color808080, borderRadius: 5, paddingTop: 20, paddingBottom: 20, width: '100%' }}>
                                <Text style={{ fontSize: 14, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, textAlign: 'center' }}>{I18n.t('hostExperienceNoItemInfoTitle')}</Text>
                                <Text style={{ fontSize: 12, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Regular', includeFontPadding: false, textAlign: 'center', marginTop: 20 }}>{I18n.t('hostExperienceNoItemInfoContents')}</Text>
                            </View>
                        </View>
                    ) : (
                        <FlatList keyExtractor={(item, index) => index.toString()} data={this.state.datas} renderItem={(obj) => {
                            return (
                                <TouchableWithoutFeedback>
                                    <View style={{ flexDirection: 'row', paddingLeft: 16, paddingRight: 16, marginTop: 20, alignItems: 'center' }}>
                                        <Image style={{ width: 80, height: 80, resizeMode: 'cover', borderRadius: 40 }} source={{ uri: ServerUrl.Server + obj.item.repImage }}></Image>
                                        <View style={{ marginLeft: 15, flex: 1 }}>
                                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16 }}>{obj.item.title}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, opacity: obj.item.approval == 2 ? 1 : 0 }}>
                                                <Text style={{ color: Colors.color5B5B5B, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, }}>{Utils.Grinder(obj.item.category[0])}</Text>
                                                <Image source={imgRejected} style={{ width: 14, height: 14, resizeMode: 'contain', marginLeft: 32 }}></Image>
                                                <Text style={{ color: Colors.colorE94D3E, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 12, marginLeft: 5 }}>{I18n.t('hostExperienceRejected')}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginTop: 9 }}>
                                                <TouchableOpacity onPress={() => this.props.navigation.navigate('HostExperiencesInsert01', { data: obj.item })}>
                                                    <View style={{ backgroundColor: Colors.color2D7DC8, paddingTop: 5, paddingBottom: 5, paddingLeft: 25, paddingRight: 24, borderRadius: 40 }}>
                                                        <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 10 }} >{I18n.t('hostExperienceEdit')}</Text>
                                                    </View>
                                                </TouchableOpacity>

                                                <TouchableOpacity onPress={() => this.setState({ deleteDialogVisible: true, exNo: obj.item.exNo })}>
                                                    <View style={{ borderColor: Colors.color2D7DC8, borderWidth: 1, paddingTop: 5, paddingBottom: 5, paddingLeft: 25, paddingRight: 24, borderRadius: 40, marginLeft: 4 }}>
                                                        <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 10 }} >{I18n.t('hostExperienceDelete')}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Image style={{ width: 10, height: 17, resizeMode: 'contain', tintColor: Colors.color5B5B5B }} source={imgRightArrow}></Image>
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        }}>
                        </FlatList>
                    )}

                    <View style={{ paddingLeft: 16, paddingRight: 16, position: 'absolute', bottom: 28, width: '100%' }}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('HostExperiencesInsert01')}>
                            <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.color2D7DC8, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Image style={{ width: 16, height: 16, resizeMode: 'contain', tintColor: Colors.color2D7DC8 }} source={imgPlus}></Image>
                                <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginLeft: 9 }}>{I18n.t('hostExperienceCreate')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}