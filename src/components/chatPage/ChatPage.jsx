import React from "react";
import MainPanel from "./mainPanel/MainPanel";
import SIdePanel from "./sidePanel/SIdePanel";
import { useSelector } from "react-redux";

const ChatPage = () => {
  const currentChatRoom = useSelector(
    (state) => state.chatRoom.currentChatRoom
  );
  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "300px" }}>
        <SIdePanel />
      </div>
      <div style={{ width: "100%" }}>
        <MainPanel key={currentChatRoom && currentChatRoom.id} />
      </div>
    </div>
  );
};

export default ChatPage;
