import React from 'react';
import './styles.error.css';

class InputError extends React.Component {

    render() {
        return (
            <div className='text-error width-100-percent error_input'>
                {this.props.inputType}
            </div>
        );
    }
}

export default InputError;
