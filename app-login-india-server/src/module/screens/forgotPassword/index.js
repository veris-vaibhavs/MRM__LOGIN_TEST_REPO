import React, { Component } from 'react';
import classes from './styles.module.css';
import { withTranslation } from 'react-i18next';
import Form from '../components/form';
import { Button } from 'veris-styleguide';
import { Container, Content, Footer, Header } from '../components/box';
import cogoToast from 'cogo-toast';
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { forgotPassword } from '../../../requests';
import { getValidators } from '../validators';
import InputBox from '../components/inputbox/InputBox';
import { handleRegEx, initializeRE } from '../helpers';
import CountryPicker from '../components/inputbox/CountryPicker';

let validators = getValidators();

class ForgotPassword extends Component {
    errors = {};

    constructor(props) {
        super(props);
        const { t } = this.props;
        this.state = {
            fields: {
                contact: {
                    value: this.props.contact ? this.props.contact : '',
                    placeholder: t('forgotPassword.f-contact-placeholder'),
                    error: '',
                    fieldType: 'contact',
                    isRequired: true,
                },
            },
            OTPSignINSwitcher: false,
            showError: false,
            errorMsg: '',
            allowedTemplate: 'both',
            phone: '',
            fieldInputValue: '',
            fieldInputType: 'phone',
            Formlabel: t('signInPassword.f-contact-label'),
            LoginPlaceholder: t('signInPassword.f-contact-placeholder'),
            dialCode: '91',
            countryCode: 'IN',
            loading: false,
        };
        this.setCountryCode = this.setCountryCode.bind(this);
    }

