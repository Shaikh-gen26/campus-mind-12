import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Access Denied</h1>
        <p className="sub">Your account doesn't have permission to view that page.</p>
        <Link className="btn-primary" style={{ display: "block", textAlign: "center", textDecoration: "none" }} to="/">
          Return to your dashboard
        </Link>
      </div>
    </div>
  );
}
