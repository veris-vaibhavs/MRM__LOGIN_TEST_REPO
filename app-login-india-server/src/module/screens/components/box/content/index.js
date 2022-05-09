import React from 'react';
import classes from './styles.module.css';

const content = React.memo((props) => {
    return (
        <div className={classes.Container}>
            {props.children}
        </div>
    );
});

export default content;