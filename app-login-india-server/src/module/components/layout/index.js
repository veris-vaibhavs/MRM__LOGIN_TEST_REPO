import React, { Component } from 'react';
import classes from './styles.module.css';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import * as actions from 'redux/actions/actionTypes';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import BarcodeReader from 'react-barcode-reader';
import cogoToast from 'cogo-toast';
import { ReactSVG } from 'react-svg';
import { Large } from './components';
import { Select } from 'veris-styleguide';
import { getLocationHierarchy, getOrganisationDetails, getTerminals, getVenues } from 'requests';
import AxiosSingleton from 'axios-instance';

const VENUE_TYPES = {
    1: 'VMS',
    2: 'ROOM',
    3: 'DESK',
    4: 'CAMPUS',
    5: 'BUILDING',
    6: 'FLOOR',
    7: 'UNIT',
};

export function renameLocationNestedKeys(type, data) {
    return data.map((item) => {
        let venue_type = VENUE_TYPES[item.type]
            ? VENUE_TYPES[item.type]
            : item.type;
        let venue_type_jsx = (
            <div
                className={'defaultVenueName'}
            >
            </div>
        );
        // setup venue name for searching
        item['filterTag'] = item.name;
        item['meta'] = item.meta;
        // setup value
        item['value'] = item.id;
        if (type === 'multiple') {
            item['disableCheckbox'] = false;
            item['selectable'] = true;
            item['checkable'] = true;
        } else {
            // disable checkbox for non venues
            item['disableCheckbox'] = VENUE_TYPES[item.type] ? false : true;
            // only the venues are selectable
            item['selectable'] = VENUE_TYPES[item.type] ? true : false;
            // only the venues are checkable
            item['checkable'] = VENUE_TYPES[item.type] ? true : false;
        }


        delete item.id;
        // setup title
        item['title'] = item.name ? (
            <div style={{ display: 'flex' }}>
                <div>{item.name}</div>
                <span>{venue_type_jsx}</span>
            </div>
        ) : (
            <div style={{ display: 'flex' }}>
                <div>{'---'}</div>
                <span>{venue_type_jsx}</span>
            </div>
        );
        delete item.name;
        renameLocationNestedKeys(type, item.children);
        return item;
    });
}

