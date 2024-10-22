import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "./Alert";
import Button from "./Button";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alertVisible, setAlertVisibility] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertVisibility(true);
    console.log("Register button clicked/enter button");

    {
      /*User input handling */
    }
    console.log("Username: ", username);
    console.log("Password: ", password);

    setUsername("");
    setPassword("");
  };
  return (
    <div className="container-fluid">
      <h1>Create a new account</h1>
      <form onSubmit={handleSubmit}>
        {/*Alert appears upon submission (Enter or click button) */}
        {alertVisible && (
          <Alert onClose={() => setAlertVisibility(false)}>Registered</Alert>
        )}

        {/*Username label and input */}
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>

        {/*Password label and input */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>

        <div className="mb-3">
          <Button onClick={() => {}} color="success">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Register;
