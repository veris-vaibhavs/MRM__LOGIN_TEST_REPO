import React, { Component } from 'react';
import classes from './styles.module.css';
import { withTranslation } from 'react-i18next';
import Form from '../components/form';
import { Button, Input, Label } from 'veris-styleguide';
import { Container, Content, Header } from '../components/box';
import cogoToast from 'cogo-toast';
import { respondToChallenge, signin } from '../../../requests';
import sha256 from 'crypto-js/sha256';
import base64 from 'crypto-js/enc-base64';
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { getValidators } from '../validators';

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

let validators = getValidators();

class Password extends Component {
    errors = {};

    constructor(props) {
        super(props);
        const { t } = props;
        this.state = {
            fields: {
                contact: {
                    value: this.props.contact ? this.props.contact : '',
                    placeholder: t('signInPassword.f-contact-placeholder'),
                    error: '',
                    fieldType: 'contact',
                    isRequired: true,
                },
                password: {
                    label: t('signInPassword.f-password-label'),
                    value: '',
                    placeholder: t('signInPassword.f-password-placeholder'),
                    error: '',
                    fieldType: 'password',
                    isRequired: true,
                },
            },
            loading: false,
        };
        this.contact = React.createRef();
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
        for (let field in fields) {
            if (fields[field].error) {
                return;
            } else {
                if (fields[field].isRequired && !fields[field].value) {
                    this.setFieldError({ [field]: t('app.err-required') });
                    return;
                }
            }
        }
        await this.setState({ loading: true });
        const captchaV3 = await this.props.googleReCaptchaProps.executeRecaptcha('signInPassword');
        let payload = {
            'client_id': this.props.config.verisClient,
            'auth_flow': 'CUSTOM_AUTH',
            'contact': this.getFieldValue('contact'),
            'user_pool': this.props.config.pool.id,
            'captchaV3': captchaV3,
        };
        try {
            let response = await signin(payload);
            let config = { ...this.props.config, ...response };
            payload = {
                'answer': this.getFieldValue('password'),
                'challenge': response.ChallengeName,
                'client_id': this.props.config.verisClient,
                'session': response.Session,
                'username': this.getFieldValue('contact'),
                'login_flow': 'veris_auth',
                'domain': this.props.config.domain,
                'pool_id': this.props.config.poolId + '',
                'user_pool': this.props.config.pool.id,
            };
            response = await respondToChallenge(payload);
            config.clientIdInUse = this.props.config.verisClient;
            config = { ...config, ...response };
            this.props.updateState({ config: config, contact: this.getFieldValue('contact') }, () => {
                this.props.signIn();
            });
        } catch (error) {
            await this.setState({ loading: false });
            if (error.response.status === 429) {
                let blockTime = JSON.parse(error.response.data).block_time;
                blockTime = Math.ceil((blockTime / 60));
                if (blockTime !== 0 && blockTime !== 1) {
                    cogoToast.error(`User blocked! try after ${blockTime} minutes`);
                } else {
                    cogoToast.error(`User blocked! try after a minute`);
                }
            } else if (error.response.status === 400) {
                let arr = [];
                for (let key in error.response.data) {
                    arr.push(error.response.data[key]);
                }
                cogoToast.error(arr[0]);
            } else {
                cogoToast.error(t('signInPassword.err-0'));
            }
        }
    };

    handleFederation = (provider) => {
        let domainURL = this.props.config.cognitoDomain.default.url;
        let identityProvider = provider;
        let redirectUri = `${window.location.origin}/login/callback/`;
        let appClientId = this.props.config.verisClient;
        let responseType = 'code';
        let scopes = 'aws.cognito.signin.user.admin+openid+profile';
        let state = makeid(32);
        localStorage.setItem('state', state);
        let code_verifier = makeid(64);
        localStorage.setItem('code_verifier', code_verifier);
        let challenge = base64.stringify(sha256(code_verifier)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        window.location.href = `${domainURL}/oauth2/authorize?redirect_uri=${redirectUri}&response_type=${responseType}&client_id=${appClientId}&scope=${scopes}&identity_provider=${identityProvider}&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;
    };

    render() {
        const { t } = this.props;
        return (
            <Container>
                <Header
                    heading={`${t('signInPassword.h-1')} ${this.props.config.org}`}
                    subHeading={`${this.props.domain}.veris.in`}
                />
                <Content>
                    <Form onSubmit={this.onSubmit}>
                        <div className={classes.LabelContainer}>
                            <Label>{t('signInPassword.f-contact-label')}</Label>
                            <p className={classes.OTPLink}
                               onClick={() => this.props.updateState({
                                   contact: this.getFieldValue('contact'),
                                   screen: 'signInOtp-contact',
                               }, () => {
                                   this.props.history.push('/signInOtp/contact');
                               })}
                            >
                                {t('signInPassword.lk-otp')}
                            </p>
                        </div>
                        <Input {...this.state.fields.contact}
                               onChange={(event) => {
                                   this.setFieldError({ contact: '' });
                                   this.setFieldValue({ contact: event.target.value?.toLowerCase() });
                                   this.errors = { ...this.errors, ...this.validate('contact') };
                               }}
                               onBlur={() => this.setFieldError({ contact: t(this.errors['contact']) })}
                        />
                        <Input {...this.state.fields.password}
                               type='password'
                               onChange={(event) => {
                                   this.setFieldError({ password: '' });
                                   this.setFieldValue({ password: event.target.value });
                                   this.errors = { ...this.errors, ...this.validate('password') };
                               }}
                               onBlur={() => this.setFieldError({ password: t(this.errors['password']) })}
                        />
                        <Button
                            theme='vrs-btn-primary'
                            label={t('signInPassword.btn-continue')}
                            loading={this.state.loading}
                            onClick={this.onSubmit}
                        />
                        <div
                            onClick={
                                () => this.props.updateState({
                                    screen: 'forgotPassword',
                                }, () => {
                                    this.props.history.push('/forgotPassword');
                                })
                            }
                            className={classes.ForgotPasswordLink}>
                            {t('signInPassword.lk-forgot')}
                        </div>
                    </Form>
                    {this.props.config.client[1].identity_provider.length > 1 &&
                        <div className={classes.SSOContainer}>
                            {this.props.config.client[1].identity_provider.includes('Okta') &&
                                <div className={classes.IDPBtn}
                                     onClick={() => {
                                         this.handleFederation('Okta');
                                     }}
                                >
                                    <div className={classes.IDPBtnIcon}>
                                        <img src='/assets/images/okta.png' />
                                    </div>
                                    <div className={classes.IDPBtnLabel}>
                                        {t('signInPassword.btn-okta')}
                                    </div>
                                </div>
                            }
                            {this.props.config.client[1].identity_provider.includes('Google') &&
                                <div className={classes.IDPBtn}
                                     onClick={() => {
                                         this.handleFederation('Google');
                                     }}
                                >
                                    <div className={classes.IDPBtnIcon}>
                                        <img src='https://local2.veris.in/assets/images/google.png' />
                                    </div>
                                    <div className={classes.IDPBtnLabel}>
                                        {t('signInPassword.btn-google')}
                                    </div>
                                </div>
                            }
                        </div>
                    }
                </Content>
            </Container>
        );
    }
}

export default withTranslation()(withGoogleReCaptcha(Password),
);
