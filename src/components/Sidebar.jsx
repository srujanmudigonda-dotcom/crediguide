import {
  BarChart3,
  Bell,
  CreditCard,
  Gauge,
  Home,
  Lightbulb,
  User,
  Wallet,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard",
    },
    {
      name: "Credit Score",
      icon: Gauge,
      path: "/credit-score",
    },
    {
      name: "Payments",
      icon: CreditCard,
      path: "/payments",
    },
    {
      name: "Loans & Dues",
      icon: Wallet,
      path: "/loans",
    },
    {
      name: "Score History",
      icon: BarChart3,
      path: "/score-history",
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
    {
      name: "Improvement Plan",
      icon: Lightbulb,
      path: "/improvement-plan",
    },
    {
      name: "Profile",
      icon: User,
      path: "/profile",
    },
  ];

  return (
    <aside className="hidden min-h-screen w-64 border-r border-gray-200 bg-white lg:block">

      <div className="p-4">

        <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Main Menu
        </p>

        <nav className="space-y-1">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      className={`transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-white" : ""
                      }`}
                    />

                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}

        </nav>

      </div>

    </aside>
  );
}

export default Sidebar;