export interface DatasetSample {
  sample_id: string;
  region: string;
  latitude: number;
  longitude: number;
  rock_type: string;
  elevation_m: number;
  slope_deg: number;
  lineament_distance_km: number;
  b2_blue: number;
  b3_green: number;
  b4_red: number;
  b8_nir: number;
  b11_swir1: number;
  b12_swir2: number;
  iron_oxide_idx: number;
  ferrous_idx: number;
  clay_idx: number;
  mrr: number;
  ndvi: number;
  ndmi: number;
  mn_grade_pct: number;
  reserve_kmt: number;
}

export interface DatasetResponse {
  total_count: number;
  filtered_count: number;
  summary: {
    avg_grade_pct: number;
    avg_reserve_kmt: number;
    max_reserve_kmt: number;
    high_grade_samples: number;
  };
  data: DatasetSample[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface FeatureCoefficient {
  feature: string;
  coefficient: number;
}

export interface ComparisonPoint {
  sample_id: string;
  region: string;
  actual_reserve_kmt: number;
  actual_grade_pct: number;
  lr_predicted_reserve_kmt: number;
  rf_predicted_reserve_kmt: number;
  lr_error: number;
  rf_error: number;
  rock_type: string;
}

export interface ModelMetrics {
  name: string;
  reserve_r2: number;
  reserve_rmse: number;
  reserve_mae: number;
  grade_r2: number;
  grade_rmse: number;
  intercept?: number;
  coefficients?: FeatureCoefficient[];
  n_estimators?: number;
  max_depth?: number;
  feature_importances?: FeatureImportance[];
}

export interface TrainingResults {
  dataset_total_samples: number;
  train_samples: number;
  test_samples: number;
  test_ratio: number;
  execution_time_ms?: number;
  models: {
    linear_regression: ModelMetrics;
    random_forest: ModelMetrics;
  };
  performance_lift: {
    r2_improvement_pct: number;
    rmse_reduction_pct: number;
  };
  comparison_points: ComparisonPoint[];
}

export interface PredictionResult {
  linear_regression: {
    predicted_reserve_kmt: number;
    predicted_grade_pct: number;
  };
  random_forest: {
    predicted_reserve_kmt: number;
    predicted_grade_pct: number;
  };
  indices: {
    iron_oxide_idx: number;
    ferrous_idx: number;
    clay_idx: number;
    mrr: number;
    ndvi: number;
    ndmi: number;
  };
  classification: string;
  recommendation: string;
}

export interface ExplorationRegion {
  id: string;
  name: string;
  coordinates: [number, number];
  geology: string;
  mineralogy: string;
  historical_production: string;
  avg_grade: string;
  spectral_profile: {
    b2_blue: number;
    b3_green: number;
    b4_red: number;
    b8_nir: number;
    b11_swir1: number;
    b12_swir2: number;
    dominant_rock: string;
  };
}

export interface GridCell {
  row: number;
  col: number;
  lat: number;
  lng: number;
  on_shear_trend: boolean;
  b4_red: number;
  b12_swir2: number;
  iron_oxide_idx: number;
  swir_absorption: number;
  deposit_probability: number;
  predicted_grade_pct: number;
  predicted_reserve_kmt: number;
  prospect_status: 'High Priority' | 'Moderate' | 'Low';
}

export interface GridScanResponse {
  region_id: string;
  region_name: string;
  center: [number, number];
  grid_size: number;
  cells: GridCell[];
}

export interface SystemStatus {
  status: string;
  python_version: string;
  sklearn_version: string;
  pandas_version: string;
  numpy_version: string;
  dataset_ready: boolean;
  notebook_ready: boolean;
}
