
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HostDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to overview page
    navigate("/host-dashboard/overview", { replace: true });
  }, [navigate]);

  return null;
};

export default HostDashboard;
