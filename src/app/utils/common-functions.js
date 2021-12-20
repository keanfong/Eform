export const convertToPascalCase = (str) => {
    if (!str) {
        return;
    }
    let urlString = str.split("/").pop(),
        pascalString = urlString.replace(/\w\S*/g, (m) => m.charAt(0).toUpperCase() + m.substr(1).toLowerCase());
    return pascalString.replace(/-/g, " ");
};