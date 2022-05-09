import React from 'react';
import './phoneComponent.css';
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default class PhoneComponent extends React.Component {

    constructor(props) {
        const { t } = props;
        super(props);
        this.state = {
            code: 'in',
        };
    }

    render() {
        let code = 'in';
        return (
            <>
                <div class='vrs-label'>{this.props.label}
                <>{this.props.isRequired ? " * " : ""}</></div>
                <ReactPhoneInput
                    country={code}
                    autoFormat={false}
                    prefix={'+'}
                    value={this.props.value}
                    required={this.props.isRequired}
                    enableSearch={true}
                    onChange={phone => {
                        this.props.onChange(phone);
                    }}
                    onBlur={(event) => {
                        this.props.onBlur(event);
                    }}
                    onFocus={(event) => {
                        this.props.onFocus(event);
                    }}
                    isValid={(inputNumber, country) => {
                        this.props.isValid(country.dialCode, country.iso2);
                    }}
                />
                {this.props.error ? <div class='vrs-error'>{this.props.error}</div> : ''}
            </>
        );
    }
};
