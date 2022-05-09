import { Container, Content, Footer, Header } from "../../components/box";
import React from "react";
import { connect } from "react-redux";
import Loader from "../components/loader";
import { useHistory } from "react-router-dom";
import RenderWorkflow from "module/workflow/index";
import { memberRegistration } from "redux/actions/sessionTypes";
import { message } from "antd";

function SignUpForm(props) {
  const history = useHistory();
  const [loading, setLoading] = React.useState(false);
  const onSubmit = async (e) => {
    try {
      console.log(e, "signup data");
      setLoading(true);
      let res = await props.memberRegistration(e);
      if (res.status === 200 || res.status === 202) {
        message.success(
          "You are sucessfully signed up!, Enter the credentials to login"
        );
        history.push("/NewLogin");
      } else {
        message.error("Error in Signing Up");
      }
    } catch (error) {
      console.log(error.response);
    } finally {
      setLoading(false);
    }
  };
  const onError = (e) => {
    console.log(e);
  };
  return (
    <Container>
      {loading && <Loader />}
      <Header
        // heading={`Sign up with ${props?.config?.org}`}
        heading={
          props.form[0].workflow?.title || `Sign up with ${props?.config?.org}`
        }
        subHeading={`${props?.domain}.veris.in`}
      />
      <Content>
        {/* <FormContent form={props.form} /> */}
        <RenderWorkflow
          workflow={props.form[0].workflow}
          onSubmit={onSubmit}
          onError={onError}
          contact={props.contact}
        />
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
    form: state.session.formData,
    contact: state.session.contact,
  };
};

export default connect(mapStateToProps, {
  memberRegistration,
})(SignUpForm);
