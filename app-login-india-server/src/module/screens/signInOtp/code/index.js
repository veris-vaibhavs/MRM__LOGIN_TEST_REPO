import React, { Component } from 'react';
import classes from './styles.module.css';
import { withTranslation } from 'react-i18next';
import Form from '../../components/form';
import { Button, Input, Label } from 'veris-styleguide';
import { Container, Content, Header } from '../../components/box';
import cogoToast from 'cogo-toast';
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { respondToChallenge, signin } from '../../../../requests';
import { getValidators } from '../../validators';

let validators = getValidators();

class Code extends Component {
    state = {
        fields: {
            otp: {
                value: '',
                placeholder: '_ _ _ _ _',
                error: '',
                fieldType: 'otp',
                isRequired: true,
            },
        },
        resend: false,
        timer: 30,
        counter: 0,
    };
    errors = {};
    handleTimer = () => {
        this.timer = setInterval(() => {
            if (this.state.timer === 0) {
                clearInterval(this.timer);
                this.setState({
                    resend: true,
                    counter: this.state.counter + 1,
                });
            } else {
                this.setState({
                    timer: this.state.timer - 1,
                });
            }
        }, 1000);
    };

    componentDidMount() {
        this.handleTimer();
    }

    handleResend = async () => {
        const { t } = this.props;
        await this.setState({
            resend: false,
            counter: this.state.counter + 1,
            timer: 30,
        }, this.handleTimer());
        try {
            const captchaV3 = await this.props.googleReCaptchaProps.executeRecaptcha('signInOTPResend');
            let payload = {
                'client_id': this.props.config.otpClient,
                'contact': this.props.contact,
                'auth_flow': 'CUSTOM_AUTH',
                'user_pool': this.props.config.pool.id,
                'captchaV3': captchaV3,
            };
            let response = await signin(payload);
            cogoToast.success(t('signInOtpCode.succ-0'));
            let config = { ...this.props.config, ...response };
            this.props.updateState({
                config: config,
            });
        } catch (error) {
            if (error.response.status === 429) {
                await this.setState({ loading: false });
                let blockTime = JSON.parse(error.response.data).block_time;
                blockTime = Math.ceil((blockTime / 60));
                cogoToast.error(t('signInOtpCode.err429', { count: blockTime }));
                this.props.updateState({
                    screen: 'signInOtp-contact',
                }, () => {
                    this.props.history.push('/signInOtp/contact');
                });
            } else if (error.response.status === 400) {
                let arr = [];
                for (let key in error.response.data) {
                    arr.push(error.response.data[key]);
                }
                cogoToast.error(arr[0]);
            } else {
                cogoToast.error(t('signInOtpCode.err-0'));
            }
        }
    };
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
                    this.setFieldError({ [field]: 'app.err-required' });
                    return;
                }
            }
        }
        try {
            let payload = {
                'answer': this.getFieldValue('otp'),
                'challenge': this.props.config.ChallengeName,
                'client_id': this.props.config.otpClient,
                'session': this.props.config.Session,
                'username': this.props.contact,
                'login_flow': 'otp_auth',
                'domain': this.props.config.domain,
                'pool_id': this.props.config.poolId + '',
                'user_pool': this.props.config.pool.id,
            };
            await this.setState({ loading: true });
            let response = await respondToChallenge(payload);
            let config = { ...this.props.config, ...response };
            if (response.Session) {
                this.props.updateState({
                    config: config,
                }, () => {
                    this.setState({ loading: false }, () => {
                        this.setFieldValue({ otp: '' });
                        cogoToast.error(t('signInOtpCode.err-1'));
                    });
                });
            } else {
                config.clientIdInUse = this.props.config.otpClient;
                this.props.updateState({
                    config: config,
                }, () => this.props.signIn());
            }
        } catch (error) {
            await this.setState({ loading: false });
            cogoToast.error(t('signInOtpCode.err-2'));
            this.props.updateState({
                screen: 'domain',
            }, () => {
                this.props.history.push('/domain');
            });
        }

    };

    render() {
        const { t } = this.props;
        return (
            <Container>
                <Header
                    goBack={
                        () => this.props.updateState({
                            screen: 'signInOtp-contact',
                        }, () => {
                            this.props.history.push('/signInOtp/contact');
                        })
                    }
                    heading={`${t('signInOtpCode.h-1')} ${this.props.config.org}`}
                    subHeading={this.props.contact}
                />
                <Content>
                    <Form onSubmit={this.onSubmit}>
                        <div className={classes.LabelContainer}>
                            <Label>{t('signInOtpCode.f-otp-label')}</Label>
                            {/* <p className={classes.PasswordLink}
                                onClick={()=>this.props.updateState({
                                    screen: "signInPassword"
                                },()=>{this.props.history.push("/signInPassword")})}
                            >
                                {t("signInOtpCode.lk-password")}
                            </p> */}
                        </div>
                        <Input {...this.state.fields.otp}
                               maxLength={5}
                               onChange={(event) => {
                                   this.setFieldError({ otp: '' });
                                   this.setFieldValue({ otp: event.target.value });
                                   this.errors = { ...this.errors, ...this.validate('otp') };
                               }}
                               onBlur={() => this.setFieldError({ otp: t(this.errors['otp']) })}
                        />
                        <Button
                            theme='vrs-btn-primary'
                            label={t('signInOtpCode.btn-continue')}
                            loading={this.state.loading}
                            onClick={this.onSubmit}
                        />
                        {
                            this.state.counter < 4 ?
                                this.state.resend
                                    ?

                                    <div
                                        onClick={this.handleResend}
                                        className={classes.Resend}
                                    >
                                        {t('signInOtpCode.btn-resend')}
                                    </div>
                                    :
                                    <div className={classes.ResendTimer}
                                    >
                                        {`${t('signInOtpCode.i-resend')} ${this.state.timer}s`}
                                    </div>
                                : ''
                        }
                    </Form>
                </Content>
            </Container>
        );
    }
}

export default withTranslation()(withGoogleReCaptcha(Code));