import React from 'react';
import { Select } from 'veris-styleguide';
import { getHost, getTenantEmployees } from 'requests.js';
import { withTranslation } from 'react-i18next';

class MeetingWithDropdown extends React.Component {
    state = {
        placeholder: this.props.t('Type first 3 letters to search'),
        hostOptions: [],
        escortOptions: [],
        opt: [],
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
                    options={this.state.opt ? this.state.opt : []}
                    components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                    }}
                    noOptionsMessage={() => this.state.placeholder}
                    onChange={(event) => {
                        this.props.onChange(event);
                        if (this.props.autofill) {
                            this.props.getautoFill(true);
                        }
                        // this.setState({ value: event ? event.value : "", option: event, error: "" }, () => {
                        //     this.props.setFieldValue({
                        //         hostName: event
                        //     })
                        // })
                    }}
                    onInputChange={(event) => {
                        // console.log(this.props);
                        if (event.length >= 3) {
                            this.setState({
                                placeholder: 'Searching...',
                            });
                            getHost(event, this.props.venue.value)
                                .then((response) => {
                                    // console.log(response, "no")
                                    this.setState(
                                        {
                                            hostOptions: response,
                                            // placeholder:this.props.t("No host found"),
                                        },
                                        () => console.log(this.state.hostOptions, 'ho'),
                                    );
                                })
                                .catch((error) => {
                                    this.setState({
                                        hostOptions: '',
                                        placeholder: this.props.t(
                                            'No host found',
                                        ),
                                    });
                                })
                                .then(() => {
                                    if (this.props.meta.allow_drafted_members) {
                                        getTenantEmployees(
                                            event,
                                            this.props.venue.value,
                                        )
                                            .then((response) => {
                                                // console.log(response, "yes")
                                                this.setState(
                                                    {
                                                        escortOptions: response,
                                                        // placeholder:this.props.t("No host found"),
                                                    },
                                                    () =>
                                                        console.log(this.state.escortOptions, 'es'),
                                                );
                                            })
                                            .catch((error) => {
                                                this.setState({
                                                    escortOptions: '',
                                                    placeholder: this.props.t(
                                                        'No host found',
                                                    ),
                                                });
                                            });

                                        if (this.state.hostOptions && this.state.escortOptions) {
                                            var array1 = this.state.hostOptions;
                                            var array2 = this.state.escortOptions;
                                            var arr = array1.concat(array2);
                                            const ids = arr.map((o) => o.contact_id);
                                            const filtered = arr.filter(
                                                ({ contact_id }, index) =>
                                                    !ids.includes(contact_id, index + 1),
                                            );
                                            console.log(filtered);
                                            this.setState({
                                                opt: filtered,
                                                placeholder: this.props.t(
                                                    'No host found',
                                                ),
                                            }, () =>
                                                console.log(this.state.opt, 'opt'));
                                        }
                                    } else {
                                        this.setState({
                                            opt: this.state.hostOptions,
                                            placeholder: this.props.t('No host found'),
                                        });
                                    }
                                });

                        }


                        // console.log(this.state.options)
                        if (event.length < 3) {
                            // if (this.props.value && event) {
                            //     this.props.setFieldValue({
                            //         hostName: ""
                            //     })
                            // }
                            this.setState({
                                options: null,
                                placeholder: this.props.t(
                                    'Type first 3 letters to search',
                                ),
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

export default withTranslation()(MeetingWithDropdown);
