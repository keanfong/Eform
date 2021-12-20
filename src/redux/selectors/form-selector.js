
import { createSelector} from 'reselect';

export const selectForms = state => state.form;

export const selectFormData = createSelector(
    [selectForms],  formData => formData.formData
);

export const selectFormFieldData = createSelector(
    [selectForms],  formData => formData.fields
);

export const selectFormTableFieldData = createSelector(
    [selectForms],  formData => formData.tableFields
);

export const selectFormTallyFieldData = createSelector(
    [selectForms],  formData => formData.tallyFields
);

export const selectUserData = state => state?.auth?.user