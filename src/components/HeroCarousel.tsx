import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import civilServantImg from "@/assets/civil-servant.jpg";
import logbookImg from "@/assets/logbook-finance.jpg";
import smeImg from "@/assets/sme-loan.jpg";
import personalImg from "@/assets/personal-loan.jpg";

const slides = [
  {
    id: 1,
    title: "Personal Loans",
    description: "Loan Amount UGX 100,000 - 150M",
    term: "Term 18 & 24 Months",
    image: personalImg,
    link: "/products#personal",
  },
  {
    id: 2,
    title: "Civil Servants Loans",
    description: "From UGX 100K - 30M",
    term: "3 - 96 Months",
    image: civilServantImg,
    link: "/products#civil",
  },
  {
    id: 3,
    title: "Logbook Finance Loans",
    description: "From UGX 3 - 50M",
    term: "3 - 18 Months",
    image: logbookImg,
    link: "/products#logbook",
  },
  {
    id: 4,
    title: "Small And Medium Enterprise Loan",
    description: "Loan Amount UGX 100,000 - 150M",
    term: "Term 1 - 36 Months",
    image: smeImg,
    link: "/products#sme",
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-brand-overlay/70" />
          </div>

          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl animate-fade-in">
              <div className="bg-brand-blue/90 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-2xl">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl text-white/95 mb-2">
                  {slide.description}
                </p>
                <p className="text-base md:text-lg text-white/90 mb-6">
                  {slide.term}
                </p>
                <Link to={slide.link}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="font-semibold hover:scale-105 transition-transform"
                  >
                    LEARN MORE
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-brand-red"
                : "w-2 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
