import React from 'react';
import PropTypes from 'prop-types';


class Form extends React.Component {
    componentDidMount() {
        document.addEventListener('keypress', this.handleEnter);
    }

    componentWillUnmount() {
        document.removeEventListener('keypress', this.handleEnter);
    }

    handleEnter = (event) => {
        if (event.key === 'Enter') {
            this.props.onSubmit && this.props.onSubmit();
        }
    };

    render() {
        return this.props.children;
    }
}

Form.propTypes = {
    /** Function is triggered when someone hits enter */
    onSubmit: PropTypes.func.isRequired,
};

export default Form;