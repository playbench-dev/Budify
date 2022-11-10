import React from 'react'
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TextInput, TouchableOpacity, Animated, Platform } from 'react-native'
import FastImage from 'react-native-fast-image'
import ImageViewer from 'react-native-image-zoom-viewer';
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import * as Utils from '../../Common/Utils'
import * as NetworkCall from '../../Common/NetworkCall'
import ServerUrl from '../../Common/ServerUrl'
import User from '../../Common/User';
import FetchingIndicator from 'react-native-fetching-indicator'

const TAG = "ReviewList"
const imgBack = require('../../../assets/ic_back.png');
const imgStarOn = require('../../../assets/ic_star.png');
const imgAccount = require('../../../assets/account_circle.png')

export default class ReviewList extends React.Component {
    constructor(props) {
        super(props)
        this.flatListRef = React.createRef()
    }

    state = {
        reviewDatas: [],
        isFetching: true,
        totalCnt: 0,
        offset: 0,
        firstScroll: true,
        scrollHeight: 24,
        iosDatas: [],
    }

    componentDidMount() {
        this._Reviews()

    }

    _ReviewStar(value) {
        let result = [];
        for (let i = 0; i < value; i++) {
            result = result.concat(
                <Image key={i} source={imgStarOn} style={{ width: 15, height: 15, resizeMode: 'contain' }}></Image>
            )
        }
        return result
    }

