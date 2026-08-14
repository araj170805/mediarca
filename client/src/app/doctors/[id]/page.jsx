'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Award,
  Globe,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function DoctorProfilePage() {
  const params = useParams();
  const doctorId = params?.id;
  const { startBooking } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [activeWindows, setActiveWindows] = useState([]);
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'clinic' | 'windows' | 'reviews'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  const fetchDoctor = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, windowsRes] = await Promise.all([
        api.getDoctorProfile(doctorId),
        api.getDoctorWindows(doctorId),
      ]);

      if (profileRes?.success && profileRes.data) {
        setDoctor(profileRes.data.doctor || profileRes.data);
      } else {
        setError('Doctor not found');
      }

      if (windowsRes?.success && Array.isArray(windowsRes.data)) {
        setActiveWindows(windowsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D5C46]" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Doctor Profile Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested doctor could not be found.'}</p>
        <Link href="/doctors" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D5C46] text-white text-xs font-bold rounded-xl">
          <ArrowLeft className="w-4 h-4" /> Back to Doctor Listing
        </Link>
      </div>
    );
  }

  const clinicInfo = doctor.clinicId || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <Link
        href="/doctors"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0D5C46] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctors</span>
      </Link>

      {/* Main Header Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Doctor Photo */}
        <div className="md:col-span-4 relative flex justify-center">
          <div className="relative w-48 h-56 sm:w-56 sm:h-64 rounded-3xl overflow-hidden border-2 border-slate-100 shadow-md">
            <Image
              src={doctor.image || '/images/doctor_rahul_sharma.png'}
              alt={doctor.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right Doctor Summary Info */}
        <div className="md:col-span-8 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{doctor.name}</h1>
              <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            </div>
            <p className="text-base font-bold text-[#0D5C46] mt-1">{doctor.specialization}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {doctor.qualification || 'MBBS, MD'} • {doctor.experience || '5+ Years Experience'}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-800">{doctor.rating || 4.9}</span>
            <span className="text-xs text-slate-400">({doctor.reviewCount || 45} Reviews)</span>
          </div>

          {/* Clinic & Location */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0D5C46]" />
              <span>{clinicInfo.name || doctor.clinicName || 'Clinic'}</span>
            </p>
            <p className="text-slate-500 pl-5">
              {clinicInfo.address?.city ? `${clinicInfo.address.city}, ${clinicInfo.address.state || ''}` : doctor.locationText || 'Location details'}
            </p>
          </div>

          {/* Fee & Booking Button */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Consultation Fee</span>
              <span className="text-2xl font-extrabold text-slate-900">₹{doctor.consultationFee}</span>
            </div>

            <button
              onClick={() => startBooking(doctor, activeWindows[0] || null)}
              className="px-8 py-3.5 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-sm font-bold rounded-2xl shadow-lg transition"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-xs flex gap-2 text-xs font-bold">
        {['about', 'clinic', 'windows', 'reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl transition capitalize ${
              activeTab === tab ? 'bg-[#0D5C46] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab === 'windows' ? 'Available Windows' : tab === 'clinic' ? 'Clinic Info' : tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Content */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-2">About Doctor</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {doctor.bio || `${doctor.name} is a dedicated ${doctor.specialization} committed to delivering high-quality healthcare and compassionate patient treatment.`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <Globe className="w-4 h-4 text-[#0D5C46] mb-1" />
                  <span className="text-slate-400 block font-semibold">Languages</span>
                  <span className="font-bold text-slate-800">{doctor.languages?.join(', ') || 'English, Hindi'}</span>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <Award className="w-4 h-4 text-[#0D5C46] mb-1" />
                  <span className="text-slate-400 block font-semibold">Experience</span>
                  <span className="font-bold text-slate-800">{doctor.experience || '5+ Years'}</span>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <CheckCircle className="w-4 h-4 text-[#0D5C46] mb-1" />
                  <span className="text-slate-400 block font-semibold">Qualification</span>
                  <span className="font-bold text-slate-800">{doctor.qualification || 'MBBS, MD'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clinic' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800">Clinic Information</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <p className="font-bold text-slate-800 text-sm">{clinicInfo.name || 'Associated Clinic'}</p>
                <p className="text-slate-600">
                  City: {clinicInfo.address?.city || 'Rourkela'}
                </p>
                <p className="text-[#0D5C46] font-semibold">Unique Clinic ID: {clinicInfo.uniqueClinicId || 'N/A'}</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800">Patient Reviews</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Verified Patient</span>
                  <span className="text-xs text-amber-500 font-bold">★ 5.0</span>
                </div>
                <p className="text-xs text-slate-600">Attentive doctor who listens carefully and explains diagnosis thoroughly.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Available Appointment Windows */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Available Appointment Windows</h3>
            <p className="text-xs text-slate-500 mt-0.5">Continuous appointment windows managed by clinic receptionist</p>
          </div>

          <div className="space-y-3">
            {activeWindows.length > 0 ? (
              activeWindows.map((win) => (
                <div key={win._id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-[#0D5C46] transition">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#0D5C46]" />
                    <div>
                      <span className="block font-bold text-slate-800 text-xs">
                        {win.startTime} - {win.endTime}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {win.date ? new Date(win.date).toLocaleDateString() : 'Available'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => startBooking(doctor, win)}
                    className="px-4 py-2 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-xs font-bold rounded-xl transition"
                  >
                    Book
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No active appointment windows currently open for this doctor.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
