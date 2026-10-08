import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PredictorTab } from './components/PredictorTab';
import { ModelComparisonTab } from './components/ModelComparisonTab';
import { DatasetTab } from './components/DatasetTab';
import { SatelliteMapTab } from './components/SatelliteMapTab';
import { DatasetSample, TrainingResults } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('predictor');
  const [trainingResults, setTrainingResults] = useState<TrainingResults | null>(null);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [predictorValues, setPredictorValues] = useState<{
    rock_type: string;
    b4_red: number;
    b12_swir2: number;
    b2_blue: number;
    b8_nir: number;
    b11_swir1: number;
    lineament_distance_km: number;
  } | undefined>(undefined);

  useEffect(() => {
    fetchTrainingResults({ test_size: 0.2, n_estimators: 100, max_depth: 12 });
  }, []);

  const fetchTrainingResults = async (params: { test_size: number; n_estimators: number; max_depth: number }) => {
    setIsTraining(true);
    try {
      const res = await fetch('/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data: TrainingResults = await res.json();
      setTrainingResults(data);
    } catch (err) {
      console.error('Training failed:', err);
    } finally {
      setIsTraining(false);
    }
  };

  const handleSelectSampleFromDataset = (sample: DatasetSample) => {
    setPredictorValues({
      rock_type: sample.rock_type,
      b4_red: sample.b4_red,
      b12_swir2: sample.b12_swir2,
      b2_blue: sample.b2_blue,
      b8_nir: sample.b8_nir,
      b11_swir1: sample.b11_swir1,
      lineament_distance_km: sample.lineament_distance_km,
    });
    setActiveTab('predictor');
  };

  const handleNavigateToPredictorWithValues = (values: {
    rock_type: string;
    b4_red: number;
    b12_swir2: number;
    b2_blue: number;
    b8_nir: number;
    b11_swir1: number;
    lineament_distance_km: number;
  }) => {
    setPredictorValues(values);
    setActiveTab('predictor');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'predictor' && (
          <PredictorTab initialValues={predictorValues} />
        )}

        {activeTab === 'models' && (
          <ModelComparisonTab
            trainingResults={trainingResults}
            onRetrain={fetchTrainingResults}
            isTraining={isTraining}
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetTab onSelectSampleForPrediction={handleSelectSampleFromDataset} />
        )}

        {activeTab === 'map' && (
          <SatelliteMapTab onPredictWithValues={handleNavigateToPredictorWithValues} />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Manganese Reserve Prediction System</strong> · Identifying mineral reserves to overcome production shortfalls
          </div>
          <div className="text-slate-400">
            Linear Regression vs Random Forest Regression
          </div>
        </div>
      </footer>
    </div>
  );
}
