/* eslint-disable no-unused-vars */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useState, useMemo, useEffect } from "react";
import { Nav, Tab, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import SVG from "react-inlinesvg";
import objectPath from "object-path";
import { useHtmlClassService } from "../../../_core/MetronicLayout";
import { toAbsoluteUrl } from "../../../../_helpers";
import { DropdownTopbarItemToggler } from "../../../../_partials/dropdowns";
import { apiMarkAllNotificationsAsRead, getAllNotifications } from "../../../../../app/modules/services/api";
import Badge from "@material-ui/core/Badge/Badge";
import moment from "moment";

const perfectScrollbarOptions = {
    wheelSpeed: 2,
    wheelPropagation: false,
};

export function UserNotificationsDropdown() {
    const [key, setKey] = useState("Alerts");
    const [notifications, setNotifications] = useState([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
    const bgImage = toAbsoluteUrl("/media/misc/bg-1.jpg");

    const uiService = useHtmlClassService();
    const layoutProps = useMemo(() => {
        return {
            offcanvas: objectPath.get(uiService.config, "extras.notifications.layout") === "offcanvas",
        };
    }, [uiService]);

    useEffect(() => {
        getNotification();
        const interval = setInterval(async () => {
            await getNotification();
        }, 1000 * 15);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (notifications && notifications.length > 0) {
            const unReads = notifications.filter((notification) => notification.unread);
            setUnreadNotificationCount(unReads.length);
        }
    }, [notifications])

    const getNotification = async () => {
        const notificationList = await getAllNotifications();
        if (notificationList) {
            setNotifications(notificationList);
        }
    }

    // const markNotificationAsReadById = (singleNotification) => async () => {
    //     if (singleNotification.unread) {
    //         try {
    //             await apiMarkNotificationAsReadById(singleNotification.id);
    //             const index = notifications.findIndex((notification) => singleNotification.id === notification.id);
    //             // console.log(index, notifications[index].unread)
    //             if (index !== -1) {
    //                 notifications[index].unread = false;
    //                 setNotifications([...notifications]);
    //             }
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }
    // }
    const markAllAsRead = async () => {
            try {
                if (unreadNotificationCount > 0) {
                    await apiMarkAllNotificationsAsRead();
                    getNotification();
                }
            } catch (error) {
                console.log(error);
            }
    }

    return (
        <>
            {layoutProps.offcanvas && (
                <div className="topbar-item">
                    <div className="btn btn-icon btn-clean btn-lg mr-1 pulse pulse-primary" id="kt_quick_notifications_toggle">
                        <span className="svg-icon svg-icon-xl svg-icon-primary flaticon-bell text-primary">
                        </span>
                        <span className="pulse-ring"></span>
                    </div>
                </div>
            )}
            {!layoutProps.offcanvas && (
                <Dropdown drop="down" alignRight  onClick={markAllAsRead}>
                    <Dropdown.Toggle as={DropdownTopbarItemToggler} id="kt_quick_notifications_toggle">
                        <OverlayTrigger placement="bottom" overlay={<Tooltip id="user-notification-tooltip" >User Notifications</Tooltip>}>
                            <div
                                className="btn btn-icon btn-clean btn-lg mr-1 pulse pulse-primary"
                                id="kt_quick_notifications_toggle"
                            >
                                <Badge badgeContent={unreadNotificationCount} className='badge-pink-color'>
                                    <span className="svg-icon svg-icon-xl svg-icon-primary flaticon-bell text-primary">
                                    </span>
                                </Badge>
                                {unreadNotificationCount ? <span className="pulse-ring" /> : null}
                            </div>
                        </OverlayTrigger>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim-up dropdown-menu-lg">
                        <form>
                            {/** Head */}
                            <div className="d-flex flex-column pt-12 bgi-size-cover bgi-no-repeat rounded-top" style={{ backgroundImage: `url(${bgImage})` }} >
                                <h4 className="d-flex flex-center rounded-top">
                                    <span className="text-white text-left w-100 pl-7">
                                        User Notifications
                                    </span>
                                    {/* <span className="btn btn-text btn-success btn-sm font-weight-bold btn-font-md ml-2">
                                        {notifications.length} new
                                    </span> */}
                                </h4>

                                <Tab.Container defaultActiveKey={key}>
                                    {/* <Nav
										as="ul"
										className="nav nav-bold nav-tabs nav-tabs-line nav-tabs-line-3x nav-tabs-line-transparent-white nav-tabs-line-active-border-success mt-3 px-8"
										onSelect={(_key) => setKey(_key)}
									>
										<Nav.Item className="nav-item" as="li">
											<Nav.Link
												eventKey="Alerts"
												className={`nav-link show ${key === "Alerts"
													? "active"
													: ""
													}`}
											>
												Alerts
											</Nav.Link>
										</Nav.Item>
									</Nav> */}

                                    <Tab.Content className="tab-content">
                                        <Tab.Pane eventKey="Alerts" className="p-8">
                                            <PerfectScrollbar options={perfectScrollbarOptions} className="scroll pr-7 mr-n7" style={{ maxHeight: "300px", position: "relative" }}>
                                                {buildNotifications()}
                                            </PerfectScrollbar>
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="Logs" id="topbar_notifications_logs">
                                            <div className="d-flex flex-center text-center text-muted min-h-200px">
                                                All caught up!
                                                <br />
                                                No new notifications.
                                            </div>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Tab.Container>
                            </div>
                        </form>
                    </Dropdown.Menu>
                </Dropdown>
            )}
        </>
    );

    function buildNotifications() {
        if (notifications.length === 0) {
            return (<div className="d-flex flex-center text-center text-muted min-h-200px">
                All caught up!
                <br />
                No new notifications.
            </div>);
        }

        return (
            <div>
                {notifications && notifications.length > 0 && notifications?.map((singleNotification) => {
                    return (
                        <div key={singleNotification.id} className="d-flex align-items-center mb-6">
                            <div className="symbol symbol-40 symbol-light-primary mr-5">
                                <span className="symbol-label">
                                    <SVG src={toAbsoluteUrl("/media/svg/icons/Home/Library.svg")} className="svg-icon-lg svg-icon-primary" title={'Notification'}></SVG>
                                </span>
                            </div>
                            <div className="d-flex flex-column font-weight-bold">
                                <a className={`text-hover-primary mb-1 font-size-lg ${singleNotification.unread === true ? 'text-dark' : 'text-muted'}`}>
                                {/* onClick={markNotificationAsReadById(singleNotification)} */}
                                    {`${singleNotification?.serial_number ? singleNotification?.serial_number : singleNotification?.data?.data} is ${singleNotification?.status}`}
                                </a>
                                <span className="text-muted">
                                    {moment(singleNotification.timestamp).fromNow()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}
