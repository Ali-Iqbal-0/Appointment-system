// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer,Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./Pages/Appoinments";
import Layout from "./components/Layout"; // Assuming this component exists
import Calls from "./Pages/Calls";
import BookingPages from "./Pages/BookingPages";
import Workflows from "./Pages/Workflows";
import Recruiters from "./Pages/Recruiters";
import Profile from "./Pages/Profile";
import NewConsulting from "./Pages/Newconsulting";
import CreateConsultingEventPage from "./Pages/CreateConsultingEventPage";
import ConsultingEventDetailPage from "./Pages/ConsultingEventDetailPage";
import BookingEmbedPage from "./Pages/BookingEmbedPage";
import Settings from "./Pages/Settings";
import AdminCenter from "./Pages/AdminCenter";
import LayoutNav from "./components/LayoutNav";
import Calender from "./Pages/Calender"; // Assuming this component exists

// ... other pages

function App() {
  return (
    <BrowserRouter>
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
  
    <Routes>
      {/* Main layout routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/calls" element={<Calls />} />
        <Route path="/pages" element={<BookingPages />} />
        <Route path="/flows" element={<Workflows />} />
        <Route path="/recruit" element={<Recruiters />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
  
      {/* Admin/settings routes */}
      <Route element={<LayoutNav />}>
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<AdminCenter />} />
          <Route path="/calender" element={<Calender />} />
      </Route>
  
      {/* Independent routes (no layout) */}
      <Route path="/new-consulting" element={<NewConsulting />} />
      <Route
        path="/create-event/:eventType/:bookingCadence"
        element={<CreateConsultingEventPage />}
      />
      <Route
        path="/consulting-details/:eventId"
        element={<ConsultingEventDetailPage />}
      />
      <Route path="/calls/embed/:eventId" element={<BookingEmbedPage />} />
    </Routes>
  </BrowserRouter>
  
  );
}

export default App;
