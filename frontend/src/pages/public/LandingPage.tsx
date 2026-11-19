import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { MoaLogo } from '../../components/MoaLogo';
import {
  User,
  UserPlus,
  Dumbbell,
  Activity,
  HeartPulse,
  Users,
  Smile,
  TrendingUp,
  MapPin,
  Mail,
  ArrowRight,
  Menu,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Clock,
  Lock,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'STAFF_MEMBER') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'GYM_ATTENDANT') {
        navigate('/terminal', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Track active scroll section for header highlight
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'benefits', 'contact'];
      const scrollPos = window.scrollY + 140;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-[#00843D] selection:text-white scroll-smooth antialiased">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER / NAVBAR (Exact Match to Updated Specification)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <MoaLogo className="h-11 w-11 transition-transform group-hover:scale-105" size={44} />
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-wider text-[#00843D] uppercase leading-tight">
                Ministry of Agriculture
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-700 leading-tight">
                Staff Wellness &amp; Fitness Center
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a
              href="#home"
              className={`pb-1 transition-colors ${
                activeSection === 'home'
                  ? 'text-[#00843D] font-bold border-b-2 border-[#00843D]'
                  : 'hover:text-[#00843D]'
              }`}
            >
              Home
            </a>
            <a
              href="#about"
              className={`pb-1 transition-colors ${
                activeSection === 'about'
                  ? 'text-[#00843D] font-bold border-b-2 border-[#00843D]'
                  : 'hover:text-[#00843D]'
              }`}
            >
              About
            </a>
            <a
              href="#services"
              className={`pb-1 transition-colors ${
                activeSection === 'services'
                  ? 'text-[#00843D] font-bold border-b-2 border-[#00843D]'
                  : 'hover:text-[#00843D]'
              }`}
            >
              Services
            </a>
            <a
              href="#benefits"
              className={`pb-1 transition-colors ${
                activeSection === 'benefits'
                  ? 'text-[#00843D] font-bold border-b-2 border-[#00843D]'
                  : 'hover:text-[#00843D]'
              }`}
            >
              Benefits
            </a>
            <a
              href="#contact"
              className={`pb-1 transition-colors ${
                activeSection === 'contact'
                  ? 'text-[#00843D] font-bold border-b-2 border-[#00843D]'
                  : 'hover:text-[#00843D]'
              }`}
            >
              Contact
            </a>
          </nav>

          {/* Action CTAs: Sign Up & Sign In Pills */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              to="/register"
              className="py-2.5 px-4 text-xs font-bold text-slate-700 hover:text-[#00843D] hover:bg-slate-50 border border-slate-200/90 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#00843D]" />
              <span>Sign Up</span>
            </Link>
            <Link
              to="/login"
              className="py-2.5 px-5 bg-[#006837] hover:bg-[#00502a] text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2 group cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 animate-fadeIn">
            <nav className="flex flex-col gap-2.5 text-sm font-semibold text-slate-700">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-[#00843D]"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#00843D]"
              >
                About
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#00843D]"
              >
                Services
              </a>
              <a
                href="#benefits"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#00843D]"
              >
                Benefits
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-[#00843D]"
              >
                Contact
              </a>
            </nav>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full py-2.5 text-center bg-[#006837] text-white font-bold text-xs rounded-full"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full py-2 text-center text-slate-700 font-bold text-xs hover:bg-slate-50 border border-slate-200 rounded-full"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION (Split Visual: Green S-Curve Wave + Gym Photo)
      ───────────────────────────────────────────────────────────── */}
      <section id="home" className="relative overflow-hidden bg-white">
        <div className="relative min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex items-center">
          {/* Photographic Gym Background (Water Bottle, Shoes, Mat, Treadmills) */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&auto=format&fit=crop&q=80"
              alt="Fitness Equipment & Workout Gear"
              className="w-full h-full object-cover object-right"
              loading="eager"
            />
            {/* Elegant Gradient Overlay Mask blending into the background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#005a2e] via-[#006e39]/95 via-48% to-transparent" />
          </div>

          {/* Hero Content Container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6 text-white max-w-xl">
              {/* Main Headline */}
              <h2 className="text-3xl sm:text-5xl lg:text-5.5xl font-black tracking-tight leading-[1.12]">
                Staff Wellness &amp; <br />
                <span className="text-[#64D848]">Fitness Center</span>
              </h2>

              {/* Tagline with underline */}
              <div className="space-y-1.5">
                <p className="text-base sm:text-xl font-bold text-white tracking-tight">
                  Healthy Employees. A Productive Ministry.
                </p>
                <div className="h-0.5 w-48 bg-white/80 rounded-full" />
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed max-w-lg">
                Join our wellness program and take a step towards a healthier, more active and
                fulfilling life.
              </p>

              {/* Action Buttons: Green Sign In + Outlined Register Button (Exact Match) */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 py-3 px-7 bg-[#48BA30] hover:bg-[#3ea528] text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer group"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 py-3 px-7 bg-transparent hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-full border border-white transition-all cursor-pointer group"
                >
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ABOUT OUR FITNESS CENTER (Gym Photo + 4 Feature Points)
      ───────────────────────────────────────────────────────────── */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left: Gym Photo with STAY FIT STAY HEALTHY Overlay Badge */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-100 group">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop&q=80"
                alt="Ministry of Agriculture Gym Facility Interior"
                className="w-full h-72 sm:h-84 object-cover transition-transform duration-500 group-hover:scale-102"
                loading="lazy"
              />
              {/* Graphic Text Badge Overlay on Photo */}
              <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-xl shadow-xs border border-white/70">
                <div className="text-[11px] font-black text-[#00843D] tracking-wider uppercase leading-none">
                  STAY FIT
                </div>
                <div className="text-[11px] font-black text-slate-800 tracking-wider uppercase leading-tight mt-0.5">
                  STAY HEALTHY
                </div>
              </div>

              {/* Bottom-left Pill Badge (Matching Reference Screenshot) */}
              <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-emerald-200">
                <span className="text-[11px] font-black text-[#00843D] uppercase tracking-wider">
                  STAY FIT STAY HEALTHY
                </span>
              </div>
            </div>
          </div>

          {/* Right: Content with 4 Feature Grid */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
                About Our Fitness Center
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                The Ministry of Agriculture Staff Wellness
              </p>
            </div>

            {/* 4 Feature Points (2x2 Grid with Green Line Icons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 pt-2">
              {/* Item 1: Morning Shift */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#00843D] flex items-center justify-center shrink-0 border border-emerald-100">
                  <Clock className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Morning Shift:</div>
                  <div className="text-xs text-slate-500 font-medium">06:00 – 08:30 AM</div>
                </div>
              </div>

              {/* Item 2: Evening Shift */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#00843D] flex items-center justify-center shrink-0 border border-emerald-100">
                  <Clock className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Evening Shift:</div>
                  <div className="text-xs text-slate-500 font-medium">05:00 – 08:30 PM</div>
                </div>
              </div>

              {/* Item 3: Lockers */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#00843D] flex items-center justify-center shrink-0 border border-emerald-100">
                  <Lock className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">30 Secure Changing</div>
                  <div className="text-xs text-slate-500 font-medium">Lockers</div>
                </div>
              </div>

              {/* Item 4: QR Gate */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#00843D] flex items-center justify-center shrink-0 border border-emerald-100">
                  <QrCode className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Contactless QR</div>
                  <div className="text-xs text-slate-500 font-medium">Gate Terminal</div>
                </div>
              </div>
            </div>

            {/* Green Accent Line */}
            <div className="h-1 w-10 bg-[#00843D] rounded-full pt-0.5" />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. OUR SERVICES (4 Clean Rounded Cards with Green Line Icons)
      ───────────────────────────────────────────────────────────── */}
      <section id="services" className="py-14 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-md mx-auto mb-10 space-y-2">
          <div className="h-1 w-12 bg-[#00843D] rounded-full mx-auto" />
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
            Our Services
          </h3>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Gym Facilities */}
          <div className="bg-white hover:bg-slate-50/50 rounded-2xl p-6 text-center border border-slate-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#00843D] mb-4 group-hover:scale-110 transition-transform shadow-2xs border border-emerald-100/60">
              <Dumbbell className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h4 className="font-extrabold text-[#0B2545] text-sm mb-1.5">
              Gym Facilities
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Modern equipment for your fitness goals
            </p>
          </div>

          {/* Card 2: Fitness Programs */}
          <div className="bg-white hover:bg-slate-50/50 rounded-2xl p-6 text-center border border-slate-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#00843D] mb-4 group-hover:scale-110 transition-transform shadow-2xs border border-emerald-100/60">
              <Activity className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h4 className="font-extrabold text-[#0B2545] text-sm mb-1.5">
              Fitness Programs
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Structured workout and fitness plans
            </p>
          </div>

          {/* Card 3: Wellness Services */}
          <div className="bg-white hover:bg-slate-50/50 rounded-2xl p-6 text-center border border-slate-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#00843D] mb-4 group-hover:scale-110 transition-transform shadow-2xs border border-emerald-100/60">
              <HeartPulse className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h4 className="font-extrabold text-[#0B2545] text-sm mb-1.5">
              Wellness Services
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Health tips and wellness support
            </p>
          </div>

          {/* Card 4: Activities */}
          <div className="bg-white hover:bg-slate-50/50 rounded-2xl p-6 text-center border border-slate-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-[#00843D] mb-4 group-hover:scale-110 transition-transform shadow-2xs border border-emerald-100/60">
              <Users className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h4 className="font-extrabold text-[#0B2545] text-sm mb-1.5">
              Activities
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Group sessions and fitness events
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. BENEFITS SECTION (Horizontal Ribbon with 4 Icons)
      ───────────────────────────────────────────────────────────── */}
      <section id="benefits" className="py-8 sm:py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-[#EDF7EE] rounded-2xl p-6 sm:p-8 border border-emerald-100/70 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Benefits Headline */}
            <div className="lg:col-span-5 space-y-2">
              <div className="h-1 w-10 bg-[#00843D] rounded-full" />
              <h3 className="text-2xl font-extrabold text-[#0B2545] tracking-tight">
                Benefits
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A healthier you leads to greater productivity, better well-being, and a stronger
                community.
              </p>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block lg:col-span-1 border-l border-emerald-200/80 h-16 mx-auto" />

            {/* Right: 4 Benefit Icons */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {/* 1. Better Health */}
              <div className="space-y-2 group cursor-default">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100/70 text-[#00843D] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#0B2545] leading-tight">
                  Better<br />Health
                </div>
              </div>

              {/* 2. Reduced Stress */}
              <div className="space-y-2 group cursor-default">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100/70 text-[#00843D] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                  <Smile className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#0B2545] leading-tight">
                  Reduced<br />Stress
                </div>
              </div>

              {/* 3. Increased Productivity */}
              <div className="space-y-2 group cursor-default">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100/70 text-[#00843D] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#0B2545] leading-tight">
                  Increased<br />Productivity
                </div>
              </div>

              {/* 4. Stronger Team */}
              <div className="space-y-2 group cursor-default">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100/70 text-[#00843D] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#0B2545] leading-tight">
                  Stronger<br />Team
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CALL-TO-ACTION BANNER (Green Ribbon with White Button)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-8 sm:py-10 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-[#005a2e] via-[#006e39] to-[#005a2e] rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Center Text */}
          <div className="text-center md:text-left">
            <h4 className="text-base sm:text-lg font-bold leading-tight">
              Ready to take charge of your health?
            </h4>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Sign in to access our wellness services and programs.
            </p>
          </div>

          {/* Right Action Button */}
          <div className="shrink-0">
            <Link
              to="/login"
              className="py-2.5 px-6 bg-white hover:bg-emerald-50 text-[#005a2e] font-extrabold text-xs rounded-full shadow-sm hover:shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. INSTITUTIONAL FOOTER (Exact Match: Navy + Contacts + Motto)
      ───────────────────────────────────────────────────────────── */}
      <footer id="contact" className="bg-[#0B1E2D] text-slate-300 text-xs py-10 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Row: Brand, Location, Email, Social */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <MoaLogo className="h-10 w-10 brightness-0 invert" size={40} />
              <div>
                <p className="font-black text-white uppercase tracking-wider text-xs leading-tight">
                  Ministry of Agriculture
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Staff Wellness &amp; Fitness Center
                </p>
              </div>
            </div>

            {/* Contact Items */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300 text-[11px]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#5cd65c] shrink-0" />
                <span>Ministry of Agriculture, Addis Ababa, Ethiopia</span>
              </div>
              <span className="hidden sm:inline text-slate-700">|</span>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#5cd65c] shrink-0" />
                <a href="mailto:wellness@agri.gov.et" className="hover:text-white transition">
                  wellness@agri.gov.et
                </a>
              </div>
            </div>

            {/* Social Icons: Facebook, Instagram, LinkedIn */}
            <div className="flex items-center gap-3 text-slate-400">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-[#00843D] hover:text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-[#00843D] hover:text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-[#00843D] hover:text-white flex items-center justify-center transition cursor-pointer"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Bottom Centered Motto */}
          <div className="text-center text-[11px] text-slate-400 font-medium tracking-wide">
            Healthy People. A Prosperous Ministry.
          </div>
        </div>
      </footer>
    </div>
  );
};
