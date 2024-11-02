import React, { useState } from "react";
import { auth } from "../config/firebase";
import { toast } from "react-toastify";
import { sendPasswordResetEmail } from "firebase/auth";
const Forgot = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.", {
        position: "top-center",
      });
    } catch (error: any) {
      console.error("Error sending password reset email:", error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        <form onSubmit={handleSubmit}>
          <h3>Forgot Password</h3>

          <div className="mb-3">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Send Reset Link
            </button>
          </div>

          <p className="forgot-password text-left">
            <a href="/login">Back To Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Forgot;
