import React from 'react';
import classes from './styles.module.css';

const box = React.memo((props) => {
    return (
        <div className={classes.Container}>
            {props.children}
        </div>
    );
});

export default box;