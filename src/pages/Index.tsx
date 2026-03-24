import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
const appIcon = `${import.meta.env.BASE_URL}icon.png`;

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c1929] text-white">
      <main className="flex-1 flex flex-col">
        {/* Hero — centered logo, no site header/footer */}
        <section className="flex flex-col items-center justify-center px-4 pt-16 pb-12 text-center">
          <div className="mb-8 rounded-2xl bg-white p-3 sm:p-4 shadow-lg shadow-black/25 ring-1 ring-white/30">
            <img
              src={appIcon}
              alt="M&T Microfinance (U) Ltd"
              className="h-20 md:h-28 w-auto max-w-[min(100%,320px)] object-contain mx-auto block"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight max-w-2xl">
            M&amp;T Microfinance
          </h1>
          <p className="mt-4 text-slate-300 text-base md:text-lg max-w-xl leading-relaxed">
            Developing Together — Your trusted microfinance partner in Uganda.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/staff-login">
              <Button size="lg" className="w-full sm:w-auto min-w-[200px] bg-[#1e3a5f] hover:bg-[#152a45] text-white">
                Staff Portal
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px] border-slate-500 text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </section>

        {/* Highlights — dark cards */}
        <section className="py-12 px-4 border-t border-slate-800/80">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-10 text-slate-100">
              Why choose M&amp;T?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: CheckCircle, title: "Quick approval", desc: "Efficient loan processing when you need funds." },
                { icon: Users, title: "Customer focused", desc: "Support at every step of your journey." },
                { icon: TrendingUp, title: "Flexible terms", desc: "Repayment plans that fit your situation." },
                { icon: Shield, title: "Trusted partner", desc: "Serving communities across Uganda." },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border-slate-700 bg-slate-900/60 text-slate-100">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-[#1e3a5f]/40 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-sky-300" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{title}</h3>
                    <p className="text-sm text-slate-400">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 px-4 text-center border-t border-slate-800/80">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} M&amp;T Microfinance (U) Ltd. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
