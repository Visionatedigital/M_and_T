import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  Users,
  TrendingUp,
  Shield,
  ArrowRight,
  FileText,
  ClipboardCheck,
  Wallet,
  Headphones,
  Building2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { value: "8+", label: "Core loan product lines", sub: "Tailored to individuals & businesses" },
  { value: "Uganda", label: "Rooted locally", sub: "Branches in Nakasero & Kasangati" },
  { value: "500+", label: "Active clients", sub: "Empowered individuals & small businesses" },
  { value: "Flexible", label: "Terms that fit", sub: "Repayment plans aligned to your cash flow" },
];

const steps = [
  {
    step: "01",
    title: "Apply",
    desc: "Choose a product and share your details online or at a branch.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Assessment",
    desc: "Our team reviews your application and supporting information.",
    icon: ClipboardCheck,
  },
  {
    step: "03",
    title: "Decision",
    desc: "You receive a clear outcome with transparent terms.",
    icon: Sparkles,
  },
  {
    step: "04",
    title: "Disbursement",
    desc: "Approved funds are made available through agreed channels.",
    icon: Wallet,
  },
];

const productTeasers = [
  {
    title: "Personal loans",
    blurb: "For individual needs with structured repayment.",
    to: "/products?section=personal",
  },
  {
    title: "Civil servants",
    blurb: "Designed for public-sector employees.",
    to: "/products?section=civil",
  },
  {
    title: "Logbook finance",
    blurb: "Vehicle-backed options where applicable.",
    to: "/products?section=logbook",
  },
  {
    title: "SME & business",
    blurb: "Growth capital for small and medium enterprises.",
    to: "/products?section=sme",
  },
];

const faqs = [
  {
    q: "How do I start a loan application?",
    a: "Browse our products, then contact us or visit a branch. Our team will walk you through requirements and next steps.",
  },
  {
    q: "What documents might I need?",
    a: "Requirements vary by product. Generally you should be prepared to verify identity, income or employment, and collateral where applicable. We will confirm the exact list for your case.",
  },
  {
    q: "How long does review take?",
    a: "We review and approve most loans within 3 to 5 business days once all required documentation is submitted.",
  },
  {
    q: "Where are you located?",
    a: "See our branches page for locations and how to reach us across Uganda.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <HeroCarousel />

        {/* Stats */}
        <section className="py-12 md:py-16 border-y bg-gradient-to-b from-muted/40 to-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="text-center p-4 rounded-xl bg-card/80 border shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-2xl md:text-3xl font-bold text-primary tabular-nums">{s.value}</p>
                  <p className="font-semibold text-sm md:text-base mt-2">{s.label}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-[14rem] mx-auto leading-snug">
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why choose M&amp;T Microfinance?</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto text-base md:text-lg">
              We are committed to accessible financial solutions and support that helps you move forward with confidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Structured process</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear steps from application through to disbursement and ongoing support.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">People first</h3>
                  <p className="text-sm text-muted-foreground">
                    A team focused on understanding your goals and finding the right fit.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Flexible terms</h3>
                  <p className="text-sm text-muted-foreground">
                    Repayment options designed to align with how you earn and operate.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Trusted partner</h3>
                  <p className="text-sm text-muted-foreground">
                    Serving individuals, groups, and businesses across Uganda.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
              <p className="text-muted-foreground text-base md:text-lg">
                A straightforward journey—whether you apply in person or with help from our team.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
              {steps.map((s) => (
                <div
                  key={s.step}
                  className="relative rounded-2xl border bg-card p-6 pt-10 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="absolute top-4 right-4 text-xs font-mono text-muted-foreground/80">{s.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product teasers */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Explore our products</h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  From personal needs to business growth—find an overview of what we offer, then get in touch for details.
                </p>
              </div>
              <Link to="/products" className="shrink-0">
                <Button variant="outline" size="lg" className="gap-2 w-full md:w-auto">
                  View all products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productTeasers.map((p) => (
                <Link key={p.title} to={p.to} className="group block h-full">
                  <Card className="h-full border shadow-md hover:shadow-xl transition-all group-hover:border-primary/40">
                    <CardContent className="p-6 flex flex-col h-full">
                      <Building2 className="h-8 w-8 text-primary mb-4" />
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-sm text-muted-foreground flex-1 leading-relaxed">{p.blurb}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-4">
                        Learn more
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Support + branches */}
        <section className="py-16 md:py-20 bg-background border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-5xl mx-auto">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                  <Headphones className="h-4 w-4" />
                  We are here to help
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Questions? Visit us or reach out</h2>
                <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
                  Our branches serve communities across Uganda. Whether you need product information or want to discuss
                  your situation, we will guide you to the right next step.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/branches">
                    <Button size="lg" variant="default" className="w-full sm:w-auto gap-2">
                      <Building2 className="h-4 w-4" />
                      Find a branch
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Contact us
                    </Button>
                  </Link>
                </div>
              </div>
              <Card className="border-2 border-dashed border-primary/20 bg-muted/20">
                <CardContent className="p-8 md:p-10">
                  <ul className="space-y-4 text-sm md:text-base">
                    <li className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Transparent communication about requirements and timelines</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Support for individuals, groups, and business clients</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Staff available to explain options before you commit</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Frequently asked questions</h2>
            <p className="text-center text-muted-foreground mb-10">
              Quick answers—our team can go deeper when you get in touch.
            </p>
            <Accordion type="single" collapsible className="w-full bg-card rounded-xl border px-4 md:px-6 shadow-sm">
              {faqs.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Explore products, find a branch, or contact us—we will help you understand your options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
              <Link to="/products" className="sm:inline-flex">
                <Button variant="secondary" size="lg" className="font-semibold w-full sm:w-auto hover:scale-[1.02] transition-transform">
                  View loan products
                </Button>
              </Link>
              <Link to="/contact" className="sm:inline-flex">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-semibold w-full sm:w-auto border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Contact us today
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
