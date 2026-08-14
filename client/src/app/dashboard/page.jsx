'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Bell,
  User,
  Users,
  Settings,
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  CheckCheck,
  Save,
} from 'lucide-react';

export default function PatientDashboard() {
  const { user, logoutUser, startBooking } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'appointments' | 'notifications' | 'profile' | 'family'
  
  // Appointments state
  const [appointmentsTab, setAppointmentsTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [appointmentsList, setAppointmentsList] = useState([]);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: '',
    gender: '',
    bloodGroup: '',
    address: '',
  });

  const [familyMembers, setFamilyMembers] = useState(user?.familyMembers || []);
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  const handleCancelAppointment = (id) => {
    setAppointmentsList((prev) =>
      prev.map((item) => (item._id === id ? { ...item, status: 'CANCELLED' } : item))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileSavedMsg('Profile updated successfully!');
    setTimeout(() => setProfileSavedMsg(''), 3000);
  };

  const upcomingAppointments = appointmentsList.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const pastAppointments = appointmentsList.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-150 p-6 flex flex-col justify-between flex-shrink-0 hidden md:flex">
        <div className="space-y-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0D5C46] flex items-center justify-center text-white font-bold text-base">
              💚
            </div>
            <span className="text-xl font-extrabold text-[#0D5C46]">MediArca</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-bold">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === 'dashboard'
                  ? 'bg-emerald-50 text-[#0D5C46]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveSection('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === 'appointments'
                  ? 'bg-emerald-50 text-[#0D5C46]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments</span>
            </button>

            <Link
              href="/doctors"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Find Doctors</span>
            </Link>

            <button
              onClick={() => setActiveSection('notifications')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition ${
                activeSection === 'notifications'
                  ? 'bg-emerald-50 text-[#0D5C46]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                3
              </span>
            </button>

            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === 'profile'
                  ? 'bg-emerald-50 text-[#0D5C46]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveSection('family')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === 'family'
                  ? 'bg-emerald-50 text-[#0D5C46]'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Family Members</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-100 space-y-1">
          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 text-xs font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        
        {/* TOP GREETING BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Good morning, {user?.name ? user.name.split(' ')[0] : 'Ashish'} 👋
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Manage your appointments and find your next doctor.
            </p>
          </div>

          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-xs font-bold rounded-2xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>

        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeSection === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Upcoming Appointment Highlight Card */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-800">Upcoming Appointment</h3>
                <button
                  onClick={() => setActiveSection('appointments')}
                  className="text-xs font-bold text-[#0D5C46] hover:underline"
                >
                  View all
                </button>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      <Image
                        src={upcomingAppointments[0].doctor.image || '/images/doctor_rahul_sharma.png'}
                        alt={upcomingAppointments[0].doctor.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">
                        {upcomingAppointments[0].doctor.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#0D5C46]">
                        {upcomingAppointments[0].doctor.specialization}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {upcomingAppointments[0].clinic.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                    <div className="sm:text-right">
                      <span className="text-xs font-bold text-slate-800 block">
                        {upcomingAppointments[0].date}
                      </span>
                      <span className="text-xs text-slate-500 font-medium block">
                        {upcomingAppointments[0].timeWindow}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-emerald-100 text-[#0D5C46]">
                        {upcomingAppointments[0].status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/doctors/${upcomingAppointments[0].doctor._id}`}
                        className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleCancelAppointment(upcomingAppointments[0]._id)}
                        className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-xs text-slate-500">
                  No upcoming appointments. Click "Book New Appointment" to find a doctor.
                </div>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-4">Quick Actions</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link
                  href="/doctors"
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D5C46] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="block text-xs font-bold text-slate-800">Find a Doctor</span>
                </Link>

                <Link
                  href="/doctors"
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D5C46] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="block text-xs font-bold text-slate-800">Book Appointment</span>
                </Link>

                <button
                  onClick={() => setActiveSection('appointments')}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D5C46] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="block text-xs font-bold text-slate-800">View History</span>
                </button>

                <button
                  onClick={() => setActiveSection('profile')}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition text-center space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D5C46] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="block text-xs font-bold text-slate-800">Edit Profile</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: MY APPOINTMENTS */}
        {activeSection === 'appointments' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">My Appointments</h3>

              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setAppointmentsTab('upcoming')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    appointmentsTab === 'upcoming'
                      ? 'bg-white text-[#0D5C46] shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setAppointmentsTab('past')}
                  className={`px-4 py-1.5 rounded-lg transition ${
                    appointmentsTab === 'past'
                      ? 'bg-white text-[#0D5C46] shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Past
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {(appointmentsTab === 'upcoming' ? upcomingAppointments : pastAppointments).map(
                (apt) => (
                  <div
                    key={apt._id}
                    className="p-5 rounded-2xl border border-slate-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        <Image
                          src={apt.doctor.image || '/images/doctor_rahul_sharma.png'}
                          alt={apt.doctor.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{apt.doctor.name}</h4>
                        <p className="text-xs font-semibold text-[#0D5C46]">{apt.doctor.specialization}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{apt.clinic.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right text-xs">
                        <span className="font-bold text-slate-800 block">{apt.date}</span>
                        <span className="text-slate-500 block">{apt.timeWindow}</span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
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
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: NOTIFICATIONS */}
        {activeSection === 'notifications' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-[#0D5C46] hover:underline"
              >
                Mark all as read
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 rounded-2xl border flex items-start gap-4 transition ${
                    n.isRead ? 'bg-white border-slate-100' : 'bg-emerald-50/30 border-emerald-100'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      n.iconType === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : n.iconType === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {n.iconType === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : n.iconType === 'error' ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{n.title}</h5>
                      <span className="text-[10px] font-semibold text-slate-400">{n.timeAgo}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: MY PROFILE & FAMILY MEMBERS */}
        {(activeSection === 'profile' || activeSection === 'family') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
            <div className="flex gap-4 border-b border-slate-100 pb-3 text-xs font-bold">
              <button
                onClick={() => setActiveSection('profile')}
                className={`pb-2 border-b-2 transition ${
                  activeSection === 'profile'
                    ? 'border-[#0D5C46] text-[#0D5C46]'
                    : 'border-transparent text-slate-400'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveSection('family')}
                className={`pb-2 border-b-2 transition ${
                  activeSection === 'family'
                    ? 'border-[#0D5C46] text-[#0D5C46]'
                    : 'border-transparent text-slate-400'
                }`}
              >
                Family Members
              </button>
            </div>

            {profileSavedMsg && (
              <div className="p-3 bg-emerald-100 text-[#0D5C46] rounded-xl text-xs font-bold">
                {profileSavedMsg}
              </div>
            )}

            {activeSection === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center font-bold text-2xl">
                    <User className="w-8 h-8" />
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#0D5C46] text-white text-xs font-bold rounded-xl"
                  >
                    Update Photo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="text"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

            {activeSection === 'family' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">Family Members List</h4>
                  <button className="px-4 py-2 bg-[#0D5C46] text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {familyMembers.map((fm) => (
                    <div key={fm._id} className="p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{fm.name}</h5>
                        <p className="text-xs text-slate-500">{fm.relation} • {fm.age} Years • {fm.gender}</p>
                      </div>
                      <span className="text-xs font-bold text-[#0D5C46]">{fm.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}
