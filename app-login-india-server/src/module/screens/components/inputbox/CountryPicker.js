import React, { memo, useState } from 'react';
import { View } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';

const Country = memo((props) => {
    const [countryCode, setCountryCode] = useState('IN');
    const [country, setCountry] = useState(null);
    const [withCountryNameButton] = useState(false);
    const [withFlag] = useState(true);
    const [withEmoji] = useState(true);
    const [withFilter] = useState(true);
    const [withAlphaFilter] = useState(false);
    const [withCallingCode] = useState(true);
    const [withCallingCodeButton] = useState(true);
    const onSelect = (country) => {
        console.log(country);
        props.setCountryCode(country.callingCode[0], country.cca2);
        setCountryCode(country.cca2);
        setCountry(country);
    };
    return (
        <View>
            <CountryPicker
                className={'vrs-input-countryCode'}
                {...{
                    countryCode,
                    withFilter,
                    withFlag,
                    withCountryNameButton,
                    withAlphaFilter,
                    withCallingCode,
                    withEmoji,
                    withCallingCodeButton,
                    onSelect,
                }}
            />
        </View>
    );
});

export default Country;