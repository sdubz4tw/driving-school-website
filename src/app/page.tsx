"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  Check,
  MapPin,
  Award,
  Clock,
  Mail,
  Menu,
  X,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { SiteContent } from "@/types";
import { DEFAULT_CONTENT } from "@/types";

export default function Home() {
  /* ── state ─────────────────────────────────────── */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  /* ── fetch content ─────────────────────────────── */
  useEffect(() => {
    fetch(`/api/content?t=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setContent(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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

    // Optimized: Calculated color-mix combinations set once at root level to prevent raw runtime computations in DOM
    root.style.setProperty("--brand-dark-92", `color-mix(in srgb, ${c.dark} 92%, transparent)`);
    root.style.setProperty("--brand-light-35", `color-mix(in srgb, ${c.light} 35%, transparent)`);
    root.style.setProperty("--brand-light-20", `color-mix(in srgb, ${c.light} 20%, transparent)`);
    root.style.setProperty("--brand-accent-10", `color-mix(in srgb, ${c.accent} 10%, transparent)`);
    root.style.setProperty("--brand-accent-20", `color-mix(in srgb, ${c.accent} 20%, transparent)`);
  }, [content.branding?.colors]);

  /* ── slideshow auto-advance ─────────────────────── */
  const slides = content.hero?.slides ?? DEFAULT_CONTENT.hero.slides;
  const slideCount = slides.length;

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % slideCount);
    }, 6000);
    return () => clearInterval(timer);
  }, [slideCount]);

  const nextSlide = () => setCurrentSlide((s) => (s + 1) % slideCount);
  const prevSlide = () => setCurrentSlide((s) => (s - 1 + slideCount) % slideCount);

  /* ── shorthand ─────────────────────────────────── */
  const b = content.branding ?? DEFAULT_CONTENT.branding;
  const ft = content.footer ?? DEFAULT_CONTENT.footer;
  const contact = content.contact ?? DEFAULT_CONTENT.contact;
  const stats = content.hero?.stats ?? DEFAULT_CONTENT.hero.stats;
  const packages = content.packages ?? DEFAULT_CONTENT.packages;

  const handleSelectPackage = () => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
  };

  const vis = content.visibility ?? { hero: true, stats: true, packages: false, reviews: true, contactInfo: true };

  return (
    <div 
      className="flex flex-col min-h-screen font-sans antialiased" 
      style={{ backgroundColor: "var(--brand-bg, #F8FAFC)", color: "var(--brand-primary, #0B192C)" }}
    >
      {/* ═══════════════════ HEADER ═══════════════════ */}
      <header 
        className="sticky top-0 z-50 w-full backdrop-blur-md border-b transition-all duration-300" 
        style={{ 
          backgroundColor: "var(--brand-dark-92, rgba(3, 7, 18, 0.92))", 
          borderColor: "var(--brand-light-35, rgba(30, 62, 98, 0.35))" 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-2.5 group">
            {b.logoImage ? (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-200">
                <Image src={b.logoImage} alt={b.logoText} fill className="object-contain" />
              </div>
            ) : (
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm tracking-tighter group-hover:scale-105 transition-transform duration-200 shadow-md" 
                style={{ backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" }}
              >
                {b.logoText ? b.logoText.split(" ").map(w => w[0]).join("").slice(0, 2) : "MW"}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-lg leading-none tracking-tight">{b.logoText}</span>
              <span className="font-bold text-xs uppercase tracking-widest leading-none mt-0.5" style={{ color: "var(--brand-accent, #FFE600)" }}>{b.logoSubtext}</span>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {["Home:#hero", "Reviews:#reviews", "Contact:#register"].map((l) => {
              const [t, h] = l.split(":");
              return (
                <a key={t} href={h} className="text-gray-300 hover:text-white text-sm font-semibold tracking-wide transition-colors">
                  {t}
                </a>
              );
            })}
          </nav>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors" 
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 space-y-2" style={{ backgroundColor: "var(--brand-primary, #0B192C)" }}>
            {["Home:#hero", "Reviews:#reviews", "Contact:#register"].map((l) => {
              const [t, h] = l.split(":");
              return (
                <a 
                  key={t} 
                  href={h} 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-4 py-3 rounded-lg text-gray-200 hover:text-white font-semibold transition-all"
                >
                  {t}
                </a>
              );
            })}
          </div>
        )}
      </header>

      {/* ═══════════════════ HERO SLIDESHOW ═══════════════════ */}
      {vis.hero !== false && (
        <section id="hero" className="relative w-full overflow-hidden bg-gray-950" style={{ height: "85vh", minHeight: "550px" }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-white" />
            </div>
          ) : (
            <>
              {slides.map((slide, idx) => (
                <div 
                  key={idx} 
                  className="absolute inset-0 transition-opacity duration-1000 ease-in-out" 
                  style={{ opacity: currentSlide === idx ? 1 : 0, zIndex: currentSlide === idx ? 1 : 0 }}
                >
                  <Image src={slide.image} alt={slide.title} fill priority={idx === 0} sizes="100vw" className="object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(3,7,18,0.45) 0%, rgba(3,7,18,0.85) 100%)" }} />
                </div>
              ))}

              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4">
                {slides.map((slide, idx) => (
                  <div 
                    key={idx} 
                    className="absolute transition-all duration-700 ease-in-out max-w-3xl px-4" 
                    style={{ 
                      opacity: currentSlide === idx ? 1 : 0, 
                      transform: currentSlide === idx ? "translateY(0)" : "translateY(24px)",
                      pointerEvents: currentSlide === idx ? "auto" : "none" 
                    }}
                  >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-6 drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-200 max-w-xl mx-auto leading-relaxed mb-10 drop-shadow">
                      {slide.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a 
                        href="#register" 
                        className="px-8 py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all" 
                        style={{ backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" }}
                      >
                        Schedule Your Lesson
                      </a>
                    </div>
                  </div>
                ))}

                {/* Slide dots */}
                <div className="absolute bottom-8 flex items-center gap-3">
                  {slides.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentSlide(idx)} 
                      className="w-3 h-3 rounded-full transition-all duration-300 cursor-pointer" 
                      style={{ 
                        backgroundColor: currentSlide === idx ? "var(--brand-accent, #FFE600)" : "rgba(255,255,255,0.4)", 
                        transform: currentSlide === idx ? "scale(1.3)" : "scale(1)" 
                      }} 
                      aria-label={`Go to slide ${idx + 1}`} 
                    />
                  ))}
                </div>
              </div>

              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all cursor-pointer" aria-label="Previous slide"><ChevronLeft size={22} /></button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/50 transition-all cursor-pointer" aria-label="Next slide"><ChevronRight size={22} /></button>
            </>
          )}
        </section>
      )}

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      {vis.stats !== false && (
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
      )}

      {/* ═══════════════════ SERVICES (PACKAGES) ═══════════════════ */}
      {vis.packages === true && (
        <section id="services" className="py-20 scroll-mt-10" style={{ backgroundColor: "var(--brand-bg, #F8FAFC)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: "var(--brand-light, #1E3E62)", borderColor: "var(--brand-light-20)", backgroundColor: "color-mix(in srgb, var(--brand-light, #1E3E62) 5%, transparent)" }}>Pricing Packages</span>
              <h2 className="text-3xl sm:text-4xl font-black mt-4 leading-tight">Flexible Packages Designed <br /><span style={{ color: "var(--brand-light, #1E3E62)" }}>to fit your goals</span></h2>
              <p className="text-gray-600 mt-4">All packages include free pickup and drop-off, dual-control training vehicles, and a certified personal instructor.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {packages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className={`flex flex-col justify-between rounded-3xl transition-all duration-300 ${pkg.popular ? "text-white shadow-xl lg:scale-[1.03] border-2 relative" : "bg-white shadow border border-gray-100 hover:shadow-lg"}`} 
                  style={pkg.popular ? { backgroundColor: "var(--brand-primary, #0B192C)", borderColor: "var(--brand-accent, #FFE600)", boxShadow: "0 0 0 4px var(--brand-accent-20)" } : undefined}
                >
                  {pkg.popular && <div className="absolute top-0 right-8 transform -translate-y-1/2"><span className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md" style={{ backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" }}>Most Popular</span></div>}
                  <div className="p-8 pb-4">
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: pkg.popular ? "var(--brand-accent, #FFE600)" : "var(--brand-light, #1E3E62)" }}>{pkg.lessons} • {pkg.duration}</span>
                    <h3 className="text-2xl font-black mt-2 leading-none">{pkg.name}</h3>
                    <p className={`text-sm mt-3 leading-relaxed ${pkg.popular ? "text-gray-300" : "text-gray-500"}`}>{pkg.tagline}</p>
                    <div className="flex items-baseline gap-1 mt-6"><span className="text-4xl font-black tracking-tight">{pkg.price}</span><span className={`text-xs font-semibold uppercase ${pkg.popular ? "text-gray-400" : "text-gray-500"}`}>Full Package</span></div>
                  </div>
                  <div className="px-8 py-6 border-t border-b border-dashed border-gray-200/20">
                    <ul className="space-y-3.5">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: pkg.popular ? "var(--brand-accent, #FFE600)" : "#10b981" }} />
                          <span className={pkg.popular ? "text-gray-200" : "text-gray-700"}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-8">
                    <button 
                      onClick={handleSelectPackage} 
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer" 
                      style={pkg.popular ? { backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" } : { backgroundColor: "var(--brand-primary, #0B192C)", color: "#fff" }}
                    >
                      Select & Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ REVIEWS ═══════════════════ */}
      {vis.reviews !== false && (
        <section id="reviews" className="py-20 text-white scroll-mt-10" style={{ backgroundColor: "var(--brand-primary, #0B192C)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="font-extrabold text-xs uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: "var(--brand-accent, #FFE600)", borderColor: "var(--brand-accent-20)", backgroundColor: "var(--brand-accent-10)" }}>Verified Reviews</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">What Our Graduates <span style={{ color: "var(--brand-accent, #FFE600)" }}>Are Saying</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(content.reviews ?? DEFAULT_CONTENT.reviews).map((r) => (
                <div 
                  key={r.id} 
                  className="p-8 rounded-3xl border flex flex-col justify-between shadow-md" 
                  style={{ 
                    backgroundColor: "color-mix(in srgb, var(--brand-dark, #030712) 60%, transparent)", 
                    borderColor: "var(--brand-light-35)" 
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border" 
                          style={{ 
                            backgroundColor: "color-mix(in srgb, var(--brand-light) 50%, transparent)", 
                            borderColor: "var(--brand-light, #1E3E62)", 
                            color: "var(--brand-accent, #FFE600)" 
                          }}
                        >
                          {r.initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm leading-none">{r.name}</h4>
                          <span className="text-gray-400 text-xs mt-1 inline-block">{r.date}</span>
                        </div>
                      </div>
                      <span 
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded" 
                        style={{ 
                          color: "var(--brand-accent, #FFE600)", 
                          backgroundColor: "var(--brand-accent-10)", 
                          borderColor: "var(--brand-accent-20)" 
                        }}
                      >
                        {r.tag}
                      </span>
                    </div>
                    <div className="flex gap-1 mb-4" style={{ color: "var(--brand-accent, #FFE600)" }}>
                      {[...Array(r.rating)].map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed italic">&ldquo;{r.text}&rdquo;</p>
                  </div>
                  <div 
                    className="flex items-center gap-2 mt-6 pt-4 border-t" 
                    style={{ borderColor: "var(--brand-light-20)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Verified Graduate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ CONTACT / REGISTRATION ═══════════════════ */}
      {vis.contactInfo !== false && (
        <section id="register" className="py-20 scroll-mt-10" style={{ backgroundColor: "var(--brand-bg, #F8FAFC)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-black mt-4 leading-tight">
                {contact.title ?? "Ready to take the"}{" "}
                <br />
                <span style={{ color: "var(--brand-light, #1E3E62)" }}>{contact.titleHighlight ?? "driver's seat?"}</span>
              </h2>
              <p className="text-gray-600 mt-4 leading-relaxed font-medium">
                {contact.description ?? "Get in touch with us to schedule lessons or ask questions. Our coordinator will contact you shortly."}
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { icon: MapPin, title: "Service Area", text: contact.address },
                  { icon: Clock, title: "Hours", text: contact.hours },
                  { icon: Mail, title: "Email", text: contact.email }
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl text-white flex items-center justify-center flex-shrink-0 mb-4" style={{ backgroundColor: "var(--brand-primary, #0B192C)" }}>
                      <Icon size={20} />
                    </div>
                    <h4 className="font-bold text-sm uppercase tracking-wide mb-1" style={{ color: "var(--brand-primary, #0B192C)" }}>{title}</h4>
                    <p className="text-gray-500 text-xs leading-normal">{text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-100 flex items-center gap-3">
                <Award size={36} className="flex-shrink-0" style={{ color: "var(--brand-accent, #FFE600)" }} />
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">Licensed by the Department of Motor Vehicles (DMV). Certificate Course provider.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t text-gray-400 py-12" style={{ backgroundColor: "var(--brand-dark, #030712)", borderColor: "var(--brand-light-30, rgba(30,62,98,0.3))" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b" style={{ borderColor: "var(--brand-light-20)" }}>
            <div className="space-y-4">
              <a href="#hero" className="flex items-center gap-2">
                {b.logoImage ? (
                  <div className="relative w-8 h-8 rounded overflow-hidden">
                    <Image src={b.logoImage} alt={b.logoText} fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded flex items-center justify-center font-black text-xs" style={{ backgroundColor: "var(--brand-accent, #FFE600)", color: "var(--brand-primary, #0B192C)" }}>
                    {b.logoText ? b.logoText.split(" ").map(w => w[0]).join("").slice(0, 2) : "MW"}
                  </div>
                )}
                <span className="text-white font-extrabold tracking-wide text-base leading-none">{ft.companyName}</span>
              </a>
              <p className="text-xs leading-relaxed text-gray-500">{ft.tagline}</p>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{ft.copyright}</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Academy</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#hero" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#reviews" className="hover:text-white transition-colors">Reviews</a></li>
                <li><a href="#register" className="hover:text-white transition-colors">Book Lesson</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Standards</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                {["Fully Insured Vehicles", "Background-checked Staff", "DMV Certified Syllabus", "Modern Safety Fleet"].map((s) => (
                  <li key={s} className="flex items-center gap-1.5">
                    <Check size={12} style={{ color: "var(--brand-accent, #FFE600)" }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Contact</h4>
              <p className="text-xs text-gray-500 leading-normal mb-3">{contact.address}</p>
              <a href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`} className="block text-xs font-bold hover:underline mb-1" style={{ color: "var(--brand-accent, #FFE600)" }}>
                <span aria-hidden="true">📞</span> {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="block text-gray-500 text-xs hover:text-white transition-colors">
                <span aria-hidden="true">✉️</span> {contact.email}
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 font-semibold uppercase tracking-wider">
            <div className="flex gap-4">
              {ft.links?.map((l, i) => <a key={i} href={l.url} className="hover:text-gray-400">{l.label}</a>)}
              <a href="/admin/login" className="text-gray-500 hover:text-white transition-colors">🔐 Admin</a>
              <span>{ft.license}</span>
            </div>
            <p>Designed with safety & care.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
