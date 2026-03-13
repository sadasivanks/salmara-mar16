import Dashboard from "@/components/Dashboard";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Basic auth check
    const savedSession = localStorage.getItem('salmara_session');
    if (!savedSession) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
