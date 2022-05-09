import React from "react";
import classes from "../styles.module.css";
import { authType } from "./authType";

function CognitoUI(props) {
  if (props.cognito === "COGNITO") {
    return <></>;
  }
  return (
    <>
      {props.click && (
        <div style={{ display: "block", color: "gray" }}>
          <p>Redirecting to login or you can click below</p>
        </div>
      )}
      <div
        className={classes.IDPBtn}
        onClick={() => {
          props.handleFederation(props.cognito);
        }}
        key={props.key}
        id={"cognito-" + props.index}
      >
        <div className={classes.IDPBtnIcon}>
          <img src={authType(props.cognito.toLowerCase()).img} />
        </div>
        <div className={classes.IDPBtnLabel}>
          {props.t(authType(props.cognito.toLowerCase()).button)}
        </div>
      </div>
    </>
  );
}

export default CognitoUI;
