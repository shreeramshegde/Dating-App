import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ShieldAlert, 
  ChevronRight,
  ExternalLink,
  Filter
} from 'lucide-react';
import { PetResponse, Species } from '../types';

interface RescueAlertsViewProps {
  alerts: PetResponse[];
  onClaimRescue: (alertId: string) => Promise<void>;
  onOpenReportModal: () => void;
}

export const RescueAlertsView: React.FC<RescueAlertsViewProps> = ({
  alerts,
  onClaimRescue,
  onOpenReportModal,
}) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [filterSpecies, setFilterSpecies] = useState<'ALL' | Species>('ALL');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState<boolean>(false);

  const handleClaim = async (alertId: string) => {
    setClaimingId(alertId);
    try {
      await onClaimRescue(alertId);
    } finally {
      setClaimingId(null);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSpecies !== 'ALL' && alert.species !== filterSpecies) return false;
    if (filterCriticalOnly && alert.urgency !== 'CRITICAL') return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.urgency === 'CRITICAL').length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-left">
      {/* Top Banner with Radar Pulse Effect */}
      <div className="bg-gradient-to-r from-neutral-950 via-rose-950 to-neutral-900 text-white rounded-[32px] p-6 sm:p-8 shadow-xl relative overflow-hidden border border-rose-900/40">
        {/* Pulsing radar circle indicator in background */}
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full border border-rose-500/20 animate-ping pointer-events-none" />
        <div className="absolute -right-4 -top-4 w-36 h-36 rounded-full border border-rose-500/40 pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>24/7 Citizen Emergency Dispatch</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Animals in Distress Radar
          </h2>

          <p className="text-sm text-neutral-300 leading-relaxed font-normal">
            Real-time emergency feed of injured, trapped, or stray animals reported by spotters. Claim an alert to coordinate medical transit, direct veterinary transport, or emergency foster rescue.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenReportModal}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-rose-900 hover:bg-neutral-100 flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-98 transition-all"
            >
              <Plus className="w-4 h-4 text-rose-700" />
              <span>Report Animal in Distress</span>
            </button>

            <span className="text-xs text-neutral-300 font-medium">
              <strong className="text-rose-400 font-bold">{criticalCount} critical</strong> rescue{criticalCount === 1 ? '' : 's'} reported nearby
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-hinge-border p-3.5 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Species:
          </span>
          {[
            { value: 'ALL', label: 'All Animals' },
            { value: 'DOG', label: '🐕 Dogs' },
            { value: 'CAT', label: '🐈 Cats' },
            { value: 'BIRD', label: '🦜 Birds' },
            { value: 'REPTILE', label: '🦎 Reptiles' },
            { value: 'SMALL_ANIMAL', label: '🐇 Small Pets' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterSpecies(tab.value as any)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterSpecies === tab.value
                  ? 'bg-hinge-black text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Urgency Toggle */}
        <button
          onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
          className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all border ${
            filterCriticalOnly
              ? 'bg-rose-700 text-white border-rose-800 shadow-sm'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
        >
          {filterCriticalOnly ? 'Showing Critical Only' : 'Show Critical Only'}
        </button>
      </div>

      {/* Rescue Alerts Grid */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-hinge-border p-12 text-center space-y-4 shadow-subtle">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-2xl text-hinge-black">
            No Active Emergencies in this View
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            All reported animals in this radius have been claimed or assisted. If you spot an animal in distress, click below to notify local rescuers.
          </p>
          <button
            onClick={onOpenReportModal}
            className="px-6 py-2.5 rounded-full bg-hinge-black text-white text-xs font-bold"
          >
            Report Animal in Distress
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.urgency === 'CRITICAL';
            const isClaiming = claimingId === alert.id;
            const photoUrl = alert.photos[0]?.photoUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80';
            const mapsUrl = alert.latitude && alert.longitude
              ? `https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`
              : null;

            return (
              <div
                key={alert.id}
                className={`rounded-[30px] bg-white border p-5 shadow-subtle flex flex-col justify-between transition-all hover:shadow-md ${
                  isCritical
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-hinge-border'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header with Urgency & Distance */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {alert.urgency} URGENCY
                      </span>
                      <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider bg-neutral-100 px-2 py-0.5 rounded-full">
                        {alert.species}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-500">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{alert.distanceKm ? `${alert.distanceKm} km away` : 'Nearby'}</span>
                    </div>
                  </div>

                  {/* Photo & Title Row */}
                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-neutral-200 bg-neutral-100">
                      <img
                        src={photoUrl}
                        alt={alert.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1 min-w-0 text-left">
                      <h3 className="font-serif font-bold text-lg text-hinge-black truncate">
                        {alert.name}
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium truncate">
                        Reported by <strong>{alert.ownerName}</strong>
                      </p>
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{alert.city}</span>
                      </p>
                    </div>
                  </div>

                  {/* Injury / Condition Box */}
                  <div className={`p-3 rounded-2xl text-xs space-y-1 ${
                    isCritical
                      ? 'bg-rose-50 border border-rose-200 text-rose-900'
                      : 'bg-amber-50 border border-amber-200 text-amber-900'
                  }`}>
                    <span className="font-bold uppercase text-[10px] tracking-wider block">
                      Condition & Medical Details:
                    </span>
                    <p className="leading-relaxed font-medium">
                      {alert.healthStatus}
                    </p>
                  </div>

                  {/* Description / Location Landmark */}
                  <p className="text-xs text-neutral-600 leading-relaxed font-sans line-clamp-2">
                    "{alert.description}"
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2.5">
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-full text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 flex items-center gap-1.5 transition-colors shrink-0"
                      title="Open coordinates in Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="hidden sm:inline">GPS Map</span>
                    </a>
                  )}

                  {alert.ownerPhone ? (
                    <a
                      href={`tel:${alert.ownerPhone}`}
                      className="px-3 py-2 rounded-full text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="hidden sm:inline">Call Spotter</span>
                    </a>
                  ) : null}

                  <button
                    onClick={() => handleClaim(alert.id)}
                    disabled={isClaiming}
                    className="flex-1 py-2.5 px-4 rounded-full text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{isClaiming ? 'Opening Channel...' : 'Claim & Coordinate'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
