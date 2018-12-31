export function setActiveLink(state = "/", action) {
    switch(action.type){
        case "SET_ACTIVE_LINK":
            return action.payload;
        default:
            return state
    }
}

export function setCourseContent(state = null, action) {
    switch(action.type){
        case "SET_COURSE_CONTENT":
            return action.payload;
        default:
            return state
    }
}

export function setCourseNotificationContent(state = null, action) {
    switch(action.type){
        case "SET_COURSE_NOTIFICATION_CONTENT":
            return action.payload;
        default:
            return state
    }
}
export function setCourseRegisterContent(state = null, action) {
    switch(action.type){
        case "SET_COURSE_REGISTER_CONTENT":
            return action.payload;
        default:
            return state
    }
}

export function setMessageContent(state = null, action) {
    switch(action.type){
        case "SET_MESSAGE_CONTENT":
            return action.payload;
        default:
            return state
    }
}

export function setUserContent(state = null, action) {
    switch(action.type){
        case "SET_USER_CONTENT":
            return action.payload;
        default:
            return state
    }
}

export function setAdminActive(state = null, action) {
    switch(action.type){
        case "SET_USER_ACTIVE":
            return action.payload;
        default:
            return state
    }
}

export function setSettingContactActive(state = null, action) {
    switch(action.type){
        case "SET_SETTING_CONTACT_CONTENT":
            return action.payload;
        default:
            return state
    }
}

export function setSettingSocialActive(state = null, action) {
    switch(action.type){
        case "SET_SETTING_SOCIAL_CONTENT":
            return action.payload;
        default:
            return state
    }
}
