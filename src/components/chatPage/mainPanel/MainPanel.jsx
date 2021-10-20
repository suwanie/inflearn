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
  off,
  onChildAdded,
  onChildRemoved,
  ref,
} from "@firebase/database";
import { setUserPosts } from "../../../redux/actions/user/chatRoom_action";
import Skeleton from "../../../common/components/skeleton/Skeleton";
export class MainPanel extends Component {
  messageEndRef = React.createRef;

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
    // listenerLists여기 배열에 리스너를 등록했다고 넣어줄것
    listenerLists: [],
    typingRef: ref(getDatabase(), "typing"),
    typingUsers: [],
  };

  componentDidMount() {
    // redux를 props로 이용히가 위해
    const { chatRoom } = this.props;
    // 방마다 각각의 내용을 불러와야 하기 때문에 chatRoom.id가 필요하다. chatRoom은 redux에!!
    if (chatRoom) {
      this.addMessagesListener(chatRoom.id);
      this.addTypingListener(chatRoom.id);
    }
  }

  // 글을 쓸때마다 스크롤을 계속 아래로 내리기 위한 update
  componentDidUpdate() {
    if (this.messageEndRef) {
      this.messageEndRef.scrollIntoView({ behavior: "smooth" });
    }
  }

  componentWillUnmount() {
    // ref(getDatabase(), "messages")
    off(this.state.messagesRef);
    this.removeListeners(this.state.listenerLists);
  }

  removeListeners = (listeners) => {
    listeners.forEach((listner) => {
      console.log("listner", listner);
      // listner.ref.child(listner.id).off(listner.event)
    });
  };

  addTypingListener = (chatRoomId) => {
    // concat을 이용해 여기 빈 배열에 넣어준다.
    let typingUsers = [];
    let { typingRef } = this.state;
    // child가 add가 될때 반응하는 onChildAdded이다. 그리고 data를 dataSnapshot으로 받아와서
    onChildAdded(child(typingRef, chatRoomId), (DataSnapshot) => {
      if (DataSnapshot.key !== this.props.user.uid) {
        // typing하고있는 user정보를 넣는것이다.
        typingUsers = typingUsers.concat({
          id: DataSnapshot.key,
          name: DataSnapshot.val(),
        });
        this.setState({ typingUsers });
      }
    });

    // listenerLists state에 등록된 리스너를 넣어줄때
    this.addToListenerLists(chatRoomId, this.state.typingRef, "child_added");

    //typing을 지울때
    onChildRemoved(child(typingRef, chatRoomId), (DataSnapshot) => {
      // typingUsers state안에 타이핑을 지운 유저 정보가 있는지 없는지를 findIndex를 통해 찾는 것이다.
      const index = typingUsers.findIndex(
        (user) => user.id === DataSnapshot.key
      );
      if (index !== -1) {
        typingUsers = typingUsers.filter(
          (user) => user.id !== DataSnapshot.key
        );
        this.setState({ typingUsers });
      }
    });
    //listenersList state에 등록된 리스너를 넣어주기
    this.addToListenerLists(chatRoomId, this.state.typingRef, "child_removed");
  };

  //3개의 매개변수를 받는다
  addToListenerLists = (id, ref, event) => {
    // 이미 등록된 리스너인지 확인
    const index = this.state.listenerLists.findIndex((listener) => {
      return (
        // list 안의 id와 매개변수의 id가 같다면.. 같은 값의 index를 리턴해준다.
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });
    if (index === -1) {
      const newListener = { id, ref, event };
      this.setState({
        listenerLists: this.state.listenerLists.concat(newListener),
      });
    }
  };

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
      this.userPostsCount(messagesArray);
    });
  };

  userPostsCount = (messages) => {
    // 알지? acc는 accumulator, message는 currentValue, 이 message에는 채팅방에 전송하는 메시지들이 들어가고 그것들이 acc에 쌓이는 것이다.
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        // 이름은 이미 있으니 이미지랑 카운트 정보만
        acc[message.user.name] = {
          image: message.user.image,
          count: 1,
        };
      }
      return acc;
      // {}는 initialValue(첫 번째 value)로 객체를 준다.
    }, {});
    //이 정보는 Header에서 사용될 예정이기 때문에 dispatch를 이용해 redux에 넣어준다.
    this.props.dispatch(setUserPosts(userPosts));
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
  renderTypingUsers = (typingUsers) => {
    // 한 사람 이상이 타이핑을 할 때만 보여줄 것이다.
    return (
      typingUsers.length > 0 &&
      typingUsers.map((user) => (
        <span>{user.name.userUid}님이 채팅을 입력하고 있습니다.</span>
      ))
    );
  };

  // loading으로 render에서 그.. messagesLoading state를 받아오는 것임
  renderMessageSkeleton = (loading) => {
    <Skeleton />;
  };

  render() {
    // messages라는 state에 message가 들어있기 때문에
    const { messages, searchResult, searchTerm, typingUsers, messagesLoading } =
      this.state;
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
          {this.renderMessageSkeleton(messagesLoading)}

          {/* 검색 결과가 있으면 보여주고 아니면 원래 대화창을 유지하고 */}
          {searchTerm
            ? this.renderMessages(searchResult)
            : this.renderMessages(messages)}
          {this.renderTypingUsers(typingUsers)}
          {/* 이 div를 계속 참조하게(ref) 해서 글을 쓸때마다 스크롤이 내려가게 해야한다. */}
          {/*messageEndRef 이것이 div를 계속 참조하고 있다는 뜻*/}
          <div ref={(node) => (this.messageEndRef = node)} />
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
