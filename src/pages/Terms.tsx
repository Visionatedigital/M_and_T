import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, CheckCircle2, UserCheck, AlertTriangle } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gradient-to-b from-background via-muted/20 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
              Terms of Use
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Please read these terms and conditions carefully before using our services or applying for credit.
            </p>
          </div>

          <Card className="border-none shadow-xl bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">1. Agreement to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing or using the M&T Microfinance Uganda Limited website, applying for our loan products, or engaging our services, you agree to be bound by these Terms of Use and all applicable laws and regulations in Uganda. If you do not agree, please refrain from using our services.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">2. Eligibility for Credit Services</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    To apply for credit and loan products with us, you must:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-relaxed">
                    <li>Be a citizen or legal resident of Uganda.</li>
                    <li>Be at least 18 years of age.</li>
                    <li>Possess a valid Ugandan National Identification Card.</li>
                    <li>Meet our credit evaluation, collateral requirements, and background assessments.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">3. Loan Applications and Approvals</h2>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-relaxed">
                    <li>Submission of an online application does not guarantee loan approval.</li>
                    <li>All loans are subject to credit screening, background verification, and collateral valuation.</li>
                    <li>Collateral is required for every loan issued. M&T Microfinance Uganda Limited does not provide unsecured credit.</li>
                    <li>Disbursement will only occur via agreed and verified channels, primarily Airtel Money, after the execution of the loan agreements.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">4. Disclaimers & Regulatory Info</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    M&T Microfinance Uganda Limited is licensed and regulated by the Uganda Microfinance Regulatory Authority (UMRA). Interest rates, loan limits, and terms displayed on our website are indicative. Final rates and conditions depend on the borrower’s risk assessment and collateral and are specified in the individual loan contracts.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-border/60 flex flex-col md:flex-row md:items-center justify-between text-xs text-muted-foreground gap-4">
                <p>Last Updated: June 16, 2026</p>
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

export default Terms;
