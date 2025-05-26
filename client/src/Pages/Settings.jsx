import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  LayoutGrid,
  Cable,
  Palette,
  DatabaseZap,
  ArrowLeft,
  Search as SearchIcon,
} from "lucide-react";

// Reusable Settings Card Component
const SettingsCard = ({ icon, title, links, linkClasses }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200/80 transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl group">
      <div className="flex items-center mb-4"> {/* Reduced mb */}
        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-lg mr-3 shadow-md group-hover:scale-110 transition-transform duration-300 ease-out"> {/* Reduced p, mr */}
          {React.cloneElement(icon, { size: 20 })} {/* Reduced icon size */}
        </div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2> {/* Was text-xl */}
      </div>
      <ul className="space-y-1.5"> {/* Reduced space-y */}
        {links.map((link) => (
          <li key={link.name}>
            <Link
              to={link.path}
              className={`${linkClasses} hover:pl-3 hover:border-l-2 hover:border-purple-500`} // Reduced hover:pl
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Settings = () => {
  const linkClasses =
    "block px-2.5 py-1.5 rounded-md text-gray-700 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"; // Reduced padding, text-sm

  const cardItems = [
    {
      id: "organization",
      title: "Organization",
      icon: <Users />,
      links: [
        { name: "Basic Information", path: "/admin?tab=organization-basic-information" },
        { name: "Business Hours", path: "/admin?tab=organization-business-hours" },
        { name: "Custom Domain", path: "/admin?tab=organization-custom-domain" },
        { name: "Recruiters", path: "/admin?tab=organization-recruiters" },
        { name: "Domain Authentication", path: "/admin?tab=organization-domain-authentication" },
      ],
    },
    {
      id: "modules",
      title: "Modules",
      icon: <LayoutGrid />,
      links: [
        { name: "Workspaces", path: "/admin?tab=modules-workspaces" },
        { name: "Customer Module Settings", path: "/admin?tab=modules-customer" },
        { name: "In-person Locations", path: "/admin?tab=modules-in-person-locations" },
        { name: "Customers Management", path: "/admin?tab=modules-customers" },
        { name: "Reports", path: "/admin?tab=modules-reports" },
      ],
    },
    {
      id: "integrations",
      title: "Integrations",
      icon: <Cable />,
      links: [
        { name: "Most Popular", path: "/admin?tab=most-popular" },
        { name: "Calendars", path: "/admin?tab=integrations-calendars" },
        { name: "Video Conferencing", path: "/admin?tab=integrations-video-conferencing" },
        { name: "CRM & Sales", path: "/admin?tab=integrations-crm-sales" },
        { name: "Payments", path: "/admin?tab=integrations-payments" },
      ],
    },
    {
      id: "product-customization",
      title: "Product Customization",
      icon: <Palette />,
      links: [
        { name: "In-product Notifications", path: "/admin?tab=in-product-notififcations" },
        { name: "Custom Labels", path: "/admin?tab=customizations-labels" },
        { name: "Roles and Permissions", path: "/admin?tab=roles-permissions" },
      ],
    },
    {
      id: "data-administration",
      title: "Data Administration",
      icon: <DatabaseZap />,
      links: [
        { name: "Privacy and Security", path: "/admin?tab=data-privacy" },
        { name: "Exports", path: "/admin?tab=data-exports" },
      ],
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-100/80 backdrop-blur-md shadow-sm h-16 flex items-center"> {/* Reduced h */}
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-2"> {/* Reduced space-x */}
            <button
              onClick={() => window.history.back()}
              className="p-1.5 rounded-full hover:bg-gray-200/70 transition-colors" // Reduced p
              aria-label="Go back"
            >
              <ArrowLeft
                size={20} // Reduced icon size
                className="text-gray-700 hover:text-purple-600 transition-colors"
              />
            </button>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight"> {/* Was text-2xl */}
              Admin Settings
            </h1>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search settings..."
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all w-56 md:w-72 text-sm" // Reduced padding, text-sm
            />
            <SearchIcon
              size={16} // Reduced icon size
              className="text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" // Adjusted position
            />
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-2 font-sans"> {/* Reduced pt to pt-20 (16 header + 4 space) */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Reduced gap */}
            {cardItems.map((card) => (
              <SettingsCard
                key={card.id}
                icon={card.icon}
                title={card.title}
                links={card.links}
                linkClasses={linkClasses}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Settings;