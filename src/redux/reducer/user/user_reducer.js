import {
  SET_USER,
  CLEAR_USER,
  SET_PHOTO_URL,
  SET_USER_POST,
} from "../../actions/user/types";

const initialUserState = {
  currentUser: null,
  isLoading: true,
};
// 로그인이 시작되면 isLoading이 true이고 끝나면 false로
export default function (state = initialUserState, action) {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        currentUser: action.payload,
        isLoading: false,
      };

    case CLEAR_USER:
      return {
        ...state,
        currentUser: null,
        isLoading: false,
      };

    case SET_PHOTO_URL:
      return {
        ...state,
        // currentUser의 모든 것을 그냥 냅두고 photoURL만 바꿔준다.
        currentUser: { ...state.currentUser, photoURL: action.payload },
        isLoading: false,
      };

    default:
      return state;
  }
}

// 여기선 user_action부분의 user정보가 firebase에서 가져와 reducer에서 받을때 currentUser:action.payload로 해주면 user_action의 payload의 정보가 여기로 들어오고 isLoading을 false로 바꿀 수 있다.
// case는 type이 생길때마다 지정해줘야 한다.
