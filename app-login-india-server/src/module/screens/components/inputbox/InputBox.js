import React from 'react';
import './styles.input.css';
import { Label } from 'veris-styleguide';
import InputError from './InputError';
import { withTranslation } from 'react-i18next';

class InputBox extends React.Component {
    constructor(props) {
        super(props);
        const { t } = props;
        this.state = {
            phone: {
                error: '',
                fieldType: 'phone',
                isRequired: true,
            },
            phone: '',
            allowedTemplate: props.allowedTemplate,
            fieldInputValue: '',
            fieldInputType: props.fieldInputType,
            Formlabel: t('signInPassword.f-contact-label'),
            LoginPlaceholder: t('signInPassword.f-contact-placeholder'),
            dialCode: '91',
            countryCode: 'IN',
            loading: false,
        };
    }


    render() {
        const { t } = this.props;
        return (
            <>
                <div className={'LabelContainer'}>
                    <Label>{this.props.Formlabel}</Label>
                </div>
                <div className={this.props.showError && this.props.errorMsg ? 'error inputWrapper' : 'inputWrapper'}>
                    <input type='text'
                           className={this.props.fieldInputType === 'phone' ? 'VrsInputAll' + ' ' + 'PadL25' : 'VrsInputAll'}
                           placeholder={this.props.LoginPlaceholder}
                           value={this.props.value}
                           onChange={this.props.onChange}
                           onBlur={this.props.validation}
                    />
                </div>
                {this.props.showError && this.props.errorMsg ? <InputError inputType={t(this.props.errorMsg)} /> : ''}
            </>
        );
    }
}

export default withTranslation()(InputBox);