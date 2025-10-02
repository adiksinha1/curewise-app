import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const mockDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    location: "New York, NY",
    rating: 4.8,
    experience: "15 years",
    availability: "Available Today",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialization: "Pediatrician",
    location: "Los Angeles, CA",
    rating: 4.9,
    experience: "12 years",
    availability: "Available Tomorrow",
  },
  {
    id: 3,
    name: "Dr. Emily Williams",
    specialization: "Dermatologist",
    location: "Chicago, IL",
    rating: 4.7,
    experience: "10 years",
    availability: "Available This Week",
  },
  {
    id: 4,
    name: "Dr. James Brown",
    specialization: "Orthopedist",
    location: "Houston, TX",
    rating: 4.9,
    experience: "18 years",
    availability: "Available Today",
  },
];

const DoctorSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDoctors = mockDoctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto space-y-8">
          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Doctor</h1>
            <p className="text-muted-foreground">
              Search for qualified healthcare professionals by name, specialization, or location
            </p>
          </div>

          {/* Search Bar */}
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, specialization, or location..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button>Search</Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{doctor.name}</CardTitle>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                          {doctor.specialization}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{doctor.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        {doctor.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        Experience: {doctor.experience}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm font-medium text-secondary">
                        {doctor.availability}
                      </span>
                      <Link to="/book-appointment">
                        <Button size="sm">Book Appointment</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorSearch;
