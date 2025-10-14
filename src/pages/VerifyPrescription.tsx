import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

const VerifyPrescription = () => {
  const [searchParams] = useSearchParams();
  const prescriptionId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [prescription, setPrescription] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (prescriptionId) {
      verifyPrescription();
    } else {
      setError("No prescription ID provided");
      setLoading(false);
    }
  }, [prescriptionId]);

  const verifyPrescription = async () => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          doctor:doctor_id(
            profiles(full_name),
            doctor_credentials(specialization, license_number)
          )
        `)
        .eq("id", prescriptionId)
        .single();

      if (error) throw error;
      setPrescription(data);
    } catch (error: any) {
      console.error("Error verifying prescription:", error);
      setError("Prescription not found or invalid");
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
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {prescription ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Verified Prescription
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  Verification Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : prescription ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ✓ Authentic Prescription
                  </Badge>
                </div>

                {/* Prescription Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Prescription ID</p>
                    <p className="font-medium font-mono text-xs">{prescriptionId?.slice(0, 16)}...</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Issued</p>
                    <p className="font-medium">{new Date(prescription.prescription_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor</p>
                    <p className="font-medium">{prescription.doctor?.profiles?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Specialization</p>
                    <p className="font-medium">{prescription.doctor?.doctor_credentials?.specialization || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">License Number</p>
                    <p className="font-medium">{prescription.doctor?.doctor_credentials?.license_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{prescription.patient_name}</p>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <h3 className="font-semibold mb-2">Diagnosis</h3>
                  <p className="text-muted-foreground">{prescription.diagnosis}</p>
                </div>

                {/* Medicines */}
                <div>
                  <h3 className="font-semibold mb-2">Prescribed Medicines</h3>
                  <div className="space-y-2">
                    {prescription.medicines.map((med: any, idx: number) => (
                      <Card key={idx}>
                        <CardContent className="pt-4">
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.dosage}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Advice */}
                {prescription.advice && (
                  <div>
                    <h3 className="font-semibold mb-2">Doctor's Advice</h3>
                    <p className="text-muted-foreground">{prescription.advice}</p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    This prescription has been verified as authentic and issued by a licensed healthcare provider.
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyPrescription;