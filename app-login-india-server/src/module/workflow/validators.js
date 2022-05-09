import { handleRegEx, initializeRE } from "./utils";
import moment from "moment";
import i18n from "../../i18n";

const validateVenue = (config, getValues) => {
  let option = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  error["venue"] = handleRegEx(re, option ? option.value : "");
  return error;
};

const validateHostName = (config, getValues) => {
  let option = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  error["hostName"] = handleRegEx(re, option ? option.value : "");
  return error;
};

const validateStartsAt = (config, getValues) => {
  let value = config.value;
  let error = {
    startsAt: "",
    endsAt: "",
  };
  if (!value) {
    error["startsAt"] = i18n.t("This field is required.");
  } else if (!moment(value).isValid()) {
    error["startsAt"] = i18n.t("Enter valid start time");
  } else {
    let milliseconds = moment(value).valueOf();
    if (milliseconds < moment().valueOf()) {
      error["startsAt"] = i18n.t("Invite cannot be created in past");
    }
    let { endsAt } = getValues();
    if (endsAt && moment(endsAt).isValid()) {
      if (milliseconds > moment(endsAt).valueOf()) {
        error["endsAt"] = i18n.t("End time cannot be less than start time.");
      }
    }
  }
  return error;
};

const validateEndsAt = (config, getValues) => {
  let value = config.value;

  let error = {
    endsAt: "",
  };
  let re = initializeRE(config.isRequired);
  error["endsAt"] = handleRegEx(re, value);
  if (!moment(value).isValid()) {
    error["endsAt"] = i18n.t("Enter valid end time");
  } else {
    let milliseconds = moment(value).valueOf();
    let { startsAt } = getValues();
    if (startsAt && moment(startsAt).isValid()) {
      if (milliseconds <= moment(startsAt).valueOf()) {
        error["endsAt"] = i18n.t("End time cannot be less than start time.");
      }
    }
  }
  return error;
};

const validateAgenda = (config, getValues) => {
  let value = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  if (value) {
    re.push({
      re: /^[.a-zA-Z\s-]+$/,
      error: i18n.t("Enter valid value"),
    });
  }
  error["agenda"] = handleRegEx(re, value);
  return error;
};

const validateFirstName = (config, getValues) => {
  let option = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  re.push({
    re: /^[.a-zA-Z\s-]+$/,
    error: i18n.t("Enter valid value"),
  });
  error["firstName"] = handleRegEx(re, option ? option.value : "");
  return error;
};

const validateLastName = (config, getValues) => {
  let value = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  if (value) {
    re.push({
      re: /^[.a-zA-Z\s-]+$/,
      error: i18n.t("Enter valid value"),
    });
  }
  error["lastName"] = handleRegEx(re, value);
  return error;
};

const validateContact = (config, getValues) => {
  let value = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  if (value) {
    re.push({
      re: /^[+][0-9]{7,15}$|^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      error: i18n.t("Enter valid email"),
    });
  }
  error["contact"] = handleRegEx(re, value);
  return error;
};

const validateVisitorCategory = (config, getValues) => {
  let option = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  error["visitorCategory"] = handleRegEx(re, option ? option.value : "");
  return error;
};

const validateWorkflowFields = (config, getValues) => {
  let value = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  error[config.field] = handleRegEx(re, value);
  return error;
};

const validate_type_1 = (config, getValues) => {
  let value = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  error[config.field] = handleRegEx(re, value);
  return error;
};

const validate_type_3 = (config, getValues) => {
  let value = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  if (value) {
    re.push({
      re: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      error: i18n.t("Enter valid email"),
    });
  }
  error[config.field] = handleRegEx(re, value);
  return error;
};

const validate_type_16 = (config, getValues) => {
  let value = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  if (value) {
    re.push({
      re: /^[+][0-9]{7,15}$/,
      error: i18n.t("Enter valid phone number"),
    });
  }
  error[config.field] = handleRegEx(re, value);
  return error;
};

const validate_type_6 = (config, getValues) => {
  let option = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  error[config.field] = handleRegEx(re, option ? option.value : "");
  return error;
};

const validate_type_7 = (config, getValues) => {
  let options = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  error[config.field] = handleRegEx(re, options ? "VALID" : "");
  return error;
};

const validate_type_4 = (config, getValues) => {
  let option = config.value;
  let isRequired = config.isRequired;
  let error = {};
  let re = initializeRE(isRequired);
  error[config.field] = handleRegEx(re, option.value ? option.value : "");
  console.log(error);
  return error;
};

//Validations work on the basis of type of field
// "type" of field is explicitly defined in fields.json

export const getValidators = () => {
  return {
    venue: validateVenue,
    hostName: validateHostName,
    startsAt: validateStartsAt,
    endsAt: validateEndsAt,
    agenda: validateAgenda,
    firstName: validateFirstName,
    lastName: validateLastName,
    contact: validateContact,
    vistorCategory: validateVisitorCategory,
    1: validate_type_1,
    2: validateWorkflowFields,
    3: validate_type_3,
    4: validate_type_4,
    6: validate_type_6,
    7: validate_type_7,
    8: validate_type_6,
    10: validateWorkflowFields,
    11: validateWorkflowFields,
    13: validateWorkflowFields,
    15: validateWorkflowFields,
    16: validate_type_16,
    22: validate_type_6,
    25: validate_type_1,
    28: validateWorkflowFields,
  };
};
