import React from 'react';
import { MapPin, Globe, Compass, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const ClinicalAttachmentsPage: React.FC = () => {
  const hubs = [
    {
      region: 'East Africa Hub',
      city: 'Mogadishu & Hargeisa',
      specialties: ['Internal Medicine', 'General Surgery', 'Pediatrics', 'Emergency Care'],
      capacity: '45 Students / Term',
      status: 'Active',
    },
    {
      region: 'Middle East & Gulf Hub',
      city: 'Doha & Dubai Clinical Centers',
      specialties: ['Cardiology', 'Obstetrics & Gynaecology', 'Radiology', 'Trauma'],
      capacity: '30 Students / Term',
      status: 'Active',
    },
    {
      region: 'European Academic Hub',
      city: 'London & Istanbul Centers',
      specialties: ['Neurology', 'Oncology', 'Anesthesiology', 'Public Health'],
      capacity: '20 Students / Term',
      status: 'Active',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Clinical Attachment Pathways & Regional Hubs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Geographic clinical attachment training hubs, specialty capacities, and regional hospital network operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hubs.map((hub) => (
          <div
            key={hub.region}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#102f38] text-white flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <Badge variant="success">{hub.status}</Badge>
              </div>

              <h2 className="text-base font-bold text-slate-900">{hub.region}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{hub.city}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Primary Rotation Specialties:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hub.specialties.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
              <span>Capacity Allocation</span>
              <strong className="font-mono text-slate-800">{hub.capacity}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
