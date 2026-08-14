'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MOCK_DOCTORS } from '@/lib/mockData';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, Calendar, Award, Globe, Heart } from 'lucide-react';
import { api } from '@/lib/api';

export default function DoctorProfilePage() {
  const params = useParams();
  const doctorId = params?.id || 'doc1';
  const { startBooking } = useAuth();

  const [doctor, setDoctor] = useState(MOCK_DOCTORS[0]);
  const [activeTab, setActiveTab] = useState('about'); // 'about' | 'clinic' | 'windows' | 'reviews'
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const res = await api.getDoctorProfile(doctorId);
      if (res.success && res.data && res.data.doctor) {
        setDoctor(res.data.doctor);
      } else {
        const found = MOCK_DOCTORS.find((d) => d._id === doctorId) || MOCK_DOCTORS[0];
        setDoctor(found);
      }
    } catch (err) {
      const found = MOCK_DOCTORS.find((d) => d._id === doctorId) || MOCK_DOCTORS[0];
      setDoctor(found);
    }
  };

  const datesList = [
    { label: 'Today', dateText: '20 Aug', fullDate: '20 August 2026' },
    { label: 'Tomorrow', dateText: '21 Aug', fullDate: '21 August 2026' },
    { label: 'Fri', dateText: '22 Aug', fullDate: '22 August 2026' },
    { label: 'Sat', dateText: '23 Aug', fullDate: '23 August 2026' },
    { label: 'Sun', dateText: '24 Aug', fullDate: '24 August 2026' },
  ];

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
              {doctor.qualification} • {doctor.experience}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-800">{doctor.rating || 4.8}</span>
            <span className="text-xs text-slate-400">({doctor.reviewCount || 128} Reviews)</span>
          </div>

          {/* Clinic & Location */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0D5C46]" />
              <span>{doctor.clinicName}</span>
            </p>
            <p className="text-slate-500 pl-5">{doctor.locationText || 'Rourkela, Odisha'}</p>
          </div>

          {/* Fee & Booking Button */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Consultation Fee</span>
              <span className="text-2xl font-extrabold text-slate-900">₹{doctor.consultationFee}</span>
            </div>

            <button
              onClick={() => startBooking(doctor)}
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
              activeTab === tab
                ? 'bg-[#0D5C46] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
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
                  {doctor.bio}
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
                  <span className="font-bold text-slate-800">{doctor.experience}</span>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <CheckCircle className="w-4 h-4 text-[#0D5C46] mb-1" />
                  <span className="text-slate-400 block font-semibold">Qualification</span>
                  <span className="font-bold text-slate-800">{doctor.qualification}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clinic' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800">Clinic Information</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <p className="font-bold text-slate-800 text-sm">{doctor.clinicName}</p>
                <p className="text-slate-600">Location: {doctor.locationText}</p>
                <p className="text-slate-600">Timing: 10:00 AM - 8:00 PM (Monday to Saturday)</p>
                <p className="text-[#0D5C46] font-semibold">Unique Clinic ID: MED-CLN-8F42K9</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800">Patient Reviews</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Suman K.</span>
                  <span className="text-xs text-amber-500 font-bold">★ 5.0</span>
                </div>
                <p className="text-xs text-slate-600">Great experience! Dr. Sharma listened carefully and explained the treatment clearly.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Available Appointment Windows Grid */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Available Appointment Windows</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select a date and time slot to book</p>
          </div>

          {/* Date Selector Pills */}
          <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            {datesList.map((d, idx) => (
              <button
                key={d.dateText}
                onClick={() => setSelectedDateIndex(idx)}
                className={`py-2 text-center rounded-xl transition ${
                  selectedDateIndex === idx
                    ? 'bg-white text-[#0D5C46] font-bold shadow-xs'
                    : 'text-slate-500 font-medium'
                }`}
              >
                <span className="block text-[10px] uppercase">{d.label}</span>
                <span className="block text-xs font-extrabold">{d.dateText}</span>
              </button>
            ))}
          </div>

          {/* Available Slots List */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-[#0D5C46] transition">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#0D5C46]" />
                <div>
                  <span className="block font-bold text-slate-800 text-xs">10:00 AM - 1:00 PM</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Available</span>
                </div>
              </div>
              <button
                onClick={() =>
                  startBooking(doctor, {
                    id: 'w1',
                    dateText: datesList[selectedDateIndex].fullDate,
                    timeRange: '10:00 AM - 1:00 PM',
                  })
                }
                className="px-4 py-2 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-xs font-bold rounded-xl transition"
              >
                Book
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-[#0D5C46] transition">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#0D5C46]" />
                <div>
                  <span className="block font-bold text-slate-800 text-xs">6:00 PM - 8:00 PM</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Available</span>
                </div>
              </div>
              <button
                onClick={() =>
                  startBooking(doctor, {
                    id: 'w2',
                    dateText: datesList[selectedDateIndex].fullDate,
                    timeRange: '6:00 PM - 8:00 PM',
                  })
                }
                className="px-4 py-2 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-xs font-bold rounded-xl transition"
              >
                Book
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
