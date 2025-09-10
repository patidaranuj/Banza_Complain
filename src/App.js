// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import CustomerPortal from "./pages/CustomerPortal";
import SupportPortal from "./pages/SupportPortal";

function App() {
  return (
    <Router>
      <Routes>

        {/* Customer sees only the complaint form */}
        <Route path="/" element={<CustomerPortal />} />

        {/* Customer sees only the complaint form */}
        <Route path="/customer" element={<CustomerPortal />} />

        {/* Support sees the full dashboard with navbar and tickets */}
        <Route path="/support" element={<SupportPortal />} />

        {/* Default route can redirect or show something */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
