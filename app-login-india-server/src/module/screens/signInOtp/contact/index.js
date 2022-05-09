import React, { Component } from 'react';
import classes from './styles.module.css';
import { withTranslation } from 'react-i18next';
import Form from '../../components/form';
import { Button, Input, Label } from 'veris-styleguide';
import { Container, Content, Footer, Header } from '../../components/box';
import cogoToast from 'cogo-toast';
import { signin } from '../../../../requests';
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { getValidators } from '../../validators';

let validators = getValidators();

class Contact extends Component {
    errors = {};

    constructor(props) {
        super(props);
        const { t } = props;
        this.state = {
            fields: {
                contact: {
                    value: this.props.contact ? this.props.contact : '',
                    placeholder: t('enterEmail-placeholder'),
                    error: '',
                    fieldType: 'contact',
                    isRequired: true,
                },
            },
            loading: false,
        };
    }

    setFieldValue = (updates, callback) => {
        let fields = { ...this.state['fields'] };
        for (let key in updates) {
            fields[key].value = updates[key];
        }
        this.setState({ field: fields }, callback);
    };

    setFieldError = (updates, callback) => {
        const { t } = this.props;
        let fields = { ...this.state['fields'] };
        debugger;
        for (let key in updates) {
            fields[key].error = t(updates[key]);
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
                    this.setFieldError({ [field]: 'app.err-required' });
                    return;
                }
            }
        }
        try {
            const captchaV3 = await this.props.googleReCaptchaProps.executeRecaptcha('signInOTP');
            let payload = {
                'client_id': this.props.config.otpClient,
                'contact': this.getFieldValue('contact'),
                'auth_flow': 'CUSTOM_AUTH',
                'user_pool': this.props.config.pool.id,
                'captchaV3': captchaV3,
            };
            await this.setState({ loading: true });
            let response = await signin(payload);
            let config = { ...this.props.config, ...response };
            this.props.updateState({
                contact: this.getFieldValue('contact'),
                config: config,
                screen: 'signInOtp-code',
            }, () => {
                this.props.history.push('/signInOtp/code');
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
                cogoToast.error(t('signInOtpContact.err-0'));
            }
        }
    };

    render() {
        const { t } = this.props;
        return (
            <Container>
                <Header
                    heading={`${t('signInOtpContact.h-1')} ${this.props.config.org}`}
                    subHeading={`${this.props.domain}.veris.in`}
                />
                <Content>
                    <Form onSubmit={this.onSubmit}>
                        <div className={classes.LabelContainer}>
                            <Label>{t('enterEmail')}</Label>
                            {/* <p className={classes.PasswordLink}
                               onClick={() => this.props.updateState({
                                   contact: this.getFieldValue("contact"),
                                   screen: "signInPassword"
                               }, () => {
                                   this.props.history.push("/signInPassword")
                               })}
                            >
                                {t("signInOtpContact.lk-password")}
                            </p> */}
                        </div>
                        <Input {...this.state.fields.contact}
                               onChange={(event) => {
                                   this.setFieldError({ contact: '' });
                                   this.setFieldValue({ contact: event.target.value?.toLowerCase() });
                                   this.errors = { ...this.errors, ...this.validate('contact') };
                               }}
                               onBlur={() => this.setFieldError({ contact: this.errors['contact'] })}
                        />
                        <Button
                            theme='vrs-btn-primary'
                            label={t('signInOtpContact.btn-continue')}
                            loading={this.state.loading}
                            onClick={this.onSubmit}
                        />
                    </Form>
                </Content>
                <Footer>
                    {t('signInOtpContact.i-footer')}
                </Footer>
            </Container>
        );
    }
}

export default withTranslation()(withGoogleReCaptcha(Contact),
);
