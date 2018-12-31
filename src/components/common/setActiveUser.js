import React from 'react';
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import jwt from 'jwt-decode'
//import styles
import {actionWithoutData, setContent} from '../../redux/actions'
import {verifyauth} from '../common/miscellaneous'
import {SiteData} from '../data/siteMain'
import proptype from 'prop-types';


//import shared component...

class SetActiveUser extends React.Component{
    componentDidMount(){
        if(!verifyauth()) {
            return;
        }
        else if(this.props.userStatus){
            return;
        }
        this.setActive();
    }

    setActive(){
        let auth = localStorage.getItem(SiteData.name+"-user");
        let data = JSON.parse(auth);
        let parsedData = jwt(data.access);
        let url = this.props.backEndLinks.user + parsedData.id;
        this.props.actionWithoutData('get',url).then(
            (rem) => {
                this.props.setContent("SET_USER_ACTIVE", rem.data);
                if(this.props.setUserData){
                    this.props.setUserData(rem.data);
                }
            }
        );
    }

    render = () => {
        return null
    }
}

SetActiveUser.propType = {
    setUserData: proptype.func
};

function mapDispatchToProps(dispatch){
    return bindActionCreators({
        actionWithoutData: actionWithoutData, setContent: setContent
    }, dispatch)
}

function mapStateToProps(state) {
    return({
        activeLink: state.activeLink, backEndLinks: state.backEndLinks, userStatus: state.userStatus
    })
}

export default connect(mapStateToProps, mapDispatchToProps)(SetActiveUser);

