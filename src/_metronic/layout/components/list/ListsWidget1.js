/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { Badge } from "react-bootstrap";

export default function ListsWidget1({ className, title, list }) {
    return (
        <>
            <div className={`${className}`}>
                {/* Header */}
                <div className="card-header border-0">
                    <h3 className="card-title font-weight-bolder text-dark">
                        {title}
                    </h3>
                </div>

                {/* Body */}
                <div className="card-body pt-2">
                    {list.map((item, index) => (
                        <div
                            key={index}
                            className="d-flex align-items-center justify-content-between mb-10"
                        >
                            <div className="d-flex align-items-center">
                                <div className="symbol symbol-40 symbol-primary mr-5">
                                    <span className="symbol-label">
                                        <span className="svg-icon svg-icon-lg svg-icon-primary">
                                            <div
                                            // style={{
                                            // 	backgroundColor:
                                            // 		"#2778B7",
                                            // 	width: "2rem",
                                            // 	height: "2rem",
                                            // }}
                                            >
                                                {index + 1}
                                            </div>
                                        </span>
                                    </span>
                                </div>

                                <div className="d-flex flex-column font-weight-bold">
                                    <a
                                        href="#"
                                        className="text-dark text-hover-primary mb-1 font-size-lg"
                                    >
                                        {item.first_name === "" &&
                                        item.last_name === ""
                                            ? item.username
                                            : item.first_name +
                                              " " +
                                              item.last_name}
                                    </a>
                                    <span className="text-muted small">
                                        {item.first_name === "" &&
                                        item.last_name === ""
                                            ? ""
                                            : item.username}
                                    </span>
                                </div>
                            </div>
                            <Badge variant="warning">Pending</Badge>
                            {/* <Badge variant="success">Approved</Badge>
								<Badge variant="danger">Rejected</Badge> */}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
