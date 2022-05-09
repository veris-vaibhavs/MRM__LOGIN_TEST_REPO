import React from "react";
import { Spinner } from "veris-styleguide";
import RenderField from "./renderField";
import classes from "./styles.module.css";
import { Col, Row } from "react-grid-system";
import { getValidators } from "./validators";
import { withTranslation } from "react-i18next";
import { getWorkflowTranslation, isValidPhone } from "./utils";
import { Button, Checkbox } from "antd";
import jump from "jump.js";
import UUID from "uuid-js";
import { autofillWorkflowField } from "./autofill";
const short = require("short-uuid");
let fieldsJSON = require("./fields.json");
let dataTypes = fieldsJSON.dataTypes;
let validators = getValidators();

class RenderWorkflow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingWorkflow: false,
      fields: {},
      checked: false,
    };
  }

  componentDidMount() {
    this.processWorkflow(this.props.workflow);
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
  validate = (field) => {
    let config = this.state["fields"][field];
    config["field"] = field;
    try {
      return validators[config.fieldType](config, this.getFieldValue);
    } catch (error) {
      console.log(error);
    }
  };

  onSubmit = () => {
    let fields = this.state.fields;
    let error = false;
    for (let key in fields) {
      if (fields[key].error && fields[key].isRequired) {
        if (!error) error = fields[key].id;
      } else {
        if (fields[key].isRequired && !fields[key].value) {
          this.setFieldError({
            [key]: this.props.t("field.error-required"),
          });
          if (!error) error = fields[key].id;
        }
      }
    }
    if (error) {
      try {
        this.setState({ loading: false });
        jump(`#${error}`, {
          duration: 500,
          offset: -100,
        });
        return;
      } catch (error) {
        return;
      }
    }
    let workflowData = [];
    this.state.workflowFieldsRaw.forEach((field) => {
      let obj = {
        ...field,
        value: (() => {
          switch (fields[field.id].dataType) {
            case "option":
              return this.getFieldValue(field.id).value;
            case "options":
              return this.getFieldValue(field.id)
                ? this.getFieldValue(field.id)
                    .map((ele) => ele.value)
                    .join(", ")
                : "";
            case "moment":
              return this.getFieldValue(field.id).toISOString();
            default:
              return this.getFieldValue(field.id);
          }
        })(),
      };
      workflowData.push(obj);
    });
    let payload = {
      first_name: this.getValueFromAlias(workflowData, "first_name"),
      last_name: this.getValueFromAlias(workflowData, "last_name"),
      designation: this.getValueFromAlias(workflowData, "designation"),
      email: this.getValueFromAlias(workflowData, "email"),
      phone: this.getValueFromAlias(workflowData, "phone"),
      department: this.getValueFromAlias(workflowData, "department"),
      workflow: {
        workflow_id: this.props.workflow.id,
        workflow_name: this.props.workflow.title,
        workflow_data: workflowData,
      },
    };
    this.props.onSubmit(payload);
  };

  getValueFromAlias = (workflowData, key) => {
    let data = workflowData.find((i) => i?.field_alias === key);
    return data?.value ? data.value : "";
  };

  processWorkflow = async (workflow) => {
    // this.setState({ loadingWorkflow: true });
    let countryLocale = "";
    let countryCode = "";
    let fields = {};
    let workflowFieldsRaw = [];
    let translation;
    const currentLang = localStorage.getItem("currentlanguage") || "en";
    if (workflow.language_info) {
      try {
        translation = await getWorkflowTranslation(
          workflow.language_info?.default?.replace("http://", "https://")
        );
        translation = translation.data;
        this.setState({
          translation,
        });
      } catch (error) {}
    }
    if (workflow.screens) {
      workflow.screens.forEach((ele) => {
        ele.screen.form_fields
          .filter((field) => {
            return [
              1, 2, 3, 4, 6, 7, 8, 10, 9, 11, 13, 15, 16, 17, 19, 21, 22, 26,
              27,
            ].includes(field.field_type);
          })
          .forEach((field) => {
            workflowFieldsRaw.push({ ...field });
            fields[field.id] = {
              id: `${field.field_code}_${field.id}`,
              fieldType: field.field_type,
              code: field.field_code,
              label: field.label,
              value: autofillWorkflowField(field, [], {
                fields: {
                  contact: {
                    value: this.props.contact,
                  },
                },
              }),
              dataType: dataTypes[field.field_type],
              isRequired: field.required,
              error: "",
              placeholder: field.placeholder_text
                ? field.placeholder_text
                : "Type here...",
              options: field.choices.map((choice) => {
                return {
                  label: choice,
                  value: choice,
                };
              }),
              meta: field.meta,
              getautoFill: async (value) => {
                var escortId = null;
                for (let key in fields) {
                  if (fields[key].code === "escort_name") {
                    escortId = key;
                  }
                }
                if (value) {
                  this.setFieldError({ [escortId]: null });
                  this.setFieldValue({
                    [escortId]: this.state.field?.hostName?.value,
                  });
                }
              },
              onChange: async (event) => {
                if (field.field_type === 16) {
                  console.log("Onchange->", event);
                  //console.log('With -code->',(event).replace(/ +(?=)/g,'').replace(`+${countryCode}`,countryCode));
                  if (
                    event.slice(0, countryCode.length + 1) === `+${countryCode}`
                  ) {
                    console.log(
                      "With +code->",
                      event.replace(`+${countryCode}`, countryCode)
                    );
                    this.setFieldValue({
                      [field.id]: event.replace(`+${countryCode}`, countryCode),
                    });
                  } else {
                    this.setFieldValue({
                      [field.id]: event.replace(`+${countryCode}`, countryCode),
                    });
                    console.log(
                      "Without +code->",
                      event.replace(`+${countryCode}`, countryCode)
                    );
                  }
                }
                if (field.field_type === 9 || field.field_type === 21) {
                  // let name = `${UUID.create().hex}${field.id}.png`;
                  // let activityToken = await this.getTokenFromVenueId(this.state.fields.venue.value.value);
                  // await uploadActivityFile(event, name, activityToken);
                  // return this.setFieldValue({[field.id]: getFileUrl(name)});
                } else if (field.field_type === 19) {
                  // let name = `${UUID.create().hex}${field.id}.pdf`;
                  // let activityToken = await this.getTokenFromVenueId(this.state.fields.venue.value.value);
                  // await uploadPDF(event, name, activityToken);
                  // return this.setFieldValue({[field.id]: getFileUrl(name)});
                } else if (
                  dataTypes[field.field_type] === "text" &&
                  field.field_type !== 16
                ) {
                  this.setFieldValue({ [field.id]: event.target.value });
                } else if (field.field_type === 4) {
                  //Handling of checkbox to match dataType  defined in fields.json
                  this.setFieldValue({
                    [field.id]: {
                      label: event.target.checked,
                      value: event.target.checked,
                    },
                  });
                  let error = this.validate(field.id);
                  this.setFieldError(error);
                } else {
                  this.setFieldValue({ [field.id]: event });
                }
              },
              onBlur: (event) => {
                if (field.field_type !== 16) {
                  let error = this.validate(field.id);
                  this.setFieldError(error);
                } else if (field.field_type === 16) {
                  let err = false;
                  if (
                    event.target.value.slice(0, countryCode.length + 1) ===
                    `+${countryCode}`
                  ) {
                    err = isValidPhone(
                      event.target.value,
                      countryCode,
                      countryLocale
                    );
                  }
                  if (
                    event.target.value.slice(0, countryCode.length) ===
                    `${countryCode}`
                  ) {
                    err = isValidPhone(
                      event.target.value,
                      countryCode,
                      countryLocale
                    );
                  }
                  if (!err) {
                    let fieldID = field.id;
                    let error_obj = {};
                    error_obj[fieldID] = this.props.t(
                      "Enter valid phone number"
                    );
                    this.setFieldError(error_obj);
                  }
                }
              },
              onFocus: (event) => {
                this.setFieldError({
                  [field.id]: null,
                });
              },
              isValid: (code, locale) => {
                console.log("locale,code ->", locale, code);
                countryLocale = locale;
                countryCode = code;
              },
            };
          });
      });
    }
    this.setState({
      loadingWorkflow: false,
      fields: fields,
      translation: translation,
      workflowFieldsRaw: workflowFieldsRaw,
    });
  };

  render() {
    const { t } = this.props;
    return (
      <>
        <Row>
          {this.state.loadingWorkflow ? (
            <div
              style={{
                display: "block",
                width: "100%",
              }}
            >
              <h3
                style={{
                  display: "block",
                  textAlign: "center",
                }}
              >
                {t("activitiesEmptyState.loading-i")}{" "}
              </h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Spinner color="#018ccf" size={60} />
              </div>
            </div>
          ) : (
            Object.keys(this.state.fields)
              .map((field) => {
                return (
                  <RenderField
                    field={this.state.fields[field]}
                    options={this.state.fields[field]?.options}
                    context={{ a: "b" }}
                  />
                );
              })
              .filter((component) => component !== "IGNORE")
              .map((field, index) => (
                <Col
                  xs={24}
                  key={index}
                  className={classes.padding}
                  style={{
                    marginTop: 10,
                  }}
                >
                  {field}
                </Col>
              ))
          )}
        </Row>
        {/* <p
          style={{
            fontSize: "12px",
            cursor: "pointer",
            color: "steelblue",
            marginBottom: '5px'
          }}
          onClick={() => {
            window.open(
              "https://local.veris.in/media/nda/India_Final_NDA.html"
            );
          }}
        >
          By clicking, you are accepting the agreement for this organization
        </p> */}
        <Row>
          <Col xs={24} className={classes.padding}>
            <Button
              type="primary"
              style={{ width: "100%" }}
              onClick={this.onSubmit}
              className="mt-2"
              // disabled={!this.state.checked}
            >
              Submit
            </Button>
          </Col>
        </Row>
      </>
    );
  }
}

export default withTranslation()(RenderWorkflow);
