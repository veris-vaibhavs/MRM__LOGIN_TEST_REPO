import _ from "lodash";
import moment from "moment";

export function autofillWorkflowField  (field, workflowDataToAutofill = [],context){
    let value = '';
    if (field.field_code === 'first_name') {
        value = context?.fields?.firstName?.value.value;
    } else if (field.field_code === 'last_name') {
        value = context?.fields?.lastName?.value;
    } else if (field.field_code === 'email') {
        if (/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(context?.fields?.contact?.value)) {
            value = context?.fields?.contact?.value;
        }
    } else if (field.field_code === 'phone_no') {
        if (/^[+][0-9]{7,15}$/.test(context?.fields?.contact?.value)) {
            value = context?.fields?.contact?.value;
        }
    }
    if (_.isEmpty(value)) {
        let data = workflowDataToAutofill?.forEach?.((fieldObject) => {
            if (fieldObject.id === field.id) {
                value = fieldObject.value || '';
            } else if (fieldObject.field_alias && field.field_alias && fieldObject.field_alias === field.field_alias) {
                value = fieldObject.value || '';
            }
        });
    }

    if (field.field_type === 10) { //Date
        if (!value) {
            value = new moment();
        }
        value = moment(value, ['YYYY-MM-DDTHH:mm A']).format('DD/MM/YYYY');
    }
    if (field.field_type === 15) { //Time
        if (!value) {
            value = new moment();
        }
        value = moment(value, ['YYYY-MM-DDTHH:mm A']).format('hh:mm A');
    }
    if (field.field_type === 11) { //DateTime
        if (!value) {
            value = new moment();
        }
        value = moment(value, ['YYYY-MM-DDTHH:mm A']).format('DD/MM/YYYY hh:mm A');
    }
    if ([6, 8].includes(field.field_type) && value) {
        value = {
            value: value,
            label: value,

        };
    }
    if ([7].includes(field.field_type) && value) {
        value = value.split(',').map((value) => {
            return {
                value: value ? value.trim() : '',
                label: value ? value.trim() : '',
            };
        });

    }
    if ([22].includes(field.field_type) && field.field_code === 'escort_name' && value) {
        if(!value.hasOwnProperty("member_unique_id")){
            value=null
        }
    }
    if (value && value.name) {
        value = {
            ...value,
            value: value.name,
            label: value.name,
        };
    }
    return value;
};

export function autofillHost  (event, fieldID,context)  {
    let value = event?.target?.checked;
    this.setState({ sameasHost: !context.sameasHost });
    let meeting_with_key = '';
    if (value) {
        this.setFieldError({ [fieldID]: null });
        this.setFieldValue({ [fieldID]: context.field?.hostName?.value });
    } else if (!value) {
        this.setFieldValue({ [fieldID]: null });
    }
};
