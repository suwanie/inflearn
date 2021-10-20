import React, { Component } from "react";
import { FaRegSmileWink } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import { connect } from "react-redux";
import firebase from "../../../firebase/firebase";
import {
  child,
  DataSnapshot,
  getDatabase,
  off,
  onChildAdded,
  onValue,
  push,
  ref,
  update,
} from "@firebase/database";
import {
  setCurrentChatRoom,
  setPrivateChatRoom,
} from "../../../redux/actions/user/chatRoom_action";
export class ChatRooms extends Component {
  // name과 desc는 modal을 관리할 때 쓰 state로 관리해야 하기 때문에 만들어준다.
  state = {
    show: false,
    name: "",
    description: "",
    chatRoomsRef: ref(getDatabase(), "chatRooms"),
    chatRooms: [],
    firstLoad: true,
    activeChatRoomId: "",
    // noti는 그냥 알림들을 담는 곳
    notifications: [],
    messagesRef: ref(getDatabase(), "messages"),
  };

  componentDidMount() {
    this.AddChatRoomsListeners();
  }

  // database에서 chatRoomList데이터를 가져오고 그 가져오는 컴포넌트가 없어질 때, 리스너도 같이 없애줘야 하기 때문에 unmount를 해준다.
  componentWillUnmount() {
    off(this.state.chatRoomsRef);
  }

  setFirstChatRoom = () => {
    const firstChatRoom = this.state.chatRooms[0];
    // 챗 방이 하나 이상이여야 하기 때문에 length>0이다. 조건을 주는 이유는 방의 개수만큼 첫 번째가 실행되는 것을 막기 위함인거 같다.
    if (this.state.firstLoad && this.state.chatRooms.length > 0) {
      // AddChatRoomsListeners여기에 state의 chatRooms의 배열에 있는 첫 번째 것을 넣어주면 된다.
      this.props.dispatch(setCurrentChatRoom(firstChatRoom));
      // active는 그 방을 클릭했을 때 알려준다.
      this.setState({ activeChatRoomId: firstChatRoom.Id });
    }
    this.setState({ firstLoad: false });
  };

  // datasnapshot안에 chatroom의 id가 포함되어 있다.
  AddChatRoomsListeners = () => {
    // chatroom은 배열로 되어 있어서, 지금 데이터 가져오는 것 하는것
    let chatRoomsArray = [];
    // 이곳은 방을 만들때 생성되는 정보들이 db에 추가되고 그것을 chatRooms state에 넣어주는 곳이다.
    onChildAdded(this.state.chatRoomsRef, (DataSnapshot) => {
      chatRoomsArray.push(DataSnapshot.val());
      this.setState(
        { chatRooms: chatRoomsArray },
        // 처음 load했을 때 첫 번째 방이 바로 클릭될 수 있게
        () => this.setFirstChatRoom()
      );
      // DataSnapshot.key이걸로 방의 id를 얻을것이다.
      this.addNotificationListener(DataSnapshot.key);
    });
  };

  // DataSnapshot.key이게 chatRoomId라는 이름에 들어감 그럼 addNotificationListener여기엔 각각 방의 ID가 들어가 있음
  addNotificationListener = (chatRoomId) => {
    let { messagesRef } = this.state;
    onValue(
      child(messagesRef, chatRoomId),
      // datasnapshot은 메세지 정보들
      (DataSnapshot) => {
        // 채팅룸이 있을 때만, chatRoom은 리덕스에서 가져옴
        if (this.props.chatRoom) {
          this.handleNotification(
            chatRoomId,
            this.props.chatRoom.id,
            this.state.notifications,
            DataSnapshot
          );
        }
      }
    );
  };
  // chatRoomId에는 현재의 챗룸 id가 아니라 각각의 방의 ID가 들어오는 것이다.
  handleNotification = (
    chatRoomId,
    currentChatRoomId,
    notifications,
    DataSnapshot
  ) => {
    let lastTotal = 0;
    // 목표는 각 방의 맞는 알림 정보를 noti state에 넣기
    // notification.Id 여기에 chatRoomId 정보를 넣을것
    let index = notifications.findIndex(
      // 저 조건에 맞는게 없다면 -1를 반환한다. 그럼 해당 방의 정보가 없다는 거다..
      (notification) => notification.id === chatRoomId
    );
    //noti state에 해당 채팅방의 정보가 없다면
    if (index === -1) {
      // 새로 만드는 것이기 때문에 total과 last가 같다.
      notifications.push({
        id: chatRoomId, //해당 채팅방 Id
        total: DataSnapshot.size, //해당 채팅방 전체 메시지 개수
        lastKnownTotal: DataSnapshot.size, //이전에 확인한 전체 메시지 개수
        count: 0, //알림으로 사용될 숫자
      });
    }
    // 반면 원래 있는 곳에 새로운 정보를 넣는 것이니 last와 total의 개수는 다를 수 밖에 없다.
    else {
      // 상대방이 채팅 보내는 그 해당 채팅방에 있지 않을 때
      if (chatRoomId !== currentChatRoomId) {
        // 현재까지 유저가 확인한 총 메시지 개수
        lastTotal = notifications[index].lastKnownTotal;

        //count (알림으로 보여줄 숫자)를 구하기
        //현재 총 메시지 개수 - 이전에 확인한 총 메시지 개수 > 0
        //현재 총 메시지 개수가 10개이고 이전에 확인한 메시지가 8개 였다면 2개를 알림으로 보여줘야함.
        if (DataSnapshot.size - lastTotal > 0) {
          notifications[index].count = DataSnapshot.size - lastTotal;
        }
      }
      // total property에 현재 전체 메시지 개수 넣어주기
      notifications[index].total = DataSnapshot.size;
    }
    this.setState({ notifications });
  };

