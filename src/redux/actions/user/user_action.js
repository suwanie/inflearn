import { SET_USER, CLEAR_USER, SET_PHOTO_URL } from "./types";

// App에서 dispatch에 user를 넣어줬으니 매개변수롤 user를 받아준다.
export function setUser(user) {
  return {
    type: SET_USER,
    payload: user,
  };
}

export function clearUser() {
  return {
    type: CLEAR_USER,
  };
}

// photoURL를 currentUser에서 받아주나?, 매개변수가 있으면 payload도 있다.
export function setPhotoURL(photoURL) {
  return {
    type: SET_PHOTO_URL,
    payload: photoURL,
  };
}
// 액션 생성함수-> 액션 객체를 만들어주는 함수로 화살표도 가능하다.
