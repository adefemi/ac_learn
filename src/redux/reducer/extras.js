const Production = 'https://server.adefemiconsult.com/api/';
// const Development = 'http://localhost:9000/api/';
export const serverHost = Production;
export const SocketServer = "ac-socket.herokuapp.com/";
export function backEndLinks() {
    return{
        auth: serverHost+'auth/',
        refresh: serverHost+'auth/refresh/',
        user: serverHost+'user/',
        course: serverHost+'course/',
        courseNotification: serverHost+'course/notification/',
        courseRegister: serverHost+'course/register/',
        message: serverHost+'message-board/',
        settingSocial: serverHost+'page-setting/socials',
        settingContact: serverHost+'page-setting/contact',
    }
}
