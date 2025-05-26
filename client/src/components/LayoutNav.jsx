
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const LayoutNav = () => {
  

  return (
    <div className="flex h-screen">
      <Navbar/>
      <div className={`flex-1 flex flex-col transition-all duration-300`}>
        <main className="p-2  mt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutNav;

