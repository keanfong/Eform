import React, { useState } from "react";
import { connect } from "react-redux";

import Badge from "@material-ui/core/Badge/Badge";

import PendingForm from "../activity/pending-forms.jsx";

import { Card, CardBody } from "../../../_metronic/_partials/controls/card.js";

const DraftForms = () => {
    const [tab, setTab] = useState("drafts");
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    return (
        <div className="draft-page col-12">
            <Card>
                <CardBody>
                    <ul
                        className="nav nav-tabs nav-tabs-line "
                        key="tab"
                        role="tablist"
                    >
                        <li
                            key="drafts"
                            className="nav-item"
                            onClick={() => setTab("drafts")}
                        >
                            <span
                                className={`nav-link ${tab === "drafts" &&
                                    "active"}`}
                                data-toggle="tab"
                                role="tab"
                                aria-selected={(tab === "drafts").toString()}
                            >
                                <span>Drafts</span>
                                <span className="ml-5 mr-5">
                                    <Badge
                                        badgeContent={totalCount}
                                        color="secondary"
                                    />
                                </span>
                            </span>
                        </li>
                    </ul>
                    <div className="mt-5">
                        {tab === "drafts" && (
                            <>
                                <PendingForm
                                    status="draft"
                                    setParentTotal={setTotalCount}
                                    pageSize={pageSize}
                                    setPageSize={setPageSize}
                                    initialColumns={[]}
                                />
                            </>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default connect()(DraftForms);
