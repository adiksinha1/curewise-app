import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, Eye, Loader2 } from "lucide-react";

const MyPrescriptions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      const role = roleData?.role || "patient";
      setUserRole(role);

      // Fetch prescriptions based on role
      let query = supabase
        .from("prescriptions")
        .select(`
          *,
          doctor:doctor_id(
            profiles(full_name),
            doctor_credentials(specialization)
          ),
          patient:patient_id(
            profiles(full_name)
          )
        `)
        .order("created_at", { ascending: false });

      if (role === "doctor") {
        query = query.eq("doctor_id", user.id);
      } else {
        query = query.eq("patient_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">My Prescriptions</h1>
              <p className="text-muted-foreground">
                {userRole === "doctor" 
                  ? "Prescriptions you've issued" 
                  : "Your medical prescriptions"}
              </p>
            </div>
            {userRole === "doctor" && (
              <Button onClick={() => navigate("/create-prescription")}>
                <FileText className="mr-2 h-4 w-4" />
                New Prescription
              </Button>
            )}
          </div>

          {prescriptions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No prescriptions found</p>
                {userRole === "doctor" && (
                  <Button onClick={() => navigate("/create-prescription")}>
                    Create First Prescription
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {prescriptions.map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {userRole === "doctor" 
                            ? `Patient: ${prescription.patient_name}` 
                            : `Dr. ${prescription.doctor?.profiles?.full_name || 'N/A'}`}
                        </CardTitle>
                        <CardDescription>
                          {new Date(prescription.prescription_date).toLocaleDateString()} • {prescription.diagnosis}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {prescription.medicines.length} medicine(s)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {userRole === "doctor" && (
                          <p>Age: {prescription.patient_age} years</p>
                        )}
                        {userRole === "patient" && (
                          <p>Specialization: {prescription.doctor?.doctor_credentials?.specialization || 'N/A'}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/prescription/${prescription.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyPrescriptions;