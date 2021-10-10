import React from "react";
import "../../../index.css";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useState } from "react";
import { useSelector } from "react-redux";
import firebase from "../../../firebase/firebase";
import { child, getDatabase, push, ref, set } from "@firebase/database";
const MessageForm = () => {
  //useSelector로 특정 DOM?을 선택 -> ref비슷한듯? state의 chatRoom의 currentChatRoom를 선택
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const user = useSelector((state) => state.user.currentUser);
  const [content, setContent] = useState("");
  const [err, setErr] = useState([]);
  // send를 눌렀을 때 다시 못 누르게끔 하기 위함
  const [loading, setLoading] = useState(false);
  // "messages"는 테이블 이름이 된다. -> 그렇다면 게시물의 데이터를 저장할 때도 이렇게 하면 되겠다. "post"
  const messagesRef = ref(getDatabase(), "messages");

  const handleChange = (e) => {
    // 글을 쓸때마다 content state를 변경시킨다.
    setContent(e.target.value);
  };

  //save info, fileUrl를 null 값으로 default를 준다.
  const createMessage = (fileUrl = null) => {
    const message = {
      timestamp: new Date(),
      // user 정보들도 redux에 들어 있는거 -> useSelectir 사용해서 유저정보 저장
      user: {
        id: user.uid,
        name: user.displayName,
        Image: user.photoURL,
      },
    };
    // 분기처리를 해서 저장할 때 contents(text)와 image를 구분지어줘야 한다.
    if (fileUrl !== null) {
      // 파일이 있다면 image column으로 file url를 넣어준다.
      message["image"] = fileUrl;
    } else {
      message["content"] = content;
    }
    //이제 모든게 들어간 message를 return해준다.
    return message;
  };

  // file upload
  const handleSubmit = async () => {
    if (!content) {
      // pre는 원래 있던 에러에 새로운 에러를 더해주기 위해 쓴다.
      setErr((prev) => prev.content("Type contents first"));
      // 리턴은 끊기위해 써줌, 반복문이 아닌데 끊어주는구나
      return;
    }
    setLoading(true);
    // firebase에 메세지를 저장하는 부분
    try {
      // 채팅방 id를 child로 넣어준다. chatroom.id는 redux에 채팅방을 클릭해보면 있는데 거기서 가져온다. ->useSelector 사용
      await set(push(child(messagesRef, chatRoom.id)), createMessage());
      setLoading(false);
      setContent("");
      setErr([]);
    } catch (err) {
      setErr((pre) => pre.concat(err.massage));
      setLoading(false);
      setTimeout(() => {
        setErr([]);
      }, 5000);
    }
  };

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Control
            as="textarea"
            row={3}
            value={content}
            onChange={handleChange}
          />
        </Form.Group>
      </Form>
      <ProgressBar variant="warning" label="60%" now={60} />
      <div>
        {/* err state를 가져오고 만약 있다면 */}
        {err.map((errMsg) => (
          <p style={{ color: "red" }} key={errMsg}>
            {errMsg}
          </p>
        ))}
      </div>
      <Row>
        <Col>
          <button
            className="message_form_button"
            style={{ width: "100%" }}
            onClick={handleSubmit}
          >
            SEND
          </button>
        </Col>
        <Col>
          <button className="message_form_button" style={{ width: "100%" }}>
            UPLOAD
          </button>
        </Col>
      </Row>
    </div>
  );
};

export default MessageForm;
