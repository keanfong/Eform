import React from "react";

export const StatusColumnFormatter = (cellContent, row) => {
    let color = "";

    if (row && row.status === "pending") color = "danger";
    else if (row && row.status === "waiting") color = "warning";
    else if (row && row.status === "approved") color = "info";
    else if (row && row.status === "complete") color = "success";
    else if (row && row.status === "draft") color = "primary";

    return (
        <>
            <span className={`label label-lg label-${color} label-inline`}>
                {cellContent
                    ? cellContent.replace(
                          /\w\S*/g,
                          (m) =>
                              m.charAt(0).toUpperCase() +
                              m.substr(1).toLowerCase()
                      )
                    : "      "}
            </span>
        </>
    );
};
