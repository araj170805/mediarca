'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, CheckCircle, Stethoscope, CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const formatWindowTime = (win) => {
  if (!win) return null;
  const dateLabel = win.date ? new Date(win.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
  const time = `${win.startTime || ''} – ${win.endTime || ''}`;
  return dateLabel ? `${dateLabel}, ${time}` : time;
};

export default function DoctorCard({ doctor }) {
  const { startBooking } = useAuth();
  const clinic = doctor.clinicId && typeof doctor.clinicId === 'object' ? doctor.clinicId : null;
  const clinicName = clinic?.name;
  const city = clinic?.address?.city;
  const nextWindow = doctor.activeWindows?.[0];
  const isAvailable = Array.isArray(doctor.activeWindows) && doctor.activeWindows.length > 0;
  const initials = (doctor.name || '?')
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#0D5C46]/30 transition-all duration-300 overflow-hidden group card-hover">
      <div className="flex flex-col md:flex-row">

        {/* Doctor Avatar */}
        <div className="relative w-full md:w-44 h-44 md:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
          {doctor.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctor.image}
              alt={doctor.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-4xl font-extrabold text-[#0D5C46]/70 select-none">{initials}</span>
          )}
          {/* Availability badge */}
          <div className="absolute top-3 left-3">
            {isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Available Today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-400 text-white shadow-sm">
                No Slots
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">

          {/* Info Block */}
          <div className="flex-1 min-w-0">
            {/* Name row */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-extrabold text-slate-900 truncate">{doctor.name}</h3>
              {doctor.isActive !== false && (
                <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100 flex-shrink-0" />
              )}
            </div>

            {/* Specialization */}
            <div className="flex items-center gap-1.5 mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-[#0D5C46]" />
              <p className="text-sm font-bold text-[#0D5C46]">{doctor.specialization}</p>
            </div>

            {/* Clinic & Location */}
            {(clinicName || city) && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                {clinicName && <span className="font-semibold text-slate-700 truncate">{clinicName}</span>}
                {clinicName && city && <span className="text-slate-300">·</span>}
                {city && <span className="truncate">{city}</span>}
              </p>
            )}
          </div>

          {/* Right: Fee + Actions */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:gap-3 md:min-w-[160px]">

            {/* Time slot */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays className="w-3.5 h-3.5 text-[#0D5C46]" />
              <span>{isAvailable ? formatWindowTime(nextWindow) : 'No open slots'}</span>
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
                disabled={!isAvailable}
                className={`btn-primary py-2.5 text-xs w-full justify-center ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
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
