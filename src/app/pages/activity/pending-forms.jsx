import React, { useState, useEffect, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";

import moment from "moment";

import { Space, Button } from "antd";

import { TableView } from "../../components/Table";

import * as columnFormatter from "../../components/column-formatters";

import FormModal from "../forms/form-modal";

import { connect } from "react-redux";
import { selectUserData, selectFormFieldData } from "../../../redux/selectors/form-selector.js";
import { createStructuredSelector } from "reselect";
import { resetTotalFormData } from "../../../redux/actions/action.js";

import {
    getFormPendingForActions,
    getViewForm,
    submitActionForm,
} from "../../modules/services/api.js";

import configData from "../../modules/services/config.json";
import { orderBy } from "lodash-es";

const tableColumnsConfig = configData.FORM_TABLE_COLUMNS;

const PendingForm = ({
    linkUrl,
    user,
    formFields,
    type,
    status,
    isNotEqual,
    pageSize,
    setPageSize,
    setParentTotal,
    returnCountOnly,
    handleChange,
    hideModal,
    resetFormData,
    initialColumns,
    showSelect,
    getStatus,
}) => {
    const [loading, setLoading] = useState(true);
    const [listLoading, setListLoading] = useState(false);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pendingForms, setPendingForms] = useState([]);
    const [detailForm, setDetailForm] = useState([]);
    const [columns, setColumns] = useState(initialColumns);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [searchValue, setSearchValue] = useState();
    const [reload, setReload] = useState(false);
    const { formType, id, historyType, historyFormId } = useParams();
    const history = useHistory();

    const handleSubmit = async (e, action) => {
        e.preventDefault();
        let data = { action, remarks },
            serialArray = detailForm?.serial_number
                ? detailForm.serial_number.split("#")
                : [],
            serialNumber = serialArray[1] || "",
            id = detailForm?.id,
            formType = detailForm.type,
            response = await submitActionForm(id, formType, data);

        if (serialNumber) {
            data.serial_number = serialNumber;
        }

        if (response.isSuccess) {
            setRemarks('');
            setReload(true);
            setIsModalVisible(false);
        }
    };

    const viewForm = useCallback(
        async (id, formType, isNewEntry) => {
            let parentState = getStatus ? getStatus() : {},
                url =
                    parentState?.type === "pending"
                        ? "form/entries/action"
                        : "form/entries",
                formData = await getViewForm(id, formType, url).then(
                    (data) => data.data
                );

            if (formData) {
                if (status === "draft" || isNewEntry) {
                    resetFormData();
                    history.push({
                        pathname: `/forms/${formType}`,
                        params: { formInfo: formData, isNewEntry },
                    });
                } else {
                    formData.type = formType;

                    setDetailForm(formData);



                    setIsModalVisible(true);
                }
            }
        },
        [
            status,
            getStatus,
            history,
            resetFormData,
            setIsModalVisible,
            setDetailForm,
        ]
    );

    const selectForm = useCallback(
        (formId, serialNumber) => {
            handleChange(formId + "," + serialNumber);
            hideModal(false);
        }, [handleChange, hideModal]);


    // const deleteDraftForm = async (id, type) => {
    //     const url = 'form/entries';
    //     try {
    //         const delete_response = await deleteForm(id, type, url);
    //         setReload(true);

    //         if (delete_response.status === 204) {
    //             message.success(`Data Deleted Successfully`);
    //         }

    //     } catch (error) {
    //         console.log(error);
    //     }

    // }


    const getColumns = useCallback(
        (forms) => {
            let tableColumns = [],
                form = forms && forms.length > 0 ? forms[0] : null;

            let ObjKeys = form ? Object.keys(form) :
                [
                    "id",
                    "submitted_by",
                    "status",
                    "submitted_for",
                    "serial_number",
                ];

            if (showSelect) {
                ObjKeys = [...ObjKeys, "action", "select"]
            } else {
                ObjKeys = [...ObjKeys, "action"]
            }
            const index = tableColumnsConfig.findIndex((col) => col.key === 'id');
            if (index !== -1) {
                tableColumnsConfig[index].hidden = false;
                if (status !== 'draft') {
                    tableColumnsConfig[0].hidden = true;
                }
            }
            ObjKeys.map((key, i) => {
                let colObj = tableColumnsConfig.find((column) => column.key === key) || null;
                if (colObj) {
                    colObj.dataField = key;
                    if (key === "status" && colObj.type === "string") {
                        colObj.formatter = (text, row) =>
                            columnFormatter.StatusColumnFormatter(text, row);
                    } else if (colObj.type === "date") {
                        colObj.formatter = (text) => (
                            <span key={key}>
                                {moment(text).format("MMMM Do YYYY, h:mm:ss a")}
                            </span>
                        );
                    } else if (["submitted_for", "submitted_by"].includes(key)) {
                        colObj.type = "string";
                        colObj.formatter = (obj) => (
                            <span key={key}>
                                {obj?.first_name} {obj?.last_name}
                            </span>
                        );
                    } else if (key === "action") {
                        colObj.type = "string";
                        colObj.formatter = (obj) => (
                            <>
                                <Space size="middle" key="action">
                                    <Button type="primary" onClick={(e) => viewForm(obj?.id, obj?.formType)} aria-disabled >
                                        View Form
                                    </Button>
                                </Space>

                                {/* {status === 'draft' && (
                                    <Space size="middle" key="delete">
                                        <Button className="mt-1" type="danger" onClick={(e) => { window.confirm(`Are you sure you want to delete (${obj.id} ${obj.formType}) ?`) && deleteDraftForm(obj?.id, obj?.formType); }} aria-disabled >
                                            Delete
                                        </Button>
                                    </Space>
                                )} */}
                            </>
                        );
                    } else if (key === "select") {
                        colObj.formatter = (type, obj) => (
                            <Space size="middle" key="action">
                                <Button type="primary" onClick={(e) => selectForm(obj?.id, obj?.serial_number)} aria-disabled >
                                    Select
                                </Button>
                            </Space>
                        );
                    } else {
                        colObj.formatter = (text) => columnFormatter.ConditionColumnFormatter(text);
                    }

                    if ((key === "serial_number" && status !== "draft") || key === "id") {
                        tableColumns = [colObj].concat(tableColumns);
                    } else if (key !== "serial_number") {
                        tableColumns.push(colObj);
                    }
                }
                return true;
            });
            tableColumns = orderBy(tableColumns, 'index');
            return tableColumns;
        },
        [viewForm, selectForm, showSelect, status]
    );

    const getDataSource = useCallback(() => {
        let source = [];

        if (pendingForms && pendingForms.length > 0) {
            pendingForms.map((form) => {
                form.action = { id: form.id, formType: form.form };
                form.key = form.serial_number;

                form.select = "Select";

                source.push(form);
                return form;
            });
        }

        return source;
    }, [pendingForms]);

    useEffect(() => {
        if (formType && id) {
            viewForm(id, formType);
            // to fix reopening of popup-modal
            history.replace("/pending");
        } else if (historyType && historyFormId) {
            viewForm(historyFormId, historyType);
            history.replace("/history");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formType, id]);

    useEffect(() => {
        async function getPendingForms() {
            if (reload || !pendingForms?.length) {
                const data = {
                    status,
                    pageNumber: 1,
                    pageSize,
                    isNotEqual,
                    searchValue,
                };

                if (["ongoing", "past-submission"].includes(type)) {
                    data.username = user.username;
                }
                if (formFields && formFields['submitted-for'] && formFields['submitted-for']?.value) {
                    data.submittedFor = formFields['submitted-for']?.value;
                }
                setListLoading(true);
                let response = await getFormPendingForActions(data, linkUrl)
                    .then((res) => res)
                    .catch((err) => console.log(err));
                setListLoading(false);
                let forms = response?.results;

                if (forms) {
                    let totalCount = response?.count || 0;

                    setTotalPageCount(totalCount);

                    if (setParentTotal) {
                        setParentTotal(totalCount);
                    }

                    if (!returnCountOnly) {
                        let columns = getColumns(forms) || null;
                        if (columns) { setColumns(columns) };
                    }
                }
                // if (response.results.length === 0) {
                //     return;
                // }
                // fixed infinite calls
                if (!returnCountOnly) {
                    setPendingForms(forms);
                }
                setLoading(false);
                setReload(false);
            }
        }
        getPendingForms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        linkUrl, status, pageSize, user, formFields, type, isNotEqual, returnCountOnly, searchValue, reload
    ]);

    const onSizeChange = (sizePerPage) => {
        onPaginationChange(currentPage, sizePerPage);
    };
    const onPaginationChange = async (page, sizePerPage) => {
        setListLoading(true);
        const data = {
            status,
            pageNumber: totalPageCount < sizePerPage * page - sizePerPage ? 1 : page,
            pageSize: sizePerPage ? sizePerPage : pageSize,
            isNotEqual,
        };

        if (["ongoing", "past-submission"].includes(type)) {
            data.username = user.username;
        }
        const response = await getFormPendingForActions(data).then(
            (res) => res
        );

        let forms = response?.results,
            updatedForms = [];

        for (let i = 0; i < totalPageCount; i++) {
            updatedForms.push(pendingForms[i] ? pendingForms[i] : {});
        }

        forms.map((form, i) => {
            updatedForms[sizePerPage * (page - 1) + i] = form;
            return form;
        });

        setCurrentPage(data.pageNumber);
        setPageSize(data.pageSize);
        setPendingForms(updatedForms);
        setListLoading(false);
    };

    return (
        <div>
            {!returnCountOnly &&
                <div>
                    {loading && (
                        <div className="d-flex justify-content-center">
                            <div className="spinner spinner-primary m-30"></div>
                        </div>
                    )}
                    {columns?.length > 0 && !loading ? (
                        <div>
                            <TableView
                                columns={columns}
                                dataSource={getDataSource()}
                                paginationParams={{
                                    current: currentPage,
                                    onPageChange: onPaginationChange,
                                    showSizeChanger: false,
                                    pageSize: pageSize || 5,
                                    totalCount: totalPageCount,
                                    onSizeChange: onSizeChange,
                                }}
                                hideSelect={showSelect}
                                listLoading={listLoading}
                                selectRows={false} //row select event
                                rows={[]}
                                setSearchValue={setSearchValue}
                                searchValue={searchValue}
                                setReload={setReload}
                            />
                            {isModalVisible ? (
                                <FormModal
                                    formDetail={detailForm}
                                    isModalVisible={true}
                                    getStatus={getStatus}
                                    setIsModalVisible={setIsModalVisible}
                                    setDetailForm={setDetailForm}
                                    setRemarks={setRemarks}
                                    remarks={remarks}
                                    status={status}
                                    handleSubmit={handleSubmit}
                                    setReload={setReload}
                                    setCurrentPage={setCurrentPage}
                                />
                            ) : null}
                        </div>
                    ) : null}
                </div>
            }
        </div>
    );
};

const mapStateToProps = createStructuredSelector({
    user: selectUserData,
    formFields: selectFormFieldData,
});

const mapDispatchToProps = (dispatch) => ({
    resetFormData: (data) => dispatch(resetTotalFormData(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PendingForm);
