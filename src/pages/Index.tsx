import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Shield, 
  Stethoscope, 
  Users, 
  Award,
  Heart,
  Activity
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Your Health,{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Experience seamless healthcare management with ClinicianAI. Book appointments, 
                consult specialists, and manage your health records all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
                    Get Started
                  </Button>
                </Link>
                <Link to="/symptom-checker">
                  <Button size="lg" variant="secondary">
                    <Activity className="mr-2 h-5 w-5" />
                    Check Symptoms
                  </Button>
                </Link>
                <Link to="/doctors">
                  <Button size="lg" variant="outline">
                    Find Doctors
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-8 backdrop-blur-sm border border-border">
                <div className="w-full h-full rounded-xl bg-card shadow-2xl flex items-center justify-center">
                  <Heart className="w-32 h-32 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose ClinicianAI?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive healthcare solutions designed for your convenience and peace of mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calendar,
                title: "Easy Booking",
                description: "Schedule appointments with top doctors in just a few clicks"
              },
              {
                icon: Clock,
                title: "24/7 Access",
                description: "Access your health records and book appointments anytime"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your medical data is protected with industry-leading security"
              },
              {
                icon: Stethoscope,
                title: "Expert Care",
                description: "Connect with experienced specialists across all medical fields"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-6 space-y-4">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg w-fit">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive healthcare services tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "General Consultation",
                description: "Get expert medical advice from qualified general practitioners"
              },
              {
                icon: Activity,
                title: "Specialist Care",
                description: "Access specialized treatment from experienced medical specialists"
              },
              {
                icon: Award,
                title: "Preventive Care",
                description: "Regular check-ups and screenings to maintain optimal health"
              }
            ].map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="p-4 bg-gradient-to-br from-primary to-secondary rounded-full w-fit mx-auto">
                    <service.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-xl">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0 shadow-xl">
            <CardContent className="py-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Join thousands of patients who trust ClinicianAI for their healthcare needs
              </p>
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="shadow-lg">
                  Create Your Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
