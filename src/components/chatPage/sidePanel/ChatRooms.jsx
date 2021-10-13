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
    // 챗 방이 하나 이상이여야 하기 때문에 length>0이다. 조건을 주는 이유는 방의 갯수만큼 첫 번째가 실행되는 것을 막기 위함인거 같다.
    if (this.state.firstLoad && this.state.chatRooms.length > 0) {
      // AddChatRoomsListeners여기에 state의 chatRooms의 배열에 있는 첫 번째 것을 넣어주면 된다.
      this.props.dispatch(setCurrentChatRoom(firstChatRoom));
      // active는 그 방을 클릭했을 때 알려준다.
      this.setState({ activeChatRoomId: firstChatRoom.Id });
    }
    this.setState({ firstLoad: false });
  };

  AddChatRoomsListeners = () => {
    // chatroom은 배열로 되어 있어서, 지금 데이터 가져오는 것 하는것
    let chatRoomsArray = [];
    onChildAdded(this.state.chatRoomsRef, (DataSnapshot) => {
      chatRoomsArray.push(DataSnapshot.val());
      this.setState(
        { chatRooms: chatRoomsArray },
        // 처음 load했을 때 첫 번째 방이 바로 클릭될 수 있게
        () => this.setFirstChatRoom()
      );
    });
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
        <Badge variant="danger">1</Badge>
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
              Close
            </Button>
            <Button variant="primary" onClick={this.handleSubmit}>
              Create
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
  };
};

export default connect(mapStateToProps)(ChatRooms);

// 여긴 클래스 컴포넌트를 이용 .. 그래서 redux의 user를 hook으로 가져오지 못하고 props로
