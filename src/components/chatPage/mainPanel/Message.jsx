import React from "react";
import Media from "react-bootstrap/Media";
import moment from "moment";

const Message = ({ message, user }) => {
  // timestamp를 media.body에서 인자로 받는다.
  const timeFromNow = (timestamp) => moment(timestamp).fromNow();
  // message 프로퍼티를 받는다.
  const isImage = (message) => {
    return (
      message.hasOwnProperty("image") && !message.hasOwnProperty("content")
    );
  };

  const isMessageMine = (message, user) => {
    return message.user.id === user.uid;
  };

  return (
    <Media style={{ marginBottom: "3px", display: "flex" }}>
      <img
        style={{ borderRadius: "10px" }}
        width={48}
        height={48}
        className="mr-3"
        src={message.user.Image}
        alt={message.user.name}
      />

      {/* message, user는 mainPanel에서 가져온것, 즉 보낸 사람이 아니라 currentUser이다. =>Me, message 정보 안에 보낸 사람의 정보가 있다. 보낸게 내것이 맞다면 gray색을 준다. */}
      <Media.Body
        style={{ backgroundColor: isMessageMine(message, user) && " #ffff00" }}
      >
        <h6>
          {/* 빈 문자열은 아이디와 시간 사이의 간격을 주기위함 */}
          {message.user.name} {""}
          <span style={{ fontSize: "10px", color: "gray" }}>
            {timeFromNow(message.timestamp)}
          </span>
        </h6>
        {isImage(message) ? (
          <img style={{ maxWidth: "300px" }} alt="이미지" src={message.image} />
        ) : (
          <p>{message.content}</p>
        )}
      </Media.Body>
    </Media>
  );
};

export default Message;
// MainPanel의 renderMessages에서 모든 걸 처리하기엔 너무 무거워서 Message라는 컴포넌트로 따로 쪼개놨다.
