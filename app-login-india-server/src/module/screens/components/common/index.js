export function logintemplate(loginData) {
    /* New Login Logic based on onboard_scheme - Start */
    var loginTemplate = [];
    var response = loginData;
    localStorage.setItem('loginTypes', JSON.stringify(response?.onboard_scheme));
    console.log('Response', response?.onboard_scheme);
    if (response?.onboard_scheme?.email) {
        loginTemplate.push('email');
    }
    if (response?.onboard_scheme?.phone) {
        loginTemplate.push('phone');
    }
    if (response?.onboard_scheme?.otp) {
        loginTemplate.push('otp');
    }
    if (response?.onboard_scheme?.password) {
        loginTemplate.push('password');
    }
    if (response?.onboard_scheme?.cognito) {
        loginTemplate.push('cognito');
    }
    if (!response?.onboard_scheme) {
        loginTemplate.push('password');
    }

    if(!loginTemplate.includes("otp") && !loginTemplate.includes("password")){
        loginTemplate=['email','phone','otp','password']
    }

    //loginTemplate.push('both')
    console.log('Response', loginTemplate);
    localStorage.setItem('loginTemplate', loginTemplate);
    var loginUsing = [];
    response.meta.client.forEach(client => {
        if (client.name === 'otp_auth') {
            loginUsing.push('otp_auth');
        }
        if (client.name === 'veris_auth') {
            loginUsing.push('veris_auth');
        }
    });
    localStorage.setItem('loginUsing', loginUsing);
    return true;
    /* New Login Logic based on onboard_scheme - End */
}

export function setLanguage(languageData) {
    const langMap = {
        'en': 'English',
        'es': 'Español',
        'ja': '日本語',
        'ro': 'Română',
        'nl': 'Nederlands',
        'zh-CN': '中文',
        'hi': 'हिंदी',
        'hu': 'Magyar',
        'pt': 'Português',
    };
    var response = languageData;
    /* Language Set - Start */
    let length = response?.lang?.options?.length || 0;
    let languageOptions = null;
    if (length === 0) {
        localStorage.setItem('currentlanguage', 'en');
    }
    if (length === 1) {
        var lang = response.lang.options[0];
        localStorage.setItem('currentlanguage', lang);
    }
    if (length >= 2) {
        languageOptions = [];
        for (var i = 0; i < response?.lang?.options.length; i++) {
            var lang = response?.lang?.options[i];
            languageOptions.push(langMap[lang]);
        }
    }

    return languageOptions;
    /* Language Set - End*/
}