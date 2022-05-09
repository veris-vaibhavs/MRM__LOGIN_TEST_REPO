import React from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { withRouter } from "react-router-dom";

const qs = require('querystring');

// var jwt = require('jsonwebtoken');

class Callback extends React.Component {
    async componentDidMount() {
        try {
            document.getElementById('login').style.display = 'none';
            sessionStorage.setItem("redirect", true);
            let url_string = window.location.href;
            let url = new URL(url_string);
            let state = url.searchParams.get('state');
            if (state === localStorage.getItem('state')) {
                let domain = localStorage.getItem('domain');
                let response = await this.props.getOrgPool(domain);
                response['clientIdInUse'] = response.verisClient;
                let code = url.searchParams.get('code');
                const requestBody = {
                    grant_type: 'authorization_code',
                    code: code,
                    client_id: response.verisClient,
                    redirect_uri: `${window.location.origin}/login/callback/`,
                    code_verifier: localStorage.getItem('code_verifier'),
                };
                let config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                };
                let authenticationResult = await axios.post(
                    `${response.cognitoDomain.default.url}/oauth2/token`,
                    qs.stringify(requestBody),
                    config,
                );
                authenticationResult = authenticationResult.data;
                response['AuthenticationResult'] = {};
                response['AuthenticationResult']['IdToken'] =
                    authenticationResult.id_token;
                response['AuthenticationResult']['AccessToken'] =
                    authenticationResult.access_token;
                response['AuthenticationResult']['RefreshToken'] =
                    authenticationResult.refresh_token;
                response['AuthenticationResult']['ExpiresIn'] =
                    authenticationResult.expires_in;

                let idToken = jwt_decode(authenticationResult.id_token);
                config = {
                    headers: {
                        Authorization: `bearer ${authenticationResult.access_token}`,
                        Pool: `pool_${response.poolId}`,
                    },
                };
                let verisToken = await axios.get(
                    `/api/v4/get-secured-token/?domain=${response.domain}&contact=${idToken.email}`,
                    config,
                );
                debugger
                response['token'] = verisToken.data.token;
                response['member'] = verisToken.data.member;
                response['roles'] = verisToken.data.roles;
                response['contact_id'] = verisToken.data?.contact_id;
                response['name'] = verisToken.data?.name;
                localStorage.setItem('roles', response['roles']);
                if (verisToken.data?.member_data) {
                    localStorage.setItem('member_data', JSON.stringify(verisToken.data?.member_data));
                }
                this.props.signIn(response);

            } else {
                window.location.href = '/';
            }
        } catch (error) {
            // console.log(error)
            document.getElementById('login').style.display = 'block';
            this.props.history.push('/error');
            // window.location.href = '/error';
        }
    }

    render() {
        return <div />;
    }
}

export default withRouter(Callback);
