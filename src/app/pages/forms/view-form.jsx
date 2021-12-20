import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import moment from "moment";

import { createStructuredSelector } from "reselect";
import {
    selectFormData,
    selectForms,
} from "../../../redux/selectors/form-selector.js";

import { Table, List, Card, Button } from "antd";

import ModalContainer from "../../components/Modal";

import { Badge } from "react-bootstrap";

import { LayoutSplashScreen } from "../../../_metronic/layout";

import { updateSlipData, getViewForm } from "../../modules/services/api.js";
import { resetTotalFormData } from "../../../redux/actions/action.js";

import Snackbar from "@material-ui/core/Snackbar/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

import FormInput from "./form-fields.jsx";

import Form from "./form";
import { convertToPascalCase } from "../../utils/common-functions.js";
import EquipmentPDF from "./equipment-pdf.jsx";

const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const ViewForm = ({
    detailForm,
    remarks,
    setRemarks,
    resetFormData,
    isShowRemarks,
    formData,
    totalFormValue,
    getStatus,
    // pdfrelated starts
    handleDismissPdfModal, isShowPdfModal, printDocument
    // pdfrelated ends
}) => {
    const [slips, setSlips] = useState([]);
    const [approvedSlips, setApprovedSlips] = useState([]);
    const [completedSlips, setCompletedSlips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isShowSlip, setIsShowSlip] = useState(false);
    const [slipData, setSlipData] = useState(null);
    const [inputData, setInputData] = useState({});
    const [showSuccessToaster, setShowSuccessToaster] = useState(false);
    const [showToaster, setShowToaster] = useState(false);
    const [errorMessage, setErrorMessage] = useState();
    const [formDetail, setFormDetail] = useState(detailForm);

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setShowToaster(false);
        setShowSuccessToaster(false);
    };

    const validateFormat = useCallback(
        (form) => {
            const draftForm = {};

            /**Fields */

            draftForm.fields = totalFormValue.fields;

            draftForm.layout =
                form?.fields?.length > 0
                    ? form.fields.map((field) => field.slug)
                    : [];

            /**Table fields */

            draftForm.table_fields = totalFormValue.tableFields;

            draftForm.table_layout =
                form?.table_fields?.length > 0
                    ? form.table_fields.map((field) => field.slug)
                    : [];

            /**Tally fields */
            draftForm.tally_fields = totalFormValue.tallyFields;

            draftForm.tally_layout =
                form?.tally_fields?.length > 0
                    ? form.tally_fields.map((field) => field.slug)
                    : [];

            return draftForm;
        },
        [totalFormValue]
    );

    const setForms = async () => {
        let id = formDetail?.id || "",
            formType = formDetail?.type || "",
            actionType = formDetail?.action_type || "",
            formUrl = formDetail.submitted_by.is_current_user || formDetail.submitted_for.is_current_user ? 'form/entries' : 'form/entries/action'
        formData =
            id && formType
                ? await getViewForm(id, formType, formUrl).then(
                    (data) => data.data
                )
                : formDetail;

        if (formData) {
            formData.type = formType;
            formData.action_type = actionType;

            setFormDetail(formData);
        }
    };

    const handleOk = async (slipId) => {
        // console.log(slipId, formData.table_fields.map((obj) => obj.label), approvedSlips, completedSlips, slipData, inputData, formDetail)
        let slipUrl;
        if (formDetail?.action_type && formDetail.action_type === 'approval') {
            slipUrl = 'amendment';
        } else if (formDetail?.action_type && formDetail.action_type === 'execution') {
            slipUrl = 'execution';
        }

        if (slipUrl) {
            let data = validateFormat(formData),
                response = await updateSlipData(slipId, data, slipUrl);

            console.log("data: ", data);
            console.log("data: ", response);
            if (response?.isSuccess) {
                setLoading(true);
                setForms();

                setShowSuccessToaster(true);

                setIsShowSlip(false);

                setLoading(false);
            } else {
                if (
                    typeof response === "string" ||
                    typeof response?.result === "string"
                )
                    setErrorMessage(response.result || response);

                setIsShowSlip(false);
                setShowToaster(true);
                setForms();
            }
        }
    };

    const handleCancel = () => {
        setForms();
        setIsShowSlip(false);
    };

    const remarkField = {
        type: "text-area",
        value: remarks,
        label: "Action remarks",
        optional: true,
        help: "Optionally add some remarks to the approval/execution",
    };

    const handleChange = (value) => {
        setRemarks(value);
    };

    const getColumns = () => {
        let tableFields = formDetail?.data?.table_layout || null,
            columsObj = [];

        if (tableFields) {
            tableFields = ["no"].concat(tableFields);

            tableFields.map((fieldKey, i) => {
                let tabObj = formDetail?.data?.table_fields[0],
                    field = tabObj[fieldKey];

                if (fieldKey === "no") {
                    field = { type: "number", label: "No.", value: "no" };
                }

                return field && field?.type !== "hidden"
                    ? columsObj?.push({
                        ...field,
                        title: field?.label || convertToPascalCase(field?.slug),
                        dataIndex: fieldKey,
                        render: (data, dataRow) => {
                            const key = dataRow?.key;

                            const value =
                                field?.type === "file" ? (
                                    <a
                                        href={data}
                                        key={data}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        {//eslint-disable-next-line
                                            data.replace(/^.*[\\\/]/, "")}
                                    </a>
                                ) : (
                                    data
                                );

                            if (field) {
                                return (
                                    <div className="ml-8" key={key}>
                                        {value}
                                    </div>
                                );
                                //  <FormInput key={key} rowKey= {key} type="table-fields" isReadOnly ={true} field ={field} hideHelp={true}/>
                            }
                        },
                    })
                    : null;
            });

            return columsObj;
        }
    };

    const getSlipColumns = (slip) => {
        let tableFields = slip?.data?.table_layout || null,
            columsObj = [];
        // console.log('tableFields => ', tableFields);
        if (tableFields) {
            // tableFields = ['no'].concat(tableFields)

            tableFields.map((fieldKey, i) => {
                let tabObj = { no: {}, ...slip?.data?.table_fields[0] },
                    field = tabObj[fieldKey];

                if (fieldKey === "no") {
                    field = { type: "number", label: "No.", value: "no" };
                }
                return field && field?.type !== "hidden"
                    ? columsObj?.push({
                        ...field,
                        title: field?.label || convertToPascalCase(field?.slug),
                        dataIndex: fieldKey,
                        render: (data, dataRow) => {
                            const key = dataRow.key;

                            const value =
                                field?.type === "file" ? (
                                    <a
                                        href={data}
                                        key={data}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        {//eslint-disable-next-line
                                            data?.replace(/^.*[\\\/]/, "")}
                                    </a>
                                ) : field?.type === "boolean" ? data ? 'Checked' : 'Unchecked' : (
                                    data
                                );

                            if (field) {
                                return (
                                    <div className="ml-8" key={key}>
                                        {value}
                                    </div>
                                );
                                //  <FormInput key={key} rowKey= {key} type="table-fields" isReadOnly ={true} field ={field} hideHelp={true}/>
                            }
                        },
                    })
                    : null;
            });

            return columsObj;
        }
    };

    const getDataSource = () => {
        let rowData = [];

        formDetail.data.table_fields.map((field, i) => {
            let computeObj = { no: i + 1 };

            formDetail.data.table_layout.map((fieldKey) => (computeObj[fieldKey] = field[fieldKey]?.value));

            rowData.push(computeObj);

            return true;
        });

        return rowData;
    };

    const getSlipDataSource = (slip) => {
        let rowData = [];
        // console.log('slip =>' , slip.data)
        slips && slip.data && slip.data.table_fields && slip.data.table_fields.map((field, i) => {
            let computeObj = { no: i + 1 };

            slip && slip.data && slip.data.table_layout && slip.data.table_layout.map(
                (fieldKey) => (computeObj[fieldKey] = field[fieldKey] ? field[fieldKey].value : '')
            );

            rowData.push(computeObj);

            return true;
        });

        return rowData;
    };

    const getApproversList = () => {
        let approversArray = formDetail?.approvals || [],
            executorArray = formDetail?.executions || [],
            data = [];

        approversArray.map((list, i) => {
            const { approved_by, status, modified, remarks, action_role } = list || {};

            let firstName =
                approved_by && approved_by.first_name
                    ? approved_by.first_name
                    : "",
                lastName =
                    approved_by && approved_by.last_name
                        ? approved_by.last_name
                        : "",
                fullName =
                    firstName || lastName
                        ? firstName + " " + lastName
                        : approved_by?.username,
                date = modified
                    ? moment(list.modified).format("MMMM Do YYYY, h:mm:ss a")
                    : "";

            let actionRole = action_role ? action_role : ''

            data.push({
                name: fullName,
                actionRole: actionRole,
                status,
                actionDate: date,
                remark: remarks,
                type: "Approver",
                serial: i + 1,
            });

            return list;
        });
        executorArray.map((list, i) => {
            const { action_role, status, modified, remarks, executed_by } = list || {};

            let firstName = executed_by && executed_by.first_name ? executed_by.first_name : "";
            let lastName = executed_by && executed_by.last_name ? executed_by.last_name : "";
            let fullName = firstName || lastName ? firstName + " " + lastName : executed_by?.username;

            let date = modified
                ? moment(list.modified).format("MMMM Do YYYY, h:mm:ss a")
                : "";

            data.push({
                name: action_role || fullName,
                status,
                actionDate: date,
                remark: remarks,
                type: "Executor",
                serial: i + 1,
            });

            return list;
        });

        return data;
    };

    const viewSlip = (slip) => {
        // slip-form
        // TODO: due to this screen is flickering which is destroying user experience
        resetFormData();
        // console.log(detailForm);
        setSlipData(slip);
        setIsShowSlip(true);
    };

    const getVariant = (status) => {
        let variant = "success";

        if (status === "pending" || status === "cancelled") variant = "warning";
        else if (status === "complete" || status === "approved") variant = "success";
        else if (status === "rejected") variant = "danger";

        return variant;
    };

    useEffect(() => {
        setLoading(true);

        let executorArray = formDetail?.executions || [],
            approvalsArray = formDetail?.approvals || [],
            slip = [],
            approvedSlip = [],
            completedSlip = [];

        executorArray.map((list, i) => {
            let editableSlip = list.slips.filter(
                (slip) => slip.state === "editable"
            );

            return (slip = slip.concat(editableSlip));
        });

        approvalsArray.map((list) => {
            if (list?.amend_slip?.state === "editable")
                slip.push(list.amend_slip);
            return list;
        });
        // console.log(executorArray)
        approvalsArray.filter(item => item.status === "approved").map((list) => {
            if (list?.amend_slip) {
                list.amend_slip.approved_by = list?.approved_by?.username;
                approvedSlip.push(list?.amend_slip);
            }
            return list;
        });


        executorArray.forEach((list, i) => {
            let completeSlip = list?.slips?.filter(
                (slip) => slip?.state === "readonly" && Object.keys(slip?.data).length > 0
            ).map(slip => { slip.completed_by = list?.executed_by?.username; return slip; });;
            if (completeSlip?.length > 0) {
                completedSlip.push(...completeSlip);
            }

        });
        if (setRemarks) setRemarks(remarks);
        setSlips(slip);
        setApprovedSlips(approvedSlip);
        setCompletedSlips(completedSlip);
        setLoading(false);
    }, [formDetail, setRemarks, remarks, setSlips]);

    if (showSuccessToaster) {
        return (
            <Snackbar
                open={"true"}
                anchorOrigin={{
                    horizontal: "right",
                    vertical: "top",
                }}
                autoHideDuration={100}
                onClose={handleClose}
            >
                <Alert severity="success">{"Successfully submitted"}</Alert>
            </Snackbar>
        );
    }
    if (showToaster) {
        return (
            <Snackbar
                open={showToaster}
                anchorOrigin={{
                    horizontal: "right",
                    vertical: "top",
                }}
                autoHideDuration={1000}
                onClose={handleClose}
            >
                <Alert severity="warning">
                    {errorMessage || "Something went wrong"}
                </Alert>
            </Snackbar>
        );
    }

    return (
        <React.Fragment>
            {loading ? (
                <LayoutSplashScreen />
            ) : (
                <React.Fragment>
                    <div className="view-form container">
                        <div className="row">
                            {formDetail?.data?.layout &&
                                formDetail.data.layout.length > 0
                                ? formDetail.data.layout.map(
                                    (formKey, index) => (
                                        <>
                                            {formDetail?.data?.fields[formKey]
                                                ?.type !== "hidden" ? (
                                                <FormInput
                                                    key={'row1-' + index}
                                                    isReadOnly={true}
                                                    formName={formDetail.name}
                                                    field={
                                                        formDetail.data
                                                            .fields[formKey]
                                                    }
                                                />
                                            ) : null}
                                        </>
                                    )
                                )
                                : null}
                            {formDetail?.data?.table_fields &&
                                formDetail?.data?.table_fields.length > 0 ? (
                                <div className="table-fields">
                                    <Table
                                        dataSource={getDataSource() || []}
                                        columns={getColumns()}
                                        pagination={false}
                                        scroll={{
                                            x:
                                                getColumns() &&
                                                getColumns().length * 150,
                                            y: 300,
                                        }}
                                    />
                                </div>
                            ) : null}
                            {formDetail?.data?.tally_layout &&
                                formDetail.data.tally_layout.length > 0 ? (
                                <div className="tally">
                                    {" "}
                                    {formDetail.data.tally_layout.map(
                                        (formKey, index) => (
                                            <div
                                                className="tally-row"
                                                key={'tally-row-' + index}
                                            >
                                                <FormInput
                                                    type="tally-fields"
                                                    isReadOnly={true}
                                                    field={
                                                        formDetail.data
                                                            .tally_fields[
                                                        formKey
                                                        ]
                                                    }
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : null}
                        </div>
                        <div className="row">
                            <List
                                key={'view-form-list-1-'}
                                footer={<div></div>}
                                dataSource={getApproversList()}
                                renderItem={(item, index) => (
                                    <List.Item key={'view-form-list-' + index}>
                                        <div className="col-md-12 d-flex flex-row-fluid">
                                            <div className="col-md-6">
                                                <div className="col-md-12">
                                                    {item.type} {item.serial} :{" "}
                                                    {item.name ? item.name : item.actionRole}
                                                </div>
                                                {item.type && item.status !== "waiting" ? (
                                                    <>
                                                        <div className="col-md-12 text-muted">
                                                            Action on{" "}
                                                            {item.actionDate}
                                                        </div>
                                                        <div className="col-md-12 text-muted">
                                                            Remarks :{" "}
                                                            {item.remark}
                                                        </div>
                                                    </>
                                                ) : null}
                                            </div>
                                            <div className="col-md-6 text-center">
                                                <Badge
                                                    className="status-label"
                                                    variant="light"
                                                >
                                                    Status
                                                </Badge>
                                                <Badge
                                                    className="status-label"
                                                    variant={getVariant(
                                                        item.status
                                                    )}
                                                >
                                                    {item?.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </div>

                    {completedSlips && completedSlips.length > 0 ? (
                        <div className="mt-5 view-form container">
                            {completedSlips.map((slip, i) => (
                                <>
                                    {slip.data ? (
                                        <div className="row" key={'view-form-card-row-' + i}>
                                            <Card
                                                key={'view-form-card-1-'}
                                                title={`${slip.name} Approved by : (${slip.completed_by})`}
                                                type="inner"
                                                className="card"
                                            >

                                                {slip?.data?.layout &&
                                                    slip.data.layout.length > 0
                                                    ? slip.data.layout.map(
                                                        (formKey, index) => (
                                                            <>
                                                                {slip?.data
                                                                    ?.fields[
                                                                    formKey
                                                                ]?.type !==
                                                                    "hidden" ? (
                                                                    <FormInput
                                                                        key={
                                                                            'view-form-' + formKey + '-' + index
                                                                        }
                                                                        isReadOnly={
                                                                            true
                                                                        }
                                                                        formName={
                                                                            slip.name
                                                                        }
                                                                        field={
                                                                            slip
                                                                                .data
                                                                                .fields[
                                                                            formKey
                                                                            ]
                                                                        }
                                                                    />
                                                                ) : null}
                                                            </>
                                                        )
                                                    )
                                                    : null}
                                                {slip?.data?.table_fields &&
                                                    slip?.data?.table_fields
                                                        .length > 0 ? (
                                                    <div className="table-fields">
                                                        <Table
                                                            dataSource={
                                                                getSlipDataSource(
                                                                    slip
                                                                ) || []
                                                            }
                                                            columns={getSlipColumns(
                                                                slip
                                                            )}
                                                            pagination={false}
                                                            scroll={{
                                                                x:
                                                                    getSlipColumns(
                                                                        slip
                                                                    ) &&
                                                                    getSlipColumns(
                                                                        slip
                                                                    ).length *
                                                                    150,
                                                                y: 300,
                                                            }}
                                                        />
                                                    </div>
                                                ) : null}
                                                {slip?.data?.tally_layout &&
                                                    slip.data.tally_layout.length >
                                                    0 ? (
                                                    <div className="tally">
                                                        {" "}
                                                        {slip.data.tally_layout.map(
                                                            (
                                                                formKey,
                                                                index
                                                            ) => (
                                                                <div
                                                                    className="tally-row"
                                                                    key={'tally-row-div' + index}
                                                                >
                                                                    <FormInput
                                                                        type="tally-fields"
                                                                        isReadOnly={
                                                                            true
                                                                        }
                                                                        field={
                                                                            slip
                                                                                .data
                                                                                .tally_fields[
                                                                            formKey
                                                                            ]
                                                                        }
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : null}
                                            </Card>
                                        </div>
                                    ) : null}
                                </>
                            ))}
                        </div>
                    ) : null}

                    {approvedSlips && approvedSlips.length > 0 ? (
                        <div className="mt-5 view-form container">
                            {approvedSlips.map((slip, i) => (
                                <>
                                    {slip.data ? (
                                        <div className="row" key={'view-form-slip1-' + i}>
                                            <Card
                                                key={'view-form-card-2-'}
                                                title={`${slip.name} Approved by : (${slip.approved_by})`}
                                                type="inner"
                                                className="card"
                                            >

                                                {slip?.data?.layout &&
                                                    slip.data.layout.length > 0
                                                    ? slip.data.layout.map(
                                                        (formKey, index) => (
                                                            <>
                                                                {slip?.data
                                                                    ?.fields[
                                                                    formKey
                                                                ]?.type !==
                                                                    "hidden" ? (
                                                                    <FormInput
                                                                        key={
                                                                            'view-form-slip1-div1-' + index
                                                                        }
                                                                        isReadOnly={
                                                                            true
                                                                        }
                                                                        formName={
                                                                            slip.name
                                                                        }
                                                                        field={
                                                                            slip
                                                                                .data
                                                                                .fields[
                                                                            formKey
                                                                            ]
                                                                        }
                                                                    />
                                                                ) : null}
                                                            </>
                                                        )
                                                    )
                                                    : null}
                                                {slip?.data?.table_fields &&
                                                    slip?.data?.table_fields
                                                        .length > 0 ? (
                                                    <div className="table-fields">
                                                        <Table
                                                            dataSource={
                                                                getSlipDataSource(
                                                                    slip
                                                                ) || []
                                                            }
                                                            columns={getSlipColumns(
                                                                slip
                                                            )}
                                                            pagination={false}
                                                            scroll={{
                                                                x:
                                                                    getSlipColumns(
                                                                        slip
                                                                    ) &&
                                                                    getSlipColumns(
                                                                        slip
                                                                    ).length *
                                                                    150,
                                                                y: 300,
                                                            }}
                                                        />
                                                    </div>
                                                ) : null}
                                                {slip?.data?.tally_layout &&
                                                    slip.data.tally_layout.length >
                                                    0 ? (
                                                    <div className="tally">
                                                        {" "}
                                                        {slip.data.tally_layout.map(
                                                            (
                                                                formKey,
                                                                index
                                                            ) => (
                                                                <div
                                                                    className="tally-row"
                                                                    key={'view-form-tally-row-' + index}
                                                                >
                                                                    <FormInput
                                                                        type="tally-fields"
                                                                        isReadOnly={
                                                                            true
                                                                        }
                                                                        field={
                                                                            slip
                                                                                .data
                                                                                .tally_fields[
                                                                            formKey
                                                                            ]
                                                                        }
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : null}
                                            </Card>
                                        </div>
                                    ) : null}
                                </>
                            ))}
                        </div>
                    ) : null}

                    {slips && slips.length > 0 ? (
                        <div className="mt-5 view-form container">
                            {slips.map((slip, i) => (
                                <>
                                    {slip.data ? (
                                        <div className="row" key={'view-form-slip-card-row-' + i}>
                                            <Card
                                                key={'view-form-slip-card-self-' + i}
                                                title={`${slip.name}`}
                                                type="inner"
                                                className="card"
                                                extra={((getStatus && getStatus().type !== 'ongoing') || detailForm?.status !== 'ongoing') && (
                                                    <Button className='edit-btn' onClick={() => viewSlip(slip)}>Edit</Button>)
                                                }
                                            >
                                                {slip?.data?.layout &&
                                                    slip.data.layout.length > 0
                                                    ? slip.data.layout.map(
                                                        (formKey, index) => (
                                                            <>
                                                                {slip?.data
                                                                    ?.fields[
                                                                    formKey
                                                                ]?.type !==
                                                                    "hidden" ? (
                                                                    <FormInput
                                                                        key={
                                                                            'view-form-slip-card-layout' + index
                                                                        }
                                                                        isReadOnly={
                                                                            true
                                                                        }
                                                                        formName={
                                                                            slip.name
                                                                        }
                                                                        field={
                                                                            slip
                                                                                .data
                                                                                .fields[
                                                                            formKey
                                                                            ]
                                                                        }
                                                                    />
                                                                ) : null}
                                                            </>
                                                        )
                                                    )
                                                    : null}
                                                {slip?.data?.table_fields &&
                                                    slip?.data?.table_fields
                                                        .length > 0 ? (
                                                    <div className="table-fields">
                                                        <Table
                                                            key={i}
                                                            dataSource={
                                                                getSlipDataSource(
                                                                    slip
                                                                ) || []
                                                            }
                                                            columns={getSlipColumns(
                                                                slip
                                                            )}
                                                            pagination={false}
                                                            scroll={{
                                                                x:
                                                                    getSlipColumns(
                                                                        slip
                                                                    ) &&
                                                                    getSlipColumns(
                                                                        slip
                                                                    ).length *
                                                                    150,
                                                                y: 300,
                                                            }}
                                                        />
                                                    </div>
                                                ) : null}
                                                {slip?.data?.tally_layout &&
                                                    slip.data.tally_layout.length >
                                                    0 ? (
                                                    <div className="tally">
                                                        {" "}
                                                        {slip.data.tally_layout.map(
                                                            (
                                                                formKey,
                                                                index
                                                            ) => (
                                                                <div
                                                                    className="tally-row"
                                                                    key={'view-form-tally-row-' + index}
                                                                >
                                                                    <FormInput
                                                                        type="tally-fields"
                                                                        isReadOnly={
                                                                            true
                                                                        }
                                                                        field={
                                                                            slip
                                                                                .data
                                                                                .tally_fields[
                                                                            formKey
                                                                            ]
                                                                        }
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : null}
                                            </Card>
                                        </div>
                                    ) : null}
                                </>
                            ))}
                        </div>
                    ) : null}
                    {isShowRemarks ? (
                        <div className="remark-field">
                            <FormInput
                                key={'remark-field-input'}
                                field={remarkField}
                                changeEvent={handleChange}
                                type="table-fields"
                            />
                        </div>
                    ) : null}
                    {/* slip-form */}
                    {isShowSlip ? (
                        <ModalContainer
                            isOpen={isShowSlip}
                            onClose={handleCancel}
                            modalBody={
                                <Form
                                    key={`slip-form-${slipData.id}`}
                                    type="slip-form"
                                    slipData={slipData}
                                    inputData={inputData}
                                    setInputData={setInputData}
                                    formName={slipData.form}
                                    valuesToPreFill={detailForm}
                                />
                            }
                            modalFooter={
                                <div className="d-flex justify-content-end w-100">
                                    <button
                                        type="submit"
                                        className="btn btn-secondary ml-2"
                                        onClick={(e) => handleCancel(e)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary ml-2"
                                        onClick={() => handleOk(slipData.id)}
                                    >
                                        Submit
                                    </button>
                                </div>
                            }
                        />
                    ) : null}
                </React.Fragment>
            )}
            {isShowPdfModal && (
                <ModalContainer
                    isOpen={isShowPdfModal}
                    onClose={handleDismissPdfModal}
                    modalBody={
                        <div className="row" id="divToPrint" style={{ display: 'flex', flexWrap: 'wrap', marginRight: -12.5, marginLeft: -12.5, flexDirection: 'column', width: '63.5%' }}>
                            <EquipmentPDF
                                key='equipmentPdf'
                                formId={detailForm?.id}
                                fieldValue={detailForm?.data?.fields}
                                tableFieldValue={detailForm?.data?.table_fields}
                                tallyFieldValue={detailForm?.data?.tally_fields}
                                detailForm={detailForm}
                            />
                        </div>
                    }
                    modalFooter={
                        <div className="d-flex justify-content-end w-100">
                            <div className="btn btn-info mr-2" onClick={() => handleDismissPdfModal()}>
                                Cancel
                            </div>
                            <div className="btn btn-info mr-2" onClick={(e) => printDocument(e)}>
                                Export to PDF
                            </div>
                        </div>
                    }
                />
            )}
        </React.Fragment>

    );
};

const mapDispatchToProps = (dispatch) => ({
    resetFormData: (data) => dispatch(resetTotalFormData(data)),
});
const mapStateToProps = createStructuredSelector({
    formData: selectFormData,
    totalFormValue: selectForms,
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewForm);
