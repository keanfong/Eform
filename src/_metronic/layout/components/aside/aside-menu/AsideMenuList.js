/* eslint-disable jsx-a11y/role-supports-aria-props */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";

import { useLocation } from "react-router";
import { NavLink } from "react-router-dom";
import SVG from "react-inlinesvg";
import {
    toAbsoluteUrl,
    checkIsActive,
    checkHasAccessReports,
} from "../../../../_helpers";
import { selectUserData } from "../../../../../redux/selectors/form-selector.js";

const AsideMenuList = ({ layoutProps, user }) => {
    const [showReport, setShowReport] = useState(false);
    const location = useLocation();
    const getMenuItemActive = (url, hasSubmenu = false) => {
        return checkIsActive(location, url) ? ` ${!hasSubmenu && "menu-item-active"} menu-item-open menu-item-not-hightlighted` : "";
    };

    useEffect(() => {
        let userRoles = user.roles || [];

        let hasAccess = checkHasAccessReports(userRoles);

        setShowReport(hasAccess);
    }, [setShowReport, user]);

    return (
        <>
            {/* begin::Menu Nav */}
            <ul className={`menu-nav ${layoutProps.ulClasses}`}>
                {/*begin::dashboard sidebar*/}
                <li className={`menu-item ${getMenuItemActive("/dashboard", false)}`}>
                    <NavLink className={`menu-link`} to="/dashboard">
                        <span className="svg-icon menu-icon">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Design/Layers.svg")} title={'Dashboard'}/>
                        </span>
                        <span className="menu-text">Dashboard</span>
                    </NavLink>
                </li>

                {/*begin::forms sidebar*/}
                <li className={`menu-item ${getMenuItemActive("/forms", false)}`}>
                    <NavLink className={`menu-link ${getMenuItemActive("/forms", false)}`} to="/forms">
                        <span className="svg-icon menu-icon">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Design/PenAndRuller.svg")} title={'forms'}/>
                        </span>
                        <span className="menu-text">Forms</span>
                    </NavLink>
                </li>

                {/*begin::pending sidebar*/}
                <li className={`menu-item ${getMenuItemActive("/pending", false)}`}>
                    <NavLink className={`menu-link ${getMenuItemActive("/pending", false)}`} to="/pending">
                        <span className="svg-icon menu-icon">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Design/Edit.svg")}  title={'Pending'}/>
                        </span>
                        <span className="menu-text">Pending</span>
                    </NavLink>
                </li>

                {/*begin::records sidebar*/}
                <li className={`menu-item ${getMenuItemActive("/history", false)}`}>
                    <NavLink className={`menu-link ${getMenuItemActive("/history", false)}`} to="/history">
                        <span className="svg-icon menu-icon">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Home/Alarm-clock.svg")} title={'History'} />
                        </span>
                        <span className="menu-text">History</span>
                    </NavLink>
                </li>
                {/*begin::draft sidebar*/}
                <li className={`menu-item ${getMenuItemActive("/drafts", false)}`} >
                    <NavLink className={`menu-link ${getMenuItemActive("/drafts", false)}`} to="/drafts">
                        <span className="svg-icon menu-icon">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Home/Trash.svg")} title={'Drafts'}/>
                        </span>
                        <span className="menu-text">Drafts</span>
                    </NavLink>
                </li>

                {/*begin::reports sidebar*/}
                {showReport ? (
                    <>
                        <li className={`menu-item ${getMenuItemActive("/reports", false)} menu-item-submenu`} aria-haspopup="true" data-menu-toggle="hover">
                            <div className={`menu-link menu-toggle`} to="#">
                                <span className="svg-icon menu-icon">
                                    <SVG src={toAbsoluteUrl("/media/svg/icons/Design/Pencil.svg")} title={'FC Report'}/>
                                </span>
                                <span className="menu-text">FC Report</span>
                                <i className="menu-arrow"></i>
                            </div>
                            <div className="menu-submenu" kt-hidden-height="200"  >
                                <i className="menu-arrow"></i>
                                <ul className="menu-subnav">
                                    <li className="menu-item menu-item-parent" aria-haspopup="true">
                                        <span className="menu-link">
                                            <span className="menu-text">FC Report</span>
                                        </span>
                                    </li>
                                    <li className={`menu-item ${getMenuItemActive("/reports/corporate-claim-report", false)}`}>
                                        <NavLink to='/reports/corporate-claim-report' className={`menu-link ${getMenuItemActive("/reports", false)}`} title={'Corporate Claim'}>
                                            <i className="menu-bullet menu-bullet-dot">
                                                <span></span>
                                            </i>
                                            <span className="menu-text">Corporate Claim</span>
                                        </NavLink>
                                    </li>
                                    <li className={`menu-item ${getMenuItemActive("/reports/staff-claim-report", false)}`}>
                                        <NavLink to='/reports/staff-claim-report' className={`menu-link ${getMenuItemActive("/reports", false)}`} title={'Staff Claim'}>
                                            <i className="menu-bullet menu-bullet-dot">
                                                <span></span>
                                            </i>
                                            <span className="menu-text">Staff Claim</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </>
                ) : null}
            </ul>

            {/* end::Menu Nav */}
        </>
    );
};

const mapStateToProps = createStructuredSelector({
    user: selectUserData,
});

export default connect(mapStateToProps)(AsideMenuList);
