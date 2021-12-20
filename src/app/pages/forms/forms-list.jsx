import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { getForms } from "../../modules/services/api.js";
import { toAbsoluteUrl } from "../../../_metronic/_helpers";
import { resetTotalFormData } from "../../../redux/actions/action.js";
import { sortBy } from "lodash-es";

const FormList = ({ resetFormData }) => {
    const [formList, setFormList] = useState(null);

    // useEffect(() => {
    //     async function getFormList() {
    //         let forms = await getForms().then((data) => data.result);
    //         forms = sortBy(forms, 'position')
    //         return setFormList(forms);
    //     }

    //     getFormList();
    // }, [setFormList]);

    const resetState = () => {
        resetFormData();
    };
    
    return (
        <>
            <div className="form-view">
                <div className="form-heading bg-dark" style={{ height: "10rem" }}>
                    <span className="form-text">Submit New Form</span>
                </div>
                <div className="form-body row">
                    {formList ? formList.map((form, index) => (
                        <div className="forms-list col-lg-5 col-sm-10" key={index}>
                            <Link to={`/forms/${form.slug}`} handler={resetState()}>
                                <div className="col-md-12 col-xl-12 col-xs-12 form-detail">
                                    <div className="col-md-2 form-col">
                                        <img width={50} height={50} src={`${form.logo || toAbsoluteUrl("/media/form-images/credit.svg")}`} alt={`form logo`} />
                                    </div>
                                    <div className="form-name-section col-md-8 pl-3">
                                        <span className="form-name">{" "}{form.name}</span>
                                    </div>
                                    <div className="col-md-2 form-short-name ">
                                        <span className="short-name m-0">{form.short_name || "SN"}</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )) : null}
                </div>
            </div>
        </>
    );
};

const mapDispatchToProps = (dispatch) => ({
    resetFormData: (data) => dispatch(resetTotalFormData(data)),
});

export default connect(null, mapDispatchToProps)(FormList);
