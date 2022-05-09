import { handleRegEx, initializeRE } from './helpers';

const validateContact = (config, getValues) => {
    let value = config.value;
    let error = {};
    let re = initializeRE(config.isRequired);
    re.push({
        re: /^[+][0-9]{7,15}$|^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        error: 'app.err-contact-0',
    });
    error['contact'] = handleRegEx(re, value);
    return error;
};

const validateEmail = (config, getValues) => {
    let value = config.value;
    let error = {};
    let re = initializeRE(config.isRequired);
    re.push({
        re: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        error: 'app.err-email-0',
    });
    error['email'] = handleRegEx(re, value);
    return error;
};

const validatePassword = (config, getValues) => {
    let value = config.value;
    let error = {};
    let re = initializeRE(config.isRequired);
    error['password'] = handleRegEx(re, value);
    return error;
};

const validateSetPassword = (config, getValues) => {
    let value = config.value;
    let error = {};
    let re = initializeRE(config.isRequired);
    re.push({
        re: /(?=.*[a-z])/,
        error: 'app.err-setPasssword-0',
    });
    re.push({
        re: /(?=.*[A-Z])/,
        error: 'app.err-setPasssword-1',
    });
    re.push({
        re: /(?=.*[0-9])/,
        error: 'app.err-setPasssword-2',
    });
    re.push({
        re: /(?=.*[!@#$&*])/,
        error: 'app.err-setPasssword-3',
    });
    re.push({
        re: /^[A-Za-z\d!@#$&*]*$/,
        error: 'app.err-setPasssword-4',
    });
    re.push({
        re: /^[A-Za-z\d@$!%*?&]{10,}$/,
        error: 'app.err-setPasssword-5',
    });

    error['setPassword'] = handleRegEx(re, value);
    return error;
};


const validateConfirmPassword = (config, getValues) => {
    let value = config.value;
    let error = {};
    let re = initializeRE(config.isRequired);
    error['confirmPassword'] = handleRegEx(re, value);
    let { setPassword } = getValues();
    if (value !== setPassword) {
        if (!error['confirmPassword']) {
            error['confirmPassword'] = 'app.err-confirmPasssword-0';
        }
    }
    return error;
};
const validateOTP = (config, getValues) => {
    let value = config.value;
    let error = {};
    let re = initializeRE(config.isRequired);
    re.push({
        re: /^[0-9]*$/,
        error: 'app.err-otp-0',
    });
    error['otp'] = handleRegEx(re, value);
    return error;
};


export const getValidators = () => {
    return {
        contact: validateContact,
        password: validatePassword,
        setPassword: validateSetPassword,
        confirmPassword: validateConfirmPassword,
        otp: validateOTP,
        email: validateEmail,
    };
};