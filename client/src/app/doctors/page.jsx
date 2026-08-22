'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DoctorCard from '@/components/DoctorCard';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const PAGE_SIZE = 10;

export default function DoctorSearchPage() {
  const { selectedLocation } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [specialization, setSpecialization] = useState('All');
  const [availableToday, setAvailableToday] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('search');
      const c = params.get('city');
      const spec = params.get('specialization');
      if (s) setSearchQuery(s);
      if (c) setCityInput(c);
      if (spec && spec !== 'All') setSpecialization(spec);
    }
  }, []);

  const fetchDoctors = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.searchDoctors({
        search: searchQuery || undefined,
        specialization: specialization === 'All' ? undefined : specialization,
        city: cityInput || undefined,
        page: pageNum,
        limit: PAGE_SIZE,
      });
      let list = res?.data?.doctors;
      // Backward compatibility if backend returns a bare array
      if (!list && Array.isArray(res?.data)) list = res.data;
      setDoctors(Array.isArray(list) ? list : []);

      const pg = res?.data?.pagination;
      setTotalPages(pg?.totalPages && pg.totalPages > 0 ? pg.totalPages : 1);
      setTotalResults(typeof pg?.total === 'number' ? pg.total : (Array.isArray(list) ? list.length : 0));
      setPage(pageNum);
    } catch (err) {
      setDoctors([]);
      setTotalPages(1);
      setTotalResults(0);
      setError(err.message || 'Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialization]);

  // "Available Today" is derived from real open appointment windows returned by the API
  const visibleDoctors = availableToday
    ? doctors.filter((doc) => Array.isArray(doc.activeWindows) && doc.activeWindows.length > 0)
    : doctors;

  const handleResetFilters = () => {
    setSearchQuery('');
    setCityInput('');
    setSpecialization('All');
    setAvailableToday(false);
    fetchDoctors(1);
  };

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    fetchDoctors(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPageButtons = () => {
    const pages = [];
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages.map((p) => (
      <button
        key={p}
        onClick={() => goToPage(p)}
        className={`w-8 h-8 rounded-lg font-bold text-xs ${
          p === page ? 'bg-[#0D5C46] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
        }`}
      >
        {p}
      </button>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Doctors near you
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Showing doctors in <span className="text-[#0D5C46] font-bold">{cityInput || selectedLocation}</span>
          {!loading && totalResults > 0 && (
            <span> · {totalResults} doctor{totalResults !== 1 ? 's' : ''} found</span>
          )}
        </p>
      </div>

      {/* Top Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchDoctors(1)}
          placeholder="Search doctor or specialization..."
          className="flex-1 text-sm font-medium focus:outline-none"
        />
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchDoctors(1)}
          placeholder="City..."
          className="w-32 text-sm font-medium border-l border-slate-100 pl-3 focus:outline-none"
        />
        <button
          onClick={() => fetchDoctors(1)}
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
              <option value="Dentist">Dentist</option>
              <option value="General Physician">General Physician</option>
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-bold">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#0D5C46]" />
            </div>
          ) : visibleDoctors.length > 0 ? (
            visibleDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))
          ) : !error ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
              <p className="text-base font-bold text-slate-700">No doctors found for this search</p>
              <p className="text-xs text-slate-400">Only doctors registered on MediArca will appear here. Try different filters or search terms.</p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-[#0D5C46] text-white text-xs font-bold rounded-xl"
              >
                Reset Search
              </button>
            </div>
          ) : null}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {renderPageButtons()}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
