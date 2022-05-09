import React from 'react';
import classes from './styles.module.css';
import { Button } from 'veris-styleguide';
import { ReactSVG } from 'react-svg';

const header = React.memo((props) => {
    return (
        <div className={[classes.Header, props.className ? props.className : ''].join(' ')}>
            <div className={classes.Heading}>
                {props.heading}
            </div>
            <div className={classes.BtnContainer}>
                <Button
                    theme='vrs-btn-icon-only'
                    onClick={props.handleClose}
                    icon={
                        <ReactSVG
                            beforeInjection={svg => {
                                svg.classList.add(classes.CloseIcon);
                            }}
                            src='/assets/icons/close.svg'
                        />
                    }
                />
            </div>
        </div>
    );
});

export default header;
