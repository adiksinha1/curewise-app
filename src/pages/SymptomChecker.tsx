import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Calendar, Clock, Activity, Stethoscope, FileText, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AnalysisResult {
  conditions: Array<{
    name: string;
    likelihood: string;
    description: string;
  }>;
  severity: string;
  isEmergency: boolean;
  recommendations: string[];
  specialists: string[];
  whenToSeekCare: string;
  disclaimer: string;
}

const SymptomChecker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [hasMedicalHistory, setHasMedicalHistory] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check if user has medical history
        const { data } = await supabase
          .from('patient_medical_history')
          .select('id')
          .eq('patient_id', user.id)
          .single();
        
        setHasMedicalHistory(!!data);
      }
    };

    fetchUser();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'emergency':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'severe':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your symptoms",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      // Get the session to pass auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('symptom-checker', {
        body: { symptoms, duration, severity, age },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Analysis Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setAnalysis(data);

      if (data.isEmergency) {
        toast({
          title: "⚠️ Urgent Care Needed",
          description: "Your symptoms may require immediate medical attention",
          variant: "destructive",
        });
      } else if (user && hasMedicalHistory) {
        toast({
          title: "Analysis Complete",
          description: "Your medical history was considered in this analysis",
        });
      }
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      toast({
        title: "Error",
        description: "Failed to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    if (analysis?.specialists && analysis.specialists.length > 0) {
      navigate('/book-appointment', { 
        state: { specialist: analysis.specialists[0] }
      });
    } else {
      navigate('/book-appointment');
    }
  };

  const handleFindSpecialist = () => {
    if (analysis?.specialists && analysis.specialists.length > 0) {
      navigate('/doctors', { 
        state: { specialization: analysis.specialists[0] }
      });
    } else {
      navigate('/doctors');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl space-y-6">
          {/* Header with Disclaimer */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold">
              AI Symptom Checker
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Describe your symptoms and get preliminary guidance. Remember, this is not a substitute for professional medical advice.
            </p>
            
            {/* Medical History Status */}
            {user && (
              <div className="flex justify-center gap-3">
                {hasMedicalHistory ? (
                  <Alert className="border-green-200 bg-green-50 max-w-md">
                    <FileText className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      Your medical history will be used for more accurate analysis
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-blue-200 bg-blue-50 max-w-md">
                    <User className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700 flex items-center justify-between">
                      <span>Add your medical history for better results</span>
                      <Button 
                        size="sm" 
                        variant="link" 
                        onClick={() => navigate('/dashboard')}
                        className="text-blue-700 underline"
                      >
                        Add Now
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {!user && (
              <Alert className="border-blue-200 bg-blue-50 max-w-md mx-auto">
                <User className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 flex items-center justify-between">
                  <span>Sign in to save your results and get personalized analysis</span>
                  <Button 
                    size="sm" 
                    variant="link" 
                    onClick={() => navigate('/auth')}
                    className="text-blue-700 underline"
                  >
                    Sign In
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Medical Disclaimer</AlertTitle>
              <AlertDescription className="text-yellow-700">
                This tool provides general information and is not a substitute for professional medical advice, diagnosis, or treatment. 
                Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </AlertDescription>
            </Alert>
          </div>

          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Symptoms</CardTitle>
              <CardDescription>
                Provide as much detail as possible to get accurate guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="symptoms">What symptoms are you experiencing? *</Label>
                <Textarea
                  id="symptoms"
                  placeholder="Example: I have a fever, headache, and sore throat. My throat feels scratchy and I'm having trouble swallowing..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">How long have you had these symptoms?</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less-than-24h">Less than 24 hours</SelectItem>
                      <SelectItem value="1-3-days">1-3 days</SelectItem>
                      <SelectItem value="4-7-days">4-7 days</SelectItem>
                      <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                      <SelectItem value="more-than-2-weeks">More than 2 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">How severe are your symptoms?</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger id="severity">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild - Manageable discomfort</SelectItem>
                      <SelectItem value="moderate">Moderate - Interfering with daily activities</SelectItem>
                      <SelectItem value="severe">Severe - Significant pain or distress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Your age range</Label>
                  <Select value={age} onValueChange={setAge}>
                    <SelectTrigger id="age">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">Child (0-12)</SelectItem>
                      <SelectItem value="teen">Teen (13-17)</SelectItem>
                      <SelectItem value="adult">Adult (18-64)</SelectItem>
                      <SelectItem value="senior">Senior (65+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    Analyze Symptoms
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {analysis && (
            <div className="space-y-6 animate-fade-in">
              {/* Emergency Alert */}
              {analysis.isEmergency && (
                <Alert className="border-red-600 bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <AlertTitle className="text-red-800 text-lg">⚠️ Seek Immediate Medical Attention</AlertTitle>
                  <AlertDescription className="text-red-700">
                    Based on your symptoms, you should seek emergency medical care immediately. 
                    Call emergency services or go to the nearest emergency room.
                  </AlertDescription>
                </Alert>
              )}

              {/* Severity Badge */}
              <Card className={`border-2 ${getSeverityColor(analysis.severity)}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-80">Severity Assessment</p>
                      <p className="text-2xl font-bold">{analysis.severity}</p>
                    </div>
                    <Activity className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>

              {/* Possible Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Possible Conditions</CardTitle>
                  <CardDescription>Based on the symptoms you described</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.conditions.map((condition, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{condition.name}</h4>
                        <span className={`text-sm px-2 py-1 rounded ${
                          condition.likelihood === 'High' ? 'bg-red-100 text-red-700' :
                          condition.likelihood === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {condition.likelihood} likelihood
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{condition.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* When to Seek Care & Specialists */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      When to Seek Care
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysis.whenToSeekCare}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Recommended Specialists
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.specialists.map((specialist, index) => (
                        <span key={index} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                          {specialist}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>Take action based on the analysis</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleBookAppointment} className="flex-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                  <Button onClick={handleFindSpecialist} variant="outline" className="flex-1">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Find Specialist
                  </Button>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {analysis.disclaimer}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SymptomChecker;
