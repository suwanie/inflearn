import {
  child,
  DataSnapshot,
  getDatabase,
  off,
  onChildAdded,
  onChildRemoved,
  ref,
} from "@firebase/database";
import React, { Component } from "react";
import { FaRegSmileBeam } from "react-icons/fa";
import firebase from "../../../firebase/firebase";
import { connect, connet } from "react-redux";
import {
  setCurrentChatRoom,
  setPrivateChatRoom,
} from "../../../redux/actions/user/chatRoom_action";
export class Favorited extends Component {
  state = {
    userRef: ref(getDatabase(), "users"),
    favoritedChatRooms: [],
    activeChatRoomId: "",
  };

  componentDidMount() {
    if (this.props.user) {
      this.addListeners(this.props.user.uid);
    }
  }

  componentWillUnmount() {
    if (this.props.user) {
      this.removeListener(this.props.user.uid);
    }
  }

  removeListener = (userId) => {
    const { userRef } = this.state;
    off(child(userRef, `${userId}/favorited`));
  };

  addListeners = (userId) => {
    const { userRef } = this.state;

    onChildAdded(child(userRef, `${userId}/favorited`), (DataSnapshot) => {
      // 하트를 누르면 그 룸에대한 정보를 넣어주는 부분, 그 정보는 DataSnapshot에 있다.
      const favoritedChatRoom = { id: DataSnapshot.key, ...DataSnapshot.val() };
      // 원래 있던 배열과 새로운 배열 추가.
      this.setState({
        favoritedChatRooms: [
          ...this.state.favoritedChatRooms,
          favoritedChatRoom,
        ],
      });
    });
    // 이번에 하트를 뺄 때, Datasnapshot은 그 지워진 정보를 받는 것이다.
    onChildRemoved(child(userRef, `${userId}/favorited`), (DataSnapshot) => {
      const chatRoomToRemove = { id: DataSnapshot.key, ...DataSnapshot.val() };

      // filter라는 메서드를 이용해서 chatRoom 정보들을 하나하나 가져온 다음에 리턴으로 favo.chatRoom에 들어있는 chatRoom.id와 chatRoomToRemove.id가 같으면 필터가 되게끔, 즉 같지 않은 것들만 filteredChatRooms여기에 담긴다.
      const filteredChatRooms = this.state.favoritedChatRooms.filter(
        (chatRoom) => {
          return chatRoom.id !== chatRoomToRemove.id;
        }
      );
      this.setState({ favoritedChatRooms: filteredChatRooms });
    });
  };
  changeChatRoom = (room) => {
    // setCurrentChatRoom어느 방에 있는지를 redux에 넣음
    this.props.dispatch(setCurrentChatRoom(room));
    // 이 현재의 방이 public인지 private인지 구분
    this.props.dispatch(setPrivateChatRoom(false));
    // 이건 바탕을 처리하는 state
    this.setState({ activeChatRoomId: room.id });
  };

  renderFavoritedChatRooms = (favoritedChatRooms) =>
    favoritedChatRooms.length > 0 &&
    favoritedChatRooms.map((chatRoom) => (
      // activeChatRoomId는 state다.
      <li
        key={chatRoom.id}
        onClick={() => this.changeChatRoom(chatRoom)}
        style={{
          backgroundColor:
            chatRoom.id === this.state.activeChatRoomId && "#ffffff45",
        }}
      >
        #{chatRoom.name}
      </li>
    ));

  render() {
    const { favoritedChatRooms } = this.state;
    return (
      <div>
        <span style={{ display: "flex", alignItems: "center" }}>
          <FaRegSmileBeam style={{ marginRight: "3px" }} />
          {this.renderFavoritedChatRooms(favoritedChatRooms)}
        </span>
        <ul style={{ listStyleType: "none", padding: "0" }}></ul>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(Favorited);
