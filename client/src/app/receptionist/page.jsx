'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  CheckCheck,
  LogOut,
  Users,
} from 'lucide-react';

export default function ReceptionistDashboard() {
  const { user, logoutUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'doctors' | 'windows' | 'appointments'
  
  const [doctorsList, setDoctorsList] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // New Doctor form modal state
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('');
  const [docFee, setDocFee] = useState('500');

  // New Window form modal state
  const [showAddWindowModal, setShowAddWindowModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [windowDate, setWindowDate] = useState('2026-08-20');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');

  const handleConfirmAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status: 'CONFIRMED' } : a))
    );
  };

  const handleRejectAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status: 'REJECTED' } : a))
    );
  };

  const handleCompleteAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status: 'COMPLETED' } : a))
    );
  };

  const handleAddDoctorSubmit = (e) => {
    e.preventDefault();
    const newDoc = {
      _id: 'doc_' + Date.now(),
      name: docName,
      specialization: docSpecialization,
      qualification: 'MBBS, MD',
      experience: '5 Years Experience',
      clinicName: 'ABC Healthcare Clinic',
      consultationFee: Number(docFee),
      rating: 4.9,
      reviewCount: 1,
      image: '/images/doctor_rahul_sharma.png',
      availabilityStatus: 'Available Today',
    };
    setDoctorsList([newDoc, ...doctorsList]);
    setShowAddDoctorModal(false);
    setDocName('');
    setDocSpecialization('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-150 p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0D5C46] flex items-center justify-center text-white font-bold">
              🏥
            </div>
            <div>
              <span className="text-lg font-extrabold text-[#0D5C46] block">MediArca</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Receptionist</span>
            </div>
          </Link>

          <nav className="space-y-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === 'overview' ? 'bg-emerald-50 text-[#0D5C46]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === 'doctors' ? 'bg-emerald-50 text-[#0D5C46]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Doctors</span>
            </button>

            <button
              onClick={() => setActiveTab('windows')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === 'windows' ? 'bg-emerald-50 text-[#0D5C46]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Appointment Windows</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeTab === 'appointments' ? 'bg-emerald-50 text-[#0D5C46]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments</span>
            </button>
          </nav>
        </div>

        <button
          onClick={logoutUser}
          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl text-xs font-bold transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Clinic Dashboard</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              ABC Healthcare Clinic • ID: <span className="text-[#0D5C46] font-bold">MED-CLN-8F42K9</span>
            </p>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 block">Today's Appointments</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">4</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 block">Pending Confirmations</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">1</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 block">Confirmed</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">2</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 block">Active Doctors</span>
            <span className="text-2xl font-extrabold text-[#0D5C46] mt-1 block">{doctorsList.length}</span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & APPOINTMENTS TABLE */}
        {(activeTab === 'overview' || activeTab === 'appointments') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Clinic Appointments</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="pb-3 px-3">Patient</th>
                    <th className="pb-3 px-3">Doctor</th>
                    <th className="pb-3 px-3">Date & Window</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 block">{apt.patientDetails.name}</span>
                        <span className="text-[10px] text-slate-400">{apt.patientType}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{apt.doctor.name}</td>
                      <td className="py-3 px-3">
                        <span className="block font-medium text-slate-700">{apt.date}</span>
                        <span className="text-[10px] text-slate-400">{apt.timeWindow}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            apt.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : apt.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : apt.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {apt.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleConfirmAppointment(apt._id)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleRejectAppointment(apt._id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCompleteAppointment(apt._id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DOCTORS MANAGEMENT */}
        {activeTab === 'doctors' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Clinic Doctors</h3>
              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="px-4 py-2 bg-[#0D5C46] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctorsList.map((doc) => (
                <div key={doc._id} className="p-4 rounded-2xl border border-slate-150 flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <Image src={doc.image || '/images/doctor_rahul_sharma.png'} alt={doc.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{doc.name}</h4>
                    <p className="text-xs font-semibold text-[#0D5C46]">{doc.specialization}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Fee: ₹{doc.consultationFee}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: ADD DOCTOR */}
        {showAddDoctorModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4">
              <h3 className="text-base font-bold text-slate-800">Add Doctor to Clinic</h3>
              <form onSubmit={handleAddDoctorSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="Dr. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    value={docSpecialization}
                    onChange={(e) => setDocSpecialization(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    placeholder="Cardiologist"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={docFee}
                    onChange={(e) => setDocFee(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDoctorModal(false)}
                    className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-[#0D5C46] text-white rounded-xl font-bold">
                    Save Doctor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
