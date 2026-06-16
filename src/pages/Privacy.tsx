import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gradient-to-b from-background via-muted/20 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              How M&T Microfinance Uganda Limited collects, uses, and safeguards your personal information.
            </p>
          </div>

          <Card className="border-none shadow-xl bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">1. Commitment to Privacy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    M&T Microfinance Uganda Limited ("we", "us", or "our") is dedicated to protecting the privacy of our clients and website visitors. This Privacy Policy describes how we collect, use, and store your personal information when you apply for a loan, contact us, or use our digital services, in compliance with the Data Protection and Privacy Act of Uganda.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">2. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    To process loan inquiries, evaluate applications, and verify client identities, we may collect:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-relaxed">
                    <li>Contact details: Name, physical address, email address, telephone numbers.</li>
                    <li>Financial information: Monthly income, employment details, bank statements, collateral details.</li>
                    <li>Verification documents: National ID, employment ID, utility bills, business certificates.</li>
                    <li>Digital activity: Browser information, cookies, and IP addresses when you interact with our website.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">3. How We Use Your Data</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We process your information solely for lawful credit business purposes, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-relaxed">
                    <li>Assessing and processing your loan applications.</li>
                    <li>Verifying identity and employment status to prevent fraud.</li>
                    <li>Communicating with you regarding loan status, repayments, or updates.</li>
                    <li>Complying with regulatory obligations under the Uganda Microfinance Regulatory Authority (UMRA).</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">4. Sharing and Disclosure</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We do not sell or lease your personal information. We may share your information only with verified third parties where necessary, such as Credit Reference Bureaus (CRBs) for credit score assessment, law enforcement bodies, or regulatory authorities as required by Ugandan law.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-border/60 flex flex-col md:flex-row md:items-center justify-between text-xs text-muted-foreground gap-4">
                <p>Effective Date: June 16, 2026</p>
                <p>If you have any questions, contact us at <a href="mailto:info@mtmicrofinance.com" className="text-primary hover:underline">info@mtmicrofinance.com</a></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
