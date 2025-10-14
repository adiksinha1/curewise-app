import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User as UserIcon, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      await Promise.all([fetchAppointments(user.id), fetchPrescriptions(user.id)]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async (userId: string) => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", userId)
      .gte("appointment_date", new Date().toISOString())
      .order("appointment_date", { ascending: true })
      .limit(3);

    if (!error && data) {
      setAppointments(data);
    }
  };

  const fetchPrescriptions = async (userId: string) => {
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!error && data) {
      setPrescriptions(data);
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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Patient Dashboard</h1>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/symptom-checker")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Symptom Checker
                </CardTitle>
                <CardDescription>Check your symptoms and get AI-powered insights</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/book-appointment")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Book Appointment
                </CardTitle>
                <CardDescription>Schedule an appointment with a doctor</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/doctors")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Find Doctors
                </CardTitle>
                <CardDescription>Search for doctors by specialization</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Upcoming Appointments */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled appointments</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/book-appointment")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                  <Button onClick={() => navigate("/book-appointment")}>Book Appointment</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold">{appointment.reason}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Prescriptions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Prescriptions</CardTitle>
                  <CardDescription>Your medical prescriptions</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/my-prescriptions")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {prescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No prescriptions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/prescription/${prescription.id}`)}
                    >
                      <div>
                        <h3 className="font-semibold">{prescription.diagnosis}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {prescription.medicines.length} medicine(s)
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientDashboard;
