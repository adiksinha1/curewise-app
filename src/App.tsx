import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupportChatbot } from "@/components/SupportChatbot";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorSearch from "./pages/DoctorSearch";
import BookAppointment from "./pages/BookAppointment";
import Contact from "./pages/Contact";
import SymptomChecker from "./pages/SymptomChecker";
import MedicalHistory from "./pages/MedicalHistory";
import CreatePrescription from "./pages/CreatePrescription";
import PrescriptionView from "./pages/PrescriptionView";
import MyPrescriptions from "./pages/MyPrescriptions";
import VerifyPrescription from "./pages/VerifyPrescription";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DashboardRouter = () => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      setUserRole(roleData?.role || "patient");
    } catch (error) {
      console.error("Error checking role:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userRole === "doctor") {
    return <DoctorDashboard />;
  }

  return <PatientDashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/doctors" element={<DoctorSearch />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route path="/medical-history" element={<MedicalHistory />} />
          <Route path="/create-prescription" element={<CreatePrescription />} />
          <Route path="/prescription/:id" element={<PrescriptionView />} />
          <Route path="/my-prescriptions" element={<MyPrescriptions />} />
          <Route path="/verify" element={<VerifyPrescription />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SupportChatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
