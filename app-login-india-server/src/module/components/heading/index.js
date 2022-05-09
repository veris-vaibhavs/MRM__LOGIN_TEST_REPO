import React from 'react';
import classes from './styles.module.css';
import { withTranslation } from 'react-i18next';

class Heading extends React.Component {
    render() {
        const { t } = this.props;
        return (
            <div className={classes.Container}>
                {this.props.name}
            </div>
        );
    }
}

export default withTranslation()(Heading);
