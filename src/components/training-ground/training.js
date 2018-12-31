import React from 'react';
//import styles
import "../../assets/css/general.css";
import "../../assets/css/training/training.css";

//import shared component...
import Header from './header'
import TrainingView from './training-view'

class Training extends React.Component{
    state = {
        trainerObj : null
    };

    setTrainer = (data) => {
        this.setState({trainerObj: data})
    };

    render = ({trainerObj} = this.state) => (
        <div className={'training-wrapper'}>
            <Header trainer={trainerObj}/>
            <TrainingView setTrainer={this.setTrainer} history={this.props.history}/>
        </div>
    )
}

export default Training;

