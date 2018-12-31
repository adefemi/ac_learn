import React from 'react';
import {Icon} from 'antd'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import jwt from 'jwt-decode'
import qs from 'query-string'
import _ from 'lodash';
//import styles
import "../assets/css/signin.css";
import {actionWithoutData, setContent, authorizeWithData, authorizeWithoutData, actionWithData} from '../redux/actions'
import {verifyauth} from './common/miscellaneous'
import {SiteData} from './data/siteMain'
import { notification } from 'antd';


//import shared component...

class SignIn extends React.Component{
    state = {
        isSubmitting: false, username: "", password: "", activeLink : '/'
    };
    openNotificationWithIcon = (type) => {
        notification[type]({
            message: 'Error',
            description: 'Invalid username or password',
        });
    };
    componentDidMount(){
        if(verifyauth()) {
            this.props.history.push(this.state.activeLink);
            return;
        }
        const parsed = qs.parse(this.props.history.location.search);
        if(!_.isEmpty(parsed)){
            notification.info({
                message: "Info",
                description: "You need to be logged in to start training...",
                duration: 10
            });
            this.setState({activeLink: '/training-ground?course='+parsed.course+'&trainer='+parsed.trainer})
        }
    }
    handleSubmit = () =>{
        let url = this.props.backEndLinks.auth;
        let payload = new FormData();
        payload.append('username',this.state.username);
        payload.append('password',this.state.password);
        this.props.actionWithData('post',url,payload).then(
            res => {
                let parsedData = jwt(res.data.access);
                url = this.props.backEndLinks.user + parsedData.id;
                this.props.actionWithoutData('get',url).then(
                    (rem) => {
                        if(parseInt(rem.data.is_superuser) !== 1){
                            localStorage.setItem(SiteData.name+'-user', JSON.stringify(res.data));
                            this.props.setContent("SET_USER_ACTIVE", rem.data);
                            setTimeout(() => {
                                this.props.history.push(this.state.activeLink);
                            }, 1000)
                        }
                        else{
                            this.openNotificationWithIcon('error');
                            this.setState({isSubmitting:false, password: ""});
                        }
                    },
                    (err) => {
                        this.openNotificationWithIcon('error');
                        this.setState({isSubmitting:false, password: ""});
                    }
                );
            },
            err => {
                this.openNotificationWithIcon('error');
                this.setState({isSubmitting:false, password: ""});
            }
        )
    };
    render = () => (
        <div className={'sign-in-wrapper'}>
            <div className={'sign-in-container'}>
                <div className={'title'}>
                    <a href="/">AC-Learn</a>
                </div>
                <div className={'sign-in-notification'}>
                    If you don't have an account yet, you can create one from
                    <a href="https://adefemiconsult.com/sign-in"> Here</a>
                </div>
                <form onSubmit={e => {e.preventDefault(); this.setState({isSubmitting: true}); this.handleSubmit()}}>
                    <input value={this.state.username} onChange={e => this.setState({username: e.target.value})} type="text" placeholder={'username'} required/>
                    <input value={this.state.password} onChange={e => this.setState({password: e.target.value})} type="password" placeholder={'password'} required/>
                    {
                        this.state.isSubmitting ?
                            <button type={'button'} disabled><Icon type={'loading'}/>&nbsp;Signing in... </button>:
                            <button type={'submit'}>Sign in</button>
                    }

                </form>

            </div>
        </div>
    )
}

function mapDispatchToProps(dispatch){
    return bindActionCreators({
        actionWithoutData: actionWithoutData, setContent: setContent, authorizeWithData:authorizeWithData,
        authorizeWithoutData: authorizeWithoutData, actionWithData: actionWithData,
    }, dispatch)
}

function mapStateToProps(state) {
    return({
        activeLink: state.activeLink, backEndLinks: state.backEndLinks
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);

