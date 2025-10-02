import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    doctorName: "",
    specialization: "",
    date: "",
    time: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would make an API call to create the appointment
    toast.success("Appointment request submitted successfully! We'll confirm shortly.");
    
    // Reset form
    setFormData({
      doctorName: "",
      specialization: "",
      date: "",
      time: "",
      reason: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          <div className="animate-fade-in space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Book an Appointment</h1>
              <p className="text-muted-foreground">
                Fill in the details below to schedule your consultation
              </p>
            </div>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">Preferred Doctor (Optional)</Label>
                    <Input
                      id="doctorName"
                      placeholder="Dr. John Smith"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                      required
                    >
                      <SelectTrigger id="specialization">
                        <SelectValue placeholder="Select a specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="general">General Medicine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Preferred Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Preferred Time *</Label>
                      <Select
                        value={formData.time}
                        onValueChange={(value) => setFormData({ ...formData, time: value })}
                        required
                      >
                        <SelectTrigger id="time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">09:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="14:00">02:00 PM</SelectItem>
                          <SelectItem value="15:00">03:00 PM</SelectItem>
                          <SelectItem value="16:00">04:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Visit *</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please describe your symptoms or reason for consultation..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full" size="lg">
                      Submit Appointment Request
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Our team will review your request within 24 hours</li>
                  <li>• You'll receive a confirmation email with appointment details</li>
                  <li>• A reminder will be sent 24 hours before your appointment</li>
                  <li>• You can reschedule or cancel from your dashboard</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookAppointment;
