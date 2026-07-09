"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Save, LogOut, Plus, Trash2, Palette, Package, Phone, Eye,
  LayoutGrid, FileText, Upload, ImageIcon, BarChart3, TrendingUp,
  Users, MousePointerClick, Globe, ArrowUpRight, ArrowDownRight, X,
} from "lucide-react";

/* ── types ─────────────────────────────────────────────────── */
interface Slide { image: string; title: string; subtitle: string }
interface Pkg { id: string; name: string; price: string; lessons: string; duration: string; popular: boolean; tagline: string; features: string[] }
interface Review { id: number; name: string; rating: number; date: string; text: string; tag: string; initials: string }
interface Contact { phone: string; email: string; address: string; hours: string }
interface FooterData { companyName: string; tagline: string; copyright: string; license: string; links: { label: string; url: string }[] }
interface Branding { logoText: string; logoSubtext: string; logoImage?: string; colors: { primary: string; accent: string; dark: string; light: string; background: string } }
interface UploadedImage { name: string; url: string; size: number; uploadedAt?: string }
interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  package: string;
  timePreference: string;
  timestamp: string;
}
interface ContentData {
  hero: { slides: Slide[]; stats: { passRate: string; graduates: string; instructors: string } };
  packages: Pkg[]; reviews: Review[]; contact: Contact; footer: FooterData; branding: Branding;
}


const COLOR_PRESETS = [
  { name: "Navy & Gold", colors: { primary: "#0B192C", accent: "#FFE600", dark: "#030712", light: "#1E3E62", background: "#F8FAFC" } },
  { name: "Midnight Emerald", colors: { primary: "#064E3B", accent: "#34D399", dark: "#022C22", light: "#10B981", background: "#F0FDF4" } },
  { name: "Slate & Coral", colors: { primary: "#1E293B", accent: "#FB7185", dark: "#0F172A", light: "#475569", background: "#FFF1F2" } },
  { name: "Charcoal & Sky", colors: { primary: "#18181B", accent: "#38BDF8", dark: "#09090B", light: "#3F3F46", background: "#F0F9FF" } },
  { name: "Deep Purple", colors: { primary: "#2E1065", accent: "#A78BFA", dark: "#1E0A40", light: "#6D28D9", background: "#FAF5FF" } },
  { name: "Warm Ember", colors: { primary: "#431407", accent: "#FB923C", dark: "#1C0A00", light: "#9A3412", background: "#FFF7ED" } },
];

