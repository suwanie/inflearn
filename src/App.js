import "./App.css";
import { Switch, Route, useHistory } from "react-router-dom";
import ChatPage from "./components/chatPage/ChatPage";
import LoginPage from "./components/loginPage/LoginPage";
import RegisterPage from "./components/registerPage/RegisterPage";
import { useEffect } from "react";
import firebase from "./firebase/firebase";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/actions/user/user_action";

function App(props) {
  let history = useHistory();
  let dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading);
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      // register를 했을 때 user정보가 뜨면 로그인이 된것
      if (user) {
        history.push("/");
        // setUser는 함수이다! 여기에 firebase에서 전달해주는 user정보를 담을것이다. 그리고 setUser는 redux action에 user_action파일을 만들어 함수를 만들것이다.
        dispatch(setUser(user));
        // 모든 action, type, reducer작업이 끝나면 user의 정보가 setUser에, 즉 redux store에 잘 들어간 것이다.
      } else {
        history.push("/login");
        dispatch(clearUser());
      }
    });
  }, []);

  // isLoadin으로 할 것, 이것은 redux store에 있는데, 이용하기 위해선 useSelector를 사용해야 한다.
  if (isLoading) {
    return <div>...loading</div>;
  } else {
    return (
      <Switch>
        <Route exact path="/" component={ChatPage} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />
      </Switch>
    );
  }
}

export default App;
