import React from 'react';
import { Plus, PawPrint, Trash2, ShieldCheck, MapPin } from 'lucide-react';
import { PetResponse } from '../types';

interface MyPetsViewProps {
  myPets: PetResponse[];
  onOpenCreatePet: () => void;
  onDeletePet: (petId: string) => Promise<void>;
}

export const MyPetsView: React.FC<MyPetsViewProps> = ({
  myPets,
  onOpenCreatePet,
  onDeletePet,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-white rounded-[32px] border border-hinge-border p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
            <PawPrint className="w-3.5 h-3.5" />
            <span>Rehomer & Shelter Management</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-hinge-black">
            My Listed Pets ({myPets.length})
          </h2>
          <p className="text-xs text-neutral-500">
            Manage your adoption and foster listings, review statuses, and post new companions.
          </p>
        </div>

        <button
          onClick={onOpenCreatePet}
          className="px-5 py-3 rounded-full text-xs font-bold text-white bg-hinge-black hover:bg-neutral-800 flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-98 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>List a Pet for Adoption</span>
        </button>
      </div>

      {/* Grid of My Pets */}
      {myPets.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-hinge-border p-12 text-center space-y-4 shadow-subtle">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <PawPrint className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-2xl text-hinge-black">
            No Pets Listed Yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Are you a pet owner relocating or a rescue shelter with animals looking for homes? Click below to create your first listing.
          </p>
          <button
            onClick={onOpenCreatePet}
            className="px-6 py-2.5 rounded-full bg-hinge-black text-white text-xs font-bold flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>List a Pet</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myPets.map((pet) => {
            const photoUrl = pet.photos[0]?.photoUrl || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80';

            return (
              <div
                key={pet.id}
                className="rounded-[30px] bg-white border border-hinge-border p-5 shadow-subtle flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  {/* Photo & Badges */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                    <img
                      src={photoUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md">
                        {pet.species}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-600 text-white">
                        {pet.status}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete listing for ${pet.name}?`)) {
                          onDeletePet(pet.id);
                        }
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Breed */}
                  <div>
                    <h3 className="font-serif font-bold text-xl text-hinge-black">
                      {pet.name}
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium">
                      {pet.breed} • {pet.gender} • {pet.size}
                    </p>
                  </div>

                  {/* Health summary */}
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{pet.healthStatus}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{pet.city}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span className="capitalize">{pet.listingType.toLowerCase()} listing</span>
                  <span className="font-semibold text-emerald-700">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
