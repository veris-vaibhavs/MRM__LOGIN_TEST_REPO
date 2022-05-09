import React, { Component } from 'react';
import Form from '../components/form';
import { Button, Input } from 'veris-styleguide';
import { Container, Content, Header } from '../components/box';
import cogoToast from 'cogo-toast';
import { setPassword } from '../../../requests';
import { getValidators } from '../validators';
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3';
import classes from './styles.module.css';

let validators = getValidators();

class SetPassword extends Component {
    errors = {};

    constructor(props) {
        super(props);
        this.state = {
            fields: {
                setPassword: {
                    label: 'Your password',
                    value: '',
                    placeholder: 'Enter your password',
                    error: '',
                    isRequired: true,
                    fieldType: 'setPassword',
                },
                confirmPassword: {
                    label: 'Confirm Password',
                    value: '',
                    placeholder: 'Enter your password',
                    error: '',
                    isRequired: true,
                    fieldType: 'confirmPassword',
                },
            },
            loading: false,
            d: null,
            t: null,
            x: null,
            f: null,
            domain: null,
        };
    }

    componentDidMount() {
        let url_string = window.location.href;
        let url = new URL(url_string);
        let d = url.searchParams.get('d');
        let t = url.searchParams.get('t');
        let x = url.searchParams.get('x');
        let f = url.searchParams.get('f');
        let domain = url.searchParams.get('domain');
        this.setState({
            d: d,
            t: t,
            x: x,
            f: f,
            domain: domain,
        });
        let error = url.searchParams.get('error');
        if (error) {
            cogoToast.error(error);
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
                    this.setFieldError({ [field]: 'This field is required.' });
                    return;
                }
            }
        }
        const captchaV3 = await this.props.googleReCaptchaProps.executeRecaptcha('forgotPassword');
        let payload = {
            t: this.state.t,
            password: this.getFieldValue('setPassword'),
            password_retyped: this.getFieldValue('confirmPassword'),
            org_domain: this.state.domain ? this.state.domain : this.state.d,
            x: this.state.x,
            d: this.state.d,
            f: this.state.f,
            'captchaV3': captchaV3,
        };
        await this.setState({ loading: true });
        try {
            await setPassword(payload);
            var host = window.location.hostname;
            var domain = host.split('.')[0];
            if (!this.props.isGenericDomain(domain)) {
                this.props.getOrgPool(domain, () => {
                    this.props.history.push('/NewLogin');
                });
            } else {
                this.props.updateState({ screen: 'domain' }, () => {
                    this.props.history.push('/domain');
                });
            }
            cogoToast.success('Password changed successfully!');
        } catch (error) {
            await this.setState({ loading: false });
            if (error.response.status === 400) {
                let arr = [];
                for (let key in error.response.data) {
                    arr.push(error.response.data[key]);
                }
                cogoToast.error(arr[0]);
            } else {
                cogoToast.error('Something went wrong!');
            }
        }
    };

    render() {
        return (
            <Container>
                <Header
                    heading='Set New Password'
                    subHeading={'Password will be valid for 90 days'}
                />
                <Content>
                    <div className={classes.Policy}>
                        <h3> Veris Password Policy </h3>
                        <ul>
                            <li>Have at least one lower case character</li>
                            <li>Have at least one capital letter</li>
                            <li>Have at least one number</li>
                            <li>Have at least one special character, allowed characters ! @ # $ & *</li>
                            <li>Be at least 10 characters</li>
                            <li>You cannot use your last 5 passwords</li>
                        </ul>
                    </div>
                    <Form onSubmit={this.onSubmit}>
                        <Input {...this.state.fields.setPassword}
                               type='password'
                               onChange={(event) => {
                                   this.setFieldError({ setPassword: '' });
                                   this.setFieldValue({ setPassword: event.target.value });
                                   this.errors = { ...this.errors, ...this.validate('setPassword') };
                               }}
                               onBlur={() => {
                                   this.setFieldError({ setPassword: this.errors['setPassword'] });
                                   if (this.getFieldValue('confirmPassword')) {
                                       this.setFieldError(this.validate('confirmPassword'));
                                   }
                               }}

                        />
                        <Input {...this.state.fields.confirmPassword}
                               type='password'
                               onChange={(event) => {
                                   this.setFieldError({ confirmPassword: '' });
                                   this.setFieldValue({ confirmPassword: event.target.value });
                                   this.errors = { ...this.errors, ...this.validate('confirmPassword') };
                               }}
                               onBlur={() => this.setFieldError({ confirmPassword: this.errors['confirmPassword'] })}
                        />
                        <Button
                            theme='vrs-btn-primary'
                            label='Continue'
                            loading={this.state.loading}
                            onClick={this.onSubmit}
                        />
                    </Form>
                </Content>
            </Container>
        );
    }
}

export default withGoogleReCaptcha(SetPassword);