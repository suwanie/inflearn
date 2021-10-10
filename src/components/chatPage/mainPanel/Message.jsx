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
  return (
    <Media style={{ marginBottom: "3px" }}>
      <img
        style={{ borderRadius: "10px" }}
        width={64}
        height={64}
        className="mr-3"
        src={message.user.image}
        alt={message.user.name}
      />
      <Media.Body>
        <h6>
          {message.user.name}
          {""}
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
