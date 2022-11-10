import React, { Component } from 'react';
import I18n from '../lang/i18n';

export function colorPrimary() {
    return 'rgb(51,209,107)'
}

export function numberWithCommas(x) {
    if (x == undefined) {
        return ''
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function Grinder(data) {
    if (data == undefined) {
        return ''
    }
    if (I18n.currentLocale() == "ko-KR") {
        return data.ko
    } else if (I18n.currentLocale() == "en-US") {
        return data.en
    } else if (I18n.currentLocale() == "ja-JP") {
        return data.ja
    }
}

export function GrinderContents(data) {
    if (data == undefined) {
        return ''
    }
    if (data.default == undefined) {
        if (I18n.currentLocale() == "ko-KR") {
            return data.ko
        } else if (I18n.currentLocale() == "en-US") {
            return data.en
        } else if (I18n.currentLocale() == "ja-JP") {
            return data.ja
        }
    } else {
        if (I18n.currentLocale() == "ko-KR") {
            return data.ko.length == 0 ? data.default : data.ko
        } else if (I18n.currentLocale() == "en-US") {
            return data.en.length == 0 ? data.default : data.en
        } else if (I18n.currentLocale() == "ja-JP") {
            return data.ja.length == 0 ? data.default : data.ja
        }
    }
}

const genderKo = ["남성", "여성", "기타"];
const genderEn = ["Male", "Female", "Rather Not Say"];
const genderJa = ['男性', '女性', 'その他'];

const experiencesCategoryKo = ['문화와 예술', '음식과 음료', '엔터테인먼트', '야외활동', '관광', '스포츠와 건강', '자연경관', '온라인', 'VR & AR'];
const experiencesCategoryEn = ['Culture & Art', 'Food & Drinks', 'Entertainment', 'Outdoor Activities', 'Sightseeing', 'Sports & Health', 'Nature', 'Online', 'VR & AR'];
const experiencesCategoryJa = ['文化＆アート',
    'フード＆ドリンク',
    'エンターテインメント',
    'アウトドア活動',
    '観光',
    'スポーツ＆健康',
    '自然',
    'オンライン',
    'VR & AR',];

const appLanguageKo = ['한국어', '영어', '일본어'];
const appLanguageEn = ['Korean', 'English', 'Japanese'];
const appLanguageJa = ['韓国語', '英語', '日本語'];

export function CurrentLocale() {
    if (I18n.currentLocale() == "ko-KR") {
        return 'ko'
    } else if (I18n.currentLocale() == "en-US") {
        return 'en'
    } else if (I18n.currentLocale() == "ja-JP") {
        return 'ja'
    }
}

export function AppLanguage() {
    console.log('language ' + I18n.currentLocale())
    if (I18n.currentLocale() === 'ko-KR') {
        return appLanguageKo
    } else if (I18n.currentLocale() === 'en-US') {
        return appLanguageEn
    } else if (I18n.currentLocale() === 'ja-JP') {
        return appLanguageJa
    } else {
        return appLanguageEn
    }
}
const runningTime = [{ "no": 0, "ko": "분", "en": "Minutes", "ja": "分" }, { "no": 1, "ko": "시간", "en": "Hours", "ja": "時間" }, { "no": 2, "ko": "일", "en": "Days", "ja": "日" }];
const curreny = [{ "no": 0, "ko": "원화 (₩)", "en": "KRW (₩)", "ja": "KRW (₩)" }, { "no": 1, "ko": "달러화 ($)", "en": "USD ($)", "ja": "USD ($)" }, { "no": 2, "ko": "엔화 (¥)", "en": "JPY (¥)", "ja": "JPY (¥)" }];
const langInsert = [{ "no": 0, 'ko': '', 'en': '', 'ja': '' }, { "no": 1, 'ko': '', 'en': '', 'ja': '' }, { "no": 2, 'ko': '', 'en': '', 'ja': '' }]
const timeCategory = [{ "no": 0, 'ko': '아침 (오전 6시 - 오후 12시)', 'en': 'Morning (06:00 - 12:00)', 'ja': '朝 (06:00 - 12:00)', 'start': '06:00', 'end': '12:00' }, { "no": 1, 'ko': '점심 (오후 12시 - 오후 5시)', 'en': 'Afternoon (12:00 -17:00)', 'ja': '昼 (12:00 -17:00)', 'start': '12:00', 'end': '17:00' }, { "no": 2, 'ko': '저녁 (오후 5시 - 오전 12시)', 'en': 'Evening (17:00 - 24:00)', 'ja': '午後 (17:00 - 24:00)', 'start': '17:00', 'end': '24:00' }, { "no": 3, 'ko': '기타 (오전 12시 - 오전 6시)', 'en': 'Other (24:00 - 06:00)', 'ja': '午前 (24:00 - 06:00)', 'start': '24:00', 'end': '06:00' }]
export function RunningTime() {
    return runningTime
}

export function Currency() {
    return curreny
}

export function TimeCategorys() {
    return timeCategory
}

export function ExperiencesCategory() {
    if (I18n.currentLocale() == "ko-KR") {
        return experiencesCategoryKo
    } else if (I18n.currentLocale() == "en-US") {
        return experiencesCategoryEn
    } else if (I18n.currentLocale() == "ja-JP") {
        return experiencesCategoryJa
    }
}

export function Gender() {
    if (I18n.currentLocale() == "ko-KR") {
        return genderKo
    } else if (I18n.currentLocale() == "en-US") {
        return genderEn
    } else if (I18n.currentLocale() == "ja-JP") {
        return genderJa
    }
}
