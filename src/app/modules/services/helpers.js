import configData from "./config.json";

export const getComputeFieldType = (formName, field, fieldValue) => {
    let isShown = false,
        dependentForm = configData.FORM_DEPENDENCY || [],
        formObj = dependentForm.find(dForm => dForm.formName === formName) || null;
      
    if(formObj && field.type !== 'break') {
      formObj.forms.map(obj => {

          let slug = obj.updateSlug,
              valueObj = fieldValue ? fieldValue[slug] : "",
              objValue = valueObj?.value ||  '',
              valueShownFields = obj.fields.find(fie => fie.selectedValue === objValue);

       if((obj.updateSlug === field.slug) || (!isShown && valueShownFields && valueShownFields.shownFields.includes(field.slug)))isShown = true;
  
       return formObj;
      });
    }
    
    return isShown;
}