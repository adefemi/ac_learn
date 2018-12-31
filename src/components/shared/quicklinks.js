import React from 'react'
import {Link} from 'react-router-dom'
import {Icon} from 'antd'
import {actionWithoutData, setContent} from "../../redux/actions";
import {processError} from "../common/miscellaneous";
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {notification} from 'antd'

//imports styles
import '../../assets/css/shared/quicklinks.css'

class QuickLinks extends React.Component{
    state = {
        settingSocial: null, settingContact: null
    };

    componentDidMount = (props = this.props) => {
        props.settingContact === null ? this.getContact() : this.setState({settingContact: props.settingContact});
        props.settingSocial === null ? this.getSocial() : this.setState({settingSocial: props.settingSocial});
    };

    getContact(){
        const {backEndLinks, actionWithoutData, setContent} = this.props;
        let url = backEndLinks.settingContact;

        actionWithoutData("get", url).then(
            res => {
                this.setState({settingContact: res.data});
                setContent("SET_SETTING_CONTACT_CONTENT");
            }
        ).catch(
            err => {
                notification.error({
                    message:"Error",
                    description: processError(err, backEndLinks.refresh).content
                })
            }
        )
    }

    getSocial(){
        const {backEndLinks, actionWithoutData, setContent} = this.props;
        let url = backEndLinks.settingSocial;

        actionWithoutData("get", url).then(
            res => {
                this.setState({settingSocial: res.data});
                setContent("SET_SETTING_SOCIAL_CONTENT");
            }
        ).catch(
            err => {
                notification.error({
                    message:"Error",
                    description: processError(err, backEndLinks.refresh).content
                })
            }
        )
    }

    render = ({settingSocial, settingContact} = this.state) => (
        <div className={'quick-links'}>
            <div className={'inner'}>
                <div className={'components'}>
                    <div className={'heading'}>Quick Links</div>
                    <ul className={'links'}>
                        <li><a href="http://www.adefemiconsult.com">Adefemi Consult Home</a></li>
                        <li><a href="http://blog.adefemiconsult.com">Adefemi Consult Blog</a></li>
                    </ul>
                </div>
                <div className={'components'}>
                    <div className={'heading'}>Features</div>
                    <ul className={'links'}>
                        <li><Link to={'/course'}>Courses</Link></li>
                    </ul>
                </div>
                <div className={'components'}>
                    <div className={'heading'}>Contact</div>
                    {
                        settingContact === null || settingContact.length < 1 ?
                            <ul className={'links'}>
                                <li>contact_admin@adefemiconsult.com</li>
                                <li>+2349032569595</li>
                            </ul>
                            :
                            <ul className={'links'}>
                                <li>{settingContact[0].email}</li>
                                <li>{settingContact[0].telephone}</li>
                            </ul>
                    }

                </div>
            </div>
            <div className={'footer'}>
                <div className={'copyright'}>
                    Copyright &copy; Adefemi Consult 2018
                </div>
                <div className={'components'}>
                    {
                        settingSocial === null || settingSocial.length < 1 ?
                            null
                            :
                            <div className={'socials'}>
                                {
                                    settingSocial.map((o,i) => {
                                        if(o.title === "facebook"){
                                            return (<a key={i} target={'_blank'} href={o.link}><li><Icon type={'facebook'}/></li></a>);
                                        }
                                        else if(o.title === "twitter"){
                                            return (<a key={i} target={'_blank'} href={o.link}><li><Icon type={'twitter'}/></li></a>);
                                        }
                                        else if(o.title === "instagram"){
                                            return (<a key={i} target={'_blank'} href={o.link}><li><Icon type={'instagram'}/></li></a>);
                                        }
                                        else return null
                                    })
                                }
                            </div>
                    }

                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => (
    {
        settingContact: state.settingContact, settingSocial: state.settingSocial,
        backEndLinks: state.backEndLinks
    }
);

const mapDispatchToProps = (dispatch) => (
    bindActionCreators({
        actionWithoutData: actionWithoutData, setContent: setContent
    }, dispatch)
);
export default connect(mapStateToProps, mapDispatchToProps)(QuickLinks)
