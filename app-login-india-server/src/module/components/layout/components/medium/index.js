import React from 'react';
import classes from './styles.module.css';
import { Link } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

class Medium extends React.Component {
    state = {
        menu: false,
    };

    render() {
        return (
            <div className={classes.Container}>
                <div onClick={() => {
                    this.setState({ menu: true });
                }}>
                    <ReactSVG
                        beforeInjection={svg => {
                            svg.firstElementChild.innerHTML = 'Menu';
                            svg.classList.add(classes.MenuIcon);
                        }}
                        src='/assets/icons/arrow-circle-down.svg'
                    />
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <div className={classes.VenueContainer}>
                        {this.props.renderVenueFilter({
                            options: [{
                                label: 'All Venues',
                                value: '',
                            }, ...this.props.venueOptions],
                        })}
                    </div>
                    <div className={classes.FireList}>
                        {this.props.renderFirelistBtn()}
                    </div>
                </div>
                {this.state.menu &&
                    <React.Fragment>
                        <div
                            onClick={() => {
                                this.setState({ menu: false });
                            }}
                            className={classes.Backdrop}
                        />
                        <div className={classes.DropDown}>
                            <ul>
                                {this.props.links.map((link) => (
                                    <li onClick={() => {
                                        this.setState({ menu: false });
                                    }} className={classes.Link}>
                                        <Link to={link.to}>{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </React.Fragment>
                }
            </div>
        );
    }
}

export default Medium;
