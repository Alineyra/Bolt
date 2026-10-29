import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  MapPin,
  Loader2,
  Cross,
  Stethoscope,
  Filter,
  HeartPulse,
  Ambulance,
  X,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Hospital, HospitalWithDistance } from '@/types';
import HospitalCard from '@/components/HospitalCard';

type TypeFilter = 'todos' | 'público' | 'privado';
type SortMode = 'distance' | 'name';

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function App() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('todos');
  const [onlyEmergency, setOnlyEmergency] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('distance');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');
      if (error) {
        setError('No pudimos cargar los hospitales. Inténtalo de nuevo.');
      } else {
        setHospitals((data ?? []) as Hospital[]);
      }
      setLoading(false);
    })();
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no permite obtener la ubicación.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocationError('No se pudo obtener tu ubicación. Puedes seguir buscando por municipio.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const municipalities = useMemo(() => {
    const set = new Set(hospitals.map((h) => h.municipality));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [hospitals]);

  const filtered = useMemo<HospitalWithDistance[]>(() => {
    let list = hospitals as HospitalWithDistance[];

    if (typeFilter !== 'todos') {
      list = list.filter((h) => h.type === typeFilter);
    }
    if (onlyEmergency) {
      list = list.filter((h) => h.emergency);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.municipality.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.specialties.some((s) => s.toLowerCase().includes(q)),
      );
    }

    if (userCoords) {
      list = list.map((h) => {
        if (h.latitude != null && h.longitude != null) {
          return {
            ...h,
            distanceKm: haversineKm(userCoords.lat, userCoords.lon, h.latitude, h.longitude),
          };
        }
        return h;
      });
    }

    if (sortMode === 'distance' && userCoords) {
      list.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }
    return list;
  }, [hospitals, typeFilter, onlyEmergency, search, userCoords, sortMode]);

  const openDirections = (hospital: HospitalWithDistance) => {
    const q = hospital.latitude && hospital.longitude
      ? `${hospital.latitude},${hospital.longitude}`
      : `${hospital.name}, ${hospital.address}, ${hospital.municipality}, Estado de México`;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-gradient-to-br from-teal-600 via-teal-600 to-cyan-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-12 h-12 bg-white/15 backdrop-blur rounded-2xl">
              <HeartPulse size={28} />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                HospitalCerca
              </h1>
              <p className="text-teal-100 text-sm">Estado de México</p>
            </div>
          </div>
          <p className="text-teal-50 max-w-2xl text-base sm:text-lg leading-relaxed">
            Encuentra el hospital más cercano a ti. Busca por municipio, nombre o
            especialidad y obtén indicaciones para llegar.
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busca por nombre, municipio o especialidad…"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                {(['todos', 'público', 'privado'] as TypeFilter[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${
                      typeFilter === t
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t === 'todos' ? 'Todos' : t}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setOnlyEmergency((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-xl border transition-all ${
                  onlyEmergency
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Ambulance size={15} />
                Urgencias 24h
              </button>

              <button
                onClick={requestLocation}
                disabled={locating}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-xl border transition-all ${
                  userCoords
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                } ${locating ? 'opacity-60' : ''}`}
              >
                {locating ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
                {userCoords ? 'Ubicación activa' : 'Usar mi ubicación'}
              </button>

              <div className="inline-flex items-center gap-1.5 ml-auto">
                <Filter size={15} className="text-slate-400" />
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  disabled={!userCoords && sortMode === 'distance'}
                  className="text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="distance">Más cercanos</option>
                  <option value="name">Nombre (A-Z)</option>
                </select>
              </div>
            </div>

            {locationError && (
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats / Municipality chips */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap flex items-center gap-1">
            <MapPin size={12} />
            Municipios
          </span>
          <button
            onClick={() => setSearch('')}
            className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full border transition-all ${
              search === '' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
            }`}
          >
            Todos
          </button>
          {municipalities.map((m) => {
            const active = search.trim().toLowerCase() === m.toLowerCase();
            return (
              <button
                key={m}
                onClick={() => setSearch(m)}
                className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full border transition-all ${
                  active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-4 mb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={32} className="animate-spin mb-3 text-teal-500" />
            <p className="text-sm">Cargando hospitales…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={36} className="text-red-400 mb-3" />
            <p className="text-slate-600">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Cross size={36} className="text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No encontramos hospitales con esos criterios.</p>
            <p className="text-slate-400 text-sm mt-1">Prueba con otra búsqueda o limpia los filtros.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{filtered.length}</span>{' '}
                {filtered.length === 1 ? 'hospital encontrado' : 'hospitales encontrados'}
              </p>
              {userCoords && sortMode === 'distance' && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Stethoscope size={12} />
                  Ordenados por distancia
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((h, i) => (
                <HospitalCard key={h.id} hospital={h} onDirections={openDirections} index={i} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm flex items-center gap-2">
            <HeartPulse size={16} className="text-teal-400" />
            HospitalCerca · Estado de México
          </p>
          <p className="text-xs text-slate-400 text-center sm:text-right max-w-md">
            La información es referencial. En una emergencia llama al 911.
          </p>
        </div>
      </footer>
    </div>
  );
}
