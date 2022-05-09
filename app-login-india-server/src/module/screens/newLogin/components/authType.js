export const iconUrl = {
  google: "https://local2.veris.in/assets/images/google.png",
  auth0: "/assets/images/AuthO.png",
  okta: "/assets/images/okta.png",
  microsoft: "/assets/images/microsoft.png",
};

export const btnText = {
  microsoft: "Microsoft",
  google: "google",
  okta: "okta",
  auth0: "Auth0",
};

export const templateOptions = {
  email: {
    btn: "signInOtpContact.lk-password",
    opt: ["InputBox"],
    template: ["OTP_SignIn_auth", "OTP_SignIn_auth"],
  },
  OTP_SignIn_auth: {
    btn: "signInPassword.lk-otp",
    opt: ["CountryPicker", "InputBox", "Input"],
    tempalte: ["OTP", "allowedTemplate"],
  },
  cognito: {
    btn: "signInPassword.btn-okta",
  },
  signInPassword: {
    opt: ["CountryPicker", "InputBox", "Input"],
  },
  OTP: {
    btn: "signInOtpContact.lk-password",
    template: ["OTP_SignIn_auth", "allowedTemplate"],
    opt: ["CountryPicker", "InputBox"],
  },
  phone: {
    btn: "signInOtpContact.lk-password",
    opt: ["CountryPicker", "InputBox"],
    template: ["OTP_SignIn_auth", "OTP_SignIn_auth"],
  },
};

export const authType = (type) => {
  return {
    opt: type,
    img: iconUrl[type],
    button: `signInPassword.btn-${btnText[type]}`,
  };
};

// export const renderTemplateUI = {
//   InputBox: (
//     <InputBox
//       value={this.state.fieldInputValue}
//       onChange={(event) => this.changeInputBox(event)}
//       allowedTemplate={this.state.allowedTemplate}
//       fieldInputType={this.state.fieldInputType}
//       LoginPlaceholder={this.state.LoginPlaceholder}
//       Formlabel={this.state.Formlabel}
//       showError={this.state.showError}
//       errorMsg={this.state.errorMsg}
//       validation={() => {
//         this.validation();
//       }}
//     />
//   ),
//   Input: (
//     <Input
//       {...this.state.fields.password}
//       type="password"
//       onChange={(event) => {
//         this.setFieldError({ password: "" });
//         this.setFieldValue({ password: event.target.value });
//         this.errors = { ...this.errors, ...this.validate("password") };
//       }}
//       onBlur={() =>
//         this.setFieldError({ password: t(this.errors["password"]) })
//       }
//     />
//   ),
//   CountryPicker: <CountryPicker setCountryCode={this.setCountryCode} />,
// };

export const templateType = (props) => {
  if (
    props.template === "OTP_SignIn_auth" ||
    props.tempalte === "signInPassword"
  ) {
    return ["LoginTemplate", "SSOTemplate"];
  } else {
    return ["LoginTemplate"];
  }
};