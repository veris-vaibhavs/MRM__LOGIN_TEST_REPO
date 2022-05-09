import React from "react";
import { Spin } from "antd";

function Loader() {
  return (
    <Spin
      size="large"
      className="signup-spinner"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        translate: "(-50%, -50%)",
        zIndex: 100,
      }}
    />
  );
}

export default Loader;
