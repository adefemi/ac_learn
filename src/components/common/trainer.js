import React from 'react';
import "../../assets/css/common/course-about.css";
import "../../assets/css/common/trainer-select.css";
import {connect} from 'react-redux';
import {actionWithoutData, setContent} from "../../redux/actions";
import {processError, TimeAgo, updateUserStatus, verifyauth} from "./miscellaneous";
import {notification} from 'antd';
import {bindActionCreators} from 'redux';
import {SiteData} from "../data/siteMain";
import Jwt_decode from "jwt-decode";
import {Icon} from 'antd'
import Spinner from '../loaders/spinner1'
import ContentNotFound from "../shared/contentNotFound";

class ChooseTrainer extends React.Component{
    state = {
        isFetching: true,
        users: null,
        isStaff: null,
        userCourse: null,
        course: null,
        courseReg: null,
    };
    componentDidMount() {
        window.scrollTo(0, 0);
        updateUserStatus();
        if(!verifyauth()){
            this.props.history.push('sign-in')
        }
        else{
            if(this.props.users === null){
                this.getUsers();
            }
            else{
                this.verifyStaffUser(this.props.users)
            }
            if(this.props.course === null){
                this.getCourse();
            }
            else{
                this.setState({course: this.props.course})
            }
            if(this.props.course_registered === null){
                this.getCourseReg();
            }
            else{
                this.setState({courseReg: this.props.course_registered})
            }
        }
    }

    verifyStaffUser([...data]){
        const auth = localStorage.getItem(SiteData.name+"-user");
        let authUser = JSON.parse(auth);
        let auth_id = Jwt_decode(authUser.access).id;
        let staffUser = data.filter(o => parseInt(o.id) === parseInt(auth_id) && parseInt(o.is_staff) === 1);
        if(staffUser.length > 0){
            let users = data.filter(o => parseInt(o.is_superuser) !== 1 && o.id !== staffUser[0].id);
            this.setState({users: users, isStaff: staffUser[0], isFetching:false});
        }
        else{
            notification.error({
                message: "Invalid Session",
                description: "Page can only be accessed by staffs"
            });
            setTimeout(() => {
                this.props.history.push('/')
            }, 2000)
        }
    }

    setCourse(userId, userUUID){
        let courseReg = [...this.state.courseReg];
        let course = [...this.state.course];
        let array = [];
        courseReg = courseReg.filter(o => o.userID === userId);
        if(courseReg.length < 1){
            array.push(
                <li>No course registered yet!</li>
            )
        }
        else{
            courseReg.map((o,i) => {
                let activeCourse = course.filter(a => a.id === o.courseID)[0];
                return array.push(
                    <li key={i} onClick={() => this.verifyAuth(userUUID, activeCourse.uuid)}>{activeCourse.title}</li>
                )
            })
        }
        return array;
    }

    getUsers(){
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.user).then(
            res => {
                this.verifyStaffUser(res.data);
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

    getTrainers(){
        let trainers = [...this.state.users];
        let array = [];

        trainers.map((o,i) => (
            array.push(
                <div key={i} className={'trainer-card'} data-aos="fade-up">
                    <div className={'avatar'}>
                        <img src="http://localhost/images/Geek.PNG" alt={o.username}/>
                    </div>
                    <div className={'description'}>
                        <li>{o.username}</li>
                        <li>was last seen {TimeAgo(o.last_login)}</li>
                    </div>
                    <button onClick={() => this.setState({userCourse: o.uuid})}>
                        Select Student
                    </button>
                    {
                        this.state.userCourse === o.uuid ?
                            <div className={'registeredCourse'} >
                                <button onClick={() => this.setState({userCourse: null})}> <Icon type={'close'}/> </button>
                                {this.setCourse(o.id, o.uuid)}
                            </div>:
                            null
                    }
                </div>
            )
        ));

        return array;
    }

    getCourse(){
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.course).then(
            res => {
                this.setState({course: res.data});
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
    }
    getCourseReg(){
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.courseRegister).then(
            res => {
                this.setState({courseReg: res.data});
                setContent("SET_COURSE_REGISTER_CONTENT", res.data);
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

    verifyAuth(user,course){
        this.props.history.push('/training-ground?course='+course+'&trainer='+user);
    }

    render = ({users, isStaff, course, courseReg} = this.state ) => (

        <div className={'course'}>
            {
                users === null || isStaff === null || course === null || courseReg === null ? <Spinner/>:
                    users.length < 1 ? <ContentNotFound content={"No Student is available at this moment. You can check back later."} />:
                    <div>
                        <div className={'course-title'}>
                            View Available Students
                        </div>
                        <div className={'divider-small'}> </div>
                        <div>
                            <div className={'trainer-list'}>
                                {this.getTrainers()}
                            </div>

                            <div className={'get-started-container'}>
                                {/*<Link to={'/training-ground?course='+activeCourse.uuid} className={'course-button'}>Start Tutorial</Link>*/}
                                <a onClick={e => {e.preventDefault(); this.props.history.goBack()}} href={'/'} className={'course-back-button'}>Back</a>
                            </div>
                        </div>
                    </div>
            }



        </div>
    )
}

const mapStateToProps = (state) => (
    {course: state.course, backEndLinks: state.backEndLinks, users: state.user, course_registered: state.course_register}
);
function mapDispatchToProps(dispatch){
    return bindActionCreators({
        actionWithoutData: actionWithoutData, setContent: setContent
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseTrainer);

