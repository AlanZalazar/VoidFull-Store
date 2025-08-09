import LoginFormAdmin from "../components/LoginFormAdmin";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { currentUser } = useAuth();

  return (
    <div className="p-6">
      <LoginFormAdmin />
    </div>
  );
}

export default Login;
