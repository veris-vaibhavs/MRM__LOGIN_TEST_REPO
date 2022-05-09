import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import thunk from "redux-thunk";
import sessionReducer from "./reducers/session";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
  session: sessionReducer,
});

const persistConfig = {
  key: "login",
};

const middleware = composeEnhancers(applyMiddleware(thunk));
const store = createStore(rootReducer, middleware);

export default store;
