import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">About Us</h1>
            <p className="text-xl text-center text-primary-foreground/90 max-w-3xl mx-auto">
              Developing Together - Your Trusted Microfinance Partner in Uganda
            </p>
          </div>
        </section>

        {/* Who We Are */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Who We Are</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                M&T Microfinance (U) Ltd is a leading microfinance institution in Uganda, dedicated to providing accessible and affordable financial services to individuals, civil servants, and small to medium enterprises. Our commitment is to empower our clients to achieve their financial goals and contribute to the economic development of Uganda.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                With years of experience in the financial sector, we understand the unique challenges faced by our clients. That's why we've designed our loan products to be flexible, convenient, and tailored to meet diverse financial needs.
              </p>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To provide accessible, reliable, and customer-focused financial services that empower individuals and businesses to achieve sustainable growth and prosperity.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                    <Eye className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To be the leading microfinance institution in Uganda, recognized for excellence in service delivery and commitment to financial inclusion.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Values</h3>
                  <ul className="text-muted-foreground leading-relaxed space-y-2">
                    <li>• Integrity and transparency</li>
                    <li>• Customer-centricity</li>
                    <li>• Innovation and excellence</li>
                    <li>• Community development</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why Choose M&T Microfinance?</h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary">Quick Processing</h3>
                <p className="text-muted-foreground">
                  Fast loan approval and disbursement to meet your urgent financial needs.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary">Flexible Terms</h3>
                <p className="text-muted-foreground">
                  Customizable repayment plans ranging from 3 to 96 months depending on the product.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary">Competitive Rates</h3>
                <p className="text-muted-foreground">
                  Affordable interest rates designed to support your financial success.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary">Expert Guidance</h3>
                <p className="text-muted-foreground">
                  Professional financial advisors to help you make informed decisions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
