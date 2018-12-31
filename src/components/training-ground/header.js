import React from 'react';
import {Link} from 'react-router-dom'
import {Tooltip} from 'antd';
import propTypes from 'prop-types';

//import stylesheet
import '../../assets/css/training/header.css'
import {SiteData} from "../data/siteMain";
import {Icon} from "antd";

class Header extends React.Component{
    state = {
        isSigningOut: false
    };
    signOut = () => {
        this.setState({isSigningOut: true});
        localStorage.removeItem(SiteData.name+'-user');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000)
    };
    render = ({trainer} = this.props) => (
        <div className={'header-training'}>
            <div className={'header-training-inner'}>
                <div className={'header-training-brand'}><Link to={'/'}>AC-Learn</Link></div>
                <div className={'header-training-right'}>
                    {trainer !== null && trainer.is_staff !== "0" ? <Tooltip placement="left" title={"Trainer: "+trainer.username}>
                        <div className={'trainer-logo'}>
                            <img src="http://localhost/images/Geek.PNG" alt=""/>
                        </div>
                    </Tooltip> : null}


                    <div className={'header-training-right'}>
                        {
                            this.state.isSigningOut ? <a onClick={e => e.preventDefault()} href='/#'><Icon type={'loading'}/>&nbsp;Sign out</a> :
                                <a onClick={e => {e.preventDefault(); this.signOut()}}  href='/#'>Sign out</a>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

Header.propType = {
    trainer: propTypes.object.required
};

export default Header