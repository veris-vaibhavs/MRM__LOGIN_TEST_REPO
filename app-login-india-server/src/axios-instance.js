import axios from 'axios';

class Singleton {

    static instance;
    static accessToken;
    static idToken;
    static poolId;
    static orgId;
    static config = {
        idToken: 'eyJraWQiOiJqRUNHWG5jYzJVU1dnenV1dE45ODYxMnRsTjZXNlY4MjhjM1hobUNTZktJPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIwOTUyY2NhOS1iMmNmLTQ5NGEtOTYxNS00NzgwOWM3Y2JmMzAiLCJhdWQiOiI3aG82MGJpdGkxOGRrZjRidWQ4cGN0a2Y5YyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6ImE1YjAzMjdkLWMyNTAtNGFkYy05NDVmLWJlZWU3ZWVjZDFmYiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNTkyNDY3MDU3LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtd2VzdC0yLmFtYXpvbmF3cy5jb21cL3VzLXdlc3QtMl9ZOVJaZmM4Y3IiLCJuYW1lIjoic2hhaWxlbmRyYSBrdW1hciB0aXJhbmdhIiwiY29nbml0bzp1c2VybmFtZSI6InNoYWlsZW5kcmEtdGlyYW5nYS12ZXJpcy1pbiIsImV4cCI6MTU5MjQ3MjUxMiwiaWF0IjoxNTkyNDY4OTEyLCJlbWFpbCI6InNoYWlsZW5kcmEudGlyYW5nYUB2ZXJpcy5pbiJ9.DBpXK-S_5lX-1_Ck7XCsUtnBtb4bto0qWCfXI-O0X-CX87nZkC-hxj9eGzh_YAeIroorh1rlsWRCa6M0Et6PsBrydDhIUi7K19ZCA0VROsxOP5HkTvwSif9E-Lw5ruuk9Jmt4kkbepL0RAdvLVGG2ug7lDgHUMavqWTOWLuh6qMRrEuVAFkTE4bFzojHyudb9DkEGBlBoYBysVVDjnwRfkbRo_CRqbpUGfr-oIwFsNL3pNttR_-U8na2pkgo3vmGTQBeG_iv-kScIDzwQd-QpYPYNessNJQnyLfWXJx1KTgEyuW3zcYHjdZqqZQT5z74TZ5ssUUmNk-OGTQ9T3eHYw', //Set id token here for development environment
        accessToken: 'eyJraWQiOiJOUTRcLzI3Nk9RMEpLcmR1bjlMT3JEUEJPbTU1VElTV2YwK1A1VHFQS1lJdz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NzQ5NGJhYS01NzczLTQyMWYtYWVlYi03NzFiYjg0NTM4ODYiLCJldmVudF9pZCI6IjNlYWFlNTUxLTYyMjMtNDJhYy1iMTU5LTkwMmMxMzE3Yjg3YiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE2MTcxODEyMDEsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yX1k5UlpmYzhjciIsImV4cCI6MTYxNzI2NzYwMSwiaWF0IjoxNjE3MTgxMjAxLCJqdGkiOiIxNDEzZTUyMC01NWM1LTRkNWQtYjA5Yy1jMWEyNjRhMjk5OTYiLCJjbGllbnRfaWQiOiI2YmVub3M1N211bHAxbW1kb3A0aWplMHB1dCIsInVzZXJuYW1lIjoiYXl1c2gtY2hhbmRlbC12ZXJpcy1pbiJ9.iGA_l11QFQIQj7q7sn62tP7a8DWUds052dpAp7MpJwRGVLcGL7qsNYx_GFVL5Q1W9mbFgOCZMtDTzmXnk5NR8uyilPP3x8IhbgwK74hAx4u8QjynyNDI9kN-IZ-Rkd1mSkombUY5xYHpGiF6WqYqfZtSPq7pQPSPYnRR-Av5Q2-hQFZwknOLTFJRmp-kjdFB1p_WXDtO-E4DuP37ojUWLWwhcmjrFBH2a4kI4r9lR90dutUaHVTZ9-AvEKMa3fKgwT5kC14z0afxPHRNjLxalSxUyhZHQHQkbnY2ACTX-Hvb6xa5NTQmtcQPrDQP4sHvSJ5yF3-h9AQMIAbiCsfNMA',
        poolId: 30, //Set pool id here for development environment
        orgId: 56, //Set orgId here for development environment
        roles: ['can enter', 'Venue Admin', 'can invite', 'Organisation Admin'],
    };
    static getAccessToken = (token) => {
        Singleton.token = token;
    };
    static getAccessToken = (token) => {
        return Singleton.token;
    };

    static setOrgId = (orgId) => {
        Singleton.orgId = orgId;
    };
    static getOrgId = () => {
        return Singleton.orgId;
    };

    static setPoolId = (id) => {
        Singleton.poolId = id;
    };
    static getPoolId = () => {
        return Singleton.poolId;
    };


    static setInstance = (instance) => {
        Singleton.instance = instance;
    };
    static getInstance = () => {
        if (Singleton.instance) {
            return Singleton.instance;
        } else {
            Singleton.instance = axios.create();
            Singleton.instance.interceptors.request.use((config) => {
                return config;
            }, (error) => {
                return Promise.reject(error);
            });

            Singleton.instance.interceptors.response.use(response => {
                return response;
            }, (error) => {
                throw error;
            });
        }
        return Singleton.instance;
    };
}


export default Singleton;