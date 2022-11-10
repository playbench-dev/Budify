import React from 'react';
import { SafeAreaView, View, Image, TouchableWithoutFeedback, Text, ScrollView, TextInput, Modal, FlatList, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import I18n from '../../lang/i18n';
import Colors from '../../Common/Colos';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const TAG = 'FromGoogle'
const imgBack = require('../../../assets/ic_back.png');
const imgShared = require('../../../assets/ic_shared.png');
const imgSearch = require('../../../assets/ic_search.png');
const imgDownArrow = require('../../../assets/ic_down_arrow.png');
const imgBud = require('../../../assets/ic_saved_bud.png');
const imgGoogle = require('../../../assets/ic_saved_google.png');

export default class FromGoogle extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        console.log(I18n.currentLocale())
        Geocoder.init("AIzaSyCePbzWSXlyg8wUqrB0yvWPOLzq0maVfdI", { language: I18n.currentLocale().substring(0, 2) });
    }

    state = {
        lat: 0,
        lng: 0,
        searchDatas: [],
        selectSearchPosition: -1,
        mapSearchText: '',
    }

    _MapSearch(value, SearchText) {
        console.log(value)
        Geocoder.from(value)
            .then(json => {
                this.state.searchDatas = [];
                json.results.map((item, index) => this.state.searchDatas.push({ name: SearchText, address: item.formatted_address, lat: item.geometry.location.lat, lng: item.geometry.location.lng }))
                var location = json.results[0].geometry.location;
                this.setState({
                    lat: location.lat,
                    lng: location.lng,
                })
                // console.log(location);
            })
            .catch(this.setState({
                searchDatas: [],
                lat: 0,
                lng: 0,
                selectSearchPosition: 0,
            }));
    }

    _AddBack(value) {
        this.props.route.params.parentFuntion([{ lat: value.lat, lng: value.lng, representative_file_url: null, title: value.name, city: -1 }], this.props.route.params.mapsIndex, 2)
        this.props.navigation.goBack()
    }

    render() {
        console.log('aa', this.state.mapSearchText)
        return (
            <SafeAreaView>
                <View style={{ width: '100%', height: '100%', backgroundColor: Colors.colorFFFFFF, }}>
                    <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 16 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                            <View style={{ alignItems: 'center', paddingTop: 11, flexDirection: 'row' }}>
                                <View style={{ width: 25, height: 20, alignItems: 'flex-start', }}>
                                    <Image source={imgBack} style={{ width: 20, height: 20, resizeMode: 'contain' }}></Image>
                                </View>
                                <Text style={{ fontSize: 20, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{'From Google'}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{ paddingLeft: 16, paddingRight: 16, marginTop: 20 }}>
                        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', borderColor: Colors.color5B5B5B, borderWidth: 1, borderRadius: 4, flexDirection: 'row', }}>
                            {/* <TextInput onSubmitEditing={() => this._MapSearch(this.state.mapSearchText)} onChangeText={(text) => this.setState({ mapSearchText: text })} style={{ flex: 1, padding: 0, paddingLeft: 8, margin: 0, color: Colors.color000000, fontFamily: 'Raleway-Medium', includeFontPadding: false, fontSize: 12 }} placeholder={I18n.t('savedSearch')} placeholderTextColor={Colors.colorC4C4C4} ></TextInput>
                            <Image source={imgSearch} style={{ width: 15, height: 15, resizeMode: 'contain', marginRight: 10 }}></Image> */}
                            <GooglePlacesAutocomplete
                                placeholder='Search'
                                onPress={(data, details = null) => {
                                    // 'details' is provided when fetchDetails = true
                                    console.log(data, details);
                                    console.log(data.description, data.structured_formatting.main_text)
                                    this._MapSearch(data.description, data.structured_formatting.main_text)
                                }}
                                textInputProps={{ height: 36, width: '100%', color: Colors.color000000, placeholderTextColor: Colors.color5B5B5B }}
                                query={{
                                    key: 'AIzaSyCePbzWSXlyg8wUqrB0yvWPOLzq0maVfdI',
                                    language: I18n.currentLocale().substring(0, 2),
                                }}
                            />
                        </View>

                    </View>

                    <View style={{ width: '100%', height: 240, marginTop: 23 }}>
                        <MapView
                            style={{
                                flex: 1,
                                height: '100%',
                            }}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={{
                                latitude: this.state.lat == 0 ? 37.564214 : this.state.lat,
                                longitude: this.state.lng == 0 ? 127.001699 : this.state.lng,
                                latitudeDelta: 0.00222,
                                longitudeDelta: 0.00121,
                            }}
                            region={{
                                latitude: this.state.lat == 0 ? 37.564214 : this.state.lat,
                                longitude: this.state.lng == 0 ? 127.001699 : this.state.lng,
                                latitudeDelta: 0.00222,
                                longitudeDelta: 0.00121,
                            }}
                            toolbarEnabled={false}>
                            {this.state.searchDatas.length > 0 && this.state.searchDatas.map((item, index) => <Marker
                                onPress={() => this.setState({ selectSearchPosition: index })}
                                coordinate={{ latitude: item.lat, longitude: item.lng }}
                            />)}

                        </MapView>
                    </View>

                    <FlatList keyExtractor={(item, index) => index.toString()} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ marginTop: 24, paddingLeft: 14, paddingRight: 14, }} data={this.state.searchDatas} renderItem={(obj) => {
                        return (
                            <TouchableWithoutFeedback onPress={() => this.setState({ selectSearchPosition: obj.index, lat: obj.item.lat, lng: obj.item.lng })}>
                                <View style={{
                                    marginTop: obj.index == 0 ? 0 : 16, backgroundColor: Colors.colorFFFFFF, borderWidth: this.state.selectSearchPosition == obj.index ? 1 : 0, borderColor: Colors.color289FAF, flexDirection: 'row', alignItems: 'center', marginLeft: 2, marginRight: 2, paddingTop: 12, paddingBottom: 12,
                                    ...Platform.select({
                                        ios: {
                                            shadowColor: 'black',
                                            shadowOffset: {
                                                width: 1,
                                                height: 1,
                                            },
                                            shadowOpacity: 0.25,
                                            shadowRadius: 3,
                                        },
                                        android: {
                                            elevation: 3,
                                        },
                                    }),
                                }}>
                                    <View style={{ flex: 1, paddingLeft: 19, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 12, color: Colors.color000000, fontFamily: 'Raleway-Bold', includeFontPadding: false, }}>{obj.item.name}</Text>
                                        <Text style={{ fontSize: 10, color: Colors.color000000, fontFamily: 'Raleway-Regular', includeFontPadding: false, marginTop: 8 }}>{obj.item.address}</Text>
                                    </View>

                                    <TouchableOpacity style={{ marginRight: 10 }} onPress={() => this._AddBack(obj.item)}>
                                        <View style={{ width: 59, height: 24, borderRadius: 100, backgroundColor: Colors.color289FAF, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 10, color: Colors.colorFFFFFF, fontFamily: 'Raleway-Medium', includeFontPadding: false, }}>{'Add'}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        )
                    }}
                        ListFooterComponent={
                            <View style={{ height: 40 }}></View>
                        }></FlatList>

                </View>
            </SafeAreaView>
        )
    }
}