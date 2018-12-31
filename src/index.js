import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import AOS from 'aos';
import 'aos/dist/aos.css';
import RootReducer from './redux/reducer/rootReducer'

AOS.init();

export const Store = createStore(RootReducer, applyMiddleware(thunk));

const Index = () => (
    <Provider store={Store}>
        <App/>
    </Provider>
);

ReactDOM.render(<Index />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
