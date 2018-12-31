import React from 'react';
import CkeControl from '../common/ckeTest';
import {notification, Icon} from 'antd'
import {SocketServer} from "../../redux/reducer/extras";
import {connect} from 'react-redux';
import {actionWithoutData, setContent, actionWithData, authorizeWithData} from "../../redux/actions";
import {verifyauth, TimeAgo, processError, updateUserStatus} from "../common/miscellaneous";
import {bindActionCreators} from 'redux';
import proptype from 'prop-types';
import qs from 'query-string';
import _ from 'lodash'
import {SiteData} from "../data/siteMain";
import jwt from "jwt-decode";
import 'animate.css';
import Spinner from "../loaders/spinner1";
import ContentNotFound from '../shared/contentNotFound'

//Defining socket server
let ws = null;

class TrainingView extends React.Component{
    state = {
        messageText: "", typing: false, userID: null, isTyping: false, typingUser: "", userData:"",
        activeCourse: null, course: null, activeNotifications: null, activeMessages: null, users: null,
        trainer: null, socket: null,
    };

    componentDidMount(){
        window.scrollTo(0, 0);
        updateUserStatus();
        this.verifyContent();
    }

    getCourse(){
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.course).then(
            res => {
                this.setState({course: res.data});
                setContent("SET_COURSE_CONTENT", res.data);
                this.getActiveCourse(res.data);
            }
        ).catch(
            err => {
                let error = processError(err, backEndLinks.refresh);
                notification['error']({
                    message: 'Error',
                    description: error.content,
                });
            }
        )
    }

    getUsers(){
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.user).then(
            res => {
                this.setState({users: res.data});
                this.getTrainer(res.data);
                setContent("SET_USER_CONTENT", res.data);
            }
        ).catch(
            err => {
                let error = processError(err, backEndLinks.refresh);
                notification['error']({
                    message: 'Error',
                    description: error.content,
                });
            }
        )
    }

    getActiveCourse(course){
        const parsed = qs.parse(this.props.history.location.search);
        let activeCourse = course.filter(o => o.uuid === parsed.course);
        if(activeCourse.length > 0){
            this.state.activeCourse = activeCourse[0];
            this.setState({activeCourse: activeCourse[0]});
            this.checkRegisteredCourse();

            if(this.props.course_notification === null){
                this.getCourseNotification();
            }
            else{
                this.getActiveCourseNotification(this.props.course_notification);
            }

            if(this.props.message === null){
                this.getMessageContents();
            }
            else{
                this.getActiveMessage(this.props.message);
            }
        }
        else{
            this.setState({activeCourse: false})
        }

    }

    getCourseNotification(){
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.courseNotification).then(
            res => {
                setContent("SET_COURSE_NOTIFICATION_CONTENT", res.data);
                this.getActiveCourseNotification(res.data);
            }
        ).catch(
            err => {
                let error = processError(err, backEndLinks.refresh);
                notification['error']({
                    message: 'Error',
                    description: error.content,
                });
            }
        )
    }

    getMessageContents(){
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.message).then(
            res => {
                setContent("SET_MESSAGE_CONTENT", res.data);
                this.getActiveMessage(res.data);
            }
        ).catch(
            err => {
                let error = processError(err, backEndLinks.refresh);
                notification['error']({
                    message: 'Error',
                    description: error.content,
                });
            }
        )
    }

    getActiveCourseNotification(data){
        const {activeCourse} = this.state;
        if(activeCourse === null || !activeCourse) return;
        let activeNotifications = data.filter(o => o.courseID === activeCourse.id && o.type === "message");
        if(activeNotifications.length > 0){
            this.setState({activeNotifications: activeNotifications});
        }
        else{
            this.setState({activeNotifications: false});
        }
    }

    getActiveMessage(data){
        const {activeCourse} = this.state;
        if(activeCourse === null || !activeCourse) return;
        let activeMessages = data.filter(o => o.course_id === activeCourse.id);
        if(activeMessages.length > 0){
            this.setState({activeMessages: activeMessages});
        }
        else{
            this.setState({activeMessages: []});
        }
    }

    verifyContent(){
        const parsed = qs.parse(this.props.history.location.search);
        if(!verifyauth()) {
            this.props.history.push('/sign-in?course='+parsed.course);
        }
        else if(_.isEmpty(parsed)){
            this.props.history.push('/course');
        }
        else if(!_.has(parsed, 'course')){
            this.props.history.push('/course');
        }
        else if(!_.has(parsed, 'trainer')){
            notification.error({
                message: "Session is Invalid.",
                description: "You need to select a trainer first"
            });
            this.props.history.push('/course/trainer?course='+parsed.course);
        }
        else{
            this.checkRegisteredCourse();
            if(this.props.userStatus !== null){
                this.setUserData(this.props.userStatus);
            }
            else{
                this.setActive();
            }
            if(this.props.course === null){
                this.getCourse();
            }
            else{
                this.getActiveCourse(this.props.course);
                this.setState({course: this.props.course});
            }
            if(this.props.user === null){
                this.getUsers();
            }
            else{
                this.getTrainer(this.props.user);
                this.setState({users: this.props.user});
            }
            ws = new WebSocket("wss://"+SocketServer);
            this.setUpSocket();
        }
    }

    checkRegisteredCourse(){
        if(this.state.activeCourse === null || this.state.userData ===null) return;
        if(this.props.course_registered === null){
            this.props.actionWithoutData('get',this.props.backEndLinks.courseRegister).then(
                res => this.registerCourse(res.data)
            )
        }
        else{
            this.registerCourse(this.props.course_registered)
        }
    }

    registerCourse(data){
        if(this.state.userData.is_staff === "1") return;
        let course_reg = [...data];
        let if_reg = course_reg.filter(o => o.courseID === this.state.activeCourse.id && o.userID === this.state.userData.id);
        if(if_reg.length < 1){
            let payload = new FormData();
            payload.append('courseID', this.state.activeCourse.id);
            payload.append('userID', this.state.userData.id);
            this.props.actionWithData('post',this.props.backEndLinks.courseRegister, payload).then(
                res => {
                    if(this.props.course_registered === null){
                        this.props.setContent('SET_COURSE_REGISTER_CONTENT', [res.data]);
                    }
                    else{
                        this.props.course_registered.push(res.data);
                        this.props.setContent('SET_COURSE_REGISTER_CONTENT', this.props.course_registered);
                    }
                    notification.success({
                        message: "Success",
                        description: "You have successfully registered for this course."
                    })
                },
                err => {
                    notification.error({
                        message: "Error",
                        description: "We unable to register you for this course. Please check your network and try again."
                    })
                }
            );

            const statement = "You have registered for course titled: "+this.state.activeCourse.title+" Interact with trainers to proceed with studies";
            payload.append('notification', statement);
            payload.append('type', "notification");

            this.props.actionWithData('post', this.props.backEndLinks.courseNotification, payload).then(
                res => {
                    if(this.props.course_notification === null){
                        this.props.setContent('SET_COURSE_NOTIFICATION_CONTENT', [res.data]);
                    }
                    else{
                        this.props.course_notification.push(res.data);
                        this.props.setContent('SET_COURSE_NOTIFICATION_CONTENT', this.props.course_notification);
                    }
                    notification.success({
                        message: "Success",
                        description: "Your notification reminder has been set"
                    })
                },
                err => {
                    notification.error({
                        message: "Error",
                        description: "We unable to set a notification reminder for this course. Please check your network and try again."
                    })
                }
            )
        }
    }

    getTrainer(data){
        const parsed = qs.parse(this.props.history.location.search);
        let activeTrainer = [...data].filter(o => o.uuid === parsed.trainer);
        if(activeTrainer.length < 1){
            notification.error({
                message: "Invalid Trainer",
                description: "Cannot find a trainer with this identification data."
            });
            setTimeout(() => {this.props.history.push('/course/trainer?course='+parsed.course);}, 1000)
        }
        else{
            this.setState({trainer: activeTrainer[0]});
            const {setTrainer} = this.props;
            setTrainer(activeTrainer[0])
        }
    }

    setActive(){
        let auth = localStorage.getItem(SiteData.name+"-user");
        let data = JSON.parse(auth);
        let parsedData = jwt(data.access);
        let url = this.props.backEndLinks.user + parsedData.id;
        this.props.actionWithoutData('get',url).then(
            (rem) => {
                this.props.setContent("SET_USER_ACTIVE", rem.data);
                this.setUserData(rem.data);
            }
        );
    }

    setUpSocket(){
        ws.onopen = (e) => {
            this.setState({socket: true});
            ws.send(
                JSON.stringify({
                    'type':'socket',
                    'user_id':this.state.userID
                })
            )
        };

        ws.onerror = (e) => {
            notification["error"]({
                message: 'Error',
                description: 'Ops!, unable to establish a secure connection. Check your network and try again.'
            });
            this.setState({socket: false});
        };

        ws.onmessage = (e) => {
            let message = JSON.parse(e.data);
            if(message.type === 'chat'){
                if(message.course_id !== this.state.activeCourse.id) return;
                this.state.activeMessages.push(message);
                this.setState({activeMessages: this.state.activeMessages, isTyping: false});
            }
            else if(message.type === 'typing'){
                if(message.course_id !== this.state.activeCourse.id) return;
                if(message.sender_id === this.state.trainer.id){
                    this.setState({isTyping: true})
                }
            }
            else{
                this.setState({isTyping: false, typingUser: ""});
            }
        }

    }

    sendMessage(type = 'chat'){
        if(this.state.messageText === "" && type === 'chat') return;
        ws.send(
            JSON.stringify({
                'type':type,
                'sender_id': this.props.userStatus.id,
                'course_id': this.state.activeCourse.id,
                'receiver_id': this.state.trainer.id,
                'chat_msg': this.state.messageText,
            })
        );

        if(type === 'chat'){
            this.saveMessages();
            this.setState({messageText: "", typing: false});
        }

    }

    saveMessages(access = null){
        let contents = {
            sender_id: this.props.userStatus.id,
            course_id: this.state.activeCourse.id,
            receiver_id: this.state.trainer.id,
            detail: this.state.messageText,
            timeStamp: Math.floor(Date.now() / 1000)
        };
        let payload = new FormData();
        Object.entries(contents).forEach(
            ([key, value]) => {
                payload.append(key, value)
            }
        );
        let url = this.props.backEndLinks.message;
        let accessToken = access;
        if(access === null){
            accessToken = JSON.parse(localStorage.getItem(SiteData.name+'-user')).access
        }
        this.props.authorizeWithData("post", url, payload, accessToken).then(
        ).catch(
            err => {
                let errorObj = processError(err, this.props.backEndLinks.refresh);
                errorObj.type === 3 ? this.saveMessages(errorObj.content) :
                    notification.error({
                        message:"Error!!!",
                        description:errorObj.content
                    })
            }
        )
    }

    updateMessge(id, access=null){
        let payload = new FormData();
        payload.append("seen", "1");
        let url = this.props.backEndLinks.message+"/"+id;
        let accessToken = access;
        if(access === null){
            accessToken = JSON.parse(localStorage.getItem(SiteData.name+'-user')).access
        }
        this.props.authorizeWithData("put", url, payload, accessToken).then(
        ).catch(
            err => {
                let errorObj = processError(err, this.props.backEndLinks.refresh);
                errorObj.type === 3 ? this.updateMessge(id, errorObj.content) :
                    notification.error({
                        message:"Error!!!",
                        description:errorObj.content
                    })
            }
        )
    }

    onTextChange = (message) => {
        clearTimeout(this.setIsTyping);
        if(!this.state.typing){
            this.sendMessage('typing');
        }
        this.setIsTyping = setTimeout(() => {this.sendMessage('notTyping'); this.setState({typing: false})}, 5000);
        this.setState({messageText : message, typing: true});
    };

    getMessages(){
        let users = [...this.state.users];
        let contentArray = [];
        const {userStatus} = this.props;
        //
        this.state.activeMessages.map( (o, i) => {
            if(o.sender_id === userStatus.id && o.receiver_id === this.state.trainer.id){
               return  contentArray.push(
                   <div key={i} className={ 'message-card user bounceIn'}>
                       <div className={'card-id'}>
                           you <span className={'time'}>{TimeAgo(o.timeStamp)}</span>
                       </div>
                       <div className={'card-message-content'} dangerouslySetInnerHTML={{__html: o.detail}}/>
                   </div>
               )
            }
            else if(o.receiver_id === userStatus.id && o.sender_id === this.state.trainer.id){
                let sender = users.filter(a => a.id === o.sender_id)[0];
                if(o.seen === "0"){
                    this.updateMessge(o.id);
                }
                return contentArray.push(
                    <div key={i} className={ 'message-card admin bounceIn'}>
                        <div className={'card-id'}>
                            {sender.username} <span className={'time'}>{TimeAgo(o.timeStamp)}</span>
                        </div>
                        <div className={'card-message-content'} dangerouslySetInnerHTML={{__html: o.detail}}/>
                    </div>
                )
            }
            else return contentArray
        });

        setTimeout(() => this.updateScroll(), 100);
        //
        return contentArray;
    }

    updateScroll = () => {
        let element = document.getElementById("viewMain");
        element.scrollTop = element.scrollHeight;
    };

    setUserData(data){
        const parsed = qs.parse(this.props.history.location.search);
        if(data.uuid === parsed.trainer){
            notification.error({
                message:"Invalid Session",
                description: "Trainer cannot be the same as trainee."
            });
            this.props.history.goBack();
            return;
        }
        this.state.userData = data;
        this.setState({userData:data, userID: data.username});
        this.checkRegisteredCourse()
    }

    getFetchRequirement(){
        let contentArray = [];

        this.state.activeNotifications.map((o,i) => contentArray.push(
            <div key={i} className={'message-card instruction' }>
                <div className={'card-message-content'} dangerouslySetInnerHTML={{__html: o.notification}}/>
            </div>
        ));

        return contentArray;
    }

    render = ({userID, activeCourse, activeNotifications, activeMessages, users, trainer, socket} = this.state) => (
        <div className={'training-view'}>
            {
                userID === null || activeCourse === null || trainer === null ? <Spinner/> :
                    !activeCourse ? <ContentNotFound content={"The course you're looking for has either been removed or doesn't exist..."} /> :
                        socket === null ? <Spinner/>:
                            !socket ? <ContentNotFound content={" Unable to establish socket connection!!!"} />:
                                <div className={'training-view-inner'}>
                                    <div className={'view-main'} id={'viewMain'}>
                                        {
                                            activeNotifications === null ? <div className={'message-card instruction' }>
                                                    <div className={'card-message-content'} >Getting course requirements...</div>
                                                </div>:
                                                !activeNotifications ?
                                                    <div data-aos="fade-down" className={'message-card instruction' }>
                                                        <div className={'card-message-content'} >
                                                            No requirement found for this course.
                                                        </div>
                                                    </div>:
                                                    this.getFetchRequirement()
                                        }
                                        {activeMessages === null || users === null ?
                                            <div className={'message-card instruction' }>
                                                <div className={'card-message-content'} >Getting recent messages...</div>
                                            </div>: activeMessages.length < 1 ?
                                                <div className={'is-typing user'}>
                                                    No message available
                                                </div>:
                                                this.getMessages()
                                        }
                                        {this.state.isTyping ? <div className={'is-typing admin'}>
                                            {this.state.trainer.username} <span>is typing...</span>
                                        </div>: null}
                                    </div>
                                    <div className={'ckeCover'}>
                                        <CkeControl
                                            onChange={this.onTextChange}
                                            value={this.state.messageText}/>
                                    </div>
                                    <button className={'send-button'} onClick={e => this.sendMessage("chat")}>Send</button>
                                </div>
            }
        </div>
    )
}

TrainingView.propType = {
    history: proptype.object.required,
    setTrainer: proptype.func.required,
};

const mapStateToProps = (state) => (
    {course: state.course, backEndLinks: state.backEndLinks, userStatus: state.userStatus,
        course_notification: state.course_notification, course_registered: state.course_register, message : state.message, user: state.user}
);
function mapDispatchToProps(dispatch){
    return bindActionCreators({
        actionWithoutData: actionWithoutData, setContent: setContent, actionWithData: actionWithData, authorizeWithData: authorizeWithData
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TrainingView);

