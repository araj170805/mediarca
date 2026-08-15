'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  LayoutDashboard,
  Calendar,
  UserCheck,
  Bell,
  User,
  Users,
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Save,
  Trash2,
  Loader2,
} from 'lucide-react';

export default function PatientDashboard() {
  const { user, logoutUser } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  const [appointmentsTab, setAppointmentsTab] = useState('upcoming');
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [familyForm, setFamilyForm] = useState({ name: '', relation: 'Spouse', age: '', gender: 'male', phone: '' });

  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob || '',
        gender: user.gender || '',
        bloodGroup: user.bloodGroup || '',
        address: user.address || '',
      });

      // Load family members from user object, or from localStorage (offline mode)
      const serverMembers = user.familyMembers || [];
      if (serverMembers.length > 0) {
        setFamilyMembers(serverMembers);
      } else {
        try {
          const uid = user._id || 'offline_user';
          const lsMembers = JSON.parse(localStorage.getItem(`mediarca_family_${uid}`) || '[]');
          if (lsMembers.length > 0) setFamilyMembers(lsMembers);
        } catch (e) {}
      }
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [apRes, notifRes] = await Promise.all([
        api.getPatientAppointments(),
        api.getNotifications(),
      ]);

      if (apRes?.success && apRes.data && Array.isArray(apRes.data.appointments)) {
        setAppointmentsList(apRes.data.appointments);
      }
      if (notifRes?.success && Array.isArray(notifRes.data)) {
        setNotifications(notifRes.data);
      }
    } catch (err) {
      console.warn('Failed to load dashboard data:', err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    setActionLoading(true);
    try {
      await api.cancelAppointment(id);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn('Failed to mark all read:', err.message);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.updatePatientProfile({
        name: profileData.name,
        phone: profileData.phone,
      });
      if (res?.success) {
        setProfileSavedMsg('Profile updated successfully!');
        setTimeout(() => setProfileSavedMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    if (!familyForm.name.trim()) return;
    setActionLoading(true);
    try {
      const newMember = {
        _id: `fam_${Date.now()}`,
        name: familyForm.name,
        relation: familyForm.relation,
        age: Number(familyForm.age) || 0,
        gender: familyForm.gender,
        phone: familyForm.phone,
      };

      const res = await api.addFamilyMember(newMember);
      if (res?.success) {
        const added = Array.isArray(res.data?.familyMembers)
          ? res.data.familyMembers
          : (res.data?._id ? res.data : newMember);

        setFamilyMembers((prev) => {
          if (Array.isArray(added)) return added;
          const exists = prev.some((m) => m._id === added._id);
          return exists ? prev : [...prev, added];
        });

        setShowAddFamilyModal(false);
        setFamilyForm({ name: '', relation: 'Spouse', age: '', gender: 'male', phone: '' });
      }
    } catch (err) {
      alert(err.message || 'Failed to add family member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFamilyMember = async (memberId) => {
    try {
      const res = await api.deleteFamilyMember(memberId);
      if (res?.success) {
        setFamilyMembers((prev) => {
          if (Array.isArray(res.data?.familyMembers)) return res.data.familyMembers;
          return prev.filter((m) => m._id !== memberId);
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to delete family member');
    }
  };

  const upcomingAppointments = appointmentsList.filter(
    (a) => a.status === 'confirmed' || a.status === 'pending' || a.status === 'CONFIRMED' || a.status === 'PENDING'
  );
  const pastAppointments = appointmentsList.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled' || a.status === 'rejected' || a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'REJECTED'
  );

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-150 p-6 flex flex-col justify-between flex-shrink-0 hidden md:flex">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0D5C46] flex items-center justify-center text-white font-bold text-base">
              💚
            </div>
            <span className="text-xl font-extrabold text-[#0D5C46]">MediArca</span>
          </Link>

          <nav className="space-y-1 text-xs font-bold">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === 'dashboard' ? 'bg-emerald-50 text-[#0D5C46]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveSection('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === 'appointments' ? 'bg-emerald-50 text-[#0D5C46]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments</span>
            </button>

            <Link href="/doctors" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition">
              <UserCheck className="w-4 h-4" />
              <span>Find Doctors</span>
            </Link>

            <button
              onClick={() => setActiveSection('notifications')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition ${
                activeSection === 'notifications' ? 'bg-emerald-50 text-[#0D5C46]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              {unreadNotifCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === 'profile' ? 'bg-emerald-50 text-[#0D5C46]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveSection('family')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                activeSection === 'family' ? 'bg-emerald-50 text-[#0D5C46]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Family Members</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-1">
          <button onClick={logoutUser} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 text-xs font-bold transition">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Good morning, {user?.name ? user.name.split(' ')[0] : 'Patient'} 👋
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Manage your appointments and healthcare profile.
            </p>
          </div>

          <Link href="/doctors" className="inline-flex items-center gap-2 px-5 py-3 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-xs font-bold rounded-2xl shadow-md transition">
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0D5C46]" />
          </div>
        ) : (
          <>
            {/* VIEW 1: DASHBOARD OVERVIEW */}
            {activeSection === 'dashboard' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-800">Upcoming Appointment</h3>
                    <button onClick={() => setActiveSection('appointments')} className="text-xs font-bold text-[#0D5C46] hover:underline">
                      View all
                    </button>
                  </div>

                  {upcomingAppointments.length > 0 ? (
                    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                          <Image
                            src={upcomingAppointments[0].appointmentWindowId?.doctorId?.image || '/images/doctor_rahul_sharma.png'}
                            alt="Doctor"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-base">
                            {upcomingAppointments[0].appointmentWindowId?.doctorId?.name || 'Doctor'}
                          </h4>
                          <p className="text-xs font-semibold text-[#0D5C46]">
                            {upcomingAppointments[0].appointmentWindowId?.doctorId?.specialization || 'Specialist'}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {upcomingAppointments[0].clinicId?.name || 'Clinic'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                        <div className="sm:text-right">
                          <span className="text-xs font-bold text-slate-800 block">
                            {upcomingAppointments[0].appointmentWindowId?.date ? new Date(upcomingAppointments[0].appointmentWindowId.date).toLocaleDateString() : 'Scheduled'}
                          </span>
                          <span className="text-xs text-slate-500 font-medium block">
                            {upcomingAppointments[0].appointmentWindowId?.startTime} - {upcomingAppointments[0].appointmentWindowId?.endTime}
                          </span>
                          <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-[#0D5C46]">
                            {upcomingAppointments[0].status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleCancelAppointment(upcomingAppointments[0]._id)}
                            className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200 disabled:opacity-50"
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
                    <Link href="/doctors" className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition text-center space-y-2 group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D5C46] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                        <Search className="w-5 h-5" />
                      </div>
                      <span className="block text-xs font-bold text-slate-800">Find a Doctor</span>
                    </Link>

                    <Link href="/doctors" className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition text-center space-y-2 group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D5C46] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="block text-xs font-bold text-slate-800">Book Appointment</span>
                    </Link>

                    <button onClick={() => setActiveSection('appointments')} className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition text-center space-y-2 group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D5C46] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span className="block text-xs font-bold text-slate-800">View History</span>
                    </button>

                    <button onClick={() => setActiveSection('profile')} className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition text-center space-y-2 group">
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
                      className={`px-4 py-1.5 rounded-lg transition ${appointmentsTab === 'upcoming' ? 'bg-white text-[#0D5C46] shadow-xs' : 'text-slate-500'}`}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => setAppointmentsTab('past')}
                      className={`px-4 py-1.5 rounded-lg transition ${appointmentsTab === 'past' ? 'bg-white text-[#0D5C46] shadow-xs' : 'text-slate-500'}`}
                    >
                      Past
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(appointmentsTab === 'upcoming' ? upcomingAppointments : pastAppointments).length > 0 ? (
                    (appointmentsTab === 'upcoming' ? upcomingAppointments : pastAppointments).map((apt) => (
                      <div key={apt._id} className="p-5 rounded-2xl border border-slate-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                            <Image src={apt.appointmentWindowId?.doctorId?.image || '/images/doctor_rahul_sharma.png'} alt="Doctor" fill className="object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{apt.appointmentWindowId?.doctorId?.name || 'Doctor'}</h4>
                            <p className="text-xs font-semibold text-[#0D5C46]">{apt.appointmentWindowId?.doctorId?.specialization || 'Specialization'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{apt.clinicId?.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                          <div className="text-left sm:text-right text-xs">
                            <span className="font-bold text-slate-800 block">
                              {apt.appointmentWindowId?.date ? new Date(apt.appointmentWindowId.date).toLocaleDateString() : 'Scheduled'}
                            </span>
                            <span className="text-slate-500 block">{apt.appointmentWindowId?.startTime} - {apt.appointmentWindowId?.endTime}</span>
                          </div>

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
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No {appointmentsTab} appointments found.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: NOTIFICATIONS */}
            {activeSection === 'notifications' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
                  <button onClick={handleMarkAllRead} className="text-xs font-bold text-[#0D5C46] hover:underline">
                    Mark all as read
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n._id} className={`p-4 rounded-2xl border flex items-start gap-4 transition ${n.isRead ? 'bg-white border-slate-100' : 'bg-emerald-50/30 border-emerald-100'}`}>
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0D5C46] flex items-center justify-center flex-shrink-0">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-800 text-xs sm:text-sm capitalize">{n.type?.replace('_', ' ') || 'Notification'}</h5>
                            <span className="text-[10px] font-semibold text-slate-400">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">No notifications.</div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 4: MY PROFILE & FAMILY MEMBERS */}
            {(activeSection === 'profile' || activeSection === 'family') && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
                <div className="flex gap-4 border-b border-slate-100 pb-3 text-xs font-bold">
                  <button
                    onClick={() => setActiveSection('profile')}
                    className={`pb-2 border-b-2 transition ${activeSection === 'profile' ? 'border-[#0D5C46] text-[#0D5C46]' : 'border-transparent text-slate-400'}`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveSection('family')}
                    className={`pb-2 border-b-2 transition ${activeSection === 'family' ? 'border-[#0D5C46] text-[#0D5C46]' : 'border-transparent text-slate-400'}`}
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
                          disabled
                          value={profileData.email}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed"
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
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-6 py-2.5 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{actionLoading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {activeSection === 'family' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800">Family Members List</h4>
                      <button onClick={() => setShowAddFamilyModal(true)} className="px-4 py-2 bg-[#0D5C46] text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Member</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {familyMembers.length > 0 ? (
                        familyMembers.map((fm) => (
                          <div key={fm._id} className="p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{fm.name}</h5>
                              <p className="text-xs text-slate-500">{fm.relation} • {fm.age} Years • {fm.gender}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-[#0D5C46]">{fm.phone}</span>
                              <button onClick={() => handleDeleteFamilyMember(fm._id)} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-500">No family members added yet.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Family Member Modal */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Family Member</h3>
            <form onSubmit={handleAddFamilyMember} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={familyForm.name}
                  onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Relation</label>
                  <select
                    value={familyForm.relation}
                    onChange={(e) => setFamilyForm({ ...familyForm, relation: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={familyForm.age}
                    onChange={(e) => setFamilyForm({ ...familyForm, age: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={familyForm.gender}
                    onChange={(e) => setFamilyForm({ ...familyForm, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={familyForm.phone}
                    onChange={(e) => setFamilyForm({ ...familyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowAddFamilyModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-[#0D5C46] text-white text-xs font-bold rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
