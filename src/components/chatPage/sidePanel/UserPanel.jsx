import React, { useRef } from "react";
import { IoIosChatboxes } from "react-icons/io";
import Dropdown from "react-bootstrap/Dropdown";
import Image from "react-bootstrap/Image";
import mime from "mime-types";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { getDatabase, ref, update } from "firebase/database";
import {
  getStorage,
  ref as strRef,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { setPhotoURL } from "../../../redux/actions/user/user_action";

const UserPanel = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser);
  const inputOpenRef = useRef();
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // signout successful.
      })
      .catch((err) => {
        // An err happened
      });
  };

  // 프로필 사진 변경을 클릭했을때 input창이 눌리게끔 하기 위해
  const handleClickImgRef = () => {
    inputOpenRef.current.click();
  };

  // Firebase로 img를 보내는 역할
  const handleUploadImg = async (e) => {
    const file = e.target.files[0];
    const auth = getAuth();
    // redux store의 정보를 쓴다는 것인가?
    const user = auth.currentUser;
    // name 뒤에 확장자가 붙어 있으니까 알 수 있나보다.
    const metadata = { contentType: mime.lookup(file.name) };
    const storage = getStorage();
    // 스토리지에 파일 저장하기
    try {
      let uploadTask = uploadBytesResumable(
        // user_image라는 폴더 아래 user.uid라는 이름으로 저장이 될 것이다.
        strRef(storage, `user_image/${user.uid}`),
        file,
        metadata
      );

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case "storage/unauthorized":
              // User doesn't have permission to access the object
              break;
            case "storage/canceled":
              // User canceled the upload
              break;

            case "storage/unknown":
              break;
          }
        },
        () => {
          // storage에서 이미지URL를 가져오는 부분?->프로필사진 변경을 위해
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // 프로필 이미지 수정
            updateProfile(user, { photoURL: downloadURL });

            dispatch(setPhotoURL(downloadURL));
            // 데이터베이스 이미지 수정
            update(ref(getDatabase(), `users/${user.uid}`), {
              image: downloadURL,
            });
          });
        }
      );
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div>
      {/* Logo */}
      <h3 style={{ color: "white" }}>
        <IoIosChatboxes />
        {""}Chat App
      </h3>
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        <Image
          src={user && user.photoURL}
          style={{ width: "30px", height: "30px", marginTop: "3px" }}
          roundedCircle
        />
        <Dropdown>
          <Dropdown.Toggle
            style={{ background: "transparent", border: "0px" }}
            id="dropdown-basic"
          >
            {user && user.displayName}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={handleClickImgRef}>
              프로필 사진 변경
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>로그아웃</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <input
        onChange={handleUploadImg}
        type="file"
        style={{ display: "none" }}
        ref={inputOpenRef}
        accept="image/jpeg, image/png"
      />
    </div>
  );
};

export default UserPanel;
