import React, { useEffect, useState, useCallback, useRef } from "react";
import { connect } from "react-redux";
import { useParams, Redirect, useLocation, useHistory } from "react-router-dom";

import { createStructuredSelector } from "reselect";

import {
  Card,
  CardBody,
  CardHeader,
  CardHeaderToolbar,
  CardFooter,
} from "../../../_metronic/_partials/controls/card.js";

import Snackbar from "@material-ui/core/Snackbar/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

import { message, Table } from "antd";
import { nanoid } from "nanoid";

import SVG from "react-inlinesvg";

import { LayoutSplashScreen } from "../../../_metronic/layout";
import {
  getCompute,
  getForm,
  validateForm,
  submitForm,
  saveNewAsDraft,
  updateDraft,
  getSlipFormData,
  checkClaimFormmPermission,
//   deleteForm,
  apiCancelDraftFormWithRemark,
} from "../../modules/services/api.js";
import FormInput from "./form-fields.jsx";
import {
  resetTotalFormData,
  updateFormData,
  updateFormFieldData,
  updateFormTableFieldData,
  updateFormTallyFieldData,
} from "../../../redux/actions/action.js";
import {
  selectFormData,
  selectForms,
  selectFormFieldData,
  selectFormTableFieldData,
  selectFormTallyFieldData,
  selectUserData,
} from "../../../redux/selectors/form-selector.js";

import EquipmentPDF from "./equipment-pdf.jsx";

import configData from "../../modules/services/config.json";
import ListsWidget1 from "../../../_metronic/layout/components/list/ListsWidget1";
import { useDispatch } from "react-redux";
import FormModal from "./form-modal";
import {
  clearHeaderState,
  setHeaderTitle,
} from "../../../redux/reducers/header.reducer.js";

