import React from 'react';
import "../../assets/css/common/course-about.css";
import {Link} from "react-router-dom";
import {connect} from 'react-redux';
import {actionWithoutData, setContent} from "../../redux/actions";
import {processError, updateUserStatus} from "./miscellaneous";
import {notification} from 'antd';
import {bindActionCreators} from 'redux';
import Spinner from '../loaders/spinner1'
import ContentNotFound from "../shared/contentNotFound";

class CourseAbout extends React.Component{
    state = {
        isFetching: true,
        activeCourse: null,
        course: null,
    };
    componentDidMount() {
        window.scrollTo(0, 0);
        updateUserStatus();
        if(this.props.course === null){
            this.getCourse();
        }
        else{
            this.getActiveCourse(this.props.course);
            this.setState({course: this.props.course,isFetching: false});
        }
    }

    getCourse(){
        const {backEndLinks, setContent} = this.props;
        this.props.actionWithoutData('get', backEndLinks.course).then(
            res => {
                this.setState({course: res.data, isFetching:false});
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
    getActiveCourse(course){
        let slug = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
        let activeCourse = course.filter(o => o.slug === slug);
        activeCourse.length > 0 ? this.setState({activeCourse: activeCourse[0]}) : this.setState({activeCourse: false});
    }

    render = ({activeCourse} = this.state) => (
        <div className={'course'}>
            {
                activeCourse === null ? <Spinner/> :
                    !activeCourse ? <ContentNotFound content={"Course cannot be found!!!"} />:
                        <div>
                            <div className={'course-title'}>
                                {activeCourse.title}
                            </div>
                            <div className={'divider-small'}> </div>
                            <div className={'course-details'} dangerouslySetInnerHTML={{__html: activeCourse.detail}} />

                            <div className={'get-started-container'}>
                                <Link to={'./trainer?course='+activeCourse.uuid} className={'course-button'}>Choose Trainer</Link>
                                <Link to={'/course'} className={'course-back-button'}>Back</Link>
                            </div>
                        </div>
            }


        </div>
    )
}

const mapStateToProps = (state) => (
    {course: state.course, backEndLinks: state.backEndLinks}
);
function mapDispatchToProps(dispatch){
    return bindActionCreators({
        actionWithoutData: actionWithoutData, setContent: setContent
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseAbout);

