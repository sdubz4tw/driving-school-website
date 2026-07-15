/* ──────────────────────────────────────────────────────────────────
 *  src/types.ts — Single source-of-truth for all site content types
 * ────────────────────────────────────────────────────────────────── */

/* ── Hero ──────────────────────────────────────────────────────── */
export interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

export interface HeroStats {
  passRate: string;
  graduates: string;
  instructors: string;
}

export interface HeroContent {
  slides: HeroSlide[];
  stats: HeroStats;
}

/* ── Packages ─────────────────────────────────────────────────── */
export interface Package {
  id: string;
  name: string;
  price: string;
  lessons: string;
  duration: string;
  popular: boolean;
  tagline: string;
  features: string[];
}

/* ── Reviews ──────────────────────────────────────────────────── */
export interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  text: string;
  tag: string;
  initials: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  hours: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
}

/* ── Footer ───────────────────────────────────────────────────── */
export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterData {
  companyName: string;
  tagline: string;
  copyright: string;
  license: string;
  links: FooterLink[];
}

/* ── Branding ─────────────────────────────────────────────────── */
export interface BrandingColors {
  primary: string;
  accent: string;
  dark: string;
  light: string;
  background: string;
}

export interface Branding {
  logoText: string;
  logoSubtext: string;
  logoImage?: string;
  colors: BrandingColors;
}

export interface SectionVisibility {
  hero?: boolean;
  stats?: boolean;
  packages?: boolean;
  reviews?: boolean;
  contactInfo?: boolean;
  bookingForm?: boolean;
}

/* ── Top-level site content ───────────────────────────────────── */
export interface SiteContent {
  hero: HeroContent;
  packages: Package[];
  reviews: Review[];
  contact: ContactInfo;
  footer: FooterData;
  branding: Branding;
  visibility?: SectionVisibility;
}

/* ── Uploaded image metadata ──────────────────────────────────── */
export interface UploadedImage {
  name: string;
  url: string;
  size: number;
  uploadedAt?: string;
  isBase64Fallback?: boolean;
}

/* ── Booking ──────────────────────────────────────────────────── */
export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  package: string;
  timePreference: string;
  timestamp: string;
}

/* ══════════════════════════════════════════════════════════════════
 *  DEFAULT_CONTENT — hardcoded baseline rendered when Vercel Blob
 *  is unconfigured, offline, or the JSON hasn't been created yet.
 * ══════════════════════════════════════════════════════════════════ */
