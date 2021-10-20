import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { FaLock } from "react-icons/fa";
import { FaLockOpen } from "react-icons/fa";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { AiOutlineSearch } from "react-icons/ai";
import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import { useSelector } from "react-redux";
import {
  child,
  getDatabase,
  remove,
  ref,
  update,
  onValue,
} from "@firebase/database";
import firebase from "../../../firebase/firebase";
import Media from "react-bootstrap/Media";

const MessageHeader = ({ handleSearchChange }) => {
  const user = useSelector((state) => state.user.currentUser);
  const usersRef = ref(getDatabase(), "users");
  const [isFavorited, setIsFavorited] = useState(false);
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const isPrivateChatRoom = useSelector(
    (state) => state.chatRoom.isPrivateChatRoom
  );
  const userPosts = useSelector((state) => state.chatRoom.userPosts);
  useEffect(() => {
    // chatRoom이랑 user정보가 있을 때만 저 매개변수들을 넣어주고 실행하게끔 조건문을 써준다.
    if (chatRoom && user) {
      // 매개변수들은 리덕스에서 갖고온것, chatRoom.id는 아래의 isAlreadyFavorited여기에 쓰인다.
      addFavoriteListener(chatRoom.id, user.uid);
    }
  }, []);

  const addFavoriteListener = (chatRoomId, userId) => {
    onValue(child(usersRef, `${userId}/favorited`), (data) => {
      // 즉 좋아요를 눌렀다면(null이 아니라면)
      if (data.val() !== null) {
        // log로 찍어보면 data.val은 채티방 정보를 가르키고 chatRoomIds은 하트를 누른 채티방의 Id를 가르킨다.
        const chatRoomIds = Object.keys(data.val());
        // chatRoomIds여기에 방의 id가 있다면 이미 하트를 누른것이지?
        const isAlreadyFavorited = chatRoomIds.includes(chatRoomId);
        // currentChatRoomId가 만약 chatRoomIds에 있다면 isAlreadyFavorited는 true가 될것이다.
        setIsFavorited(isAlreadyFavorited);
      }
    });
  };

  const handleFavorite = () => {
    if (isFavorited) {
      setIsFavorited((prev) => !prev);
      // user.uid는 현재 로그인한 사람의 user정보가 있어야 된다. 그래서 리덕스에서 가져올 것이다.
      remove(child(usersRef, `${user.uid}/favorited/${chatRoom.id}`));
    } else {
      setIsFavorited((prev) => !prev);
      update(child(usersRef, `${user.uid}/favorited`), {
        [chatRoom.id]: {
          name: chatRoom.name,
          description: chatRoom.description,
          createdBy: {
            name: chatRoom.createdBy.name,
            image: chatRoom.createdBy.image,
          },
        },
      });
    }
  };

  // sort는 배열에서만 먹히기 때문에 먼저 객체인 userPosts를 배열로 바꿔줘야 한다.
  const renderUserPosts = (userPosts) =>
    Object.entries(userPosts) //배열로 바꿈
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, val], i) => (
        <Media key={i}>
          <img
            style={{ borderRadius: 25 }}
            width={48}
            height={48}
            className="mr-3"
            src={val.image}
            alt={val.name}
          />
          <Media.Body>
            <h6>{key}</h6>
            <p>{val.count}개</p>
          </Media.Body>
        </Media>
      ));

  return (
    <div
      style={{
        width: "100%",
        height: "170px",
        border: ".2rem solid #ececec",
        borderRadius: "4px",
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      <Container>
        <Row>
          <Col>
            <h2>
              {isPrivateChatRoom ? (
                <FaLock style={{ marginBottom: "10px" }} />
              ) : (
                <FaLockOpen style={{ marginBottom: "10px" }} />
              )}
              {/* 채팅룸 이름은 redux안에 있다. => 채팅룸이 있으면 그 이름을 써라 라는 뜻이다.*/}
              {chatRoom && chatRoom.name}
              {!isPrivateChatRoom && (
                <span style={{ cursor: "pointer" }} onClick={handleFavorite}>
                  {/* isFavorite state를 만들어준다. */}
                  {isFavorited ? (
                    <MdFavorite style={{ marginBottom: "10px" }} />
                  ) : (
                    <MdFavoriteBorder style={{ marginBottom: "10px" }} />
                  )}
                </span>
              )}
            </h2>
          </Col>
          <Col>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1">
                <AiOutlineSearch />
              </InputGroup.Text>
              <FormControl
                // 타이핑 할때마다 이 함수의 트리거가 된다.
                onChange={handleSearchChange}
                placeholder="Search Messages"
                aria-label="Search"
                aria-describedby="basic-addon1"
              />
            </InputGroup>
          </Col>
        </Row>
        {!isPrivateChatRoom && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Image
              src={chatRoom && chatRoom.createdBy.image}
              roundedCircle
              style={{ width: "30px", height: "30px" }}
            />
            {""}
            {chatRoom && chatRoom.createdBy.name}
          </div>
        )}
        <Row>
          <Col>
            <Accordion>
              <Card>
                <Card.Header style={{ padding: "0 1rem" }}>
                  <Accordion.Toggle as={Button} variant="link" eventKey="0">
                    Description
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  {/* chatRoom이라는 redux에 이미 방의 정보가 있다. */}
                  <Card.Body>{chatRoom && chatRoom.description}</Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Col>
          <Col>
            <Accordion>
              <Card>
                <Card.Header style={{ padding: "0 1rem" }}>
                  <Accordion.Toggle as={Button} variant="link" eventKey="0">
                    Posts Count
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    {userPosts && renderUserPosts(userPosts)}
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MessageHeader;
