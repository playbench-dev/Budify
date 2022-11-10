import React, { Component } from "react";
import { SafeAreaView, View, Text, Image, FlatList, ScrollView, TouchableWithoutFeedback, Dimensions, ImageBackground, Modal, TouchableOpacity } from 'react-native'
import I18n from '../lang/i18n'
import { RadioButton } from 'react-native-paper'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import BigInt from 'big-integer'

import Colors from './Colos'
const imgBack = require('../../assets/ic_back.png');
const imgRadioOn = require('../../assets/ic_radio_on.png');
const imgRadioOff = require('../../assets/ic_radio_off.png');

class SelectDialog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            datas: props.datas,
            title: props.title,
            type: props.type,
            selectedPosition: props.selectedPosition,
            markedType: props.markedType,
            today: props.today,
            marked: props.marked,
            _markedDates: props._markedDates,
            selectedString: props.selectedString,
            lang: (I18n.currentLocale() == 'en-US' ? 'en' : I18n.currentLocale() == 'ko-KR' ? 'ko' : I18n.currentLocale() == 'ja-JP' ? 'ja' : 'en'),
            no: props.no,
        }
    }

    _click() {
        if (this.state.type == '4') {
            this.props.click({ type: this.state.type, marked: this.state.marked, _markedDates: this.state._markedDates })
        } else {
            this.props.click({ type: this.state.type, selectedPosition: this.state.selectedPosition, no: this.state.no })
        }
    }

    _setSelectedDates = (date) => {
        if (this.state._markedDates.length === 0) {
            this.state._markedDates = [date]
            let obj = this.state._markedDates.reduce((c, v) => Object.assign(c, {
                [v]: {
                    startingDay: true,
                    endingDay: false,
                    color: '#E8FBFE',
                    textColor: 'black',
                    selected: true,            //'dot'
                    selectedColor: '#B8EBF2',  //'dot'
                    selectedTextColor: 'black' //'dot'
                }
            }), {});
            console.log(obj)
            this.setState({ marked: obj, markedType: 'dot' });

        } else if (this.state._markedDates.length >= 2) {
            this.state._markedDates = [];
            this.state._markedDates = [date]
            let obj = this.state._markedDates.reduce((c, v) => Object.assign(c, {
                [v]: {
                    startingDay: true,
                    endingDay: false,
                    color: '#E8FBFE',
                    textColor: 'black',
                    selected: true,
                    selectedColor: '#B8EBF2',
                    selectedTextColor: 'black'
                }
            }), {});
            this.setState({ marked: obj, markedType: 'dot' });
        } else {
            if (this.state._markedDates.includes(date)) {
                this.state._markedDates = [];
                this.setState({ marked: null });
            } else if (parseInt(this.state._markedDates[0].replace(/-/gi, '')) > parseInt(date.replace(/-/gi, ''))) {
                this.state._markedDates = [];
                this.state._markedDates = [date]
                let obj = this.state._markedDates.reduce((c, v) => Object.assign(c, {
                    [v]: {
                        startingDay: true,
                        endingDay: false,
                        color: '#E8FBFE',
                        textColor: 'black',
                        selected: true,
                        selectedColor: '#B8EBF2',
                        selectedTextColor: 'black'
                    }
                }), {});
                this.setState({ marked: obj, markedType: 'dot' });
            } else {
                this.getDatesStartToLast(this.state._markedDates[0], date)
                this.state._markedDates = this.state._markedDates.concat(date)
                let obj = this.state._markedDates.reduce((c, v) => Object.assign({}, this.state.marked, {
                    [v]: {
                        startingDay: false,
                        endingDay: true,
                        color: '#E8FBFE',
                        textColor: 'black'
                    }
                }), {});
                console.log(obj)
                this.setState({ marked: obj, markedType: 'period' });
            }
        }
    }

    getDatesStartToLast(startDate, lastDate) {
        var regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
        if (!(regex.test(startDate) && regex.test(lastDate))) return "Not Date Format";
        var result = [];
        var curDate = new Date(startDate);
        while (curDate < new Date(lastDate)) {
            result.push(curDate.toISOString().split("T")[0]);
            if (this.state._markedDates.includes(curDate.toISOString().split("T")[0]) == false) {
                this.state._markedDates.push(curDate.toISOString().split("T")[0]);
                let obj = this.state._markedDates.reduce((c, v) => Object.assign({}, this.state.marked, {
                    [v]: {
                        startingDay: false,
                        endingDay: false,
                        color: '#E8FBFE',
                        textColor: 'black'
                    }
                }), {});
                this.state.marked = obj
                // this.setState({ marked: obj });
            }
            curDate.setDate(curDate.getDate() + 1);
        }
        console.log(this.state.marked)

        return result;
    }

    _LangSelectText(str1, str2, str3) {
        if (this.state.lang == 'ko') {
            return str2
        } else if (this.state.lang == 'ja') {
            return str3
        } else {
            return str1
        }
    }

    render() {
        console.log(this.state.datas)
        return (
            <Modal transparent={true} visible={true}>
                <TouchableWithoutFeedback onPress={() => this.props.click({ type: '5' })}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <TouchableWithoutFeedback onPress={() => console.log('')}>
                            <View style={{ width: '100%', padding: 15, backgroundColor: Colors.colorFFFFFF, borderRadius: 8, maxHeight: '80%' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <TouchableOpacity style={{ width: 40, height: 30, justifyContent: 'center' }} onPress={() => this.props.click({ type: '5' })}>
                                        <Image source={imgBack} style={{ width: 16, height: 16, resizeMode: 'contain' }}></Image>
                                    </TouchableOpacity>
                                    <Text style={{ flex: 1, paddingRight: 40, fontSize: 16, fontFamily: 'Raleway-Bold', includeFontPadding: false, color: Colors.color000000, textAlign: 'center' }}>{this.state.title}</Text>
                                </View>

                                <View style={{ margin: 5 }}></View>

                                {this.state.type == '4' && (
                                    <View style={{ borderColor: Colors.colorCFCFCF, padding: 4, borderRadius: 4, borderWidth: 1 }}>
                                        <Calendar
                                            onDayPress={day => {
                                                this._setSelectedDates(day.year + "-" + day.dateString.split('-')[1] + "-" + day.dateString.split('-')[2])
                                            }}
                                            markingType={this.state.markedType}
                                            minDate={this.state.today}
                                            markedDates={this.state.marked}
                                            style={{ width: '100%' }}
                                        />
                                    </View>
                                )}

                                {this.state.type == '6' && (
                                    <FlatList showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} keyExtractor={(item, index) => index.toString()} data={this.state.datas} renderItem={(obj) => {
                                        return (
                                            <TouchableWithoutFeedback onPress={() => this.setState({ selectedPosition: obj.index, selectedString: this._LangSelectText(obj.item.en, obj.item.ko, obj.item.ja), no: obj.item.bank_no })}>
                                                <View key={obj.index} style={{ flexDirection: 'row', height: 50, alignItems: 'center', }}>
                                                    <Text style={{ flex: 1, fontSize: 16, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false }}>{this._LangSelectText(obj.item.en, obj.item.ko, obj.item.ja)}</Text>
                                                    <Image source={this._LangSelectText(obj.item.en, obj.item.ko, obj.item.ja) == this.state.selectedString ? imgRadioOn : imgRadioOff} style={{ width: 16, height: 16, resizeMode: 'contain' }}></Image>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        )
                                    }}></FlatList>
                                )}

                                {(this.state.type != '4' && this.state.type != '6') && (
                                    <FlatList showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} keyExtractor={(item, index) => index.toString()} data={this.state.datas} renderItem={(obj) => {
                                        return (
                                            <TouchableWithoutFeedback onPress={() => this.setState({ selectedPosition: obj.index, selectedString: this._LangSelectText(obj.item.en, obj.item.ko, obj.item.ja), no: this.state.type == '1' ? obj.item.country_no : this.state.type == '2' ? obj.item.city_no : obj.item.town_no })}>
                                                <View key={obj.index} style={{ flexDirection: 'row', height: 50, alignItems: 'center', }}>
                                                    <Text style={{ flex: 1, fontSize: 16, color: Colors.color000000, fontFamily: "Raleway-Medium", includeFontPadding: false }}>{this._LangSelectText(obj.item.en, obj.item.ko, obj.item.ja)}</Text>
                                                    <Image source={this._LangSelectText(obj.item.en, obj.item.ko, obj.item.ja) == this.state.selectedString ? imgRadioOn : imgRadioOff} style={{ width: 16, height: 16, resizeMode: 'contain' }}></Image>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        )
                                    }}></FlatList>
                                )}

                                <TouchableWithoutFeedback onPress={() => this._click()} disabled={this.state.type != '4' && this.state.selectedString.length == 0 ? true : false}>
                                    <View style={{ width: '100%', height: 48, backgroundColor: Colors.color2D7DC8, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginTop: 28 }}>
                                        <Text style={{ fontSize: 16, color: Colors.colorFFFFFF, fontFamily: "Raleway-Bold", includeFontPadding: false }}>{I18n.t('homeDone')}</Text>
                                    </View>
                                </TouchableWithoutFeedback>

                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }
}
export default SelectDialog;