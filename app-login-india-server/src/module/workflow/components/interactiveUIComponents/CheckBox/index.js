import React from 'react';
import PropTypes from 'prop-types';
// import {Platform} from "../..";
// import {Animated, Easing, Keyboard, Text, TouchableOpacity, View} from 'react-native'
import { GoCheck } from 'react-icons/go';
import { IconContext } from 'react-icons';
// import translator from '../../../../common/utilities/i18n'
import './style.css';

export default class CheckBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            choices: this.props.choices,
        };
        this.numberOfSelections = 0;
        // this.animatedValue = new Animated.Value(0);
    }

    // animate = (toValue) => {
    //     Animated.timing(
    //         this.animatedValue,
    //         {
    //             toValue: toValue,
    //             duration: 500,
    //             easing: Easing.out(Easing.quad)
    //         }
    //     ).start();
    // };

    getRange = (min, max) => {
        if (min === null)
            min = 0;
        if (max === null)
            max = 9999;
        return [min, max];
    };

    limitOptionSelection = () => {
        this.numberOfSelections = 0;
        let { min, max } = this.props.meta;
        let [minValue, maxValue] = this.getRange(min, max);
        this.state.choices.map(item => {
            if (item.isSelected) {
                this.numberOfSelections++;
            }
        });
        if (this.numberOfSelections > maxValue) {
            console.log('Selected more &!');
            return false;
        } else {
            console.log('Can Select options');
            return true;
        }
    };

    _onPress = (item, index) => {
        let { choices } = this.state;
        let selectedItem = choices[index];
        selectedItem.isSelected = !selectedItem.isSelected;
        this.setState({
            choices,
        }, () => {
            if (this.limitOptionSelection()) {
                this.setState({ visibleIndex: index });
                this.props.updateState({ error: false });
                if ((selectedItem.isSelected) && this.state.choices[index].showInputBox) {
                    // this.animatedValue = new Animated.Value(0);
                    // this.animate(1)
                }
                if ((!selectedItem.isSelected)
                    && (this.state.choices[index].optionLabel === item.optionLabel)) {
                    this.props.onSelect(item, this.state.choices[index].value, index, 'delete');
                    // return this.animate(0)
                }
                if (this.props.onSelect && selectedItem.isSelected) {
                    return this.props.onSelect(item, this.state.choices[index].value || '', index, 'create');
                }
            } else {
                selectedItem.isSelected = !selectedItem.isSelected;
                this.setState({ choices });
                this.props.updateState({ error: true });
            }
        });
    };

    checkboxTickmark = (key) => {
        return (
            <IconContext.Provider
                value={{
                    color: this.state.choices[key].isSelected ? this.props.buttonColor : 'transparent',
                    size: 22, className: 'next_btn',
                }}>
                <GoCheck />
            </IconContext.Provider>
        );
    };

    checkboxButton = (item, i) => {
        return (
            <div className='css-1dbjc4n' style={{ marginBottom: '2%' }}>
                <div
                    className='css-1dbjc4n'
                    key={i}
                    onClick={() => this._onPress(item, i)}
                    style={{
                        transitionDuration: '0',
                    }}
                >
                    <div
                        className='css-1dbjc4n'
                        key={i} style={{
                        flexDirection: this.props.horizontalLabelOrientation ? 'row' : 'column',
                        alignItems: 'center',
                        justifyContent: this.props.horizontalLabelOrientation ? 'flex-start' : 'space-between',
                        // paddingBottom: 5,
                        paddingRight: this.props.horizontalButtonOrientation ? 5 : 0,
                        WebkitBoxAlign: 'center',
                        WebkitBoxOrient: 'horizontal',
                        WebkitBoxDirection: 'normal',
                        WebkitBoxPack: 'start',
                    }}>

                        <div
                            className='css-1dbjc4n'
                            // style="align-items: center; border-color: rgb(0, 0, 0); border-width: 1px; height: 12px; justify-content: center; width: 12px; -webkit-box-align: center; -webkit-box-pack: center;"
                            style={{
                                alignItems: 'center',
                                borderColor: '#020202',
                                borderWidth: '1px',
                                height: '12px',
                                justifyContent: 'center',
                                width: '12px',
                                // WebkitBoxAlign: "center",
                                // WebkitBoxPack: "center"
                            }}
                            // style={[{
                            //     height: this.props.buttonSize,
                            //     width: this.props.buttonSize,
                            //     borderWidth: 1,
                            //     borderColor: this.props.buttonColor,
                            //     alignItems: 'center',
                            //     justifyContent: 'center',
                            // }, this.props.style]}
                        >
                            {
                                this.checkboxTickmark(i)
                            }
                        </div>
                        <div className='text-wrap'
                             style={{
                                 fontSize: 13,
                                 //  fontFamily: 'Gilroy-Medium',
                                 flexWrap: 'wrap',
                                 color: '#3c3c3c',
                                 paddingLeft: 5,
                             }}>{item.optionLabel}</div>
                    </div>
                </div>
                {
                    this.state.choices[i].isSelected && this.state.choices[i].showInputBox ?
                        <div style={{
                            zIndex: -100,
                            // backgroundColor:'#f44',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-start',
                            flexDirection: 'row',
                            marginTop: this.state.visibleIndex === i ? this.animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-23, -3],
                            }) : this.animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-8, 0],
                            }),
                            height: 30,
                            paddingLeft: 40,
                            marginBottom: 5,
                        }}>

                            <div className='p-0 text-right col-sm-12 control-label align-self-center'
                                 style={{
                                     fontFamily: 'Gilroy-SemiBold',
                                     fontSize: 12,
                                     marginRight: '2%',
                                 }}
                                 htmlFor='input_fields'>
                                {this.state.choices[i].inputLabel}
                            </div>

                            <input
                                autoCorrect={false}
                                type='text'
                                className={this.state.error ? 'form-control error_input_field input-sm' : 'form-control input-sm'}
                                style={{ height: 30 }}
                                value={this.state.choices[i].value}
                                id='input-sm'
                                onChange={(e) => {
                                    let { choices } = this.state;
                                    let item = choices[i];
                                    item.value = e.target.value;
                                    this.setState({ choices });
                                }}
                                onBlur={() => {
                                    // if (Platform.OS !== 'web')
                                    //     Keyboard.dismiss();
                                    if (this.props.onSelect && this.state.choices[i].isSelected) {
                                        this.props.onSelect(item, this.state.choices[i].value, i, 'create');
                                    }
                                }}
                            />
                        </div>
                        : null
                }
            </div>
        );
    };

    render() {
        return (
            <div className='col-sm-12'>
                {/* <Text style={[this.props.titleStyle, {
                    fontSize: 12,
                    fontFamily: 'Gilroy-Medium',
                }]}>{this.props.title}</Text>
                <View style={[{
                    flexDirection: this.props.horizontalButtonOrientation ? 'row' : 'column',
                }, this.props.buttonGroupStyle]}>
                    {this.state.choices.map((choice, key) => this.checkboxButton(choice, key))}
                </View> */}
                <p
                    // style={[this.props.titleStyle, {
                    //     fontSize: 12,
                    //     fontFamily: 'Gilroy-Medium',
                    // }]}
                >{this.props.title}</p>
                <span
                    // style={[{
                    //     flexDirection: this.props.horizontalButtonOrientation ? 'row' : 'column',
                    // }, this.props.buttonGroupStyle]}
                >
                    {this.state.choices.map((choice, key) => this.checkboxButton(choice, key))}
                </span>
            </div>
        );
    }
}

