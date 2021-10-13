// class인 이유는 실시간 채팅이 함수형에서는 잘 되지 않아서 class와 functional을 섞어 쓸것이다.
// Header 중간부분(db가져오기) form
import React, { Component } from "react";
import Message from "./Message";
import MessageForm from "./MessageForm";
import MessageHeader from "./MessageHeader";
import firebase from "../../../firebase/firebase";
import { connect } from "react-redux";
import { child, getDatabase, onChildAdded, ref } from "@firebase/database";

export class MainPanel extends Component {
  state = {
    messages: [],
    messagesRef: ref(getDatabase(), "messages"),
    messagesLoading: true,
    //searchTerm이것은 input(검색창)에 입력하는 것을 담는 state
    searchTerm: "",
    // 검색단어와 비슷한 메시지가 이 배열에 담긴다.
    searchResult: [],
    // searching동안 loading을 띄워준다.
    searchLoading: false,
  };

  componentDidMount() {
    // redux를 props로 이용히가 위해
    const { chatRoom } = this.props;
    // 방마다 각각의 내용을 불러와야 하기 때문에 chatRoom.id가 필요하다. chatRoom은 redux에!!
    if (chatRoom) {
      this.addMessagesListener(chatRoom.id);
    }
  }

  handleSearchMessages = () => {
    const chatRoomMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    // 첫 번째 인자가 accumulator, 두 번째 인자가 currentValue
    const searchResult = chatRoomMessages.reduce((acc, message) => {
      // text message만을 찾아서 거기서 검색 단어를 찾기 때문에 content만 조건을 준다.
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
      // [ ]은 initial value
    }, []);
    // 이제 정보가 담긴 searchResult를 가지고 화면에 뿌려준다.
    this.setState({ searchResult });
  };

  // 이 함수를 자녀인 messageHeader에다 보내준다.
  handleSearchChange = (e) => {
    this.setState(
      {
        searchTerm: e.target.value,
        searchLoading: true,
      },
      () => this.handleSearchMessages()
    );
  };

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
        key={message.timestamp}
        // message와 user정보를 주는 이유는 채팅방의 작성자 이름과 내용이 있어야 하기 때문
        message={message}
        user={this.props.user}
      />
    ));

  render() {
    // messages라는 state에 message가 들어있기 때문에
    const { messages, searchResult, searchTerm } = this.state;
    return (
      <div
        style={{
          padding: "2rem 2rem 0 2rem",
        }}
      >
        <MessageHeader handleSearchChange={this.handleSearchChange} />
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
          {/* 검색 결과가 있으면 보여주고 아니면 원래 대화창을 유지하고 */}
          {searchTerm
            ? this.renderMessages(searchResult)
            : this.renderMessages(messages)}
        </div>
        <MessageForm />
      </div>
    );
  }
}

// class 라서 알지? 이렇게 redux 쓰는거
const mapStateToProps = (state) => {
  return {
    user: state.user.currentUser,
    chatRoom: state.chatRoom.currentChatRoom,
  };
};

export default connect(mapStateToProps)(MainPanel);
