import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import Badge from "@material-ui/core/Badge/Badge";

import PendingForm from "./pending-forms.jsx";

import { Card, CardBody } from "../../../_metronic/_partials/controls/card.js";
import { LayoutSplashScreen } from "../../../_metronic/layout";

const Activity = () => {
    const [tab, setTab] = useState("pending");
    const [pendingCount, setPendingCount] = useState(0);
    const [ongoingCount, setOngoingCount] = useState(0);
    const [pendingPageSize, setPendingPageSize] = useState(5);
    const [ongoingPageSize, setOngoingPageSize] = useState(5);
    const [reload, setReload] = useState(false);

    const getStatus = () => {
        return { type: tab };
    };

    const setTabValue = (event, tabValue) => {
        event.preventDefault();
        setReload(true);
        setTab(tabValue);
    };
    useEffect(() => {
        // setTimeout(() => {
        setReload(false);
        // }, 10);
    }, [reload, tab]);

    return (
        <div className="activity-page col-12">
            {!reload ? (
                <Card>
                    <CardBody>
                        <ul
                            className="nav nav-tabs nav-tabs-line "
                            role="tablist"
                        >
                            <li
                                key="pending"
                                className="nav-item"
                                onClick={(e) => setTabValue(e, "pending")}
                            >
                                <span
                                    className={`nav-link ${tab === "pending" &&
                                        "active"}`}
                                    data-toggle="tab"
                                    role="tab"
                                    aria-selected={(
                                        tab === "pending"
                                    ).toString()}
                                >
                                    <span>Pending for Action</span>
                                    <span className="ml-5 mr-5">
                                        <Badge
                                            showZero
                                            badgeContent={pendingCount || 0}
                                            className='badge-pink-color'
                                        />
                                    </span>
                                </span>
                            </li>
                            {
                                <>
                                    {" "}
                                    <li
                                        className="nav-item"
                                        key="ongoing"
                                        onClick={(e) =>
                                            setTabValue(e, "ongoing")
                                        }
                                    >
                                        <span
                                            className={`nav-link ${tab ===
                                                "ongoing" && "active"}`}
                                            data-toggle="tab"
                                            role="button"
                                        // aria-selected={(tab === "approvers").toString()}
                                        >
                                            <span>Ongoing Submission</span>
                                            <span className="ml-5 mr-5">
                                                <Badge
                                                    showZero
                                                    badgeContent={
                                                        ongoingCount || 0
                                                    }
                                                    color="primary"
                                                />
                                            </span>
                                        </span>
                                    </li>
                                </>
                            }
                        </ul>

                        <div className="mt-5">
                                <PendingForm
                                    returnCountOnly={tab !== "pending"}
                                    status="pending"
                                    setParentTotal={setPendingCount}
                                    pageSize={pendingPageSize}
                                    initialColumns={[]}
                                    setPageSize={setPendingPageSize}
                                    getStatus={getStatus}
                                />
                                <PendingForm
                                    returnCountOnly={tab !== "ongoing"}
                                    type="ongoing"
                                    setParentTotal={setOngoingCount}
                                    status="pending,approved"
                                    pageSize={ongoingPageSize}
                                    initialColumns={[]}
                                    setPageSize={setOngoingPageSize}
                                    getStatus={getStatus}
                                />
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <LayoutSplashScreen />
            )}
        </div>
    );
};

export default connect()(Activity);
