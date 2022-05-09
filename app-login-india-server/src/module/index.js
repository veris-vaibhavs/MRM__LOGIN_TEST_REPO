import React, { Component } from "react";
import classes from "./styles.module.css";
import "./styles.css";
import Domain from "./screens/domain";
import { withTranslation } from "react-i18next";
import { Redirect, Route, Switch, withRouter } from "react-router-dom";
import SignInOTPContact from "./screens/signInOtp/contact";
import SignInOTPCode from "./screens/signInOtp/code";
import SetPassowrd from "./screens/setPassword";
import ForgotDomain from "./screens/forgotDomain";
import Callback from "./screens/callback";
import { getConfig } from "../requests";
import cogoToast from "cogo-toast";
import { ReactSVG } from "react-svg";
import loadable from "@loadable/component";
import { logintemplate, setLanguage } from "./screens/components/common";
import _ from "lodash";
import SignUp from "./screens/signUp/index";
import SignUpForm from "./screens/signUp/signup-form/index";
import RedirectError from "./screens/error/index";

const langMap = {
  en: "English",
  es: "Español",
  ja: "日本語",
  ro: "Română",
  nl: "Nederlands",
  "zh-CN": "中文",
  hi: "हिंदी",
  hu: "Magyar",
  pt: "Português",
};

const SignInPassword = loadable(() => import("./screens/signInPassword"), {
  fallback: (
    <div
      style={{
        border: "3px solid #f3f3f3",
        borderRadius: "50%",
        borderTop: "3px solid #018ccf",
        width: "70px",
        height: "70px",
        animation: "spin 2s linear infinite",
      }}
      className="loader"
    ></div>
  ),
});
const NewLogin = loadable(() => import("./screens/newLogin"), {
  fallback: (
    <div
      style={{
        border: "3px solid #f3f3f3",
        borderRadius: "50%",
        borderTop: "3px solid #018ccf",
        width: "70px",
        height: "70px",
        animation: "spin 2s linear infinite",
      }}
      className="loader"
    ></div>
  ),
});
const ForgotPassword = loadable(() => import("./screens/forgotPassword"), {
  fallback: (
    <div
      style={{
        border: "3px solid #f3f3f3",
        borderRadius: "50%",
        borderTop: "3px solid #018ccf",
        width: "70px",
        height: "70px",
        animation: "spin 2s linear infinite",
      }}
      className="loader"
    ></div>
  ),
});

class Authenticate extends Component {
  state = {
    menu: false,
    screen: "",
    domain: "",
    logo: "https://www.getveris.com/wp-content/uploads/2018/12/logo-gradient-1.png",
    config: null,
    contact: "",
    languageDropdown: false,
    languageOptions: null,
    languageSelected: "English",
  };

  isGenericDomain = (domain) => {
    let domains = [
      "localhost",
      "local2",
      "local",
      "sandbox",
      "sandbox2",
      "live",
      "india",
      "p3",
    ];
    if (domains.includes(domain)) {
      return true;
    } else {
      return false;
    }
  };

  async componentDidMount() {
    if (
      new URLSearchParams(this.props.location.search).get("beta") === "true"
    ) {
      localStorage.setItem("beta", true);
    } else {
      localStorage.setItem("beta", false);
    }
    if (
      new URLSearchParams(this.props.location.search).get("signIn") === "true"
    ) {
      localStorage.setItem("signInPassword", true);
      localStorage.removeItem("login_progress");
      this.getOrgPool(localStorage.getItem("domain"), () => {
        console.log("Language Options", this.state.languageOptions);
        this.props.history.push("/NewLogin?signIn=true");
      });
    }
    if (
      this.props.location.pathname !== "/setPassword" &&
      this.props.location.pathname !== "/setPassword/" &&
      new URLSearchParams(this.props.location.search).get("signIn") !== "true"
    ) {
      localStorage.setItem("signInPassword", false);
      var host = window.location.hostname;
      var domain = host.split(".")[0];
      let languageSelected = langMap[localStorage.getItem("currentlanguage")];
      this.setState({
        languageSelected: languageSelected,
      });
      if (!this.isGenericDomain(domain)) {
        if (domain === "p3") {
          domain = localStorage.getItem("domain") || "p3";
        }
        this.getOrgPool(domain, () => {
          this.props.history.push("/NewLogin");
        });
      } else {
        this.setState({ screen: "domain" }, () => {
          this.props.history.push("/domain");
        });
      }
    } else {
      new URLSearchParams(this.props.location.search).get("signIn") === "true"
        ? this.getOrgPool(localStorage.getItem("domain"), () => {
            localStorage.setItem("signInPassword", true);
            localStorage.removeItem("login_progress");
            this.props.history.push("/NewLogin?signIn=true");
          })
        : this.setState({ screen: "setPassword" });
    }
  }

