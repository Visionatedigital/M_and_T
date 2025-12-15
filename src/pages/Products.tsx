import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Products = () => {
  const products = [
    {
      id: "personal",
      title: "Personal Loans",
      amount: "UGX 100,000 - 150,000,000",
      term: "18 & 24 Months",
      interestRate: "From 2.5% per month",
      features: [
        "Quick approval process",
        "Minimal documentation required",
        "Flexible repayment options",
        "Competitive interest rates",
        "No collateral required for small amounts",
        "Online application available",
      ],
    },
    {
      id: "civil",
      title: "Civil Servants Loans",
      amount: "UGX 100,000 - 30,000,000",
      term: "3 - 96 Months",
      interestRate: "From 2.0% per month",
      features: [
        "Designed specifically for government employees",
        "Extended repayment periods up to 96 months",
        "Salary-based loan assessment",
        "Fast disbursement",
        "Salary deduction option available",
        "Preferential rates for civil servants",
      ],
    },
    {
      id: "logbook",
      title: "Logbook Finance Loans",
      amount: "UGX 3,000,000 - 50,000,000",
      term: "3 - 18 Months",
      interestRate: "From 2.8% per month",
      features: [
        "Up to 60% of vehicle value",
        "Keep and use your vehicle",
        "Quick processing in 3 days",
        "Flexible repayment terms",
        "All vehicle types accepted",
        "Competitive valuation rates",
      ],
    },
    {
      id: "sme",
      title: "Small And Medium Enterprise Loans",
      amount: "UGX 100,000 - 150,000,000",
      term: "1 - 36 Months",
      interestRate: "From 2.2% per month",
      features: [
        "Business growth financing",
        "Working capital support",
        "Equipment and inventory financing",
        "Business advisory services included",
        "Flexible repayment schedules",
        "No prepayment penalties",
      ],
    },
    {
      id: "agriculture",
      title: "Agriculture Loans",
      amount: "UGX 500,000 - 50,000,000",
      term: "6 - 24 Months",
      interestRate: "From 2.0% per month",
      features: [
        "Seasonal financing for farmers",
        "Crop and livestock financing",
        "Farm equipment loans",
        "Flexible repayment aligned with harvest seasons",
        "Agricultural extension services",
        "Special rates for cooperatives",
      ],
    },
    {
      id: "education",
      title: "Education Loans",
      amount: "UGX 500,000 - 20,000,000",
      term: "6 - 48 Months",
      interestRate: "From 2.3% per month",
      features: [
        "School fees financing",
        "Tuition and accommodation support",
        "Extended repayment periods",
        "Deferred payment options",
        "Support for multiple children",
        "Quick approval for students",
      ],
    },
    {
      id: "medical",
      title: "Medical Emergency Loans",
      amount: "UGX 200,000 - 10,000,000",
      term: "3 - 12 Months",
      interestRate: "From 2.5% per month",
      features: [
        "Fast approval for medical emergencies",
        "Hospital bill financing",
        "Medical equipment loans",
        "Same-day disbursement available",
        "Minimal documentation",
        "Flexible repayment plans",
      ],
    },
    {
      id: "asset",
      title: "Asset Finance",
      amount: "UGX 1,000,000 - 100,000,000",
      term: "12 - 60 Months",
      interestRate: "From 2.0% per month",
      features: [
        "Vehicle financing",
        "Machinery and equipment loans",
        "Property improvement loans",
        "Up to 80% financing",
        "Competitive interest rates",
        "Asset-based security",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Our Products</h1>
            <p className="text-xl text-center text-primary-foreground/90 max-w-3xl mx-auto">
              Explore our range of loan products designed to meet your financial needs
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {products.map((product) => (
                <Card
                  key={product.id}
                  id={product.id}
                  className="border-none shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="text-2xl">{product.title}</CardTitle>
                    <div className="space-y-2 mt-4">
                      <p className="text-lg font-semibold text-primary">
                        Loan Amount: {product.amount}
                      </p>
                      <p className="text-base text-muted-foreground">
                        Term: {product.term}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        Interest Rate: {product.interestRate}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4">Key Features:</h4>
                    <ul className="space-y-3 mb-6">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/contact">
                      <Button className="w-full" size="lg">
                        Apply Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need Help Choosing the Right Product?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our financial advisors are here to help you select the loan product that best fits your needs
            </p>
            <Link to="/contact">
              <Button variant="default" size="lg" className="font-semibold">
                Contact Us Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
