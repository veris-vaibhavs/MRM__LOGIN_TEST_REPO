import React from 'react';
import { Select } from 'veris-styleguide';
import { getTenantEmployees } from 'requests.js';
import { withTranslation } from 'react-i18next';

class EscortNameDropdown extends React.Component {
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
                <Select
                    {...this.props}
                    placeholder={this.state.placeholder}
                    isClearable={true}
                    value={this.props.value}
                    options={this.state.options ? this.state.options : []}
                    components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                    }}
                    noOptionsMessage={
                        () => this.state.placeholder
                    }
                    onChange={(event) => {
                        if (this.props.autofill) {
                            this.props.getautoFill(this.props.autofill);
                        } else {
                            this.props.onChange(event);
                        }
                    }}
                    onInputChange={(event) => {
                        if (event.length >= 3) {
                            this.setState({
                                placeholder: 'Searching...',
                            });
                            getTenantEmployees(event, this.props.venue.value)
                                .then((response) => {
                                    this.setState({
                                        options: response,
                                        placeholder: this.props.t('No host found'),
                                    });
                                })
                                .catch((error) => {
                                    this.setState({
                                        options: '',
                                        placeholder: this.props.t('No host found'),
                                    });
                                });
                        }
                        if (event.length < 3) {
                            // if (this.props.value && event) {
                            //     this.props.setFieldValue({
                            //         hostName: ""
                            //     })
                            // }
                            this.setState({
                                options: null,
                                placeholder: this.props.t('Type first 3 letters to search'),
                            });
                        }
                    }}
                    onFocus={(event) => {
                        this.props.onFocus(event);
                        // this.cache = this.props.value
                        // this.props.setFieldError({
                        //     hostName: ""
                        // }, () => {
                        //     this.props.setFieldValue({
                        //         hostName: ""
                        //     })
                        // })
                    }}
                    onBlur={(event) => {
                        this.props.onBlur(event);
                        // if (!this.props.value) {
                        //     this.props.setFieldValue({
                        //         hostName: this.cache
                        //     }, () => {
                        //         let error = this.props.validate("hostName")
                        //         this.props.setFieldError(error)
                        //     })
                        // }
                    }}
                />

            </div>
        );
    }
}

export default withTranslation()(EscortNameDropdown);