/* ── component ────────────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const [content, setContent] = useState<ContentData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [imageLimits, setImageLimits] = useState({ maxSizeMB: 5, maxDimension: 4096, allowedTypes: ["JPEG", "PNG", "WebP", "SVG"] });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch("/api/content").then(r => r.json()).then(d => { setContent(d); setLoading(false); }).catch(() => setLoading(false)); }, []);
  useEffect(() => { fetch("/api/images").then(r => r.json()).then(d => { setImages(d.images || []); if (d.limits) setImageLimits(d.limits); }).catch(() => {}); }, []);
  useEffect(() => {
    if (activeTab === "bookings") {
      setBookingsLoading(true);
      fetch("/api/bookings")
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d && d.bookings) setBookings(d.bookings); })
        .catch(() => {})
        .finally(() => setBookingsLoading(false));
    }
  }, [activeTab]);

  const handleSave = async () => { if (!content) return; setSaving(true); try { const res = await fetch("/api/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) }); if (res.status === 401) { router.push("/login"); return; } if (res.ok) { setSaved(true); setShowSuccessModal(true); setTimeout(() => setSaved(false), 3000); } } finally { setSaving(false); } };
  const handleLogout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); };

  const updateHero = useCallback((fn: (h: ContentData["hero"]) => ContentData["hero"]) => { setContent(p => p ? { ...p, hero: fn(p.hero) } : p); }, []);
  const updatePkg = useCallback((idx: number, fn: (p: Pkg) => Pkg) => { setContent(p => { if (!p) return p; const pkgs = [...p.packages]; pkgs[idx] = fn(pkgs[idx]); return { ...p, packages: pkgs }; }); }, []);
  const updateContact = useCallback((fn: (c: Contact) => Contact) => { setContent(p => p ? { ...p, contact: fn(p.contact) } : p); }, []);
  const updateFooter = useCallback((fn: (f: FooterData) => FooterData) => { setContent(p => p ? { ...p, footer: fn(p.footer) } : p); }, []);
  const updateBranding = useCallback((fn: (b: Branding) => Branding) => { setContent(p => p ? { ...p, branding: fn(p.branding) } : p); }, []);
  const compressImage = (file: File, maxWidth = 1200, maxHeight = 800, quality = 0.7): Promise<File> => {
    return new Promise((resolve) => {
      if (file.type === "image/svg+xml") {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
              } else {
                resolve(file);
              }
            },
            file.type,
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleUpload = async (file: File, slot?: string): Promise<string | null> => {
    setUploading(true); setUploadError("");
    let fileToUpload = file;
    try {
      fileToUpload = await compressImage(file);
    } catch {
      // ignore and upload original file
    }

    const isProduction = typeof window !== "undefined" && 
      window.location.hostname !== "localhost" && 
      !window.location.hostname.includes("127.0.0.1");

    if (isProduction) {
      try {
        const reader = new FileReader();
        return new Promise<string | null>((resolve) => {
          reader.readAsDataURL(fileToUpload);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => { setUploadError("Failed to read file"); resolve(null); };
        }).then(url => {
          setUploading(false);
          return url;
        });
      } catch {
        setUploadError("Failed to convert image");
        setUploading(false);
        return null;
      }
    }

    // Localhost API upload
    const fd = new FormData(); fd.append("file", fileToUpload); if (slot) fd.append("slot", slot);
    try {
      const res = await fetch("/api/images", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error || "Upload failed"); return null; }
      else { setImages(prev => [...prev, data.image]); return data.image.url; }
    } catch { setUploadError("Upload failed"); return null; }
    finally { setUploading(false); }
  };

  const handleDelete = async (name: string) => {
    try {
      const res = await fetch("/api/images", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (res.ok) setImages(prev => prev.filter(i => i.name !== name));
    } catch { /* silent */ }
  };
  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-950"><div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent" /></div>;
  if (!content) return <div className="flex items-center justify-center h-screen bg-gray-950 text-white">Failed to load content.</div>;

  const TABS = [
    { id: "bookings", label: "Bookings", icon: Users },
    { id: "hero", label: "Hero Slides", icon: Eye },
    { id: "packages", label: "Packages", icon: Package },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "footer", label: "Footer", icon: FileText },
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "branding", label: "Branding", icon: Palette },
  ];

  const InputField = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
    <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{label}</label><input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50" /></div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans antialiased">
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 text-gray-900 flex items-center justify-center font-black text-sm">{content.branding?.logoText?.[0] ?? "M"}</div>
            <span className="font-bold text-sm tracking-wide">{content.branding?.logoText ?? "Dashboard"} Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-xs text-gray-400 hover:text-white font-medium flex items-center gap-1.5 transition-colors"><Eye size={14} /> View Site</a>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 font-medium transition-colors cursor-pointer"><LogOut size={14} />Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 py-8 flex gap-8">
        <aside className="w-56 flex-shrink-0 hidden lg:block">
          <nav className="space-y-1 sticky top-24">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === t.id ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"}`}><t.icon size={16} />{t.label}</button>
            ))}
          </nav>
        </aside>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 flex justify-around py-2 px-1">
          {TABS.map(t => (<button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex flex-col items-center gap-0.5 px-1 py-1 rounded-md text-[9px] font-semibold cursor-pointer ${activeTab === t.id ? "text-yellow-400" : "text-gray-500"}`}><t.icon size={14} />{t.label.split(" ")[0]}</button>))}
        </div>

        <main className="flex-1 min-w-0 pb-20 lg:pb-0">

          {/* ══════ BOOKINGS ══════ */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Student Bookings & Registrations</h2>
                <div className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-400">
                  Total Leads: <span className="text-white font-bold">{bookings.length}</span>
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Registration Log</h3>
                
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <Users size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold">No bookings registered yet</p>
                    <p className="text-xs mt-1">Incoming form registrations will appear here in real-time.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                          <th className="text-left py-3 font-semibold">Student</th>
                          <th className="text-left py-3 font-semibold">Contact Info</th>
                          <th className="text-left py-3 font-semibold">Selected Package</th>
                          <th className="text-left py-3 font-semibold">Preference</th>
                          <th className="text-left py-3 font-semibold">Registered At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => (
                          <tr key={b.id} className="border-b border-gray-800/50 hover:bg-gray-800/10 transition-colors">
                            <td className="py-4 font-bold text-white pr-4">{b.name}</td>
                            <td className="py-4 pr-4">
                              <p className="text-xs text-gray-300 font-semibold">{b.phone}</p>
                              <p className="text-xs text-gray-500">{b.email}</p>
                            </td>
                            <td className="py-4 pr-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide inline-block ${
                                b.package === "elite"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : b.package === "defensive"
                                  ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                                  : "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                              }`}>
                                {b.package === "elite" ? "Elite Test Readiness" : b.package === "defensive" ? "Defensive Master Class" : "Starter Permit Pack"}
                              </span>
                            </td>
                            <td className="py-4 pr-4 capitalize text-gray-300 font-semibold">{b.timePreference}</td>
                            <td className="py-4 font-mono text-xs text-gray-500">
                              {new Date(b.timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════ HERO SLIDES ══════ */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between"><h2 className="text-2xl font-black">Hero Slideshow</h2><button onClick={() => updateHero(h => ({ ...h, slides: [...h.slides, { image: "/images/hero_slide_1.png", title: "New Slide", subtitle: "Edit this subtitle" }] }))} className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-yellow-300"><Plus size={14} /> Add Slide</button></div>
              <p className="text-sm text-gray-500">Slides auto-rotate every 6 seconds. Use an uploaded image URL from the Images tab, or a path like <code className="text-yellow-400">/images/hero_slide_1.png</code></p>
              {uploadError && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2"><X size={14} />{uploadError}</div>}
              {content.hero.slides.map((slide, idx) => (
                <div key={idx} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                  <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-yellow-400">Slide {idx + 1}</h3>{content.hero.slides.length > 1 && <button onClick={() => updateHero(h => ({ ...h, slides: h.slides.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"><Trash2 size={14} />Remove</button>}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Title" value={slide.title} onChange={v => updateHero(h => { const s = [...h.slides]; s[idx] = { ...s[idx], title: v }; return { ...h, slides: s }; })} />
                    <div>
                      <InputField label="Image Path" value={slide.image} onChange={v => updateHero(h => { const s = [...h.slides]; s[idx] = { ...s[idx], image: v }; return { ...h, slides: s }; })} />
                      <div className="mt-2 flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-yellow-400">
                          <Upload size={12} />
                          Upload from Computer
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/svg+xml"
                            className="hidden"
                            onChange={async (e) => {
                              if (e.target.files?.[0]) {
                                const url = await handleUpload(e.target.files[0], `slide_${idx + 1}`);
                                if (url) {
                                  updateHero(h => {
                                    const s = [...h.slides];
                                    s[idx] = { ...s[idx], image: url };
                                    return { ...h, slides: s };
                                  });
                                }
                              }
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {slide.image && (
                          <div className="relative w-16 h-10 rounded border border-gray-700 overflow-hidden bg-gray-950 flex-shrink-0">
                            <img src={slide.image} alt="Slide Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <InputField label="Subtitle" value={slide.subtitle} onChange={v => updateHero(h => { const s = [...h.slides]; s[idx] = { ...s[idx], subtitle: v }; return { ...h, slides: s }; })} />
                </div>
              ))}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4"><h3 className="text-sm font-bold text-yellow-400">Stats Bar</h3><div className="grid grid-cols-3 gap-4">{(["passRate", "graduates", "instructors"] as const).map(k => (<InputField key={k} label={k === "passRate" ? "Pass Rate" : k === "graduates" ? "Graduates" : "Years of Teaching"} value={content.hero.stats[k]} onChange={v => updateHero(h => ({ ...h, stats: { ...h.stats, [k]: v } }))} />))}</div></div>
            </div>
          )}

          {/* ══════ PACKAGES ══════ */}
          {activeTab === "packages" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">Packages</h2>
              {content.packages.map((pkg, idx) => (
                <div key={idx} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-yellow-400">{pkg.name || "Unnamed"}</h3><label className="flex items-center gap-2 text-xs text-gray-400 font-semibold cursor-pointer select-none"><input type="checkbox" checked={pkg.popular} onChange={e => updatePkg(idx, p => ({ ...p, popular: e.target.checked }))} className="rounded" />Popular</label></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{(["name","price","lessons","duration"] as const).map(k => (<InputField key={k} label={k} value={pkg[k]} onChange={v => updatePkg(idx, p => ({ ...p, [k]: v }))} />))}</div>
                  <InputField label="Tagline" value={pkg.tagline} onChange={v => updatePkg(idx, p => ({ ...p, tagline: v }))} />
                  <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Features</label>{pkg.features.map((f, fi) => (<div key={fi} className="flex items-center gap-2 mb-2"><input type="text" value={f} onChange={e => updatePkg(idx, p => { const fts = [...p.features]; fts[fi] = e.target.value; return { ...p, features: fts }; })} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none" /><button onClick={() => updatePkg(idx, p => ({ ...p, features: p.features.filter((_, i) => i !== fi) }))} className="text-red-400 hover:text-red-300 cursor-pointer"><Trash2 size={14} /></button></div>))}<button onClick={() => updatePkg(idx, p => ({ ...p, features: [...p.features, "New feature"] }))} className="text-xs text-yellow-400 font-semibold flex items-center gap-1 mt-1 cursor-pointer"><Plus size={12} />Add Feature</button></div>
                </div>
              ))}
            </div>
          )}

          {/* ══════ CONTACT ══════ */}
          {activeTab === "contact" && (
            <div className="space-y-6"><h2 className="text-2xl font-black">Contact Details</h2><div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">{(["phone","email","address","hours"] as const).map(k => (<InputField key={k} label={k} value={content.contact[k]} onChange={v => updateContact(c => ({ ...c, [k]: v }))} />))}</div></div>
          )}

          {/* ══════ FOOTER ══════ */}
          {activeTab === "footer" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">Footer Content</h2>
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">{(["companyName","tagline","copyright","license"] as const).map(k => (<InputField key={k} label={k === "companyName" ? "Company Name" : k} value={content.footer[k]} onChange={v => updateFooter(f => ({ ...f, [k]: v }))} />))}</div>
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-yellow-400">Footer Links</h3><button onClick={() => updateFooter(f => ({ ...f, links: [...(f.links || []), { label: "New Link", url: "#" }] }))} className="text-xs text-yellow-400 font-semibold flex items-center gap-1 cursor-pointer"><Plus size={12} /> Add Link</button></div>
                {content.footer.links?.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-3"><input type="text" value={link.label} onChange={e => updateFooter(f => { const ls = [...(f.links || [])]; ls[idx] = { ...ls[idx], label: e.target.value }; return { ...f, links: ls }; })} placeholder="Label" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none" /><input type="text" value={link.url} onChange={e => updateFooter(f => { const ls = [...(f.links || [])]; ls[idx] = { ...ls[idx], url: e.target.value }; return { ...f, links: ls }; })} placeholder="URL" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none" /><button onClick={() => updateFooter(f => ({ ...f, links: (f.links || []).filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-300 cursor-pointer"><Trash2 size={14} /></button></div>
                ))}
              </div>
            </div>
          )}

          {/* ══════ IMAGES ══════ */}
          {activeTab === "images" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">Image Manager</h2>

              {/* Upload guidelines */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                <h3 className="text-sm font-bold text-yellow-400">Upload Guidelines</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"><p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Max File Size</p><p className="text-lg font-black text-white">{imageLimits.maxSizeMB} MB</p></div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"><p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Max Dimensions</p><p className="text-lg font-black text-white">{imageLimits.maxDimension} × {imageLimits.maxDimension}px</p></div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"><p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Allowed Types</p><p className="text-lg font-black text-white">{imageLimits.allowedTypes.join(", ")}</p></div>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• <strong>Hero slides:</strong> Recommended 1920×1080px (16:9 landscape)</p>
                  <p>• <strong>Logo:</strong> Recommended 400×400px or 800×200px (square or wide). PNG with transparency preferred.</p>
                  <p>• <strong>General:</strong> Keep file sizes under 2MB for fast page loads.</p>
                </div>
              </div>

              {/* Logo upload */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                <h3 className="text-sm font-bold text-yellow-400">Logo Upload</h3>
                <p className="text-xs text-gray-500">Upload a logo image. After uploading, copy the URL and paste it into your branding settings. Recommended: 400×400px PNG with transparent background.</p>
                <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="hidden" onChange={async (e) => { if (e.target.files?.[0]) { const url = await handleUpload(e.target.files[0], "logo_img"); if (url) updateBranding(b => ({ ...b, logoImage: url })); } e.target.value = ""; }} />
                <button onClick={() => logoInputRef.current?.click()} disabled={uploading} className="px-6 py-3 rounded-xl bg-yellow-400 text-gray-900 font-bold text-sm flex items-center gap-2 cursor-pointer hover:bg-yellow-300 disabled:opacity-50"><Upload size={16} />{uploading ? "Uploading..." : "Upload Logo"}</button>
              </div>

              {/* General upload */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-yellow-400">Uploaded Images ({images.length})</h3>
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); e.target.value = ""; }} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 rounded-lg bg-yellow-400 text-gray-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-yellow-300 disabled:opacity-50"><Plus size={14} />{uploading ? "Uploading..." : "Upload Image"}</button>
                  </div>
                </div>
                {uploadError && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2"><X size={14} />{uploadError}</div>}

                {images.length === 0 ? (
                  <div className="text-center py-12 text-gray-600"><ImageIcon size={48} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-semibold">No images uploaded yet</p><p className="text-xs mt-1">Upload images to use in hero slides or as a logo.</p></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map(img => (
                      <div key={img.name} className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden group">
                        <div className="relative h-36 bg-gray-800">
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          <button onClick={() => handleDelete(img.name)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-500"><Trash2 size={12} /></button>
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="text-xs font-semibold text-white truncate">{img.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{(img.size / 1024).toFixed(0)} KB</p>
                          <button onClick={() => { navigator.clipboard.writeText(img.url); }} className="text-[10px] text-yellow-400 font-semibold hover:underline cursor-pointer">Copy URL</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════ BRANDING ══════ */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">Branding & Color Scheme</h2>
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                <h3 className="text-sm font-bold text-yellow-400">Logo settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="Logo Main Text" value={content.branding.logoText} onChange={v => updateBranding(b => ({ ...b, logoText: v }))} />
                  <InputField label="Logo Subtext" value={content.branding.logoSubtext} onChange={v => updateBranding(b => ({ ...b, logoSubtext: v }))} />
                  <div>
                    <InputField label="Logo Image Path" value={content.branding.logoImage || ""} onChange={v => updateBranding(b => ({ ...b, logoImage: v }))} />
                    <div className="mt-2 flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-yellow-400">
                        <Upload size={12} />
                        Upload from Computer
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              const url = await handleUpload(e.target.files[0], "logo_img");
                              if (url) {
                                updateBranding(b => ({ ...b, logoImage: url }));
                              }
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 p-4 rounded-xl border border-gray-700 bg-gray-800/50">
                  {content.branding.logoImage ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-950">
                      <Image src={content.branding.logoImage} alt={content.branding.logoText} fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl" style={{ backgroundColor: content.branding.colors.accent, color: content.branding.colors.primary }}>{content.branding.logoText?.[0] ?? "M"}</div>
                  )}
                  <div><span className="text-white font-extrabold text-lg leading-none tracking-tight block">{content.branding.logoText}</span><span className="font-bold text-xs uppercase tracking-widest leading-none mt-0.5 block" style={{ color: content.branding.colors.accent }}>{content.branding.logoSubtext}</span></div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                <h3 className="text-sm font-bold text-yellow-400">Quick Presets</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {COLOR_PRESETS.map(preset => (
                    <button key={preset.name} onClick={() => updateBranding(b => ({ ...b, colors: preset.colors }))} className="flex items-center gap-3 p-4 rounded-xl border border-gray-700 hover:border-yellow-400/50 transition-all cursor-pointer bg-gray-800/50 text-left"><div className="flex gap-1">{Object.values(preset.colors).slice(0, 3).map((c, i) => <div key={i} className="w-5 h-5 rounded-full border border-gray-600" style={{ backgroundColor: c }} />)}</div><span className="text-xs font-semibold">{preset.name}</span></button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-2"><Palette size={16} />Custom Color Picker</h3>
                <p className="text-xs text-gray-500">Click any swatch to open the native color picker.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {([
                    { key: "primary", label: "Primary", desc: "Navbar, headings, text" },
                    { key: "accent", label: "Accent", desc: "Buttons, badges, highlights" },
                    { key: "dark", label: "Dark", desc: "Footer background" },
                    { key: "light", label: "Light", desc: "Secondary accent, links" },
                    { key: "background", label: "Background", desc: "Page background" },
                  ] as const).map(c => (
                    <div key={c.key} className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">{c.label}</label>
                      <p className="text-[10px] text-gray-600 leading-snug">{c.desc}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="relative"><div className="w-12 h-12 rounded-xl border-2 border-gray-600 shadow-lg cursor-pointer overflow-hidden" style={{ backgroundColor: content.branding.colors[c.key] }}><input type="color" value={content.branding.colors[c.key]} onChange={e => updateBranding(b => ({ ...b, colors: { ...b.colors, [c.key]: e.target.value } }))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /></div></div>
                        <input type="text" value={content.branding.colors[c.key]} onChange={e => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateBranding(b => ({ ...b, colors: { ...b.colors, [c.key]: v } })); }} className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400/50" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl overflow-hidden border border-gray-700"><div className="h-14 flex">{Object.entries(content.branding.colors).map(([k, v]) => (<div key={k} className="flex-1 flex items-center justify-center" style={{ backgroundColor: v }}><span className="text-[9px] font-mono font-bold drop-shadow-md px-1 py-0.5 rounded" style={{ color: k === "background" || k === "accent" ? "#000" : "#fff", backgroundColor: "rgba(0,0,0,0.2)" }}>{k}</span></div>))}</div></div>
              </div>
            </div>
          )}

          {/* ═══ SAVE BUTTON ═══ */}
          <div className="mt-10 pt-6 border-t border-gray-800 flex items-center justify-between">
            <button onClick={handleSave} disabled={saving} className="px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer" style={{ backgroundColor: content.branding.colors.accent || "#FFE600", color: content.branding.colors.primary || "#0B192C" }}><Save size={16} />{saving ? "Saving..." : saved ? "✓ Saved!" : "Save & Publish Changes"}</button>
            {saved && <span className="text-emerald-400 text-xs font-semibold animate-pulse">Changes published!</span>}
          </div>
        </main>
      </div>

      {/* ═══ SUCCESS POPUP MODAL ═══ */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl mx-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-2xl border border-emerald-500/20">✓</div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Publish Successful!</h3>
              <p className="text-sm text-gray-400">All of your edits, image uploads, and color theme changes have been successfully saved and published.</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-400 transition-colors cursor-pointer">Awesome!</button>
          </div>
        </div>
      )}
    </div>
  );
}
