import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import UploadPageSimple from "./pages/UploadPageSimple";
import DashboardPage from "./pages/DashboardPage";
import PlanPage from "./pages/PlanPage";
import ReusePage from "./pages/ReusePage";
import RebuildPage from "./pages/RebuildPage";
import WasteDisposalPage from "./pages/WasteDisposalPage";
import ConfigurationPage from "./pages/ConfigurationPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPageSimple />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/reuse" element={<ReusePage />} />
          <Route path="/rebuild" element={<RebuildPage />} />
          <Route path="/waste-disposal" element={<WasteDisposalPage />} />
          <Route path="/configuration" element={<ConfigurationPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
