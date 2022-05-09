import React from 'react';
import classes from './styles.module.css';

const content = React.memo((props) => {
    return (
        <div id={props.id ? 'modalContent' : ''}
             className={[classes.Content, props.className ? props.className : ''].join(' ')}>
            {props.children}
        </div>
    );
});

export default content;
