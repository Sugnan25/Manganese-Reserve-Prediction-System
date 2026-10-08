import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PredictionResult } from '../types';

interface MapPlace {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  rock_type: string;
  b2_blue: number;
  b4_red: number;
  b8_nir: number;
  b11_swir1: number;
  b12_swir2: number;
  lineament_dist: number;
  elevation_m: number;
  actual_reserve_kmt: number;
  actual_grade_pct: number;
  predicted_reserve_kmt?: number;
  predicted_grade_pct?: number;
  zone_type: 'High Reserve' | 'Medium Reserve' | 'Prospective' | 'Low / Barren';
  description: string;
}

const PRESET_PLACES: MapPlace[] = [
  {
    id: 'dongri-buzurg',
    name: 'Dongri Buzurg Mine',
    region: 'Nagpur-Bhandara Belt, Maharashtra, India',
    lat: 21.55,
    lng: 79.68,
    rock_type: 'Gondite',
    b2_blue: 0.10,
    b4_red: 0.17,
    b8_nir: 0.22,
    b11_swir1: 0.31,
    b12_swir2: 0.18,
    lineament_dist: 0.7,
    elevation_m: 470,
    actual_reserve_kmt: 1680.0,
    actual_grade_pct: 49.5,
    zone_type: 'High Reserve',
    description: 'Premier Asian manganese ore producer with high-grade pyrolusite & braunite deposits.'
  },
  {
    id: 'mansar-mine',
    name: 'Mansar Manganese Mine',
    region: 'Ramtek, Nagpur District, Maharashtra, India',
    lat: 21.40,
    lng: 79.29,
    rock_type: 'Gondite',
    b2_blue: 0.11,
    b4_red: 0.18,
    b8_nir: 0.23,
    b11_swir1: 0.31,
    b12_swir2: 0.19,
    lineament_dist: 0.9,
    elevation_m: 450,
    actual_reserve_kmt: 1250.0,
    actual_grade_pct: 46.2,
    zone_type: 'High Reserve',
    description: 'Historic Sausar Group meta-sedimentary belt producing ferromanganese grade ore.'
  },
  {
    id: 'bharweli-balaghat',
    name: 'Bharweli Underground Mine',
    region: 'Balaghat District, Madhya Pradesh, India',
    lat: 21.83,
    lng: 80.20,
    rock_type: 'Gondite',
    b2_blue: 0.10,
    b4_red: 0.16,
    b8_nir: 0.21,
    b11_swir1: 0.30,
    b12_swir2: 0.18,
    lineament_dist: 0.6,
    elevation_m: 510,
    actual_reserve_kmt: 2100.0,
    actual_grade_pct: 51.0,
    zone_type: 'High Reserve',
    description: 'Asia’s deepest underground manganese mine; high purity battery & steel grade feedstock.'
  },
  {
    id: 'joda-kendujhar',
    name: 'Joda East & Barbil Mines',
    region: 'Kendujhar District, Odisha, India',
    lat: 22.02,
    lng: 85.43,
    rock_type: 'Laterite Cap',
    b2_blue: 0.13,
    b4_red: 0.22,
    b8_nir: 0.27,
    b11_swir1: 0.32,
    b12_swir2: 0.21,
    lineament_dist: 1.8,
    elevation_m: 490,
    actual_reserve_kmt: 890.0,
    actual_grade_pct: 42.1,
    zone_type: 'Medium Reserve',
    description: 'Major iron-manganese enrichment cap in eastern India feeding Rourkela & Jamshedpur mills.'
  },
  {
    id: 'sandur-bellary',
    name: 'Sandur Manganese Belt',
    region: 'Bellary / Vijayanagara, Karnataka, India',
    lat: 15.09,
    lng: 76.55,
    rock_type: 'Phyllite-Chert',
    b2_blue: 0.12,
    b4_red: 0.20,
    b8_nir: 0.25,
    b11_swir1: 0.32,
    b12_swir2: 0.20,
    lineament_dist: 1.4,
    elevation_m: 580,
    actual_reserve_kmt: 740.0,
    actual_grade_pct: 38.8,
    zone_type: 'Medium Reserve',
    description: 'Dharwar Craton manganese formation with low phosphorus content suitable for export.'
  },
  {
    id: 'hotazel-kalahari',
    name: 'Hotazel & Mamatwan Mines',
    region: 'Kalahari Manganese Field, Northern Cape, South Africa',
    lat: -27.20,
    lng: 22.96,
    rock_type: 'Banded Iron Formation (BIF)',
    b2_blue: 0.11,
    b4_red: 0.19,
    b8_nir: 0.25,
    b11_swir1: 0.33,
    b12_swir2: 0.20,
    lineament_dist: 1.2,
    elevation_m: 1040,
    actual_reserve_kmt: 4800.0,
    actual_grade_pct: 47.5,
    zone_type: 'High Reserve',
    description: 'World’s single largest land-based manganese reserve, containing over 70% of known global resources.'
  },
  {
    id: 'groote-eylandt',
    name: 'Alyangula Deposit',
    region: 'Groote Eylandt, Northern Territory, Australia',
    lat: -13.85,
    lng: 136.42,
    rock_type: 'Phyllite-Chert',
    b2_blue: 0.10,
    b4_red: 0.17,
    b8_nir: 0.22,
    b11_swir1: 0.30,
    b12_swir2: 0.18,
    lineament_dist: 0.9,
    elevation_m: 45,
    actual_reserve_kmt: 2400.0,
    actual_grade_pct: 50.4,
    zone_type: 'High Reserve',
    description: 'High-grade sedimentary manganese pisolites mined close to maritime export port.'
  },
  {
    id: 'conselheiro-lafaiete',
    name: 'Conselheiro Lafaiete Deposit',
    region: 'Quadrilátero Ferrífero, Minas Gerais, Brazil',
    lat: -20.66,
    lng: -43.78,
    rock_type: 'Gondite',
    b2_blue: 0.12,
    b4_red: 0.19,
    b8_nir: 0.24,
    b11_swir1: 0.32,
    b12_swir2: 0.20,
    lineament_dist: 1.5,
    elevation_m: 910,
    actual_reserve_kmt: 980.0,
    actual_grade_pct: 43.5,
    zone_type: 'Medium Reserve',
    description: 'Historic South American manganese producer supplying domestic and global steel.'
  }
];

