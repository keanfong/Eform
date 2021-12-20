import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import moment from "moment";

import ViewForm from "../forms/view-form";
import ModalContainer from "../../components/Modal";
import { Badge } from "react-bootstrap";

import { resetTotalFormData } from "../../../redux/actions/action.js";
import { apiCancelDraftFormWithRemark, getViewForm } from "../../modules/services/api";
import { createStructuredSelector } from "reselect";
import { selectUserData } from "../../../redux/selectors/form-selector";
import jsPDF from "jspdf";
import { message } from "antd";

const FormModal = ({
    formDetail,
    isModalVisible,
    setIsModalVisible,
    status,
    remarks,
    setRemarks,
    handleSubmit,
    getStatus,
    resetFormData,
    user,
    setCurrentPage,
    setReload,
}) => {
    const { formType, id } = useParams();
    const [loading, setLoading] = useState(false);
    const [detailForm, setDetailForm] = useState(formDetail);
    const [showModal, setShowModal] = useState(setIsModalVisible ? isModalVisible : true);
    const [isShowPdfModal, setIsShowPdfModal] = useState(false);
    // const [isAllowedApproveExecuteComplete, setIsAllowedApproveExecuteComplete] = useState(true);
    const history = useHistory();
    
    useEffect(() => {
        console.log('formDetail.submitted_by=>' , formDetail.submitted_by);
        console.log('formDetail.submitted_for=>' , formDetail.submitted_for);
        console.log('formDetail.approvals=>' , formDetail.approvals.filter((approval) => approval?.approved_by));
        console.log('formDetail.executions=>' , formDetail.executions.filter((execute) => execute?.executed_by));
        // const isAllowed =
        // console.log(isAllowed)
        // setIsAllowedApproveExecuteComplete(isAllowed);
    }, []);

    const getVariant = () => {
        let variant = "success";

        if (detailForm?.status === "pending") variant = "danger";

        return variant;
    };

    const handleCancel = () => {
        setShowModal(false);
        if (setIsModalVisible) setIsModalVisible(false);
        setDetailForm({});
        setRemarks && setRemarks("");
    };

    const viewForm = async (formId, type, isNewEntry) => {
        let parentState = getStatus ? getStatus() : "",
            url =
                parentState?.type === "pending"
                    ? "form/entries/action"
                    : "form/entries",
            formData = await getViewForm(
                formId || id,
                type || formType,
                url
            ).then((data) => data.data);

        if (formData) {
            if (status === "draft" || isNewEntry) {
                if (!formId && !type) resetFormData();

                history.push({
                    pathname: `/forms`,
                });

                history.push({
                    pathname: `/forms/${formType ? formType : formData.form}`,
                    params: { formInfo: formData, isNewEntry },
                });
            } else {
                formData.type = formType;

                setDetailForm(formData);

                setIsModalVisible(true);
            }
        }
    };

    useEffect(() => {
        async function initData() {
            setLoading(true);

            let form = detailForm;

            if (!form && formType && id) {
                form = await getViewForm(id, formType, "form/entries").then(
                    (data) => data
                );
                if (form.status === 404) {
                    form = await getViewForm(id, formType, "form/entries/action").then(
                        (data) => data
                    );
                }

                setDetailForm(form.data);
            }

            setLoading(false);
        }

        initData();
    }, [detailForm, setDetailForm, formType, id, setRemarks]);

    const handleDismissPdfModal = () => {
        setIsShowPdfModal(false);
    }

    const showCancelBtn = () => {
        if (detailForm?.status !== 'pending' || detailForm?.action_type === "execution") {
            return;
        }
        // console.log('showCancelBtn > detailForm -> ', detailForm)
        if (user?.username === detailForm?.submitted_by?.username || user?.username === detailForm?.submitted_for?.username) {
            return (
                <div className="btn btn-warning" onClick={() => { cancelDraftFormWithRemark(detailForm?.id, detailForm?.type); }}>Cancel</div>
            )
        }
    }

    const cancelDraftFormWithRemark = async (id, type) => {
        const remark = window.prompt(`Are you sure you want to cancel (${id})? \nRemarks`);
        // console.log('id, type,remark  =>', id, type, remark);
        if (remark === null) {
            console.log('User canceled the flow');
            return;
        }
        const url = 'form/entries';
        try {
            const payload = { status: "cancelled", note: remark };
            const cancelResponse = await apiCancelDraftFormWithRemark(id, type, url, payload);
            // console.log(cancelResponse);
            if (cancelResponse.status === 200) {
                setIsModalVisible(false);
                if (setCurrentPage) {
                    setCurrentPage(1);
                }
                if (setReload) {
                    setReload(true);
                }

                message.success(`Draft Cancelled Successfully`);
            } else if (cancelResponse.status === 400) {
                setIsModalVisible(false);
                message.error(cancelResponse.statusText);
            }

        } catch (error) {
            console.log('cancelDraftFormWithRemark error =>', error);
            message.error(`Something went wrong`);
        }
    }

    const showPdfBtn = () => {
        // console.log(user, detailForm)
        if (detailForm?.form !== 'equipment-requisition' || detailForm?.status !== 'complete') {
            return null;
        }

        const executed_by = detailForm?.executions[0]?.executed_by?.username;
        if (
            user?.username === 'admin' || user?.username === executed_by ||
            user?.username === detailForm?.submitted_by?.username ||
            user?.username === detailForm?.submitted_for?.username
        ) {
            return (
                <div className="float-right">
                    <button
                        type="submit"
                        className="btn btn-primary btn-md ml-2"
                        onClick={(e) => setIsShowPdfModal(true)}
                    >
                        Show Pdf
                    </button>
                </div>
            )
        }
    }

    const printDocument = (e) => {
        //const input = document.getElementById('divToPrint');
        e.preventDefault();
        //get table html
        const doc = new jsPDF({
            orientation: "p",
            unit: "pt",
            format: "A4",
            compressPdf: true,
        });
        const pdfTable = document.getElementById("divToPrint");

        //html to pdf format

        doc.html(pdfTable, {
            callback: function () {
                doc.save(`equipment-acknowledgement-(${detailForm?.serial_number}).pdf`);
                window.open(doc.output("bloburl")); // To debug.
            },
        });
    };
    return !loading ? (
        <ModalContainer
            isOpen={showModal}
            onClose={handleCancel}
            modalTitle={
                <div className="d-flex w-100">
                    <div className="col-md-2">{detailForm?.serial_number}</div>
                    <div className="col-md-2 text-center">
                        <Badge className="status-label" variant="light">
                            Status
                        </Badge>
                        <Badge
                            className="status-label"
                            variant={getVariant(detailForm?.status)}
                        >
                            {detailForm?.status}
                        </Badge>
                        {/* <span className="label"><span className="label label-primary">{formDetail.status}</span></span>  */}
                    </div>
                    <div className="col-md-4 text-center">
                        Submitted on{" "}
                        {moment(detailForm?.created).format(
                            "MMMM Do YYYY, h:mm:ss a"
                        )}
                    </div>
                    <div className="col-md-4 text-right pr-10">
                        Submitted by {detailForm?.submitted_by?.first_name}{" "}
                        {detailForm?.submitted_by?.last_name}
                    </div>
                </div>
            }
            modalBody={
                <>
                    <ViewForm
                        key={`view-${detailForm?.id}`}
                        setRemarks={setRemarks}
                        remarks={remarks}
                        isShowRemarks={status === "pending"}
                        detailForm={detailForm}
                        getStatus={getStatus}
                        handleDismissPdfModal={handleDismissPdfModal}
                        isShowPdfModal={isShowPdfModal}
                        printDocument={printDocument}
                    />
                    {detailForm?.note && <div className="d-flex mt-5 ml-6">Note:&nbsp;&nbsp;<b>{detailForm?.note}</b></div>}
                </>
            }
            modalFooter={
                <div className="d-flex justify-content-end w-100">
                    <div className="mr-5">{showCancelBtn()}</div>
                    {detailForm?.action_type === "approval" && !(status === "pending,approved,draft" || status === "pending,approved") ? (
                        <div>
                            <button type="submit" className="btn btn-danger btn-md mr-2 " onClick={(e) => handleSubmit(e, "reject")}>{" "}Reject</button>
                            <button type="submit" className="btn btn-primary btn-md mr-2" onClick={(e) => handleSubmit(e, "approve")}>{" "}Approve</button>
                        </div>
                    ) : detailForm?.action_type === "execution" ? (
                        // (detailForm?.submitted_by?.username !== user.username && detailForm?.submitted_for?.username !== user.username ? (
                            <button type="submit" className="btn btn-success btn-md mr-2" onClick={(e) => handleSubmit(e, "complete")}>{" "}Complete</button>
                        // ) : null)
                    ) : status === "pending,approved,draft" ||
                        status === "pending,approved" ||
                        id ? (
                        <button type="submit" className="btn btn-primary btn-md mr-2" onClick={(e) => viewForm(detailForm.id, detailForm.type || detailForm.form, true)}>
                            {" "}
                            Copy to new Entry
                        </button>
                    ) : null}
                    {showPdfBtn()}
                </div>
            }
        />
    ) : null;
};

const mapStateToProps = createStructuredSelector({
    user: selectUserData,
});

const mapDispatchToProps = (dispatch) => ({
    resetFormData: (data) => dispatch(resetTotalFormData(data)),

});

export default connect(mapStateToProps, mapDispatchToProps)(FormModal);
