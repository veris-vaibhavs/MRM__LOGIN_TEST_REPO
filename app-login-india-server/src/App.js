import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import "./i18n";
import Authentication from "./module";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import i18next from "i18next";
import { Provider } from "react-redux";
import store from "./redux/index";

function App(props) {
  useEffect(() => {
    console.log(i18next.language);
    localStorage.setItem("Defaultlanguage", i18next.language);
    let currentLang = localStorage.getItem("currentlanguage");
    if (!currentLang) {
      localStorage.setItem("currentlanguage", "en");
    }
    console.log("231312", currentLang);
    i18next.changeLanguage(currentLang, (err, t) => {
      if (err) return console.log("something went wrong loading", err);
      t("key"); // -> same as i18next.t
    });
  });
  return (
    <Provider store={store}>
      <BrowserRouter basename="/login">
        <GoogleReCaptchaProvider
          reCaptchaKey="6LewFWofAAAAAE3MLYgPrKvLUIr3vKmVyYPFf6HG"
          scriptProps={{
            async: true, // optional, default to false,
            defer: true, // optional, default to false
          }}
        >
          <Authentication {...props} />
        </GoogleReCaptchaProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
