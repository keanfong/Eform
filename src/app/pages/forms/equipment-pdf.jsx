import React from "react";
import moment from "moment";

const EquipmentPDF = ({ formId, fieldValue, tableFieldValue, tallyFieldValue, detailForm }) => {
    const deliveryDate = detailForm?.executions[0]?.slips[0].data?.table_fields[0]['deliver-date'].value;
    if (fieldValue) {
        Object.keys(fieldValue).forEach((field) => {
            if (fieldValue[field].type === 'date') {
                if (fieldValue[field].value instanceof moment) {
                    fieldValue[field].value = moment(fieldValue[field].value).format('DD-MM-YYYY');
                }
            }
        });
        // console.log('gone', fieldValue)
    } else {
        return <span>no data found</span>
    }
    return (
        <React.Fragment>
            <div style={{ width: "100%", display: "inline-flex", margin: "0 0 auto", lineHeight: 1, }}>
                <div style={{ width: "100%", display: "block", marginRight: "auto" }}>
                    <div style={{ width: "100%", display: "flex", margin: "0" }}>
                        <span style={{ width: "80%", display: "relative", height: "20px", }}>
                            <hr style={{ borderWidth: "thick", border: "2px solid", marginTop: "20px" }} />
                        </span>
                        <span style={{ width: "20%", display: "relative" }}>
                            <img style={{ position: "relative", width: "115px", marginTop: "5px" }} src="/media/bg/tekmark.png" alt="Logo" />
                        </span>
                    </div>
                </div>
            </div>
            <div style={{ width: "100%", fontSize: "8px", margin: "0 30px" }}>
                <div style={{ width: "100%", margin: "5px 10px" }}>
                    <h4 style={{ textAlign: "center" }}>
                        Equipment Acknowledgement
                    </h4>
                </div>

                <div style={{ width: "100%", margin: "5px 10px", display: "flex", fontWeight: "bold" }}>
                    <div style={{ width: "10%" }}>Form ID</div>
                    <div style={{ width: "10%" }}>:</div>
                    <div style={{ width: "20%" }}>{formId}</div>
                </div>
                <div style={{ width: "100%", margin: "5px 10px", display: "flex", fontWeight: "bold", }}>
                    <span style={{ width: "70%", display: "inline-flex" }}>
                        <span style={{ width: "14.5%" }}>Ship Address</span>
                        <span style={{ width: "14%" }}>:</span>
                        <span style={{ width: "70%" }}>
                            {fieldValue["end-user-company-name"].value}
                            {fieldValue["end-user-shipping-address"].value}
                        </span>
                    </span>
                    <span style={{ width: "30%", display: "inline-flex" }}>
                        <span style={{ width: "40%" }}>Date</span>
                        <span style={{ width: "10%" }}>:</span>
                        <span style={{ width: "50%" }}>
                            {deliveryDate ? moment(deliveryDate).format("DD-MM-YYYY") : null}
                        </span>
                    </span>
                </div>
                <div style={{ width: "100%", margin: "5px 10px", display: "flex", fontWeight: "bold", }}>
                    <span style={{ width: "70%", display: "inline-flex" }}>
                        <span style={{ width: "14.5%" }}>Shipping Address</span>
                        <span style={{ width: "15%" }}>:</span>
                        <span style={{ width: "70%" }}>{fieldValue["entity-of-requestor"].value}</span>
                    </span>
                    <span style={{ width: "30%", display: "inline-flex" }}>
                        <span style={{ width: "40%" }}></span>
                        <span style={{ width: "10%" }}></span>
                        <span style={{ width: "50%" }}></span>
                    </span>
                </div>
                <div style={{ width: "100%", margin: "5px 10px", display: "flex", fontWeight: "bold", }}>
                    <span style={{ width: "70%", display: "inline-flex" }}>
                        <span style={{ width: "14.5%" }}></span>
                        <span style={{ width: "14%" }}></span>
                        <span style={{ width: "70%" }}>
                        </span>
                    </span>
                    <span style={{ width: "30%", display: "inline-flex" }}>
                        <span style={{ width: "40%" }}>Contact Person</span>
                        <span style={{ width: "10%" }}>:</span>
                        <span style={{ width: "50%" }}>
                            {fieldValue["requestor-contact-number"].value}
                        </span>
                    </span>
                </div>
                <div style={{ width: "100%", margin: "5px 10px", display: "flex", fontWeight: "bold", }}>
                    <span style={{ width: "70%", display: "inline-flex" }}>
                        <span style={{ width: "14.5%" }}></span>
                        <span style={{ width: "14%" }}></span>
                        <span style={{ width: "70%" }}>
                        </span>
                    </span>
                    <span style={{ width: "30%", display: "inline-flex" }}>
                        <span style={{ width: "40%" }}>Contact No</span>
                        <span style={{ width: "10%" }}>:</span>
                        <span style={{ width: "50%" }}>
                            {fieldValue["requestor-contact-number"].value}
                        </span>
                    </span>
                </div>
                <div style={{ width: "100%", margin: "5px 10px", display: "flex", fontWeight: "bold" }}>
                    <span style={{ width: "70%", display: "inline-flex" }}>
                        <span style={{ width: "14.5%" }}></span>
                        <span style={{ width: "14%" }}></span>
                        <span style={{ width: "70%" }}>

                        </span>
                    </span>
                    <span style={{ width: "30%", display: "inline-flex" }}>
                        <span style={{ width: "40%" }}>Contact Email</span>
                        <span style={{ width: "10%" }}>:</span>
                        <span style={{ width: "50%" }}>
                            {fieldValue["requestor-email"].value}
                        </span>
                    </span>
                </div>

                {/* <div
                style={{
                    width: "100%",
                    margin: "5px 10px",
                    display: "flex",
                    fontWeight: "bold",
                }}
            >
                <div style={{ width: "10%" }}></div>
                <div style={{ width: "10%" }}>:</div>
                <div style={{ width: "30%" }}>
                    {fieldValue["end-user-contact-number"].value}
                </div>
            </div> */}
                <div style={{ width: "100%", margin: "5px 10px", display: "flex", fontWeight: "bold" }}>
                    <div style={{ width: "10%" }}>Contact Person</div>
                    <div style={{ width: "10%" }}>:</div>
                    <div style={{ width: "30%" }}>
                        {/* {fieldValue["different-end-user"]?.value
                        ? fieldValue["shipping-address-2"].value
                        : fieldValue["end-user-shipping-address"].value} */}
                        {fieldValue["end-user-contact-person"].value}
                    </div>
                </div>
                <div style={{ width: "100%", margin: "5px 10px", display: "flex", fontWeight: "bold", }}>
                    <div style={{ width: "10%" }}>Telephone Number</div>
                    <div style={{ width: "10%" }}>:</div>
                    <div style={{ width: "30%" }}>
                        {/* {fieldValue["different-end-user"]?.value
                        ? fieldValue["contact-number-2"].value
                        : fieldValue["end-user-company-name"].value} */}
                        {
                            fieldValue["end-user-contact-number"].value
                        }
                    </div>
                </div>

                <div style={{ width: "100%", margin: "5px 10px", display: "flex", fontWeight: "bold" }}>
                    <div style={{ width: "10%" }}>Email</div>
                    <div style={{ width: "10%" }}>:</div>
                    <div style={{ width: "30%" }}>
                        {/* {fieldValue["different-end-user"]?.value
                        ? fieldValue["contact-number-2"].value
                        : fieldValue["end-user-company-name"].value} */}
                        {
                            fieldValue["customer-contact-person-email-address"].value
                        }
                    </div>
                </div>

                <div style={{ width: "100%", display: "inline-flex", fontWeight: "bold", margin: "5px 10px" }}>
                    <strong style={{ margin: "5px 0", fontSize: "13px", fontWeight: "bolder" }}>
                        {" "}
                        {/* Dear {fieldValue["contact-person"].value},{" "} */}
                        Dear {fieldValue["end-user-contact-person"].value},{" "}
                    </strong>
                </div>
                <div style={{ width: "100%", margin: "5px 10px" }}>
                    <strong>
                        As arranged, below please find the equipment information
                        which we agreed to loan/rent/demo to you with the following
                        terms:{" "}
                    </strong>

                    <div>
                        <ol type="1">
                            <li>
                                {" "}
                                The receiving party confirm that the equipment is in
                                good condition when you receive it.
                            </li>
                            <li>
                                {" "}
                                The receiving party agreed that the signed personnel
                                and the company are responsible to take good care of
                                the equipment to ensure that the equipment is in
                                good condition upon return.
                            </li>
                            <li>
                                {" "}
                                Any cost of damage to the equipment/loss of the
                                equipment shall be borne by the receiving party.
                            </li>
                            <li>
                                {" "}
                                The receiving party agreed to return the equipment
                                by the end of the loan/rent/demo period.
                            </li>
                            <li>
                                {" "}
                                A separate arrangement shall requested if extension
                                is required.
                            </li>
                        </ol>
                    </div>
                </div>
                <strong style={{ margin: "5px 10px", fontWeight: "bolder" }}>
                    A. Equipment Information{" "}
                </strong>
                <div style={{ width: "100%", display: "inline-flex" }}>
                    <table
                        style={{
                            border: "0.5px solid black",
                            alignItems: "center",
                            width: "100%",
                            textAlign: "center",
                            margin: "5px 10px",
                        }}
                    >
                        <tbody style={{ border: "1px solid black" }}>
                            <tr style={{ border: "1px solid black" }}>
                                <th style={{ border: "1px solid black" }}>NO.</th>
                                <th style={{ border: "1px solid black" }}>
                                    Description and Serial No.
                                </th>
                                <th style={{ border: "1px solid black" }}>
                                    Quantity
                                </th>
                            </tr>
                            {tableFieldValue?.length
                                ? tableFieldValue.map((field, index) => (
                                    <React.Fragment key={`field-${index}`}>
                                        <tr style={{ border: "1px solid black" }}>
                                            <td
                                                style={{
                                                    border: "1px solid black",
                                                }}
                                            >
                                                {field["itemmodel-no"].value}
                                            </td>
                                            <td
                                                style={{
                                                    border: "1px solid black",
                                                }}
                                            >
                                                {field["serial-no"].value} -{" "}
                                                {field["manufacturer"].value}
                                            </td>
                                            <td
                                                style={{
                                                    border: "1px solid black",
                                                }}
                                            >
                                                {field["quantity"].value}
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))
                                : null}
                        </tbody>
                    </table>
                </div>
                <strong style={{ margin: "5px 10px", fontWeight: "bolder" }}>
                    B. Loan period :{" "}
                </strong>
                <br />
                <span style={{ margin: "10px 15px" }}>
                    From{" "}
                    {fieldValue["start-date"]?.value ? (fieldValue["start-date"].value) : ""}{" "}
                    until{" "}
                    {fieldValue["due-date"]?.value ? (fieldValue["due-date"].value) : ""}
                </span>
                <div
                    style={{
                        width: "100%",
                        position: "relative",
                        display: "flex",
                        margin: "5px 10px",
                    }}
                >
                    <span style={{ margin: "5px" }}>
                        Please kindly acknowledge receipt of the equipment and
                        acceptance of the terms above by signing at the space below
                        with your Company stamp and tax to
                    </span>
                </div>
                <strong style={{ margin: "0px 10px", fontWeight: "bolder" }}>
                    Email Contact:{" "}
                </strong>

                <div style={{ width: "100%", position: "relative", display: "flex", margin: "0px 10px", }}
                >
                    <span style={{ margin: "0px 5px" }}>
                        <strong>HQ:</strong> tekmark.kl@tekmarkgroup.com,{" "}
                        <strong>Penang:</strong> tekmark.pg@tekmarkgroup.com
                    </span>
                </div>
                <div style={{ width: "100%", position: "relative", display: "flex", margin: "5px 10px", }} >
                    <span style={{ margin: "0px 5px" }}>
                        <strong>Singapore:</strong> tekmark.sg@tekmarkgroup.com,{" "}
                        <strong>Philippine:</strong> tekmark.phl@tekmarkgroup.com
                    </span>
                </div>
                <div style={{ width: "100%", position: "relative", display: "flex", margin: "5px 10px", }}>
                    <span style={{ margin: "0px 5px" }}>
                        <strong>Vietnum:</strong> tekmark.vnm@tekmarkgroup.com
                    </span>
                </div>

                <div style={{ width: "100%", position: "relative", display: "flex", margin: "5px 10px", }}>
                    <span style={{ margin: "0px 5px" }}>Thank you</span>
                </div>
                <div style={{ width: "100%", position: "relative", display: "flex", margin: "0px 10px", }}>
                    <div style={{ margin: "0px 5px", width: "50%" }}>
                        Yours sincerely,
                    </div>

                    <div style={{ marginTop: "40px", width: "50%", margin: "0px 10px", }}>
                        <div style={{ textAlign: "left" }}>
                            I confirm receipt of the above equipment in condition
                            and I acknowledge agreement to the terms state above{" "}
                        </div>
                        <hr style={{ marginTop: "40px", marginBottom: "5px" }} />
                        <div style={{ textAlign: "left", width: "100%" }}>
                            (Sign with company stamp)
                        </div>
                        <div style={{ textAlign: "left", width: "100%", marginTop: "5px", }}>
                            Name:{" "}
                        </div>
                        <div style={{ textAlign: "left", width: "100%", marginTop: "5px", }}>
                            Designation:{" "}
                        </div>
                        <div style={{ textAlign: "left", width: "100%", marginTop: "5px", }}>
                            Date:{" "}
                        </div>
                    </div>
                    {/* <div style={{'marginTop': '40px', display: 'inline-flex', width: '50%', margin: '5px 10px'}}>

                </div> */}
                </div>
            </div>
            <div
                style={{
                    // width: "51%",
                    width: "100%",
                    margin: "35px 20px",
                    display: "flow-root",
                    fontSize: "6px",
                }}
            >
                <div style={{ display: "inline-flex", marginBottom: "-15px" }}>
                    <strong>{fieldValue['entity-of-requestor'].value}</strong>
                    <span>(290306-H) </span>
                    <span>
                        <span>+603 9057 6999</span>{" "}
                        <span>tekamrk.kl@tekmarkgroup.com</span>
                        <span>www.tekmarkgroup.com</span>
                    </span>
                </div>
                <hr style={{ position: "initial", margin: "5px 0 0 0" }} />

                <div style={{ marginBottom: "14px" }}>
                    <strong>
                        {fieldValue['shipping-address'].value}
                    </strong>
                </div>
            </div>
        </React.Fragment>)
};

export default EquipmentPDF;
