export const handleRegEx = (expressions, value) => {
    for (let i = 0; i < expressions.length; i++) {
        if (!expressions[i].re.test(value ? value : '')) {
            return expressions[i].error;
        }
    }
    return null;
};

export const initializeRE = (isRequired) => {
    let re = [];
    if (isRequired) {
        re.push({
            re: /[^\s*$]/,
            error: 'app.err-required',
        });
    }
    return re;
};

