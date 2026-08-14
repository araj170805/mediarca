'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Bell, ChevronDown, Menu, X, LogOut, ShieldCheck, Building2, Phone, Mail, Clock, User } from 'lucide-react';

export default function Navbar() {
  const { user, logoutUser, selectedLocation, setSelectedLocation, openAuthModal } = useAuth();
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const locationsList = [
    'Rourkela, Odisha',
    'Bhubaneswar, Odisha',
    'Delhi, India',
    'Mumbai, Maharashtra',
    'Bengaluru, Karnataka',
  ];

  const isAdmin = user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionist';
  const isPatient = user && !isAdmin && !isReceptionist;
  const dashboardHref = isAdmin ? '/admin' : isReceptionist ? '/receptionist' : '/dashboard';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = () => {
      setIsLocationDropdownOpen(false);
      setIsProfileMenuOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="top-bar hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6 text-[#a7f3d0] text-xs">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              Helpline: +91 1800-123-4567
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              support@mediarca.com
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#a7f3d0] text-xs">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Available 24/7 — Instant Booking
            </span>
            <Link href="/doctors" className="px-3 py-0.5 bg-amber-400 text-slate-900 rounded-full text-xs font-bold hover:bg-amber-300 transition">
              Book Now →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border-b border-slate-200/60' : 'bg-white border-b border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[72px] items-center">

            {/* Left: Logo + Location */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
                <div className="relative w-11 h-11 flex-shrink-0">
                  <Image
                    src="/images/mediarca.png"
                    alt="MediArca"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="hidden sm:block">
                  <span className="text-[1.45rem] font-extrabold text-[#0D5C46] tracking-tight leading-none">MediArca</span>
                  <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Healthcare Platform</p>
                </div>
              </Link>

              {/* Location Dropdown — patients/guests only */}
              {(!user || isPatient) && (
                <div className="relative hidden md:block" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-[#0D5C46] text-slate-700 hover:text-[#0D5C46] px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#0D5C46]" />
                    <span className="max-w-[140px] truncate">{selectedLocation}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isLocationDropdownOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in-down">
                      <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">Select Location</div>
                      {locationsList.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => { setSelectedLocation(loc); setIsLocationDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2.5 ${loc === selectedLocation ? 'bg-emerald-50 text-[#0D5C46] font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {loc}
                          {loc === selectedLocation && <span className="ml-auto text-[10px] bg-[#0D5C46] text-white px-1.5 py-0.5 rounded-full font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Middle Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-all">
                  <ShieldCheck className="w-4 h-4" />
                  Admin Portal
                  <span className="nav-badge">ADMIN</span>
                </Link>
              )}
              {isReceptionist && (
                <Link href="/receptionist" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#0D5C46] transition-all">
                  <Building2 className="w-4 h-4" />
                  Clinic Dashboard
                </Link>
              )}
              {(!user || isPatient) && (
                <>
                  <Link href="/doctors" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#0D5C46] transition-all">
                    Find Doctors
                  </Link>
                  <Link href="/doctors" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#0D5C46] transition-all">
                    Clinics
                  </Link>
                  <Link href="/#how-it-works" className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#0D5C46] transition-all">
                    How It Works
                  </Link>
                </>
              )}
            </div>

            {/* Right: Auth / Profile */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2.5">
                  {isPatient && (
                    <Link href="/dashboard" className="relative p-2.5 text-slate-500 hover:text-[#0D5C46] hover:bg-emerald-50 rounded-xl transition-all" title="Notifications">
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-white" />
                    </Link>
                  )}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D5C46] to-[#1a7a5e] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-bold text-slate-800 leading-none">{user.name?.split(' ')[0] || 'User'}</p>
                        <p className="text-[10px] text-slate-400 capitalize font-medium mt-0.5">{user.role}</p>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden md:block transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in-down">
                        <div className="px-4 py-3 border-b border-slate-100 mb-1">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D5C46] to-[#1a7a5e] text-white flex items-center justify-center font-bold text-sm">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{user.name}</p>
                              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                            </div>
                          </div>
                        </div>
                        <Link
                          href={dashboardHref}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0D5C46] transition-all"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          {isAdmin ? '🛡️ Admin Portal' : isReceptionist ? '🏥 Clinic Dashboard' : '📋 My Dashboard'}
                        </Link>
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={() => { logoutUser(); setIsProfileMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="hidden sm:block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-[#0D5C46] hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="btn-primary text-sm px-5 py-2.5"
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all ml-1"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg animate-fade-in-down">
            <div className="px-4 py-4 space-y-1">
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-amber-600 font-semibold hover:bg-amber-50 transition-all" onClick={() => setMobileMenuOpen(false)}>
                  <ShieldCheck className="w-4 h-4" />🛡️ Admin Portal
                </Link>
              )}
              {isReceptionist && (
                <Link href="/receptionist" className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all" onClick={() => setMobileMenuOpen(false)}>
                  <Building2 className="w-4 h-4" />🏥 Clinic Dashboard
                </Link>
              )}
              {(!user || isPatient) && (
                <>
                  <Link href="/doctors" className="block px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:text-[#0D5C46] transition-all" onClick={() => setMobileMenuOpen(false)}>Find Doctors</Link>
                  <Link href="/doctors" className="block px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:text-[#0D5C46] transition-all" onClick={() => setMobileMenuOpen(false)}>Clinics</Link>
                  <Link href="/#how-it-works" className="block px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:text-[#0D5C46] transition-all" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
                  {user && <Link href="/dashboard" className="block px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all" onClick={() => setMobileMenuOpen(false)}>My Dashboard</Link>}
                </>
              )}
              {!user && (
                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }} className="flex-1 py-2.5 text-sm font-semibold border border-[#0D5C46] text-[#0D5C46] rounded-xl hover:bg-emerald-50 transition-all">Login</button>
                  <button onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }} className="flex-1 py-2.5 text-sm font-bold bg-[#0D5C46] text-white rounded-xl hover:bg-[#083E2F] transition-all">Sign Up</button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
