import React from 'react';
import "../../assets/css/common/course-about.css";
import "../../assets/css/common/trainer-select.css";
import {Link} from "react-router-dom";
import {connect} from 'react-redux';
import {actionWithoutData, setContent} from "../../redux/actions";
import {processError, verifyauth, TimeAgo, updateUserStatus} from "./miscellaneous";
import {notification} from 'antd';
import {bindActionCreators} from 'redux';
import qs from 'query-string';
import _ from 'lodash'
import Spinner from "../loaders/spinner1";
import ContentNotFound from "../shared/contentNotFound";

class ChooseTrainer extends React.Component{
    state = {
        isFetching: true,
        users: null,
    };
    componentDidMount() {
        window.scrollTo(0, 0);
        updateUserStatus();
        if(!this.verifyIfCourseSelected()) return;
        if(this.props.users === null){
            this.getUsers();
        }
        else{
            this.verifyStaffUser(this.props.users)
        }
    }

    verifyIfCourseSelected(){
        const parsed = qs.parse(this.props.history.location.search);
        if(!_.has(parsed, 'course')){
            notification.error({
                message: "Invalid Request",
                description: "You must select a course first"
            });
            setTimeout(() => this.props.history.push('course'), 1000);
            return false;
        }
        return parsed.course;
    }

    verifyStaffUser(data){
        let staffUser = data.filter(o => parseInt(o.is_staff) === 1 && parseInt(o.is_superuser) !== 1);
        this.setState({users: staffUser, isFetching:false});
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

        trainers.map(o => (
            array.push(
                <div key={o.uuid} className={'trainer-card'} data-aos="fade-up">
                    <div className={'avatar'}>
                        <img src="http://localhost/images/Geek.PNG" alt={o.username}/>
                    </div>
                    <div className={'description'}>
                        <li>{o.username}</li>
                        <li>Software Developer</li>
                        <li>was last seen {TimeAgo(o.last_login)}</li>
                    </div>
                    <button onClick={() => this.verifyAuth(o.uuid)}>
                        Select Trainer
                    </button>
                </div>
            )
        ));

        return array;
    }

    verifyAuth(data){
        const course = this.verifyIfCourseSelected();
        if(!verifyauth()) {
            this.props.history.push('/sign-in?course='+course+'&trainer='+data);
        }
        else{
            this.props.history.push('/training-ground?course='+course+'&trainer='+data);
        }
    }

    render = ({users} = this.state ) => (
        <div className={'course'}>
            <div className={'course-title'}>
                Choose A Trainer...
            </div>
            <div className={'divider-small'}> </div>
            {
                users === null ? <Spinner/>:
                    users.length < 1 ? <ContentNotFound content={"No trainer is available at this moment. You can check back later."} />:
                        <div>
                            <div className={'trainer-list'}>
                                {this.getTrainers()}
                            </div>

                            <div className={'get-started-container'}>
                                {/*<Link to={'/training-ground?course='+activeCourse.uuid} className={'course-button'}>Start Tutorial</Link>*/}
                                <Link to={'/course'} className={'course-back-button'}>Back</Link>
                            </div>
                        </div>
            }

        </div>
    )
}

const mapStateToProps = (state) => (
    {course: state.course, backEndLinks: state.backEndLinks, users: state.user}
);
function mapDispatchToProps(dispatch){
    return bindActionCreators({
        actionWithoutData: actionWithoutData, setContent: setContent
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseTrainer);

