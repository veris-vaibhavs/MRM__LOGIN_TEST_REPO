import React from 'react';
import classes from './styles.module.css';

const modal = React.memo((props) => {
    return (
        <div className={classes.Container} onClick={props.handleClose}>
            <div className={[classes.Modal, props.className ? props.className : ''].join(' ')}
                 onClick={(event) => {
                     event.stopPropagation();
                 }}>
                {props.children}
            </div>
        </div>
    );
});

export default modal;