interface SatelliteMapTabProps {
  onPredictWithValues: (params: {
    rock_type: string;
    b4_red: number;
    b12_swir2: number;
    b2_blue: number;
    b8_nir: number;
    b11_swir1: number;
    lineament_distance_km: number;
  }) => void;
}

export const SatelliteMapTab: React.FC<SatelliteMapTabProps> = ({ onPredictWithValues }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  const [mapType, setMapType] = useState<'satellite' | 'streets'>('satellite');
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(PRESET_PLACES[0]);
  const [userClicks, setUserClicks] = useState<MapPlace[]>([]);
  const [filterZone, setFilterZone] = useState<string>('all');
  const [predicting, setPredicting] = useState<boolean>(false);
  const [activePrediction, setActivePrediction] = useState<PredictionResult | null>(null);

  // Tile layers
  const satelliteTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const streetTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Custom marker icons
  const createPinIcon = (zoneType: string, label: string) => {
    let bgColor = '#2563eb'; // blue
    if (zoneType === 'High Reserve') bgColor = '#1d4ed8'; // deep blue
    if (zoneType === 'Medium Reserve') bgColor = '#0284c7'; // sky blue
    if (zoneType === 'Low / Barren') bgColor = '#64748b'; // slate

    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background-color: ${bgColor};
          color: white;
          padding: 3px 7px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          font-family: monospace;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          border: 1.5px solid white;
          white-space: nowrap;
          text-align: center;
          cursor: pointer;
        ">
          ${label}
        </div>
      `,
      iconSize: [60, 24],
      iconAnchor: [30, 12]
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center on Central India (Nagpur manganese belt)
    const map = L.map(mapContainerRef.current, {
      center: [21.55, 79.68],
      zoom: 6,
      zoomControl: true,
    });

    const tileLayer = L.tileLayer(mapType === 'satellite' ? satelliteTileUrl : streetTileUrl, {
      maxZoom: 18,
      attribution: mapType === 'satellite' ? 'Esri World Imagery' : '© OpenStreetMap contributors',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Click anywhere on map to predict for that exact place
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const lat = Math.round(e.latlng.lat * 10000) / 10000;
      const lng = Math.round(e.latlng.lng * 10000) / 10000;

      // Check distance to closest known manganese center
      let minDist = 999;
      let closestPlace = PRESET_PLACES[0];
      for (const p of PRESET_PLACES) {
        const d = Math.sqrt(Math.pow(p.lat - lat, 2) + Math.pow(p.lng - lng, 2));
        if (d < minDist) {
          minDist = d;
          closestPlace = p;
        }
      }

      // If near a known belt, inherit geological affinity, otherwise background
      const isNearBelt = minDist < 1.5;
      const rock = isNearBelt ? closestPlace.rock_type : 'Basalt';
      const fault = isNearBelt ? Math.min(4.0, minDist * 2.5 + 0.5) : 6.5;
      const b4 = isNearBelt ? closestPlace.b4_red : 0.26;
      const b12 = isNearBelt ? closestPlace.b12_swir2 : 0.32;
      const elev = isNearBelt ? closestPlace.elevation_m : 380;

      const newPlace: MapPlace = {
        id: `clicked-${Date.now()}`,
        name: `Selected Point (${lat}°, ${lng}°)`,
        region: isNearBelt ? `Proximal to ${closestPlace.region}` : 'Custom Geographic Coordinate',
        lat,
        lng,
        rock_type: rock,
        b2_blue: isNearBelt ? closestPlace.b2_blue : 0.17,
        b4_red: b4,
        b8_nir: isNearBelt ? closestPlace.b8_nir : 0.32,
        b11_swir1: isNearBelt ? closestPlace.b11_swir1 : 0.38,
        b12_swir2: b12,
        lineament_dist: fault,
        elevation_m: elev,
        actual_reserve_kmt: 0,
        actual_grade_pct: 0,
        zone_type: isNearBelt ? 'Prospective' : 'Low / Barren',
        description: 'User selected coordinate tested via satellite multispectral model.'
      };

      setSelectedPlace(newPlace);
      setUserClicks(prev => [newPlace, ...prev.slice(0, 5)]);

      // Drop pin marker
      if (clickMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(clickMarkerRef.current);
      }

      const clickPin = L.marker([lat, lng], {
        icon: createPinIcon(newPlace.zone_type, 'Target'),
      }).addTo(map);

      clickMarkerRef.current = clickPin;

      // Predict for this place
      await fetchPredictionForPlace(newPlace);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when user switches Satellite / Streets
  useEffect(() => {
    if (!tileLayerRef.current || !mapInstanceRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const newLayer = L.tileLayer(mapType === 'satellite' ? satelliteTileUrl : streetTileUrl, {
      maxZoom: 18,
      attribution: mapType === 'satellite' ? 'Esri World Imagery' : '© OpenStreetMap contributors',
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [mapType]);

  // Render Preset & Clicked Markers on the Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    const placesToRender = [...PRESET_PLACES, ...userClicks].filter(p => {
      if (filterZone === 'high') return p.zone_type === 'High Reserve';
      if (filterZone === 'medium') return p.zone_type === 'Medium Reserve' || p.zone_type === 'High Reserve';
      return true;
    });

    placesToRender.forEach((place) => {
      const pinLabel = place.actual_reserve_kmt > 0 
        ? `${Math.round(place.actual_reserve_kmt)} kMT` 
        : 'Predict';

      const marker = L.marker([place.lat, place.lng], {
        icon: createPinIcon(place.zone_type, pinLabel),
      });

      marker.on('click', () => {
        handleSelectPlace(place);
      });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; min-width: 180px;">
          <div style="font-weight: bold; color: #0f172a; margin-bottom: 2px;">${place.name}</div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${place.region}</div>
          <div style="background: #f1f5f9; padding: 6px; border-radius: 4px; font-family: monospace;">
            <div>Reserve: <strong>${place.actual_reserve_kmt > 0 ? `${place.actual_reserve_kmt} kMT` : 'Calculating...'}</strong></div>
            <div>Grade: <strong>${place.actual_grade_pct > 0 ? `${place.actual_grade_pct}% Mn` : 'Calculating...'}</strong></div>
            <div>Rock: ${place.rock_type}</div>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);

      markersLayerRef.current?.addLayer(marker);
    });
  }, [userClicks, filterZone]);

  const handleSelectPlace = async (place: MapPlace) => {
    setSelectedPlace(place);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], 9, { duration: 1.2 });
    }
    await fetchPredictionForPlace(place);
  };

  const fetchPredictionForPlace = async (place: MapPlace) => {
    setPredicting(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rock_type: place.rock_type,
          b2_blue: place.b2_blue,
          b3_green: 0.14,
          b4_red: place.b4_red,
          b8_nir: place.b8_nir,
          b11_swir1: place.b11_swir1,
          b12_swir2: place.b12_swir2,
          lineament_distance_km: place.lineament_dist,
          elevation_m: place.elevation_m,
          slope_deg: 12,
        }),
      });
      const data: PredictionResult = await res.json();
      setActivePrediction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  // Run initial prediction for default place
  useEffect(() => {
    if (selectedPlace) {
      fetchPredictionForPlace(selectedPlace);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Interactive Geographic Manganese Map
            </h2>
            <p className="text-xs text-slate-500">
              Click any place on the map to drop a pin and predict manganese reserves, or select a famous mining belt below:
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tile Layer Toggle */}
            <div className="flex rounded-md border border-slate-300 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`px-3 py-1 font-medium cursor-pointer ${
                  mapType === 'satellite' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Satellite Layer
              </button>
              <button
                type="button"
                onClick={() => setMapType('streets')}
                className={`px-3 py-1 font-medium cursor-pointer ${
                  mapType === 'streets' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Map / Streets
              </button>
            </div>

            {/* Filter by Zone */}
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800"
            >
              <option value="all">Show All Places</option>
              <option value="high">High Reserves (&gt;1,000 kMT)</option>
              <option value="medium">Medium &amp; High Reserves</option>
            </select>
          </div>
        </div>

        {/* Quick Location Pills */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap mr-1">Fly to:</span>
          {PRESET_PLACES.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPlace(p)}
              className={`px-2.5 py-1 rounded border text-xs whitespace-nowrap font-medium transition cursor-pointer ${
                selectedPlace?.id === p.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Selected Place Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: The Real Leaflet Map (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-2 flex flex-col">
          <div className="relative w-full h-[460px] rounded overflow-hidden border border-slate-200">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Map Instruction Overlay */}
            <div className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded border border-slate-300 text-[11px] text-slate-700 shadow-sm pointer-events-none">
              Click anywhere on map to predict reserves
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-2.5 px-2 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-700 inline-block"></span>
                <span>High Reserve Manganese (&gt;1,000 kMT)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
                <span>Medium Reserve (&gt;500 kMT)</span>
              </span>
            </div>
            <span>Coordinates: Lat {selectedPlace?.lat.toFixed(2)}°, Lng {selectedPlace?.lng.toFixed(2)}°</span>
          </div>
        </div>

        {/* Right: Place Information & Live Prediction Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedPlace?.name || 'Selected Map Location'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedPlace?.region}
                </p>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {selectedPlace?.lat.toFixed(2)}°N, {selectedPlace?.lng.toFixed(2)}°E
              </span>
            </div>

            {selectedPlace && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedPlace.description}
              </p>
            )}

            {/* Live Model Output for this Location */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="text-xs font-semibold text-blue-900 flex justify-between">
                <span>Predicted Manganese Reserve for this Place:</span>
                {predicting && <span className="font-normal text-blue-700">Updating...</span>}
              </div>

              {activePrediction ? (
                <div>
                  <div className="text-3xl font-extrabold font-mono text-blue-900">
                    {activePrediction.random_forest.predicted_reserve_kmt.toLocaleString()}
                    <span className="text-sm font-normal text-blue-700 ml-1.5">kMT</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    ({(activePrediction.random_forest.predicted_reserve_kmt * 1000).toLocaleString()} Metric Tons)
                  </div>

                  <div className="mt-3 pt-2 border-t border-blue-200 flex justify-between items-center text-xs">
                    <span className="text-blue-900 font-medium">Predicted Ore Grade:</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {activePrediction.random_forest.predicted_grade_pct}% Mn
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Geological & Satellite Telemetry at this coordinate */}
            {selectedPlace && (
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2 text-xs">
                <div className="font-semibold text-slate-800">
                  Location Satellite & Geological Attributes:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 font-sans">Host Rock: </span>
                    <span className="font-bold text-slate-800">{selectedPlace.rock_type}</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 font-sans">SWIR-2 Band (B12): </span>
                    <span className="font-bold text-blue-700">{selectedPlace.b12_swir2}</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 font-sans">Red Band (B4): </span>
                    <span className="font-bold text-slate-800">{selectedPlace.b4_red}</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 font-sans">Fault Distance: </span>
                    <span className="font-bold text-slate-800">{selectedPlace.lineament_dist} km</span>
                  </div>
                </div>
              </div>
            )}

            {/* Model Comparison for this location */}
            {activePrediction && (
              <div className="p-3 border border-slate-200 rounded-lg text-xs space-y-1.5">
                <div className="font-semibold text-slate-800">Comparison for this location:</div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-600 font-sans">Random Forest (Recommended):</span>
                  <span className="font-bold text-blue-700">{activePrediction.random_forest.predicted_reserve_kmt} kMT</span>
                </div>
                <div className="flex justify-between font-mono text-slate-500">
                  <span className="font-sans">Linear Regression (Baseline):</span>
                  <span>{activePrediction.linear_regression.predicted_reserve_kmt} kMT</span>
                </div>
              </div>
            )}

            {/* Send to Predictor Tab button */}
            {selectedPlace && (
              <button
                onClick={() => {
                  onPredictWithValues({
                    rock_type: selectedPlace.rock_type,
                    b4_red: selectedPlace.b4_red,
                    b12_swir2: selectedPlace.b12_swir2,
                    b2_blue: selectedPlace.b2_blue,
                    b8_nir: selectedPlace.b8_nir,
                    b11_swir1: selectedPlace.b11_swir1,
                    lineament_distance_km: selectedPlace.lineament_dist,
                  });
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition cursor-pointer"
              >
                Open in Predictor Form to Adjust Sliders
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
