import React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import CheckBox from './CheckBox';
// import { Label, Select } from "veris-styleguide";
import { Label, Small } from '../BasicComponents/text';
import i18next from 'i18next';

export class InteractiveUIComponents extends React.Component {

    constructor(props) {
        super(props);
        let { choices } = this.props.meta;

        this.state = {
            choices: this.prepareChoicesArray(choices) || [],
            hideTextInput: '',
            selectedIndex: 0,
        };
    }

    componentDidMount() {
        let { choices } = this.props.meta;
        let autofillValues = this.prepareChoicesArray(choices);
        console.log('autofillValues', autofillValues);
        this.props.onChange(autofillValues);
        this.props.onFocus();

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.error !== this.props.error) {
            this.validateAndReturn();
        }
    }

    prepareChoicesArray = (choices) => {
        let arr = [];
        !_.isEmpty(choices) && Array.isArray(choices) && choices.map(item => {
            const obj = {
                ...item,
                isSelected: false,
                value: '',
            };
            arr.push(obj);
        });
        if (!_.isEmpty(this.props.value)) {
            let autofillValueArray = this.props.value.split(/\$\$,?/); //splitting on $$,||$$
            arr.map(item => {
                autofillValueArray
                    .filter((item) => item)
                    .map((value, index) => {
                        if (value.split('__')[0] === item.optionLabel) {
                            item.isSelected = true;
                            item.value = value.split('__')[1];
                        }
                    });
            });
        }
        return arr;
    };

    getRange = (min, max) => {
        if (min === null)
            min = 0;
        if (max === null)
            max = 9999;
        return [min, max];
    };

    validateSelectedOptionsArrayLength = (selectedOptionsArray) => {
        let { min, max } = this.props.meta;
        let [minValue, maxValue] = this.getRange(min, max);
        let regex = new RegExp('\\b[' + minValue + '-' + maxValue + ']\\b');
        let selectedItemsLength = selectedOptionsArray.length;
        return selectedItemsLength.toString().match(regex);
    };

    validateAndReturn = () => {
        let error = false,
            selectedOptionsArray = this.state.choices.filter(item => item.isSelected),
            returnObject = {},
            valueArray = [],
            flagArray = [];

        if (!_.isEmpty(this.props.meta))
            if (!this.validateSelectedOptionsArrayLength(selectedOptionsArray)) {
                error = true;
                this.setState({ error: true });
                return { validationError: true };
            } else if (!_.isEmpty(selectedOptionsArray)) {
                selectedOptionsArray.map(item => {
                    if (item.showInputBox && item.value === '') {
                        error = true;
                    }
                });
                if (error) {
                    this.setState({ inputError: true });
                    return { validationError: true };
                }
            }
        this.setState({ error: false, inputError: false });
        console.warn('asd12312', selectedOptionsArray);
        !_.isEmpty(selectedOptionsArray) && selectedOptionsArray.map(item => {
            valueArray.push(item.optionLabel.concat(`__${item.value}$$`));
            if (item.flags) {
                console.warn('asda', item.flags);
                flagArray = flagArray.concat(item.flags);
            }
        });
        this.props.onChange(selectedOptionsArray);
        console.warn('flagArray', flagArray);
        // Store.dispatch({type: 'UPDATE_ACTIVITY_FLAGS', data: flagArray});
        // let field_data = {
        //     ...this.props.field_meta,
        //     value: valueArray.toString() || null
        // };
        // Store.dispatch({type: 'UPDATE_WORKFLOW_DATA', data: {workflow_data: [field_data]}});
        // returnObject[this.props.label] = valueArray.toString();
        // return returnObject;
    };

    handleSelection = (itemObject, textInputValue, index, action) => {
        this.props.onFocus();
        let arr = this.state.choices;
        let item = arr[index];
        if (action === 'create') {
            item.value = textInputValue;
        } else {
            item.isSelected = false;
            item.value = '';
        }
        this.validateAndReturn();

        this.setState({ choices: arr });
    };

    renderSelectableOptionsMessage = () => {
        let { min, max } = this.props.meta;
        max = !max ? this.props.meta.choices && this.props.meta.choices.length : max;
        let [minValue, maxValue] = this.getRange(min, max);
        let selectedOptionsArray = this.state.choices.filter(item => item.isSelected);

        if (minValue === maxValue && selectedOptionsArray.length < maxValue) {
            return i18next.t(`You need to select {{count}} option`, { count: maxValue });
        } else if (minValue === maxValue && selectedOptionsArray.length >= maxValue) {
            return i18next.t(`Unlock exisiting selection to select this`, { count: maxValue });
        } else if (minValue === 0)
            return i18next.t(`You can only select up to {{count}} option`, { count: maxValue });
        else
            return i18next.t(`You can only select {{v1}} to {{v2}} option`, { v1: minValue, v2: maxValue });
    };

    render() {
        return (
            <div className='flex-col' style={{ marginBottom: '1em' }} class='vrs-label'>
                <div className='form-group'>
                    {/* <div className="vrs-label">
                        {this.props.label}
                    </div> */}
                    <Label label={this.props.label}
                           required={this.props.required}
                           style={{
                               //    fontFamily: 'Gilroy-Bold',
                               fontSize: 15,
                               //    fontWeight: 'bold'
                           }}
                           for='input_fields'

                    />

                </div>

                {
                    !_.isEmpty(this.props.meta) ? <CheckBox
                            buttonGroupStyle={{ flex: -1 }}
                            meta={this.props.meta}
                            choices={this.state.choices}
                            inputError={this.state.inputError}
                            updateState={(stateValue) => this.setState(stateValue)}
                            onSelect={this.handleSelection}
                            buttonSize={12}
                            buttonColor={'black'}
                            horizontalButtonOrientation={false}
                        /> :
                        <Label label={'No choices available'} className='col-sm-12 control-label'
                               style={{ fontFamily: 'Gilroy-Medium', fontSize: 14 }}
                               htmlFor='input_fields' />
                }
                {this.state.error &&
                    <Small style={{ color: 'red' }}>{this.renderSelectableOptionsMessage()}</Small>}
                {
                    this.state.inputError &&
                    <Small style={{ color: 'red' }}>Please fill the details</Small>
                }
            </div>
        );
    }
}

InteractiveUIComponents.propTypes = {
    textInputOnBlur: PropTypes.func,
    radioButtonChoices: PropTypes.array,
    interactiveQuestion: PropTypes.string,
    textInputLabel: PropTypes.string,
    textInputStyle: PropTypes.object,
    triggerValue: PropTypes.string,
};

export default InteractiveUIComponents;
