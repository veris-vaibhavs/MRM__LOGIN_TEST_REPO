import * as actionTypes from "../actions/actionTypes";
const initialState = {
  sessionDetails: {},
  formData: [],
  contact: "",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SESSION_DETAILS:
      return {
        ...state,
        sessionDetails: action.payload,
      };
    case actionTypes.FORMDATA:
      return {
        ...state,
        formData: action.payload,
      };
    case actionTypes.SETCONTACT:
      return {
        ...state,
        contact: action.payload,
      };
    default:
      return { ...state };
  }
};

export default reducer;