  // componentDidUpdate() {
  //   console.log(this.props.history);
  //   if (window.location.pathname === "/login/signup") {
  //     this.props.history.location.pathname === "/signup";
  //   }
  // }

  getOrgPool = async (domain, callback) => {
    try {
      localStorage.setItem("domain", domain);
      let response = await getConfig(domain);
      let config = response.meta;
      config.poolId = response.id;
      config.orgId = response.organisation_id;
      config.org = response.name;
      config.baseUrl = response.base_url;
      config.cookiesUrls = response.cookies_urls;
      config.cognitoDomain = response.meta.domain;
      config.allow_registration = response?.allow_registration;
      config.privacy_policies = response?.privacy_policies;
      config.error_msg = response?.cognito_signin_failed_redirection_msg;
      // config.rules = response?.rules;
      config.domain = `https://${domain}.veris.in`;
      response.meta.client.forEach((client) => {
        if (client.name === "otp_auth") config.otpClient = client.client_id;
        if (client.name === "veris_auth") config.verisClient = client.client_id;
      });
      localStorage.setItem("org_id", response.organisation_id);
      /* New Login based on onboard_scheme - Start */
      let res = logintemplate(response);
      /* New Login based on onboard_scheme - End */

      /* Language Set - Start*/
      let langOptions = setLanguage(response);
      /* Language Set - End*/

      this.setState({ languageOptions: langOptions });
      this.updateState(
        {
          config: config,
          logo: `${window.location.origin}/media/${response.org_logo}`,
          domain: domain,
          languageOptions: langOptions,
          screen: "NewLogin",
        },
        callback
      );
      return config;
    } catch (error) {
      await this.setState({ loading: false });
      cogoToast.error("Domain not found!");
      this.setState({ screen: "domain" });
    }
  };
  updateState = (updates, callback) => {
    this.setState(updates, callback);
  };
  forgotDomain = () => {
    this.setState({ screen: "forgotDomain" }, () => {
      this.props.history.push("/forgotDomain");
    });
  };
  showDomain = () => {
    this.setState({ screen: "domain" }, () => {
      this.props.history.push("/domain");
    });
  };
  signIn = (config) => {
    localStorage.removeItem("login_progress");
    if (process.env.NODE_ENV === "production") {
      let data = config ? config : this.state.config;
      this.props.Axios.createInstance(data);
    } else {
      alert("Success");
    }
  };

