"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Star,
  Check,
  Phone,
  Mail,
  MapPin,
  Shield,
  Award,
  Clock,
  ArrowRight,
  Calendar,
  User,
  Car,
  AlertCircle,
  Menu,
  X,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ── fallback data (used until API responds) ──────────────────────── */

interface Slide { image: string; title: string; subtitle: string }
interface Stat  { passRate: string; graduates: string; instructors: string }
interface Pkg   { id: string; name: string; price: string; lessons: string; duration: string; popular: boolean; tagline: string; features: string[] }
interface Contact { phone: string; email: string; address: string; hours: string }
interface FooterData { companyName: string; tagline: string; copyright: string; license: string; links: { label: string; url: string }[] }
interface Branding { logoText: string; logoSubtext: string; logoImage?: string; colors: { primary: string; accent: string; dark: string; light: string; background: string } }
interface Review { id: number; name: string; rating: number; date: string; text: string; tag: string; initials: string }

const FALLBACK_SLIDES: Slide[] = [
  { image: "/images/hero_slide_1.png", title: "Learn to Drive with Confidence", subtitle: "Professional 1-on-1 instruction from certified driving experts." },
  { image: "/images/hero_slide_2.png", title: "Master the Open Road", subtitle: "Highway driving, defensive techniques, and hazard perception." },
  { image: "/images/hero_slide_3.png", title: "Your License, Guaranteed", subtitle: "Over 10,000 graduates and counting." },
];

const FALLBACK_PACKAGES: Pkg[] = [
  { id: "starter", name: "Starter Permit Pack", price: "$299", lessons: "5 Lessons", duration: "45 mins each", popular: false, tagline: "Perfect for complete beginners.", features: ["Basic vehicle operations & controls","Steering control & lane centering","Parking basics","1-on-1 certified instructor","Free pickup & drop-off"] },
  { id: "defensive", name: "Defensive Master Class", price: "$549", lessons: "10 Lessons", duration: "60 mins each", popular: true, tagline: "Our most popular pack.", features: ["Everything in Starter Pack","Highway & freeway driving","Night driving & poor weather","Hazard perception","Road test simulation","Insurance discount certificate"] },
  { id: "elite", name: "Elite Test Readiness", price: "$799", lessons: "15 Lessons", duration: "60 mins each", popular: false, tagline: "Complete mastery package.", features: ["Everything in Defensive Class","Unlimited mock exams","Priority booking slots","Vehicle for official road test","Post-license coaching","99% Pass Rate Guarantee"] },
];

const FALLBACK_REVIEWS: Review[] = [
  { id: 1, name: "Jenny L.", rating: 5, date: "3 weeks ago", text: "Michael is an amazing instructor! Passed my DMV test on the first try!", tag: "First Time Pass", initials: "JL" },
  { id: 2, name: "Kevin T.", rating: 5, date: "1 month ago", text: "Best driving school in the Bay Area, hands down.", tag: "Highly Recommended", initials: "KT" },
  { id: 3, name: "Priya S.", rating: 5, date: "2 months ago", text: "After 10 lessons I felt confident enough to take my test — and I passed!", tag: "Anxiety Overcome", initials: "PS" },
  { id: 4, name: "David M.", rating: 5, date: "1 month ago", text: "Flexible scheduling and the freeway merging practice was a game changer.", tag: "Flexible Schedule", initials: "DM" },
];

/* ── component ────────────────────────────────────────────────────── */

