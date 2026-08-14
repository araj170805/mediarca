'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin, Search, Calendar, UserCheck, Building2, Headphones,
  Play, CheckCircle2, Loader2, ArrowRight, Star, Shield, Clock,
  Phone, ChevronRight, Activity, Heart, Stethoscope, Eye, Bone, Brain
} from 'lucide-react';

const SPECIALIZATIONS = [
  { icon: Heart, label: 'Cardiology', color: 'bg-red-50 text-red-600', emoji: '❤️' },
  { icon: Brain, label: 'Neurology', color: 'bg-purple-50 text-purple-600', emoji: '🧠' },
  { icon: Bone, label: 'Orthopedics', color: 'bg-amber-50 text-amber-600', emoji: '🦴' },
  { icon: Eye, label: 'Ophthalmology', color: 'bg-blue-50 text-blue-600', emoji: '👁️' },
  { icon: Stethoscope, label: 'General Medicine', color: 'bg-emerald-50 text-emerald-600', emoji: '🩺' },
  { icon: Activity, label: 'Dermatology', color: 'bg-pink-50 text-pink-600', emoji: '✨' },
];

const STATS = [
  { value: '20K+', label: 'Happy Patients', emoji: '😊' },
  { value: '500+', label: 'Verified Doctors', emoji: '👨‍⚕️' },
  { value: '150+', label: 'Clinics Onboarded', emoji: '🏥' },
  { value: '4.9', label: 'Average Rating', emoji: '⭐' },
];

const WHY_FEATURES = [
  { title: 'Verified Doctors', desc: 'Every doctor is thoroughly verified with credentials and experience checks.', icon: Shield },
  { title: 'Instant Booking', desc: 'Book appointments in under 60 seconds — anytime, anywhere.', icon: Clock },
  { title: 'Easy Follow-up', desc: 'Stay connected with your doctor for follow-up consultations.', icon: Phone },
  { title: 'No Hidden Fees', desc: 'Transparent consultation fees with zero booking charges.', icon: CheckCircle2 },
];

