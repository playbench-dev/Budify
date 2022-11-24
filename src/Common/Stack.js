import React from 'react';
import { View, StatusBar, SafeAreaView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from '../Splash'
import Loading from '../Loading'
import Login from '../Login'
import GuestLogin from '../GuestLogin'
import SignUp from '../Registers/SignUp'
import SignUpProfile from '../Registers/SignUpProfile'
import SignUpRegion from '../Registers/SignUpRegion'
import PasswordSearch from '../PasswordSearch'
import ImageSelect from '../Common/ImageSelect'
import Main from '../Main'
import SavedSearch from '../Views/Saved/SavedSearch'
import SavedScheduleMain from '../Views/Saved/SavedScheduleMain'
import FromGoogle from '../Views/Saved/FromGoogle'
import FromEx from '../Views/Saved/FromEx'
import FromPlace from '../Views/Saved/FromPlace'

import EditProfile from '../Views/Profile/EditProfile'
import ChangePassword from '../Views/Profile/ChangePassword'
import AlarmList from '../Views/Profile/AlarmList'
import MyCoupons from '../Views/Profile/MyCoupons'
import MyExperiences from '../Views/Profile/MyExperiences'
import Support from '../Views/Profile/Support'
import CouponAdd from '../Views/Profile/CouponAdd'
import ReserveCancel from '../Views/Profile/ReserveCancel'
import GoodsDetail from '../Views/Goods/GoodsDetail'
import InstagramShared from '../Views/Goods/InstagramShared'
import ReviewList from '../Views/Reviews/ReviewList'
import ReviewInsert from '../Views/Reviews/ReviewInsert'
import ContentReviewInsert from '../Views/Contents/ContentReviewInsert'
import ContentReviewList from '../Views/Contents/ContentReviewList'
import PlaceDetail from '../Views/Contents/PlaceDetail'
import CurationDetail from '../Views/Contents/CurationDetail'
import ContentsManager from '../Views/Managers/ContentsManager'
import ContentsInsert from '../Views/Managers/ContentsInsert'
import ContentsEdit from '../Views/Managers/ContentsEdit'
import CurationManager from '../Views/Managers/CurationManager'
import CurationInsert from '../Views/Managers/CurationInsert'
import CurationEdit from '../Views/Managers/CurationEdit'
import Reserve from '../Views/Reserves/Reserve'
import Payment from '../Views/Reserves/Payment'
import PaymentWeb from '../Views/Reserves/PaymentWeb'
import Service from '../Registers/Service'
import HostExperiencesManage from '../Views/Hosts/HostExperiencesManage'
import HostExperiencesInsert01 from '../Views/Hosts/HostExperiencesInsert01'
import HostExperiencesInsert02 from '../Views/Hosts/HostExperiencesInsert02'
import HostExperiencesInsert03 from '../Views/Hosts/HostExperiencesInsert03'
import HostExperiencesInsert04 from '../Views/Hosts/HostExperiencesInsert04'
import HostReserveManager from '../Views/Hosts/HostReserveManager'
import ProfilePage from '../Views/Profile/ProfilePage'
import ProfilePageReviewList from '../Views/Profile/ProfilePageReviewList'
import TravelInvite from '../TravelInvite'

const Stack = createStackNavigator();

export default function () {

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle={'dark-content'} backgroundColor='white' />
            <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
                <Stack.Screen name="Splash" component={Splash} />
                <Stack.Screen name="TravelInvite" component={TravelInvite} options={{ presentation: 'transparentModal' }} />
                <Stack.Screen name="Loading" component={Loading} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="GuestLogin" component={GuestLogin} />
                <Stack.Screen name="SignUp" component={SignUp} />
                <Stack.Screen name="SignUpProfile" component={SignUpProfile} />
                <Stack.Screen name="ImageSelect" component={ImageSelect} />
                <Stack.Screen name="SignUpRegion" component={SignUpRegion} />
                <Stack.Screen name="PasswordSearch" component={PasswordSearch} />
                <Stack.Screen name="Main" component={Main} />
                <Stack.Screen name="SavedSearch" component={SavedSearch} />
                <Stack.Screen name="SavedScheduleMain" component={SavedScheduleMain} options={{ animationEnabled: false }} />
                <Stack.Screen name="FromGoogle" component={FromGoogle} />
                <Stack.Screen name="FromEx" component={FromEx} />
                <Stack.Screen name="FromPlace" component={FromPlace} />
                <Stack.Screen name="EditProfile" component={EditProfile} />
                <Stack.Screen name="ChangePassword" component={ChangePassword} />
                <Stack.Screen name="AlarmList" component={AlarmList} />
                <Stack.Screen name="MyCoupons" component={MyCoupons} />
                <Stack.Screen name="MyExperiences" component={MyExperiences} />
                <Stack.Screen name="Support" component={Support} />
                <Stack.Screen name="CouponAdd" component={CouponAdd} />
                <Stack.Screen name="ReserveCancel" component={ReserveCancel} />
                <Stack.Screen name="GoodsDetail" component={GoodsDetail} />
                <Stack.Screen name="InstagramShared" component={InstagramShared} />
                <Stack.Screen name="ReviewList" component={ReviewList} />
                <Stack.Screen name="ReviewInsert" component={ReviewInsert} />
                <Stack.Screen name="ContentReviewInsert" component={ContentReviewInsert} />
                <Stack.Screen name="ContentReviewList" component={ContentReviewList} />
                <Stack.Screen name="PlaceDetail" component={PlaceDetail} />
                <Stack.Screen name="CurationDetail" component={CurationDetail} options={{ animationEnabled: false }} />
                <Stack.Screen name="ContentsManager" component={ContentsManager} />
                <Stack.Screen name="ContentsInsert" component={ContentsInsert} />
                <Stack.Screen name="ContentsEdit" component={ContentsEdit} />
                <Stack.Screen name="CurationManager" component={CurationManager} />
                <Stack.Screen name="CurationInsert" component={CurationInsert} />
                <Stack.Screen name="CurationEdit" component={CurationEdit} />
                <Stack.Screen name="Reserve" component={Reserve} />
                <Stack.Screen name="PaymentWeb" component={PaymentWeb} />
                <Stack.Screen name="Payment" component={Payment} />
                <Stack.Screen name="Service" component={Service} />
                <Stack.Screen name="HostExperiencesManage" component={HostExperiencesManage} />
                <Stack.Screen name="HostExperiencesInsert01" component={HostExperiencesInsert01} />
                <Stack.Screen name="HostExperiencesInsert02" component={HostExperiencesInsert02} />
                <Stack.Screen name="HostExperiencesInsert03" component={HostExperiencesInsert03} />
                <Stack.Screen name="HostExperiencesInsert04" component={HostExperiencesInsert04} />
                <Stack.Screen name="HostReserveManager" component={HostReserveManager} />
                <Stack.Screen name="ProfilePage" component={ProfilePage} />
                <Stack.Screen name="ProfilePageReviewList" component={ProfilePageReviewList} />
            </Stack.Navigator>
        </SafeAreaView>
    );
}