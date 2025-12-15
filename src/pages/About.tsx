import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Award, Users, Building2, Calendar, Briefcase } from "lucide-react";

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

        {/* Company History */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Our Story</h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  M&T Microfinance (U) Ltd was established with a vision to bridge the financial gap in Uganda and empower individuals and businesses to achieve their dreams. Since our inception, we have been committed to providing accessible, affordable, and customer-focused financial services.
                </p>
                <p>
                  Over the years, we have grown from a small microfinance institution to a trusted financial partner serving thousands of customers across Uganda. Our success is built on the foundation of trust, transparency, and unwavering commitment to our clients' financial well-being.
                </p>
                <p>
                  We understand that every customer has unique financial needs, which is why we offer a diverse range of loan products designed to cater to different segments of the market - from individual borrowers to civil servants and small to medium enterprises.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Board of Directors */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Board of Directors</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Meet the experienced leadership team guiding M&T Microfinance towards excellence
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Dr. Michael Tumusiime</h3>
                  <p className="text-primary font-semibold mb-3">Chairman</p>
                  <p className="text-sm text-muted-foreground">
                    With over 20 years of experience in financial services, Dr. Tumusiime brings extensive expertise in microfinance and banking operations.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Ms. Sarah Nakamya</h3>
                  <p className="text-primary font-semibold mb-3">Managing Director</p>
                  <p className="text-sm text-muted-foreground">
                    A seasoned financial expert with a passion for financial inclusion, leading our operations with strategic vision and dedication.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Mr. James Mukasa</h3>
                  <p className="text-primary font-semibold mb-3">Director of Operations</p>
                  <p className="text-sm text-muted-foreground">
                    Specializing in risk management and operational excellence, ensuring smooth and efficient service delivery.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Ms. Grace Namukasa</h3>
                  <p className="text-primary font-semibold mb-3">Director of Finance</p>
                  <p className="text-sm text-muted-foreground">
                    A certified accountant with expertise in financial planning and management, ensuring fiscal responsibility and growth.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Mr. David Ssemwogerere</h3>
                  <p className="text-primary font-semibold mb-3">Director of Business Development</p>
                  <p className="text-sm text-muted-foreground">
                    Focused on expanding our reach and developing innovative financial products to serve more customers across Uganda.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Ms. Mary Nalubega</h3>
                  <p className="text-primary font-semibold mb-3">Director of Compliance</p>
                  <p className="text-sm text-muted-foreground">
                    Ensuring adherence to regulatory requirements and maintaining the highest standards of corporate governance.
                  </p>
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

        {/* Awards & Recognition */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Awards & Recognition</h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-bold text-xl mb-2">Best Microfinance Institution 2023</h3>
                  <p className="text-muted-foreground">
                    Recognized by the Uganda Microfinance Association for excellence in service delivery and customer satisfaction.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-bold text-xl mb-2">Financial Inclusion Award</h3>
                  <p className="text-muted-foreground">
                    Awarded for outstanding contribution to financial inclusion and empowerment of underserved communities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
