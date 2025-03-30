import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, AlertCircle } from "lucide-react";

const Ambulance = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    emergency: "",
    location: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to request an ambulance
    alert("Ambulance request submitted! Emergency services will contact you shortly.");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Ambulance Service</h1>
          <p className="text-gray-600">Request immediate medical assistance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Important Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-1 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">Emergency Contact</p>
                    <p className="text-gray-600">Call 108 for immediate assistance</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-500 mt-1 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">Response Time</p>
                    <p className="text-gray-600">Average response time: 15-20 minutes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-1 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">Service Area</p>
                    <p className="text-gray-600">Available in all major cities and towns</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Request Ambulance</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Pickup Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter pickup address"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Landmark (Optional)</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter nearby landmark"
                  />
                </div>

                <div>
                  <Label htmlFor="emergency">Emergency Details</Label>
                  <Input
                    id="emergency"
                    name="emergency"
                    value={formData.emergency}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief description of the emergency"
                  />
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  Request Ambulance
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            For immediate assistance, please call our emergency helpline:
            <a href="tel:108" className="text-red-600 font-semibold ml-1">
              <Phone className="inline-block h-4 w-4 mr-1" />
              108
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Ambulance; 