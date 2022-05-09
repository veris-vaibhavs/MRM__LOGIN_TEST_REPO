import { isEmpty } from 'lodash';
import AxiosSingleton from './axios-instance';

export const convertHtmlToPdf = (fn, defaultVal) => {
    try {

        return  ""
    } catch (error) {
        return ;
    }
};

export const getLocationHierarchy = async (filter) => {
    let axios = AxiosSingleton.getInstance();
    let orgId = AxiosSingleton.config.orgId;
    let url = `/api/v4/organization/${orgId}/resources/1/hierarchy/`;
    if (filter) {
        url = url + '?filter_roles=' + filter;
    }
    try {
        let response = await axios({
            method: 'get',
            url: url,
        });
        if (response.status === 200 && !isEmpty(response?.data)) {
            return response?.data;
        }
        return [];
    } catch (error) {
        throw error;
    }
};

export async function getTerminals() {
    let axios = AxiosSingleton.getInstance();
    let orgId = AxiosSingleton.config.orgId;
    try {
        let response = await axios.get(`/api/v4/organization/${orgId}/terminals`);
        let data = response.data.map((terminal) => {
            return {
                label: terminal.name,
                value: terminal.id,
                venue: terminal.venue,
            };
        });
        return data;
    } catch (error) {
        throw error;
    }
}

export const getVenues = async () => {
    let axios = AxiosSingleton.getInstance();
    let orgId = AxiosSingleton.config.orgId;
    let url = '/api/v4/user-invite-access/venues/';
    try {
        let response = await axios({
            method: 'get',
            url: url,
        });
        let data = response.data.venues.map((venue) => {
            return {
                label: venue.name,
                value: venue._id,
                ...venue,
            };
        });
        return data;
    } catch (error) {
        throw error;
    }
};

export const getGuestDetails = (fn, defaultVal) => {
    try {

        return  ""
    } catch (error) {
        return ;
    }
};
export const getHost = (fn, defaultVal) => {
    try {

        return  ""
    } catch (error) {
        return ;
    }
};
export const getTenantEmployees = (fn, defaultVal) => {
    try {

        return  ""
    } catch (error) {
        return ;
    }
};

export const getSafeValue = (fn, defaultVal) => {
    try {
        let value = fn();
        return value ? value : defaultVal;
    } catch (error) {
        return defaultVal;
    }
};
export const getOrganisationDetails = async () => {
    let orgId = AxiosSingleton.config.orgId;
    let url = `/api/v5/organisation/${orgId}/`;
    let axios = AxiosSingleton.getInstance();
    try {
        let response = await axios({ method: 'get', url: url });
        let data = {
            languages: response?.data?.extra_info?.meta?.language,
            hierarchyInvite: {
                enabled: getSafeValue(() => response.data.extra_info.features.hierarchy_invites.enabled, null),
                allowAccessories: getSafeValue(() => response.data.extra_info.features.hierarchy_invites.accessory_allow, null),
                accessories: (() => {
                    if (getSafeValue(() => response.data.extra_info.features.hierarchy_invites.accessory_list.items, null)) {
                        return response.data.extra_info.features.hierarchy_invites.accessory_list.items.map(item => {
                            return {
                                label: item,
                                value: item,
                            };
                        });
                    }
                    return [];
                })(),
            },
            orgLogo: response.data.org_logo,
        };
        return data;
    } catch (error) {
        throw error;
    }

};

export async function getConfig(domain) {
    let axios = AxiosSingleton.getInstance();
    try {
        let response = await axios.get(`/auth/getorgpoolconfig?domain=https://${domain}.veris.in`);
        return response.data[0];
    } catch (error) {
        throw error;
    }
}

export async function getMemberships(payload) {
    let axios = AxiosSingleton.getInstance();
    try {
        let response = await axios.get(`/api/v4/get-memberships/?contact=${payload.email}&include_visitor=false&captchaV3=${payload.captchaV3}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function signin(payload) {
    let axios = AxiosSingleton.getInstance();
    try {
        let response = await axios.post(`/auth/signin`, payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function respondToChallenge(payload) {
    let axios = AxiosSingleton.getInstance();
    try {
        let response = await axios.post('/auth/respondtochallenge', payload);
        //   console.log(response);
        let venueprefrence = response.data?.members_meta?.preferences?.portal?.venues?.[0];
        if (venueprefrence) {
            localStorage.setItem('DefaultVenue', venueprefrence);
            console.log(venueprefrence, localStorage.getItem('DefaultVenue'));
        }
        if (response.data?.member_data) {
            localStorage.setItem('member_data', JSON.stringify(response.data?.member_data));
            console.log(venueprefrence, localStorage.getItem('DefaultVenue'));
        }
        return response.data;
    } catch (error) {
        if (error.response.status === 307) {
            let domain = payload.domain.replace('https://', '').replace('.veris.in', '');
            let url = `/login/setPassword?domain=${domain}&d=${error.response.data.d}&f=${error.response.data.f}&t=${error.response.data.t}&x=${error.response.data.x}&error=Password expired, reset password!`;
            window.open(url, '_self');
        } else {
            throw error;
        }
    }
}

export async function forgotPassword(payload) {
    let axios = AxiosSingleton.getInstance();
    try {
        let response = await axios.post('/api/v2/password-reset/', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function setPassword(payload) {
    let axios = AxiosSingleton.getInstance();
    try {
        let response = await axios.post('/api/v2/set-password/', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function confirmForgotPassword(payload) {
    let axios = AxiosSingleton.getInstance();
    try {
        let response = await axios.post('/auth/forgot-password/confirm-password', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
}
