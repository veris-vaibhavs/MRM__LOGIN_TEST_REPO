import AxiosSingleton from "../../axios-instance";
import * as actionTypes from "./actionTypes";

export const validateMember = (payload) => {
  return async (dispatch) => {
    let axios = AxiosSingleton.getInstance();
    let orgId = localStorage.getItem("org_id");
    let url = `/api/v4/organisation/${orgId}/register-member-contact/`;
    try {
      let response = await axios.post(url, payload);
      return response;
    } catch (error) {
      return error;
    }
  };
};

export const verifyOtp = (payload) => {
  return async (dispatch) => {
    let axios = AxiosSingleton.getInstance();
    let orgId = localStorage.getItem("org_id");
    let url = `/api/v4/organisation/${orgId}/verify-member-contact/`;
    let response = await axios.post(url, payload);
    dispatch({
      type: actionTypes.SESSION_DETAILS,
      payload: response?.data,
    });
    return response;
  };
};

export const fetchMemberRegistrationForm = () => {
  return async (dispatch, getState) => {
    let axios = AxiosSingleton.getInstance();
    let orgId = localStorage.getItem("org_id");
    let session = getState().session.sessionDetails?.session;
    let url = `/api/v4/organization/${orgId}/member-registration-form/`;
    try {
      let response = await axios.get(url, {
        headers: { Authorization: `session ${session}` },
      });
      dispatch({
        type: actionTypes.FORMDATA,
        payload: response?.data,
      });
      return response;
    } catch (error) {
      return error;
    }
  };
};

export const memberRegistration = (payload) => {
  return async (dispatch, getState) => {
    let axios = AxiosSingleton.getInstance();
    let orgId = localStorage.getItem("org_id");
    let session = getState().session.sessionDetails?.session;
    let url = `/api/v4/organization/${orgId}/member-register/`;
    try {
      let response = await axios.post(url, payload, {
        headers: { Authorization: `session ${session}` },
      });
      return response;
    } catch (error) {
      return error;
    }
  };
};

export const setContact = (payload) => {
  return {
    type: actionTypes.SETCONTACT,
    payload,
  };
};
