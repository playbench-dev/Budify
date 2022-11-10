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
import Moment from 'moment'
const TAG = "ManagerTabs";

const imgRightArrow = require('../../assets/ic_arrow_right.png');
const imgCalendarPrevious = require('../../assets/ic_calendar_arrow_left.png');
const imgCalendarNext = require('../../assets/ic_calendar_arrow_right.png');

const { width: screenWidth } = Dimensions.get('window');

export default class ManagerTabs extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {

    }
    componentWillUnmount() {

    }
    componentDidUpdate() {

    }

    state = {
        isLoading: false,
        profileUrl: '',
        nickName: '',
        profileType: 1, //1-basic, 2-host
        profileImagePath: '',
        lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
    }

    render() {
        console.log('rerender')
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    <ScrollView>
                        <View style={{ paddingLeft: 16, justifyContent: 'center', paddingTop: 11, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('managerTitle')}</Text>
                            <View style={{ flex: 1 }}></View>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('EditProfile')}>
                                <Text style={{ fontSize: 14, color: Colors.color000000, fontFamily: 'Raleway-Medium', marginRight: 19, textDecorationLine: 'underline', includeFontPadding: false }}>{I18n.t('profileShowProfile')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 28, marginLeft: 24, marginRight: 25, shadowOpacity: 0.2, padding: 5, }}>
                            <View style={{
                                width: '100%', height: 97, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.colorFFFFFF,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2,
                                borderRadius: 2
                            }}>
                                <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('ContentsManager')}>
                                    <View style={{ height: 48, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('managerContents')}</Text>
                                        <Image style={{ width: 10, height: 17, position: 'absolute', right: 12 }} source={imgRightArrow}></Image>
                                    </View>
                                </TouchableWithoutFeedback>

                                <View style={{ height: 0.5, backgroundColor: Colors.color5B5B5B, width: '100%' }}></View>

                                <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('CurationManager')}>
                                    <View style={{ height: 48, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Medium', }}>{I18n.t('managerCuration')}</Text>
                                        <Image style={{ width: 10, height: 17, position: 'absolute', right: 12 }} source={imgRightArrow}></Image>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>

                        <View style={{ marginTop: 23, width: '100%', height: 8, backgroundColor: Colors.colorF4F4F4 }}></View>

                        <View style={{ marginTop: 16, paddingLeft: 16, paddingRight: 16 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ flex: 1, fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('managerPlatform')}</Text>
                                <TouchableOpacity>
                                    <View style={{ paddingTop: 5, paddingBottom: 5, paddingLeft: 15, paddingRight: 14, backgroundColor: Colors.color2D7DC8, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 10, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false }}>{I18n.t('managerWaiting')}</Text>
                                    </View>
                                </TouchableOpacity>

                            </View>

                            <View style={{ marginTop: 17, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorB7B7B7, paddingTop: 12, paddingLeft: 16, paddingRight: 18, paddingBottom: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <TouchableOpacity style={{ width: 50, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={imgCalendarPrevious} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                                    </TouchableOpacity>

                                    <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{this.state.lang == 'ko' ? Moment().format('M월 YYYY') : Moment().format('MMMM YYYY')}</Text>

                                    <TouchableOpacity style={{ width: 50, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image source={imgCalendarNext} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginTop: 16 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 1 }}></View>
                                            <View >
                                                <View style={{ borderWidth: 1, borderColor: Colors.color000000, borderRadius: 20, paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }} >{I18n.t('managerTransAmount')}</Text>
                                                </View>
                                                <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{"₩" + "150,000"}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}></View>
                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 1 }}></View>
                                            <View >
                                                <View style={{ borderWidth: 1, borderColor: Colors.color000000, borderRadius: 20, paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }} >{I18n.t('managerTotalAmount')}</Text>
                                                </View>
                                                <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{"₩" + "50,000"}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}></View>
                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 1 }}></View>
                                            <View >
                                                <View style={{ borderWidth: 1, borderColor: Colors.color000000, borderRadius: 20, paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }} >{I18n.t('managerNewUser')}</Text>
                                                </View>
                                                <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{"200" + "명"}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}></View>
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', marginTop: 16 }}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 1 }}></View>
                                            <View >
                                                <View style={{ borderWidth: 1, borderColor: Colors.color000000, borderRadius: 20, paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }} >{I18n.t('managerTransNum')}</Text>
                                                </View>
                                                <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{"350" + "건"}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}></View>
                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 1 }}></View>
                                            <View >
                                                <View style={{ borderWidth: 1, borderColor: Colors.color000000, borderRadius: 20, paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }} >{I18n.t('managerCreateNum')}</Text>
                                                </View>
                                                <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{"700" + "건"}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}></View>
                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 1 }}></View>
                                            <View >
                                                <View style={{ borderWidth: 1, borderColor: Colors.color000000, borderRadius: 20, paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }} >{I18n.t('managerGrade')}</Text>
                                                </View>
                                                <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{"4.9"}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}></View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={{ marginTop: 17, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorB7B7B7, paddingTop: 12, paddingLeft: 16, paddingRight: 18, paddingBottom: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                                    <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('managerAccumulate')}</Text>

                                </View>

                                <View style={{ marginTop: 16 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 1 }}></View>
                                            <View >
                                                <View style={{ borderWidth: 1, borderColor: Colors.color000000, borderRadius: 20, paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }} >{I18n.t('managerAccumulateUser')}</Text>
                                                </View>
                                                <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{"1,400" + "명"}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}></View>
                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 1 }}></View>
                                            <View >
                                                <View style={{ borderWidth: 1, borderColor: Colors.color000000, borderRadius: 20, paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }} >{I18n.t('managerAccumulateNum')}</Text>
                                                </View>
                                                <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{"1,000" + "건"}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}></View>
                                        </View>

                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 1 }}></View>
                                            <View>
                                                <View style={{ borderWidth: 1, borderColor: Colors.color000000, borderRadius: 20, paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 10, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false }} >{I18n.t('managerAccumulateAmount')}</Text>
                                                </View>
                                                <View style={{ marginTop: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16, color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{"₩" + "2,150,000"}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}></View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity>
                                <View style={{ marginTop: 20, backgroundColor: Colors.color2D7DC8, borderRadius: 4, alignItems: 'center', justifyContent: 'center', height: 48 }}>
                                    <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('managerDataDetail')}</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }
}