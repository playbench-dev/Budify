import React from 'react';
import { StatusBar, SafeAreaView, View, Text, Image, FlatList, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity, Animated, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import Colors from '../../Common/Colos'
import I18n from '../../lang/i18n';
import { KeyboardAwareScrollView, KeyboardAwareSectionList, KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import * as Utils from '../../Common/Utils'
import User from '../../Common/User';
import BasicDialog from '../../Common/BasicDialog'

const TAG = 'HostExperiencesInsert03';
const imgBack = require('../../../assets/ic_back.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgLocation = require('../../../assets/ic_location.png');
const imgRejected = require('../../../assets/ic_rejected.png')
const imgCheckOn = require('../../../assets/ic_check_on.png')
const imgCheckOff = require('../../../assets/ic_check_off.png')
const imgPlus = require('../../../assets/ic_plus.png');

const { width: screenWidth } = Dimensions.get('window');

export default class HostExperiencesInsert03 extends React.Component {
    constructor(props) {
        super(props)
        this.minRef = React.createRef()
        this.maxRef = React.createRef()
        this.criteria = React.createRef()
    }
    state = {
        name: '',
        descript: '',
        selectedRunningTimePosition: 0,
        selectedRunningTimeNo: 0,
        selectedRunningTime: Utils.Grinder(Utils.RunningTime()[0]),
        runningTime: '',
        selectedCurrencyPosition: 0,
        selectedCurrencyNo: 0,
        selectedCurrency: Utils.Grinder(Utils.Currency()[0]),
        price: '',
        min: '',
        max: '',
        requirement: '',
        costDatas: [{ 'no': 0, 'factor': '', 'description': '' }],
        costFlag: false,
        bringDatas: [{ 'no': 0, 'factor': '', 'description': '' }],
        bringFlag: false,
        basicDialogVisible: false,
        dialogType: -1,
        minAccount: false,
        maxAccount: false,
        degreeCheck: false,
        editData: '',
    }
    componentDidMount() {
        console.log(this.props.route.params)
        if (this.props.route.params.editData.length != 0) {
            if (this.props.route.params.editData.costDatas != null) {
                this.state.costDatas = this.props.route.params.editData.costDatas
            } else {
                this.state.costDatas = [];
                this.state.costFlag = true
            }
            if (this.props.route.params.editData.bringDatas != null) {
                this.state.bringDatas = this.props.route.params.editData.bringDatas
            } else {
                this.state.bringDatas = [];
                this.state.bringFlag = true
            }
            if (this.props.route.params.editData.min != null) {
                this.state.min = this.props.route.params.editData.min
            } else {
                this.state.min = '';
                this.state.minAccount = true
            }
            if (this.props.route.params.editData.max != null) {
                this.state.max = this.props.route.params.editData.max
            } else {
                this.state.max = '';
                this.state.maxAccount = true
            }
            if (this.props.route.params.editData.criteria != null) {
                this.state.requirement = this.props.route.params.editData.criteria
            } else {
                this.state.requirement = '';
                this.state.degreeCheck = true
            }
            this.setState({
                name: this.props.route.params.editData.title,
                descript: this.props.route.params.editData.description,
                selectedRunningTimePosition: this.props.route.params.editData.minutes < 60 ? 0 : (this.props.route.params.editData.minutes > 60 && this.props.route.params.editData.minutes < 1440) ? 1 : 2,
                selectedRunningTimeNo: this.props.route.params.editData.minutes < 60 ? 0 : (this.props.route.params.editData.minutes > 60 && this.props.route.params.editData.minutes < 1440) ? 1 : 2,
                selectedRunningTime: Utils.Grinder(Utils.RunningTime()[this.props.route.params.editData.minutes < 60 ? 0 : (this.props.route.params.editData.minutes > 60 && this.props.route.params.editData.minutes < 1440) ? 1 : 2]),
                runningTime: this.props.route.params.editData.minutes,
                selectedCurrencyPosition: this.props.route.params.editData.currency == 'KRW' ? 0 : this.props.route.params.editData.currency == 'USD' ? 1 : 2,
                selectedCurrencyNo: this.props.route.params.editData.currency == 'KRW' ? 0 : this.props.route.params.editData.currency == 'USD' ? 1 : 2,
                selectedCurrency: Utils.Grinder(Utils.Currency()[this.props.route.params.editData.currency == 'KRW' ? 0 : this.props.route.params.editData.currency == 'USD' ? 1 : 2]),
                price: this.props.route.params.editData.price,
                editData: this.props.route.params.editData,
            })
        }
    }

    _Next() {
        if (this.state.runningTime.length != 0) {
            if (this.state.selectedRunningTimePosition == 0) {

            } else if (this.state.selectedRunningTimePosition == 1) {
                this.state.runningTime = 60 * parseInt(this.state.runningTime)
            } else if (this.state.selectedRunningTimePosition == 2) {
                this.state.runningTime = 24 * 60 * parseInt(this.state.runningTime)
            }
        }
        let currency = this.state.selectedCurrencyNo == 0 ? 'KRW' : this.state.selectedCurrencyNo == 1 ? 'USD' : 'JPY'
        this.props.navigation.navigate('HostExperiencesInsert04', { step1: this.props.route.params.step1, step2: this.props.route.params.step2, step3: { name: this.state.name, descript: this.state.descript, runningTime: this.state.runningTime.length == 0 ? '0' : this.state.runningTime, currency: currency, price: this.state.price, min: this.state.min.length == 0 ? null : this.state.min, max: this.state.max.length == 0 ? null : this.state.max, costDatas: this.state.costDatas, bringDatas: this.state.bringDatas, requirement: this.state.requirement }, editData: this.state.editData })

    }

    _CostInsert() {
        const obj = { 'no': this.state.costDatas.length, 'factor': '', 'description': '' }
        this.state.costDatas.push(obj)
        this.setState({
            costDatas: this.state.costDatas
        })
    }

    _BringInsert() {
        const obj = { 'no': this.state.bringDatas.length, 'factor': '', 'description': '' }
        this.state.bringDatas.push(obj)
        this.setState({
            bringDatas: this.state.bringDatas
        })
    }

    _BasicDialogVisible() {
        if (this.state.basicDialogVisible) {
            if (this.state.dialogType == 11) {
                return <BasicDialog datas={Utils.RunningTime()} type={this.state.dialogType} title={''} selectedPosition={this.state.selectedRunningTimePosition} click={this._BasicDialogClick}></BasicDialog>
            } else if (this.state.dialogType == 12) {
                return <BasicDialog datas={Utils.Currency()} type={this.state.dialogType} title={''} selectedPosition={this.state.selectedCurrencyPosition} click={this._BasicDialogClick}></BasicDialog>
            } else {
                return null
            }
        } else {
            return null
        }
    }

    _BasicDialogClick = value => {
        console.log(value)
        if (value.type == '11') {
            this.setState({
                basicDialogVisible: false,
                selectedRunningTimePosition: value.selectedPosition,
                selectedRunningTimeNo: value.no,
                selectedRunningTime: Utils.Grinder(Utils.RunningTime()[parseInt(value.selectedPosition)]),
                runningTime: ''
            })
        } else if (value.type == '12') {
            this.setState({
                basicDialogVisible: false,
                selectedCurrencyPosition: value.selectedPosition,
                selectedCurrencyNo: value.no,
                selectedCurrency: Utils.Grinder(Utils.Currency()[parseInt(value.selectedPosition)])
            })
        } else {
            this.setState({
                basicDialogVisible: false
            })
        }
    }

    ItemChange = params => {
        if (params.type == 'costFactor') {
            this.setState({
                costDatas: this.state.costDatas.map(
                    item => params.idx === item.no
                        ? { no: item.no, factor: params.value, description: item.description, } // 새 객체를 만들어서 기존의 값과 전달받은 data 을 덮어씀
                        : item // 기존의 값을 그대로 유지
                )
            })
        } else if (params.type == 'costDescript') {
            this.setState({
                costDatas: this.state.costDatas.map(
                    item => params.idx === item.no
                        ? { no: item.no, factor: item.factor, description: params.value, }
                        : item
                )
            })
        } else if (params.type == 'bringFactor') {
            this.setState({
                bringDatas: this.state.bringDatas.map(
                    item => params.idx === item.no
                        ? { no: item.no, factor: params.value, description: item.description, }
                        : item
                )
            })
        } else if (params.type == 'bringDescript') {
            this.setState({
                bringDatas: this.state.bringDatas.map(
                    item => params.idx === item.no
                        ? { no: item.no, factor: item.factor, description: params.value, }
                        : item
                )
            })
        }
    }

    render() {
        console.log(this.state.costDatas)
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, }}>
                    {this._BasicDialogVisible()}
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
                        <ScrollView enableOnAndroid={true} extraHeight={Platform.OS == 'ios' ? 100 : 65}>
                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{I18n.t('hostExperienceInsert03NameText')}</Text>
                            <View style={{ height: 48, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 8, marginTop: 12 }}>
                                <TextInput style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, }} placeholder={I18n.t('hostExperienceInsert03NameHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(value) => this.setState({ name: value })}>{this.state.name}</TextInput>
                            </View>

                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert03Contents')}</Text>
                            <View style={{ height: 152, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 8, marginTop: 12 }}>
                                <TextInput multiline={true} style={{ flex: 1, textAlignVertical: 'top', padding: 0, margin: 8, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, }} placeholder={''} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(value) => this.setState({ descript: value })}>{this.state.descript}</TextInput>
                            </View>

                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert03RunningTime')}</Text>
                            <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                <TouchableOpacity style={{ flex: 0.3, }} onPress={() => this.setState({ dialogType: 11, basicDialogVisible: true })}>
                                    <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 11 }}>{this.state.selectedRunningTime}</Text>
                                        <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 18 }} source={imgDownArrow}></Image>
                                    </View>
                                </TouchableOpacity>

                                <View style={{ flex: 0.7, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderBottomColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: 12, paddingLeft: 4 }}>
                                    <TextInput onChangeText={(text) => { this.setState({ runningTime: text.replace('-', '').replace('.', '') }) }} value={this.state.runningTime} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'} placeholder={""} autoCapitalize="none" returnKeyType="next" placeholderTextColor={Colors.colorC4C4C4}></TextInput>
                                </View>
                            </View>

                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert03Price')}</Text>
                            <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                <TouchableOpacity style={{ flex: 0.3, }} onPress={() => this.setState({ dialogType: 12, basicDialogVisible: true })}>
                                    <View style={{ flex: 1, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, marginLeft: 11 }}>{this.state.selectedCurrency}</Text>
                                        <Image style={{ width: 10, height: 8, resizeMode: 'contain', position: 'absolute', right: 18 }} source={imgDownArrow}></Image>
                                    </View>
                                </TouchableOpacity>

                                <View style={{ flex: 0.7, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderBottomColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: 12, paddingLeft: 4 }}>
                                    <TextInput onChangeText={(text) => { this.setState({ price: text.replace('-', '').replace('.', '') }) }} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'} placeholder={""} autoCapitalize="none" returnKeyType="next" placeholderTextColor={Colors.colorC4C4C4}>{this.state.price}</TextInput>
                                </View>
                            </View>

                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert03ParticleText')}</Text>
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 12, }}>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, height: 48, }}>
                                    <TextInput ref={(ref) => this.minRef = ref} editable={this.state.minAccount == true ? false : true} style={{ width: '100%', height: '100%', padding: 2, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, textAlign: 'center' }} placeholder={I18n.t('hostExperienceInsert03MinHint')} keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(value) => this.state.min = value} >{this.state.min}</TextInput>
                                </View>
                                <Text style={{ marginLeft: 16, marginRight: 16 }}>{"~"}</Text>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 4, borderColor: Colors.colorD0D0D0, borderWidth: 1, height: 48, }}>
                                    <TextInput ref={(ref) => this.maxRef = ref} editable={this.state.maxAccount == true ? false : true} style={{ width: '100%', height: '100%', padding: 2, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, textAlign: 'center' }} placeholder={I18n.t('hostExperienceInsert03MaxHint')} keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(value) => this.state.max = value}>{this.state.max}</TextInput>
                                </View>
                            </View>

                            <View style={{ marginTop: 12, flexDirection: 'row' }}>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ minAccount: this.state.minAccount == false ? true : false, min: '' }, () => this.minRef.clear())}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image source={(this.state.minAccount == false ? imgCheckOff : imgCheckOn)} style={{ width: 15, height: 15, resizeMode: 'contain' }}></Image>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{I18n.t('hostExperienceInsert03None')}</Text>
                                    </View>
                                </TouchableOpacity>
                                <Text style={{ marginLeft: 16, marginRight: 16, opacity: 0 }}>{"~"}</Text>
                                <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ maxAccount: this.state.maxAccount == false ? true : false, max: '' }, () => this.maxRef.clear())}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image source={(this.state.maxAccount == false ? imgCheckOff : imgCheckOn)} style={{ width: 15, height: 15, resizeMode: 'contain' }}></Image>
                                        <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{I18n.t('hostExperienceInsert03None')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert03CostText')}</Text>
                            {this.state.costDatas.map((item, index) => (
                                <View style={{ marginTop: 12 }}>
                                    <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                        <View style={{ flex: 0.3, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                            <TextInput style={{ padding: 0, paddingLeft: 8, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('hostExperienceInsert03CostFactor')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => this.ItemChange({ idx: index, value: text, type: 'costFactor' })}>{item.factor}</TextInput>
                                        </View>

                                        <View style={{ flex: 0.7, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderBottomColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: 12, paddingLeft: 4 }}>
                                            <TextInput style={{ padding: 0, paddingLeft: 8, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('hostExperienceInsert03CostHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => this.ItemChange({ idx: index, value: text, type: 'costDescript' })}>{item.description}</TextInput>
                                        </View>
                                    </View>
                                </View>
                            ))}

                            <View style={{ width: '100%', marginTop: 20, }}>
                                <TouchableOpacity onPress={() => this._CostInsert({ type: 1 })} disabled={this.state.costFlag == true ? true : false}>
                                    <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.color2D7DC8, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image style={{ width: 16, height: 16, resizeMode: 'contain', tintColor: Colors.color2D7DC8 }} source={imgPlus}></Image>
                                        <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginLeft: 9 }}>{I18n.t('hostExperienceInsert03CostAddFactor')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={{ flex: 1, marginTop: 12, }} onPress={() => this.setState({ costFlag: this.state.costFlag == false ? true : false, costDatas: this.state.costFlag == true ? [{ 'no': 0, 'factor': '', 'description': '' }] : [], })}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image source={(this.state.costFlag == false ? imgCheckOff : imgCheckOn)} style={{ width: 15, height: 15, resizeMode: 'contain' }}></Image>
                                    <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{I18n.t('hostExperienceInsert03NoConst')}</Text>
                                </View>
                            </TouchableOpacity>

                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert03BringText')}</Text>
                            {this.state.bringDatas.map((item, index) => (
                                <View style={{ marginTop: 12 }}>
                                    <View style={{ flexDirection: 'row', height: 48, width: '100%', marginTop: 12, }}>
                                        <View style={{ flex: 0.3, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center' }}>
                                            <TextInput style={{ padding: 0, paddingLeft: 8, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('hostExperienceInsert03CostFactor')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => this.ItemChange({ idx: index, value: text, type: 'bringFactor' })}>{item.factor}</TextInput>
                                        </View>

                                        <View style={{ flex: 0.7, borderWidth: 1, borderColor: Colors.colorFFFFFF, borderBottomColor: Colors.colorD0D0D0, justifyContent: 'center', marginLeft: 12, paddingLeft: 4 }}>
                                            <TextInput style={{ padding: 0, paddingLeft: 8, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14 }} placeholder={I18n.t('hostExperienceInsert03CostHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(text) => this.ItemChange({ idx: index, value: text, type: 'bringDescript' })}>{item.description}</TextInput>
                                        </View>
                                    </View>
                                </View>
                            ))}

                            <View style={{ width: '100%', marginTop: 20, }}>
                                <TouchableOpacity onPress={() => this._BringInsert()} disabled={this.state.bringFlag == true ? true : false}>
                                    <View style={{ width: '100%', height: 48, borderRadius: 4, borderColor: Colors.color2D7DC8, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Image style={{ width: 16, height: 16, resizeMode: 'contain', tintColor: Colors.color2D7DC8 }} source={imgPlus}></Image>
                                        <Text style={{ color: Colors.color2D7DC8, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, marginLeft: 9 }}>{I18n.t('hostExperienceInsert03CostAddFactor')}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={{ flex: 1, marginTop: 12, }} onPress={() => this.setState({ bringFlag: this.state.bringFlag == false ? true : false, bringDatas: this.state.bringFlag == true ? [{ 'no': 0, 'factor': '', 'description': '' }] : [], })}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image source={(this.state.bringFlag == false ? imgCheckOff : imgCheckOn)} style={{ width: 15, height: 15, resizeMode: 'contain' }}></Image>
                                    <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{I18n.t('hostExperienceInsert03NoBring')}</Text>
                                </View>
                            </TouchableOpacity>

                            <Text style={{ fontSize: 16, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, marginTop: 20 }}>{I18n.t('hostExperienceInsert03RequirementsText')}</Text>
                            <View style={{ height: 48, borderRadius: 4, borderWidth: 1, borderColor: Colors.colorD0D0D0, justifyContent: 'center', paddingLeft: 8, marginTop: 12 }}>
                                <TextInput ref={(ref) => this.criteria = ref} style={{ padding: 0, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, fontSize: 14, }} editable={this.state.degreeCheck == false ? true : false} placeholder={I18n.t('hostExperienceInsert03RequirementsHint')} placeholderTextColor={Colors.colorC4C4C4} onChangeText={(value) => this.state.requirement = value}>{this.state.requirement}</TextInput>
                            </View>

                            <TouchableOpacity style={{ flex: 1, marginTop: 12, }} onPress={() => this.setState({ degreeCheck: this.state.degreeCheck == false ? true : false, requirement: '' }, () => this.criteria.clear())}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image source={(this.state.degreeCheck == false ? imgCheckOff : imgCheckOn)} style={{ width: 15, height: 15, resizeMode: 'contain' }}></Image>
                                    <Text style={{ color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12, marginLeft: 8 }}>{I18n.t('hostExperienceInsert03RequirementsHint')}</Text>
                                </View>
                            </TouchableOpacity>

                            <View style={{ marginTop: 38 }}></View>

                            <TouchableOpacity style={{ width: '100%', height: 48, }} onPress={() => this._Next()} disabled={(this.state.name.length == 0 || this.state.descript.length == 0 || this.state.price.length == 0 || this.state.runningTime.length == 0 || (this.state.min.length == 0 && this.state.minAccount == false) || (this.state.max.length == 0 && this.state.maxAccount == false) || (this.state.costDatas.length == 0 && this.state.costFlag == false) || (this.state.bringDatas.length == 0 && this.state.bringFlag == false) || (this.state.requirement.length == 0 && this.state.degreeCheck == false)) ? true : false}>
                                <View style={{ width: '100%', height: 48, borderRadius: 4, backgroundColor: (this.state.name.length == 0 || this.state.descript.length == 0 || this.state.price.length == 0 || this.state.runningTime.length == 0 || (this.state.min.length == 0 && this.state.minAccount == false) || (this.state.max.length == 0 && this.state.maxAccount == false) || (this.state.costDatas.length == 0 && this.state.costFlag == false) || (this.state.bringDatas.length == 0 && this.state.bringFlag == false) || (this.state.requirement.length == 0 && this.state.degreeCheck == false)) ? Colors.colorB7B7B7 : Colors.color2D7DC8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: Colors.colorFFFFFF, fontFamily: 'Raleway-Bold', includeFontPadding: false, fontSize: 16, }}>{I18n.t('hostExperienceInsert01Done')}</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={{ height: 80 }}></View>

                        </ScrollView>
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}