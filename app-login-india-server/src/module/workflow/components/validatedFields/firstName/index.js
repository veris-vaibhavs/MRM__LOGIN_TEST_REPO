import React from 'react';
import { Select } from 'veris-styleguide';
import { getGuestDetails } from 'src/requests';
import { withTranslation } from 'react-i18next';

class FirstName extends React.Component {
    state = {
        placeholder: this.props.t('Type first 3 letters to search'),
        options: '',
    };
    updateState = (state) => {
        this.setState(state);
    };

    render() {
        return (
            <div>
                <Select label='First Name'
                        {...this.props}
                        isClearable={false}
                        options={this.state.options ? this.state.options : []}
                        noOptionsMessage={
                            () => this.state.placeholder
                        }
                        onChange={(event) => {
                            let contact = event.contact;
                            let workflowFieldValues = {};
                            let workflowFieldErrors = {};
                            this.props.workflowFieldsRaw && this.props.workflowFieldsRaw.forEach((field) => {
                                if (field.field_code === 'first_name') {
                                    workflowFieldValues[field.id] = event.first_name;
                                    workflowFieldErrors[field.id] = '';
                                } else if (field.field_code === 'last_name') {
                                    workflowFieldValues[field.id] = event.last_name;
                                    workflowFieldErrors[field.id] = '';
                                } else if (event.contacts.email && field.field_code === 'email') {
                                    workflowFieldValues[field.id] = event.contacts.email;
                                    workflowFieldErrors[field.id] = '';
                                } else if (event.contacts.phone && field.field_code === 'phone_no') {
                                    workflowFieldValues[field.id] = event.contacts.phone;
                                    workflowFieldErrors[field.id] = '';
                                }
                            });
                            this.props.setFieldValue({
                                firstName: {
                                    label: event.first_name,
                                    value: event.first_name,
                                },
                                lastName: event.last_name,
                                contact: contact,
                                ...workflowFieldValues,
                            }, () => {
                                this.props.setFieldError({
                                    firstName: '',
                                    lastName: '',
                                    contact: '',
                                    ...workflowFieldErrors,
                                });
                            });
                        }}
                        onInputChange={(event) => {
                            if (event) {
                                this.cache = {
                                    label: event,
                                    value: event,
                                };
                            } else {
                                this.cache = '';
                            }
                            if (event.length === 3) {
                                this.setState({
                                    placeholder: 'Searching...',
                                });
                                getGuestDetails(event)
                                    .then((response) => {
                                        this.setState({
                                            options: response,
                                            placeholder: this.props.t('No guest found'),
                                        });
                                    })
                                    .catch((error) => {
                                        this.setState({
                                            options: '',
                                            placeholder: this.props.t('No guest found'),
                                        });
                                    });
                            }
                            if (event.length < 3) {
                                this.setState({
                                    options: null,
                                    placeholder: this.props.t('Type first 3 letters to search'),
                                });
                            }
                        }}
                        onFocus={(event) => {
                            this.cache = this.props.value;
                            this.props.setFieldError({
                                firstName: '',
                            }, () => {
                                this.props.setFieldValue({
                                    firstName: '',
                                });
                            });
                        }}
                        onBlur={(event) => {
                            if (!this.props.value && this.cache) {
                                this.props.setFieldValue({
                                    firstName: this.cache,
                                }, () => {
                                    let error = this.props.validate('firstName');
                                    this.props.setFieldError(error);
                                });
                            } else {
                                let error = this.props.validate('firstName');
                                this.props.setFieldError(error);
                            }
                        }}
                />
            </div>
        );
    }
}

export default withTranslation()(FirstName);
