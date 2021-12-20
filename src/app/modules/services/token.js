export const getAuthToken = async () => {
    let token = localStorage.getItem('token') || '';

    if(!token) {
        const cookie = document.cookie; 

        if(cookie) {
            let cookieObj = JSON.parse(cookie)
            token = cookieObj.token;;
        }
    }

    return token;
}  

export const setAuthToken = token => {
    
    let hasToken = getAuthToken();

    if(!hasToken && token) {
        document.cookie =  JSON.stringify({token});
    } 

    return token;
} 

export const FIELD_TYPES = {
    text: 'text',
    float: 'float',
    dropdown: 'dropdown',
    textinput: 'textinput',
    textarea: 'textarea',
    boolean: 'boolean',
    date: 'date',
    integer: 'integer',
    file: 'file',
    hidden: 'hidden',
}

export const TYPES_OF_FORMS = {
    MANPOWER: 'manpower',
    COMMISION: 'commission-requisition',
    LEAVE: 'leave',
    TRAINING: 'training',
    CLAIM: 'claim',
    CREDIT: 'credit-limit-request',
    LOAN: 'loanrentdemo',
    PURCHASE: 'purchase',

}