export default function Home() {
  /* ── state ─────────────────────────────────────── */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("defensive");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [content, setContent] = useState({
    hero: { slides: FALLBACK_SLIDES, stats: { passRate: "98%", graduates: "10k+", instructors: "15+" } as Stat },
    packages: FALLBACK_PACKAGES,
    reviews: FALLBACK_REVIEWS as Review[],
    contact: { phone: "(415) 555-0188", email: "info@michaelwongdriving.com", address: "San Francisco, CA", hours: "Open 7 days a week" } as Contact,
    footer: { companyName: "Michael Wong Driving School", tagline: "Expert driving instruction in the SF Bay Area.", copyright: "© 2026 Michael Wong Driving Instructor School", license: "DMV Licensed", links: [] as { label: string; url: string }[] } as FooterData,
    branding: { logoText: "MICHAEL WONG", logoSubtext: "Driving School", colors: { primary: "#0B192C", accent: "#FFE600", dark: "#030712", light: "#1E3E62", background: "#F8FAFC" } } as Branding,
  });

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", package: "defensive", timePreference: "afternoon", agreeToTerms: false });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* ── fetch content & record pageview ───────────── */
  useEffect(() => {
    fetch(`/api/content?t=${Date.now()}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setContent(d); }).catch(() => {});
    fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "pageview" }) }).catch(() => {});
  }, []);

  /* ── apply branding CSS vars ────────────────────── */
  useEffect(() => {
    const c = content.branding?.colors;
    if (!c) return;
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", c.primary);
    root.style.setProperty("--brand-accent", c.accent);
    root.style.setProperty("--brand-dark", c.dark);
    root.style.setProperty("--brand-light", c.light);
    root.style.setProperty("--brand-bg", c.background);
  }, [content.branding?.colors]);

  /* ── slideshow auto-advance ─────────────────────── */
  const slides = content.hero?.slides ?? FALLBACK_SLIDES;
  const nextSlide = useCallback(() => setCurrentSlide(s => (s + 1) % slides.length), [slides.length]);
  const prevSlide = useCallback(() => setCurrentSlide(s => (s - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  /* ── package selection ──────────────────────────── */
  useEffect(() => { setFormData(p => ({ ...p, package: selectedPackage })); }, [selectedPackage]);

  const handleSelectPackage = (id: string) => {
    setSelectedPackage(id);
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
  };

  /* ── form handlers ─────────────────────────────── */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") { const c = (e.target as HTMLInputElement).checked; setFormData(p => ({ ...p, [name]: c })); }
    else { setFormData(p => ({ ...p, [name]: value })); }
    if (formErrors[name]) setFormErrors(p => { const c = { ...p }; delete c[name]; return c; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Enter a valid email";
    if (!formData.phone.trim()) errs.phone = "Phone is required";
    if (!formData.agreeToTerms) errs.agreeToTerms = "You must agree to proceed";
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormSubmitted(true);
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    }).catch(() => {});
  };

  /* ── shorthand ─────────────────────────────────── */
  const b = content.branding ?? { logoText: "DRIVEWELL", logoSubtext: "Academy", colors: { primary: "#0B192C", accent: "#FFE600", dark: "#030712", light: "#1E3E62", background: "#F8FAFC" } };
  const ft = content.footer ?? { companyName: "DriveWell Academy", tagline: "", copyright: "", license: "", links: [] };
  const packages = content.packages ?? FALLBACK_PACKAGES;
  const contact = content.contact;
  const stats = content.hero?.stats;

  /* ── render ─────────────────────────────────────── */
  return (
    <div className="flex flex-col min-h-screen font-sans antialiased" style={{ backgroundColor: "var(--brand-bg, #F8FAFC)", color: "var(--brand-primary, #0B192C)" }}>

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b transition-all duration-300" style={{ backgroundColor: "color-mix(in srgb, var(--brand-dark, #030712) 92%, transparent)", borderColor: "color-mix(in srgb, var(--brand-light, #1E3E62) 35%, transparent)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-2.5 group">
            {b.logoImage ? (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-200">
                <Image src={b.logoImage} alt={b.logoText} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl tracking-tighter group-hover:scale-105 transition-transform duration-200 shadow-md" style={{ backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" }}>
                {b.logoText?.[0] ?? "D"}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-lg leading-none tracking-tight">{b.logoText}</span>
              <span className="font-bold text-xs uppercase tracking-widest leading-none mt-0.5" style={{ color: "var(--brand-accent, #FFE600)" }}>{b.logoSubtext}</span>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {["Home:#hero","Packages:#services","Reviews:#reviews","Contact:#register"].map(l => { const [t,h] = l.split(":"); return <a key={t} href={h} className="text-gray-300 hover:text-white text-sm font-semibold tracking-wide transition-colors">{t}</a>; })}
          </nav>
          <div className="hidden md:block">
            <a href="#register" className="px-6 py-2.5 rounded-full font-bold text-sm tracking-wide shadow-md hover:scale-[1.03] active:scale-[0.98] transition-all" style={{ backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" }}>Book a Lesson</a>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-300 hover:text-white transition-colors" aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 space-y-2" style={{ backgroundColor: "var(--brand-primary, #0B192C)" }}>
            {["Home:#hero","Packages:#services","Reviews:#reviews","Contact:#register"].map(l => { const [t,h] = l.split(":"); return <a key={t} href={h} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-gray-200 hover:text-white font-semibold transition-all">{t}</a>; })}
            <a href="#register" onClick={() => setMobileMenuOpen(false)} className="block text-center w-full py-3 rounded-xl font-bold shadow-md mt-2" style={{ backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" }}>Book a Lesson</a>
          </div>
        )}
      </header>

      {/* ═══════════════════ HERO SLIDESHOW ═══════════════════ */}
      <section id="hero" className="relative w-full overflow-hidden" style={{ height: "85vh", minHeight: "550px" }}>
        {/* Slides */}
        {slides.map((slide, idx) => (
          <div key={idx} className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ opacity: currentSlide === idx ? 1 : 0, zIndex: currentSlide === idx ? 1 : 0 }}>
            <Image src={slide.image} alt={slide.title} fill priority={idx === 0} sizes="100vw" className="object-cover" />
            {/* dark overlay */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(3,7,18,0.45) 0%, rgba(3,7,18,0.85) 100%)" }} />
          </div>
        ))}

        {/* Centered content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4">
          {slides.map((slide, idx) => (
            <div key={idx} className="absolute transition-all duration-700 ease-in-out max-w-3xl px-4" style={{ opacity: currentSlide === idx ? 1 : 0, transform: currentSlide === idx ? "translateY(0)" : "translateY(24px)" }}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-6 drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 max-w-xl mx-auto leading-relaxed mb-10 drop-shadow">
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#register" className="px-8 py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" }}>
                  Schedule Your Lesson
                </a>
                <a href="#services" className="px-8 py-4 rounded-xl font-bold text-sm tracking-wide border-2 border-white/30 text-white hover:bg-white/10 transition-all">
                  View Packages
                </a>
              </div>
            </div>
          ))}

          {/* Slide dots */}
          <div className="absolute bottom-8 flex items-center gap-3">
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentSlide(idx)} className="w-3 h-3 rounded-full transition-all duration-300 cursor-pointer" style={{ backgroundColor: currentSlide === idx ? "var(--brand-accent, #FFE600)" : "rgba(255,255,255,0.4)", transform: currentSlide === idx ? "scale(1.3)" : "scale(1)" }} aria-label={`Go to slide ${idx + 1}`} />
            ))}
          </div>
        </div>

        {/* Arrows */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all cursor-pointer" aria-label="Previous slide"><ChevronLeft size={22} /></button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all cursor-pointer" aria-label="Next slide"><ChevronRight size={22} /></button>
      </section>

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      <section className="py-6 border-b border-gray-200" style={{ backgroundColor: "var(--brand-primary, #0B192C)" }}>
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-4 text-center text-white">
          <div>
            <p className="text-3xl sm:text-4xl font-black" style={{ color: "var(--brand-accent, #FFE600)" }}>{stats?.passRate ?? "98%"}</p>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Pass Rate</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black" style={{ color: "var(--brand-accent, #FFE600)" }}>{stats?.graduates ?? "10k+"}</p>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Graduates</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black" style={{ color: "var(--brand-accent, #FFE600)" }}>{stats?.instructors ?? "15+"}</p>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Years of Teaching</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES ═══════════════════ */}
      <section id="services" className="py-20 scroll-mt-10" style={{ backgroundColor: "var(--brand-bg, #F8FAFC)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: "var(--brand-light, #1E3E62)", borderColor: "color-mix(in srgb, var(--brand-light, #1E3E62) 15%, transparent)", backgroundColor: "color-mix(in srgb, var(--brand-light, #1E3E62) 5%, transparent)" }}>Pricing Packages</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4 leading-tight">Flexible Packages Designed <br /><span style={{ color: "var(--brand-light, #1E3E62)" }}>to fit your goals</span></h2>
            <p className="text-gray-600 mt-4">All packages include free pickup and drop-off, dual-control training vehicles, and a certified personal instructor.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`flex flex-col justify-between rounded-3xl transition-all duration-300 ${pkg.popular ? "text-white shadow-xl lg:scale-[1.03] border-2 relative" : "bg-white shadow border border-gray-100 hover:shadow-lg"}`} style={pkg.popular ? { backgroundColor: "var(--brand-primary, #0B192C)", borderColor: "var(--brand-accent, #FFE600)", boxShadow: "0 0 0 4px color-mix(in srgb, var(--brand-accent) 15%, transparent)" } : undefined}>
                {pkg.popular && <div className="absolute top-0 right-8 transform -translate-y-1/2"><span className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md" style={{ backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" }}>Most Popular</span></div>}
                <div className="p-8 pb-4">
                  <span className={`text-xs font-black uppercase tracking-wider`} style={{ color: pkg.popular ? "var(--brand-accent, #FFE600)" : "var(--brand-light, #1E3E62)" }}>{pkg.lessons} • {pkg.duration}</span>
                  <h3 className="text-2xl font-black mt-2 leading-none">{pkg.name}</h3>
                  <p className={`text-sm mt-3 leading-relaxed ${pkg.popular ? "text-gray-300" : "text-gray-500"}`}>{pkg.tagline}</p>
                  <div className="flex items-baseline gap-1 mt-6"><span className="text-4xl font-black tracking-tight">{pkg.price}</span><span className={`text-xs font-semibold uppercase ${pkg.popular ? "text-gray-400" : "text-gray-500"}`}>Full Package</span></div>
                </div>
                <div className="px-8 py-6 border-t border-b border-dashed border-gray-200/20">
                  <ul className="space-y-3.5">
                    {pkg.features.map((f, i) => <li key={i} className="flex items-start gap-2.5 text-sm"><CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: pkg.popular ? "var(--brand-accent, #FFE600)" : "#10b981" }} /><span className={pkg.popular ? "text-gray-200" : "text-gray-700"}>{f}</span></li>)}
                  </ul>
                </div>
                <div className="p-8">
                  <button onClick={() => handleSelectPackage(pkg.id)} className="w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer" style={pkg.popular ? { backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" } : { backgroundColor: "var(--brand-primary, #0B192C)", color: "#fff" }}>Select & Register</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ REVIEWS ═══════════════════ */}
      <section id="reviews" className="py-20 text-white scroll-mt-10" style={{ backgroundColor: "var(--brand-primary, #0B192C)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: "var(--brand-accent, #FFE600)", borderColor: "color-mix(in srgb, var(--brand-accent) 20%, transparent)", backgroundColor: "color-mix(in srgb, var(--brand-accent) 10%, transparent)" }}>Verified Reviews</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">What Our Graduates <span style={{ color: "var(--brand-accent, #FFE600)" }}>Are Saying</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(content.reviews ?? FALLBACK_REVIEWS).map((r) => (
              <div key={r.id} className="p-8 rounded-3xl border flex flex-col justify-between shadow-md" style={{ backgroundColor: "color-mix(in srgb, var(--brand-dark, #030712) 60%, transparent)", borderColor: "color-mix(in srgb, var(--brand-light, #1E3E62) 35%, transparent)" }}>
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: "color-mix(in srgb, var(--brand-light) 50%, transparent)", borderColor: "var(--brand-light, #1E3E62)", color: "var(--brand-accent, #FFE600)" }}>{r.initials}</div>
                      <div><h4 className="font-bold text-white text-sm leading-none">{r.name}</h4><span className="text-gray-400 text-xs mt-1 inline-block">{r.date}</span></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded" style={{ color: "var(--brand-accent, #FFE600)", backgroundColor: "color-mix(in srgb, var(--brand-accent) 10%, transparent)", borderColor: "color-mix(in srgb, var(--brand-accent) 20%, transparent)" }}>{r.tag}</span>
                  </div>
                  <div className="flex gap-1 mb-4" style={{ color: "var(--brand-accent, #FFE600)" }}>{[...Array(r.rating)].map((_, i) => <Star key={i} size={15} fill="currentColor" />)}</div>
                  <p className="text-gray-300 text-sm leading-relaxed italic">&ldquo;{r.text}&rdquo;</p>
                </div>
                <div className="flex items-center gap-2 mt-6 pt-4 border-t" style={{ borderColor: "color-mix(in srgb, var(--brand-light) 20%, transparent)" }}><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Verified Graduate</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CONTACT / REGISTRATION ═══════════════════ */}
      <section id="register" className="py-20 scroll-mt-10" style={{ backgroundColor: "var(--brand-bg, #F8FAFC)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Info */}
            <div className="lg:col-span-5">
              <span className="font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: "var(--brand-light, #1E3E62)", borderColor: "color-mix(in srgb, var(--brand-light) 15%, transparent)" }}>Book a Lesson Slot</span>
              <h2 className="text-3xl sm:text-4xl font-black mt-4 leading-tight">Ready to take the <br /><span style={{ color: "var(--brand-light, #1E3E62)" }}>driver&apos;s seat?</span></h2>
              <p className="text-gray-600 mt-4 leading-relaxed">Fill out the form and our coordinator will contact you within 2 business hours.</p>
              <div className="mt-8 space-y-6">
                {[{ icon: MapPin, title: "Service Area", text: contact.address }, { icon: Clock, title: "Hours", text: contact.hours }, { icon: Mail, title: "Email", text: contact.email }].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl text-white flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--brand-primary, #0B192C)" }}><Icon size={18} /></div>
                    <div><h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: "var(--brand-primary, #0B192C)" }}>{title}</h4><p className="text-gray-500 text-sm mt-0.5">{text}</p></div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-100 flex items-center gap-3">
                <Award size={36} className="flex-shrink-0" style={{ color: "var(--brand-accent, #FFE600)" }} />
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">Licensed by the Department of Motor Vehicles (DMV). Certificate Course provider.</p>
              </div>
            </div>
            {/* Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl shadow-lg border border-gray-100 p-8 sm:p-10">
              {formSubmitted ? (
                <div className="text-center py-8 px-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 border border-emerald-200"><CheckCircle size={32} /></div>
                  <h3 className="text-2xl font-black leading-tight" style={{ color: "var(--brand-primary)" }}>Registration Submitted!</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">We&apos;ll contact you at <strong>{formData.phone}</strong> shortly.</p>
                  <button onClick={() => { setFormSubmitted(false); setFormData({ name: "", email: "", phone: "", package: "defensive", timePreference: "afternoon", agreeToTerms: false }); }} className="mt-8 px-6 py-2.5 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-80 transition-colors cursor-pointer" style={{ backgroundColor: "var(--brand-primary)" }}>Submit Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div><h3 className="text-xl font-black leading-none" style={{ color: "var(--brand-primary)" }}>Lesson Booking Form</h3><p className="text-xs text-gray-400 mt-1">Provide your details to schedule lessons.</p></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[{ id: "name", label: "Full Name", type: "text", icon: User, placeholder: "John Doe", val: formData.name }, { id: "phone", label: "Phone", type: "tel", icon: Phone, placeholder: "(555) 000-0000", val: formData.phone }].map(f => (
                      <div key={f.id}><label htmlFor={f.id} className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: "color-mix(in srgb, var(--brand-primary) 70%, transparent)" }}>{f.label}</label><div className="relative"><f.icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type={f.type} id={f.id} name={f.id} value={f.val} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 ${formErrors[f.id] ? "border-red-500" : "border-gray-200"}`} style={{ backgroundColor: "var(--brand-bg, #F8FAFC)" }} placeholder={f.placeholder} /></div>{formErrors[f.id] && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-semibold"><AlertCircle size={12} />{formErrors[f.id]}</p>}</div>
                    ))}
                  </div>
                  <div><label htmlFor="email" className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: "color-mix(in srgb, var(--brand-primary) 70%, transparent)" }}>Email</label><div className="relative"><Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 ${formErrors.email ? "border-red-500" : "border-gray-200"}`} style={{ backgroundColor: "var(--brand-bg, #F8FAFC)" }} placeholder="john@example.com" /></div>{formErrors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-semibold"><AlertCircle size={12} />{formErrors.email}</p>}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label htmlFor="package" className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: "color-mix(in srgb, var(--brand-primary) 70%, transparent)" }}>Package</label><div className="relative"><Car size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><select id="package" name="package" value={formData.package} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none appearance-none" style={{ backgroundColor: "var(--brand-bg)" }}><option value="starter">Starter Permit Pack</option><option value="defensive">Defensive Master Class</option><option value="elite">Elite Test Readiness</option></select></div></div>
                    <div><label htmlFor="timePreference" className="block text-xs font-black uppercase tracking-wider mb-2" style={{ color: "color-mix(in srgb, var(--brand-primary) 70%, transparent)" }}>Preferred Time</label><div className="relative"><Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><select id="timePreference" name="timePreference" value={formData.timePreference} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none appearance-none" style={{ backgroundColor: "var(--brand-bg)" }}><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="weekend">Weekends Only</option></select></div></div>
                  </div>
                  <div><label className="flex items-start gap-3 select-none cursor-pointer"><input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} className="mt-1 w-4 h-4 rounded border-gray-300" /><span className="text-xs text-gray-500 leading-normal font-medium">I authorize DriveWell Academy to contact me to arrange driving lessons. I agree to the privacy policy.</span></label>{formErrors.agreeToTerms && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-semibold"><AlertCircle size={12} />{formErrors.agreeToTerms}</p>}</div>
                  <button type="submit" className="w-full py-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer" style={{ backgroundColor: "var(--brand-primary, #0B192C)" }}>Confirm Booking</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t text-gray-400 py-12" style={{ backgroundColor: "var(--brand-dark, #030712)", borderColor: "color-mix(in srgb, var(--brand-light) 30%, transparent)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b" style={{ borderColor: "color-mix(in srgb, var(--brand-light) 20%, transparent)" }}>
            <div className="space-y-4">
              <a href="#hero" className="flex items-center gap-2">
                {b.logoImage ? (
                  <div className="relative w-8 h-8 rounded overflow-hidden">
                    <Image src={b.logoImage} alt={b.logoText} fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded flex items-center justify-center font-black text-base" style={{ backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" }}>
                    {b.logoText?.[0] ?? "D"}
                  </div>
                )}
                <span className="text-white font-extrabold tracking-wide text-base leading-none">{ft.companyName}</span>
              </a>
              <p className="text-xs leading-relaxed text-gray-500">{ft.tagline}</p>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{ft.copyright}</p>
            </div>
            <div><h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Academy</h4><ul className="space-y-2 text-xs"><li><a href="#hero" className="hover:text-white transition-colors">Home</a></li><li><a href="#services" className="hover:text-white transition-colors">Packages</a></li><li><a href="#reviews" className="hover:text-white transition-colors">Reviews</a></li><li><a href="#register" className="hover:text-white transition-colors">Book Lesson</a></li></ul></div>
            <div><h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Standards</h4><ul className="space-y-2 text-xs text-gray-500">{["Fully Insured Vehicles","Background-checked Staff","DMV Certified Syllabus","Modern Safety Fleet"].map(s => <li key={s} className="flex items-center gap-1.5"><Check size={12} style={{ color: "var(--brand-accent, #FFE600)" }} />{s}</li>)}</ul></div>
            <div><h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Contact</h4><p className="text-xs text-gray-500 leading-normal mb-3">{contact.address}</p><a href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`} className="block text-xs font-bold hover:underline mb-1" style={{ color: "var(--brand-accent, #FFE600)" }}>📞 {contact.phone}</a><a href={`mailto:${contact.email}`} className="block text-gray-500 text-xs hover:text-white transition-colors">✉️ {contact.email}</a></div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 font-semibold uppercase tracking-wider">
            <div className="flex gap-4">
              {ft.links?.map((l, i) => <a key={i} href={l.url} className="hover:text-gray-400">{l.label}</a>)}
              <a href="/login" className="text-gray-500 hover:text-white transition-colors">🔐 Admin Portal</a>
              <span>{ft.license}</span>
            </div>
            <p>Designed with safety & care.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
