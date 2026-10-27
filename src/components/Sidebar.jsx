import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Payments", path: "/payments" },
    { name: "Loans", path: "/loans" },
    {
      name: "Credit Impact Simulator",
      path: "/credit-impact",
    },
    {
      name: "EMI Default Risk Prediction",
      path: "/emi-risk",
    },
    {
      name: "AI Credit Report Explainer",
      path: "/credit-report-explainer",
    },
    { name: "Score History", path: "/score-history" },
    { name: "Improvement Plan", path: "/improvement-plan" },
    {
      name: "Repayment Advisor",
      path: "/repayment-advisor",
    },
    {
      name: "Payment Prevention",
      path: "/payment-prevention",
    },
    
    {
      name: "Notifications",
      path: "/notifications",
    },
    { name: "Profile", path: "/profile" },
    {
      name: "AI Financial Assistant",
      path: "/financial-assistant",
    },
  ];

  return (
    <aside className="hidden min-h-[calc(100vh-64px)] w-64 shrink-0 bg-white shadow-sm md:block">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`
              }
            >
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;