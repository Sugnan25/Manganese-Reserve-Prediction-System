#!/usr/bin/env python3
"""
Generates the official Jupyter Notebook (.ipynb) for:
'Using AI/ML and Space Technology to Identify Manganese Reserves and Overcome Production Shortfalls'
"""

import json
import os

NOTEBOOK_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "manganese_exploration_ml.ipynb")

def build_notebook():
    cells = [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# Using AI/ML and Space Technology to Identify Manganese Reserves and Overcome Production Shortfalls\n",
                "\n",
                "**Author / Project:** Mineral Exploration AI Initiative  \n",
                "**Domain:** Remote Sensing Geoscience & Applied Machine Learning  \n",
                "**Models:** Linear Regression (Baseline) vs. Random Forest Regression (Non-Linear Ensemble)  \n",
                "\n",
                "---\n",
                "### 1. Project Background & Objective\n",
                "Manganese ($Mn$) is essential for modern steel production (as a deoxidizer and alloying agent) and clean energy battery chemistries (such as Lithium Nickel Manganese Cobalt Oxide - NMC, Lithium Manganese Oxide - LMO, and emergent Sodium-ion cathodes). Traditional ground exploration relies heavily on manual surveys and cost-intensive core drilling over vast, remote terrains, frequently leading to localized depletion and production shortfalls.\n",
                "\n",
                "This project uses **Satellite Multispectral Band Data** (Sentinel-2 / Landsat-8 OLI) combined with **Geological Features** (lithology, structural fault proximity, elevation, mineral indices) and applies regression models to:\n",
                "1. Predict manganese reserve tonnage (in $kMT$) and ore grade ($\\%\\,Mn$).\n",
                "2. Compare Linear Regression against Random Forest Regression using $R^2$, $RMSE$, and $MAE$.\n",
                "3. Visualize mineral prospective zones on spatial maps and error residual graphs."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Step 1: Import Core Python Libraries\n",
                "import numpy as np\n",
                "import pandas as pd\n",
                "import matplotlib.pyplot as plt\n",
                "from sklearn.model_selection import train_test_split\n",
                "from sklearn.preprocessing import StandardScaler\n",
                "from sklearn.linear_model import LinearRegression\n",
                "from sklearn.ensemble import RandomForestRegressor\n",
                "from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error\n",
                "\n",
                "print('Libraries imported successfully!')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 2. Dataset Collection & Satellite Multispectral Signatures\n",
                "Manganese oxides (Pyrolusite $MnO_2$, Braunite, Cryptomelane) display distinctive spectral absorption characteristics:\n",
                "- **Depressed SWIR-2 reflectance (Band 12, ~2190 nm)** due to metal-OH vibration features.\n",
                "- **High Iron Oxide Ratio ($B4 / B2$)** owing to frequent co-precipitation with iron formations (BIF).\n",
                "- **Low NDVI** in exposed outcrop environments.\n",
                "- **Proximity to tectonic shear zones and faults** where hydrothermal enrichment occurred."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Step 2: Load the Manganese Exploration Ground-Truth Dataset\n",
                "df = pd.read_csv('manganese_exploration_data.csv')\n",
                "print('Dataset Shape:', df.shape)\n",
                "df.head()"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Step 3: Exploratory Data Analysis & Summary Statistics\n",
                "print('--- Statistical Summary ---')\n",
                "print(df[['b4_red', 'b8_nir', 'b11_swir1', 'b12_swir2', 'mn_grade_pct', 'reserve_kmt']].describe())\n",
                "\n",
                "# Check distribution by Rock Type\n",
                "print('\\n--- Samples by Geological Rock Type ---')\n",
                "print(df['rock_type'].value_counts())"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 3. Data Cleaning, Feature Engineering & Preprocessing\n",
                "In this step we:\n",
                "1. Clean missing values if present using median imputation.\n",
                "2. Encode categorical rock types (`Gondite`, `BIF`, `Phyllite-Chert`, `Basalt`, etc.) using One-Hot Encoding.\n",
                "3. Compute derived satellite spectral indices (Iron Oxide Index, Ferrous Mineral Index, Clay Mineral Index, MRR, NDVI, NDMI).\n",
                "4. Split the data into 80% Training and 20% Testing sets.\n",
                "5. Standardize numerical features using `StandardScaler` for the Linear Regression baseline."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Step 4: Data Preprocessing with pandas and scikit-learn\n",
                "numeric_features = [\n",
                "    'elevation_m', 'slope_deg', 'lineament_distance_km',\n",
                "    'b2_blue', 'b3_green', 'b4_red', 'b8_nir', 'b11_swir1', 'b12_swir2',\n",
                "    'iron_oxide_idx', 'ferrous_idx', 'clay_idx', 'mrr', 'ndvi', 'ndmi'\n",
                "]\n",
                "\n",
                "# Impute any null values\n",
                "for col in numeric_features:\n",
                "    df[col] = df[col].fillna(df[col].median())\n",
                "\n",
                "# One-Hot Encode geological rock type\n",
                "df_encoded = pd.get_dummies(df, columns=['rock_type'], prefix='rock')\n",
                "feature_cols = [c for c in df_encoded.columns if c in numeric_features or c.startswith('rock_')]\n",
                "\n",
                "X = df_encoded[feature_cols]\n",
                "y = df_encoded['reserve_kmt']\n",
                "\n",
                "# 80/20 Train-Test Split\n",
                "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n",
                "\n",
                "# Scale features for Linear Regression\n",
                "scaler = StandardScaler()\n",
                "X_train_scaled = scaler.fit_transform(X_train)\n",
                "X_test_scaled = scaler.transform(X_test)\n",
                "\n",
                "print(f'Training Samples: {len(X_train)}, Testing Samples: {len(X_test)}')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 4. Model 1: Linear Regression (Baseline)\n",
                "Linear Regression assumes a direct linear combination between satellite bands, geological proximity, and deposit reserve tonnages:\n",
                "$$\\hat{y} = \\beta_0 + \\sum_{i=1}^{p} \\beta_i X_i$$"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Step 5: Fit Linear Regression Baseline\n",
                "lr_model = LinearRegression()\n",
                "lr_model.fit(X_train_scaled, y_train)\n",
                "y_pred_lr = np.clip(lr_model.predict(X_test_scaled), 0, None)\n",
                "\n",
                "r2_lr = r2_score(y_test, y_pred_lr)\n",
                "rmse_lr = np.sqrt(mean_squared_error(y_test, y_pred_lr))\n",
                "mae_lr = mean_absolute_error(y_test, y_pred_lr)\n",
                "\n",
                "print('=== Linear Regression Baseline Results ===')\n",
                "print(f'R2 Score:  {r2_lr:.4f}')\n",
                "print(f'RMSE:      {rmse_lr:.2f} kMT')\n",
                "print(f'MAE:       {mae_lr:.2f} kMT')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 5. Model 2: Random Forest Regression (Non-Linear Ensemble)\n",
                "Mineral formation and spectral reflectance exhibit non-linear physical interactions. Random Forest constructs an ensemble of de-correlated decision trees, capturing complex non-linear mineral band thresholds and host-rock boundaries."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Step 6: Fit Random Forest Regressor\n",
                "rf_model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)\n",
                "rf_model.fit(X_train, y_train)\n",
                "y_pred_rf = rf_model.predict(X_test)\n",
                "\n",
                "r2_rf = r2_score(y_test, y_pred_rf)\n",
                "rmse_rf = np.sqrt(mean_squared_error(y_test, y_pred_rf))\n",
                "mae_rf = mean_absolute_error(y_test, y_pred_rf)\n",
                "\n",
                "print('=== Random Forest Regression Results ===')\n",
                "print(f'R2 Score:  {r2_rf:.4f}')\n",
                "print(f'RMSE:      {rmse_rf:.2f} kMT')\n",
                "print(f'MAE:       {mae_rf:.2f} kMT')\n",
                "\n",
                "print('\\n=== Performance Comparison ===')\n",
                "print(f'R2 Improvement:    {((r2_rf - r2_lr) / r2_lr * 100):.2f}%')\n",
                "print(f'RMSE Error Drop:   {((rmse_lr - rmse_rf) / rmse_lr * 100):.2f}%')"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 6. Visualizing Model Results & Feature Importance\n",
                "Let us plot:\n",
                "1. Actual vs. Predicted Reserve comparison for both models.\n",
                "2. Top Feature Importances from the Random Forest model."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Step 7: Plotting Actual vs Predicted and Feature Importances\n",
                "fig, axes = plt.subplots(1, 2, figsize=(14, 5))\n",
                "\n",
                "# Plot 1: Actual vs Predicted\n",
                "axes[0].scatter(y_test, y_pred_lr, alpha=0.5, color='#3b82f6', label='Linear Regression')\n",
                "axes[0].scatter(y_test, y_pred_rf, alpha=0.7, color='#10b981', label='Random Forest')\n",
                "axes[0].plot([0, max(y_test)], [0, max(y_test)], 'k--', lw=1.5, label='Ideal 1:1 Line')\n",
                "axes[0].set_title('Actual vs. Predicted Manganese Reserve (kMT)')\n",
                "axes[0].set_xlabel('Actual Reserve (kMT)')\n",
                "axes[0].set_ylabel('Predicted Reserve (kMT)')\n",
                "axes[0].legend()\n",
                "axes[0].grid(True, alpha=0.3)\n",
                "\n",
                "# Plot 2: Top Feature Importances\n",
                "importances = pd.Series(rf_model.feature_importances_, index=feature_cols).sort_values(ascending=True).tail(10)\n",
                "importances.plot(kind='barh', ax=axes[1], color='#8b5cf6')\n",
                "axes[1].set_title('Top 10 Feature Importances (Random Forest)')\n",
                "axes[1].set_xlabel('Relative Importance')\n",
                "axes[1].grid(True, alpha=0.3)\n",
                "\n",
                "plt.tight_layout()\n",
                "plt.show()"
            ]
        },
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "### 7. Inference on New Unexplored Satellite Coordinates\n",
                "We can now pass satellite band reflectances and geological features for prospective locations to evaluate estimated manganese deposit reserves."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Step 8: Prospective Location Inference Example\n",
                "sample_target = pd.DataFrame([{\n",
                "    'elevation_m': 460.0,\n",
                "    'slope_deg': 14.5,\n",
                "    'lineament_distance_km': 0.65,  # Close to shear fault\n",
                "    'b2_blue': 0.10, \n",
                "    'b3_green': 0.13,\n",
                "    'b4_red': 0.17,\n",
                "    'b8_nir': 0.22,\n",
                "    'b11_swir1': 0.31,\n",
                "    'b12_swir2': 0.18, # Distinct SWIR2 Mn-oxide absorption\n",
                "    'iron_oxide_idx': 0.17 / 0.10,\n",
                "    'ferrous_idx': 0.18 / 0.22,\n",
                "    'clay_idx': 0.31 / 0.18,\n",
                "    'mrr': (0.31 - 0.17) / (0.31 + 0.17),\n",
                "    'ndvi': (0.22 - 0.17) / (0.22 + 0.17),\n",
                "    'ndmi': (0.22 - 0.31) / (0.22 + 0.31),\n",
                "    **{f'rock_{r}': 1 if r == 'Gondite' else 0 for r in ['Gondite', 'Banded Iron Formation (BIF)', 'Quartzite-Schist', 'Dolomitic Marble', 'Phyllite-Chert', 'Laterite Cap', 'Basalt']}\n",
                "}])[feature_cols]\n",
                "\n",
                "predicted_reserve = rf_model.predict(sample_target)[0]\n",
                "print(f'Target Site Predicted Manganese Reserve: {predicted_reserve:.1f} kMT')\n",
                "if predicted_reserve > 500:\n",
                "    print('Classification: High Priority Commercial Exploration Target')\n",
                "else:\n",
                "    print('Classification: Low Priority Anomalous Mineralization')"
            ]
        }
    ]

    notebook_content = {
        "cells": cells,
        "metadata": {
            "language_info": {
                "name": "python",
                "version": "3.10.12"
            },
            "kernelspec": {
                "name": "python3",
                "display_name": "Python 3"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }

    os.makedirs(os.path.dirname(NOTEBOOK_PATH), exist_ok=True)
    with open(NOTEBOOK_PATH, "w") as f:
        json.dump(notebook_content, f, indent=2)
    print(f"Notebook written to {NOTEBOOK_PATH}")

if __name__ == "__main__":
    build_notebook()
