import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock } from "lucide-react";

const Branches = () => {
  const branches = [
    {
      name: "Head Office - Nakasero",
      address: "Plot 2D/2E Nakasero Hill Road, Kampala",
      phone: ["+256 785 609 370", "+256 756 790 357"],
      hours: "Monday - Friday: 8:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM",
    },
    // Additional branches can be added here
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Our Branches</h1>
            <p className="text-xl text-center text-primary-foreground/90 max-w-3xl mx-auto">
              Visit us at any of our conveniently located branches across Uganda
            </p>
          </div>
        </section>

        {/* Branches Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {branches.map((branch, index) => (
                <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6 text-primary">{branch.name}</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Address</h4>
                          <p className="text-muted-foreground">{branch.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Phone</h4>
                          {branch.phone.map((phone, idx) => (
                            <p key={idx} className="text-muted-foreground">
                              <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                                {phone}
                              </a>
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold mb-1">Business Hours</h4>
                          <p className="text-muted-foreground whitespace-pre-line">{branch.hours}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="mt-12 max-w-5xl mx-auto">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-muted/30 h-96 flex items-center justify-center">
                    <div className="text-center p-8">
                      <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Find Us on the Map</h3>
                      <p className="text-muted-foreground">
                        Visit our head office at Nakasero Hill Road, Kampala
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Can't Visit Our Branch?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              No problem! You can reach us by phone or through our contact form, and we'll be happy to assist you with your loan application or any inquiries.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Branches;
