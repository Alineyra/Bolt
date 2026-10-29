import {
  MapPin,
  Phone,
  Stethoscope,
  Clock,
  Building2,
  Ambulance,
  Navigation,
} from 'lucide-react';
import type { HospitalWithDistance } from '@/types';

interface Props {
  hospital: HospitalWithDistance;
  onDirections: (hospital: HospitalWithDistance) => void;
  index: number;
}

export default function HospitalCard({ hospital, onDirections, index }: Props) {
  const isPublic = hospital.type === 'público';

  return (
    <article
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${
                isPublic ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Building2 size={22} />
            </span>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight text-base sm:text-lg pr-1">
                {hospital.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-500">{hospital.municipality}</span>
              </div>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
              isPublic
                ? 'bg-teal-100 text-teal-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isPublic ? 'Público' : 'Privado'}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-4 flex items-start gap-2">
          <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
          <span>{hospital.address}</span>
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {hospital.emergency && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg">
              <Ambulance size={13} />
              Urgencias 24h
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg">
            <Clock size={13} />
            {isPublic ? 'Servicio público' : 'Servicio privado'}
          </span>
        </div>

        {hospital.specialties.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              <Stethoscope size={13} />
              Especialidades
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hospital.specialties.map((s) => (
                <span
                  key={s}
                  className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-100"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
          {hospital.phone && (
            <a
              href={`tel:${hospital.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors flex-1"
            >
              <Phone size={16} />
              <span className="truncate">{hospital.phone}</span>
            </a>
          )}
          <button
            onClick={() => onDirections(hospital)}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            <Navigation size={15} />
            Cómo llegar
          </button>
        </div>

        {typeof hospital.distanceKm === 'number' && (
          <div className="mt-3 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            A {hospital.distanceKm.toFixed(1)} km de tu ubicación
          </div>
        )}
      </div>
    </article>
  );
}
