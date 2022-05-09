import i18n from '../../i18n.js';
import axios from "axios";
import * as _ from 'lodash';
import { PhoneNumberUtil } from 'google-libphonenumber';

export const handleRegEx = (expressions, value) => {
    for (let i = 0; i < expressions.length; i++) {
        if (!expressions[i].re.test(value ? value : '')) {
            return expressions[i].error;
        }
    }
    return null;
};

export const initializeRE = (isRequired) => {
    let re = [];
    if (isRequired) {
        re.push({
            re: /[^\s*$]/,
            error: i18n.t('This field is required.'),
        });
    }
    return re;
};

export function getDomainUrl(url) {
    let baseDomain = window.location.host;
    if (!_.isEmpty(url))
        url = new URL(url);
    url.host = baseDomain;
    return url.href?.replace?.('http://', 'https://').replace('localhost:3000', 'genpact-uat.veris.in');
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp('\\b(?:' + search + ')\\b', 'g'), replacement);
};

export function replaceAll(str, map) {
    for (let key in map) {
        str = str.replaceAll(`{{${key}}}`, map[key]).replaceAll(key, map[key]);
    }
    return str;
}

export function base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
        var ascii = binaryString.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes;
}

export function isValidPhone(value, countryCode, countryLocale) {
    console.log('Validity ->', value, countryLocale, countryCode);
    value = value.replace(/ +(?=)/g, 'x5').replace(`+${countryCode}`, '');
    console.log('the value=>', value);
    let isValidPhone = false;
    let phoneUtil = PhoneNumberUtil.getInstance();
    try {
        isValidPhone = phoneUtil.isValidNumberForRegion(phoneUtil.parse(value, countryLocale), countryLocale);
        console.log('Validity', isValidPhone);
    } catch (error) {
        console.log('Error', error);
        return false;
    }

    return isValidPhone;
}
class cachedAPI {
    constructor() {
        this.data = {};
    }

    setData = (url, response) => {
        this.data[`${url}`] = response;
    };
    getData = (url) => {
        return this.data[`${url}`];
    };
}

let cache = new cachedAPI();
export const getWorkflowTranslation = async (url) => {
    let response = cache.getData(url);
    if (!response) {
        response = await axios.get(url);
        cache.setData(url, response);
    }
    return response;
};
