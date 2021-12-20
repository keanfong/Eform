import React, { useState, useEffect, createRef, useCallback } from "react";
import { connect } from "react-redux";
import moment from "moment";

import {
    makeStyles,
    OutlinedInput,
    Input,
    InputLabel,
    FormControl,
    Select,
    TextField,
    Checkbox,
    FormControlLabel,
    FormHelperText,
    InputAdornment,
    // IconButton,
    Divider,
    Link
} from "@material-ui/core";

import LinkIcon from '@material-ui/icons/Link';
import { nanoid } from "nanoid";

import SVG from "react-inlinesvg";
import ModalContainer from "../../components/Modal";

// import { toAbsoluteUrl } from "../../../_metronic/_helpers";

import { createStructuredSelector } from "reselect";
import {
    selectFormData,
    selectFormFieldData,
    selectFormTableFieldData,
    selectFormTallyFieldData,
} from "../../../redux/selectors/form-selector.js";

import {
    updateFormData,
    updateFormFieldData,
    updateFormTableFieldData,
    updateFormTallyFieldData,
} from "../../../redux/actions/action.js";

import { DatePicker, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { uploadFormAttachments } from "../../modules/services/api.js";
// import { getComputeFieldType } from "../../modules/services/helpers.js";

import { getCompute } from "../../modules/services/api.js";

import PendingForms from "../activity/pending-forms.jsx";

import "antd/dist/antd.css";

import configData from "../../modules/services/config.json";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";

import { truncate, decimal_format } from '../../modules/utils/utils';

const useStyles = makeStyles((theme) => ({
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
}));

const getValueOrDefault = (_field) => {
    if (_field?.value == null && _field?.value == undefined) {
        if (_field?.default == null && _field?.default == undefined) {
            if (_field?.type === 'float')
                return '0.00'
            else if (_field?.type === 'boolean')
                return false
            return ''
        }
        else {
            if (_field?.type === 'float')
                return `${parseFloat(_field?.default)?.toFixed(2)}`

            else if (_field?.type === 'boolean')
                return _field?.default

            return `${_field?.default}`
        }
    }
    else {
        if (_field?.type === 'float')
            return `${parseFloat(_field?.value)?.toFixed(2)}`

        else if (_field?.type === 'boolean')
            return _field?.value

        return `${_field?.value}`
    }
}

// const dollarIndianLocale = Intl.NumberFormat('en-IN');
const FormInput = ({ key, formName, slipClass, field, hideHelp, error, type, rowKey, isReadOnly, fieldValue, tableFieldValue, tallyFieldValue,
    dataSource, setFieldValue, setTableFieldValue, setTallyFieldValue, formData, setDataSource, updateForm, changeEvent,
}) => {
    const classes = useStyles();
    const [intialState, setInitialState] = useState(false);
    const ref = createRef();
    const [labelWidth, setLabelWidth] = useState(0);
    const [fieldType, setFieldType] = useState(null);
    const [value, setValue] = useState("");
    const [props, setProps] = useState();
    const [fileList, setFileList] = useState([]);
    const [showReferenceModal, setShowReferenceModal] = useState();
    const [pageSize, setPageSize] = useState(10);
    useEffect(() => {
        setInitialFieldValue();
    }, []);

    const setInitialFieldValue = () => {
        if (!intialState && !(tableFieldValue && tallyFieldValue && fieldValue)) {
            let valObj = {};

            let val = getValueOrDefault(field)

            valObj.type = field?.type;
            valObj.extra = field?.extra;
            valObj.value = val //field?.value || "";
            valObj.label = field?.label
            valObj.optional = field?.optional || false;

            if (field?.type && field.type === 'float') {
                valObj.value = decimal_format(valObj.value);
            }

            if (type === "table-fields") {
                // let prevField = tableFieldValue ? tableFieldValue : {};

                // prevField[field?.slug] = valObj;
                let prevField = tableFieldValue ? tableFieldValue : dataSource, //[{ key: nanoid() }],
                    newValObj = prevField.map((obj) => {
                        if (obj.key && rowKey === obj.key) {
                            obj[field?.slug] = valObj;
                        }
                        else if (!obj.key) {
                            obj.key = nanoid()
                        };
                        return obj;
                    });
                setTableFieldValue(newValObj);

            } else if (type === "tally-fields") {
                let prevField = tallyFieldValue ? tallyFieldValue : {};

                prevField[field?.slug] = valObj;

                setValue(valObj.value);

                setTallyFieldValue(prevField);
            } else {
                let prevField = fieldValue ? fieldValue : {};

                prevField[field?.slug] = valObj;

                setFieldValue(prevField);
            }
            setInitialState(true);
        } else {
            // TODO: fix
            // console.log(tableFieldValue)
        }
    };

    const format = useCallback((fieldObj, slug) => {
        const formField = formData ? formData : null;

        const draftForm = JSON.parse(JSON.stringify(formField));
        /**Fields */
        const fields = {};

        if (formField && formField.fields && formField.fields.length > 0) {
            formField.fields.map((field) => {
                const newValue = {
                    label: field.label,
                    type: field.type,
                    extra: field.extra,
                    value: (fieldValue && fieldValue[field.slug] && fieldValue[field.slug].value) ? fieldValue[field.slug].value : "",
                };
                return (fields[field.slug] = newValue);
            });
        }

        draftForm.fields = fields;

        const tableInput = tableFieldValue || [];

        /**Table fields */
        const table_fields = tableInput && tableInput.length > 0 ? tableInput.map((fieldVal) => {
            if (formField && formField.table_fields && formField.table_fields.length > 0) {
                formField.table_fields.map((field) => {
                    let newValue = {
                        value: getValueOrDefault(fieldVal[field?.slug]), //(fieldVal && fieldVal[field.slug] && fieldVal[field.slug].value) ? fieldVal[field.slug].value : field.default || "",
                        label: field.label,
                        type: field.type,
                        extra: field.extra,
                        optional: field.optional,
                        // options: field.options || [],
                    };

                    if (field.type === "float") {
                        newValue.value = parseFloat(newValue.value);
                    }

                    fieldVal[field?.slug] = newValue;

                    return field;
                });
            }
            return fieldVal;
        }) : [];

        draftForm.table_fields = table_fields;

        /**Tally fields */
        const tally_fields = {};

        if (formField && formField.tally_fields && formField.tally_fields.length > 0) {
            formField.tally_fields.map((field) => {
                let newValue = {
                    label: field.label,
                    type: field.type,
                    extra: field.extra,
                    value: (tallyFieldValue && tallyFieldValue[field.slug] && tallyFieldValue[field.slug].value) ? tallyFieldValue[field.slug].value : "",
                };

                tally_fields[field.slug] = newValue;

                return field;
            });
        }

        draftForm.tally_fields = tally_fields;

        return draftForm;
    },
        [formData, fieldValue, tableFieldValue, tallyFieldValue]
    );

    const getFormattedComputeForm = useCallback(
        (computeForm, dataForm, keyId) => {
            const forms = formData ? formData : dataForm;
            /**Data massaging */
            const tallyFieldObj = {};
            const tally_fields = forms && forms?.tally_fields.length > 0 ? forms.tally_fields.map((field) => {
                if (computeForm?.tally_fields && computeForm.tally_fields[field.slug]) {
                    field.value = computeForm.tally_fields[field.slug].value || "";

                    if (computeForm.tally_fields[field.slug]?.options) {
                        field.options = computeForm.tally_fields[field.slug].options;
                    }
                    if (computeForm.tally_fields[field.slug]?.type) {
                        field.type = computeForm.tally_fields[field.slug].type;
                    }
                } else {
                    // field.value = dataForm?.tally_fields[field.slug].value;
                    // FIXED: setting values if it has default value
                    field.value = dataForm?.tally_fields[field.slug].value || field.value || field.default;
                }
                if (computeForm?.tally_fields && computeForm.tally_fields[field.slug]?.extra) {
                    field.type = computeForm.tally_fields[field.slug]?.extra?.type;
                    field.extra = computeForm.tally_fields[field.slug]?.extra;
                }

                tallyFieldObj[field.slug] = { ...field };
                // console.log(field)
                return field;
            }) : {};

            const fieldObj = {};
            const fields = forms && forms?.fields.length > 0 ? forms.fields.map((field) => {
                if (computeForm?.fields && computeForm.fields[field.slug]) {
                    field.value = computeForm?.fields[field.slug]?.value || fieldValue[field.slug]?.value || "";
                    if (computeForm.fields[field.slug]?.options) {
                        field.options = computeForm.fields[field.slug].options;
                    }
                    if (computeForm.fields[field.slug]?.type) {
                        field.type = computeForm.fields[field.slug].type;
                    }
                } else {
                    field.value = dataForm?.fields[field.slug].value;
                }

                fieldObj[field.slug] = { ...field };

                return field;
            }) : {};

            let table_fields = [],
                newDataSource = [];

            if (computeForm?.table_fields && computeForm?.table_fields.length > 0) {
                newDataSource = dataSource ? dataSource.map((data, index) => {
                    let fieldVal = computeForm.table_fields[index];

                    table_fields = forms && forms?.table_fields.length > 0 ? forms.table_fields.map((field) => {
                        let computeTableField = fieldVal[field.slug],
                            computeValue = computeTableField?.value || "";
                        if (fieldVal?.key?.key === data?.key?.key) {
                            if (computeTableField) {
                                if (field.type === "float" && parseFloat(computeValue))
                                    computeValue = parseFloat(computeValue).toFixed(2);

                                if (computeValue) {
                                    data[field.slug] = { value: computeTableField.value || "", };
                                }
                                if (computeTableField?.options) {
                                    let options = computeTableField.options.map(
                                        (option) => {
                                            if (!option.key) {
                                                option.key = data.key;
                                            }
                                            return option;
                                        }
                                    );

                                    if (options.length > 0) {
                                        if (data[field.slug]) {
                                            data[field.slug].options = options;
                                        } else {
                                            data[field.slug] = { options };
                                        }
                                    } else {
                                        data[field.slug].options = field?.options || [];
                                    }
                                }
                                if (computeTableField?.value)
                                    field.value = computeTableField?.value; //field.value
                                if (computeTableField?.type) {
                                    field.type = computeTableField?.type;
                                    if (data[field.slug]) {
                                        data[field.slug].type = computeTableField?.type;
                                    }
                                }
                                if (computeTableField?.extra?.hasOwnProperty("url")) {
                                    field.extra = computeTableField.extra;
                                    if (data[field.slug]) {
                                        data[field.slug].extra = computeTableField?.extra;
                                    }
                                }
                            }
                        }
                        else if (data[field.slug]) {
                            data[
                                field.slug
                            ].options = computeTableField
                                    ? computeTableField.options
                                    : field.options;
                        }

                        field = {
                            ...field,
                            ...computeTableField,
                        };

                        return field;
                    }) : [];
                    return data;
                }) : [];
            }

            setTallyFieldValue(tallyFieldObj);
            setFieldValue(fieldObj);
            if (newDataSource.length > 0) setDataSource(newDataSource);

            const form = forms;
            if (tally_fields.length > 0) form.tally_fields = tally_fields;
            if (fields.length > 0) form.fields = fields;
            if (table_fields.length > 0) form.table_fields = table_fields;

            return form;
        },
        [formData, setDataSource, dataSource, fieldValue, setFieldValue, setTallyFieldValue]
    );

    const computeFormData = useCallback(
        async (values, slug, fieldT) => {
            let data = format(values, slug);

            const endPoint = formData.computer;

            const computeForm = endPoint ? await getCompute(data, endPoint) : null;
            if (computeForm) {
                const forms = getFormattedComputeForm(computeForm, data);

                // console.log('computeForm =>',computeForm)
                // console.log('forms =>',forms)
                // console.log('formData =>',formData)
                // console.log('data =>',data)
                // console.log('updateForm =>',updateForm)
                // FIXED: setting values if it has default value
                // if(forms?.tally_fields) {
                //     forms.tally_fields = forms?.tally_fields.map((field) => {
                //         if (field?.default && !field?.value) {
                //             // console.log(field);
                //             field.value = field.default;
                //             return field;
                //         }
                //         return field;
                //     });
                // }

                // if (fieldT === "table-fields") {
                //     setTableFieldValue(values)
                // };

                if (updateForm) {
                    // updateForm(forms);
                    updateForm(forms);
                }
            }
        },
        [formData, format, updateForm, getFormattedComputeForm]
    );

    const handleChange = useCallback(
        async (value, field, type) => {
            if (changeEvent) {
                // console.log(value, field, type)
                changeEvent(value, field, type);
            } else {
                field.value = value;

                let values = {},
                    valObj = {};

                valObj.type = field?.type;
                valObj.label = field?.label;
                valObj.extra = field?.extra;
                valObj.value = getValueOrDefault(field) //value || ""; //!--------------------------------------------------------
                valObj.optional = field?.optional || false;

                if (type === "table-fields") {
                    let prevField = tableFieldValue, //dataSource,
                        newValObj = prevField.map((obj) => {
                            if (rowKey === obj.key) obj[field.slug] = valObj;
                            return obj;
                        });

                    values = newValObj;
                    setTableFieldValue(newValObj);
                } else if (type === "tally-fields") {
                    let prevField = tallyFieldValue ? tallyFieldValue : {};

                    prevField[field.slug] = valObj;

                    values = prevField;
                    setTallyFieldValue(prevField);
                } else {
                    let prevField = fieldValue ? fieldValue : {};

                    prevField[field.slug] = valObj;

                    values = prevField;
                    setFieldValue(prevField);
                }

                if (
                    computeFormData &&
                    ["dropdown", "checkbox", "date"].includes(fieldType)
                )
                    computeFormData(values, field.slug, type);
            }
        }, [rowKey, fieldType, changeEvent, fieldValue, dataSource, setTallyFieldValue, setFieldValue, setTableFieldValue, tableFieldValue, tallyFieldValue, computeFormData]);

    const handleChangeEvent = useCallback(
        (eventOrValue, momentDate) => {
            // console.log({ eventOrValue }, { momentDate })
            // console.log(eventOrValue?.target?.name,eventOrValue?.target?.value, field, formData)
            let value = ["date", "link", "file"].includes(fieldType) ? eventOrValue : eventOrValue?.target?.value || "";

            if (fieldType === "checkbox") {
                value = !value;
            } else if (fieldType === "date" && value) {
                // value = momentDate;
                if (formName === 'replacement-leave-requisition') {
                    value = momentDate.format('YYYY-MM-DD');
                }
            }

            // if (field.slug === "percentage-incident-cost" || field.slug === "percentage-of-statutory-contribution" || field.slug === "percentage-commission") {
            //     value = value.replace(/[^0-9]/g, '');
            // }
            // number formatting
            // if (field.type === 'float' || field.type === 'integer') {
            //     // console.log('gone', value.charAt(value.length-1));
            //     if(isNaN(value.split(',').join(''))) {return;}
            //     if (!value.includes('.')) {
            //         value = dollarIndianLocale.format(value.split(',').join(''));
            //     }

            // }

            // console.log(value,field,type,rowKey)
            handleChange(value, field, type, rowKey);
            setTimeout(() => {
                setValue(value);
            }, 10);
        }, [field, fieldType, handleChange, rowKey, type, formName]);

    const getProps = useCallback(async () => {
        let rowValue = -1,
            submittedForUserName = fieldValue && fieldValue["submitted-for"] && fieldValue["submitted-for"].value ? fieldValue["submitted-for"].value : "test";

        if (type === "table-fields") {
            rowValue = 1;
        }
        else if (type === "tally-fields") {
            rowValue = -2;
        }

        let data = {
            row: rowValue,
            field: "attachment",
            formName,
            change: handleChange,
            submitted_by: submittedForUserName,
        };

        let uplod = await uploadFormAttachments(
            data,
            setFileList,
            handleChange,
            field
        ).then((res) => res);

        setProps(uplod);
    }, [type, formName, handleChange, fieldValue, field]);

    // const findStateValue = useCallback(() => {
    //   let valueObj = null;

    //   if(type === 'table-fields') {

    //     valueObj = tableFieldValue ? tableFieldValue.find(obj => obj.key === rowKey) : {};

    //   }else if(type === 'tally-fields') valueObj = tallyFieldValue;
    //   else valueObj = fieldValue;

    //   return valueObj && valueObj[field.slug] && valueObj[field.slug].value ? valueObj[field.slug].value : '';
    // },[field,rowKey, type, fieldValue, tableFieldValue, tallyFieldValue, ])

    useEffect(() => {
        // if (ref?.current?.offsetWidth) setLabelWidth(ref?.current?.offsetWidth);

        const fieldConfig = configData.FORM_TYPE || [];

        const fieldObj = fieldConfig.find((configObj) => {
            return configObj.allowed_types.includes(field?.type);
        });

        setFieldType(fieldObj?.type || "");

        if (fieldType === "file" && !props) setProps(getProps());

        if (field?.value) {
            if (typeof field.value === "object") {
                setValue(field.value.value);
            } else setValue(field.value);
        }

        if (fieldValue && fieldValue[field?.slug]?.value && !type) {
            let valueOfField = fieldValue[field.slug].value;

            if (typeof valueOfField === "object") {
                setValue(valueOfField);
            } else {
                setValue(valueOfField)
            };
        } else if (tallyFieldValue && tallyFieldValue[field?.slug]?.value && type === "tally_fields") {
            let valueOfField = tallyFieldValue[field.slug]?.value;
            if (typeof valueOfField === "object") {
                setValue(valueOfField);
            } else {
                setValue(valueOfField)
            };
        }

        if (tableFieldValue?.length > 0) {
            let fieldObj = tableFieldValue.find((fieldVal) => fieldVal.key === rowKey);

            if (fieldObj && fieldObj?.options?.length) {
                field.options = fieldObj.options;
            }
        }
        // ref,
    }, [field, type, rowKey, tableFieldValue, setLabelWidth, setFieldType, setValue,
        props, setProps, fieldType, getProps, formName, fieldValue, setFieldValue, tallyFieldValue]);

    const handleChangeCheck = (event) => {
        // let newValue =
        //     fieldValue && fieldValue[field.slug] && fieldValue[field.slug].value
        //         ? false
        //         : true;

        // New Code
        let newValue;
        if (type === 'table-fields') {
            newValue = field && field.slug && field.value ? false : true;
        } else {
            newValue = fieldValue && fieldValue[field.slug] && fieldValue[field.slug].value ? false : true;
        }
        // New Code End
        // console.log({field},{newValue})
        handleChange(newValue, field, type, rowKey);

        setValue(newValue);
    };

    const showLinkView = (e) => {
        setShowReferenceModal(true);
    };
    // const removeReferenceValue = (e) => {
    //     handleChange(null, field, type, rowKey);
    // };
    const handleFileUpload = (info) => {
        // if (info.file.status !== "uploading") {
        //     // console.log(info.file, info.fileList);
        // }

        if (info) {
            if (info.file.status !== "removed") {
                let fileList = [...info.fileList];
                // 1. Read from response and show file link
                fileList = fileList.map((file) => {
                    if (file.response) {
                        // Component will show file.url as link
                        file.url = file.response.file;

                        file.name = file.response && file.response.file
                            ? //eslint-disable-next-line
                            truncate(file.response.file, 15)
                            // file.response.file.replace(/^.*[\\\/]/, "")
                            : "";
                    }
                    return file;
                });

                handleChangeEvent(fileList[0].url, field);

                setFileList(fileList);

                return fileList;
            } else {
                handleChange("", field, type);

                setValue("");
                setFileList("");

            }
            if (info.file.status === "done") {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === "removed") {
                message.success(`${info.file.name} file removed successfully`);
            } else if (info.file.status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        } else {
            handleChange("", field, type);

            setValue("");
            setFileList("");

        }


    };

    const handleCancel = () => {
        setShowReferenceModal(false);
    };

    const getError = (slug) => {
        let obj = null;

        if (type === "table-fields") {
            let valObj = tableFieldValue[0];

            obj = field || {};

            if (valObj && valObj[slug] && valObj[slug].value) {
                obj.value = valObj[slug].value || "";
            }
        } else if (type === "tally-fields") {
            obj = tallyFieldValue ? tallyFieldValue[slug] : null;
        } else {
            obj = fieldValue && fieldValue[slug] ? fieldValue[slug] : null;
        }

        if (obj && typeof obj === "object" && !["break", "hidden", "boolean"].includes(obj.type)) {
            if (!obj.optional && !obj.value) {
                return "Field is required!";
            } else if (obj.value && obj.type === 'integer' && !(/^-?\d+$/.test(obj.value))) {
                return "Value must be integer";
            }
        }
    };
    const isValidHttpUrl = (str) => {
        let regEx =
            /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$/gm;
        return regEx.test(str);
    };

    const getInputElement = (fieldData) => (
        <>
            {fieldType !== "file" ? (
                <TextField
                    id={key}
                    required={!fieldData.optional}
                    error={formData?.error && !!getError(fieldData?.slug) ? true : false}
                    disabled={fieldType === "hidden" || isReadOnly || field.type === 'text' || field.readOnly ? true : false}
                    label={hideHelp ? "" : fieldData?.label || ""}
                    className={fieldType === "checkbox" ? ` ${error && !!getError(fieldData.slug) ? "error" : ""} ${classes.textField} text-fields top-10` : ` ${error && !!getError(fieldData.slug) ? "error" : ""} ${classes.textField} text-fields`}
                    type={fieldType !== "checkbox" ? fieldType : ""}
                    // number formatting
                    // type={fieldType !== "checkbox" ? fieldType === 'number' ? 'text' : fieldType : ""}
                    name={fieldData.slug}
                    helperText={formData?.error ? getError(fieldData.slug) : hideHelp ? "" : fieldData.help}
                    value={getValueOrDefault(fieldData) /*value || (fieldData?.default !== null ? `${fieldData?.default}` : "")*/}
                    onChange={(e) => handleChangeEvent(e)}
                    onBlur={(e) => computeFormData(value)}
                    variant="outlined"
                    checked={fieldType === "checkbox" && getValueOrDefault(fieldData)}//{value ? "checked" : ""}
                    InputLabelProps={["file"].includes(fieldType) ? { shrink: true } : fieldType === "checkbox" ? { shrink: false } : {}}
                    InputProps={{
                        endAdornment: (
                            isValidHttpUrl(value) ? (
                                <>
                                    <Divider style={{ height: 28, margin: 4 }} orientation="vertical" />
                                    <Link
                                        // className={classes.iconButton}
                                        style={{ paddingLeft: 10 }}
                                        // onClick={(e) => isValidHttpUrl(value) ? '' : e.preventDefault()}
                                        // color={isValidHttpUrl(value) ? 'primary' : 'secondary'}
                                        color={'primary'}
                                        href={value}
                                        target="_blank"
                                    >
                                        <LinkIcon />
                                    </Link>
                                </>
                            ) : (null)
                        ),
                    }}
                />
            ) : (
                <div className={`custom-file ${slipClass}`}>
                    {type !== "table-fields" ? (
                        <TextField
                            className={`${classes.textField} text-fields`}
                            id={key}
                            required={!field.optional}
                            error={formData?.error && !field.optional && !value ? true : false}
                            name={fieldData.slug}
                            type="text"
                            variant="outlined"
                            disabled={isReadOnly}
                            value={""}
                            onChange={(e) => handleChangeEvent(value)}
                            helperText={hideHelp ? "" : fieldData.errorMessage || fieldData.help}
                            label={fieldData?.label || ""}
                            InputLabelProps={{ shrink: true }}
                        ></TextField>
                    ) : null}
                    {!isReadOnly && !((field.value || value) && type) ? (
                        <>
                            <Upload
                                {...props}
                                onChange={handleFileUpload}
                                // disabled={fileList.length > 0}
                                multiple={false}
                                maxCount={1}
                                // onChange={() => console.log(field.value)}
                                fileList={fileList.length > 0 ? fileList : value ? [{
                                    //   name: value?.replace(
                                    //       //eslint-disable-next-line
                                    //       /^.*[\\\/]/,
                                    //       ""
                                    //   ),
                                    name: value && truncate(value, 15),
                                    url: value,
                                }] : []
                                }
                                className={`${fileList.length > 0 ? "hide-button upload-button" : "upload-button"}`}
                            >
                                {" "}
                                <Button icon={<UploadOutlined />}>
                                    Click to Upload
                                </Button>{" "}
                            </Upload>
                        </>
                    ) : (
                        <div style={{ position: isReadOnly ? 'unset' : 'relative' }}>
                            <a className="file-view" rel="noopener noreferrer" href={value} target="_blank">
                                {//eslint-disable-next-line
                                    // value?.replace(/^.*[\\\/]/, "")
                                    value && truncate(value, 15)
                                }
                            </a>
                            {!isReadOnly && <span className="svg-icon svg-icon-md svg-icon-danger" onClick={(e) => handleFileUpload()} style={{ position: 'absolute', top: 17, right: -25 }}>
                                <SVG height={16} width={16} src={"/media/svg/icons/General/Trash.svg"} />
                            </span>}
                        </div>
                    )}
                </div>
            )}
        </>
    );

    return (
        <>
            {fieldType !== "hidden" && field ? (
                <div className={`form-input ${type} ${field.type} ${(!value && !field?.value && !field?.default && !field.optional) ? (field.type === 'text' ? "disabled" : "required") : field.type === 'text' ? "disabled" : ""}`}>
                    {/* data-testid={JSON.stringify(field)} */}
                    {fieldType !== "break" ? (fieldType === "dropdown" && !isReadOnly ? (
                        <FormControl variant="outlined" className={`${classes.formControl} custom-fields drop-down`} error={formData?.error && !!getError(field.slug) ? true : false} >
                            {hideHelp ? ("") : (<InputLabel ref={ref} htmlFor="outlined-age-simple">{field?.label || ""} </InputLabel>)}
                            <Select
                                disabled={field?.disabled || false}
                                value={getValueOrDefault(field)}// {field.value || value || field.default || ""}
                                variant='outlined'
                                label={field?.label || ""}
                                required={!field.optional}
                                error={formData?.error && !!getError(field.slug) ? true : false}
                                onChange={(e) => handleChangeEvent(e)}
                                // InputLabelProps={{ shrink: true }}
                                input={type === 'table-fields' ? <OutlinedInput labelWidth={labelWidth} name={field.slug} id="outlined-age-simple" /> : null}
                            >
                                {/* <MenuItem value=" ">None</MenuItem> */}
                                {/* && optionData.key === rowKey  ( used in below drop down condition)*/}
                                {field.options && field.options.length > 0 ?
                                    field.options.map((optionData, index) => (optionData.key) || !optionData.key ? (
                                        <MenuItem key={`${key}-${optionData.value}`} value={optionData.value} >
                                            {optionData.label}
                                        </MenuItem>) :
                                        null) :
                                    null
                                }
                            </Select>
                            <FormHelperText>
                                {formData?.error ? getError(field.slug) : hideHelp ? "" : field.help}
                            </FormHelperText>
                        </FormControl>
                    ) : fieldType === "date" ? (
                        <div className="date-row">
                            {isReadOnly ? <label htmlFor="">{field.label}</label> : ""}
                            <DatePicker
                                value={value ? (moment.isMoment(value) ? value : moment(value)) : ""}
                                // defaultValue={value ? moment(value) : ""}
                                className={`${formData?.error && !!getError(field.slug) ? "error" : ""} ${classes.textField} date-field top-5 ${error && !!getError(field.slug) ? "error" : ""}`}
                                placeholder={!type ? field.label : ""}
                                disabled={isReadOnly}
                                required={!field.optional}
                                // format={"DD-MM-YYYY"}
                                error={formData?.error && !!getError(field.slug) ? true : false}
                                onChange={(date, dateString) => handleChangeEvent(dateString, date)}
                            />
                            <FormHelperText className={`pl-8 ${formData?.error && !!getError(field.slug) ? "error-text" : ""}`} >
                                {formData?.error ? getError(field.slug) : hideHelp ? "" : field.help}
                            </FormHelperText>
                        </div>
                    ) : fieldType === "checkbox" ? (
                        <>
                            <TextField
                                id={key}
                                required={!field.optional}
                                error={formData?.error && !!getError(field.slug) ? true : false}
                                disabled
                                value={""}
                                // label={hideHelp ? "" : field?.label || ""}
                                className={` ${formData?.error && !!getError(field.slug) ? "error" : ""} ${classes.textField} text-fields`}
                                name={field.slug}
                                helperText={formData?.error ? getError(field.slug) : hideHelp ? "" : field.help}
                                variant="outlined"
                                InputLabelProps={{ shrink: false }}
                            />
                            <FormControlLabel
                                className="checkbox-label"
                                control={
                                    <Checkbox
                                        // checked={
                                        //     (fieldValue &&
                                        //         fieldValue[field.slug] &&
                                        //         fieldValue[field.slug]
                                        //             .value) ||
                                        //     (isReadOnly && value)
                                        //         ? true
                                        //         : false
                                        // }
                                        checked={type === 'table-fields' ? ((field && field.slug && field.value) || (isReadOnly && value) ? true : false) : (fieldValue && fieldValue[field.slug] && fieldValue[field.slug].value) || (isReadOnly && value) ? true : false}
                                        disabled={isReadOnly}
                                        onChange={(e) => handleChangeCheck(e)}
                                        name={field.slug}
                                        color="secondary"
                                    />
                                }
                                label={type !== 'table-fields' ? field.label : ''}
                            />
                        </>
                    ) : fieldType === "link" ? (
                        <>
                            <FormControl className={`${classes.formControl} ${error && !!getError(field.slug) ? "error" : ""} custom-fields reference-field`} error={error && !!getError(field.slug) ? true : false} >
                                <Input
                                    type={fieldType}
                                    value={value ? value.split(",")[1] ? value.split(",")[1] : value : ""}
                                    // defaultValue={value ? value.split(",")[1] ? value.split(",")[1] : value : ""}
                                    title={value ? value.split(",")[1] ? value.split(",")[1] : value : ""}
                                    disabled
                                    endAdornment={
                                        <InputAdornment position="end">
                                            {/* <IconButton
                                                aria-label="show reference form"
                                                onClick={(e) => showLinkView(e)}
                                                edge="end"
                                            >
                                                <SVG src={toAbsoluteUrl("/media/svg/icons/General/Attachment2.svg")} />
                                            </IconButton> */}
                                            <button type='button' onClick={(e) => showLinkView(e)} >
                                                <span className="svg-icon svg-icon-md svg-icon-dark">
                                                    <SVG height={16} width={16} src={"/media/svg/icons/General/Attachment2.svg"} />
                                                </span>
                                            </button>
                                            <button type='button' onClick={(e) => handleChangeEvent(null)} >
                                                <span className="svg-icon svg-icon-md svg-icon-danger">
                                                    <SVG height={16} width={16} src={"/media/svg/icons/General/Trash.svg"} />
                                                </span>
                                            </button>
                                        </InputAdornment>
                                    }
                                // labelWidth={70}
                                />
                                <FormHelperText>
                                    {error ? getError(field.slug) : hideHelp ? "" : field.help}
                                </FormHelperText>
                            </FormControl>
                            <ModalContainer
                                isOpen={showReferenceModal}
                                onClose={handleCancel}
                                modalBody={
                                    <PendingForms
                                        handleChange={handleChangeEvent}
                                        hideModal={setShowReferenceModal}
                                        linkUrl={field?.extra?.url || ""}
                                        pageSize={pageSize}
                                        setPageSize={setPageSize}
                                        initialColumns={[]}
                                        showSelect={true}
                                    />
                                }
                            />
                        </>
                    ) : (getInputElement(field))) : null}{" "}
                </div>
            ) : null}
        </>
    );
};

const mapStateToProps = createStructuredSelector({
    formData: selectFormData,
    fieldValue: selectFormFieldData,
    tableFieldValue: selectFormTableFieldData,
    tallyFieldValue: selectFormTallyFieldData,
});

const mapDispatchToProps = (dispatch) => ({
    // setFormData: (data) => dispatch(updateFormData(data)),
    setFieldValue: (data) => dispatch(updateFormFieldData(data)),
    setTableFieldValue: (data) => dispatch(updateFormTableFieldData(data)),
    setTallyFieldValue: (data) => dispatch(updateFormTallyFieldData(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormInput);
