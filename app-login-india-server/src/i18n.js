import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

let app = require('./module/translations.json');

//Screens
let domain = require('./module/screens/domain/translations.json');
let forgotDomain = require('./module/screens/forgotDomain/translations.json');
let signInPassword = require('./module/screens/signInPassword/translations.json');
let forgotPassword = require('./module/screens/forgotPassword/translations.json');
let signInOtpContact = require('./module/screens/signInOtp/contact/translations.json');
let signInOtpCode = require('./module/screens/signInOtp/code/translations.json');
//Components
let box = require('./module/screens/components/box/translations.json');

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: {
            en: {
                translation: translations['en'],
            },
            es: {
                translation: translations['es'],
            },
            hi: {
                translation: translations['hi'],
            },
            ro: {
                translation: translations['ro'],
            },
            'zh-CN': {
                translation: translations['zh-CN'],
            },
            ja: {
                translation: translations['ja'],
            },
            nl: {
                translation: translations['nl'],
            },
            hu: {
                translation: translations['hu'],
            },
            pt: {
                translation: translations['pt'],
            },
        },
        lng: 'en',
        fallbackLng: 'en',
        keySeparator: false,
        interpolation: {
            escapeValue: false,
        },

    });
export default i18n;
