import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import { Modal } from "antd";

/**
 * Hook to handle authentication-required actions
 * If user is not logged in, shows modal to login/register
 * If user is logged in, executes the action
 */
export const useAuthAction = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const requireAuth = (action, actionName = "complete this action") => {
    if (!user || !user.id) {
      // User not logged in
      Modal.confirm({
        title: "Login Required",
        content: `Please login or register to ${actionName}.`,
        okText: "Login",
        cancelText: "Register",
        onOk() {
          navigate("/admin/login");
        },
        onCancel() {
          navigate("/register");
        },
      });
      return false;
    }
    // User is logged in, execute action
    action();
    return true;
  };

  return { requireAuth, isLoggedIn: !!user?.id };
};

export default useAuthAction;
