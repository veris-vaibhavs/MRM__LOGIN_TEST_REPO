import * as _ from 'lodash';
import { PhoneNumberUtil } from 'google-libphonenumber';

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
