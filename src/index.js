import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import promiseMiddleware from "redux-promise";
import ReduxThunk from "redux-thunk";
import { applyMiddleware, createStore } from "redux";
import Reducer from "./redux/reducer";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
const createStoreWithMiddleware = applyMiddleware(
  promiseMiddleware,
  ReduxThunk
)(createStore);

ReactDOM.render(
  <React.StrictMode>
    {/* createStoreWithMiddleware 안에 reducer를 넣어준다. */}
    <Provider
      store={createStoreWithMiddleware(
        Reducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__()
      )}
    >
      {/* 감싸줘야 useHistory를 사용할 수 있다. */}
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
