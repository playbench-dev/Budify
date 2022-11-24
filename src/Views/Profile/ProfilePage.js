import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, LogBox, Animated, TouchableOpacity } from 'react-native'
import SelectDialog from '../../Common/SelectDialog'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'
import * as Utils from '../../Common/Utils'
import ServerUrl from '../../Common/ServerUrl'
import Orientation from 'react-native-orientation'
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-community/async-storage';
import FetchingIndicator from 'react-native-fetching-indicator'
import * as NetworkCall from '../../Common/NetworkCall'
import User from '../../Common/User';
import Moment from 'moment'
import FastImage from 'react-native-fast-image';
import ReadMore from '@fawazahmed/react-native-read-more';
import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';

const TAG = "ProfilePage";
const imgPlus = require('../../../assets/ic_plus.png');
const imgRegionBg = require('../../../assets/img_region_bg.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgCanlendar = require('../../../assets/ic_calendar_icon.png');
const imgRightArrow = require('../../../assets/ic_arrow_right.png');
const imgCircleSaveBg = require('../../../assets/ic_circle_saved.png');
const imgBookmark = require('../../../assets/ic_bookmark.png');
const imgBookmarkBlack = require('../../../assets/ic_bookmark_black.png');
const imgStarOn = require('../../../assets/ic_star.png');
const imgStarOff = require('../../../assets/ic_star_off.png');
const imgBack = require('../../../assets/ic_back.png');
const imgCalendarPrevious = require('../../../assets/ic_calendar_arrow_left.png');
const imgCalendarNext = require('../../../assets/ic_calendar_arrow_right.png');
const imgAccount = require('../../../assets/account_circle.png')

const { width: screenWidth } = Dimensions.get('window');

export default class ProfilePage extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this._NetworkCall()
    }

    state = {
        datas: [],
        isFetching: true,
        reviewDatas: [],
        secondDatas: [],
        totalCnt: 0,
    }

    render() {
        console.log(this.props.route.params.userInfo)
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('profilePageUserTitle')}</Text>
                        </View>
                    </TouchableOpacity>

                    <ScrollView>
                        <View style={{ marginTop: 16, flexDirection: 'row', paddingLeft: 16, paddingRight: 16, alignItems: 'center' }}>
                            {this.props.route.params.userInfo.avatar_url == null ? <Image style={{ width: 60, height: 60, resizeMode: 'cover', borderRadius: 30, }} resizeMethod="resize" source={imgAccount}></Image> : (
                                <FastImage style={{ width: 60, height: 60, resizeMode: 'cover', borderRadius: 30 }} source={{ uri: ServerUrl.Server + this.props.route.params.userInfo.avatar_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                            )}
                            <Text style={{ marginLeft: 16, fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{this.props.route.params.userInfo.nickname}</Text>
                        </View>

                        <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 24 }}>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t(this.props.route.params.userInfo.level == 1 ? 'profilePageUserEx' : 'profilePageUserHosted')}</Text>

                            <ScrollView horizontal={true} style={{ marginTop: 12 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    {this.state.datas.length > 0 ? this.state.datas.map((item, index) => (
                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.push('GoodsDetail', { exNo: item.ex_no })}>
                                            <View style={{ width: 160, borderRadius: 4, marginLeft: index == 0 ? 0 : 8, }}>
                                                <FastImage style={{ width: '100%', height: 160 * 1.3937, borderRadius: 4 }} source={{ uri: item.representative_file_url, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>

                                                <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Raleway-Medium', includeFontPadding: false, }} numberOfLines={2} ellipsizeMode="tail">{item.title}</Text>

                                                <View style={{ width: '55%', flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                                                    {this._MakeStar(item.rate, item.reviewCnt)}
                                                    <View style={{ width: '100%', }}>
                                                        <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{"・" + item.currency + Utils.numberWithCommas(item.price)}</Text>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                                                    <Text style={{ fontSize: 10, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }} numberOfLines={1} ellipsizeMode="tail">{Utils.Grinder(User.category.filter(el => el.category_no == item.category[0])[0]) + "・" + item.town}</Text>
                                                </View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    )) : <View style={{ height: 120 }}></View>}
                                </View>
                            </ScrollView>
                        </View>

                        <View style={{ marginTop: 40, height: 8, backgroundColor: Colors.colorF4F4F4 }}></View>

                        <View style={{ paddingLeft: 16, paddingRight: 16 }}>
                            {this.props.route.params.userInfo.level == 1 ? <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 16 }}>{I18n.t('profilePageUserTrips')}</Text>
                                : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
                                        <View style={{ flexDirection: 'row', flex: 1 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsReview')}</Text>
                                            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color046BCC, marginLeft: 4 }}>{"(" + this.state.totalCnt + ")"}</Text>
                                        </View>
                                        {this.state.secondDatas.length > 0 && <TouchableOpacity onPress={() => this.props.navigation.navigate('ProfilePageReviewList', { userNo: this.props.route.params.userInfo.user_no })}>
                                            <Text style={{ textDecorationLine: 'underline', fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{I18n.t('goodsShowAll2')}</Text>
                                        </TouchableOpacity>}
                                    </View>
                                )
                            }

                            {this.props.route.params.userInfo.level == 1 && this.state.secondDatas.map((item, index) => {
                                return (
                                    <View style={{ height: 80, flexDirection: 'row', marginTop: 12 }}>
                                        <View style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
                                            <FastImage style={{ width: 80, height: 80, borderRadius: 40, resizeMode: 'cover', backgroundColor: Colors.colorB7B7B7 }} source={{ uri: ServerUrl.Server + item.repPath, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal, }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.2)', position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                                                <AutoSizeText style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, textAlign: 'center' }} fontSize={16} numberOfLines={1} mode={ResizeTextMode.max_lines}>{item.repName}</AutoSizeText>
                                            </View>
                                        </View>
                                        <View style={{ justifyContent: 'center', marginLeft: 16, }}>
                                            <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Bold', fontSize: 16, includeFontPadding: false }}>{item.title}</Text>
                                            <Text style={{ color: Colors.color5B5B5B, fontFamily: 'Raleway-Medium', fontSize: 12, includeFontPadding: false, marginTop: 8 }}>{`${Moment(item.startDt).format('YYYY.MM.DD')} ~ ${Moment(item.endDt).format('MM.DD')}`}</Text>
                                        </View>
                                    </View>
                                )
                            })}

                            {this.props.route.params.userInfo.level == 2 && (
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                                    {this.state.secondDatas.map((item, index) => {
                                        return (
                                            <View style={{ marginTop: 16, width: 280, marginLeft: index == 0 ? 0 : 16 }}>
                                                <View style={{ borderRadius: 8, borderWidth: 1, borderColor: Colors.colorB7B9B8, backgroundColor: Colors.colorFFFFFF, padding: 16, }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('ProfilePageReviewList', { userNo: this.props.route.params.userInfo.user_no })}>
                                                            {item.profilePath.length == 0 ? <Image source={imgAccount} style={{ width: 52, height: 52, resizeMode: 'cover', borderRadius: 26 }}></Image> : (
                                                                <FastImage style={{ width: 52, height: 52, resizeMode: 'cover', borderRadius: 26 }} source={{ uri: ServerUrl.Server + item.profilePath, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                            )}
                                                        </TouchableOpacity>

                                                        <View style={{ justifyContent: 'center', flex: 1, marginLeft: 12 }}>
                                                            <Text style={{ fontSize: 14, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{item.userName}</Text>
                                                            <View style={{ marginTop: 5, flexDirection: 'row' }}>
                                                                {this._ReviewStar(item.starScore)}
                                                            </View>
                                                            <Text style={{ marginTop: 5, fontSize: 8, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{Moment(item.reviewDate).format('YYYY.MM.DD HH:mm')}</Text>
                                                        </View>
                                                    </View>

                                                    <View style={{ height: 75, marginTop: 16 }}>
                                                        <ReadMore numberOfLines={4} onSeeMoreBlocked={() => this.props.navigation.navigate('ProfilePageReviewList', { userNo: this.props.route.params.userInfo.user_no, position: index })} seeMoreText={I18n.t('goodsReadMore')} seeMoreStyle={{ textDecorationLine: 'underline', fontSize: 12, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, marginTop: 4, backgroundColor: Colors.colorFFFFFF }}>{item.contents}</ReadMore>
                                                    </View>

                                                    {item.pictureUrl.length > 0 && (
                                                        <View style={{ width: '100%' }}>
                                                            <View style={{ marginTop: 16, height: 176, width: '100%', }}>
                                                                {item.pictureUrl.length <= 3 ? (
                                                                    <View style={{ flexDirection: 'row', flex: 1 }}>
                                                                        <View style={{ flex: 1 }}>
                                                                            <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl[0], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                        </View>

                                                                        {item.pictureUrl.length > 1 && (
                                                                            <View style={{ flex: 1, marginLeft: 6 }}>
                                                                                <View style={{ flex: 1 }}>
                                                                                    <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl[1], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                                </View>

                                                                                {item.pictureUrl.length > 2 && (
                                                                                    <View style={{ flex: 1, marginTop: 6 }}>
                                                                                        <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl[2], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                                    </View>
                                                                                )}
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                ) : (
                                                                    <View style={{ flexDirection: 'row', flex: 1 }}>
                                                                        <View style={{ flex: 1, }}>
                                                                            <View style={{ flex: 1 }}>
                                                                                <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl[0], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                            </View>

                                                                            <View style={{ flex: 1 }}>
                                                                                <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, marginTop: 6 }} source={{ uri: ServerUrl.Server + item.pictureUrl[1], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                            </View>
                                                                        </View>

                                                                        <View style={{ flex: 1, marginLeft: 6 }}>
                                                                            <View style={{ flex: 1 }}>
                                                                                <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, }} source={{ uri: ServerUrl.Server + item.pictureUrl[2], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                            </View>

                                                                            <View style={{ flex: 1 }}>
                                                                                <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, marginTop: 6 }} source={{ uri: ServerUrl.Server + item.pictureUrl[3], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                )}

                                                            </View>
                                                        </View>
                                                    )}
                                                </View>

                                            </View>
                                        )
                                    })}
                                </ScrollView>
                            )}

                        </View>
                        <View style={{ height: 20 }}></View>
                    </ScrollView>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }

    async _NetworkCall() {
        let url = ''
        let formBody = ''

        if (this.props.route.params.userInfo.level == 1) {
            url = ServerUrl.SelectMyExperienceOrder
            formBody = JSON.stringify({
                "conditions": [{
                    "op": "AND",
                    "q": "=",
                    "f": "status",
                    "v": 2
                }, {
                    "op": "AND",
                    "q": "=",
                    "f": "user_no",
                    "v": this.props.route.params.userInfo.user_no,
                }]
            })
        } else {
            url = ServerUrl.SelectExperience
            formBody = JSON.stringify({
                "conditions": [{
                    "op": "AND",
                    "q": "=",
                    "f": "status",
                    "v": 1
                }, {
                    "op": "AND",
                    "q": "=",
                    "f": "user_no",
                    "v": this.props.route.params.userInfo.user_no,
                }]
            })
        }

        const json = await NetworkCall.Select(url, formBody)

        console.log('_NetworkCall', json)
        if (this.props.route.params.userInfo.level == 2) {
            for (let i = 0; i < json.length; i++) {
                let test = [];
                if (json[i].representative_file_url == null || json[i].representative_file_url.length == 0) {
                    test.push('https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013')
                } else {
                    const representativeItem = JSON.parse(json[i].representative_file_url)
                    for (let i = 0; i < representativeItem.length; i++) {
                        test.push(ServerUrl.Server + representativeItem[i])
                        FastImage.preload([{ uri: ServerUrl.Server + representativeItem[i], headers: { Authorization: 'authToken' }, }])
                    }
                }
                let categorySample = [];
                json[i].categories.map((item, index) => categorySample.push(item.category_no))
                const obj = {
                    title: json[i].title,
                    rate: json[i].rate,
                    reviewCnt: json[i].review_cnt,
                    currency: json[i].currency == "USD" ? "$" : json[i].currency == "KRW" ? "₩" : json[i].currency == "EUR" ? "€" : json[i].currency == "JPY" ? "¥" : json[i].currency,
                    price: json[i].price,
                    city: json[i].city,
                    country: json[i].country,
                    town: Utils.Grinder(User.region.filter((el) => el.town_no == json[i].town)[0]),
                    ex_no: json[i].ex_no,
                    representative_file_url: test[0],
                    category: categorySample
                }
                this.state.datas.push(obj)
            }
        } else {
            for (let i = 0; i < json.length; i++) {
                let test = [];
                if (json[i].exInfo.representative_file_url == null || json[i].exInfo.representative_file_url.length == 0) {
                    // test.push('https://t1.daumcdn.net/cfile/tistory/25257E4753D84EE013')
                } else {
                    const representativeItem = JSON.parse(json[i].exInfo.representative_file_url)
                    for (let i = 0; i < representativeItem.length; i++) {
                        test.push(ServerUrl.Server + representativeItem[i])
                        // FastImage.preload([{ uri: ServerUrl.Server + representativeItem[i], headers: { Authorization: 'authToken' }, }])
                    }
                    const obj = {
                        title: json[i].exInfo.title,
                        rate: json[i].exInfo.rate,
                        reviewCnt: json[i].exInfo.review_cnt,
                        currency: json[i].exInfo.currency == "USD" ? "$" : json[i].exInfo.currency == "KRW" ? "₩" : json[i].exInfo.currency == "EUR" ? "€" : json[i].exInfo.currency == "JPY" ? "¥" : json[i].exInfo.currency,
                        price: json[i].exInfo.price,
                        city: json[i].exInfo.city,
                        country: json[i].exInfo.country,
                        town: Utils.Grinder(User.region.filter((el) => el.town_no == json[i].exInfo.town)[0]),
                        ex_no: json[i].exInfo.ex_no,
                        representative_file_url: test[0],
                        category: JSON.parse(json[i].exInfo.categories.replace(/'/gi, ''))
                    }
                    this.state.datas.push(obj)
                }
            }
        }
        console.log(this.state.datas[0].category)
        this._SecondNetworkCall()
    }

    async _SecondNetworkCall() {
        let url = ''
        let formBody = {};
        this.state.secondDatas = [];
        if (this.props.route.params.userInfo.level == 1) {
            url = ServerUrl.SelectTravel
            formBody = JSON.stringify({
                "conditions": [
                    {
                        "q": "=",
                        "f": "user_no",
                        "v": this.props.route.params.userInfo.user_no,
                    }, {
                        "op": "AND",
                        "q": ">=",
                        "f": "end_dt",
                        "v": "\'" + Moment(new Date()).format('YYYY-MM-DD') + "\'"
                    }
                ]
            })
        } else {
            url = ServerUrl.SelectReviewBySellerUserNo
            formBody = JSON.stringify({
                "user_no": this.props.route.params.userInfo.user_no,
            })
        }

        const json = await NetworkCall.Select(url, formBody)
        console.log('aa', json)


        if (this.props.route.params.userInfo.level == 1) {
            if (json.length > 0) {
                for (let i = 0; i < json.length; i++) {
                    const obj = {
                        travelNo: json[i].travel_no,
                        repPath: ((json[i].city_no == -1 || json[i].city_no == 0) == true ? User.country.filter(el => el.country_no == json[i].country_no)[0].img_path : User.city.filter(el => el.city_no == json[i].city_no)[0].img_path),
                        repName: ((json[i].city_no == -1 || json[i].city_no == 0) == true ? Utils.Grinder(User.country.filter(el => el.country_no == json[i].country_no)[0]) : Utils.Grinder(User.city.filter(el => el.city_no == json[i].city_no)[0])),
                        title: json[i].title,
                        startDt: json[i].start_dt,
                        endDt: json[i].end_dt,
                    }
                    this.state.secondDatas.push(obj)
                }
                this.setState({ isFetching: false, isRefreshing: false, })
            } else {
                this.setState({ isFetching: false, isRefreshing: false, })
            }
        } else {
            if (json.reviewInfo.length > 0) {
                for (let i = 0; i < json.reviewInfo.length; i++) {
                    const obj = {
                        profilePath: json.reviewInfo[i].userInfo.avatar_url || '',
                        userName: json.reviewInfo[i].userInfo.nickname,
                        startScore: json.reviewInfo[i].rate,
                        contents: json.reviewInfo[i].content,
                        pictureUrl: json.reviewInfo[i].image_urls == null ? [] : JSON.parse(json.reviewInfo[i].image_urls.replace(/'/gi, '')),
                        reviewNo: json.reviewInfo[i].review_no,
                        reviewDate: json.reviewInfo[i].e_dt
                    }
                    this.state.secondDatas.push(obj)
                }
                this.setState({ isFetching: false, isRefreshing: false, totalCnt: json.total })
            } else {
                this.setState({ isFetching: false, isRefreshing: false, })
            }
        }
    }

    _ReviewStar(value) {
        let result = [];
        for (let i = 0; i < value; i++) {
            result = result.concat(
                <Image key={i} source={imgStarOn} style={{ width: 11, height: 11, resizeMode: 'contain' }}></Image>
            )
        }
        return result
    }

    _MakeStar(value, reviewCnt) {
        let result = [];
        if (reviewCnt == 0) {
            result = result.concat(
                <Text style={{ fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B, }}>{I18n.t('homeNewExperience')}</Text>
            )
        } else {
            for (let i = 0; i < value; i++) {
                result = result.concat(
                    <Image key={i} source={imgStarOn} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                )
            }
            for (let i = 0; i < 5 - value; i++) {
                result = result.concat(
                    <Image key={i + value} source={imgStarOff} style={{ width: 12, height: 12, resizeMode: 'contain' }}></Image>
                )
            }
            result = result.concat(
                <Text style={{ marginLeft: 1, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color5B5B5B }}>{"(" + reviewCnt + ")"}</Text>
            )
        }
        return result
    }
}