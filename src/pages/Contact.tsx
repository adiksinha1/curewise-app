import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Get in Touch</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Have questions? We're here to help. Reach out to us through any of these channels.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <Card className="lg:col-span-2 shadow-xl">
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="How can we help you?"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="min-h-[150px]"
                      />
                    </div>

                    <Button type="submit" className="w-full">Send Message</Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Phone</h3>
                        <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <p className="text-sm text-muted-foreground">support@clinicianai.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Address</h3>
                        <p className="text-sm text-muted-foreground">
                          123 Healthcare Avenue<br />
                          Medical District<br />
                          New York, NY 10001
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Hours</h3>
                        <p className="text-sm text-muted-foreground">
                          Mon-Fri: 8:00 AM - 8:00 PM<br />
                          Sat-Sun: 9:00 AM - 5:00 PM
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Emergency?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      For medical emergencies, please call 911 or visit your nearest emergency room.
                    </p>
                    <Button variant="outline" className="w-full">Emergency Hotline</Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    q: "How do I book an appointment?",
                    a: "You can book an appointment through our online booking system or by calling our support line."
                  },
                  {
                    q: "Can I reschedule my appointment?",
                    a: "Yes, you can reschedule up to 24 hours before your appointment through your dashboard."
                  },
                  {
                    q: "What insurance do you accept?",
                    a: "We accept most major insurance plans. Please contact us for specific details."
                  },
                ].map((faq, index) => (
                  <div key={index} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
