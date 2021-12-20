export function truncate(str, n){
    // eslint-disable-next-line
    str = str.replace(/^.*[\\\/]/, "");

    return (str.length > n) ? str.substr(0, n-1) + '...' + str.substr(str.length - 3) : str;
};

export function decimal_format(value){
    let float_num  = parseFloat(value.toString().replace(/,/g,""));
    if(isNaN(float_num)){
        return value;
    }
    float_num = float_num.toLocaleString('en-US',{
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    return float_num.replace(/,/g,"");
}