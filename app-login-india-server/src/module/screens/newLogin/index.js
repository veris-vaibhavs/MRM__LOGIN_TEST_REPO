import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { Container, Content, Footer, Header } from "../components/box";
import { withGoogleReCaptcha } from "react-google-recaptcha-v3";
import sha256 from "crypto-js/sha256";
import base64 from "crypto-js/enc-base64";
import { Button, Form, Input, message, Checkbox } from "antd";
import CognitoUI from "./components/cognitoUI";
import { respondToChallenge, signin } from "../../../requests";
import CountryPicker from "../components/inputbox/CountryPicker";
import "./styles.css";
import { useHistory } from "react-router-dom";
import Loader from "../signUp/components/loader";

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const Contact = (props) => {
  const history = useHistory();
  const [error, setError] = React.useState({});
  const [dialCode, setDialCode] = React.useState("91");
  const [countryCode, setCountryCode] = React.useState("IN");
  const [contactDetails, setContactDetails] = React.useState("");
  const [form] = Form.useForm();
  const [type, setType] = React.useState("Enter email/phone");
  const [authType, setAuthType] = React.useState(true);
  const [loginOptions, setLoginOptions] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [pwdOtp, setPwdOtp] = React.useState("");
  const [display, setDisplay] = React.useState(true);
  const [remTime, setRemTime] = React.useState(0);
  const [otpSent, setOtpSent] = React.useState(false);
  const [apiResponse, setApiResponse] = React.useState(null);
  const [click, setClick] = React.useState(false);

  React.useEffect(() => {
    const lower = props.config.client[1].identity_provider.map((element) => {
      return element.toLowerCase();
    });
    let redirect = JSON.parse(sessionStorage.getItem("redirect"));
    if (lower.length === 2 && lower.includes("cognito") && !display) {
      if (!redirect || false) {
        setClick(true);
        handleFederation(props.config.client[1].identity_provider[1]);
        sessionStorage.setItem("redirect", false);
      }
    }
  }, [display]);

  const templateOptions = () => {
    let { t } = props;
    let loginTypes = JSON.parse(localStorage.getItem("loginTypes"));
    setLoginOptions(loginTypes);
    if (loginTypes?.["email"] && loginTypes?.["phone"]) {
      return setType(t("signInPassword.f-contact-label"));
    } else if (loginTypes?.["email"]) {
      return setType(t("enterEmail-placeholder"));
    } else if (loginTypes?.["phone"]) {
      return setType(t("enterPhone-placeholder"));
    } else if (loginTypes?.["cognito"]) {
      let beta = JSON.parse(localStorage.getItem("beta"));
      console.log(beta, "beta-value");
      if (beta) {
        loginTypes = { ...loginTypes, otp: true, password: true };
        setLoginOptions(loginTypes);
        return setType(t("enterEmail-placeholder"));
      }
      return setDisplay(false);
    } else {
      loginTypes = { ...loginTypes, otp: true, password: true };
      setLoginOptions(loginTypes);
      return setType(t("enterEmail-placeholder"));
    }
  };

  useEffect(() => {
    templateOptions();
  }, []);

  const otpCond = loginOptions?.["otp"];
  const passwordCond = loginOptions?.["password"];
  const emailCond = loginOptions?.["email"];
  const phoneCond = loginOptions?.["phone"];
  const validateMessages = {
    required: props.t("app.err-required"),
  };

  function isNumeric(value) {
    return /^-?\d+$/.test(value);
  }

  const validator = (input) => {
    let { t } = props;
    if (input.target.value.length === 0 && emailCond && phoneCond) {
      return setType(t("signInPassword.f-contact-label"));
    } else if (input.target.value.length === 0 && emailCond) {
      return setType(t("enterEmail-placeholder"));
    } else if (input.target.value.length === 0 && phoneCond) {
      return setType(t("enterPhone-placeholder"));
    } else if (isNumeric(input.target.value) && phoneCond) {
      setType(t("enterPhone-placeholder"));
      return "Mobile";
    } else if (emailCond) {
      return setType(t("enterEmail-placeholder"));
    } else if (phoneCond) {
      return setType(t("enterPhone-placeholder"));
    } else {
      setType(t("enterEmail-placeholder"));
      return "email";
    }
  };

  const emailPhoneDetails = (e) => {
    setError({});
    let bool = validator(e);
    if (bool === "Mobile") {
      setContactDetails(Number(e.target.value));
    } else {
      setContactDetails(e.target.value);
    }
  };

  const onSubmit = async () => {
    const { t } = props;
    let contacts;
    if (typeof contactDetails === "number") {
      contacts = "+" + props.dialCode + contactDetails;
    } else {
      contacts = contactDetails;
    }

    let valid = validateEmailPhone(contactDetails);
    let validate = errorValidate();
    if (valid && validate) {
      if (typeof contactDetails === "number" && contactDetails.length < 10) {
        setError((prev) => ({
          ...prev,
          Email: props.t("app.err-contact-0"),
        }));
      }
      setLoading(true);
      const captchaV3 = await props.googleReCaptchaProps.executeRecaptcha(
        authType ? "signInPassword" : "signInOTP"
      );
      let payload = {
        client_id: authType ? props.config.verisClient : props.config.otpClient,
        auth_flow: "CUSTOM_AUTH",
        contact: contacts,
        user_pool: props.config.pool.id,
        captchaV3: captchaV3,
      };
      try {
        if (authType) {
          let response = await signin(payload);
          let config = { ...props.config, ...response };
          payload = {
            answer: pwdOtp,
            challenge: response.ChallengeName,
            client_id: props.config.verisClient,
            session: response.Session,
            username: contactDetails,
            login_flow: "veris_auth",
            domain: props.config.domain,
            pool_id: props.config.poolId + "",
            user_pool: props.config.pool.id,
          };
          response = await respondToChallenge(payload);
          config.clientIdInUse = props.config.verisClient;
          config = { ...config, ...response };
          props.updateState(
            {
              config: config,
              contact: contactDetails,
            },
            () => {
              props.signIn();
            }
          );
        } else {
          payload = {
            answer: pwdOtp,
            challenge: apiResponse.ChallengeName,
            client_id: props.config.otpClient,
            session: apiResponse.Session,
            username: contactDetails,
            login_flow: "otp_auth",
            domain: props.config.domain,
            pool_id: props.config.poolId + "",
            user_pool: props.config.pool.id,
          };
          let response = await respondToChallenge(payload);
          let config = { ...props.config, ...response };
          config.clientIdInUse = props.config.otpClient;
          if (response.Session) {
            setLoading(false);
            return message.error(props.t("signInOtpCode.err-1"));
          } else {
            setLoading(false);
            return props.updateState(
              {
                config: config,
              },
              () => {
                props.signIn();
              }
            );
          }
        }
        setLoading(false);
      } catch (error) {
        console.log(error, "error");
        setLoading(false);
        if (error?.response?.status === 429) {
          let blockTime = JSON.parse(error?.response?.data).block_time;
          blockTime = Math.ceil(blockTime / 60);
          if (blockTime !== 0 && blockTime !== 1) {
            message.error(`User blocked! try after ${blockTime} minutes`);
          } else {
            message.error(`User blocked! try after a minute`);
          }
        } else if (error?.response?.status === 400) {
          let arr = [];
          for (let key in error?.response?.data) {
            arr.push(error?.response?.data[key]);
          }
          message.error(arr[0]);
        } else {
          message.error(props.t("signInPassword.err-0"));
        }
      }
    } else {
      if (!validateEmailPhone()) {
        setError((prev) => ({
          ...prev,
          Email: props.t("app.err-contact-0"),
        }));
      }
      return false;
    }
  };

  const password = (e) => {
    setError({});
    setPwdOtp(e.target.value);
  };

  const setCountryCodes = (code, cc_code) => {
    setCountryCode(cc_code);
    setDialCode(code);
  };

  const errorValidate = () => {
    if (contactDetails === "") {
      setError((prev) => ({
        ...prev,
        Email: props.t("app.err-required"),
      }));
      return false;
    } else if (pwdOtp === "") {
      setError((prev) => ({
        ...prev,
        password: props.t("app.err-required"),
      }));
      return false;
    }
    return true;
  };

  const handleFederation = async (provider) => {
    let domainURL = props.config.cognitoDomain.default.url;
    let identityProvider = provider;
    let redirectUri = `${window.location.origin}/login/callback/`;
    let appClientId = props.config.verisClient;
    let responseType = "code";
    let scopes = "aws.cognito.signin.user.admin+openid+profile";
    let state = makeid(32);
    localStorage.setItem("state", state);
    let code_verifier = makeid(64);
    localStorage.setItem("code_verifier", code_verifier);
    localStorage.setItem("login_progress", true);
    let challenge = base64
      .stringify(sha256(code_verifier))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    window.location.href = `${domainURL}/oauth2/authorize?redirect_uri=${redirectUri}&response_type=${responseType}&client_id=${appClientId}&scope=${scopes}&identity_provider=${identityProvider}&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;
  };

  const validateEmailPhone = (e) => {
    const emailRegex =
      /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    const phoneRegex = /^[0-9]*$/g;
    if (
      phoneRegex.test(contactDetails) &&
      JSON.stringify(contactDetails).length >= 10
    ) {
      return true;
    }
    if (emailRegex.test(contactDetails)) {
      return true;
    }
    return false;
  };

  const handleOtpSend = async () => {
    let valid = validateEmailPhone(contactDetails);
    const { t } = props;
    if (valid) {
      try {
        setLoading(true);
        const captchaV3 = await props.googleReCaptchaProps.executeRecaptcha(
          "signInOTP"
        );
        let payload = {
          client_id: props.config.otpClient,
          contact: contactDetails,
          auth_flow: "CUSTOM_AUTH",
          user_pool: props.config.pool.id,
          captchaV3: captchaV3,
        };
        let res = await signin(payload);
        setApiResponse(res);
        setRemTime(30);
        setOtpSent(true);
      } catch (error) {
        if (error.response.status === 401) {
          return message.error("You are not registered! Please Sign Up");
        }
        if (error.response.status === 429) {
          let blockTime = JSON.parse(error.response.data).block_time;
          blockTime = Math.ceil(blockTime / 60);
          message.error(t("signInOtpCode.err429", { count: blockTime }));
        } else if (error.response.status === 400) {
          let arr = [];
          for (let key in error.response.data) {
            arr.push(error.response.data[key]);
          }
          message.error(arr[0]);
        } else {
          message.error(t("signInOtpCode.err-0"));
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError((prev) => ({
        ...prev,
        Email: props.t("app.err-contact-0"),
      }));
      return false;
    }
  };

  const interval = React.useRef(null);

  const countdown = () => {
    setRemTime((time) => {
      if (time === 0) {
        return time;
      }
      const timeLeft = time - 1;
      return timeLeft;
    });
  };

  useEffect(() => {
    interval.current = setInterval(countdown, 1000);
    return () => clearInterval(interval.current);
  }, [otpSent]);

  useEffect(() => {
    if (otpCond && !passwordCond) {
      setAuthType(false);
    }
    if (!otpCond && passwordCond) {
      setAuthType(true);
    }
  }, [otpCond, passwordCond]);

  const { t } = props;
  let currLanguage = localStorage.getItem("currentlanguage");
  const doc = props?.config?.privacy_policies?.[currLanguage || "en"];
  return (
    <>
      <Container>
        <Header
          heading={`${t("signInOtpContact.h-1")} ${props.config.org}`}
          subHeading={`${props.domain}.veris.in`}
        />
        {loading && <Loader />}
        <Content>
          {display && (
            <Form
              layout="vertical"
              form={form}
              validateMessages={validateMessages}
              className="login-first-screen"
            >
              {otpCond && passwordCond && (
                <div style={{ position: "relative" }}>
                  <p
                    className="login-signin-switch "
                    onClick={() => {
                      setAuthType(!authType);
                    }}
                  >
                    {authType
                      ? t("signInPassword.lk-otp")
                      : t("signInOtpContact.lk-password")}
                  </p>
                </div>
              )}
              <Form.Item
                name="Email"
                label={type}
                style={{ marginBottom: "8px", width: "100%" }}
              >
                {phoneCond && type === t("enterPhone-placeholder") && (
                  <div className="login-mobile-input">
                    <div style={{ marginTop: "-4px" }}>
                      <CountryPicker setCountryCode={setCountryCodes} />
                    </div>
                  </div>
                )}
                <Input
                  onChange={emailPhoneDetails}
                  placeholder={
                    type === t("signInPassword.f-contact-label")
                      ? t("signInPassword.f-contact-placeholder")
                      : type
                  }
                  style={{
                    width:
                      phoneCond &&
                      type === t("enterPhone-placeholder") &&
                      "65%",
                    left:
                      phoneCond &&
                      type === t("enterPhone-placeholder") &&
                      "35%",
                  }}
                  onBlur={() => {
                    let valid = validateEmailPhone();
                    if (!valid) {
                      setError((prev) => ({
                        ...prev,
                        Email: props.t("app.err-contact-0"),
                      }));
                    }
                  }}
                  className="login-email-phone-input"
                  value={contactDetails}
                />
                {error["Email"] && (
                  <p
                    style={{
                      color: "#f8795a",
                      lineHeight: "0",
                      marginTop: "18px",
                      fontSize: "12px",
                      marginBottom: "5px",
                    }}
                  >
                    {error["Email"]}
                  </p>
                )}
                {!authType && otpCond && (
                  <div id="login-via-otp-design">
                    <Button
                      className="login-otp-btn"
                      type="primary"
                      onClick={handleOtpSend}
                      disabled={
                        remTime > 0 ||
                        (typeof contactDetails === "number" &&
                          JSON.stringify(contactDetails).length < 10) ||
                        !validateEmailPhone() ||
                        contactDetails.length < 1
                      }
                    >
                      {remTime ? remTime + " s" : "OTP"}
                    </Button>
                  </div>
                )}
              </Form.Item>

              {authType ? (
                <Form.Item
                  label={t("signInPassword.f-password-label")}
                  name={"Password"}
                >
                  <Input
                    rules={[{ required: true }]}
                    className="login-email-phone-input"
                    type={"password"}
                    onChange={password}
                    placeholder={t("signInPassword.f-password-placeholder")}
                  />
                  {error["password"] && (
                    <p
                      style={{
                        color: "#f8795a",
                        lineHeight: "0",
                        marginTop: "18px",
                        fontSize: "12px",
                        marginBottom: "5px",
                      }}
                    >
                      {error["password"]}
                    </p>
                  )}
                </Form.Item>
              ) : (
                otpSent && (
                  <Form.Item
                    label={t("signInOtpCode.f-otp-label")}
                    name={"Otp"}
                  >
                    <Input
                      rules={[{ required: true }]}
                      className="login-email-phone-input"
                      type={"text"}
                      onChange={password}
                      placeholder={t("signInOtpCode.f-otp-label")}
                      maxLength="5"
                    />
                    {error["password"] && (
                      <p
                        style={{
                          color: "#f8795a",
                          lineHeight: "0",
                          marginTop: "18px",
                          fontSize: "12px",
                          marginBottom: "5px",
                        }}
                      >
                        {error["password"]}
                      </p>
                    )}
                  </Form.Item>
                )
              )}
              <Form.Item>
                {doc && (
                  <p
                    style={{
                      fontSize: "12px",
                      cursor: "pointer",
                      color: "steelblue",
                    }}
                    onClick={() => {
                      window.open(doc?.url);
                    }}
                  >
                    {doc?.consentMessage}
                  </p>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-button-design"
                  onClick={onSubmit}
                  disabled={!authType && !otpSent ? true : false}
                >
                  {t("signInOtpContact.btn-continue")}
                </Button>
              </Form.Item>

              {/* forgot Button */}
              <div
                onClick={() =>
                  props.updateState(
                    {
                      screen: "forgotPassword",
                    },
                    () => {
                      history.push("/forgotPassword");
                    }
                  )
                }
                className="login-main-screen-ForgotPasswordLink"
              >
                {t("signInPassword.lk-forgot")}
              </div>
            </Form>
          )}
          {props.config.client[1].identity_provider.map((i, index) => {
            return (
              <CognitoUI
                index={index}
                key={index}
                cognito={i}
                t={t}
                handleFederation={handleFederation}
                provider={props.config.client[1].identity_provider}
                click={click}
              />
            );
          })}
          {otpCond && <Footer>{t("signInOtpContact.i-footer")}</Footer>}
          {props.config?.allow_registration && (
            <>
              <div
                style={{
                  borderTop: "1px solid #ebeff2",
                  margin: "16px 0px 20px 0px",
                }}
              />
              <div style={{ fontSize: "14px", textAlign: "center" }}>
                <p>Don't have a account?</p>
                <p
                  style={{
                    color: "steelblue",
                    cursor: "pointer",
                    lineHeight: 0,
                  }}
                  onClick={() => history.push("/signup")}
                >
                  Sign up
                </p>
              </div>
            </>
          )}
        </Content>
      </Container>
    </>
  );
};

export default withTranslation()(withGoogleReCaptcha(Contact));
