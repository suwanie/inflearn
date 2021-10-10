import { SET_CURRENT_CAHT_ROOM } from "./types";

export function setCurrentChatRoom(currentChatRoom) {
  return {
    type: SET_CURRENT_CAHT_ROOM,
    payload: currentChatRoom,
  };
}
