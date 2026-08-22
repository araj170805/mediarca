'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Building2,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  LogOut,
  Users,
  Loader2,
  CheckCheck,
} from 'lucide-react';

export default function ReceptionistDashboard() {
  const { user, logoutUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'doctors' | 'windows' | 'appointments'

  const [doctorsList, setDoctorsList] = useState([]);
  const [windowsList, setWindowsList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // New Doctor modal state
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('Cardiologist');
  const [docFee, setDocFee] = useState('500');

  // New Window modal state
  const [showAddWindowModal, setShowAddWindowModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [windowDate, setWindowDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');

  useEffect(() => {
    fetchReceptionistData();
  }, []);

  const fetchReceptionistData = async () => {
    setLoading(true);
    try {
      const [docsRes, windowsRes, aptsRes, statsRes] = await Promise.all([
        api.getReceptionistDoctors(),
        api.getClinicWindows(),
        api.getClinicAppointments(),
        api.getReceptionistStats(),
      ]);

      if (docsRes?.success && Array.isArray(docsRes.data)) {
        setDoctorsList(docsRes.data);
        if (docsRes.data.length > 0 && !selectedDocId) {
          setSelectedDocId(docsRes.data[0]._id);
        }
      }
      if (windowsRes?.success) {
        const wins = Array.isArray(windowsRes.data)
          ? windowsRes.data
          : Array.isArray(windowsRes.data?.windows)
          ? windowsRes.data.windows
          : [];
        setWindowsList(wins);
      }
      if (aptsRes?.success && aptsRes.data && Array.isArray(aptsRes.data.appointments)) {
        setAppointments(aptsRes.data.appointments);
      }
      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.warn('Failed to load receptionist data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (id) => {
    setActionLoading(true);
    try {
      await api.confirmAppointment(id);
      await fetchReceptionistData();
    } catch (err) {
      alert(err.message || 'Failed to confirm appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAppointment = async (id) => {
    setActionLoading(true);
    try {
      await api.rejectAppointment(id);
      await fetchReceptionistData();
    } catch (err) {
      alert(err.message || 'Failed to reject appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteAppointment = async (id) => {
    setActionLoading(true);
    try {
      await api.completeAppointment(id);
      await fetchReceptionistData();
    } catch (err) {
      alert(err.message || 'Failed to complete appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.addDoctor({
        name: docName,
        specialization: docSpecialization,
        consultationFee: Number(docFee) || 500,
      });

      if (res?.success) {
        if (res.data) {
          const newDoc = res.data;
          setDoctorsList((prev) => {
            const exists = prev.some((d) => d._id === newDoc._id);
            return exists ? prev : [...prev, newDoc];
          });
          if (!selectedDocId) setSelectedDocId(newDoc._id);
        }
        setShowAddDoctorModal(false);
        setDocName('');
        await fetchReceptionistData();
      }
    } catch (err) {
      alert(err.message || 'Failed to add doctor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddWindowSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDocId) {
      alert('Please select a doctor for this window');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.createAppointmentWindow({
        doctorId: selectedDocId,
        date: windowDate,
        startTime,
        endTime,
      });

      if (res?.success) {
        setShowAddWindowModal(false);
        await fetchReceptionistData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create appointment window');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDoctorStatus = async (doctorId, currentStatus) => {
    try {
      await api.toggleDoctorStatus(doctorId, !currentStatus);
      await fetchReceptionistData();
    } catch (err) {
      alert(err.message || 'Failed to toggle doctor status');
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Clinic Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Manage doctors, appointment windows, and confirm bookings for your clinic.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="px-4 py-2.5 bg-[#0D5C46] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Doctor</span>
            </button>
            <button
              onClick={() => setShowAddWindowModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Create Window</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D5C46]" />
          </div>
        ) : (
          <>
            {/* VIEW 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                    <h4 className="text-2xl font-extrabold text-slate-900">{stats?.totalDoctors || doctorsList.length}</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Total Doctors</p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                    <h4 className="text-2xl font-extrabold text-amber-600">
                      {stats?.pendingAppointments || appointments.filter((a) => a.status === 'pending' || a.status === 'PENDING').length}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Pending Requests</p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                    <h4 className="text-2xl font-extrabold text-emerald-600">
                      {stats?.confirmedAppointments || appointments.filter((a) => a.status === 'confirmed' || a.status === 'CONFIRMED').length}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Confirmed</p>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                    <h4 className="text-2xl font-extrabold text-blue-600">
                      {stats?.completedAppointments || appointments.filter((a) => a.status === 'completed' || a.status === 'COMPLETED').length}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Completed Visits</p>
                  </div>
                </div>

                {/* Pending Requests Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-800">Pending Appointment Requests</h3>
                  <div className="space-y-3">
                    {appointments.filter((a) => a.status === 'pending' || a.status === 'PENDING').length > 0 ? (
                      appointments
                        .filter((a) => a.status === 'pending' || a.status === 'PENDING')
                        .map((apt) => (
                          <div key={apt._id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">
                                Patient: {apt.patientDetails?.name || apt.patientId?.name}
                              </h4>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Doctor: <span className="font-bold text-[#0D5C46]">{apt.appointmentWindowId?.doctorId?.name || 'Doctor'}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Reason: {apt.patientDetails?.reason || 'Consultation'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                disabled={actionLoading}
                                onClick={() => handleConfirmAppointment(apt._id)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Confirm
                              </button>
                              <button
                                disabled={actionLoading}
                                onClick={() => handleRejectAppointment(apt._id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500">No pending appointment requests.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: DOCTORS */}
            {activeTab === 'doctors' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-800">Clinic Doctors</h3>
                  <button onClick={() => setShowAddDoctorModal(true)} className="px-4 py-2 bg-[#0D5C46] text-white text-xs font-bold rounded-xl flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Doctor
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctorsList.length > 0 ? (
                    doctorsList.map((doc) => (
                      <div key={doc._id} className="p-5 rounded-2xl border border-slate-150 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{doc.name}</h4>
                          <p className="text-xs font-semibold text-[#0D5C46]">{doc.specialization}</p>
                          <p className="text-xs text-slate-500 mt-1">Fee: ₹{doc.consultationFee}</p>
                        </div>
                        <button
                          onClick={() => handleToggleDoctorStatus(doc._id, doc.isActive)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            doc.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {doc.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-8 text-center text-xs text-slate-500">No doctors registered yet. Click &quot;Add Doctor&quot; to create one.</div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: APPOINTMENT WINDOWS */}
            {activeTab === 'windows' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-800">Appointment Windows</h3>
                  <button onClick={() => setShowAddWindowModal(true)} className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Create Window
                  </button>
                </div>

                <div className="space-y-3">
                  {windowsList.length > 0 ? (
                    windowsList.map((win) => (
                      <div key={win._id} className="p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">
                            Doctor: {win.doctorId?.name || 'Doctor'} ({win.doctorId?.specialization})
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Date: {win.date ? new Date(win.date).toLocaleDateString() : 'N/A'} • {win.startTime} - {win.endTime}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${win.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {win.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">No appointment windows created yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 4: APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4">All Appointments</h3>

                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments.map((apt) => (
                      <div key={apt._id} className="p-5 rounded-2xl border border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Patient: {apt.patientDetails?.name || apt.patientId?.name}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Doctor: <span className="font-bold text-[#0D5C46]">{apt.appointmentWindowId?.doctorId?.name || 'Doctor'}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Booked: {apt.bookedAt ? new Date(apt.bookedAt).toLocaleDateString() : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            apt.status === 'confirmed' || apt.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : apt.status === 'pending' || apt.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700'
                              : apt.status === 'completed' || apt.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {apt.status}
                          </span>

                          {(apt.status === 'pending' || apt.status === 'PENDING') && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleConfirmAppointment(apt._id)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg">Confirm</button>
                              <button onClick={() => handleRejectAppointment(apt._id)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg">Reject</button>
                            </div>
                          )}

                          {(apt.status === 'confirmed' || apt.status === 'CONFIRMED') && (
                            <button onClick={() => handleCompleteAppointment(apt._id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                              <CheckCheck className="w-3.5 h-3.5" /> Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">No appointments recorded.</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Doctor</h3>
            <form onSubmit={handleAddDoctorSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Dr. John Doe"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
                <select
                  value={docSpecialization}
                  onChange={(e) => setDocSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Dentist">Dentist</option>
                  <option value="General Physician">General Physician</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee (₹)</label>
                <input
                  type="number"
                  required
                  value={docFee}
                  onChange={(e) => setDocFee(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddDoctorModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-[#0D5C46] text-white text-xs font-bold rounded-xl">Add Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Appointment Window Modal */}
      {showAddWindowModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Appointment Window</h3>
            <form onSubmit={handleAddWindowSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor</label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  <option value="">Select Doctor</option>
                  {doctorsList.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={windowDate}
                  onChange={(e) => setWindowDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="01:00 PM"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddWindowModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-extrabold rounded-xl">Create Window</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
