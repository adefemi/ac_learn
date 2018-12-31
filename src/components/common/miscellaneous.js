import React from 'react';
import axios from 'axios';
import {notification} from 'antd';
import Jwt_decode from 'jwt-decode'
import {SiteData} from '../data/siteMain';
import JavascriptTimeAgo from 'javascript-time-ago'
import ReactTimeAgo from 'react-time-ago'
import {backEndLinks} from "../../redux/reducer/extras";

// The desired locales.
import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'

// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
JavascriptTimeAgo.locale(ru);

export function signOut() {
    localStorage.removeItem(SiteData.name+'-user');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000)
};

export function processError(err, refresh){
    if(err.message === "Network Error"){
       return {type: 1, content:"Network Error"};
    }
    else {
        console.log(err);
        if(err.code === 'ECONNABORTED'){
            return {type: 2, content:"Connection timeout"};
        }
        else if(err.response.status === 403){
            notification.warning({
                message: "Session Expiration",
                description: "Your session as expired. You need to login again."
            })
        }
        else if(err.response.statusText === "Unauthorized"){
            let newaccess = resetToken(refresh);
            return {type: 3, content:newaccess};
        }
        else{
            let errorcontent = '';
            Object.entries(err.response.data).forEach(
                ([key, value]) => {
                    errorcontent+=key+" * "+value+"<br>"
                }
            );

            return {type: 4, content:errorcontent};
        }
    }
}

export function resetToken(url) {
    let refreshUrl = url;
    let Token = JSON.parse(localStorage.getItem(SiteData.name+"-user"));
    let payload = new FormData();
    payload.append("refresh",Token.refresh);

    axios({
        method: "post",
        url: refreshUrl,
        data: payload
    }).then(
        (res) => {
            Token.access = res.data.access;
            localStorage.setItem(SiteData.name+"-user", JSON.stringify(Token));
            return res.data.access;
        },
        (err) => console.log(err.response)
    );

}

export function verifyauth() {
    let auth = localStorage.getItem(SiteData.name+"-user");

    if(auth !== null){
        let data = JSON.parse(auth);
        let exp = Jwt_decode(data.refresh).exp;
        let currentTime = Math.floor(Date.now() / 1000);
        if(currentTime > exp){
            localStorage.removeItem(SiteData.name+"-user");
            return false
        }
        else{
            return true
        }

    }
    else{
        return false
    }
}

export function updateUserStatus(access = null){
    if(verifyauth()){
        let auth = localStorage.getItem(SiteData.name+"-user");
        let data = JSON.parse(auth);
        let user_id = Jwt_decode(data.access).id;
        let url = backEndLinks().user +user_id;
        let currentTimeStamp = Math.floor(Date.now() / 1000);
        let payload = new FormData();
        payload.append("last_login", currentTimeStamp.toString());
        let accessToken = access;
        if(access === null){
            accessToken = data.access;
        }
        let header = {
            Authorization:`Bearer ${accessToken}`
        };
        axios({
            method: 'put',
            url: url,
            data: payload,
            headers: header,
        }).then().catch(
            err => {
                let error = processError(err, backEndLinks().refresh);
                error.type === 3 ? updateUserStatus(error.content) : console.log(error.content);
            }
        )
    }
}

export function TimeAgo(timestamp) {
    return(
        <ReactTimeAgo locale="en">
            {(timestamp*1000)}
        </ReactTimeAgo>
    )
}