    componentDidMount = () => {
        const { t } = this.props;
        var templateArray = localStorage.getItem('loginTemplate').split(',');
        var templateLogin = localStorage.getItem('loginUsing').split(',');
        var template = templateArray.reduce((key, val) => {
            key[val] = val;
            return key;
        }, {});
        console.log('template', templateLogin);
        this.setState({
            allowedTemplate: template?.['otp'] && template?.['email'] && template?.['phone'] ? 'both' : template?.['email'] || template?.['phone'] || template?.['cognito'],
        });

        if (template?.['otp'] === 'otp' && template?.['password'] === 'password') {
            this.setState({
                OTPSignINSwitcher: true,
                template: 'OTP_SignIn_auth',
            });
        }
        if (template?.['otp'] === 'otp' && template?.['password'] !== 'password') {
            this.setState({
                OTPSignINSwitcher: template?.['otp'] ? true : false,
                template: 'OTP',
            });
        }
        if (template?.['password'] === 'password' && template?.['otp'] !== 'otp') {
            this.setState({
                OTPSignINSwitcher: template?.['otp'] ? true : false,
                template: 'signInPassword',
            });
        }
        if (template?.['cognito'] === 'cognito' && template?.['otp'] !== 'otp' && template?.['password'] !== 'password') {
            if (localStorage.getItem('signInPassword') !== 'true') {
                this.props.updateState({
                    contact: this.state.fieldInputValue,
                    screen: 'NewLogin',
                }, () => {
                    this.props.history.push('/NewLogin');
                });
            } else {
                this.setState({
                    OTPSignINSwitcher: template?.['otp'] ? true : false,
                    template: 'signInPassword',
                });
            }
        }
        this.updateInputBox();
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.allowedTemplate !== this.state.allowedTemplate) {
            this.updateInputBox();
            this.updateTemplateField();
        }
        if (prevState.template !== this.state.template) {
            this.updateTemplateField();
        }
    }

    updateTemplateField() {
        console.log(this.state.template);
        this.updateInputBox();
    }

    setCountryCode(code, cc_code) {
        this.setState({ dialCode: code, countryCode: cc_code });
    }

    updateInputBox() {
        const { t } = this.props;
        if (this.state.allowedTemplate === 'phone') {
            this.setState({
                Formlabel: t('enterPhone'),
                fieldInputType: 'phone',
                LoginPlaceholder: t('enterPhone-placeholder'),
            });
        }
        if (this.state.allowedTemplate === 'email') {
            this.setState({
                Formlabel: t('enterEmail'),
                fieldInputType: 'email',
                LoginPlaceholder: t('enterEmail-placeholder'),
            });
        } else if (this.state.allowedTemplate === 'both') {
            this.setState({
                Formlabel: t('signInPassword.f-contact-label'),
                fieldInputType: 'email',
                LoginPlaceholder: t('signInPassword.f-contact-placeholder'),
            });
        }
    }

    setCountryCode(code, cc_code) {
        this.setState({ dialCode: code, countryCode: cc_code });
    }

    changeInputBox(event) {
        const { t } = this.props;
        console.log('Input ...');
        this.setState({ fieldInputValue: event.target.value?.toLowerCase() });
        var intRegex = /^[0-9]*$/g;
        var intEmailRegex = /^[a-zA-Z ]*$/;
        var input = event.target.value;
        if (this.state.allowedTemplate === 'both') {
            if (input !== '' && intRegex.test(input)) {
                this.setState({
                    showError: false,
                    errorMsg: '',
                    Formlabel: t('enterPhone'),
                    fieldInputType: 'phone',
                    LoginPlaceholder: t('enterPhone-placeholder'),
                });
            } else {
                this.setState({
                    Formlabel: t('enterEmail'),
                    fieldInputType: 'email',
                    LoginPlaceholder: t('enterEmail-placeholder'),
                });
            }
        }

    }

    validation() {
        const { t } = this.props;
        if (this.state.fieldInputType === 'email') {

            let value = this.state.fieldInputValue;
            let error = {};
            let re = initializeRE(true);
            re.push({
                re: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                error: 'app.err-email-0',
            });
            this.setState({
                showError: true,
                errorMsg: handleRegEx(re, value),
            });
        }
        if (this.state.fieldInputType === 'phone') {
            let value = this.state.fieldInputValue;
            let error = {};
            let re = initializeRE(true);
            re.push({
                re: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
                error: 'app.err-phone-0',
            });
            this.setState({
                showError: true,
                errorMsg: handleRegEx(re, value),
            });
        }
    }

    setFieldValue = (updates, callback) => {
        let fields = { ...this.state['fields'] };
        for (let key in updates) {
            fields[key].value = updates[key];
        }
        this.setState({ field: fields }, callback);
    };

    setFieldError = (updates, callback) => {
        let fields = { ...this.state['fields'] };
        for (let key in updates) {
            fields[key].error = updates[key];
        }
        this.setState({ field: fields }, callback);
    };

    getFieldValue = (field) => {
        if (field) {
            return this.state.fields[field].value;
        }
        let values = {};
        let fields = { ...this.state['fields'] };
        for (let key in fields) {
            values[key] = fields[key].value;
        }
        return values;
    };

    validate = (field) => {
        let config = this.state.fields[field];
        config['field'] = field;
        try {
            return validators[config.fieldType](config, this.getFieldValue);
        } catch (error) {
        }
    };
    onSubmit = async () => {
        const { t } = this.props;
        for (let key in this.errors) {
            if (this.errors[key]) {
                return;
            }
        }
        let fields = this.state.fields;
        if (this.state.showError && this.state.errorMsg !== '' & this.state.errorMsg !== null) {
            this.validation();
            return;
        }
        try {
            const captchaV3 = await this.props.googleReCaptchaProps.executeRecaptcha('forgotPassword');
            var contact = this.state.fieldInputType;
            debugger
            await this.setState({ loading: true });
            let payload = {
                domain: `${this.props.domain}`,
                [this.state.fieldInputType]: this.state.fieldInputValue,
                'captchaV3': captchaV3,
            };
            let response = await forgotPassword(payload);
            let config = { ...this.props.config, ...response };
            this.props.updateState({
                config: config,
                contact: this.state.fieldInputValue,
                screen: 'forgotPassword-change',
            }, () => {
                this.props.history.push('/forgotPassword/change');
            });
        } catch (error) {
            await this.setState({ loading: false });
            if (error.response.status === 302) {
                cogoToast.success(error.response.data.message);
                this.props.updateState({
                    screen: 'NewLogin',
                }, () => {
                    this.props.history.push('/NewLogin');
                });
            } else if (error.response.status === 400) {
                let arr = [];
                for (let key in error.response.data) {
                    arr.push(error.response.data[key]);
                }
                cogoToast.error(arr[0]);
            } else {
                cogoToast.error(t('forgotPassword.err-0'));
            }
        }
    };

    render() {
        const { t } = this.props;
        let LoginTemplate;
        let SSOTemplate;
        if (this.state.template === 'phone') {
            LoginTemplate =
                <>
                    {
                        this.state.fieldInputType === 'phone' ?
                            <div className={'InputPhoneWrapper'}>
                                <div className={'VrsCountryCodeWrapper'}>
                                    <CountryPicker setCountryCode={this.setCountryCode} />
                                </div>
                            </div> : ''
                    }
                    <InputBox
                        value={this.state.fieldInputValue}
                        onChange={(event) => this.changeInputBox(event)}
                        allowedTemplate={this.state.allowedTemplate}
                        fieldInputType={this.state.fieldInputType}
                        LoginPlaceholder={this.state.LoginPlaceholder}
                        Formlabel={this.state.Formlabel}
                        showError={this.state.showError}
                        errorMsg={this.state.errorMsg}
                        validation={() => {
                            this.validation();
                        }}
                    />
                </>;
        }
        if (this.state.template === 'email') {
            LoginTemplate =
                <>
                    <InputBox
                        value={this.state.fieldInputValue}
                        onChange={(event) => this.changeInputBox(event)}
                        allowedTemplate={this.state.allowedTemplate}
                        fieldInputType={this.state.fieldInputType}
                        LoginPlaceholder={this.state.LoginPlaceholder}
                        Formlabel={this.state.Formlabel}
                        showError={this.state.showError}
                        errorMsg={this.state.errorMsg}
                        validation={() => {
                            this.validation();
                        }}
                    />

                </>;
        }
        if (this.state.template === 'OTP_SignIn_auth') {
            LoginTemplate =
                <>
                    {
                        this.state.fieldInputType === 'phone' ?
                            <div className={'InputPhoneWrapper'}>
                                <div className={'VrsCountryCodeWrapper'}>
                                    <CountryPicker setCountryCode={this.setCountryCode} />
                                </div>
                            </div> : ''
                    }
                    <InputBox
                        value={this.state.fieldInputValue}
                        onChange={(event) => this.changeInputBox(event)}
                        allowedTemplate={this.state.allowedTemplate}
                        fieldInputType={this.state.fieldInputType}
                        LoginPlaceholder={this.state.LoginPlaceholder}
                        Formlabel={this.state.Formlabel}
                        showError={this.state.showError}
                        errorMsg={this.state.errorMsg}
                        validation={() => {
                            this.validation();
                        }}
                    />
                </>;
        }
        if (this.state.template === 'signInPassword') {
            LoginTemplate =
                <>
                    {
                        this.state.fieldInputType === 'phone' ?
                            <div className={'InputPhoneWrapper'}>
                                <div className={'VrsCountryCodeWrapper'}>
                                    <CountryPicker setCountryCode={this.setCountryCode} />
                                </div>
                            </div> : ''
                    }
                    <InputBox
                        value={this.state.fieldInputValue}
                        onChange={(event) => this.changeInputBox(event)}
                        allowedTemplate={this.state.allowedTemplate}
                        fieldInputType={this.state.fieldInputType}
                        LoginPlaceholder={this.state.LoginPlaceholder}
                        Formlabel={this.state.Formlabel}
                        showError={this.state.showError}
                        errorMsg={this.state.errorMsg}
                        validation={() => {
                            this.validation();
                        }}
                    />
                </>;
        }
        if (this.state.template === 'OTP') {
            LoginTemplate =
                <>
                    {
                        this.state.fieldInputType === 'phone' ?
                            <div className={'InputPhoneWrapper'}>
                                <div className={'VrsCountryCodeWrapper'}>
                                    <CountryPicker setCountryCode={this.setCountryCode} />
                                </div>
                            </div> : ''
                    }
                    <InputBox
                        value={this.state.fieldInputValue}
                        onChange={(event) => this.changeInputBox(event)}
                        allowedTemplate={this.state.allowedTemplate}
                        fieldInputType={this.state.fieldInputType}
                        LoginPlaceholder={this.state.LoginPlaceholder}
                        Formlabel={this.state.Formlabel}
                        showError={this.state.showError}
                        errorMsg={this.state.errorMsg}
                        validation={() => {
                            this.validation();
                        }}
                    />
                </>;
        }
        return (
            <Container>
                <Header
                    goBack={
                        () => this.props.updateState({
                            screen: 'signInPassword',
                        }, () => {
                            this.props.history.push('/signInPassword');
                        })
                    }
                    heading={t('forgotPassword.h-1')}
                    subHeading={`${this.props.domain}.veris.in`}
                />
                <Content>
                    <Form onSubmit={this.onSubmit}>
                        <p className={classes.OTPRight}
                           onClick={() => this.props.updateState({
                               contact: this.state.fieldInputValue,
                               screen: 'NewLogin',
                           }, () => {
                               this.props.history.push('/NewLogin');
                           })}
                        >
                            {'Sign In ?'}
                        </p>
                        {LoginTemplate}
                        {/* <Input {...this.state.fields.contact}
                               onChange={(event) => {
                                   this.setFieldError({contact: ""})
                                   this.setFieldValue({contact: event.target.value?.toLowerCase()})
                                   this.errors = {...this.errors, ...this.validate("contact")}
                               }}
                            onBlur={()=>this.setFieldError({contact: t(this.errors["contact"])})}
                        /> */}
                        <Button
                            theme='vrs-btn-primary'
                            label={t('forgotPassword.btn-verification-link')}
                            loading={this.state.loading}
                            onClick={this.onSubmit}
                        />
                    </Form>
                </Content>
                <Footer>
                    {t('forgotPassword.i-footer')}
                </Footer>
            </Container>
        );
    }
}

export default withTranslation()(withGoogleReCaptcha(ForgotPassword),
);
