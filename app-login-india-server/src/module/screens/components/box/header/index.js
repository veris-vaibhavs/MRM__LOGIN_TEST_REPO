import React from 'react';
import classes from './styles.module.css';
import { withTranslation } from 'react-i18next';
import { ReactSVG } from 'react-svg';

const header = React.memo((props) => {
    const { t } = props;
    return (
        <div className={classes.Container}>
            {props.goBack &&
                <div className={classes.BackBtn}
                     onClick={props.goBack}
                >
                    <ReactSVG
                        beforeInjection={svg => {
                            svg.firstElementChild.innerHTML = '';
                            svg.classList.add(classes.BackIcon);
                        }}
                        src='/assets/icons/arrow-left.svg'
                    />
                    <div>{t('box.header-back_btn')}</div>
                </div>
            }
            <div className={classes.SubContainer}>
                <h3 className={classes.Heading}>{props.heading}</h3>
            </div>
            <h4 className={classes.SubHeading}>{props.subHeading}</h4>
        </div>
    );
});

export default withTranslation()(header);