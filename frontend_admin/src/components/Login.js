import React, { useState } from "react";
import axios from "axios";
import "../style/Login.css";

const API_URL = "http://localhost:8001";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post(`${API_URL}/login`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = response.data;

      localStorage.setItem("token", access_token);
      onLoginSuccess();
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng.");
      } else if (err.response?.status === 403) {
        setError("Tài khoản của bạn không có quyền truy cập.");
      } else {
        setError("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <>
      <div className="login-background"></div>
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-title">Đăng nhập</h2>

          <label className="login-label" htmlFor="username">
            Tên đăng nhập(dùng để test: reyn)
          </label>
          <input
            id="username"
            className="login-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            placeholder="Nhập tên đăng nhập"
          />

          <label className="login-label" htmlFor="password">
            Mật khẩu (dùng để test: ReynisLuv)
          </label>
          <input
            id="password"
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu"
          />

          {error && <p className="login-error">{error}</p>}

          <button className="login-button" type="submit">
            Đăng nhập
          </button>
        </form>
      </div>
    </>
  );
}