class Layout extends Component {
    state = {
        layout: '',
    };
    handleResize = (event) => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            let width = window.innerWidth;
            if (width < 992) {
                this.setState({ layout: 'medium' });
            } else {
                this.setState({ layout: 'large' });
            }
        }, 150);
    };
    init = async () => {
        try {
            let venueOptions = await getVenues();
            let terminalOptions = await getTerminals();
            let orgDetails = await getOrganisationDetails();
            // Venue Dropdown data
            let activityDropdowndata = await getLocationHierarchy('Venue Admin');
            let inviteDropdowndata = await getLocationHierarchy('can invite');
            let singleactivityDropdowndata = JSON.parse(JSON.stringify(activityDropdowndata));
            let singleinviteDropdowndata = JSON.parse(JSON.stringify(inviteDropdowndata));
            // Setting into redux
            let multipleactivityLocation = renameLocationNestedKeys('multiple', [...activityDropdowndata]);
            let singleactivityLocation = renameLocationNestedKeys('single', [...singleactivityDropdowndata]);
            let multipleinviteLocation = renameLocationNestedKeys('multiple', [...inviteDropdowndata]);
            let singleinviteLocation = renameLocationNestedKeys('single', [...singleinviteDropdowndata]);

            this.props.appUpdateState({
                venueOptions: venueOptions,
                terminalOptions: terminalOptions,
                hierarchyLocation: singleinviteLocation,
                multipleactivityLocation: multipleactivityLocation,
                singleactivityLocation: singleactivityLocation,
                multipleinviteLocation: multipleinviteLocation,
                singleinviteLocation: singleinviteLocation,
                orgDetails: orgDetails,
                loadingVenues: false,
            });

        } catch (error) {
            this.props.appUpdateState({
                loadingVenues: false,
            });
        }
    };

    async componentDidMount() {
        let width = window.innerWidth;
        if (width < 992) {
            this.setState({ layout: 'medium' }, () => {
                this.init();
            });
        } else {
            this.setState({ layout: 'large' }, () => {
                this.init();
            });
        }
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    handleVenueChange = (event) => {
        this.props.appUpdateFilters({
            venue: event,
        });
    };
    handleFirelist = () => {
        const { t } = this.props;
        window.mixpanel && window.mixpanel.track('Firelist', {
            'module': 'activities',
            'type': 'view',
        });
        this.props.appUpdateState({
            firelist: !this.props.firelist,
        });
        this.props.activitiesUpdateFilters({
            startTime: moment()
                .startOf('day')
                .subtract(7, 'days'),
            endTime: moment()
                .endOf('day'),
            currentStatus: {
                label: 'Checked In',
                value: 'check_in',
            },
            terminals: null,
            visitor: {
                label: 'All',
                value: 'visitor_all',
            },
        });
        this.props.activitiesUpdateSearch({
            field: '',
            value: '',
        });
        this.props.history.replace('/activities');
        cogoToast.info(t('layout.info-firelist'), { position: 'bottom-right' });

    };
    renderVenueFilter = (props) => (
        <div className={classes.Venue}>
            <ReactSVG
                beforeInjection={svg => {
                    svg.firstElementChild.innerHTML = '';
                    svg.classList.add(classes.LocationIcon);
                }}
                src='/assets/icons/real-estate-location-building-pin.svg'
            />
            <div className={classes.VenueDropdown}>
                <Select
                    value={this.props.filters.venue}
                    onChange={this.handleVenueChange}
                    styles={{
                        control: (provided, state) => ({
                            ...provided,
                            border: 'none',
                            borderRadius: '9px',
                            fontSize: '14px',
                            lineHeight: '22px',
                            paddingLeft: '12px',
                            minHeight: '36px',
                            boxSizing: 'border-box',
                            boxShadow: 'none',
                            backgroundColor: 'transparent',
                            '&:hover': {
                                borderColor: !state.isFocused ? '#c2c5cc' : '#6a6afe',
                            },
                        }),
                    }}
                    {...props}
                />
            </div>
        </div>
    );
    renderFirelistBtn = () => {
        const { t } = this.props;
        return (
            <div onClick={this.handleFirelist}>
                <ReactSVG
                    beforeInjection={svg => {
                        svg.firstElementChild.innerHTML = t('layout.t-firelist');
                        svg.classList.add(classes.FireList);
                    }}
                    src='/assets/icons/safety-fire-shield.svg'
                />
            </div>
        );
    };

    handleScan = (data = '') => {
        if (data.length < 10) {
            this.props.history.push('/invites/' + data.replace('=', '')
                .trim());
        } else {
            this.props.history.push('/activities/' + data.replace('=', '')
                .trim());
        }
    };

    handleError(err) {
        console.error(err);
    }

    render() {
        const { t } = this.props;
        let roles = AxiosSingleton.config.roles || [];
        const isAdmin = roles.includes('Organisation Admin') || roles.includes('Venue Admin');
        let { pathname } = this.props.history.location;
        let links = [
            {
                label: t('invitesSingle.h-1-visitor-details'),
                to: '/activities',
            },
            {
                label: t('invitesSingle.h-1-Visitors'),
                to: '/invites',
            },
        ];
        if (isAdmin) {
            links.push({
                label: t('layout.lk-analytics'),
                to: '/analytics',
            });
        }
        let props = {
            renderVenueFilter: this.renderVenueFilter,
            renderFirelistBtn: this.renderFirelistBtn,
            pathname: pathname,
            venueOptions: this.props.venueOptions,
            links: links,
            isAdmin: isAdmin,
        };
        return (
            <div>
                {(() => {
                    switch (this.state.layout) {
                        case 'medium':
                            return <Large {...props} />;
                        case 'large':
                            return <Large {...props} />;
                    }
                })()}
                {/*<div onClick={()=>{*/}
                {/*    this.props.history.push("/invites/00037791/")*/}
                {/*}}>Test barcode</div>*/}
                <div className={classes.Content}>
                    {this.props.children}
                </div>
                <BarcodeReader
                    onError={this.handleError}
                    onScan={this.handleScan}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        hierarchyLocation: state.app.hierarchyLocation ? state.app.hierarchyLocation : [],
        multipleactivityLocation: state.app.multipleactivityLocation ? state.app.multipleactivityLocation : [],
        singleactivityLocation: state.app.singleactivityLocation ? state.app.singleactivityLocation : [],
        multipleinviteLocation: state.app.multipleinviteLocation ? state.app.multipleinviteLocation : [],
        singleinviteLocation: state.app.singleinviteLocation ? state.app.singleinviteLocation : [],
        venueOptions: state.app.venueOptions ? state.app.venueOptions : [],
        filters: state.app.filters,
        firelist: state.app.firelist,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        // appUpdateState: (updatedState) => {
        //     dispatch(actions.appUpdateState(updatedState));
        // },
        // appUpdateFilters: (updatedFilters) => {
        //     dispatch(actions.appUpdateFilters(updatedFilters));
        // },
        // activitiesUpdateFilters: (updatedFilters) => {
        //     dispatch(actions.activitiesUpdateFilters(updatedFilters));
        // },
        // activitiesUpdateSearch: (updatedSearch) => {
        //     dispatch(actions.activitiesUpdateSearch(updatedSearch));
        // },
    };
};

export default withTranslation()(withRouter(connect(mapStateToProps, mapDispatchToProps)(Layout)));
