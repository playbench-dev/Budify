import React, { Fragment, Component } from 'react';
import { Platform } from "react-native";
import Colors from './Colos'
import CameraRollPicker from 'react-native-camera-roll-picker';
// import OneBtnDialog from '../../Commons/OneBtnDialog'

import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Image,
    Button,
    Dimensions,
    TouchableOpacity
} from 'react-native';

const TAG = "ImageInsert";
let cnt = 0;

export default class ImageSelect extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            images: '',
            filepath: {
                data: '',
                uri: ''
            },
            fileData: '',
            fileUri: '',
            type: 0, //0-max(4), 1-max(20), 2-max(1)
            data: [],
            orderNo: '',
            dialogVisible: false,
            dialogContents: '',

        }
    }

    componentDidMount() {
        this.setState({
            isLoading: true,
        })
    }

    getSelectedImages = result => {
        this.state.data = result;
        console.log(this.state.data.length)
        for (let i = 0; i < Object.keys(this.state.data).length; i++) {
            console.log('result : ' + JSON.stringify(this.state.data[i]));
        }
    }

    _DialogVisible = value => {
        // if(value != undefined){
        //     this.setState({
        //         dialogVisible : value.visible,
        //     })
        // }
        // if(this.state.dialogVisible){
        //   return <OneBtnDialog title = {"사진등록"} contents = {this.state.dialogContents} leftBtnText = {"확인"} clcik = {this._DialogVisible}></OneBtnDialog>
        // }else{
        //   return null;
        // }
    }

    _goBack(value) {
        this.props.route.params.parentFunction(value);
        this.props.navigation.goBack();
    }

    render() {
        this.state.data = this.props.route.params.photoData
        this.state.type = this.props.route.params.type
        return (
            <SafeAreaView>
                <View style={styles.body}>
                    <View style={styles.titleBody}>
                        <TouchableOpacity style={{ height: '100%', justifyContent: 'center' }} onPress={() => this.props.navigation.goBack()}>
                            <Text style={{ marginLeft: 12, fontSize: 18, }}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ height: '100%', justifyContent: 'center', position: 'absolute', right: 12, }} onPress={() => this._goBack(this.state.data)}>
                            <Text style={{ marginLeft: 12, fontSize: 18, }}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    {this.state.isLoading && <CameraRollPicker callback={this.getSelectedImages} maximum={this.state.type == 0 ? 4 : this.state.type == 1 ? 20 : 1} selected={this.state.data} />}
                    {this._DialogVisible()}
                </View>
            </SafeAreaView>
        );
    }
};

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: Colors.colorF8F8F8,
    },

    body: {
        backgroundColor: Colors.colorFFFFFF,
        width: '100%',
        height: '100%',
    },
    titleBody: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
    ImageSections: {
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 8,
        justifyContent: 'center'
    },
    images: {
        width: 150,
        height: 150,
        borderColor: 'black',
        borderWidth: 1,
        marginHorizontal: 3
    },
    btnParentSection: {
        alignItems: 'center',
        marginTop: 10
    },
    btnSection: {
        width: 225,
        height: 50,
        backgroundColor: '#DCDCDC',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        marginBottom: 10
    },
    btnText: {
        textAlign: 'center',
        color: 'gray',
        fontSize: 14,
        fontWeight: 'bold'
    }
});