    async _Reviews() {
        const url = ServerUrl.SelectReview
        console.log(this.props.route.params.exNo)
        let formBody = JSON.stringify({
            "conditions": [
                {
                    "q": "=",
                    "f": "ex_no",
                    "v": this.props.route.params.exNo
                    // "v": 178
                },
                {
                    "q": "page",
                    "limit": "12",
                    "offset": this.state.offset
                }, {
                    "q": "order",
                    "f": "c_dt",
                    "o": "DESC"
                }
            ]
        })
        const json = await NetworkCall.Select(url, formBody)
        if (json.reviewInfo.length > 0) {
            for (let i = 0; i < json.reviewInfo.length; i++) {
                console.log(json.reviewInfo[i].image_urls)
                const obj = {
                    profilePath: json.reviewInfo[i].userInfo.avatar_url || '',
                    userName: json.reviewInfo[i].userInfo.nickname,
                    startScore: json.reviewInfo[i].rate,
                    contents: json.reviewInfo[i].content,
                    pictureUrl: json.reviewInfo[i].image_urls == null ? [] : JSON.parse(json.reviewInfo[i].image_urls.replace(/'/gi, '')),
                    reviewNo: json.reviewInfo[i].review_no,
                    reviewDate: json.reviewInfo[i].e_dt
                }
                this.state.reviewDatas.push(obj)
                // console.log(this.state.reviewDatas[i].pictureUrl.length)
            }

            this.setState({
                totalCnt: json.total,
                isFetching: false,
                // firstScroll: false,
            })
            console.log(Platform.OS + '------------------------------')
        } else {
            this.setState({
                isFetching: false,
                firstScroll: false,
            })
        }
    }

    scrollItem(event, position) {
        if (this.props.route.params.position != undefined) {

        }

    }

    render() {

        let positionIndex = 0;

        if (this.props.route.params.position != undefined) {
            positionIndex = this.props.route.params.position
        }
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, paddingLeft: 16, paddingRight: 16 }}>
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
                            <View style={{ width: 20, height: 20, alignItems: 'flex-end', }}>
                                <Image source={imgBack} style={{ width: 40, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                        </TouchableWithoutFeedback>
                        <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false }}>{I18n.t('goodsReview') + " (" + this.state.totalCnt + ")"}</Text>
                    </View>

                    <FlatList ref={(ref) => { this.flatListRef = ref; }} keyExtractor={(item, index) => index.toString()} data={this.state.reviewDatas}
                        onEndReached={() => this.state.reviewDatas.length < this.state.totalCnt && this.setState({ isFetching: true, offset: this.state.offset + 12 }, () => this._Reviews())}
                        onEndReachedThreshold={0.5}
                        onScrollToIndexFailed={() => { }}
                        onContentSizeChange={() => {
                            if (this.flatListRef && this.flatListRef.scrollToIndex && this.state.reviewDatas && this.state.reviewDatas.length) {
                                if (this.state.offset == 0) {
                                    this.flatListRef.scrollToIndex({ index: positionIndex });
                                }
                            }
                        }}
                        renderItem={(obj) => {
                            return (
                                <View key={obj.index} onLayout={(event) => this.scrollItem(event, obj.index)} style={{ width: '100%', marginTop: obj.index == 0 ? 24 : 16, marginBottom: obj.index == this.state.reviewDatas.length - 1 ? 20 : 0 }}>
                                    <View style={{ borderRadius: 8, borderWidth: 1, borderColor: Colors.colorB7B9B8, backgroundColor: Colors.colorFFFFFF, padding: 16, }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            {obj.item.profilePath.length == 0 ? <Image source={imgAccount} style={{ width: 52, height: 52, resizeMode: 'cover', borderRadius: 26 }}></Image> : (
                                                <FastImage style={{ width: 52, height: 52, resizeMode: 'cover', borderRadius: 26 }} source={{ uri: ServerUrl.Server + obj.item.profilePath, headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                            )}
                                            <View style={{ justifyContent: 'center', flex: 1, marginLeft: 12 }}>
                                                <Text style={{ fontSize: 20, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000 }}>{obj.item.userName}</Text>
                                                <View style={{ marginTop: 8, flexDirection: 'row' }}>
                                                    {this._ReviewStar(obj.item.starScore)}
                                                </View>
                                                <Text style={{ marginTop: 8, fontSize: 12, fontFamily: 'Raleway-Medium', includeFontPadding: false, color: Colors.color000000 }}>{obj.item.reviewDate}</Text>
                                            </View>
                                        </View>

                                        <View style={{ marginTop: 12 }}>
                                            <Text style={{ fontSize: 12, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, }}>{obj.item.contents}</Text>
                                        </View>

                                        {obj.item.pictureUrl.length > 0 && (
                                            <View style={{ width: '100%' }}>
                                                <View style={{ marginTop: 12, height: 176, width: '100%', }}>
                                                    {obj.item.pictureUrl.length <= 3 ? (
                                                        <View style={{ flexDirection: 'row', flex: 1 }}>
                                                            <View style={{ flex: 1 }}>
                                                                <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: ServerUrl.Server + obj.item.pictureUrl[0], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                            </View>

                                                            {obj.item.pictureUrl.length > 1 && (
                                                                <View style={{ flex: 1, marginLeft: 6 }}>
                                                                    <View style={{ flex: 1 }}>
                                                                        <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: ServerUrl.Server + obj.item.pictureUrl[1], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                    </View>

                                                                    {obj.item.pictureUrl.length > 2 && (
                                                                        <View style={{ flex: 1, marginTop: 6 }}>
                                                                            <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: ServerUrl.Server + obj.item.pictureUrl[2], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            )}
                                                        </View>
                                                    ) : (
                                                        <View style={{ flexDirection: 'row', flex: 1 }}>
                                                            <View style={{ flex: 1, }}>
                                                                <View style={{ flex: 1 }}>
                                                                    <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: ServerUrl.Server + obj.item.pictureUrl[0], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                </View>

                                                                <View style={{ flex: 1 }}>
                                                                    <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, marginTop: 6 }} source={{ uri: ServerUrl.Server + obj.item.pictureUrl[1], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                </View>
                                                            </View>

                                                            <View style={{ flex: 1, marginLeft: 6 }}>
                                                                <View style={{ flex: 1 }}>
                                                                    <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4 }} source={{ uri: ServerUrl.Server + obj.item.pictureUrl[2], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
                                                                </View>

                                                                <View style={{ flex: 1 }}>
                                                                    <FastImage style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 4, marginTop: 6 }} source={{ uri: ServerUrl.Server + obj.item.pictureUrl[3], headers: { Authorization: 'someAuthToken' }, priority: FastImage.priority.normal }} resizeMode={FastImage.resizeMode.cover}></FastImage>
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
                        }}></FlatList>
                    <FetchingIndicator isFetching={this.state.isFetching} message='' color={Colors.color2D7DC8} cancelable={true} />
                </View>
            </SafeAreaView>
        )
    }
}