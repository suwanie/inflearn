import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterPage.css";
import { useForm } from "react-hook-form";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import firebase from "../../firebase/firebase";
import md5 from "md5";
import { getDatabase, ref, set } from "@firebase/database";
const RegisterPage = () => {
  // loading은 submit button을 눌렀을 때 firebase측에서 유저를 생산하는 동안 submit button을 다시 클릭하는 것을 방지하기 위해
  const [loading, setLoading] = useState(false);
  // error를 console이 아니라 화면에 띄우기 위해
  const [errorFromSubmit, setErrorFromSubmit] = useState("");
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const password = useRef();
  password.current = watch("password");

  const onSubmit = async (data) => {
    // data라는 매개변수에는 register창에 입력된 정보들이 담겨진다.
    try {
      setLoading(true);
      const auth = getAuth();
      let createdUser = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      console.log("createdUser", createdUser);

      // user 정보에 이름과 포토 정보를 추가해준다.

      await createdUser.user.up;

      await updateProfile(auth.currentUser, {
        // 이 name은 input의 name이다.
        displayName: data.name,
        // 이름은 같을 수 있지만 email은 id기 때문에 유니크해서 email을 사용해 준다.
        photoURL: `http://gravatar.com/avatar/${md5(
          createdUser.user.email
        )}?d=identicon`,
      });

      // Firebase 데이터베이스에 저장해주기
      set(ref(getDatabase(), `users/${createdUser.user.uid}`), {
        name: createdUser.user.displayName,
        image: createdUser.user.photoURL,
      });

      setLoading(false);
    } catch (error) {
      setErrorFromSubmit(error.message);
      setLoading(false);
      setTimeout(() => {
        // err 문자 5초뒤 없애기
        setErrorFromSubmit("");
      }, 5000);
    }
  };

  return (
    <div className="auth-wrapper">
      <div style={{ textAlign: "center" }}>
        <h3>Register</h3>
      </div>
      {/* hook-form을 쓰기때문에 함수를 넣어준다. */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email</label>
        {/* useForm을 쓰기 위해선 ref에 register(등록)을 꼭 해줘야 한다. 만약 저 유효성 체크에 걸리게 되면 에러를 배출해준다.*/}
        <input
          name="email"
          type="email"
          {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
        />
        {/* 에러는 name이 필요하다. */}
        {errors.email && <p>This email field is required</p>}
        <label>Name</label>
        <input
          name="name"
          {...register("name", { required: true, maxLength: 10 })}
        />
        {/* type은 input의 required이며 이것의 참을 뜻한다. */}
        {errors.name && errors.name.type === "required" && (
          <p>This name field is required</p>
        )}
        {errors.name && errors.name.type === "maxLength" && (
          <p>Your input exceed maximum length</p>
        )}
        <label>Password</label>
        <input
          name="password"
          type="password"
          {...register("password", { required: true, minLength: 6 })}
        />
        {errors.password && errors.password.type === "required" && (
          <p>This password field is required</p>
        )}
        {errors.password && errors.password.type === "minLength" && (
          <p>Password must have at least 6 characters</p>
        )}
        <label>Password Confirm</label>
        <input
          name="password_confirm"
          type="password"
          {...register("password_confirm", {
            required: true,
            // password.current가 위의 password의 value이고 value는 password_confirm의 value이다.
            validate: (value) => value === password.current,
          })}
        />
        {errors.password_confirm &&
          errors.password_confirm.type === "required" && (
            <p>This Password confirm field is required</p>
          )}
        {errors.password_confirm &&
          errors.password_confirm.type === "validate" && (
            <p>The passwords do not match</p>
          )}
        {/* err가 있다면 그 문구를 보여주어라. */}
        {errorFromSubmit && <p>{errorFromSubmit} </p>}
        {/* submit이 true일때 disabled를 주는것 */}
        <input type="submit" disabled={loading} />
        <Link style={{ color: "gray", textDecoration: "none" }} to="login">
          이미 아이디가 있다면...{""}?
        </Link>
      </form>
    </div>
  );
};

export default RegisterPage;
