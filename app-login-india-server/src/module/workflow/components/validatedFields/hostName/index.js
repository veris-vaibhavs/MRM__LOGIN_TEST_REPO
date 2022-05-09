import React from 'react';
import { Select } from 'veris-styleguide';
import { getHost } from 'src/requests';
import { withTranslation } from 'react-i18next';

class HostName extends React.Component {
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
                <Select label='Host Name'
                        {...this.props}
                        placeholder={this.state.placeholder}
                        isClearable={true}
                        options={this.state.options ? this.state.options : []}
                        components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                        }}
                        noOptionsMessage={
                            () => this.state.placeholder
                        }
                        onChange={(event) => {
                            this.setState({
                                value: event ? event.value : '',
                                option: event,
                                error: '',
                            }, () => {
                                this.props.setFieldValue({
                                    hostName: event,
                                });
                            });
                        }}
                        onInputChange={(event) => {
                            if (event.length >= 3) {
                                this.setState({
                                    placeholder: 'Searching...',
                                });
                                getHost(event, this.props.venue.value)
                                    .then((response) => {
                                        this.setState({
                                            options: response,
                                            placeholder: this.props.t('No host found'),
                                        });
                                    })
                                    .catch((error) => {
                                        this.setState({
                                            otions: '',
                                            placeholder: this.props.t('No host found'),
                                        });
                                    });
                            }
                            if (event.length < 3) {
                                if (this.props.value && event) {
                                    this.props.setFieldValue({
                                        hostName: '',
                                    });
                                }
                                this.setState({
                                    options: null,
                                    placeholder: this.props.t('Type first 3 letters to search'),
                                });
                            }
                        }}
                        onFocus={(event) => {
                            this.cache = this.props.value;
                            this.props.setFieldError({
                                hostName: '',
                            }, () => {
                                this.props.setFieldValue({
                                    hostName: '',
                                });
                            });
                        }}
                        onBlur={(event) => {
                            if (!this.props.value) {
                                this.props.setFieldValue({
                                    hostName: this.cache,
                                }, () => {
                                    let error = this.props.validate('hostName');
                                    this.props.setFieldError(error);
                                });
                            }
                        }}
                />
            </div>
        );
    }
}

export default withTranslation()(HostName);
