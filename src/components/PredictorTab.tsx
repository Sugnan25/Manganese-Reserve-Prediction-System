import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PredictionResult } from '../types';

interface PresetLocation {
  name: string;
  region: string;
  lat: number;
  lng: number;
  rock: string;
  b2: number;
  b4: number;
  b8: number;
  b11: number;
  b12: number;
  fault: number;
  elev: number;
}

const PRESET_LOCATIONS: PresetLocation[] = [
  {
    name: 'Dongri Buzurg Mine',
    region: 'Nagpur-Bhandara Belt, Maharashtra, India',
    lat: 21.55,
    lng: 79.68,
    rock: 'Gondite',
    b2: 0.10, b4: 0.17, b8: 0.22, b11: 0.31, b12: 0.18, fault: 0.7, elev: 470,
  },
  {
    name: 'Bharweli Underground Mine',
    region: 'Balaghat District, Madhya Pradesh, India',
    lat: 21.83,
    lng: 80.20,
    rock: 'Gondite',
    b2: 0.10, b4: 0.16, b8: 0.21, b11: 0.30, b12: 0.18, fault: 0.6, elev: 510,
  },
  {
    name: 'Mansar Manganese Mine',
    region: 'Ramtek, Nagpur District, Maharashtra, India',
    lat: 21.40,
    lng: 79.29,
    rock: 'Gondite',
    b2: 0.11, b4: 0.18, b8: 0.23, b11: 0.31, b12: 0.19, fault: 0.9, elev: 450,
  },
  {
    name: 'Joda East & Barbil Mines',
    region: 'Kendujhar District, Odisha, India',
    lat: 22.02,
    lng: 85.43,
    rock: 'Laterite Cap',
    b2: 0.13, b4: 0.22, b8: 0.27, b11: 0.32, b12: 0.21, fault: 1.8, elev: 490,
  },
  {
    name: 'Sandur Manganese Belt',
    region: 'Bellary / Vijayanagara, Karnataka, India',
    lat: 15.09,
    lng: 76.55,
    rock: 'Phyllite-Chert',
    b2: 0.12, b4: 0.20, b8: 0.25, b11: 0.32, b12: 0.20, fault: 1.4, elev: 580,
  },
  {
    name: 'Hotazel & Mamatwan Mines',
    region: 'Kalahari Manganese Field, South Africa',
    lat: -27.20,
    lng: 22.96,
    rock: 'Banded Iron Formation (BIF)',
    b2: 0.11, b4: 0.19, b8: 0.25, b11: 0.33, b12: 0.20, fault: 1.2, elev: 1040,
  },
  {
    name: 'Groote Eylandt (Alyangula)',
    region: 'Northern Territory, Australia',
    lat: -13.85,
    lng: 136.42,
    rock: 'Phyllite-Chert',
    b2: 0.10, b4: 0.17, b8: 0.22, b11: 0.30, b12: 0.18, fault: 0.9, elev: 45,
  },
  {
    name: 'Barren Basalt Formation',
    region: 'Deccan Traps Background (No Manganese)',
    lat: 19.87,
    lng: 75.34,
    rock: 'Basalt',
    b2: 0.18, b4: 0.26, b8: 0.35, b11: 0.38, b12: 0.34, fault: 7.0, elev: 580,
  }
];

interface PredictorTabProps {
  initialValues?: {
    rock_type: string;
    b4_red: number;
    b12_swir2: number;
    b2_blue: number;
    b8_nir: number;
    b11_swir1: number;
    lineament_distance_km: number;
  };
}

