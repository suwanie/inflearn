// 리듀서들을 합쳐주기 위해
import { combineReducers } from "redux";
import user from "./user/user_reducer";
import chatRoom from "./chatRoom/chatRoom_reducer";

// 앞으로 만들 reducer들을 합쳐줘야 한다.
const rootReducer = combineReducers({
  user,
  chatRoom,
});

export default rootReducer;