CheckBox.defaultProps = {
    titleStyle: {
        fontSize: 21,
        color: '#3c3c3c',
        fontFamily: 'Nunito',
    },
    horizontalLabelOrientation: true,
    buttonColor: '#3c3c3c',
    buttonSize: 15,
};
CheckBox.propTypes = {
    /**
     * Callback to be invoked when a Check Box Button is selected
     */
    onSelect: PropTypes.func,
    /**
     * Title of the Check Box Button Group
     */
    title: PropTypes.string,
    /**
     * Style of the Check Box Button Title
     */
    titleStyle: PropTypes.object,
    /**
     * Size of the Check Box Button Group wrapper
     */
    buttonGroupStyle: PropTypes.object,
    /**
     * An array of objects of the format {option:''}
     */
    choices: PropTypes.arrayOf(PropTypes.shape({
        option: PropTypes.string.isRequired,
    })).isRequired,
    /**
     * A boolean value to set Check Box Button orientation whether Horizontal or Vertical
     */
    horizontalButtonOrientation: PropTypes.bool,
    /**
     * A boolean value to set Check Box Button label's orientation whether Horizontal or Vertical
     */
    horizontalLabelOrientation: PropTypes.bool,
    /**
     * Size of the Check Box Button
     */
    buttonSize: PropTypes.number,
    /**
     * Color of the Check Box Button
     */
    buttonColor: PropTypes.string,

};