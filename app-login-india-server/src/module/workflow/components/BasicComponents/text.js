import React from 'react';
import i18next from 'i18next';

export const Label = ({ label, translationKey, required, ...restProps }) => (
    <label {...restProps}>
        {i18next.t(translationKey || label, label)}
        {required && <small className='error_text'>*</small>}
    </label>
);

export const Small = (props) => (
    <small {...props}>
        {i18next.t(props.children)}
    </small>
);
