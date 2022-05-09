import React, { useEffect } from "react";
import { Container, Content, Footer, Header } from "../components/box/index";
import { Form, Input, Button, Spin, message } from "antd";
import {
  fetchMemberRegistrationForm,
  validateMember,
  verifyOtp,
  setContact,
} from "redux/actions/sessionTypes";
import { connect } from "react-redux";
import CountryPicker from "../components/inputbox/CountryPicker";
import "./styles.css";
import { useHistory } from "react-router-dom";
import Loader from "./components/loader";
import { EditOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";

function SignUp(props) {
  const history = useHistory();
  const [timer, setTimer] = React.useState(0);
  const [countryCode, setCountryCode] = React.useState("IN");
  const [dialCode, setDialCode] = React.useState("91");
  const [inpuType, setInputType] = React.useState("");
  const [otpInput, setOtpInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [error, setError] = React.useState({});
  const [reOtpSent, setReOtpSent] = React.useState(false);

  function isNumeric(value) {
    return /^-?\d+$/.test(value);
  }

  const setInput = (e) => {
    setError({});
    if (isNumeric(e.target.value)) {
      props.setContact(Number(e.target.value));
      setInputType("number");
    } else {
      props.setContact(e.target.value);
      setInputType("string");
    }
  };

  const emailphoneValidation = (e, t) => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const phoneRegex = /^[0-9]*$/g;
    if (phoneRegex.test(e) && t === "number") {
      return true;
    }
    if (emailRegex.test(e) && t === "string") {
      return true;
    }
    return false;
  };

  const clearStorage = () => {
    Cookies.remove("member_id");
    Cookies.remove("refresh_token");
    Cookies.remove("token");
    Cookies.remove("accessToken");
    Cookies.remove("session");
    Cookies.remove("csrftoken", { path: "/" });
    Cookies.remove("sessionid", { path: "/" });

    localStorage.removeItem("contact_id");
    localStorage.removeItem("name");
    localStorage.removeItem("member_data");
  };

  React.useEffect(() => {
    clearStorage();
  }, []);

  const sendContact = async () => {
    let { contact } = props;
    try {
      setLoading(true);
      let res;
      if (inpuType === "number") {
        let valid = emailphoneValidation(contact, "number");
        if (valid && contact.toString().length > 9) {
          let detail = "+" + dialCode + contact;
          res = await props.validateMember({
            contact: detail,
          });
        } else {
          return setError({
            contact: "Please Enter a valid phone number",
          });
        }
      } else {
        let valid = emailphoneValidation(contact, "string");
        if (valid) {
          res = await props.validateMember({
            contact: contact,
          });
        } else {
          return setError({
            contact: "Please Enter a valid Email",
          });
        }
      }
      if (res.status === 200 || res.status === 202) {
        setTimer(30);
        setOtpSent(true);
        setReOtpSent(true);
        message.success("OTP Sent");
      } else {
        message.warning(
          "Error in sending OTP! Please check your contact details."
        );
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      message.warning("Error in sending OTP");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timer === 0) {
      setReOtpSent(false);
      return;
    }
    let countdown = setInterval(() => {
      setTimer(timer - 1);
    }, 1000);
    return () => clearInterval(countdown);
  }, [timer]);

  const setCountryCodes = (code, cc) => {
    setCountryCode(cc);
    setDialCode(code);
  };

  const verifyprocedure = async (e) => {
    let { contact } = props;
    try {
      setLoading(true);
      let detail;
      if (inpuType === "number") {
        detail = "+" + dialCode + contact;
      } else {
        detail = contact;
      }
      let res = await props.verifyOtp({
        contact: detail,
        otp: otpInput,
      });
      if (res.status === 200 || res.status === 202) {
        let res = await props.fetchMemberRegistrationForm();
        let bool = false;
        let rules =
          res.data[0]?.rules && res.data[0]?.rules?.signup_email_rules
            ? res.data[0]?.rules?.signup_email_rules
            : [];
        if (rules.length < 1) {
          bool = true;
        }
        rules.map((o) => {
          let t = detail.includes(o.condition_value);
          if (t) {
            bool = true;
          }
        });
        if (bool) {
          return history.push("/signup-form");
        } else {
          return setError({
            contact: "Please Enter a valid email",
          });
        }
      } else if (res.status === 406) {
        message.error("You are already signed up");
        return history.push("/NewLogin");
      } else {
        message.error("Wrong Otp");
      }
    } catch (error) {
      if (error.response.status === 406) {
        message.error("You are already signed up");
        history.push("/NewLogin");
      } else {
        message.error("Bad Request");
      }
    } finally {
      setLoading(false);
    }
  };

  const verify = (e) => {
    setOtpInput(e.target.value);
  };

  const validateEmailPhone = (e) => {
    const emailRegex =
      /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    const phoneRegex = /^[0-9]*$/g;
    if (phoneRegex.test(contact) && JSON.stringify(contact).length >= 10) {
      return true;
    }
    if (emailRegex.test(contact)) {
      return true;
    }
    return false;
  };

  let { contact } = props;
  const currLanguage = localStorage.getItem("currentlanguage");
  const doc = props?.config?.privacy_policies?.[currLanguage || "en"];
  return (
    <Container>
      {loading && <Loader />}
      <Header
        heading={`Sign up with ${props?.config?.org}`}
        subHeading={`${props?.domain}.veris.in`}
      />
      <Content>
        <Form layout="vertical">
          {otpSent && (
            <EditOutlined
              style={{
                position: "absolute",
                marginTop: "5px",
                marginLeft: "110px",
                zIndex: 5,
              }}
              onClick={() => {
                setTimer(0);
                setOtpSent(false);
              }}
            />
          )}
          <Form.Item
            name="Email"
            label={
              contact?.toString()?.length === 0
                ? "Enter your email/phone *"
                : inpuType === "number"
                ? "Enter your phone"
                : "Enter your email"
            }
          >
            {inpuType === "number" && (
              <div className="signup-mobile-input">
                <div style={{ marginTop: "-4px" }}>
                  <CountryPicker setCountryCode={setCountryCodes} />
                </div>
              </div>
            )}
            <Input
              onChange={setInput}
              placeholder={"Enter your contact"}
              value={contact}
              disabled={loading || otpSent}
              className={`signup-email-phone-input ${
                inpuType === "number" && "signup-mobile-email-switch"
              }`}
              onBlur={() => {
                let valid = validateEmailPhone();
                if (!valid) {
                  setError({
                    contact: "Please Enter a valid contact",
                  });
                }
              }}
            />

            {error["contact"] && (
              <p
                style={{
                  color: "#f8795a",
                  lineHeight: "0",
                  marginTop: "18px",
                  fontSize: "12px",
                  marginBottom: "5px",
                  position: "absolute",
                  top: "27px",
                }}
              >
                {error["contact"]}
              </p>
            )}
            <div id="signup-via-otp-design">
              <Button
                disabled={timer > 0}
                className="signup-otp-btn"
                type="primary"
                onClick={sendContact}
                disabled={
                  reOtpSent ||
                  (typeof contact === "number" &&
                    JSON.stringify(contact).length < 10) ||
                  !validateEmailPhone() ||
                  contact.length < 1
                }
              >
                {timer > 0 ? timer + " s" : "Otp"}
              </Button>
            </div>
          </Form.Item>
          {otpSent && (
            <Form.Item
              name="Otp"
              label={"Verify Otp"}
              rules={[{ min: 0, max: 5 }]}
            >
              <Input
                onChange={verify}
                placeholder={"Enter Otp"}
                value={otpInput}
                className="signup-email-phone-input"
                maxLength="5"
              />
            </Form.Item>
          )}
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
            onClick={verifyprocedure}
            className="signup-button-design"
            disabled={otpInput.length < 5 || loading}
          >
            Continue
          </Button>
        </Form>
        <div
          style={{
            borderTop: "1px solid #ebeff2",
            margin: "16px 0px 20px 0px",
          }}
        />
        <div style={{ fontSize: "14px", textAlign: "center" }}>
          <p>Already have an account?</p>
          <p
            style={{ color: "steelblue", cursor: "pointer", lineHeight: 0 }}
            onClick={() => history.push("/NewLogin")}
          >
            Sign In
          </p>
        </div>
      </Content>
    </Container>
  );
}

const mapStateToProps = (state, ownProps) => {
  return {
    sessionDetails: state.session.sessionDetails,
    contact: state.session.contact,
  };
};

export default connect(mapStateToProps, {
  validateMember,
  verifyOtp,
  fetchMemberRegistrationForm,
  setContact,
})(SignUp);