export const PredictorTab: React.FC<PredictorTabProps> = ({ initialValues }) => {
  const [selectedPlaceName, setSelectedPlaceName] = useState<string>(PRESET_LOCATIONS[0].name);
  const [selectedRegion, setSelectedRegion] = useState<string>(PRESET_LOCATIONS[0].region);
  const [lat, setLat] = useState<number>(PRESET_LOCATIONS[0].lat);
  const [lng, setLng] = useState<number>(PRESET_LOCATIONS[0].lng);

  const [rockType, setRockType] = useState<string>(initialValues?.rock_type || PRESET_LOCATIONS[0].rock);
  const [b2, setB2] = useState<number>(initialValues?.b2_blue || PRESET_LOCATIONS[0].b2);
  const [b4, setB4] = useState<number>(initialValues?.b4_red || PRESET_LOCATIONS[0].b4);
  const [b8, setB8] = useState<number>(initialValues?.b8_nir || PRESET_LOCATIONS[0].b8);
  const [b11, setB11] = useState<number>(initialValues?.b11_swir1 || PRESET_LOCATIONS[0].b11);
  const [b12, setB12] = useState<number>(initialValues?.b12_swir2 || PRESET_LOCATIONS[0].b12);
  const [lineamentDist, setLineamentDist] = useState<number>(initialValues?.lineament_distance_km || PRESET_LOCATIONS[0].fault);
  const [elevation, setElevation] = useState<number>(PRESET_LOCATIONS[0].elev);

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Mini map refs
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const miniMapMarkerRef = useRef<L.Marker | null>(null);

  const handleSelectLocation = (loc: PresetLocation) => {
    setSelectedPlaceName(loc.name);
    setSelectedRegion(loc.region);
    setLat(loc.lat);
    setLng(loc.lng);
    setRockType(loc.rock);
    setB2(loc.b2);
    setB4(loc.b4);
    setB8(loc.b8);
    setB11(loc.b11);
    setB12(loc.b12);
    setLineamentDist(loc.fault);
    setElevation(loc.elev);

    runPrediction({
      rock_type: loc.rock,
      b2_blue: loc.b2,
      b3_green: 0.14,
      b4_red: loc.b4,
      b8_nir: loc.b8,
      b11_swir1: loc.b11,
      b12_swir2: loc.b12,
      lineament_distance_km: loc.fault,
      elevation_m: loc.elev,
      slope_deg: 12,
    });

    if (miniMapInstanceRef.current) {
      miniMapInstanceRef.current.flyTo([loc.lat, loc.lng], 8, { duration: 1.0 });
      if (miniMapMarkerRef.current) {
        miniMapMarkerRef.current.setLatLng([loc.lat, loc.lng]);
      }
    }
  };

  const runPrediction = async (customPayload?: any) => {
    setLoading(true);
    try {
      const payload = customPayload || {
        rock_type: rockType,
        b2_blue: b2,
        b3_green: 0.14,
        b4_red: b4,
        b8_nir: b8,
        b11_swir1: b11,
        b12_swir2: b12,
        lineament_distance_km: lineamentDist,
        elevation_m: elevation,
        slope_deg: 12,
      };

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error('Error predicting reserve:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize mini Leaflet map in Predictor tab
  useEffect(() => {
    if (!miniMapContainerRef.current) return;
    if (miniMapInstanceRef.current) return;

    const map = L.map(miniMapContainerRef.current, {
      center: [lat, lng],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 17,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="
          background-color: #1d4ed8;
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 700;
          font-family: monospace;
          border: 1.5px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          white-space: nowrap;
        ">
          Location
        </div>
      `,
      iconSize: [50, 20],
      iconAnchor: [25, 10]
    });

    const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
    miniMapMarkerRef.current = marker;
    miniMapInstanceRef.current = map;

    return () => {
      map.remove();
      miniMapInstanceRef.current = null;
    };
  }, []);

  // Update marker position if coordinates change
  useEffect(() => {
    if (miniMapMarkerRef.current && miniMapInstanceRef.current) {
      miniMapMarkerRef.current.setLatLng([lat, lng]);
      miniMapInstanceRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  useEffect(() => {
    runPrediction();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Location Selector */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Predict Manganese Reserve
            </h2>
            <p className="text-xs text-slate-500">
              Choose a location or adjust satellite band &amp; rock inputs to predict reserves on the map:
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Place:</span>
            <select
              value={selectedPlaceName}
              onChange={(e) => {
                const found = PRESET_LOCATIONS.find(p => p.name === e.target.value);
                if (found) handleSelectLocation(found);
              }}
              className="bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 font-medium"
            >
              {PRESET_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.region.split(',')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Location Pills */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap mr-1">Quick Select:</span>
          {PRESET_LOCATIONS.slice(0, 5).map((loc) => (
            <button
              key={loc.name}
              type="button"
              onClick={() => handleSelectLocation(loc)}
              className={`px-2.5 py-1 text-xs rounded border font-medium transition cursor-pointer whitespace-nowrap ${
                selectedPlaceName === loc.name
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {loc.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Step 1: Satellite &amp; Geological Input Values
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Lat {lat}°N, Lng {lng}°E
            </span>
          </div>

          {/* Geological Rock Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Geological Rock Type (Host Rock)
            </label>
            <select
              value={rockType}
              onChange={(e) => setRockType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="Gondite">Gondite (Manganiferous metasediment - rich in manganese)</option>
              <option value="Banded Iron Formation (BIF)">Banded Iron Formation (BIF - Sedimentary layers)</option>
              <option value="Laterite Cap">Laterite Cap (Weathered surface crust)</option>
              <option value="Phyllite-Chert">Phyllite-Chert (Sedimentary bedded rock)</option>
              <option value="Quartzite-Schist">Quartzite-Schist</option>
              <option value="Dolomitic Marble">Dolomitic Marble</option>
              <option value="Basalt">Basalt (Barren bedrock - no manganese)</option>
            </select>
          </div>

          {/* Satellite Band Reflectances */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-800">
              Satellite Multispectral Bands (Surface Reflectance: 0.0 to 1.0)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* B2 Blue */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between mb-1 text-slate-700">
                  <span>Band 2 (Blue ~490 nm):</span>
                  <span className="font-mono font-bold text-slate-900">{b2.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.30"
                  step="0.01"
                  value={b2}
                  onChange={(e) => setB2(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* B4 Red */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between mb-1 text-slate-700">
                  <span>Band 4 (Red ~665 nm):</span>
                  <span className="font-mono font-bold text-slate-900">{b4.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.04"
                  max="0.40"
                  step="0.01"
                  value={b4}
                  onChange={(e) => setB4(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* B8 NIR */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between mb-1 text-slate-700">
                  <span>Band 8 (NIR ~842 nm):</span>
                  <span className="font-mono font-bold text-slate-900">{b8.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.45"
                  step="0.01"
                  value={b8}
                  onChange={(e) => setB8(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* B11 SWIR-1 */}
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="flex justify-between mb-1 text-slate-700">
                  <span>Band 11 (SWIR-1 ~1610 nm):</span>
                  <span className="font-mono font-bold text-slate-900">{b11.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.01"
                  value={b11}
                  onChange={(e) => setB11(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* B12 SWIR-2 */}
              <div className="bg-blue-50/70 p-2.5 rounded border border-blue-200 sm:col-span-2">
                <div className="flex justify-between mb-1 text-slate-900 font-medium">
                  <span>Band 12 (SWIR-2 ~2190 nm) — Primary Manganese Absorption:</span>
                  <span className="font-mono font-bold text-blue-700">{b12.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.04"
                  max="0.45"
                  step="0.01"
                  value={b12}
                  onChange={(e) => setB12(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="text-[11px] text-slate-600 mt-1">
                  Manganese minerals absorb this wavelength strongly, depressing reflectance to 0.15–0.22.
                </div>
              </div>
            </div>
          </div>

          {/* Additional Geological Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="flex justify-between mb-1 text-slate-700">
                <span>Distance to Fault Lineament:</span>
                <span className="font-mono font-bold text-slate-900">{lineamentDist.toFixed(1)} km</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10.0"
                step="0.1"
                value={lineamentDist}
                onChange={(e) => setLineamentDist(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="flex justify-between mb-1 text-slate-700">
                <span>Elevation:</span>
                <span className="font-mono font-bold text-slate-900">{elevation} m</span>
              </div>
              <input
                type="range"
                min="150"
                max="850"
                step="10"
                value={elevation}
                onChange={(e) => setElevation(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          {/* Predict Button */}
          <button
            onClick={() => runPrediction()}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Recognizing Data & Computing...' : 'Predict Manganese Reserve'}
          </button>
        </div>

        {/* Right: Output Result Section & Location Map (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Step 2: Predicted Output &amp; Place
                </h3>
                <span className="text-[11px] text-slate-500">{selectedPlaceName}</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-blue-700">
                {selectedRegion.split(',')[0]}
              </span>
            </div>

            {/* Mini Map View of the Place */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Satellite Map View of Location:</span>
                <span className="font-mono">{lat.toFixed(2)}°N, {lng.toFixed(2)}°E</span>
              </div>
              <div className="h-36 w-full rounded border border-slate-200 overflow-hidden relative">
                <div ref={miniMapContainerRef} className="w-full h-full" />
              </div>
            </div>

            {prediction ? (
              <div className="space-y-4">
                {/* Main Prediction Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs text-blue-900 font-semibold mb-1">
                    Predicted Manganese Reserve at this Place:
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-blue-900">
                    {prediction.random_forest.predicted_reserve_kmt.toLocaleString()}
                    <span className="text-sm font-normal text-blue-700 ml-1.5">kMT</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    ({(prediction.random_forest.predicted_reserve_kmt * 1000).toLocaleString()} Metric Tons)
                  </div>

                  <div className="mt-3 pt-2 border-t border-blue-200/60 flex justify-between items-center text-xs">
                    <span className="text-blue-900 font-medium">Estimated Ore Grade:</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {prediction.random_forest.predicted_grade_pct}% Mn
                    </span>
                  </div>
                </div>

                {/* Model Comparison for this specific sample */}
                <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                  <div className="text-xs font-semibold text-slate-800">
                    Model Comparison for this area:
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <div>
                        <span className="font-semibold text-slate-900">Random Forest</span>
                        <span className="text-[10px] text-emerald-700 ml-1.5 font-sans">(More accurate)</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {prediction.random_forest.predicted_reserve_kmt} kMT
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded text-slate-600">
                      <div>
                        <span>Linear Regression</span>
                        <span className="text-[10px] text-slate-500 ml-1.5 font-sans">(Baseline)</span>
                      </div>
                      <span>{prediction.linear_regression.predicted_reserve_kmt} kMT</span>
                    </div>
                  </div>
                </div>

                {/* Zone Evaluation & Shortfall Prevention */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-900">
                    Manganese Zone Status:
                  </div>
                  <div className="text-blue-800 font-bold font-mono">
                    {prediction.classification}
                  </div>
                  <div className="text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
                    {prediction.recommendation}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
