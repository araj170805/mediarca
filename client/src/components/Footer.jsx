'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Mail, Phone, Clock, Facebook, Instagram, Twitter, Linkedin, ArrowRight } from 'lucide-react';

const FOOTER_LINKS = {
  'For Patients': [
    { label: 'Find Doctors', href: '/doctors' },
    { label: 'Specialization Search', href: '/doctors' },
    { label: 'My Appointments', href: '/dashboard' },
    { label: 'Book Appointment', href: '/doctors' },
  ],
  'For Clinics': [
    { label: 'Receptionist Dashboard', href: '/receptionist' },
    { label: 'Admin Management', href: '/admin' },
    { label: 'Clinic Onboarding', href: '/#onboarding' },
    { label: 'Manage Doctors', href: '/admin' },
  ],
  'Company': [
    { label: 'About MediArca', href: '#' },
    { label: 'Our Services', href: '/#services' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Privacy Policy', href: '#' },
  ],
};

const SOCIALS = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image src="/images/mediarca.png" alt="MediArca" fill className="object-contain" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight">MediArca</span>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Healthcare Platform</p>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
              Find trusted doctors near you and book appointments easily. MediArca connects patients with verified healthcare professionals.
            </p>

            {/* Contact Info */}
            <div className="space-y-2.5 mb-6">
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-7 h-7 rounded-lg bg-[#0D5C46]/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#4ade80]" />
                </div>
                <span>+91 1800-123-4567</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-7 h-7 rounded-lg bg-[#0D5C46]/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#4ade80]" />
                </div>
                <span>support@mediarca.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-7 h-7 rounded-lg bg-[#0D5C46]/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#4ade80]" />
                </div>
                <span>24/7 — Instant Support Available</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-[#0D5C46] border border-slate-700 hover:border-[#0D5C46] flex items-center justify-center transition-all duration-200 group"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-bold mb-5 text-sm tracking-wide">{heading}</h4>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-slate-400 hover:text-[#4ade80] transition-colors flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#0D5C46] -ml-1 group-hover:ml-0 transition-all" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} MediArca Healthcare Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <span className="text-slate-700">•</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span className="text-slate-700">•</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
