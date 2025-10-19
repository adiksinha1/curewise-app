import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Plus, Trash2, FileText } from "lucide-react";
import { z } from "zod";

const prescriptionSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  patientName: z.string().trim().min(1, "Patient name is required").max(100, "Name must be less than 100 characters"),
  patientAge: z.number().int().min(0, "Age must be positive").max(150, "Age must be less than 150"),
  diagnosis: z.string().trim().min(5, "Diagnosis must be at least 5 characters").max(500, "Diagnosis must be less than 500 characters"),
  medicines: z.array(z.object({
    name: z.string().trim().min(1, "Medicine name is required").max(200, "Medicine name must be less than 200 characters"),
    dosage: z.string().trim().min(1, "Dosage is required").max(200, "Dosage must be less than 200 characters")
  })).min(1, "At least one medicine is required"),
  advice: z.string().max(1000, "Advice must be less than 1000 characters").optional()
});

interface Medicine {
  name: string;
  dosage: string;
}

const CreatePrescription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientId: "",
    diagnosis: "",
    advice: "",
  });
  
  const [patients, setPatients] = useState<any[]>([]);
  
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: "", dosage: "" }]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // SECURITY NOTE: This client-side role check is for UX only (showing/hiding UI).
    // The real security is enforced server-side through RLS policies on the prescriptions table.
    // RLS policies require has_role(auth.uid(), 'doctor') for INSERT operations, which cannot be bypassed.
    // Never trust client-supplied role information for backend authorization.
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "doctor")
      .single();

    if (!roleData) {
      toast({
        title: "Access Denied",
        description: "Only doctors can create prescriptions",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setUser(user);
    
    // Fetch patients from appointments
    const { data: appointmentsData } = await supabase
      .from("appointments")
      .select(`
        patient_id
      `)
      .eq("doctor_id", user.id);

    if (appointmentsData) {
      const patientIds = [...new Set(appointmentsData.map(a => a.patient_id))];
      
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, date_of_birth")
        .in("id", patientIds);
        
      if (profilesData) {
        setPatients(profilesData);
      }
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "" }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data using zod schema
      const validationData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge) || 0,
        diagnosis: formData.diagnosis,
        medicines: medicines.filter(m => m.name.trim() && m.dosage.trim()),
        advice: formData.advice || undefined
      };

      const result = prescriptionSchema.safeParse(validationData);
      
      if (!result.success) {
        const errors = result.error.errors;
        throw new Error(errors[0].message);
      }

      const validMedicines = result.data.medicines;

      // Create prescription
      const { data: prescription, error: prescError } = await supabase
        .from("prescriptions")
        .insert([{
          doctor_id: user.id,
          patient_id: formData.patientId,
          patient_name: formData.patientName,
          patient_age: parseInt(formData.patientAge),
          diagnosis: formData.diagnosis,
          medicines: validMedicines as any,
          advice: formData.advice || null,
        }])
        .select()
        .single();

      if (prescError) throw prescError;

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });

      // Navigate to prescription view/download page
      navigate(`/prescription/${prescription.id}`);
    } catch (error: any) {
      console.error("Error creating prescription:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Create Prescription
            </CardTitle>
            <CardDescription>
              Fill in the patient details and prescription information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientSelect">Select Patient</Label>
                    <select
                      id="patientSelect"
                      className="w-full p-2 border rounded-md"
                      value={formData.patientId}
                      onChange={(e) => {
                        const selectedPatient = patients.find(p => p.id === e.target.value);
                        if (selectedPatient) {
                          const age = selectedPatient.date_of_birth 
                            ? Math.floor((new Date().getTime() - new Date(selectedPatient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))
                            : "";
                          setFormData({ 
                            ...formData, 
                            patientId: selectedPatient.id,
                            patientName: selectedPatient.full_name,
                            patientAge: age.toString()
                          });
                        }
                      }}
                      required
                    >
                      <option value="">Choose a patient</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.full_name} ({patient.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="patientAge">Age</Label>
                    <Input
                      id="patientAge"
                      type="number"
                      value={formData.patientAge}
                      onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                      required
                      min="1"
                      max="150"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <Label htmlFor="diagnosis">Diagnosis / Symptoms</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                  rows={4}
                  placeholder="Enter diagnosis or symptoms..."
                />
              </div>

              {/* Medicines */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Medicines</h3>
                  <Button type="button" onClick={addMedicine} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
                {medicines.map((medicine, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Medicine Name</Label>
                          <Input
                            value={medicine.name}
                            onChange={(e) => updateMedicine(index, "name", e.target.value)}
                            placeholder="e.g., Amoxicillin"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label>Dosage</Label>
                            <Input
                              value={medicine.dosage}
                              onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                              placeholder="e.g., 500mg twice daily for 7 days"
                              required
                            />
                          </div>
                          {medicines.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMedicine(index)}
                              className="mt-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Advice */}
              <div>
                <Label htmlFor="advice">Doctor's Advice / Notes (Optional)</Label>
                <Textarea
                  id="advice"
                  value={formData.advice}
                  onChange={(e) => setFormData({ ...formData, advice: e.target.value })}
                  rows={3}
                  placeholder="Additional advice or instructions for the patient..."
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Prescription"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CreatePrescription;