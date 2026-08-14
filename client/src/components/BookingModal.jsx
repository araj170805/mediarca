'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { X, User, Users, CheckCircle, Clock, Calendar, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function BookingModal() {
  const router = useRouter();
  const {
    user,
    isBookingModalOpen,
    closeBookingModal,
    selectedDoctorForBooking,
    selectedWindowForBooking,
  } = useAuth();

  const [step, setStep] = useState(1);
  const [patientType, setPatientType] = useState('self'); // 'self' | 'family'
  
  // Patient details state
  const [fullName, setFullName] = useState(user?.name || '');
  const [age, setAge] = useState('24');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [reason, setReason] = useState('Regular Checkup');
  
  // Windows state
  const [windowsList, setWindowsList] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [loadingWindows, setLoadingWindows] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    if (user) {
      if (patientType === 'self') {
        setFullName(user.name || '');
      }
    }
  }, [user, patientType]);

  useEffect(() => {
    if (isBookingModalOpen && selectedDoctorForBooking) {
      if (selectedWindowForBooking) {
        setSelectedWindow(selectedWindowForBooking);
      }
      fetchWindows();
    }
  }, [isBookingModalOpen, selectedDoctorForBooking]);

  const fetchWindows = async () => {
    if (!selectedDoctorForBooking?._id) return;
    setLoadingWindows(true);
    try {
      const res = await api.getDoctorWindows(selectedDoctorForBooking._id);
      if (res?.success && Array.isArray(res.data)) {
        setWindowsList(res.data);
        if (res.data.length > 0 && !selectedWindowForBooking) {
          setSelectedWindow(res.data[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load doctor windows:', err.message);
    } finally {
      setLoadingWindows(false);
    }
  };

  if (!isBookingModalOpen || !selectedDoctorForBooking) return null;

  const doctor = selectedDoctorForBooking;
  const clinicId = doctor.clinicId?._id || doctor.clinicId;

  const handleConfirmBooking = async () => {
    if (!selectedWindow?._id) {
      setBookingError('Please select a valid open appointment window.');
      return;
    }

    setSubmitting(true);
    setBookingError('');
    try {
      const res = await api.bookAppointment({
        clinicId,
        appointmentWindowId: selectedWindow._id,
        patientType,
        patientDetails: {
          name: fullName || user?.name || 'Patient',
          age: Number(age) || 24,
          bloodGroup,
          reason,
        },
      });

      if (res?.success) {
        setStep(5); // Move to success step
      } else {
        setBookingError(res?.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-xs font-bold text-[#0D5C46] uppercase tracking-wider">
              Book Appointment
            </span>
            <h3 className="text-base font-bold text-slate-800">
              {doctor.name} • <span className="text-slate-500 font-normal">{doctor.specialization}</span>
            </h3>
          </div>
          <button
            onClick={closeBookingModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-step progress indicator */}
        <div className="px-6 py-3 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#0D5C46] font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-[#0D5C46] text-white flex items-center justify-center text-[10px]">1</span>
            <span>Persons</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#0D5C46] font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full ${step >= 2 ? 'bg-[#0D5C46] text-white' : 'bg-slate-200 text-slate-600'} flex items-center justify-center text-[10px]`}>2</span>
            <span>Details</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#0D5C46] font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full ${step >= 3 ? 'bg-[#0D5C46] text-white' : 'bg-slate-200 text-slate-600'} flex items-center justify-center text-[10px]`}>3</span>
            <span>Window</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-[#0D5C46] font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full ${step >= 4 ? 'bg-[#0D5C46] text-white' : 'bg-slate-200 text-slate-600'} flex items-center justify-center text-[10px]`}>4</span>
            <span>Review</span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {bookingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          {/* STEP 1: Who is this appointment for? */}
          {step === 1 && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-slate-800 text-center">
                Who is this appointment for?
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setPatientType('self');
                    setFullName(user?.name || '');
                  }}
                  className={`p-6 rounded-2xl border-2 text-center transition flex flex-col items-center gap-3 ${
                    patientType === 'self'
                      ? 'border-[#0D5C46] bg-emerald-50/50 shadow-md'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${patientType === 'self' ? 'bg-[#0D5C46] text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Myself</h5>
                    <p className="text-xs text-slate-500 mt-1">Book this appointment for yourself.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPatientType('family');
                    setFullName('');
                  }}
                  className={`p-6 rounded-2xl border-2 text-center transition flex flex-col items-center gap-3 ${
                    patientType === 'family'
                      ? 'border-[#0D5C46] bg-emerald-50/50 shadow-md'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${patientType === 'family' ? 'bg-[#0D5C46] text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Someone Else</h5>
                    <p className="text-xs text-slate-500 mt-1">Book for a family member or another person.</p>
                  </div>
                </button>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Patient Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-800">Patient Details</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                    placeholder="Age"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                    placeholder="e.g. Regular Checkup"
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => {
                    if (!fullName.trim()) {
                      setBookingError('Patient full name is required');
                      return;
                    }
                    setBookingError('');
                    setStep(3);
                  }}
                  className="px-6 py-2.5 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Appointment Window */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-800">Select Appointment Window</h4>
                <p className="text-xs text-slate-500">Choose from open clinic appointment windows</p>
              </div>

              {loadingWindows ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0D5C46]" />
                </div>
              ) : windowsList.length > 0 ? (
                <div className="space-y-3">
                  {windowsList.map((win) => (
                    <button
                      key={win._id}
                      type="button"
                      onClick={() => setSelectedWindow(win)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                        selectedWindow?._id === win._id
                          ? 'border-[#0D5C46] bg-emerald-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[#0D5C46]" />
                        <div>
                          <span className="font-bold text-slate-800 text-sm">{win.startTime} - {win.endTime}</span>
                          <span className="text-[10px] text-slate-500 block">
                            Date: {win.date ? new Date(win.date).toLocaleDateString() : 'Today'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold bg-emerald-100 text-[#0D5C46] px-2.5 py-1 rounded-full uppercase">
                        {win.status}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                  No active appointment windows currently available for this doctor.
                </div>
              )}

              <div className="pt-6 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => {
                    if (!selectedWindow) {
                      setBookingError('Please select an appointment window');
                      return;
                    }
                    setBookingError('');
                    setStep(4);
                  }}
                  className="px-6 py-2.5 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review Appointment */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-800">Review Appointment</h4>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Doctor</span>
                    <span className="font-bold text-slate-800">{doctor.name}</span>
                    <span className="text-slate-500 block">{doctor.specialization}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Clinic</span>
                    <span className="font-bold text-slate-800">{doctor.clinicId?.name || doctor.clinicName || 'Clinic'}</span>
                  </div>
                </div>

                <hr className="border-slate-200" />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Date</span>
                    <span className="font-bold text-slate-800">
                      {selectedWindow?.date ? new Date(selectedWindow.date).toLocaleDateString() : 'Scheduled'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Appointment Window</span>
                    <span className="font-bold text-[#0D5C46]">
                      {selectedWindow ? `${selectedWindow.startTime} - ${selectedWindow.endTime}` : 'Time Slot'}
                    </span>
                  </div>
                </div>

                <hr className="border-slate-200" />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Patient</span>
                    <span className="font-bold text-slate-800">{fullName || user?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Consultation Fee</span>
                    <span className="font-extrabold text-slate-900 text-sm">₹{doctor.consultationFee}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition"
                >
                  Back
                </button>
                <button
                  disabled={submitting}
                  onClick={handleConfirmBooking}
                  className="px-6 py-2.5 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Success Confirmation */}
          {step === 5 && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0D5C46] flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h4 className="text-xl font-extrabold text-slate-900">
                Appointment request sent!
              </h4>

              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Your appointment request has been sent to the clinic receptionist. You will receive a notification once it is confirmed.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                <span>Status:</span>
                <span>PENDING</span>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    closeBookingModal();
                    router.push('/dashboard');
                  }}
                  className="px-6 py-2.5 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-sm font-bold rounded-xl shadow-md transition"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
