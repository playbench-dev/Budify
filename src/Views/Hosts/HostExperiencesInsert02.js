import React from 'react';
import { StatusBar, SafeAreaView, View, Text, Image, FlatList, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, Animated, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import { KeyboardAwareScrollView, KeyboardAwareSectionList, KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import * as Utils from '../../Common/Utils'
import User from '../../Common/User';

const TAG = 'HostExperiencesInsert02';
const imgBack = require('../../../assets/ic_back.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgLocation = require('../../../assets/ic_location.png');
const imgRejected = require('../../../assets/ic_rejected.png')

const { width: screenWidth } = Dimensions.get('window');

export default class HostExperiencesInsert02 extends React.Component {
    constructor(props) {
        super(props)
        this.tagTextInput = React.createRef()
    }
    state = {
        selectedLanguageNo: -1,
        selectedCategoryNo: -1,
        selectedLanguageDatas: [],
        tagDatas: [],
        tagText: '',
        editData: '',
    }
    componentDidMount() {
        console.log(this.props.route.params)
        if (this.props.route.params.editData.length != 0) {
            console.log(TAG, this.props.route.params.editData.hashTags)
            this.props.route.params.editData.languages.map((item) => this.state.selectedLanguageDatas.push(item.language_no))
            this.props.route.params.editData.hashTags.map((item) => this.state.tagDatas.push(item.name))
            this.setState({
                selectedCategoryNo: User.category.filter((el) => el.category_no == this.props.route.params.editData.category[0].category_no)[0],
                editData: this.props.route.params.editData,
            })
        }
    }

    _Next() {
        this.props.navigation.navigate('HostExperiencesInsert03', { step1: this.props.route.params, step2: { languages: this.state.selectedLanguageDatas, categories: this.state.selectedCategoryNo, hashtag: this.state.tagDatas.length == 0 ? null : this.state.tagDatas }, editData: this.state.editData })
    }

    _LanguageInsert(item) {
        if (this.state.selectedLanguageDatas.includes(item.language_no)) {
            console.log('1')
            const newList = this.state.selectedLanguageDatas.filter((el) => el !== item.language_no);
            this.setState({ selectedLanguageDatas: newList })
        } else {
            console.log('2')
            this.state.selectedLanguageDatas.push(item.language_no)
            this.setState({})
        }

    }

    _TagView() {
        this.state.tagDatas.push(this.state.tagText.trim())
        this.tagTextInput.clear()
        this.setState({ tagText: '' })
    }

    _TagDelete(text) {
        const newList = this.state.tagDatas.filter((item) => item !== text);
        this.setState({ tagDatas: newList })
    }

    render() {
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <View style={{ paddingLeft: 16, alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                            <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                            </View>
                            <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceInsert01Title')}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={{ marginLeft: 16, marginRight: 16, height: 1, backgroundColor: 'rgba(156, 159, 161, 0.5)', marginTop: 20 }}></View>

                    <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 16 }}>
                        <FlatList enableOnAndroid={true} extraHeight={Platform.OS == 'ios' ? 100 : 65} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
                            ListHeaderComponent={
                                <View>
                                    <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceInsert02LanguageTitle')}</Text>
                                    {User.language.map((item, index) => (
                                        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => this._LanguageInsert(item)}>
                                            <View style={{ borderRadius: 4, height: 48, width: '100%', backgroundColor: this.state.selectedLanguageDatas.includes(item.language_no) ? Colors.colorE9F4FF : Colors.colorFFFFFF, borderWidth: 1, borderColor: this.state.selectedLanguageDatas.includes(item.language_no) ? Colors.color2D7DC8 : Colors.color4D4A4A, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 16, color: this.state.selectedLanguageDatas.includes(item.language_no) ? Colors.color2D7DC8 : Colors.color4D4A4A, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{Utils.Grinder(item)}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}

                                    <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert02CategoryTitle')}</Text>
                                </View>
                            }
                            data={User.category}
                            numColumns={2}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={(obj) => {
                                return (
                                    <TouchableOpacity onPress={() => this.setState({ selectedCategoryNo: User.category.filter((el) => el.category_no == obj.item.category_no)[0] })}>
                                        <View style={{ borderWidth: 1, borderColor: this.state.selectedCategoryNo == User.category.filter((el) => el.category_no == obj.item.category_no)[0] ? Colors.color2D7DC8 : Colors.color4D4A4A, borderRadius: 4, height: 48, width: (screenWidth - 44) / 2, marginLeft: obj.index % 2 == 0 ? 0 : 12, marginTop: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.selectedCategoryNo == User.category.filter((el) => el.category_no == obj.item.category_no)[0] ? Colors.colorE9F4FF : Colors.colorFFFFFF }}>
                                            <Text style={{ color: this.state.selectedCategoryNo == User.category.filter((el) => el.category_no == obj.item.category_no)[0] ? Colors.color2D7DC8 : Colors.color4D4A4A, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{obj.item.ko}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            ListFooterComponent={
                                <View >
                                    <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert02TagTitle')}</Text>
                                    <TextInput ref={input => { this.tagTextInput = input }} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, width: '100%', height: 48, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderBottomColor: Colors.colorD0D0D0, }} onSubmitEditing={() => this._TagView()} placeholder={I18n.t('hostExperienceInsert02TagHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(value) => this.state.tagText = value}>{this.state.tagText}</TextInput>

                                    {this.state.tagDatas.length > 0 && <ScrollView style={{ marginTop: 12, }} horizontal>
                                        {this.state.tagDatas.map((item, index) => (
                                            <View style={{ backgroundColor: Colors.color2D7DC8, borderRadius: 50, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingLeft: 12, paddingRight: 13, paddingTop: 8, paddingBottom: 8, marginLeft: index == 0 ? 0 : 12 }}>
                                                <Text style={{ fontSize: 14, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, }}>{item}</Text>
                                                <TouchableOpacity onPress={() => this._TagDelete(item)}>
                                                    <Image style={{ width: 13, height: 13, resizeMode: 'contain', marginLeft: 8, tintColor: Colors.color000000 }} source={imgRejected}></Image>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>}

                                    <View style={{ marginTop: 38 }}></View>

                                    <TouchableOpacity style={{ width: '100%', height: 48, }} onPress={() => this._Next()} disabled={(this.state.selectedLanguageDatas.length == 0 || this.state.selectedCategoryNo == -1 || this.state.tagDatas.length == 0) ? true : false}>
                                        <View style={{ width: '100%', height: 48, borderRadius: 4, backgroundColor: (this.state.selectedLanguageDatas.length == 0 || this.state.selectedCategoryNo == -1 || this.state.tagDatas.length == 0) ? Colors.colorB7B7B7 : Colors.color2D7DC8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{I18n.t('hostExperienceInsert01Done')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            } ListFooterComponentStyle={{ marginBottom: 80 }}></FlatList>
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}