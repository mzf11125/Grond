import { Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/landing/LandingPage";
import { DashboardLayout } from "@/pages/dashboard/DashboardLayout";
import { IntelPage } from "@/pages/dashboard/IntelPage";
import { ReconPage } from "@/pages/dashboard/ReconPage";
import { DatasheetPage } from "@/pages/dashboard/DatasheetPage";
import { AdminPage } from "@/pages/dashboard/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<IntelPage />} />
        <Route path="recon" element={<ReconPage />} />
        <Route path="datasheet" element={<DatasheetPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
