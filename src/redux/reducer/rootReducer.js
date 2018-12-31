import {combineReducers} from 'redux'

//import reducers
import {backEndLinks} from './extras';
import {setAdminActive, setUserContent, setCourseContent, setMessageContent,
    setCourseNotificationContent, setCourseRegisterContent, setSettingContactActive, setSettingSocialActive} from './contentReducer';


const ReducerAll = combineReducers({
    backEndLinks : backEndLinks,
    userStatus : setAdminActive,
    user : setUserContent,
    course: setCourseContent,
    course_notification: setCourseNotificationContent,
    course_register: setCourseRegisterContent,
    message: setMessageContent,
    settingContact: setSettingContactActive,
    settingSocial: setSettingSocialActive
});

export default ReducerAll