  render() {
    const { t } = this.props;
    let handlers = {
      updateState: this.updateState,
      signIn: this.signIn,
      forgotDomain: this.forgotDomain,
      showDomain: this.showDomain,
      getOrgPool: this.getOrgPool,
      isGenericDomain: this.isGenericDomain,
    };
    if (this.state.screen == null) {
      return null;
    } else {
      return this.state.screen ? (
        <div style={{ backgroundColor: "#ebeff2" }}>
          <div className={classes.Container}>
            <div className={classes.MainNavigation}>
              <div className={classes.Logo}>
                <img alt="Organisation Logo" src={this.state.logo} />
              </div>
              <div>
                <div className={classes.OtherLinks}>
                  <div className={classes.ProfileLink}>
                    {this.state.languageOptions !== null ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          this.setState({ menu: true });
                        }}
                      >
                        <ReactSVG
                          beforeInjection={(svg) => {
                            svg.classList.add(classes.DropDownIcon);
                          }}
                          src="/assets/icons/ecology-globe-message.svg"
                        />

                        <div className={classes.languageDropdown}>
                          {t("Languages")}
                          <ReactSVG
                            beforeInjection={(svg) => {
                              svg.classList.add(classes.CaretIcon);
                            }}
                            src={
                              this.state.languageDropdown
                                ? "/assets/icons/arrow-up-1.svg"
                                : "/assets/icons/arrow-down-1.svg"
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                    {this.state.menu && (
                      <React.Fragment>
                        <div
                          onClick={() => {
                            this.setState({ menu: false });
                          }}
                          className={classes.Backdrop}
                        />
                        <div
                          className={classes.DropDown}
                          style={{ marginTop: 15, width: "95%" }}
                        >
                          {/* <div className={classes.DropDownPointer}/> */}
                          <ul>
                            {this.state.languageOptions !== null ? (
                              <div
                                className={
                                  this.state.languageDropdown
                                    ? "languageDropdownItems langDropdownShow"
                                    : "languageDropdownItems langDropdownHide"
                                }
                              >
                                {this.state.languageOptions.map((item) => (
                                  <li
                                    className={
                                      item == this.state.languageSelected
                                        ? "activeLanguage"
                                        : ""
                                    }
                                    onClick={(e) => {
                                      let lang =
                                        localStorage.getItem("Defaultlanguage");
                                      var langValue = e.target.innerHTML.trim();
                                      localStorage.setItem(
                                        "LanguageName",
                                        langValue
                                      );
                                      localStorage.setItem(
                                        "currentlanguage",
                                        lang
                                      );
                                      lang = _.findKey(
                                        langMap,
                                        (l) => l === langValue
                                      );
                                      localStorage.currentlanguage = lang;
                                      this.setState({
                                        languageDropdown: false,
                                      });
                                      if (typeof window !== "undefined") {
                                        window.location.replace("/");
                                      }
                                    }}
                                  >
                                    {" "}
                                    {item}
                                  </li>
                                ))}
                              </div>
                            ) : (
                              ""
                            )}
                          </ul>
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.SubContainer}>
              <Switch>
                <Route
                  path="/domain"
                  exact
                  render={(props) => (
                    <Domain {...props} {...this.state} {...handlers} />
                  )}
                />
                <Route
                  path="/forgotDomain"
                  exact
                  render={(props) => (
                    <ForgotDomain {...props} {...this.state} {...handlers} />
                  )}
                />
                <Route
                  path="/error"
                  render={(props) => (
                    <RedirectError {...props} {...this.state} {...handlers} />
                  )}
                />
                <Route
                  path="/callback/"
                  render={(props) => (
                    <Callback {...props} {...this.state} {...handlers} />
                  )}
                />
                <Route
                  path="/setPassword"
                  render={(props) => (
                    <SetPassowrd {...props} {...this.state} {...handlers} />
                  )}
                />
                {this.state.config && (
                  <React.Fragment>
                    <Route
                      path="/signup"
                      exact
                      render={(props) => (
                        <SignUp {...props} {...this.state} {...handlers} />
                      )}
                    />
                    <Route
                      path="/signup-form"
                      exact
                      render={(props) => (
                        <SignUpForm {...props} {...this.state} {...handlers} />
                      )}
                    />
                    <Route exact path="/login">
                      <Redirect to="/NewLogin" />
                    </Route>
                    <Route exact path="/">
                      <Redirect to="/NewLogin" />
                    </Route>
                    <Route
                      path="/signInPassword"
                      exact
                      render={(props) => (
                        <SignInPassword
                          {...props}
                          {...this.state}
                          {...handlers}
                        />
                      )}
                    />
                    <Route
                      path="/NewLogin"
                      exact
                      render={(props) => (
                        <NewLogin {...props} {...this.state} {...handlers} />
                      )}
                    />
                    <Route
                      path="/signInOtp/contact"
                      exact
                      render={(props) => (
                        <SignInOTPContact
                          {...props}
                          {...this.state}
                          {...handlers}
                        />
                      )}
                    />
                    <Route
                      path="/signInOtp/code"
                      exact
                      render={(props) => (
                        <SignInOTPCode
                          {...props}
                          {...this.state}
                          {...handlers}
                        />
                      )}
                    />
                    <Route
                      path="/forgotPassword"
                      exact
                      render={(props) => (
                        <ForgotPassword
                          {...props}
                          {...this.state}
                          {...handlers}
                        />
                      )}
                    />
                  </React.Fragment>
                )}
                <Redirect to="/domain" />
              </Switch>
              <div className={classes.Footer}>
                <p>
                  {t("app.i-help")} <br /> &copy; 2022 - V2.0 Veris
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      );
    }
  }
}

export default withTranslation()(withRouter(Authenticate));
