'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, Star, CheckCircle, Stethoscope, CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DoctorCard({ doctor }) {
  const { startBooking } = useAuth();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#0D5C46]/30 transition-all duration-300 overflow-hidden group card-hover">
      <div className="flex flex-col md:flex-row">
        
        {/* Doctor Image */}
        <div className="relative w-full md:w-44 h-44 md:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
          <Image
            src={doctor.image || '/images/doctor_rahul_sharma.png'}
            alt={doctor.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Availability badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {doctor.availabilityStatus || 'Available'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          
          {/* Info Block */}
          <div className="flex-1 min-w-0">
            {/* Name row */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-extrabold text-slate-900 truncate">{doctor.name}</h3>
              <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100 flex-shrink-0" />
            </div>

            {/* Specialization */}
            <div className="flex items-center gap-1.5 mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-[#0D5C46]" />
              <p className="text-sm font-bold text-[#0D5C46]">{doctor.specialization}</p>
            </div>

            {/* Experience + Qualification */}
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
              <span className="font-semibold">{doctor.experience}</span>
              <span className="text-slate-300">•</span>
              <span>{doctor.qualification}</span>
            </p>

            {/* Clinic & Location */}
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="font-semibold text-slate-700 truncate">{doctor.clinicName}</span>
              <span className="text-slate-300">·</span>
              <span className="truncate">{doctor.locationText || 'Rourkela, Odisha'}</span>
            </p>

            {/* Rating */}
            {doctor.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-extrabold text-slate-800">{doctor.rating}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">({doctor.reviewCount || 90} Reviews)</span>
              </div>
            )}
          </div>

          {/* Right: Fee + Actions */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:gap-3 md:min-w-[160px]">
            
            {/* Time slot */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays className="w-3.5 h-3.5 text-[#0D5C46]" />
              <span>
                {doctor.availableWindows?.[0]?.timeRange || '10:00 AM – 1:00 PM'}
              </span>
            </div>

            {/* Consultation Fee */}
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-medium">Consultation Fee</p>
              <p className="text-2xl font-extrabold text-slate-900">₹{doctor.consultationFee}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => startBooking(doctor)}
                className="btn-primary py-2.5 text-xs w-full justify-center"
              >
                Book Appointment
              </button>
              <Link
                href={`/doctors/${doctor._id}`}
                className="py-2.5 text-xs font-bold text-slate-600 hover:text-[#0D5C46] bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-[#0D5C46]/30 rounded-xl text-center transition-all"
              >
                View Profile
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
