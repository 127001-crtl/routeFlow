import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./Login.jsx";
import SignUp from "./SignUp.jsx";

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <div className="rf-route" key={location.pathname}>
            <Routes location={location}>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
        </div>
    );
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <AnimatedRoutes />
        </BrowserRouter>
    </StrictMode>
);