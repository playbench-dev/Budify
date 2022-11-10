import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, Button, TouchableOpacity } from 'react-native'
import SelectDialog from '../Common/SelectDialog'
import Colors from '../Common/Colos'
import I18n from '../lang/i18n';
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import { getProfileData } from 'react-native-calendars/src/Profiler';
import AsyncStorage from '@react-native-community/async-storage';
import ServerUrl from '../Common/ServerUrl'

const TAG = "ProfileTabs";
const imgPlus = require('../../assets/ic_plus.png');
const imgRegionBg = require('../../assets/img_region_bg.png');
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
const imgNotification = require('../../assets/ic_notification.png');
const imgAccount = require('../../assets/account_circle.png')

const { width: screenWidth } = Dimensions.get('window');

export default class ProfileTabs extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // BackHandler.addEventListener("hardwareBackPress", this.backAction);
        AsyncStorage.getItem('userInfo', (err, result) => {
            if (result != null) {
                const UserInfo = JSON.parse(result);
                console.log(TAG, UserInfo);
                this.setState({
                    nickName: UserInfo.nickname,
                    profileUrl: UserInfo.profileUrl,
                    level: UserInfo.level,
                })
            } else {

            }
        });
    }
    componentWillUnmount() {
        // BackHandler.removeEventListener('hardwareBackPress', this.backAction);
        console.log(TAG, 'componentWillUnmount')
    }
    componentDidUpdate() {
        console.log(TAG, 'componentDidUpdate')

    }

    state = {
        isLoading: false,
        profileUrl: '',
        nickName: '',
        profileType: 1, //1-basic, 2-host
        tabType: 1, //1-reserve, 2-history
    }

    render() {
        console.log('rerender')
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    <ScrollView>
                        <View>
                            <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                                <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('AlarmList')} disabled={true}>
                                    <View style={{ flexDirection: 'row', opacity: 0 }}>
                                        <Image style={{ width: 16, height: 20, resizeMode: 'contain' }} source={imgNotification}></Image>
                                        <View style={{ width: 6, height: 6, backgroundColor: Colors.colorE94D3E, borderRadius: 3 }}></View>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={{ flex: 1 }}></View>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('EditProfile')}>
                                    <Text style={{ fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Medium', marginRight: 19, textDecorationLine: 'underline', includeFontPadding: false }}>{I18n.t('profileShowProfile')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ width: 60, height: 60, borderRadius: 50, backgroundColor: Colors.colorF5F5F5, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 10 }}>
                                <Image source={imgAccount} style={{ width: 40, height: 40, }}></Image>
                                <Image style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 200, }} source={(this.state.profileUrl.length > 0 ? { uri: ServerUrl.Server + this.state.profileUrl } : null)}></Image>
                            </View>

                            <View style={{ marginTop: 4, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{this.state.nickName}</Text>
                            </View>

                            <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center', opacity: 1 }}>
                                <View style={{ backgroundColor: this.state.profileType == 1 ? 'rgba(154,206,255,0.5)' : 'rgba(40, 159, 175, 0.3)', flexDirection: 'row', borderRadius: 14, paddingTop: 2, paddingBottom: 2, paddingLeft: 3, paddingRight: 3, }}>
                                    <TouchableOpacity onPress={() => this.setState({ profileType: 1 })}>
                                        <View style={{ paddingTop: 3, paddingBottom: 4, paddingLeft: 11, paddingRight: 11, backgroundColor: (this.state.profileType == 1 ? Colors.colorFFFFFF : 'rgba(154,206,255,0)'), borderRadius: 12 }}>
                                            <Text style={{ fontSize: 12, color: (this.state.profileType == 1 ? Colors.color000000 : Colors.color289FAF), fontFamily: 'Raleway-Regular', includeFontPadding: false }}>{I18n.t('profileTraveler')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.setState({ profileType: 2 })}>
                                        <View style={{ paddingTop: 3, paddingBottom: 4, paddingLeft: 11, paddingRight: 11, backgroundColor: (this.state.profileType == 2 ? Colors.colorFFFFFF : 'rgba(154,206,255,0)'), borderRadius: 12 }}>
                                            <Text style={{ fontSize: 12, color: (this.state.profileType == 2 ? Colors.color000000 : Colors.color2D7DC8), fontFamily: 'Raleway-Regular', includeFontPadding: false }}>{I18n.t('profileHost')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ marginTop: 58, marginLeft: 24, marginRight: 25, shadowOpacity: 0.2, padding: 5, }}>
                                <View style={{
                                    width: '100%', height: 97, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorFFFFFF,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2,
                                    borderRadius: 2
                                }}>
                                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate(this.state.profileType == 1 ? 'MyExperiences' : 'HostExperiencesManage')}>
                                        <View style={{ height: 48, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                            <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t(this.state.profileType == 1 ? 'profileMyExperiences' : 'profileAddExperiences')}</Text>
                                            <Image style={{ width: 10, height: 17, position: 'absolute', right: 12 }} source={imgRightArrow}></Image>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <View style={{ height: 0.5, backgroundColor: Colors.color5B5B5B, width: '100%' }}></View>

                                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate(this.state.profileType == 1 ? 'MyCoupons' : 'HostReserveManager')}>
                                        <View style={{ height: 48, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                            <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t(this.state.profileType == 1 ? 'profileMyCoupons' : 'profileReserveExperiences')}</Text>
                                            <Image style={{ width: 10, height: 17, position: 'absolute', right: 12 }} source={imgRightArrow}></Image>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Support')}>
                                <View style={{ marginTop: 9, alignItems: 'flex-end', paddingRight: 27, opacity: 1 }}>
                                    <Text style={{ textDecorationLine: 'underline', color: Colors.color5B5B5B, fontFamily: 'Raleway-Regular', fontSize: 12, includeFontPadding: false }}>{I18n.t('profileSupport')}</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={{ marginTop: 41, paddingLeft: 16, paddingRight: 16, flexDirection: 'row', opacity: 0 }}>
                                <View style={{ position: 'absolute', height: 4, backgroundColor: Colors.colorD9D9D9, width: '100%', bottom: 0, left: 16 }}></View>
                                <TouchableOpacity onPress={() => this.setState({ tabType: 1 })}>
                                    <View style={{ justifyContent: 'flex-end' }}>
                                        <View style={{ paddingLeft: 18, paddingRight: 18, marginBottom: 8 }}>
                                            <Text style={{ color: this.state.tabType == 1 ? Colors.color2D7DC8 : Colors.color5B5B5B, fontFamily: 'Raleway-Bold', fontSize: 15, includeFontPadding: false }}>{I18n.t(this.state.profileType == 1 ? 'profileUpcomingTrips' : 'profileHostRecent')}</Text>
                                        </View>
                                        <View style={{ height: 4, backgroundColor: Colors.color2D7DC8, opacity: this.state.tabType == 1 ? 1 : 0 }}></View>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.setState({ tabType: 2 })}>
                                    <View style={{ justifyContent: 'flex-end' }}>
                                        <View style={{ paddingLeft: 18, paddingRight: 18, marginBottom: 8 }}>
                                            <Text style={{ color: this.state.tabType == 2 ? Colors.color2D7DC8 : Colors.color5B5B5B, fontFamily: 'Raleway-Bold', fontSize: 15, includeFontPadding: false }}>{I18n.t(this.state.profileType == 1 ? 'profilePastTripMemories' : 'profileHostHistory')}</Text>
                                        </View>
                                        <View style={{ height: 4, backgroundColor: Colors.color2D7DC8, opacity: this.state.tabType == 2 ? 1 : 0 }}></View>
                                    </View>
                                </TouchableOpacity>

                                <View style={{ flex: 1 }}></View>

                            </View>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }
}