export default function LandingPage() {
  const { selectedLocation, setSelectedLocation, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const popularSearches = ['Cardiologist', 'Dermatologist', 'Dentist', 'Pediatrician', 'Orthopedic'];

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, { headers: { 'Accept-Language': 'en' } });
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || 'Nearby';
          const state = data.address?.state || '';
          const loc = state ? `${city}, ${state}` : city;
          setSelectedLocation(loc);
          setCityInput(loc);
        } catch {
          setSelectedLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
          setCityInput('GPS Location');
        } finally {
          setDetectingLocation(false);
        }
      },
      () => { setDetectingLocation(false); alert('Could not detect location. Please enter manually.'); },
      { timeout: 10000 }
    );
  };

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════ */}
      <section className="relative min-h-[600px] overflow-hidden">
        {/* Diagonal gradient background */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[-40px] w-[300px] h-[300px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        {/* Diagonal white cut at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#F8FAFC]" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* LEFT CONTENT */}
            <div className="lg:col-span-6 space-y-7 animate-slide-left">
              <div className="flex items-center gap-3">
                <span className="feature-chip">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Trusted by 20,000+ patients
                </span>
                <span className="feature-chip">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  4.9 Rating
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.1] text-white text-balance">
                Find the <span className="text-amber-400 relative">
                  Right Doctor
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 10" preserveAspectRatio="none" style={{ height: '6px' }}>
                    <path d="M0 8 Q75 0 150 6 Q225 12 300 4" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
                  </svg>
                </span>
                <br />Book with <span className="text-amber-400">Confidence</span>
              </h1>

              <p className="text-emerald-100 text-lg max-w-lg leading-relaxed font-normal">
                Connect with verified doctors near you, book appointments instantly, and experience hassle-free healthcare with MediArca.
              </p>

              {/* SEARCH BOX */}
              <div className="bg-white rounded-2xl p-3 shadow-2xl border border-white/20">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <button
                    onClick={handleUseMyLocation}
                    disabled={detectingLocation}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-[#0D5C46] rounded-xl text-sm font-bold transition-all flex-shrink-0 disabled:opacity-60"
                  >
                    {detectingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    <span className="hidden sm:inline">{detectingLocation ? 'Detecting...' : 'My Location'}</span>
                    <span className="sm:hidden">{detectingLocation ? 'Detecting...' : 'Use Location'}</span>
                  </button>

                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Doctor or specialization..."
                      className="w-full pl-9 pr-3 py-3 text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 bg-transparent"
                    />
                  </div>

                  <div className="flex-1 relative border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-3">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 sm:left-6 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="City or location"
                      className="w-full pl-9 pr-3 py-3 text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 bg-transparent"
                    />
                  </div>

                  <Link
                    href={`/doctors?search=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(cityInput)}`}
                    className="btn-accent px-6 py-3 rounded-xl text-sm whitespace-nowrap flex-shrink-0"
                  >
                    <Search className="w-4 h-4" />
                    Find Doctors
                  </Link>
                </div>
              </div>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-emerald-200 text-xs font-semibold">Popular:</span>
                {popularSearches.map((tag) => (
                  <Link
                    key={tag}
                    href={`/doctors?specialization=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-all font-medium backdrop-blur-sm border border-white/10 hover:border-white/30"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT CONTENT — Doctor Image */}
            <div className="lg:col-span-6 relative flex justify-center items-center animate-slide-right">
              <div className="relative">
                {/* Main image */}
                <div className="relative w-[300px] sm:w-[360px] h-[440px] rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
                  <Image src="/images/doctor_priya_verma.png" alt="MediArca Doctor" fill className="object-cover" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D5C46]/40 to-transparent" />
                </div>

                {/* Floating badge — bottom left */}
                <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100 flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0D5C46] flex items-center justify-center text-lg">👨‍⚕️</div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">20K+</p>
                    <p className="text-[11px] text-slate-500 font-medium">Happy Patients</p>
                  </div>
                </div>

                {/* Floating badge — top right */}
                <div className="absolute -top-4 -right-4 bg-amber-400 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2 animate-float delay-300">
                  <Star className="w-4 h-4 text-amber-900 fill-amber-900" />
                  <div>
                    <p className="text-sm font-extrabold text-amber-900">4.9 / 5</p>
                    <p className="text-[10px] text-amber-800 font-medium">Avg Rating</p>
                  </div>
                </div>

                {/* Floating badge — right middle */}
                <div className="absolute top-1/2 -right-8 bg-white rounded-2xl px-3 py-2.5 shadow-xl border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-medium">Available Today</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-xs font-bold text-slate-800">500+ Doctors</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS BANNER
      ═══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 px-6 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y-2 lg:divide-y-0 lg:divide-x divide-slate-100">
            {STATS.map((stat, i) => (
              <div key={i} className="flex items-center gap-4 py-4 lg:py-0 px-0 lg:px-6 first:pl-0 last:pr-0 col-span-1">
                <span className="text-3xl">{stat.emoji}</span>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SERVICES SECTION
      ═══════════════════════════════════════════════ */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="section-label">Our Services</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Best Healthcare Service For You</h2>
          <p className="text-slate-500 text-base mt-3 max-w-xl mx-auto">Comprehensive healthcare services designed for patients, clinics, and healthcare providers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: UserCheck, title: 'Find a Doctor', desc: 'Search and connect with trusted, verified specialists near you.', color: 'bg-emerald-50 text-[#0D5C46]', featured: false },
            { icon: Calendar, title: 'Book Appointment', desc: 'Choose your preferred slot and confirm instantly — no waiting.', color: 'bg-white text-white', featured: true },
            { icon: Building2, title: 'Clinic Info', desc: 'View clinic details, address, directions and consultation hours.', color: 'bg-blue-50 text-blue-600', featured: false },
            { icon: Headphones, title: '24/7 Support', desc: 'Our team is always here to help — any time of day or night.', color: 'bg-amber-50 text-amber-600', featured: false },
          ].map((svc, i) => (
            <div
              key={i}
              className={`relative rounded-3xl p-7 border transition-all duration-300 cursor-pointer group card-hover-lift ${svc.featured ? 'gradient-primary border-transparent text-white shadow-lg' : 'bg-white border-slate-100 shadow-sm'}`}
            >
              {svc.featured && (
                <span className="absolute top-4 right-4 text-xs font-bold bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full">Popular</span>
              )}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${svc.featured ? 'bg-white/20' : svc.color}`}>
                <svc.icon className={`w-7 h-7 ${svc.featured ? 'text-white' : ''}`} />
              </div>
              <h3 className={`font-bold text-lg mb-2 ${svc.featured ? 'text-white' : 'text-slate-800'}`}>{svc.title}</h3>
              <p className={`text-sm leading-relaxed ${svc.featured ? 'text-emerald-100' : 'text-slate-500'}`}>{svc.desc}</p>
              <div className={`flex items-center gap-2 mt-5 text-xs font-bold ${svc.featured ? 'text-amber-300' : 'text-[#0D5C46]'}`}>
                Learn More <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SPECIALIZATIONS SECTION
      ═══════════════════════════════════════════════ */}
      <section className="bg-white py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            <div>
              <span className="section-label">Specializations</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">Find by Medical Speciality</h2>
            </div>
            <Link href="/doctors" className="btn-primary self-start md:self-auto">
              View All Doctors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SPECIALIZATIONS.map((spec, i) => (
              <Link
                key={i}
                href={`/doctors?specialization=${encodeURIComponent(spec.label)}`}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 hover:border-[#0D5C46] hover:shadow-md transition-all duration-200 group cursor-pointer text-center bg-white"
              >
                <div className={`w-14 h-14 rounded-2xl ${spec.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200`}>
                  {spec.emoji}
                </div>
                <p className="text-sm font-semibold text-slate-700 group-hover:text-[#0D5C46] transition-colors">{spec.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          WHY CHOOSE SECTION
      ═══════════════════════════════════════════════ */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Left: Image side */}
            <div className="relative min-h-[400px] bg-gradient-to-br from-[#0D5C46] to-[#064e3b] flex items-center justify-center p-10 overflow-hidden">
              <div className="absolute inset-0 bg-dot-pattern opacity-10" />
              <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-sm">
                {/* Doctor image */}
                <div className="col-span-2 relative w-full h-56 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
                  <Image src="/images/doctor_rahul_sharma.png" alt="Doctor" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D5C46]/50 to-transparent" />
                </div>
                {/* Stat boxes */}
                {[
                  { val: '9K+', label: 'Satisfied Patients' },
                  { val: '136+', label: 'Professional Docs' },
                  { val: '10K+', label: 'Questions Solved' },
                  { val: '60+', label: 'National Awards' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
                    <p className="text-xl font-extrabold text-white">{s.val}</p>
                    <p className="text-xs text-emerald-200 font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Text side */}
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <span className="section-label">Why Choose MediArca</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 leading-tight text-balance">
                We&apos;re Passionate, Dedicated <span className="text-gradient-primary">And Friendly</span>
              </h2>
              <p className="text-slate-500 text-base mt-4 leading-relaxed">
                MediArca connects you with the right doctors and clinics — making healthcare simple, fast and accessible for everyone in your family.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {WHY_FEATURES.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D5C46] flex items-center justify-center flex-shrink-0">
                      <feat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{feat.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Link href="/doctors" className="btn-accent">
                  View All Services <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="btn-secondary">
                  <Play className="w-4 h-4" />
                  Watch Video
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA BOTTOM BANNER
      ═══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="gradient-primary rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-4 h-0.5 bg-amber-300 rounded" />
              Start Today
              <span className="w-4 h-0.5 bg-amber-300 rounded" />
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 text-balance">
              Ready to Take Control of<br />Your Healthcare Journey?
            </h2>
            <p className="text-emerald-100 text-base max-w-xl mx-auto mb-8">
              Join thousands of patients who trust MediArca for finding the right doctor and booking appointments effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/doctors" className="btn-accent px-8 py-3.5">
                Find a Doctor Now <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold text-sm transition-all backdrop-blur-sm inline-flex items-center gap-2 justify-center"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
