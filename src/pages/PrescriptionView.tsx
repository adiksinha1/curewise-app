import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Download, Loader2, QrCode } from "lucide-react";

const PrescriptionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prescription, setPrescription] = useState<any>(null);
  const [pdfHtml, setPdfHtml] = useState<string>("");

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const fetchPrescription = async () => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          doctor:doctor_id(
            profiles(full_name),
            doctor_credentials(specialization)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setPrescription(data);
    } catch (error: any) {
      console.error("Error fetching prescription:", error);
      toast({
        title: "Error",
        description: "Failed to load prescription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('generate-prescription-pdf', {
        body: { prescriptionId: id },
      });

      if (response.error) throw response.error;

      setPdfHtml(response.data.html);
      
      // Open in new window for printing/saving
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(response.data.html);
        printWindow.document.close();
      }

      toast({
        title: "Success",
        description: "Prescription PDF generated. You can now print or save it.",
      });
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="pt-6">
              <p>Prescription not found</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Prescription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prescription Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-medium">{prescription.doctor?.profiles?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Specialization</p>
                <p className="font-medium">{prescription.doctor?.doctor_credentials?.specialization || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{prescription.patient_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{prescription.patient_age} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(prescription.prescription_date).toLocaleDateString()}</p>
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

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button onClick={generatePDF} disabled={generating} className="flex-1">
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => navigate(`/verify?id=${id}`)}>
                <QrCode className="mr-2 h-4 w-4" />
                View QR
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PrescriptionView;