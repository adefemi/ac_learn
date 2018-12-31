import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Loadable from 'react-loadable';
import Spinner from './components/loaders/spinner1'

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

const Index = Loadable({
    loader: () => import('./components/index'),
    loading: Loading,
    delay: 300,
    timeout: 10000,
});
const SignIn = Loadable({
    loader: () => import('./components/signin'),
    loading: Loading,
    delay: 300,
    timeout: 10000,
});
const Training = Loadable({
    loader: () => import('./components/training-ground/training'),
    loading: Loading,
    delay: 300,
    timeout: 10000,
});

const App = () => (
    <BrowserRouter>
        <Switch>
            <Route exact path={'/training-ground'} component={Training}/>
            <Route exact path={'/sign-in'} component={SignIn}/>
            <Route path={'/'} component={Index}/>
        </Switch>
    </BrowserRouter>
);

export default App;