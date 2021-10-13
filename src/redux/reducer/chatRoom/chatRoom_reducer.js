import {
  SET_CURRENT_CAHT_ROOM,
  SET_PRIVATE_CAHT_ROOM,
} from "../../actions/user/types";

const initialChatRoomState = {
  currentChatRoom: null,
  // 처음 우리의 어플을 들어가면 private이 아니라 pubilc이 뜨므로 false를 준다.
  isPrivateChatRoom: false,
};
export default function (state = initialChatRoomState, action) {
  switch (action.type) {
    case SET_CURRENT_CAHT_ROOM:
      return {
        ...state,
        // action에서 갖고온거
        currentChatRoom: action.payload,
      };

    case SET_PRIVATE_CAHT_ROOM:
      return {
        ...state,

        isPrivateChatRoom: action.payload,
      };

    default:
      return state;
  }
}
