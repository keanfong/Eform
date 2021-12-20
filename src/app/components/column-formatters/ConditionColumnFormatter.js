import React from "react";

export const ConditionColumnFormatter = (cellContent, condition) => (
    <>
        <span className={`badge badge-dot`}></span>
        &nbsp;
        <span className={`font-weight-bold font-size-lg`}>
            {cellContent
                ? cellContent
                      .toString()
                      .replace(
                          /\w\S*/g,
                          (m) => m.charAt(0).toUpperCase() + m.substr(1)
                      )
                      .replace(/-/g, " ")
                : cellContent}
        </span>
    </>
);
