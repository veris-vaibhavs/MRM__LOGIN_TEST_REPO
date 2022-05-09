import React, { Component } from "react";
import classes from "./styles.module.css";
import Form from "../components/form";
import { Button, Input } from "veris-styleguide";
import { Container, Content, Header } from "../components/box";
import { withTranslation } from "react-i18next";
import cogoToast from "cogo-toast";
import { getConfig } from "../../../requests";
import { logintemplate, setLanguage } from "../components/common";

const langMap = {
  en: "English",
  es: "Español",
  ja: "日本語",
  ro: "Română",
  nl: "Nederlands",
  "zh-CN": "中文",
  hi: "हिंदी",
};

class Domain extends Component {
  constructor(props) {
    const { t } = props;
    super(props);
    this.state = {
      fields: {
        domain: {
          label: t("domain.f-domain-label"),
          value: "",
          placeholder: t("domain.f-domain-placeholder"),
          error: "",
          isRequired: true,
        },
      },
      template: "signInPassword2",
      loading: false,
      language: { label: "English", value: "en" },
    };
    this.domain = React.createRef();
  }

  componentDidMount() {
    this.domain.current.focus();
  }

  setFieldValue = (updates, callback) => {
    let fields = { ...this.state["fields"] };
    for (let key in updates) {
      fields[key].value = updates[key];
    }
    this.setState({ field: fields }, callback);
  };

  setFieldError = (updates, callback) => {
    let fields = { ...this.state["fields"] };
    for (let key in updates) {
      fields[key].error = updates[key];
    }
    this.setState({ field: fields }, callback);
  };

  getFieldValue = (field) => {
    if (field) {
      return this.state.fields[field].value;
    }
    let values = {};
    let fields = { ...this.state["fields"] };
    for (let key in fields) {
      values[key] = fields[key].value;
    }
    return values;
  };

  onSubmit = async () => {
    const { t } = this.props;
    let fields = this.state.fields;
    for (let field in fields) {
      if (fields[field].error) {
        return;
      } else {
        if (fields[field].isRequired && !fields[field].value) {
          this.setFieldError({ [field]: t("app.err-required") });
          return;
        }
      }
    }
    try {
      await this.setState({ loading: true });
      let response = await getConfig(this.getFieldValue("domain"));
      let config = response.meta;
      config.poolId = response.id;
      config.orgId = response.organisation_id;
      config.org = response.name;
      config.baseUrl = response.base_url;
      config.cookiesUrls = response.cookies_urls;
      config.cognitoDomain = response.meta.domain;
      config.domain = `https://${this.getFieldValue("domain")}.veris.in`;
      config.allow_registration = response?.allow_registration;
      config.privacy_policies = response?.privacy_policies;
      config.error_msg = response?.cognito_signin_failed_redirection_msg;
      // config.rules = response?.rules;
      response.meta.client.forEach((client) => {
        if (client.name === "otp_auth") config.otpClient = client.client_id;
        if (client.name === "veris_auth") config.verisClient = client.client_id;
      });
      localStorage.setItem("org_id", response.organisation_id);
      /* New Login based on onboard_scheme - Start */
      let res = logintemplate(response);
      console.log(res);
      /* New Login based on onboard_scheme - End */
      /* Language Set - Start*/
      let langOptions = setLanguage(response);
      /* Language Set - End*/
      this.setState({ languageOptions: langOptions });
      if (this.state.template === "signInPassword") {
        this.props.updateState(
          {
            config: config,
            logo: `${response.base_url}/media/${response.org_logo}`,
            domain: this.getFieldValue("domain"),
            screen: "signInPassword",
          },
          () => {
            localStorage.setItem("domain", this.getFieldValue("domain"));
            this.props.history.push("/signInPassword");
          }
        );
      } else {
        this.props.updateState(
          {
            config: config,
            logo: `${response.base_url}/media/${response.org_logo}`,
            domain: this.getFieldValue("domain"),
            languageOptions: langOptions,
            screen: "NewLogin",
          },
          () => {
            localStorage.setItem("domain", this.getFieldValue("domain"));
            this.props.history.push("/NewLogin");
          }
        );
      }
    } catch (error) {
      await this.setState({ loading: false });
      cogoToast.error(t("domain.err-0"));
      this.setFieldError({ domain: "Enter valid domain." }, () => {
        this.setFieldValue({ domain: "" });
      });
    }
  };

  render() {
    const { t } = this.props;
    return (
      <div>
        <Container>
          <Header heading={t("domain.h-1")} subHeading={t("domain.sh-1")} />
          <Content>
            <Form onSubmit={this.onSubmit}>
              <Input
                {...this.state.fields.domain}
                ref={this.domain}
                style={{ textAlign: "right" }}
                suffix={t("domain.f-domain-suffix")}
                onChange={(event) => {
                  this.setFieldError({ domain: "" });
                  this.setFieldValue({ domain: event.target.value });
                }}
              />
              <div className={classes.forgot_container}>
                <a
                  href="#"
                  className={classes.forget_anchor}
                  onClick={() => this.props.forgotDomain()}
                >
                  {t("domain.lk-forgot-domain")}
                </a>
              </div>
              <Button
                type="submit"
                theme="vrs-btn-primary"
                label={t("domain.btn-continue")}
                loading={this.state.loading}
                onClick={this.onSubmit}
              />
            </Form>
          </Content>
        </Container>
      </div>
    );
  }
}

export default withTranslation()(Domain);