export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    slides: [
      {
        image: "/images/hero_slide_1.png",
        title: "San Francisco's Most Trusted Driving School",
        subtitle:
          "Expert 1-on-1 driving instruction in the SF Bay Area. Patient instructors, dual-control vehicles, and a proven track record of success.",
      },
      {
        image: "/images/hero_slide_2.png",
        title: "Master City & Highway Driving",
        subtitle:
          "Learn to navigate San Francisco's hills, traffic, and freeways with confidence. Real-world training that prepares you for anything.",
      },
      {
        image: "/images/hero_slide_3.png",
        title: "Get Your License — First Try",
        subtitle:
          "Join thousands of graduates who passed their DMV road test on the very first attempt. We guarantee results.",
      },
    ],
    stats: {
      passRate: "98%",
      graduates: "10k+",
      instructors: "5+",
    },
  },
  packages: [
    {
      id: "starter",
      name: "Starter Permit Pack",
      price: "$299",
      lessons: "5 Lessons",
      duration: "45 mins each",
      popular: false,
      tagline:
        "Perfect for new drivers getting comfortable behind the wheel for the first time.",
      features: [
        "Basic vehicle operations & controls",
        "Steering control & lane positioning",
        "Parking basics (parallel & perpendicular)",
        "1-on-1 certified instructor",
        "Free pickup & drop-off in SF",
      ],
    },
    {
      id: "defensive",
      name: "Defensive Master Class",
      price: "$549",
      lessons: "10 Lessons",
      duration: "60 mins each",
      popular: true,
      tagline:
        "Our most popular pack. Master SF hills, defensive driving, and full road test prep.",
      features: [
        "Everything in Starter Permit Pack",
        "Hill driving & San Francisco streets",
        "Highway & freeway confidence",
        "Night driving & poor weather handling",
        "Complete DMV road test simulation",
        "Certificate for insurance discount",
      ],
    },
    {
      id: "elite",
      name: "Elite Test Readiness",
      price: "$799",
      lessons: "15 Lessons",
      duration: "60 mins each",
      popular: false,
      tagline:
        "Complete mastery package. Includes vehicle rental for your official DMV road test.",
      features: [
        "Everything in Defensive Master Class",
        "Unlimited mock driving exams",
        "Priority booking slots",
        "Driving school vehicle for DMV road test",
        "Post-license freeway coaching session",
        "99% Pass Rate Guarantee",
      ],
    },
  ],
  reviews: [
    {
      id: 1,
      name: "Jenny L.",
      rating: 5,
      date: "3 weeks ago",
      text: "Michael is an amazing instructor! I was terrified of driving in San Francisco — the hills, the traffic, the parallel parking. He was so patient and broke everything down step by step. Passed my DMV test on the first try!",
      tag: "First Time Pass",
      initials: "JL",
    },
    {
      id: 2,
      name: "Kevin T.",
      rating: 5,
      date: "1 month ago",
      text: "Best driving school in the Bay Area, hands down. The instructors are professional, on time, and genuinely care about your safety. The dual-control car made me feel so much more comfortable as a beginner.",
      tag: "Highly Recommended",
      initials: "KT",
    },
    {
      id: 3,
      name: "Priya S.",
      rating: 5,
      date: "2 months ago",
      text: "I had my permit for 3 years and was too anxious to drive. Michael Wong's team completely changed that. After 10 lessons I felt confident enough to take my test — and I passed! Worth every penny.",
      tag: "Anxiety Overcome",
      initials: "PS",
    },
    {
      id: 4,
      name: "David M.",
      rating: 5,
      date: "1 month ago",
      text: "Flexible scheduling that actually works around a busy work schedule. They picked me up from my office downtown and dropped me back after each lesson. The freeway merging practice was a game changer.",
      tag: "Flexible Schedule",
      initials: "DM",
    },
    {
      id: 5,
      name: "Sarah C.",
      rating: 5,
      date: "3 weeks ago",
      text: "I've recommended this school to everyone I know. Clean cars, patient teachers, and they actually teach you how to handle real SF driving — Lombard Street, steep hills, tight parking. 10/10.",
      tag: "SF Specialist",
      initials: "SC",
    },
    {
      id: 6,
      name: "Marcus R.",
      rating: 5,
      date: "2 weeks ago",
      text: "Got my insurance discount certificate after completing the Defensive Master Class. The mock DMV test they do is almost identical to the real thing. Felt completely prepared on test day.",
      tag: "Insurance Discount",
      initials: "MR",
    },
  ],
  contact: {
    phone: "(415) 555-0188",
    email: "info@michaelwongdriving.com",
    address: "San Francisco, CA — Serving the entire SF Bay Area",
    hours: "Open 7 days a week. Office: Mon-Sat 8AM-8PM. Lessons available 24 hours.",
    title: "Ready to take the",
    titleHighlight: "driver's seat?",
    description: "Get in touch with us to schedule lessons or ask questions. Our coordinator will contact you shortly."
  },
  footer: {
    companyName: "Michael Wong Driving School",
    tagline:
      "Expert driving instruction in the San Francisco Bay Area. Patient instructors, modern dual-control vehicles, and a proven record of success.",
    copyright: "© 2026 Michael Wong Driving Instructor School",
    license: "DMV Licensed • CA Driving School",
    links: [
      { label: "Privacy Policy", url: "#" },
      { label: "Terms of Service", url: "#" },
      {
        label: "Yelp Reviews",
        url: "https://www.yelp.com/biz/michael-wong-driving-instructor-school-san-francisco",
      },
    ],
  },
  branding: {
    logoText: "MICHAEL WONG",
    logoSubtext: "Driving School",
    logoImage: "",
    colors: {
      primary: "#0B192C",
      accent: "#FFE600",
      dark: "#030712",
      light: "#1E3E62",
      background: "#F8FAFC",
    },
  },
  visibility: {
    hero: true,
    stats: true,
    packages: false,
    reviews: true,
    contactInfo: true,
    bookingForm: true,
  },
};
