import axios from 'axios';
axios.defaults.timeout = 8000;

export function actionWithData(type, url, payload){
    let header = {};
    if(type.toLowerCase() === "put" ){
        type = "post";
        header = {
            "X-HTTP-Method-Override": "PUT"
        };
    }
    return dispatch => {
        return axios({
            method: type,
            url: url,
            data: payload,
            headers: header,
        })
    }
}

export function actionWithoutData(type, url){
    return dispatch => {
        return axios({
            method: type,
            url: url,
        })
    }
}

export function authorizeWithoutData(type, url, token){
    return dispatch => {
        return axios({
            method: type,
            url: url,
            headers: {Authorization:`Bearer ${token}`},
        })
    }
}

export function authorizeWithData(type, url, payload, token){
    let header = {
        Authorization:`Bearer ${token}`
    };
    if(type.toLowerCase() === "put" ){
        type = "post";
        header = {
            Authorization:`Bearer ${token}`,
            "X-HTTP-Method-Override": "PUT"
        };
    }
    return dispatch => {
        return axios({
            method: type,
            url: url,
            data: payload,
            headers: header
        })
    }
}

export function setContent(type, payload = null){
    return{
        type: type,
        payload: payload
    }
}

