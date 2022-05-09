import React, { Component } from 'react';
import Form from '../components/form';
import { Button, Input } from 'veris-styleguide';
import { Container, Content, Header } from '../components/box';
import { withTranslation } from 'react-i18next';
import cogoToast from 'cogo-toast';
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { getMemberships } from '../../../requests';
import { getValidators } from '../validators';

let validators = getValidators();

class ForgotDomain extends Component {
    errors = {};

    constructor(props) {
        super(props);
        const { t } = props;
        this.state = {
            fields: {
                email: {
                    label: t('forgotDomain.f-email-label'),
                    value: '',
                    placeholder: t('forgotDomain.f-email-placeholder'),
                    error: '',
                    fieldType: 'email',
                    isRequired: true,
                },
            },
            loading: false,
            language: { label: 'English', value: 'en' },
        };
        this.email = React.createRef();
    }

    componentDidMount() {
        this.email.current.focus();
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
        try {
            await this.setState({ loading: true });
            const captchaV3 = await this.props.googleReCaptchaProps.executeRecaptcha('forgotDomain');
            let payload = {
                email: this.getFieldValue('email'),
                captchaV3: captchaV3,
            };
            let response = await getMemberships(payload);
            cogoToast.success(response.detail);
            await this.setState({ loading: false }, () => {
                this.props.showDomain();
            });
        } catch (error) {
            await this.setState({ loading: false });
            if (error.response.status === 400) {
                let arr = [];
                for (let key in error.response.data) {
                    arr.push(error.response.data[key]);
                }
                cogoToast.error(arr[0]);
            } else {
                cogoToast.error(t('forgotDomain.err-0'));
            }
        }
    };

    render() {
        const { t } = this.props;
        return (
            <div>
                <Container>
                    <Header
                        goBack={
                            () => this.props.updateState({
                                screen: 'domain',
                            }, () => {
                                this.props.history.push('/domain');
                            })
                        }
                        heading={t('forgotDomain.h-1')}
                        subHeading={t('forgotDomain.sh-1')}
                    />
                    <Content>
                        <Form onSubmit={this.onSubmit}>
                            <Input {...this.state.fields.email}
                                   ref={this.email}
                                   onChange={(event) => {
                                       this.setFieldError({ email: '' });
                                       this.setFieldValue({ email: event.target.value?.toLowerCase() });
                                       this.errors = { ...this.errors, ...this.validate('email') };
                                   }}
                                   onBlur={() => this.setFieldError({ email: this.errors['email'] })}
                            />
                            <Button
                                type='submit'
                                theme='vrs-btn-primary'
                                label={t('forgotDomain.btn-send')}
                                loading={this.state.loading}
                                onClick={this.onSubmit}
                            />
                        </Form>
                    </Content>
                </Container>
            </div>
        );
    }
}

export default withTranslation()(withGoogleReCaptcha(ForgotDomain));