const formConfigConstants = () => {
  return {
    "Commission Requisition": "COMMISSION_REQUISITION",
    Manpower: "MANPOWER_REQUISITION",
    Claim: "CLAIM_REQUISITION",
    "Customer Credit": "CUSTOMER_CREDIT_REQUISITION",
    "Loan/Rent/Demo": "EQUIPMENT_REQUISITION",
    Purchase: "PURCHASE_REQUISITION",
    "Replacement Leave": "REPLACEMENT_LEAVE_REQUISITION",
    Training: "TRAINING_REQUISITION",
    Travel: "TRAVEL_REQUISITION",
  };
};

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const Forms = ({
  setFormData,
  formData,
  fieldValue,
  totalFormValue,
  user,
  tableFieldValue,
  tallyFieldValue,
  resetFormData,
  setTableFieldValue,
  setTallyFieldValue,
  type,
  slipData,
  valuesToPreFill,
  formName,
}) => {
  const { formType, id } = useParams();
  const { params } = useLocation();
  const { formInfo, isNewEntry } = params || {};
  const [showSuccessToaster, setShowSuccessToaster] = useState("");
  const [hasFormAdded, setHasFormAdded] = useState();
  const [title, setTitle] = useState(null);
  const [tab, setTab] = useState("basic");
  const [columns, setColumns] = useState([]);
  const [executors, setExecutors] = useState();
  const [approvers, setApprovers] = useState();
  const [hasError, setHasError] = useState(false);
  const [isRequiredFieldMissing, setIsRequiredFieldMissing] = useState(false);
  const [showToaster, setShowToaster] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [formId, setFormId] = useState();
  const [showLoader, setShowLoader] = useState(false);

  let dataSource = useRef([]);
  let initalTableData = useRef({});
  let history = useHistory();
  const setDataSource = (data) => (dataSource.current = data);
  console.log(dataSource);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('useEffect dataSource =>',  dataSource)
  }, [dataSource.current]);

  useEffect(() => {
    dispatch(setHeaderTitle("Submit New Form"));
    return () => {
      dispatch(clearHeaderState());
    };
  }, [dispatch]);

  const getValueOrDefault = (_field) => {
    if(_field?.value == null && _field?.value == undefined){
        if(_field?.default == null && _field?.default == undefined){
            if(_field?.type === 'float')
                return '0.00'
            else if(_field?.type === 'boolean')
                return false
            return ''
        }
        else{
            if(_field?.type === 'float')
              return `${parseFloat(_field?.default)?.toFixed(2)}`

            else if(_field?.type === 'boolean')
              return _field?.default

            return `${_field?.default}`
        }
    }
    else{
        if(_field?.type === 'float')
            return `${parseFloat(_field?.value)?.toFixed(2)}`
        
        else if(_field?.type === 'boolean')
            return _field?.value

        return `${_field?.value}`
    }
  }

  const getFormConfig = useCallback(() => {
    let formConstant = formConfigConstants(),
      formObjKey = formConstant[formData?.name] || null,
      config = "";

    if (formObjKey) {
      config = configData.FORMS[formObjKey] || null;
    }

    return config;
  }, [formData]);

  const setFormTitle = useCallback(
    (formName) => {
      let formConfig = getFormConfig(formName);

      setTitle(formConfig?.title || "");
    },
    [setTitle, getFormConfig]
  );

  const format = useCallback(
    (form) => {
      const formField = form ? form : formData;

      // const draftForm = {};
      const draftForm = JSON.parse(JSON.stringify(formField));

      if (form?.name === "Claim") {
        // if (totalFormValue) formField = totalFormValue;

        draftForm.layout = formField.fields.map((field) => field.slug) || [];
        draftForm.table_layout =
          formField.table_fields.map((field) => field.slug) || [];
        draftForm.tally_layout =
          formField.tally_fields.map((field) => field.slug) || [];
      }

      /**Fields */
      const fields = {};

      if (formField && formField.fields && formField.fields.length > 0) {
        formField.fields.map((field) => {
          const newValue = {
            label: field.label,
            type: field.type,
            extra: field.extra,
            value:
              fieldValue &&
              fieldValue[field.slug] &&
              fieldValue[field.slug].value
                ? fieldValue[field.slug].value
                : field.default || "",
          };
          if (field.type === "dropdown" && !newValue.value)
            newValue.value = field?.default || "";

          return (fields[field.slug] = newValue);
        });
      }

      draftForm.fields = fields;

      const tableInput = tableFieldValue || [{}];

      /**Table fields */
      const table_fields =
        tableInput && tableInput.length > 0
          ? tableInput.map((fieldVal) => {
              const row = {};

              if (
                formField &&
                formField.table_fields &&
                formField.table_fields.length > 0
              ) {
                formField.table_fields.map((field) => {
                  const newValue = {
                    value:
                      fieldVal &&
                      fieldVal[field.slug] &&
                      fieldVal[field.slug].value
                        ? fieldVal[field.slug].value
                        : "",
                    label: field.label,
                    type: field.type,
                    extra: field.extra,
                  };

                  return (row[field.slug] = { ...newValue });
                });
              }

              return row;
            })
          : [];
      draftForm.table_fields = table_fields;

      /**Tally fields */
      const tally_fields = {};

      if (
        formField &&
        formField.tally_fields &&
        formField.tally_fields.length > 0
      ) {
        formField.tally_fields.map((field) => {
          let newValue = {
            label: field.label,
            type: field.type,
            extra: field.extra,
            value: tallyFieldValue ? (tallyFieldValue[field?.slug]?.value || tallyFieldValue[field?.slug]?.default) : "",
          };
          tally_fields[field.slug] = { ...newValue };

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
      const tallyFieldObj = {};

      const tally_fields = forms && forms?.tally_fields && forms?.tally_fields.length > 0   ? forms.tally_fields.map((field) => {
              if (computeForm?.tally_fields && computeForm.tally_fields[field.slug]) {
                field.value = computeForm.tally_fields[field.slug].value || "";
                if (computeForm.tally_fields[field.slug]?.options)
                  field.options = computeForm.tally_fields[field.slug].options;

                if (computeForm.tally_fields[field.slug]?.type)
                  field.type = computeForm.tally_fields[field.slug].type;
              }
              tallyFieldObj[field.slug] = { ...field };

              return field;
            })
          : {};

      const fieldObj = {};

      const fields =
        forms && forms?.fields && forms?.fields.length > 0
          ? forms.fields.map((field) => {
              if (computeForm?.fields && computeForm.fields[field.slug]) {
                field.value = computeForm.fields[field.slug].value;
                if (computeForm.fields[field.slug]?.options)
                  field.options = computeForm.fields[field.slug].options;
                if (computeForm.fields[field.slug]?.type)
                  field.type = computeForm.fields[field.slug].type;
              }

              if (formInfo?.data?.fields) {
                field.value = formInfo?.data?.fields[field?.slug]?.value;
              }

              fieldObj[field.slug] = { ...field };

              return field;
            })
          : {};

      const table_fields =
        forms && forms?.table_fields && forms?.table_fields.length > 0
          ? forms.table_fields.map((field) => {
              if (
                computeForm?.table_form &&
                computeForm.table_form[field.slug]
              ) {
                field.value = computeForm.table_form[field.slug].value || "";
                if (computeForm.table_form[field.slug]?.options)
                  field.options = computeForm.table_form[field.slug].options;
                if (computeForm.table_form[field.slug]?.type)
                  field.type = computeForm.table_form[field.slug].type;
              }

              if (
                keyId &&
                computeForm?.table_fields &&
                computeForm?.table_fields.length > 0
              ) {
                // console.log('gone in compute table field')
                computeForm.table_fields.map((fieldVal, i) => {
                  let computeTableField = fieldVal[field.slug],
                    newdataSource = dataSource.current.map((data, index) => {
                      if (data.key === keyId && computeTableField) {
                        if (computeTableField.value) {
                          data[field.slug].value =
                            computeTableField.value || "";
                        }
                        if (computeTableField?.options) {
                          let options = computeTableField.options.map(
                              (option) => {
                                option.key = keyId;

                                return option;
                              }
                            ),
                            fieldOptions = field?.options?.filter(
                              (option) => option.key !== keyId
                            );

                          computeTableField.options = fieldOptions
                            ? [...fieldOptions, ...options]
                            : options || null;
                        } else {
                          let fieldOptions = field?.options || [];

                          computeTableField.options = fieldOptions
                            ? fieldOptions
                            : null;
                        }

                        field = {
                          ...field,
                          ...computeTableField,
                        };
                      }

                      return data;
                    });

                  return newdataSource.current;
                });
              }

              return field;
            })
          : [];

      const form = forms;
      if (tally_fields.length > 0) form.tally_fields = tally_fields;
      if (fields.length > 0) form.fields = fields;
      if (table_fields.length > 0) form.table_fields = table_fields;

      return form;
    },
    [formData, dataSource, formInfo]
  );

  //To update children's state with new compute value
  const [value, setValue] = useState(0);

  const updateForm = useCallback(
    (formData) => {
      setFormData(formData);

      console.log("Updating....")
      setValue(value + 1);
    },
    [value]
  );

  const addRow = useCallback(
    (event, key, tableFields) => {
      event.preventDefault();

      let rowObject = {};

      let source = dataSource.current || [];

      rowObject.key = nanoid();

      tableFields.map((field) => {
        rowObject[field.slug] = field;
        rowObject[field.slug].value = getValueOrDefault(field)//rowObject[field.slug].default !== null ? `${rowObject[field.slug].default}` : ''; //!----------------------------------------------------------------------------
        return field;
      });

      while (key === rowObject.key) {
        rowObject.key = nanoid();
      }

      // tableFields.key = key;

      let row = [...source, rowObject]
      setTableFieldValue(row);
      setDataSource(row);
    },
    [setTableFieldValue]
  );

  const deleteRow = useCallback(
    (event, key) => {
      event.preventDefault();

      if (dataSource.current?.length > 1) {
        setTableFieldValue(
          dataSource.current.filter((item) => item.key !== key)
        );
        dataSource.current = dataSource.current.filter(
          (item) => item.key !== key
        );
      }
    },
    [setTableFieldValue]
  );

  const getColumns = useCallback(
    (form) => {
      let formObj = formData ? formData : form || null,
        tableFields = formObj?.table_fields || null,
        columsObj = [];

      if (tableFields) {
        [
          ...tableFields,
          {
            label: "Action",
            slug: null,
            fixed: "right",
            width: "7rem",
            className: "action-coloumn",
          },
        ].map((field, i) =>
          field.type !== "hidden"
            ? columsObj.push({
                ...field,
                title: field.label,
                dataIndex: field.slug,
                render: (_data, dataRow) => {
                  const key = dataRow.key;

                  if (dataRow[field?.slug]) {
                    let options = field.options || null;

                    dataRow[field?.slug].slug = field?.slug;
                    field = dataRow[field?.slug];

                    if (options && !field?.options) field.options = options;
                  } else if (field.slug)
                    field = initalTableData.current.find(
                      (obj) => field.slug === obj.slug
                    );


                  if (field.slug) {
                    if (field.slug === "no") field.readOnly = false;

                    return (
                      <FormInput
                        key={key}
                        rowKey={key}
                        formName={
                          form.name === "Claim Amendment"
                            ? "claim-amendment"
                            : formType
                            ? formType
                            : formName
                        }
                        updateForm={updateForm}
                        setDataSource={setDataSource}
                        dataSource={dataSource.current}
                        error={isRequiredFieldMissing}
                        type="table-fields"
                        field={field}
                        hideHelp={true}
                      />
                    );
                  } else {
                    return (
                      <div className="action-button">
                        <button onClick={(e) => addRow(e, key, tableFields)}>
                          <span className="svg-icon svg-icon-md svg-icon-primary">
                            <SVG
                              height={16}
                              width={16}
                              src={"/media/svg/icons/Navigation/Plus.svg"}
                              title={"Add Row"}
                            />
                          </span>
                        </button>
                        <button onClick={(e) => deleteRow(e, key)}>
                          <span className="svg-icon svg-icon-md svg-icon-danger">
                            <SVG
                              height={16}
                              width={16}
                              src={"/media/svg/icons/General/Trash.svg"}
                              title={"Delete Row"}
                            />
                          </span>
                        </button>
                      </div>
                    );
                  }
                },
              })
            : null
        );

        return columsObj;
      }
    },
    [
      formData,
      addRow,
      deleteRow,
      formType,
      updateForm,
      isRequiredFieldMissing,
      formName,
    ]
  );

  const calculateDataSource = useCallback(
    (form, computeForm, slip) => {
    //   console.log('gone in',form, computeForm, slip)
      let dataSourceArray = [],
        table_fields = [];
      // console.log('calculation')
      if (type === "slip-form" && slip) {
        // console.log({ formData });
        dataSource.current = null;

        if (!slip.hasOwnProperty("table_fields")) slip = computeForm;

        if (slip?.table_fields && slip.table_fields?.length > 0) {
          slip.table_fields.map((computeObj, i) => {
            let computeFormObj = computeForm?.table_fields[i] || {};

            const rowObject = {
              key: { key: nanoid() },
            };

            table_fields = form?.table_fields?.map((field) => {
              if (computeObj[field.slug])
                rowObject[field.slug] = {
                  // ...computeObj[field.slug],
                  ...computeFormObj[field.slug],
                  ...computeObj[field.slug],
                };
              else rowObject[field.slug] = field;

              if (field.type === "float" && !rowObject[field.slug].value)
                rowObject[field.slug].value = "0.00";

              if (computeFormObj[field.slug]) {
                field = {
                  ...computeFormObj[field.slug],
                  ...field,
                };
              }
              return field;
            });

            dataSourceArray.push(rowObject);

            return computeObj;
          });

          setTableFieldValue(dataSourceArray);
        }
      } else {
        if (slip?.table_fields && slip.table_fields.length > 0) {
          slip.table_fields.map((computeObj, i) => {
            let computeFormObj =
              computeForm && computeForm?.table_fields
                ? computeForm?.table_fields[i]
                : {};

            const rowObject = {
              key: { key: nanoid() },
            };

            table_fields = form.table_fields.map((field) => {
              let options = field.options || [];

              if (computeObj[field.slug])
                rowObject[field.slug] = {
                  ...computeObj[field.slug],
                  ...computeFormObj[field.slug],
                };
              else rowObject[field.slug] = field;

              if (field.type === "float" && !rowObject[field.slug].value)
                rowObject[field.slug].value = "0.00";

              if (computeFormObj[field.slug]) {
                field = {
                  ...computeObj[field.slug],
                  ...computeFormObj[field.slug],
                  slug: field.slug,
                };
              }

              if (computeObj[field.slug] && computeObj[field.slug].value) {
                field.value = computeObj[field.slug].value;
                if (!field?.options?.length) field.options = options;
              }

              return field;
            });

            dataSourceArray.push(rowObject);

            setTableFieldValue(dataSourceArray);
            return computeObj;
          });
        } else {
          const rowObject = {
            key: { key: nanoid() },
          };

          table_fields = form?.table_fields?.map((field) => {
            let computeObj =
              computeForm?.table_fields && computeForm.table_fields[0]
                ? computeForm.table_fields[0]
                : [];

            if (computeObj[field.slug])
              rowObject[field.slug] = {
                ...field,
                ...computeObj[field.slug],
              };
            else rowObject[field.slug] = field;

            return {
              ...field,
              ...computeObj[field.slug],
            };
          });

          dataSourceArray = [rowObject];
        }
      }

      if (!initalTableData?.current?.length > 0)
        initalTableData.current = table_fields;

      form.table_fields = table_fields;

      dataSource.current = dataSourceArray;
      return form;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, setTableFieldValue,formData]
  );

  useEffect(() => {
    let form = null;

    async function getFormData() {
      let computeForm;

      if (!formData && !type) {
        form = await getForm(formType).then((data) => data?.results || null);
      } else if (!formData && type) {
        // slip-form
        // console.log({ formData }, { type });
        form = await getSlipFormData(slipData?.form, valuesToPreFill).then((data) => data?.results);
        // if (!slipData?.data?.length) slipData.data = form;
      } else {
        form = formData;
      }

      if (form) {
        let data =
            slipData && slipData?.data?.length ? slipData.data : format(form),
          buName = "",
          checkCredit =
            form.name === "Claim Form" && !type
              ? await checkClaimFormmPermission()
              : true,
          submittedUserName =
            data.fields &&
            data.fields["submitted-for"] &&
            data.fields["submitted-for"].value
              ? data.fields["submitted-for"].value
              : "";

        if (checkCredit && checkCredit.data && !checkCredit.data.permission) {
          setErrorMessage("Your claim credit limit exceeded for this month.");
          setShowToaster(true);
        }
        const endPoint = form.computer;
        if (formInfo?.data) data = formInfo?.data;

        if (!submittedUserName) {
          submittedUserName = user?.username || "";
        }
        if (form.name === "Staff Claim") {
          buName = submittedUserName;
        }

        computeForm = endPoint
          ? await getCompute(data, endPoint, buName)
          : slipData?.data;


        if (computeForm) {
          form = getFormattedComputeForm(computeForm, form);

        }
        // FIXED: setting initial values if it has default value
        if(form?.tally_fields) {
            // console.log(form?.tally_fields);
            form.tally_fields = form?.tally_fields?.map((field) => {
                field.value = getValueOrDefault(field)
                return field;
            });
        }
        if (!dataSource.current?.length) {
          // slipData?.data.length
          let prevData =
            slipData?.data && Object.keys(slipData.data).length > 0
              ? slipData.data
              : null;

          if (formInfo) {
            prevData = formInfo.data;
          }

          form = calculateDataSource(form, computeForm, prevData);

          setColumns(getColumns(form));

          setTitle(form.name);
          // dispatch(setHeaderTitle('form.name'));
        }

        // for slug `submitted-for` we need to check if user is allowed to update field with user.can_change_sumitted_for
        const subMittedFor = form?.fields?.find(
          (field) => field?.slug === "submitted-for"
        );
        if (subMittedFor) {
          subMittedFor.disabled =
            user?.can_change_sumitted_for === false ? true : false;
        }
        setFormData(form);
      } else {
        setHasError(true);
        setShowToaster(true);
      }
    }

    if (!hasFormAdded) {
      getFormData();
    }

    setHasFormAdded(true);
  }, [
    formData,
    hasFormAdded,
    user,
    type,
    formInfo,
    // setFieldValue,
    slipData,
    setTableFieldValue,
    setTallyFieldValue,
    resetFormData,
    calculateDataSource,
    setHasFormAdded,
    setFormData,
    setColumns,
    title,
    setFormTitle,
    fieldValue,
    formType,
    getColumns,
    format,
    getFormattedComputeForm,
    dispatch,
    valuesToPreFill,
  ]);

  const validateFormat = useCallback(
    (form, type) => {
      // console.log(form, type)
      const draftForm = {};

      /**Fields */

      draftForm.fields = totalFormValue.fields;

      draftForm.layout =
        form?.fields?.length > 0
          ? form.fields.map((field) => field.slug)
          : null;

      /**Table fields */

      if (totalFormValue?.tableFields)
        draftForm.table_fields = totalFormValue.tableFields;
      // filter((fieldVal) => {
      //     let keyValue = fieldVal.key;

      //     fieldVal.key = { key: keyValue };

      //     return fieldVal;
      // }) || [];

      draftForm.table_layout =
        form?.table_fields?.length > 0
          ? form.table_fields.map((field) => field.slug)
          : null;

      /**Tally fields */
      if (totalFormValue?.tallyFields) {
        draftForm.tally_fields = totalFormValue.tallyFields;
      }
      draftForm.tally_layout =
        form?.tally_fields?.length > 0
          ? form.tally_fields.map((field) => field.slug)
          : [];

      return draftForm;
    },
    [totalFormValue]
  );

  const validateFormValues = useCallback(
    (values, type) => {
      let formFields = formData[type] || null,
        error = false;
      // console.log({formFields});
      if (type === "table_fields") {
        formFields.map((field) => {
          values.map((fieldVal) => {
            let valObj = fieldVal[field.slug];
            if (
              valObj?.hasOwnProperty("type") &&
              typeof valObj === "object" &&
              !["break", "hidden", "boolean"].includes(valObj.type) &&
              !valObj.optional &&
              !valObj.value
            ) {
              error = true;
            }
            if (valObj?.type === "integer" && !/^-?\d+$/.test(valObj.value)) {
              console.log(valObj, field);
              error = true;
            }
            return field;
          });
          return field;
        });
      } else {
        formFields.map((fieldObj) => {
          let valObj =
            values && values[fieldObj.slug] ? values[fieldObj.slug] : fieldObj;
          if (
            valObj &&
            !["break", "hidden", "boolean"].includes(valObj.type) &&
            !fieldObj.optional &&
            !(valObj.value || valObj.default)
          ) {
            error = true;
          }
          return fieldObj;
        });
      }
      return error;
    },
    [formData]
  );

  const validateFormRequired = useCallback(
    (type) => {
      if (!type) return true;

      let form = formData,
        totalValue = totalFormValue || null,
        fieldValues = totalValue?.fields || null,
        tableFieldValues = totalValue?.tableFields || null,
        tallyFieldValues = totalValue?.tallyFields || null,
        hasErrorIssue = false,
        hasFieldError = false,
        hasTableFieldError = false,
        hasTallyFieldError = false;

      if (fieldValues && Object.keys(fieldValues).length > 0) {
        hasFieldError = validateFormValues(fieldValues, "fields");
      } else if (form && form.fields && form.fields.length > 0) {
        hasFieldError = true;
      }

      if (tableFieldValues && tableFieldValues.length > 0) {
        hasTableFieldError = validateFormValues(
          tableFieldValues,
          "table_fields"
        );
      } else if (form && form.table_fields && form.table_fields.length > 0) {
        hasTableFieldError = true;
      }

      if (tallyFieldValues && Object.keys(tallyFieldValues).length > 0 > 0) {
        hasTallyFieldError = validateFormValues(
          tallyFieldValues,
          "tally_fields"
        );
      } else if (form && form.tally_fields && form.tally_fields.length > 0) {
        hasTallyFieldError = true;
      }
      if (hasFieldError || hasTableFieldError || hasTallyFieldError) {
        hasErrorIssue = true;
        setTimeout(() => {
            if (document.querySelector('.Mui-error')) {
                document.querySelector('.Mui-error').scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
            }
        }, 10);
      }
      return hasErrorIssue;
    },
    [totalFormValue, formData, validateFormValues]
  );

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setShowToaster(false);
    setShowSuccessToaster("");
    setErrorMessage("");
  };

  if (showSuccessToaster !== "") {
    return (
      <Snackbar
        open={"true"}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert severity="success">
          {showSuccessToaster ? showSuccessToaster : "Successfully submitted"}
        </Alert>
      </Snackbar>
    );
  }

  const afterSubmitSuccess = async () => {
    resetFormData();

    let newForm = await getForm(formType).then((data) => data.results || null);

    newForm = calculateDataSource(newForm);

    setFormData(newForm);
  };

  const handleSaveAsDraft = async (event, isNextStep) => {
    let data = validateFormat(formData),
      submittedUserName =
        data.fields &&
        data.fields["submitted-for"] &&
        data.fields["submitted-for"].value
          ? data.fields["submitted-for"].value
          : "";

    if (!submittedUserName) submittedUserName = user?.username || "";

    const isUpdateDraft = formInfo && formInfo.id && !isNewEntry;
    const response = isUpdateDraft
      ? await updateDraft(data, formType, formInfo.id, submittedUserName)
      : await saveNewAsDraft(data, formType);
    if (isNextStep) {
      setShowSuccessToaster("Proceed to submitting");
    } else {
      console.log(response);
      setShowSuccessToaster(
        isUpdateDraft
          ? "Draft Updated Successfully"
          : "Saved As Draft Successfully"
      );
    }
    if (response?.isSuccess) {
      if (!isNextStep) afterSubmitSuccess();
      else {
        setFormId(response.data.id);
        return response.data;
      }
    } else {
      setShowToaster(true);
    }
  };

  const handleNextStep = async (e) => {
    e.preventDefault();

    let formName = formData.name,
      error = formName !== "Claim Form" ? validateFormRequired("check") : false;

    setIsRequiredFieldMissing(error);
    let response;
    if (!error || formName === "Claim Form") {
      let validator = formData.validator || null;
      let data = validateFormat(formData);
      response = validator
        ? await validateForm(data, validator)
        : { valid: true };

      if (response.valid) {
        setShowLoader(true);

        let draftSet = await handleSaveAsDraft(null, true).then(
          (results) => results
        );

        setApprovers(draftSet?.approvers ? draftSet.approvers : []);
        setExecutors(draftSet?.executors ? draftSet.executors : []);
        data = [];

        if (draftSet) setTab("approvers");
        setShowLoader(false);
      } else {
        console.log(response);
        if (typeof response === "string") setErrorMessage(response);
        setShowToaster("show");
      }
    }
    formData.error = error;
    setFormData(formData);
  };

  const handleGoBack = async (event) => {
    setTab("basic");
    if (formData) {
      let form = formData,
        data = format(form),
        buName = "",
        submittedUserName =
          data.fields &&
          data.fields["submitted-for"] &&
          data.fields["submitted-for"].value
            ? data.fields["submitted-for"].value
            : "";

      const endPoint = form.computer;
      // TODO: try to put user if not in list
      if (!submittedUserName) submittedUserName = user?.username || "";
      if (form.name === "Staff Claim") buName = submittedUserName;

      let computeForm = endPoint
        ? await getCompute(data, endPoint, buName)
        : null;

      if (computeForm) form = getFormattedComputeForm(computeForm, form);

      setFormData(form);
    }
  };

  const handleSubmitForm = async () => {
    let data = validateFormat(formData),
      submittedUserName =
        data.fields &&
        data.fields["submitted-for"] &&
        data.fields["submitted-for"].value
          ? data.fields["submitted-for"].value
          : "";

    if (!submittedUserName) submittedUserName = user?.username || "";

    setShowLoader(true);

    const response = await submitForm(
      data,
      submittedUserName,
      formType,
      formId
    );

    if (response?.isSuccess) {
      setShowSuccessToaster("Form has been submitted successfully");
      afterSubmitSuccess();

      setTab("basic");
    } else {
      setShowToaster(true);
    }
    setShowLoader(false);
  };

  // const goToConfirmation = () => {
  //     setTab("confirmation");
  // };

  // const deleteDraftForm = async (id, type) => {
    //     const url = 'form/entries';
    //     try {
    //         const delete_response = await deleteForm(id, type, url);
    //         // setReload(true);

    //         if (delete_response.status === 204) {
    //             message.success(`Draft Deleted Successfully`);
    //             history.goBack();
    //         }

    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    const cancelDraftFormWithRemark = async (id, type) => {
        const remark = window.prompt(`Are you sure you want to cancel (${formInfo.id})? \nRemarks`);
        console.log('id, type,remark =>', id, type, remark);
        if (remark === null) {
            console.log('User canceled the flow');
            return;
        }
        const url = 'form/entries';
        try {
            const payload = { status: "cancelled", note: remark };
            const cancelResponse = await apiCancelDraftFormWithRemark(id, type, url, payload);
            if (cancelResponse.status === 200) {
                message.success(`Draft Cancelled Successfully`);
                history.goBack();
            }

        } catch (error) {
            message.error(`Something went wrong`);
            console.log('cancelDraftFormWithRemark =>', error);
        }
    }

  if (hasError) {
    return <Redirect to="/not-found" />;
  }

  return (
    <>
      {!title || showLoader ? (
        <LayoutSplashScreen />
      ) : (
        <Card className="form-card">
          <CardHeader title={title}>
            <CardHeaderToolbar></CardHeaderToolbar>
            {formData && formData.guide ? (
              <div className="guidelines">
                <a href={formData.guide} target="blank">
                  Guidelines
                </a>
              </div>
            ) : (
              ""
            )}
          </CardHeader>

          <CardBody>
            {!type ? (
              <ul className="nav nav-tabs nav-tabs-line " role="tablist">
                <li
                  key="basic"
                  className="nav-item"
                  onClick={() => setTab("basic")}
                >
                  <span
                    className={`nav-link ${tab === "basic" && "active"}`}
                    data-toggle="tab"
                    role="tab"
                    aria-selected={(tab === "basic").toString()}
                  >
                    Basic info
                  </span>
                </li>
                {
                  <>
                    {" "}
                    <li className="nav-item" key="approvers">
                      <span
                        className={`nav-link ${tab === "approvers" &&
                          "active"}`}
                        data-toggle="tab"
                        role="button"
                        // aria-selected={(tab === "approvers").toString()}
                      >
                        Approvers
                      </span>
                    </li>
                  </>
                }
                {formType === "equipment-requisition" && (
                                    <>
                                        {" "}
                                        <li
                                            className="nav-item"
                                            key="confirmation"
                                        >
                                            <span
                                                className={`nav-link ${tab ===
                                                    "confirmation" &&
                                                    "active"}`}
                                                data-toggle="tab"
                                                role="button"
                                            aria-selected={(tab === "approvers").toString()}
                                            >
                                                Confirmation
                                            </span>
                                        </li>
                                    </>
                                )}
              </ul>
            ) : null}
            <div className="mt-5">
              {tab === "basic" && formData && (
                <>
                  <form onSubmit={(e) => handleNextStep(e)}>
                    {formData.fields && formData.fields.length > 0
                      ? [
                          {
                            label: "Name",
                            slug: "name",
                            readOnly: true,
                            value:
                              `${user?.first_name} ${user?.last_name}` || "",
                            type: "text",
                          },
                          ...formData.fields,
                        ].map((field, index) => (
                          <FormInput
                            key={index}
                            updateForm={updateForm}
                            setDataSource={setDataSource}
                            error={isRequiredFieldMissing}
                            formName={formType ? formType : formName}
                            field={{
                              ...field,
                              value:
                                fieldValue && fieldValue[field?.slug]?.value
                                  ? fieldValue[field?.slug]?.value
                                  : field.value,
                            }}
                          />
                        ))
                      : null}
                    {formData &&
                    formData.table_fields &&
                    formData.table_fields.length > 0 ? (
                      <div className="table-fields">
                        <Table
                          dataSource={dataSource.current || []}
                        //   columns={columns}
                          columns={getColumns(formData)}
                          pagination={false}
                        //   scroll={{
                        //     x: columns && columns.length * 150,
                        //     y: 300,
                        //   }}
                          scroll={{ x: getColumns(formData) && getColumns(formData).length * 150, y: 300 }}
                        />
                      </div>
                    ) : null}
                    {formData.tally_fields &&
                    formData.tally_fields.length > 0 ? (
                      <div className="tally">
                        {" "}
                        {formData.tally_fields.map((field, index) => (
                          <div className="tally-row" key={index}>
                            <FormInput
                              formName={formType ? formType : formName}
                              updateForm={updateForm}
                              type="tally-fields"
                              setDataSource={setDataSource}
                              error={isRequiredFieldMissing}
                              field={{
                                ...field,
                                value:
                                  tallyFieldValue &&
                                  tallyFieldValue[field?.slug]?.value
                                    ? tallyFieldValue[field?.slug]?.value
                                    : field.value,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </form>
                </>
              )}
            </div>
            <div className="mt-5 approvers">
              {tab === "approvers" && (
                <div className="row">
                  <div className="col-12">
                    <ListsWidget1
                      className=""
                      title="Approvers"
                      list={approvers}
                    />
                  </div>
                  <div className="col-12">
                    <ListsWidget1
                      className=""
                      title="Executors"
                      list={executors}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 approvers">
                            {tab === "confirmation" && (
                                <div
                                    className="row" id="divToPrint"
                                    style={{ display: 'flex', flexWrap: 'wrap', marginRight: -12.5, marginLeft: -12.5, flexDirection: 'column', width: '60%'}}>

                                    <EquipmentPDF
                                        key='equipmentPdf'
                                        formId={formId}
                                        fieldValue={fieldValue}
                                        tableFieldValue={tableFieldValue}
                                        tallyFieldValue={tallyFieldValue}
                                    />
                                </div>
                            )}
                        </div>
          </CardBody>

          {!type ? (
            <CardFooter>
              {tab === "basic" ? (
                <div className="d-flex justify-content-between w-100">
                  {formInfo && formInfo?.status === "draft" && (
                    <div className="btn btn-warning" onClick={() => { cancelDraftFormWithRemark(formInfo?.id, formInfo?.form); }}>Cancel</div>
                  )}
                  <div className="d-flex justify-content-end w-100">
                    <div
                      className="btn btn-success mr-2"
                      onClick={(e) => handleSaveAsDraft(e)}
                    >
                      Save as draft
                    </div>
                    <div
                      className="btn btn-primary ml-2"
                      onClick={(e) => handleNextStep(e)}
                    >
                      Next step
                    </div>
                  </div>
                </div>
              ) : (
                // ) : tab === "confirmation" ? (
                //     <>
                //         <div className="d-flex justify-content-end w-100">
                //             <div
                //                 className="btn btn-primary mr-2"
                //                 onClick={(e) => handleGoBack(e)}
                //             >
                //                 Back
                //             </div>
                //             <div
                //                 className="btn btn-info mr-2"
                //                 onClick={(e) => printDocument(e)}
                //             >
                //                 Export to PDF
                //             </div>
                //             <div
                //                 className="btn btn-success ml-2"
                //                 onClick={(e) => handleSubmitForm()}
                //             >
                //                 Submit
                //             </div>
                //         </div>
                //     </>
                <>
                  {/* Approval flow btns */}
                  <div className="d-flex justify-content-end w-100">
                    <div
                      className="btn btn-primary mr-2"
                      onClick={(e) => handleGoBack(e)}
                    >
                      Back
                    </div>
                    {/* {formType ===
                                            "equipment-requisition" ? (
                                            <div
                                                className="btn btn-success ml-2"
                                                onClick={(e) =>
                                                    goToConfirmation()
                                                }
                                            >
                                                Next step
                                            </div>
                                        ) : ( */}
                    <div
                      className="btn btn-success ml-2"
                      onClick={(e) => handleSubmitForm()}
                    >
                      Submit
                    </div>
                    {/* )} */}
                  </div>
                </>
              )}
            </CardFooter>
          ) : null}
        </Card>
      )}
      {showToaster ? (
        <Snackbar
          open={showToaster}
          anchorOrigin={{
            horizontal: "right",
            vertical: "top",
          }}
          autoHideDuration={4000}
          onClose={handleClose}
        >
          <Alert severity="warning">
            {errorMessage || "Something went wrong"}
          </Alert>
        </Snackbar>
      ) : null}
      {id ? <FormModal id={id} /> : null}
    </>
  );
};

const mapStateToProps = createStructuredSelector({
  formData: selectFormData,
  fieldValue: selectFormFieldData,
  tableFieldValue: selectFormTableFieldData,
  tallyFieldValue: selectFormTallyFieldData,
  totalFormValue: selectForms,
  user: selectUserData,
});

const mapDispatchToProps = (dispatch) => ({
  setFormData: (data) => dispatch(updateFormData(data)),
  resetFormData: (data) => dispatch(resetTotalFormData(data)),
  setFieldValue: (data) => dispatch(updateFormFieldData(data)),
  setTableFieldValue: (data) => dispatch(updateFormTableFieldData(data)),
  setTallyFieldValue: (data) => dispatch(updateFormTallyFieldData(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Forms);
