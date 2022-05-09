import React from 'react';
import classes from './styles.module.css';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

class Large extends React.Component {
    render() {
        const { t } = this.props;
        return (
            <div className={classes.Container}>
                <div className={classes.SubNavigation}>
                    <div className={classes.LinksContainer}>
                        {this.props.links.map((link) => (
                            <div
                                className={[classes.Link, (this.props.pathname === link.to || this.props.pathname === `${link.to}/`) ? classes.Active : ''].join(' ')}>
                                <Link to={link.to}>{link.label}</Link>
                            </div>
                        ))}
                        {/* <div
                            className={[classes.Link, (this.props.pathname === '/downloadreport' || this.props.pathname === `/downloadreport/`) ? classes.Active : ""].join(" ")}>
                            <Link to={'/downloadreport'}>{t("reports.downloadCenter")}</Link>
                        </div> */}
                    </div>
                    <div className={classes.VenueContainer}>
                        <div className={classes.FireList}>
                            {this.props.isAdmin && this.props.renderFirelistBtn()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation()(Large);
