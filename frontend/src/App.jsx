import { Routes, Route, Link } from "react-router-dom";

function SignIn() {
  return (
    <div className="card">
      <h2>Welcome back</h2>
      <p className="subtitle">Sign in to continue</p>

      <label>Email:</label>
      <input type="email" placeholder="Email Address" />
      <label>Password:</label>
      <input type="password" placeholder="Password" />

      <button className="btn">Sign In →</button>

      <p className="linkText">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

function SignUp() {
  return (
    <div className="card">
      <h2>Create your account</h2>
      <p className="subtitle">Start managing e-waste responsibly</p>
      <label>Full Name*:</label>
      <input type="text" placeholder="Full Name" />
      <label>Phone Number:</label>
      <input type="text" placeholder="Phone Number" />
      <label>Address:</label>
      <input type="text" placeholder="Address" />
      <label>Email*:</label>
      <input type="email" placeholder="Email Address" />
      <label>Password*:</label>
      <input type="password" placeholder="Password" />
      <label>Confirm Password:</label>
      <input type="password" placeholder="Confirm Password" />

      <button className="btn">Create Account →</button>

      <p className="linkText">
        Already have an account? <Link to="/">Sign in</Link>
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="page">
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </div>
  );
}