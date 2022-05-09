import React from "react";
import { useHistory } from "react-router-dom";
import { Container } from "../components/box/index";

function RedirectError(props) {
  const history = useHistory();
  return (
    <Container>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: 400,
          fontSize: "12px",
          padding: "15px",
          textAlign: "justify",
        }}
      >
        {props.config.error_msg}
      </div>
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
    </Container>
  );
}

export default RedirectError;
