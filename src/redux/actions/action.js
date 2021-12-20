import * as ActionTypes from './action-type.js';

export const updateFormData = (formData) => ({
  type: ActionTypes.UPDATE_FORM_DATA,
  payload: formData
});

export const updateFormFieldData = (data, type) => ({
  type: ActionTypes.UPDATE_FIELD_VALUE,
  payload: data
});

export const updateFormTableFieldData = (data, type) => ({
  type: ActionTypes.UPDATE_TABLE_FIELD_VALUE,
  payload: data
});

export const updateFormTallyFieldData = (data, type) => ({
  type: ActionTypes.UPDATE_TALLY_FIELD_VALUE,
  payload: data
});

export const resetTotalFormData = () => ({
  type: ActionTypes.RESET_TOTAL_FORM_DATA
});
