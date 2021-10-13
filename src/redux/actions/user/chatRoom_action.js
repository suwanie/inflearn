import { SET_CURRENT_CAHT_ROOM, SET_PRIVATE_CAHT_ROOM } from "./types";

export function setCurrentChatRoom(currentChatRoom) {
  return {
    type: SET_CURRENT_CAHT_ROOM,
    payload: currentChatRoom,
  };
}

// isPrivateChatRoom이게 true인지 false인지
export function setPrivateChatRoom(isPrivateChatRoom) {
  return {
    type: SET_PRIVATE_CAHT_ROOM,
    payload: isPrivateChatRoom,
  };
}
