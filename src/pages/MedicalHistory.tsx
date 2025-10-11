import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, X, Save, FileText } from "lucide-react";

const MedicalHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form state
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);
  const [pastSurgeries, setPastSurgeries] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [bloodType, setBloodType] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("");
  const [alcoholConsumption, setAlcoholConsumption] = useState("");
  const [exerciseFrequency, setExerciseFrequency] = useState("");
  
  // Input fields for adding new items
  const [newCondition, setNewCondition] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newSurgery, setNewSurgery] = useState("");
  const [newFamilyHistory, setNewFamilyHistory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      setUserId(user.id);

      // Fetch existing medical history
      const { data, error } = await supabase
        .from('patient_medical_history')
        .select('*')
        .eq('patient_id', user.id)
        .single();

      if (data && !error) {
        setChronicConditions(data.chronic_conditions || []);
        setAllergies(data.allergies || []);
        setCurrentMedications(data.current_medications || []);
        setPastSurgeries(data.past_surgeries || []);
        setFamilyHistory(data.family_history || []);
        setBloodType(data.blood_type || "");
        setHeightCm(data.height_cm?.toString() || "");
        setWeightKg(data.weight_kg?.toString() || "");
        setSmokingStatus(data.smoking_status || "");
        setAlcoholConsumption(data.alcohol_consumption || "");
        setExerciseFrequency(data.exercise_frequency || "");
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const addItem = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()]);
      inputSetter("");
    }
  };

  const removeItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('patient_medical_history')
        .upsert({
          patient_id: userId,
          chronic_conditions: chronicConditions,
          allergies: allergies,
          current_medications: currentMedications,
          past_surgeries: pastSurgeries,
          family_history: familyHistory,
          blood_type: bloodType || null,
          height_cm: heightCm ? parseFloat(heightCm) : null,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          smoking_status: smokingStatus || null,
          alcohol_consumption: alcoholConsumption || null,
          exercise_frequency: exerciseFrequency || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medical history saved successfully",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving medical history:', error);
      toast({
        title: "Error",
        description: "Failed to save medical history",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileText className="h-8 w-8" />
                Medical History
              </h1>
              <p className="text-muted-foreground mt-2">
                Keep your medical information up to date for more accurate symptom analysis
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chronic Conditions</CardTitle>
              <CardDescription>List any ongoing health conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Diabetes, Hypertension"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem(newCondition, setChronicConditions, setNewCondition)}
                />
                <Button onClick={() => addItem(newCondition, setChronicConditions, setNewCondition)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {chronicConditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {condition}
                    <button onClick={() => removeItem(index, setChronicConditions)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Allergies</CardTitle>
              <CardDescription>List any known allergies (medications, foods, environmental)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Penicillin, Peanuts"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem(newAllergy, setAllergies, setNewAllergy)}
                />
                <Button onClick={() => addItem(newAllergy, setAllergies, setNewAllergy)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="text-sm">
                    {allergy}
                    <button onClick={() => removeItem(index, setAllergies)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
              <CardDescription>List all medications you're currently taking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Aspirin 81mg daily"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem(newMedication, setCurrentMedications, setNewMedication)}
                />
                <Button onClick={() => addItem(newMedication, setCurrentMedications, setNewMedication)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentMedications.map((medication, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {medication}
                    <button onClick={() => removeItem(index, setCurrentMedications)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Past Surgeries</CardTitle>
              <CardDescription>List any surgical procedures you've had</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Appendectomy (2020)"
                  value={newSurgery}
                  onChange={(e) => setNewSurgery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem(newSurgery, setPastSurgeries, setNewSurgery)}
                />
                <Button onClick={() => addItem(newSurgery, setPastSurgeries, setNewSurgery)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {pastSurgeries.map((surgery, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {surgery}
                    <button onClick={() => removeItem(index, setPastSurgeries)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Family History</CardTitle>
              <CardDescription>List any significant health conditions in your family</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Father - Heart Disease"
                  value={newFamilyHistory}
                  onChange={(e) => setNewFamilyHistory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem(newFamilyHistory, setFamilyHistory, setNewFamilyHistory)}
                />
                <Button onClick={() => addItem(newFamilyHistory, setFamilyHistory, setNewFamilyHistory)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {familyHistory.map((history, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {history}
                    <button onClick={() => removeItem(index, setFamilyHistory)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Physical Measurements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={bloodType} onValueChange={setBloodType}>
                    <SelectTrigger id="bloodType">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lifestyle Factors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smoking">Smoking Status</Label>
                  <Select value={smokingStatus} onValueChange={setSmokingStatus}>
                    <SelectTrigger id="smoking">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="former">Former Smoker</SelectItem>
                      <SelectItem value="current">Current Smoker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alcohol">Alcohol Consumption</Label>
                  <Select value={alcoholConsumption} onValueChange={setAlcoholConsumption}>
                    <SelectTrigger id="alcohol">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="occasional">Occasional</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exercise">Exercise Frequency</Label>
                  <Select value={exerciseFrequency} onValueChange={setExerciseFrequency}>
                    <SelectTrigger id="exercise">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="rare">Rarely</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Medical History
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MedicalHistory;
