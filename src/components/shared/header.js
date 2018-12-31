import React from 'react';
import {Link} from 'react-router-dom'
import {Dropdown, Icon, Badge, notification} from 'antd';
import {SiteData} from "../data/siteMain";
import {actionWithoutData, setContent, actionWithData} from "../../redux/actions";
import {connect} from 'react-redux';

//import stylesheet
import '../../assets/css/shared/header.css'
import {processError, verifyauth} from "../common/miscellaneous";
import {bindActionCreators} from "redux";
import Jwt_decode from "jwt-decode";
import {signOut} from "../common/miscellaneous";


class Header extends React.Component{
    state = {
        authenticated: false, isSigningOut: false, activeMessages: null, course: null, activeNotifications: null,
        count: 0,
    };
    componentDidMount(){
        if(verifyauth()) {
            this.setState({authenticated: true});
            this.getContent();
        }
    }
    getContent(){
        const {user, course} = this.props;
        user === null ? this.getUsers() : this.setActiveUser(user);
        course !== null ? this.setState({course:course}) : this.getCourse();
    }

    getUsers(){
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.user).then(
         res => {
             setContent("SET_USER_CONTENT", res.data);
             this.setActiveUser(res.data);
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

    getCourse(){
         const {backEndLinks, setContent} = this.props;
         this.props.actionWithoutData('get', backEndLinks.course).then(
             res => {
                 setContent("SET_COURSE_CONTENT", res.data);
                 this.setState({course:res.data})
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

    setActiveUser(data){
        let auth = localStorage.getItem(SiteData.name+"-user");
        let user_id = Jwt_decode(JSON.parse(auth).access).id;
        let activeUser = data.filter(o => o.id === user_id)[0];
        this.getNotification(activeUser);
        this.getMessage(activeUser);

    }

     getNotification(data){
         const {backEndLinks, setContent} = this.props;
         this.props.actionWithoutData('get', backEndLinks.courseNotification).then(
             res => {
                 setContent("SET_COURSE_NOTIFICATION_CONTENT", res.data);
                 this.setActiveNotification(data, res.data);
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
     setActiveNotification(activeUser, data){
        let activeNotification = data.filter(o => o.userID === activeUser.id && o.type==="notification");
        let count = this.state.count + activeNotification.length;
        this.setState({count:count, activeNotifications:activeNotification});
     }
     getMessage(data){
         const {backEndLinks, setContent} = this.props;
         this.props.actionWithoutData('get', backEndLinks.message).then(
             res => {
                 setContent("SET_MESSAGE_CONTENT", res.data);
                 this.setActiveMessage(data, res.data);
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
     setActiveMessage(activeUser, data){
         let activeMessage = data.filter(o => o.receiver_id === activeUser.id && o.seen === "0");
         let count = this.state.count + activeMessage.length;
         this.setState({count:count, activeMessages:activeMessage});
     }

    signOut = () => {
        this.setState({isSigningOut: true});
        signOut();
    };

    getNotificationList(data){
        let list = [...data.activeNotifications];
        let array = [];

        list.map((o,i) => {
            let activeCourse = [...this.state.course].filter(j => j.id === o.courseID)[0];
            return array.push(
                <Link key={"not" + i} to={'/course/trainer?course=' + activeCourse.uuid}>
                    <li>
                        <span dangerouslySetInnerHTML={{__html: o.notification}}/>
                    </li>
                </Link>
            )
        });
        return array
    }

     getMessageList(data){
         let list = [...data.activeMessages];
         let course = [...data.course];
         let array = [];

         course.map((o,i) => {
             let messagePercCourse = list.filter(d => d.course_id === o.id);
             if(messagePercCourse.length > 0){
                 let trainer = [...this.props.user].filter(p => p.id === messagePercCourse[0].sender_id)[0];
                return  array.push(
                    <a href={'/training-ground?course='+o.uuid+'&trainer='+trainer.uuid} key={"not"+i}>
                        You have pending message "{o.title}" <Badge count={messagePercCourse.length} showZero />
                    </a>
                )
             }
             else return array
         });
         return array
     }
    menu = (data) => (
        <div className={'menuContainer'}>
            {this.getNotificationList(data)}
            {this.getMessageList(data)}
        </div>
    );
    render = ({count,authenticated,activeMessages,activeNotifications, course} = this.state) => (
        <div className={'header-main'}>
            <div className={'header-inner'}>
                <div className={'header-brand'}><Link to={'/'}>AC-Learn</Link></div>
                {
                    this.state.authenticated ? <div className={'header-right'}>
                            {
                                authenticated && activeMessages !== null && activeNotifications !== null && course !== null ?
                                    <Dropdown overlay={this.menu(this.state)} trigger={['click']} placement="bottomCenter">
                                        <button className="ant-dropdown-link" href="#">
                                            {
                                                count < 1 ?
                                                    <Icon type="bell" />:
                                                    <Badge count={count} showZero><Icon type="bell" /></Badge>
                                            }

                                        </button>
                                    </Dropdown>
                                    : null
                            }
                            <div className={'header-right'}>
                                {
                                    this.state.isSigningOut ? <a onClick={e => e.preventDefault()} href='/#'><Icon type={'loading'}/>&nbsp;Sign out</a> :
                                        <a onClick={e => {e.preventDefault(); this.signOut()}}  href='/#'>Sign out</a>
                                }
                                <Link to={'/trainer'}>Trainer</Link>
                            </div>

                        </div>:
                        <div className={'header-right'}>
                            <a href={'/sign-in'}>Sign in</a>
                            <Link to={'/trainer'}>Trainer</Link>
                        </div>

                }

            </div>
        </div>
    )
}

const mapStateToProps = (state) => (
    {course_notification: state.course_notification, course: state.course,  message : state.message, user: state.user, backEndLinks: state.backEndLinks}
);
function mapDispatchToProps(dispatch){
    return bindActionCreators({
        actionWithoutData: actionWithoutData, setContent: setContent, actionWithData: actionWithData
    }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(Header)