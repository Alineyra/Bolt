export interface Hospital {
  id: string;
  name: string;
  municipality: string;
  address: string;
  phone: string | null;
  type: 'público' | 'privado';
  emergency: boolean;
  specialties: string[];
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export type HospitalWithDistance = Hospital & {
  distanceKm?: number;
};
