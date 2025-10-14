import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Calendar, FileText, Users, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalAppointments: 0, totalPrescriptions: 0 });

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

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "doctor")
        .single();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "This dashboard is only for doctors",
          variant: "destructive",
        });
        navigate("/dashboard");
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
      .select(`
        *,
        patient:patient_id(
          profiles(full_name, phone, email)
        )
      `)
      .eq("doctor_id", userId)
      .gte("appointment_date", new Date().toISOString())
      .order("appointment_date", { ascending: true })
      .limit(5);

    if (!error && data) {
      setAppointments(data);
      const { count } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", userId);
      setStats(prev => ({ ...prev, totalAppointments: count || 0 }));
    }
  };

  const fetchPrescriptions = async (userId: string) => {
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("doctor_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentPrescriptions(data);
      const { count } = await supabase
        .from("prescriptions")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", userId);
      setStats(prev => ({ ...prev, totalPrescriptions: count || 0 }));
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
              <p className="text-muted-foreground">Manage your appointments and prescriptions</p>
            </div>
            <Button onClick={() => navigate("/create-prescription")}>
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPrescriptions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointments.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled patient appointments</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/my-prescriptions")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {appointment.patient?.profiles?.full_name || "N/A"}
                        </h3>
                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={appointment.status === "completed" ? "default" : "secondary"}>
                          {appointment.status}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/create-prescription?patient=${appointment.patient_id}`)}
                        >
                          Create Prescription
                        </Button>
                      </div>
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
                  <CardDescription>Your recently issued prescriptions</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/my-prescriptions")}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentPrescriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No prescriptions yet</p>
              ) : (
                <div className="space-y-4">
                  {recentPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/prescription/${prescription.id}`)}
                    >
                      <div>
                        <h3 className="font-semibold">{prescription.patient_name}</h3>
                        <p className="text-sm text-muted-foreground">{prescription.diagnosis}</p>
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

export default DoctorDashboard;
