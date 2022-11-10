import I18n from 'react-native-i18n';
import en from './en.json';
import ko from './ko.json';
import ja from './ja.json';

I18n.fallbacks = true;

I18n.translations = {
    en,
    ko,
    ja
};

export default I18n;