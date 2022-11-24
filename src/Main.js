import React from 'react'
import { View, Image, ImageBackground, BackHandler } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import I18n from './lang/i18n';
import Colors from './Common/Colos'
import HomeTabs from './Tabs/HomeTabs';
import ExperienceTabs from './Tabs/ExperienceTabs';
import ContentsTabs from './Tabs/ContentsTabs';
import ProfileTabs from './Tabs/ProfileTabs';
import ManagerTabs from './Tabs/ManagerTabs';
import SavedTabs from './Tabs/SavedTabs';
import User from './Common/User'
import FastImage from 'react-native-fast-image'
import Video from "react-native-video";
import GifImage from '@lowkey/react-native-gif';

const TAG = "Main"
const Tab = createBottomTabNavigator();
const imgHomeIcon = require('../assets/ic_home_tab_icon.png');
const imgExperienceIcon = require('../assets/ic_experience_icon.png');
const imgContentsIcon = require('../assets/ic_contents_icon.png');
const imgSavedIcon = require('../assets/ic_saved_icon.png');
const imgProfileIcon = require('../assets/ic_profile_icon.png');
const imgCircleStroke = require('../assets/circle_stroke.png');
const imgCircleStrokeFocusOn = require('../assets/circle_stroke_focus_on.png');
const icHomeDark = require('../assets/gif_home_dark.gif');
const icHomeLight = require('../assets/gif_home_light.gif');
const icHomeLightEnd = require('../assets/gif_home_end.png');
const videoHomeLight = require('../assets/video_home_light.mp4');
const icNewHome = require('../assets/ic_new_home_tab.png')

export default class Main extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {

    }

    state = {
        isLoading: false,
        homeGif: icHomeLight,
        focusOutHomeGif: icHomeLight,
        country: -1,
        city: -1,
        region: -1,
        experienceRefresh: false,
        categories: [],
    }

    reloadGif = () => {
        this.setState({ focusOutHomeGif: icHomeLightEnd })
        setTimeout(() => {
            this.setState({ focusOutHomeGif: this.state.homeGif })
        }, 0)
    }

    reloadGif2 = () => {
        this.setState({ focusOutHomeGif: icHomeLight })
    }

    render() {
        // console.log(TAG, this.props.route.params)
        // if (this.props.route.params != undefined) {
        //     if (this.props.route.params.country != undefined) {
        //         this.state.country = this.props.route.params.country;
        //     }
        //     if (this.props.route.params.city != undefined) {
        //         this.state.city = this.props.route.params.city;
        //     }
        //     if (this.props.route.params.region != undefined) {
        //         this.state.region = this.props.route.params.region;
        //     }
        //     if (this.props.route.params.categories != undefined) {
        //         this.state.categories = this.props.route.params.categories;
        //     }
        // }
        return (
            <Tab.Navigator backBehavior="none" initialRouteName={"Home"}
                screenOptions={({ route }) => ({
                    tabBarHideOnKeyboard: true,
                    tabBarActiveTintColor: Colors.color2D7DC8,
                    tabBarInactiveTintColor: Colors.color808080,
                    tabBarStyle: { height: 60, alignItems: 'center', justifyContent: 'center', paddingBottom: 5 },
                    headerShown: false,
                })}  >
                <Tab.Screen name={I18n.t('experiences')} component={ExperienceTabs} listeners={{
                    tabPress: e => {

                    }
                }}
                    // initialParams={{ country: this.state.country, city: this.state.city, region: this.state.region, }} 
                    options={{

                        tabBarIcon: ({ color, focused }) => (
                            <Image source={imgExperienceIcon} style={{ width: 21, height: 21, tintColor: (focused == true ? Colors.color2D7DC8 : Colors.color808080), resizeMode: 'contain' }} />
                        )
                    }} />
                <Tab.Screen name={I18n.t('contents')} component={ContentsTabs}
                    // initialParams={{ country: this.state.country, city: this.state.city, region: this.state.region, categories: this.state.categories, }} 
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Image source={imgContentsIcon} style={{ width: 16, height: 21, tintColor: (focused == true ? Colors.color2D7DC8 : Colors.color808080), resizeMode: 'contain' }} />
                        )
                    }} />
                <Tab.Screen name="Home" component={HomeTabs} listeners={{
                    tabPress: e => {
                        this.reloadGif()
                    },
                }} screenOptions={{ tabBarShowLabel: false, }} options={{
                    tabBarLabel: '', tabBarIcon: ({ color, focused }) => (
                        <Image source={focused == true ? this.state.focusOutHomeGif : icHomeLightEnd} style={{ width: 88, height: 88 }} resizeMode={"cover"} ></Image>
                    )
                }} />
                <Tab.Screen name={I18n.t('saved')} component={SavedTabs} listeners={{
                    tabPress: e => {
                        console.log(e)
                        if (User.guest == true) {
                            this.props.navigation.navigate('GuestLogin')
                            e.preventDefault();
                        }
                    }
                }} options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Image source={imgSavedIcon} style={{ width: 24, height: 24, tintColor: (focused == true ? Colors.color2D7DC8 : Colors.color808080), resizeMode: 'contain' }} />
                    )
                }} />
                <Tab.Screen name={I18n.t('profile')} component={User.level == 99 ? ManagerTabs : ProfileTabs} listeners={{
                    tabPress: e => {
                        console.log(e)
                        if (User.guest == true) {
                            this.props.navigation.navigate('GuestLogin')
                            e.preventDefault();
                        }
                    }
                }} options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Image source={imgProfileIcon} style={{ width: 24, height: 24, tintColor: (focused == true ? Colors.color2D7DC8 : Colors.color808080), resizeMode: 'contain' }} />
                    )
                }} />
            </Tab.Navigator>
        )
    }
}