  handleClose = () => this.setState({ show: false });
  handleShow = () => this.setState({ show: true });
  handleSubmit = (e) => {
    e.preventDefault();
    const { name, description } = this.state;

    // name과 desc가 true(아래의 유효성 체크가 되면,) cahtroom을 만든다.
    if (this.isFormValid(name, description)) {
      this.addChatRoom();
    }
  };
  // 여기서 방이 만들어질때 방 제목, 설명, 만든 사람 이름과 이미지를 firebase로 보내야 한다.
  addChatRoom = async () => {
    const key = push(this.state.chatRoomsRef).key;
    const { name, description } = this.state;
    // user에는 이제 currentUser의 정보가 다 담겨있다.
    const { user } = this.props;
    // push는 time stamp로 시간순서에 따라 자동으로 ket가 생성되며(auto generated ket) .key는 이 생성된 key를 담는다.
    const newChatRoom = {
      id: key,
      name: name,
      description: description,
      createdBy: {
        name: user.displayName,
        image: user.photoURL,
      },
    };
    try {
      await update(child(this.state.chatRoomsRef, key), newChatRoom);
      this.setState({
        name: "",
        description: "",
        // 이건 modal 닫아주는거
        show: false,
      });
    } catch (err) {
      console.log(err);
    }
  };

  // 유효성 체크, 방 제목과 설명이 있으면 true가 된다.
  isFormValid = (name, description) => name && description;

  changeChatRoom = (room) => {
    this.props.dispatch(setCurrentChatRoom(room));
    // false로 줘서 다시 public으로 오면 상대가 변하게
    this.props.dispatch(setPrivateChatRoom(false));
    // 다른 것을 클릭했을 때 active로 state를 바꾼다.
    this.setState({ activeChatRoomId: room.id });
    this.clearNotification();
  };

  // this.props.chatRoom.id 현재 chatRoom의 Id이며 이 방의 id가 notis state안에 있는지 index를 통해 알게된다.
  clearNotification = () => {
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.props.chatRoom.id
    );
    //정보가 들어있다면
    if (index !== -1) {
      let updateNoti = [...this.state.notifications];
      // index는 위에서 구한거
      updateNoti[index].lastKnownTotal = this.state.notifications[index].total;
      updateNoti[index].count = 0;
      this.setState({ notifications: updateNoti });
    }
  };

  // 해당 room의 정보를 인자로 받음
  getNotificationCount = (room) => {
    // 해당 채팅방의 count 수를 구하는 중
    let count = 0;
    // 여기 noti에 모든 방의 정보가 들어있다.
    this.state.notifications.forEach((notification) => {
      if (notification.id === room.id) {
        count = notification.count;
      }
    });
    if (count > 0) return count;
  };

  // chatRooms를 매개변수로 넣어줌, 여긴 지금 chatRoom list를 만들고 있는 중이다.
  renderChatRooms = (chatRooms) =>
    chatRooms.length > 0 &&
    // 이 room(각 채팅방) 정보를 리덕스에 담아야 한다. dispatch를 이용해야 하지만 class component라서 props를 이용해야한다.
    chatRooms.map((room) => (
      <li
        key={room.id}
        // style은 active color를 입혀주는 부분
        style={{
          backgroundColor:
            room.id === this.state.activeChatRoomId && "#ffffff45",
        }}
        onClick={() => this.changeChatRoom(room)}
      >
        # {room.name}
        <Badge color="danger" style={{ float: "right" }} variant="contained">
          {this.getNotificationCount(room)}
        </Badge>
      </li>
    ));

  render() {
    return (
      <div>
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaRegSmileWink style={{ marginRight: 3 }} />
          CHAT ROOMS{""} (1)
          <FaPlus
            onClick={this.handleShow}
            style={{
              position: "absolute",
              right: 0,
              cursor: "pointer",
            }}
          />
        </div>
        {/* ADD CHAT ROOM MODAL */}

        {/* firebase에서 가져온 데이터를 화면에 뿌려주는 역할 */}
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {/* renderChatRooms 이거는 helper method이다.*/}
          {this.renderChatRooms(this.state.chatRooms)}
        </ul>

        <Modal
          show={this.state.show}
          onHide={this.handleClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Create a chat room</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>방 이름</Form.Label>
                <Form.Control
                  onChange={(e) => this.setState({ name: e.target.value })}
                  type="text"
                  placeholder="Enter a chat room name"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>방 설명</Form.Label>
                <Form.Control
                  onChange={(e) =>
                    this.setState({ description: e.target.value })
                  }
                  type="text"
                  placeholder="Enter a chat room description"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              닫기
            </Button>
            <Button variant="primary" onClick={this.handleSubmit}>
              생성
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user.currentUser,
    chatRoom: state.chatRoom.currentChatRoom,
  };
};

export default connect(mapStateToProps)(ChatRooms);

// 여긴 클래스 컴포넌트를 이용 .. 그래서 redux의 user를 hook으로 가져오지 못하고 props로
