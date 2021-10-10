import { SET_CURRENT_CAHT_ROOM } from "../../actions/user/types";

const initialChatRoomState = {
  currentChatRoom: null,
};
export default function (state = initialChatRoomState, action) {
  switch (action.type) {
    case SET_CURRENT_CAHT_ROOM:
      return {
        ...state,
        // action에서 갖고온거
        currentChatRoom: action.payload,
      };

    default:
      return state;
  }
}
