import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import Badge from "@material-ui/core/Badge/Badge";

import PendingForm from "../activity/pending-forms.jsx";

import { Card, CardBody } from "../../../_metronic/_partials/controls/card.js";
import { LayoutSplashScreen } from "../../../_metronic/layout";

const Records = () => {
    const [tab, setTab] = useState("past-action");
    const [pastActionCount, setPastActionCount] = useState(0);
    const [pastSubmissionCount, setPastSubmissionCount] = useState(0);
    const [pastSubmissionPageSize, setPastSubmissionPageSize] = useState(10);
    const [pastActionPageSize, setPastActionPageSize] = useState(10);
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
        <div className="record-page col-12">
            {!reload ? (
                <Card>
                    <CardBody>
                        <ul
                            className="nav nav-tabs nav-tabs-line "
                            key="tab"
                            role="tablist"
                        >
                            <li
                                key="past-action"
                                className="nav-item"
                                onClick={(e) => setTabValue(e, "past-action")}
                            >
                                <span
                                    className={`nav-link ${tab ===
                                        "past-action" && "active"}`}
                                    data-toggle="tab"
                                    role="tab"
                                    aria-selected={(
                                        tab === "past-action"
                                    ).toString()}
                                >
                                    <span>Past Action</span>
                                    <span className="ml-5 mr-5">
                                        <Badge
                                            showZero
                                            badgeContent={pastActionCount || 0}
                                            color="primary"
                                        />
                                    </span>
                                </span>
                            </li>
                            {
                                <>
                                    {" "}
                                    <li
                                        className="nav-item"
                                        key="past-submission"
                                        onClick={(e) =>
                                            setTabValue(e, "past-submission")
                                        }
                                    >
                                        <span
                                            className={`nav-link ${tab ===
                                                "past-submission" && "active"}`}
                                            data-toggle="tab"
                                            role="button"
                                            // aria-selected={(tab === "approvers").toString()}
                                        >
                                            <span>Past Submission</span>
                                            <span className="ml-5 mr-5">
                                                <Badge
                                                    showZero
                                                    badgeContent={
                                                        pastSubmissionCount || 0
                                                    }
                                                    color="secondary"
                                                />
                                            </span>
                                        </span>
                                    </li>
                                </>
                            }
                        </ul>
                        <div className="mt-5">
                            {
                                <>
                                    <PendingForm
                                        isNotEqual={true}
                                        returnCountOnly={
                                            tab !== "past-action" ? true : false
                                        }
                                        setParentTotal={setPastActionCount}
                                        status="pending,waiting,draft"
                                        pageSize={pastActionPageSize}
                                        setPageSize={setPastActionPageSize}
                                        initialColumns={[]}
                                        getStatus={getStatus}
                                    />
                                </>
                            }
                            {
                                <>
                                    <PendingForm
                                        isNotEqual={true}
                                        returnCountOnly={
                                            tab !== "past-submission"
                                                ? true
                                                : false
                                        }
                                        setParentTotal={setPastSubmissionCount}
                                        type="past-submission"
                                        status="pending,approved,draft"
                                        pageSize={pastSubmissionPageSize}
                                        setPageSize={setPastSubmissionPageSize}
                                        initialColumns={[]}
                                        getStatus={getStatus}
                                    />
                                </>
                            }
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <LayoutSplashScreen />
            )}
        </div>
    );
};

export default connect()(Records);
