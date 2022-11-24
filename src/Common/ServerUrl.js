export default class ServerUrl {
    static Server = "https://budify.info/";

    //login
    static LoginUrl = ServerUrl.Server + 'mUser/Login';
    static LoginSNSUrl = ServerUrl.Server + 'mUser/LoginSNS';
    static SelectUserUrl = ServerUrl.Server + 'mUser/SelectUser';
    static InsertUserUrl = ServerUrl.Server + 'mUser/InsertUser';
    static UnregisterUrl = ServerUrl.Server + 'mUser/Unregister';
    static UpdateUserUrl = ServerUrl.Server + 'mUser/UpdateUser';

    //country, city, region, nation list
    static SelectCountry = ServerUrl.Server + 'util/SelectCountry';
    static SelectCity = ServerUrl.Server + 'util/SelectCity';
    static SelectRegion = ServerUrl.Server + 'util/SelectTown';
    static SelectNation = ServerUrl.Server + 'util/selectNation';
    static SelectCategory = ServerUrl.Server + 'util/selectCategory';
    static SelectLanguage = ServerUrl.Server + 'util/selectLanguage';
    static SelectContentsCategory = ServerUrl.Server + 'util/selectcontentscategories';
    static SelectBank = ServerUrl.Server + 'util/selectbank';

    //coupon
    static SelectUserCoupon = ServerUrl.Server + 'mCoupon/SelectUserCoupon';
    static EnrollCoupon = ServerUrl.Server + 'mCoupon/EnrollCoupon';
    //myExperience
    static SelectMyExperienceOrder = ServerUrl.Server + 'mOrder/SelectOrder';

    //Experience
    static SelectExperience = ServerUrl.Server + 'mEx/SelectExperience';
    static SelectExperienceSchedule = ServerUrl.Server + 'mEx/SelectExperienceWithSchedulesForTerm';
    static SelectExSchedule = ServerUrl.Server + 'mExSchedule/SelectExSchedules';
    static SelectWebExSchedule = ServerUrl.Server + 'exSchedule/selectExSchedules';
    static InsertExperience = ServerUrl.Server + 'mEx/InsertExperience';
    static UpdateExperience = ServerUrl.Server + 'ex/UpdateExperience';
    static DeleteExperience = ServerUrl.Server + 'mEx/DeleteExperience';
    static InsertExperienceCover = ServerUrl.Server + 'mEx/InsertExperienceCover'
    static InsertExperienceImages = ServerUrl.Server + 'mEx/InsertExperienceImages'

    //ExperienceInsertManager
    static SearchMyExperience = ServerUrl.Server + 'mEx/SelectExperienceWithSchedulesForTermHost';
    //GoodsDetail
    static SearchRecommendedPlace = ServerUrl.Server + 'mPlace/SelectRecommendedPlace'
    static SearchRecommendedExperience = ServerUrl.Server + 'mEx/SelectRecommendedExperience'
    static SearchSimilarExperience = ServerUrl.Server + 'mEx/SelectSimilarExperience'

    //PlaceDetail
    static SearchSimilarPlace = ServerUrl.Server + 'mPlace/SelectSimilarPlace'

    //ReserveSchedule
    static callExAndSchedules = ServerUrl.Server + 'ex/SelectExperienceWithSchedules'
    static AddScheduleEx = ServerUrl.Server + 'exSchedules/InsertExSchedules'
    static SelectReserveManageExSchedule = ServerUrl.Server + 'exSchedules/selectExSchedules'
    static SelectScheduleByGuest = ServerUrl.Server + 'exSchedules/SelectExSchedulesByNo'
    static ScheduleDelete = ServerUrl.Server + 'exSchedules/DeleteExSchedules'
    static ScheduleUpdate = ServerUrl.Server + 'exSchedules/UpdateExSchedules'

    //Contents
    static SelectContentsPlace = ServerUrl.Server + 'mPlace/SelectPlace';
    static SearchContentsPlace = ServerUrl.Server + 'mPlace/SearchPlace';
    static InsertContentsPlace = ServerUrl.Server + 'mPlace/insertPlace';
    static UpdateContentsPlace = ServerUrl.Server + 'mPlace/updatePlace';
    static UpdateContentsPlaceImageRep = ServerUrl.Server + 'mPlace/updatePlaceImageRepresentative';
    static InsertContentsPlaceImages = ServerUrl.Server + 'mPlace/updatePlaceImageUrls';
    static InsertContentsPlaceCreator = ServerUrl.Server + 'mPlace/updatePlaceImageCreator';
    static ContentInsertReview = ServerUrl.Server + 'mPlaceReview/InsertPlaceReview';

    //Curations
    static InsertCuration = ServerUrl.Server + 'mCurations/insertCurations';
    static UpdateCurationImageRep = ServerUrl.Server + 'mCurations/updateCurationsImageRepresentative';
    static SearchCurations = ServerUrl.Server + 'mCurations/SelectCurations';
    static UpdateCurations = ServerUrl.Server + 'mCurations/updateCurations';

    //Review
    static SelectReview = ServerUrl.Server + 'mReview/SelectReview';
    static InsertReview = ServerUrl.Server + 'mReview/insertReview';
    static UpdateReview = ServerUrl.Server + 'mReview/updateReview';

    //ContentReview
    static SelectPlaceReview = ServerUrl.Server + 'mPlaceReview/SelectPlaceReview';
    static InsertPlaceReview = ServerUrl.Server + 'mPlaceReview/InsertPlaceReview';
    static UpdatePlaceReview = ServerUrl.Server + 'mPlaceReview/UpdatePlaceReview';
    static DeletePlaceReview = ServerUrl.Server + 'mPlaceReview/DeletePlaceReview';

    //Saved
    static InsertSaved = ServerUrl.Server + 'mSaved/insertSaved';
    static SelectSavedEx = ServerUrl.Server + 'mSaved/SelectSaved';
    static DeleteSavedEx = ServerUrl.Server + 'mSaved/DeleteSaved';

    //Travel
    static InsertTravel = ServerUrl.Server + 'mTravel/InsertTravel';
    static SelectTravel = ServerUrl.Server + 'mTravel/SelectTravel';
    static UpdateTravel = ServerUrl.Server + 'mTravel/UpdateTravel';
    static DeleteTravel = ServerUrl.Server + 'mTravel/DeleteTravel';

    //Inquiry
    static InsertInquiry = ServerUrl.Server + 'mInquiry/InsertInquiry'
    static SelectInquiry = ServerUrl.Server + 'mInquiry/SelectInquiry'
    static UpdateInquiry = ServerUrl.Server + 'mInquiry/UpdateInquiry'
    static DeleteInquiry = ServerUrl.Server + 'mInquiry/DeleteInquiry'

    //Profile
    static SelectRecentOrder = ServerUrl.Server + 'mOrder/SelectRecentOrder'
    static SelectReviewBySellerUserNo = ServerUrl.Server + 'mReview/SelectReviewBySellerUserNo'
}