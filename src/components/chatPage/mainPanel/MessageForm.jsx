import React, { useRef } from "react";
import mime from "mime-types";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useState } from "react";
import { useSelector } from "react-redux";
import firebase from "../../../firebase/firebase";
import { child, getDatabase, push, ref, set } from "@firebase/database";
import {
  getDownloadURL,
  getStorage,
  ref as strRef,
  uploadBytesResumable,
} from "@firebase/storage";

const MessageForm = () => {
  const inputOpenImgRef = useRef();

  //useSelector로 특정 DOM?을 선택 -> ref비슷한듯? state의 chatRoom의 currentChatRoom를 선택
  const [percentage, setPercentage] = useState(0);
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const user = useSelector((state) => state.user.currentUser);
  const isPrivateChatRoom = useSelector(
    (state) => state.chatRoom.isPrivateChatRoom
  );
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

  const handleOpenImgRef = () => {
    inputOpenImgRef.current.click();
  };

  // 경로를 private과 public을 다르게 해준다.
  const getPath = () => {
    if (isPrivateChatRoom) {
      // 나중에 storage를 가보면 방이 두 개가 있는데 이것은 나의 아이디와 상대방의 아이디를 들어가기 때문에 방이 많은 것이다. 구조적으로 어쩔 수 없음
      return `message/private/${chatRoom.id}`;
    } else {
      return `message/public`;
    }

    // `/message/${chatRoom.id}`; 한곳에 데이터를 저장
  };

  // firebase에 이미지 저장
  const handleUploadImg = (e) => {
    // file정보 받기 ->이후 파일을 어디다 저장하고 어떤 파일을 저장할 것인지 정해준다. ->firebase storage에다가,
    const file = e.target.files[0];
    const storage = getStorage();
    const filePath = `${getPath()}/${file.name}`;
    const metaDate = { contentType: mime.lookup(file.name) };
    // upload버튼이 두번 안눌리게,
    setLoading(true);
    try {
      const storageRef = strRef(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file, metaDate);

      // Progress Bar
      // state_changed해주면 snapshot 이라는 정보를 firebase에서 전달해준다.
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          // bytesTransferred 얼마나 전송이 됐는지 bytes로 알려준다. 그리고 state에 담아준다.
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + " % done");
          // 아랫것으로 하면 0와 100만 뜨는데 위에 것은 소수점까지 표시가 된다.
          // console.log(`Upload is ${progress} % done`);
          setPercentage(progress);
        },
        (error) => {
          switch (error.code) {
            case "storage/unauthorized":
              //  User doesn't have permission to access the object
              break;
            case "storage/canceled":
              // User canceled the upload
              break;
            case "storage/unkwon":
              break;
          }
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          // 먼저 저장된 파일을 다운로드 받을 수 있는 URL 가져오기
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // console.log("downloadURL", downloadURL);
            // messagesRef는 아까 그 messages에 접근하는 함수
            set(
              push(child(messagesRef, chatRoom.id)),
              // 위에서 만든 함수, content가 들어오면 content, image가 들어오면 file ㅇㅋ?
              createMessage(downloadURL)
            );
            // 파일 전송과 로딩이 끝나면 다시 false 바꿔서 업로드가 가능하게 끔
            setLoading(false);
          });
        }
      );
    } catch (err) {
      console.log(err);
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
      {/* percentage가 0 또는 100일때 progress bar가 안보이게끔*/}
      {!(percentage === 0 || percentage === 100) && (
        <ProgressBar
          variant="warning"
          label={`${percentage}%`}
          now={percentage}
        />
      )}

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
            // loading 중이면 true고 아니면 false이고
            disabled={loading ? true : false}
          >
            SEND
          </button>
        </Col>
        <Col>
          <button
            onClick={handleOpenImgRef}
            className="message_form_button"
            style={{ width: "100%" }}
            disabled={loading ? true : false}
          >
            UPLOAD
          </button>
        </Col>
      </Row>

      {/* 마찬가지로 upload버튼을 눌러서 파일 선택하는 창이 뜨게끔 하고싶다. =>useRef를 이용해서 upload DOM선택, 얼래 firebase에 넘기는건데 왜 onChange이지? submit이 아니라*/}
      <input
        type="file"
        style={{ display: "none" }}
        ref={inputOpenImgRef}
        onChange={handleUploadImg}
        accept="image/jpeg, image/png"
      />
    </div>
  );
};

export default MessageForm;
