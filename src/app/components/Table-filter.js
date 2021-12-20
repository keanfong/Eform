import React from "react";
import { Formik } from "formik";

export function TableFilter({ setSearchValue, searchValue, setReload }) {
    // Products UI Context

    const applyFilter = (values) => {
        setSearchValue(values.searchText);
        setReload(true);
    };

    return (
        <>
            <Formik
                initialValues={{
                    searchText: searchValue,
                }}
                onSubmit={(values) => {
                    applyFilter(values);
                }}
            >
                {({ values, handleSubmit, handleBlur, setFieldValue }) => (
                    <form
                        onSubmit={handleSubmit}
                        className="form form-label-right"
                    >
                        <div className="form-group row right">
                            <div className="col-lg-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="searchText"
                                    placeholder="Search"
                                    onBlur={handleBlur}
                                    value={values.searchText}
                                    onChange={(e) => {
                                        setFieldValue(
                                            "searchText",
                                            e.target.value
                                        );
                                        handleSubmit();
                                    }}
                                />
                            </div>
                        </div>
                    </form>
                )}
            </Formik>
        </>
    );
}
