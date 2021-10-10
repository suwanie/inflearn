// class인 이유는 실시간 채팅이 함수형에서는 잘 되지 않아서 class와 functional을 섞어 쓸것이다.
// Header 중간부분(db가져오기) form
import React, { Component } from "react";
import Message from "./Message";
import MessageForm from "./MessageForm";
import MessageHeader from "./MessageHeader";
import firebase from "../../../firebase/firebase";
import { connect } from "react-redux";
import {
  child,
  DataSnapshot,
  getDatabase,
  onChildAdded,
  ref,
} from "@firebase/database";

export class MainPanel extends Component {
  state = {
    messageRef: ref(getDatabase(), "messages"),
    messages: [],
    messagesLoading: true,
  };

  componentDidMount() {
    // redux를 props로 이용히가 위해
    const { chatRoom } = this.props;
    // 방마다 각각의 내용을 불러와야 하기 때문에 chatRoom.id가 필요하다. chatRoom은 redux에!!
    if (chatRoom) {
      this.addMessagesListener(chatRoom.id);
    }
  }

  addMessagesListener = (chatRoomId) => {
    let messagesArray = [];
    let { messagesRef } = this.state;
    onChildAdded(child(messagesRef, chatRoomId), (DataSnapshot) => {
      messagesArray.push(DataSnapshot.val());
      this.setState({
        messages: messagesArray,
        messagesLoading: false,
      });
    });
  };
  renderMessages = (messages) =>
    messages.length > 0 &&
    messages.map((message) => (
      <Message
        key={messages.timestamp}
        // message와 user정보를 주는 이유는 채팅방의 작성자 이름과 내용이 있어야 하기 때문
        message={message}
        user={this.props.user}
      />
    ));

  render() {
    // messages라는 state에 message가 들어있기 때문에
    const { messages } = this.state;
    return (
      <div
        style={{
          padding: "2rem 2rem 0 2rem",
        }}
      >
        <MessageHeader />
        <div
          style={{
            width: "100%",
            height: "450px",
            // 아.. .이거 일부러 찍음 앞에 0 생략
            border: ".2rem solid #ececec",
            borderRadius: "4px",
            padding: "1rem",
            marginBottom: "1rem",
            overflowY: "auto",
          }}
        >
          {this.renderMessages(messages)}
        </div>
        <MessageForm />
        <div style={{}}></div>
      </div>
    );
  }
}

// class 라서 알지? 이렇게 redux 쓰는거
const mapStateToProps = (state) => {
  return {
    user: state.user.currentUser,
    chatRoom: state.chatRoom.currentChatroom,
  };
};

export default connect(mapStateToProps)(MainPanel);
