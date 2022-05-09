import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import singleSpaReact from 'single-spa-react';

const rootComponent = App;

const reactLifecycles = singleSpaReact({
    React,
    ReactDOM,
    rootComponent,
    domElementGetter: () => document.getElementById('login'),
});

export const bootstrap = [
    reactLifecycles.bootstrap,
];

export const mount = [
    reactLifecycles.mount,
];

export const unmount = [
    reactLifecycles.unmount,
];

if (process.env.NODE_ENV === 'development') {
    ReactDOM.render(<App />, document.getElementById('login'));
    serviceWorker.unregister();
} 
