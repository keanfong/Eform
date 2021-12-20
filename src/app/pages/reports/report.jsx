import React, { useState, useEffect, useCallback } from "react";
import { notification } from "antd";

import { connect } from "react-redux";
import { selectUserData } from "../../../redux/selectors/form-selector.js";
import { createStructuredSelector } from "reselect";

import {
    Card,
    CardBody,
    CardHeader,
    CardHeaderToolbar,
    CardFooter,
} from "../../../_metronic/_partials/controls/card.js";
import {
    getReport,
    generateClaimReport,
    exportClaimReport,
    getReportDateOptions,
    getViewForm,
    getOrgCompanies
} from "../../modules/services/api.js";


import FormModal from "../forms/form-modal";

import FormInput from "../forms/form-fields.jsx";

import configData from "../../modules/services/config.json";

import Snackbar from "@material-ui/core/Snackbar/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { convertToPascalCase } from "../../utils/common-functions.js";
import { useParams } from "react-router";
import moment from "moment";

const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const Report = ({ user }) => {
    const [filterForm, setFilterForm] = useState(null);
    const [filter, setFilter] = useState({});
    const [report, setReport] = useState();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [detailForm, setDetailForm] = useState([]);
    const { typeOfClaim } = useParams();
    const [isLoading, setIsLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');

    const setReportData = useCallback(async () => {
        if ('approvals__status' in filter) {
            setIsLoading(true);
            let reportData = await getReport(filter).then((data) => data);
            setIsLoading(false);
            if (reportData && reportData.data) {
                reportData.data = reportData.data.map((data) => {
                    console.log(data)
                   data = data.map((d) => {
                       return d === 'undefined' ? '--' : d
                   });
                    return data;
                });
                console.log(reportData)
            }
            setReport(reportData);
        } else {
            setMsg("Please select status");
            setOpen(true);
        }
    }, [filter]);

    const handleChange = useCallback(
        async (eventOrValue, field, type, key) => {
            let value = eventOrValue || "",
                slug = field?.slug || "";

            //For report view date filter
            if (field.dateFormat && value) {
                if (field.slug === "created__gte") {
                    value = moment(value).startOf('day').format(field.dateFormat);
                }
                else if (field.slug === "created__lte") {
                    value = moment(value).endOf('day').format(field.dateFormat);
                }
            }

            if (slug) {
                filter[slug] = value;
                setFilter(filter);
                setReportData();
            }
            return true;
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [filter]);

    const handleApproveClaim = async (e) => {
        let generateClaimData = await generateClaimReport(filter).then(
            (data) => data
        );

        const args = {
            style: { background: "#1BC5BD" },
            message: "Approved Claim Report",
            description: generateClaimData,
            duration: 3,
        };

        notification.open(args);
    };

    const handleExportReport = async (e) => {
        await exportClaimReport(filter).then((data) => data);
    };

    useEffect(() => {
        initialDataLoad();
    }, []);

    const initialDataLoad = async () => {
        await getFCReportForm();
    };

    const getDateOptions = async () => {
        let options = [];
        const data = await getReportDateOptions();
        data && data.financial_claim_cycle_date && data.financial_claim_cycle_date.map((month) => {
            options.push({ value: month, label: month });
            return month;
        });
        return options;
    };


    const getFCReportForm = async () => {
        let filterForms = configData.REPORT_FILTER || [];
        const dateOptions = await getDateOptions();
        // const companyList = await getCompanyOptions();

        filterForms = filterForms.map((field) => {
            if (field.slug === "claim-form_cycle") {
                field.options = dateOptions;
                console.log('gone')
            } else if (field.slug === 'company') {
                // field.options = companyList;
            }
            return field;
        });
        setFilterForm(filterForms);
    }

    const getSerialDetail = (value) => {
        const value_list = value.split('_');

        const serial = value_list[0];
        const id = value_list[1];
        const type = value_list[2];

        viewForm(serial, id, type)
    }

    const viewForm = useCallback(
        async (serial, id, formType) => {
            let formData;

            formData = await getViewForm(id, formType, "form/entries").then(
                (data) => data
            );

            if (formData.status === 404) {
                formData = await getViewForm(id, formType, "form/entries/action").then(
                    (data) => data
                );
            }

            if (formData) {
                setDetailForm(formData.data);
                setIsModalVisible(true);
            }
        },
        [setIsModalVisible, setDetailForm]
    );

    let headerArray = [];
    let subHeaderArray = [];

    if (report?.header) {
        console.log(report)
        Object.keys(report.header).forEach((key, index) => {
            headerArray.push(key);
            subHeaderArray.push(report.header[key])
        })
    }


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <>
            <Snackbar
                open={open}
                anchorOrigin={{
                    horizontal: "right",
                    vertical: "top",
                }}
                autoHideDuration={3000}
                onClose={handleClose}
            >
                <Alert severity="warning">{msg}</Alert>
            </Snackbar>
            <Card>
                <CardHeader title={convertToPascalCase(typeOfClaim)} className='text-capitalize'>
                    <CardHeaderToolbar></CardHeaderToolbar>
                </CardHeader>

                <CardBody>
                    <div className="mt-5">
                        {filterForm && filterForm.length > 0
                            ? filterForm.map((filter, i) => (
                                <FormInput
                                    key={i}
                                    changeEvent={handleChange}
                                    field={filter}
                                />
                            ))
                            : null}
                    </div>
                    {/* <div>
                        {report && console.log(report.html_content)}
                        {report ? (
                            <div
                                onClick={(e) => clickHandler(e)}
                                className="report-table"
                                dangerouslySetInnerHTML={{
                                    __html: report.html_content,
                                }}
                            ></div>
                        ) : null}
                    </div> */}
                    {isLoading && (
                        <div className="d-flex justify-content-center">
                            <div className="spinner spinner-primary m-30"></div>
                        </div>
                    )}
                    {report?.data?.length > 0 && !isLoading ? (
                        <div className='fc-report-table-wrapper'>
                            <table className="dataframe table text-center table-responsive">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        {headerArray && headerArray.map((key, index) => {
                                            return (<th key={index} colSpan={report.header[key].length}>{key.toUpperCase()}</th>)
                                        })}
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        {subHeaderArray && subHeaderArray.flat().map((key, index) => {
                                            return (<th key={index}>{key.toUpperCase()}</th>)
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        report?.data?.map((value, idx) => {
                                            return <tr key={idx}>
                                                {value.map((item, index) => {
                                                    return (
                                                        <td
                                                            key={index}
                                                            rowSpan={index === 0 && report?.group_list.filter(x => x === item).length !== 0 ? report?.group_list.filter(x => x === item).length : ''}
                                                        >
                                                            {typeof item == 'string' && item.includes('Claim#') ? (
                                                                item.split(",").map((value, idx) => {
                                                                    return (
                                                                        <button key={idx} className="btn btn-primary btn-sm m-2 rounded-0" onClick={() => getSerialDetail(value)}>
                                                                            {value.split('_')[0]}
                                                                        </button>
                                                                    )
                                                                })
                                                            ) : item === 0 ? '-' : item}

                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    ) : (('approvals__status' in filter) ? <div className="d-flex flex-center text-center text-muted min-h-200px">No Data Available!</div> : null)}
                </CardBody>
                <CardFooter>
                    <div className="w-100 text-right">
                        {user?.can_approve_all_claims ? (
                            <button
                                className={`btn btn-danger`}
                                disabled={report?.data?.length <= 0 || filter?.approvals__status !== "pending"}
                                onClick={() => handleApproveClaim()}
                            >
                                Approved all claims
                            </button>
                        ) : null}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <button
                            className="btn btn-success"
                            onClick={(e) => handleExportReport(e)}
                        >
                            Export excel
                        </button>
                    </div>
                </CardFooter>
            </Card>
            {isModalVisible && (
                <FormModal setIsModalVisible={setIsModalVisible} isModalVisible={isModalVisible} formDetail={detailForm} />)}
        </>
    );
};

const mapStateToProps = createStructuredSelector({
    user: selectUserData,
});

export default connect(mapStateToProps)(Report);