import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, MessageCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"inquiry" | "apply">("inquiry");

  // General Inquiry form state
  const [inquiryData, setInquiryData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // Loan Application form state
  const [appData, setAppData] = useState({
    name: "",
    email: "",
    phone: "",
    applicantType: "individual",
    loanProduct: "personal",
    amount: "",
    term: "1",
    collateral: "vehicle",
    notes: "",
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setInquiryData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const handleAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Submitted!",
      description: "Thank you! Our credit team will review your application and contact you in 3-5 business days.",
    });
    setAppData({
      name: "",
      email: "",
      phone: "",
      applicantType: "individual",
      loanProduct: "personal",
      amount: "",
      term: "1",
      collateral: "vehicle",
      notes: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Contact Us</h1>
            <p className="text-xl text-center text-primary-foreground/90 max-w-3xl mx-auto">
              Get in touch with us - we're here to help you with your financial needs
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gradient-to-b from-background via-muted/10 to-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              
              {/* Form Card */}
              <Card className="border-none shadow-xl bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                <CardContent className="p-8">
                  {/* Tabs Header */}
                  <div className="flex border-b border-border/60 mb-6">
                    <button
                      type="button"
                      onClick={() => setActiveTab("inquiry")}
                      className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === "inquiry"
                          ? "border-primary text-primary font-bold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      General Inquiry
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("apply")}
                      className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === "apply"
                          ? "border-primary text-primary font-bold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Apply for a Loan
                    </button>
                  </div>

                  {/* General Inquiry Form */}
                  {activeTab === "inquiry" && (
                    <form onSubmit={handleInquirySubmit} className="space-y-6 animate-fade-in">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={inquiryData.name}
                          onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={inquiryData.email}
                            onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={inquiryData.phone}
                            onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                            required
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          value={inquiryData.subject}
                          onChange={(e) => setInquiryData({ ...inquiryData, subject: e.target.value })}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          value={inquiryData.message}
                          onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                          required
                          rows={5}
                          className="mt-2"
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        Send Message
                      </Button>
                    </form>
                  )}

                  {/* Loan Application Intake Form */}
                  {activeTab === "apply" && (
                    <form onSubmit={handleAppSubmit} className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="app-name">Full Name *</Label>
                          <Input
                            id="app-name"
                            value={appData.name}
                            onChange={(e) => setAppData({ ...appData, name: e.target.value })}
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="app-phone">Phone Number *</Label>
                          <Input
                            id="app-phone"
                            type="tel"
                            placeholder="+256..."
                            value={appData.phone}
                            onChange={(e) => setAppData({ ...appData, phone: e.target.value })}
                            required
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="app-email">Email Address *</Label>
                        <Input
                          id="app-email"
                          type="email"
                          value={appData.email}
                          onChange={(e) => setAppData({ ...appData, email: e.target.value })}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="app-type">Applying As *</Label>
                          <select
                            id="app-type"
                            value={appData.applicantType}
                            onChange={(e) => setAppData({ ...appData, applicantType: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2"
                          >
                            <option value="individual">Individual</option>
                            <option value="civil_servant">Civil Servant</option>
                            <option value="sme">SME / Business Owner</option>
                            <option value="farmer">Farmer / Agriculturalist</option>
                            <option value="student_guardian">Student Guardian / Parent</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="app-product">Loan Product *</Label>
                          <select
                            id="app-product"
                            value={appData.loanProduct}
                            onChange={(e) => setAppData({ ...appData, loanProduct: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2"
                          >
                            <option value="personal">Personal Loans</option>
                            <option value="civil">Civil Servants Loans</option>
                            <option value="logbook">Logbook Finance Loans</option>
                            <option value="sme">Small And Medium Enterprise Loans</option>
                            <option value="agriculture">Agriculture Loans</option>
                            <option value="education">Education Loans</option>
                            <option value="medical">Medical Emergency Loans</option>
                            <option value="asset">Asset Finance</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="app-amount">Desired Amount (UGX) *</Label>
                          <Input
                            id="app-amount"
                            type="number"
                            placeholder="1,000,000"
                            min="1000000"
                            max="50000000"
                            value={appData.amount}
                            onChange={(e) => setAppData({ ...appData, amount: e.target.value })}
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="app-term">Preferred Repayment Term *</Label>
                          <select
                            id="app-term"
                            value={appData.term}
                            onChange={(e) => setAppData({ ...appData, term: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2"
                          >
                            <option value="1">1 Month</option>
                            <option value="2">2 Months</option>
                            <option value="3">3 Months</option>
                            <option value="4">4 Months</option>
                            <option value="5">5 Months</option>
                            <option value="6">6 Months</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="app-collateral">Collateral Offered *</Label>
                        <select
                          id="app-collateral"
                          value={appData.collateral}
                          onChange={(e) => setAppData({ ...appData, collateral: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2"
                        >
                          <option value="vehicle">Vehicle (Logbook)</option>
                          <option value="business">Business Assets / Equipment</option>
                          <option value="property">Land / Real Estate Property</option>
                          <option value="salary_deduction">Salary Deduction (Civil Servants only)</option>
                          <option value="other">Other Assets</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="app-notes">Additional Notes / Financial Details</Label>
                        <Textarea
                          id="app-notes"
                          placeholder="Please provide any extra details regarding your collateral or loan request."
                          value={appData.notes}
                          onChange={(e) => setAppData({ ...appData, notes: e.target.value })}
                          rows={3}
                          className="mt-2"
                        />
                      </div>

                      {/* Airtel Money & Collateral Notice */}
                      <div className="flex gap-3 bg-muted/40 p-4 rounded-xl border text-xs text-muted-foreground leading-relaxed">
                        <Info className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground mb-1">Important Application Disclosures</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Approved loan disbursements are processed via **Airtel Money**.</li>
                            <li>Collateral is required for all loans. M&T Microfinance Uganda Limited does not provide unsecured lending.</li>
                            <li>Standard credit assessment and review timelines take **3 to 5 business days**.</li>
                          </ul>
                        </div>
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        Submit Loan Application
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information Cards */}
              <div className="space-y-6">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Head Office</h3>
                          <p className="text-muted-foreground">
                            Plot 2D/2E Nakasero Hill Road<br />
                            P.O.Box 29692<br />
                            Kampala, Uganda
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Phone className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Phone</h3>
                          <p className="text-muted-foreground">
                            <a href="tel:+256730687607" className="hover:text-primary transition-colors block">
                              +256 (0) 730 687 607
                            </a>
                            <a href="tel:+256708693071" className="hover:text-primary transition-colors block">
                              +256 (0) 708 693 071
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">WhatsApp Chat</h3>
                          <a
                            href="https://wa.me/256708693071"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm mt-1"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Chat on WhatsApp
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Email</h3>
                          <p className="text-muted-foreground">
                            <a href="mailto:info@mtmicrofinance.com" className="hover:text-primary transition-colors">
                              info@mtmicrofinance.com
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Business Hours</h3>
                          <p className="text-muted-foreground">
                            Monday - Friday: 8:00 AM - 5:00 PM<br />
                            Saturday: 9:00 AM - 1:00 PM<br />
                            Sunday: Closed
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-muted/30">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold mb-4">Airtel Money Disbursements</h3>
                    <p className="text-muted-foreground mb-4">
                      All credit disbursements are conveniently routed straight to your Airtel Money wallet, ensuring fast, safe, and immediate access to your capital.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ensure your registered Airtel number matches the name on your National Identification card.
                    </p>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
