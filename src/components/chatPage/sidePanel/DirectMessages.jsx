import React, { Component } from "react";
import { FaRegSmile } from "react-icons/fa";
import firebase from "../../../firebase/firebase";
import { getDatabase, onChildAdded, ref, set } from "@firebase/database";
import { connect, useDispatch } from "react-redux";
import {
  setCurrentChatRoom,
  setPrivateChatRoom,
} from "../../../redux/actions/user/chatRoom_action";

export class DirectMessages extends Component {
  state = {
    usersRef: ref(getDatabase(), "users"),
    users: [],
    // 방 색을 줘서 어디에 있는지 알아보게 끔
    activeChatRoom: "",
  };

  componentDidMount() {
    // 리스너를 넣어준다.
    // 유저 정보가 있을 때만,
    if (this.props.user) {
      // props로 user.uid를 여기에 넣어주고 addUserListeners 함수에서 매개변수로 이것을 받아 사용할 것이다. -> 원래는 if(this.props.user.uid !== userNaem) 이여야 한다.
      this.addUsersListeners(this.props.user.uid);
    }
  }

  addUsersListeners = (currentUserId) => {
    const { usersRef } = this.state;
    // 빈 배열을 만들어주고 users table에 접근해줘야한다.
    let usersArray = [];
    // Chlid 리스너가 user 테이블에 add가 될때 이 리스너가 그 데이터를 가져온다.
    onChildAdded(usersRef, (DataSnapshot) => {
      // 이 조건문이 내 이름은 안뜨게 해주는 로직이다. currentUserId가 내 것이다. 이것은 redux에 있기때문에 connect를 써줘야 한다. dataSnapshot.key로 한 사람의 user.uid를 받을 수 있다고 한다.
      if (currentUserId !== DataSnapshot.key) {
        let user = DataSnapshot.val();
        // ["uid", "status"] 는 user에 uid와 status를 넣어주는 것이다.
        user["uid"] = DataSnapshot.key;
        user["status"] = "offline";
        usersArray.push(user);
        // users라는 state에 usersArr를 넣어준다.
        this.setState({ users: usersArray });
      }
    });
  };

  //chatRoomId 생성
  getChatRoomId = (userId) => {
    // 이게 가능한 이유는 redux에서 가져왔기 때문에
    const currentUserId = this.props.user.uid;
    // 누가 만들어도 같은 채팅방id를 갖기 위한 로직 ->순서는 상관없다.
    return userId > currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  // 지금 여기선 상대방의 정보가 매개변수로 들어왔다. chatRoomName에 user.name은 상대방을 뜻한다. 알지? current가 나, user가 상대

  changeChatRoom = (user) => {
    const chatRoomId = this.getChatRoomId(user.uid);
    const chatRoomData = {
      id: chatRoomId,
      name: user.name,
    };
    // 데이터를 redux에 넣는 부분 ->action과 reduce, type을 정해준다.
    this.props.dispatch(setCurrentChatRoom(chatRoomData));
    this.props.dispatch(setPrivateChatRoom(true));
    // user.uid인 이유, 알겠지? 방이 어떤 id로 만들어졌는지
    this.setActiveChatRoom(user.uid);
  };

  setActiveChatRoom = (userId) => {
    this.setState({ activeChatRoom: userId });
  };

  //나열해줄 정보를 가져온다. ->userName
  renderDirectMessages = (users) =>
    users.length > 0 &&
    users.map((user) => (
      <li
        key={user.uid}
        style={{
          backgroundColor:
            user.uid === this.state.activeChatRoom && "#ffffff45",
        }}
        // user는 채티방을 만든 사람의 정보를 받는 것
        onClick={() => this.changeChatRoom(user)}
      >
        #{user.name}
      </li>
    ));

  render() {
    const { users } = this.state;
    return (
      <div>
        <span style={{ display: "flex", alignItems: "center" }}>
          <FaRegSmile style={{ marginRight: 3 }} />
          Direct Messages(1)
        </span>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {/* user들을 렌더시킨다. */}
          {this.renderDirectMessages(users)}
        </ul>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(DirectMessages);
