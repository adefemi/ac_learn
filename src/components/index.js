import React from 'react';
import {Switch, Route} from 'react-router-dom'
import Loadable from 'react-loadable';
//import styles
import "../assets/css/general.css";

//import shared component...
import Header from './shared/header'
import QuickLinks from './shared/quicklinks'
import Spinner from "./loaders/spinner1";

//Setting up loadable
function Loading(props) {
    if (props.error) {
        return <div>Error! <button onClick={ props.retry }>Retry</button></div>;
    }  else if (props.timedOut) {
        return <div>Taking a long time... <button onClick={ props.retry }>Retry</button></div>;
    } else if (props.pastDelay) {
        return <Spinner/>;
    } else {
        return null;
    }
}

const Home = Loadable({
    loader: () => import('./common/home'),
    loading: Loading,
    delay: 300,
    timeout: 10000,
});
const Course = Loadable({
    loader: () => import('./common/course'),
    loading: Loading,
    delay: 300,
    timeout: 10000,
});
const TrainerSection = Loadable({
    loader: () => import('./common/trainer'),
    loading: Loading,
    delay: 300,
    timeout: 10000,
});
const CourseTrainer = Loadable({
    loader: () => import('./common/choose-trainer'),
    loading: Loading,
    delay: 300,
    timeout: 10000,
});
const CourseExplorer = Loadable({
    loader: () => import('./common/course-about'),
    loading: Loading,
    delay: 300,
    timeout: 10000,
});

class Index extends React.Component{
    render = () => (
        <div className={'wrapper'}>
            <Header/>
            <div className={'container'}>
                <Switch>
                    <Route exact path={'/'} component={Home}/>
                    <Route exact path={'/course'} component={Course}/>
                    <Route exact path={'/trainer'} component={TrainerSection}/>
                    <Route exact path={'/course/trainer'} component={CourseTrainer}/>
                    <Route exact path={'/course/:uuid'} component={CourseExplorer}/>
                </Switch>
            </div>
            <QuickLinks/>
        </div>
    )
}

export default Index;

