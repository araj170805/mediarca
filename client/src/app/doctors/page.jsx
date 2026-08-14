'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DoctorCard from '@/components/DoctorCard';
import { MOCK_DOCTORS } from '@/lib/mockData';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

export default function DoctorSearchPage() {
  const { selectedLocation } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [specialization, setSpecialization] = useState('All');
  const [gender, setGender] = useState('All');
  const [availableToday, setAvailableToday] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('search');
      const c = params.get('city');
      const spec = params.get('specialization');
      if (s) setSearchQuery(s);
      if (c) setCityInput(c);
      if (spec) setSpecialization(spec);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [specialization, availableToday, selectedLocation]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.searchDoctors({
        search: searchQuery,
        specialization: specialization === 'All' ? '' : specialization,
      });
      if (res.success && res.data && Array.isArray(res.data.doctors)) {
        setDoctors(res.data.doctors);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSpecialization('All');
    setGender('All');
    setAvailableToday(false);
    fetchDoctors();
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase()) && !doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (specialization !== 'All' && doc.specialization !== specialization) {
      return false;
    }
    if (availableToday && doc.availabilityStatus !== 'Available Today') {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Doctors near you
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Showing doctors in <span className="text-[#0D5C46] font-bold">{selectedLocation}</span>
        </p>
      </div>

      {/* Top Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search doctor or specialization..."
          className="flex-1 text-sm font-medium focus:outline-none"
        />
        <button
          onClick={fetchDoctors}
          className="px-5 py-2.5 bg-[#0D5C46] hover:bg-[#083E2F] text-white text-xs font-bold rounded-xl transition"
        >
          Search
        </button>
      </div>

      {/* Main Grid: Filters Sidebar + Doctor List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#0D5C46]" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>

          {/* Specialization Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46] font-medium"
            >
              <option value="All">All Specializations</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Orthopedic">Orthopedic</option>
              <option value="Pediatrician">Pediatrician</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46] font-medium"
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Availability Checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={availableToday}
                onChange={(e) => setAvailableToday(e.target.checked)}
                className="w-4 h-4 text-[#0D5C46] rounded focus:ring-[#0D5C46]"
              />
              <span className="text-xs font-semibold text-slate-700">Available Today</span>
            </label>
          </div>

          <button
            onClick={handleResetFilters}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Reset
          </button>
        </div>

        {/* Right Doctor Cards List */}
        <div className="lg:col-span-9 space-y-4">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
              <p className="text-base font-bold text-slate-700">No doctor found at this location</p>
              <p className="text-xs text-slate-400">Only doctors registered on MediArca will appear here. No doctors registered for this search yet.</p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-[#0D5C46] text-white text-xs font-bold rounded-xl"
              >
                Reset Search
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-6">
            <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#0D5C46] text-white font-bold text-xs">1</button>
            <button className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">2</button>
            <button className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">3</button>
            <span className="text-xs text-slate-400 px-1">...</span>
            <button className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">10</button>
            <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
