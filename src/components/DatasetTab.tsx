import React, { useState, useEffect } from 'react';
import { DatasetResponse, DatasetSample } from '../types';

interface DatasetTabProps {
  onSelectSampleForPrediction: (sample: DatasetSample) => void;
}

export const DatasetTab: React.FC<DatasetTabProps> = ({ onSelectSampleForPrediction }) => {
  const [dataResponse, setDataResponse] = useState<DatasetResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRock, setSelectedRock] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchDataset = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRock !== 'all') params.append('rock_type', selectedRock);

      const res = await fetch(`/api/dataset?${params.toString()}`);
      const data: DatasetResponse = await res.json();
      setDataResponse(data);
    } catch (err) {
      console.error('Failed to load dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset();
  }, [selectedRock]);

  const filtered = dataResponse?.data.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.sample_id.toLowerCase().includes(term) ||
      s.rock_type.toLowerCase().includes(term) ||
      s.region.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-slate-500 text-xs font-medium">Total Mining Records</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
            {dataResponse?.total_count || 650}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Satellite + Field Samples</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-slate-500 text-xs font-medium">Average Ore Grade</div>
          <div className="text-xl font-bold font-mono text-blue-700 mt-0.5">
            {dataResponse?.summary.avg_grade_pct || '31.2'}% Mn
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Manganese content</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-slate-500 text-xs font-medium">Average Reserve</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
            {dataResponse?.summary.avg_reserve_kmt ? dataResponse.summary.avg_reserve_kmt.toLocaleString() : '840'} kMT
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Thousand Metric Tons</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-slate-500 text-xs font-medium">High-Grade Reserves</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
            {dataResponse?.summary.high_grade_samples || '278'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">&gt;35% Mn (Steel & Battery)</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-slate-600 font-medium whitespace-nowrap">Filter by Rock:</span>
          <select
            value={selectedRock}
            onChange={(e) => setSelectedRock(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800"
          >
            <option value="all">All Rock Types</option>
            <option value="Gondite">Gondite (Manganiferous)</option>
            <option value="Banded Iron Formation (BIF)">Banded Iron Formation (BIF)</option>
            <option value="Laterite Cap">Laterite Cap</option>
            <option value="Phyllite-Chert">Phyllite-Chert</option>
            <option value="Quartzite-Schist">Quartzite-Schist</option>
            <option value="Basalt">Basalt (Barren)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search sample ID, region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-slate-50 w-full sm:w-60"
          />
        </div>
      </div>

      {/* Dataset Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
              <tr>
                <th className="px-3 py-2.5">Sample ID</th>
                <th className="px-3 py-2.5 font-sans">Location / Region</th>
                <th className="px-3 py-2.5 font-sans">Rock Type</th>
                <th className="px-2 py-2.5 text-right">B4 (Red)</th>
                <th className="px-2 py-2.5 text-right">B8 (NIR)</th>
                <th className="px-2 py-2.5 text-right text-blue-700 font-bold">B12 (SWIR-2)</th>
                <th className="px-2 py-2.5 text-right">Fault (km)</th>
                <th className="px-3 py-2.5 text-right font-sans font-medium">Actual Grade</th>
                <th className="px-3 py-2.5 text-right font-sans font-bold text-slate-900">Actual Reserve</th>
                <th className="px-3 py-2.5 text-center font-sans">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center font-sans text-slate-500">
                    Loading records from dataset...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center font-sans text-slate-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.sample_id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2 text-slate-900 font-semibold">{s.sample_id}</td>
                    <td className="px-3 py-2 font-sans text-slate-600 max-w-[150px] truncate">{s.region}</td>
                    <td className="px-3 py-2 font-sans text-slate-700 font-medium">{s.rock_type}</td>
                    <td className="px-2 py-2 text-right text-slate-600">{s.b4_red.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right text-slate-600">{s.b8_nir.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right text-blue-700 font-bold">{s.b12_swir2.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right text-slate-500">{s.lineament_distance_km.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right font-sans text-slate-800">
                      {s.mn_grade_pct.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right font-sans font-bold text-slate-900">
                      {s.reserve_kmt.toLocaleString()} kMT
                    </td>
                    <td className="px-3 py-2 text-center font-sans">
                      <button
                        onClick={() => onSelectSampleForPrediction(s)}
                        className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-medium cursor-pointer"
                        title="Load this row into the predictor to see ML recognize and predict"
                      >
                        Predict
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
