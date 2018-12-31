import React from 'react';
import "../../assets/css/common/course.css";
import {connect} from 'react-redux';
import {actionWithoutData, setContent} from "../../redux/actions";
import {processError, TimeAgo, updateUserStatus, verifyauth} from "./miscellaneous";
import {notification, Icon} from 'antd';
import {bindActionCreators} from 'redux';
import {SiteData} from "../data/siteMain";
import Jwt_decode from "jwt-decode";
import Spinner from '../loaders/spinner1'
import ContentNotFound from "../shared/contentNotFound";

class Course extends React.Component{
    state = {
        isFetching: true,
        course: null,
        isAuth: null,
        courseReg: null,
        users: null,
    };
    componentDidMount = () => {
        window.scrollTo(0, 0);
        updateUserStatus();
        if(this.props.course === null){
            this.getCourse();
        }
        else{
            this.setState({course: this.props.course,isFetching: false});
        }

        if(verifyauth()){
            this.setState({isAuth: true})
        }
        else{
            this.setState({isAuth: false})
        }

        if(this.props.course_register === null){
            this.getCourseReg();
        }
        else{
            this.setState({courseReg: this.props.course_register})
        }
        if(this.props.users === null){
            this.getUsers();
        }
        else{
            this.setState({users: this.props.users})
        }
    };

    getCourseReg = () => {
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.courseRegister).then(
            res => {
                setContent("SET_COURSE_REGISTER_CONTENT", res.data);
                this.setState({courseReg: res.data})
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

    getCourse = () => {
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.course).then(
            res => {
                this.setState({course: res.data, isFetching: false});
                setContent("SET_COURSE_CONTENT", res.data);
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
    };

    getUsers = () => {
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.user).then(
            res => {
                this.setState({users: res.data});
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
    };

    checkRegistered = (course) => {
        let activeUser = this.getActiveUser();
        let reg = [...this.state.courseReg].filter(o => o.courseID === course.id && o.userID === activeUser.id);
        if(reg.length < 1){
            return <button onClick={() => this.props.history.push('/course/'+course.slug)}>View Course <Icon type="right-circle" /></button>
        }
        else{
            return <button onClick={() => this.props.history.push('/course/trainer?course='+course.uuid)}>Continue Course <Icon type="right-circle" /></button>;
        }


    };

    getActiveUser(){
        let auth = localStorage.getItem(SiteData.name+"-user");
        let data = JSON.parse(auth);
        let user_id = Jwt_decode(data.access).id;
        return [...this.state.users].filter(o => o.id === user_id)[0];
    }

    render(){
        const {isFetching, course, isAuth, courseReg, users} = this.state;
        return(
            <div className={'course'}>
                {
                    isFetching || course === null ? <Spinner/> :
                        course.length < 1 ? <ContentNotFound content={"No course is available at this time, you can check back later."} /> :
                        <div>
                            <div className={'course-title'}>
                                Courses...
                            </div>
                            <div className={'divider-small'}> </div>
                            <div className={'course-content'}>
                                {
                                   course.map(o => (
                                       <div key={o.uuid} className={'course-card'} data-aos="fade-up">
                                           <div className={'image-con'} style={{backgroundImage:"url('"+o.coverpic+"')"}} />
                                           <div className={'course-info'}>
                                               <div className={'title'}>{o.title}</div>
                                               <div className={'sub-section'}>
                                                   {
                                                       isAuth === null || courseReg === null || users === null ? <Icon type={'loading'}/> :
                                                           !isAuth ? <button onClick={() => this.props.history.push('/course/'+o.slug)}>View Course <Icon type="right-circle" /></button> :
                                                               this.checkRegistered(o)
                                                   }
                                                   <div className={'time'}>{TimeAgo(o.updated_on)}</div>
                                               </div>
                                           </div>
                                       </div>
                                   ))
                                }

                            </div>
                        </div>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => (
    {course: state.course, backEndLinks: state.backEndLinks, course_register: state.course_register, users: state.user}
);
function mapDispatchToProps(dispatch){
    return bindActionCreators({
        actionWithoutData: actionWithoutData, setContent: setContent
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Course);

