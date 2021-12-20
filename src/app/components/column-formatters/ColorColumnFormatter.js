import React from "react";

export const ColorColumnFormatter = (cellContent, color) => (
    <>
        {console.log("color: ", cellContent, color)}
        <span style={{ color: color }}>{cellContent}</span>
    </>
);
