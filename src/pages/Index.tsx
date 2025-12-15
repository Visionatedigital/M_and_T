import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, TrendingUp, Shield, DollarSign, Clock, Award, Star, ArrowRight, FileText, Phone, Mail, MapPin, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <HeroCarousel />

        {/* Why Choose Us Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Why Choose M&T Microfinance?
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              We are committed to providing accessible financial solutions to help you achieve your goals
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Quick Approval</h3>
                  <p className="text-sm text-muted-foreground">
                    Fast and efficient loan processing to get you funded quickly
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Customer Focused</h3>
                  <p className="text-sm text-muted-foreground">
                    Dedicated support team ready to assist you every step of the way
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Flexible Terms</h3>
                  <p className="text-sm text-muted-foreground">
                    Customizable repayment plans to suit your financial situation
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Trusted Partner</h3>
                  <p className="text-sm text-muted-foreground">
                    Years of experience serving the Ugandan community
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm md:text-base text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">UGX 50B+</div>
                <div className="text-sm md:text-base text-muted-foreground">Loans Disbursed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">15+</div>
                <div className="text-sm md:text-base text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm md:text-base text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              How It Works
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Getting a loan with M&T Microfinance is simple and straightforward
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-2">1</div>
                <h3 className="font-bold text-lg mb-2">Apply Online</h3>
                <p className="text-sm text-muted-foreground">
                  Fill out our simple application form with your basic information
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-2">2</div>
                <h3 className="font-bold text-lg mb-2">Get Approved</h3>
                <p className="text-sm text-muted-foreground">
                  Our team reviews your application and provides quick approval
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-10 w-10 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-2">3</div>
                <h3 className="font-bold text-lg mb-2">Receive Funds</h3>
                <p className="text-sm text-muted-foreground">
                  Funds are disbursed directly to your account within 24-48 hours
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-2">4</div>
                <h3 className="font-bold text-lg mb-2">Repay Easily</h3>
                <p className="text-sm text-muted-foreground">
                  Choose flexible repayment options that suit your budget
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Our Services
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Comprehensive financial solutions tailored to your needs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-bold text-xl mb-3">Personal Loans</h3>
                  <p className="text-muted-foreground mb-4">
                    Flexible personal loans from UGX 100,000 to UGX 150,000,000 with terms up to 24 months
                  </p>
                  <Link to="/products#personal">
                    <Button variant="outline" className="w-full">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-bold text-xl mb-3">Civil Servant Loans</h3>
                  <p className="text-muted-foreground mb-4">
                    Specialized loans for government employees with extended repayment periods up to 96 months
                  </p>
                  <Link to="/products#civil">
                    <Button variant="outline" className="w-full">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-bold text-xl mb-3">SME Loans</h3>
                  <p className="text-muted-foreground mb-4">
                    Business financing solutions to help your enterprise grow and thrive
                  </p>
                  <Link to="/products#sme">
                    <Button variant="outline" className="w-full">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              What Our Customers Say
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "M&T Microfinance helped me secure a loan for my small business. The process was quick and the staff were very helpful. Highly recommended!"
                  </p>
                  <div className="font-semibold">Sarah Nakato</div>
                  <div className="text-sm text-muted-foreground">Small Business Owner</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "As a civil servant, I appreciate the flexible repayment terms. The loan helped me build my dream home. Thank you M&T!"
                  </p>
                  <div className="font-semibold">James Mukasa</div>
                  <div className="text-sm text-muted-foreground">Government Employee</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "Fast approval and excellent customer service. The logbook finance option was perfect for my needs. Great experience overall!"
                  </p>
                  <div className="font-semibold">Mary Namukasa</div>
                  <div className="text-sm text-muted-foreground">Entrepreneur</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Find answers to common questions about our loan products
            </p>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What documents do I need to apply for a loan?</AccordionTrigger>
                <AccordionContent>
                  You'll need a valid national ID, proof of income (payslip or bank statements), and proof of residence. Additional documents may be required depending on the loan type.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How long does the approval process take?</AccordionTrigger>
                <AccordionContent>
                  Most loan applications are processed within 24-48 hours. Civil servant loans and logbook finance can be approved even faster, sometimes within the same day.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>What are the interest rates?</AccordionTrigger>
                <AccordionContent>
                  Interest rates vary depending on the loan product and amount. We offer competitive rates starting from as low as 2.5% per month. Contact us for specific rates based on your needs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Can I repay my loan early?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can repay your loan early without any penalties. Early repayment can actually help you save on interest charges.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Do you offer loans to people with bad credit?</AccordionTrigger>
                <AccordionContent>
                  We assess each application individually. While credit history is considered, we also look at your current financial situation and ability to repay. Contact us to discuss your options.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Contact us today to learn more about our loan products and how we can help you achieve your financial goals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button
                  variant="secondary"
                  size="lg"
                  className="font-semibold hover:scale-105 transition-transform"
                >
                  Contact Us Today
                </Button>
              </Link>
              <Link to="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-semibold hover:scale-105 transition-transform bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  View Products
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
