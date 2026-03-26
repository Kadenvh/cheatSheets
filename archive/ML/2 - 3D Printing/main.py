# ═══════════════════════════════════════════════════════════════════
# 2 - 3D Printing Analysis
# Project: Predict print quality from printer settings
# ═══════════════════════════════════════════════════════════════════

import pandas as pd

# Load the dataset
df = pd.read_csv("data.csv")

# ───────────────────────────────────────────────────────────────────
# SECTION 1: INITIAL EXPLORATION
# ───────────────────────────────────────────────────────────────────
print("="*60)
print("DATASET SHAPE")
print("="*60)
print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")

print("\n" + "="*60)
print("COLUMN NAMES & DATA TYPES")
print("="*60)
print(df.dtypes)

print("\n" + "="*60)
print("FIRST 10 ROWS")
print("="*60)
print(df.head(10))

print("\n" + "="*60)
print("STATISTICAL SUMMARY")
print("="*60)
print(df.describe())

print("\n" + "="*60)
print("MISSING VALUES")
print("="*60)
print(df.isnull().sum())

print("\n" + "="*60)
print("COLUMN NAMES (for reference)")
print("="*60)
for i, col in enumerate(df.columns):
    print(f"  {i}: {col}")

# ═══════════════════════════════════════════════════════════════════
# SECTION 2: VISUALIZATION
# ═══════════════════════════════════════════════════════════════════

import matplotlib.pyplot as plt
import seaborn as sns

# Set style for cleaner plots
sns.set_style("whitegrid")

# ───────────────────────────────────────────────────────────────────
# 2.1: Distribution of target variables
# ───────────────────────────────────────────────────────────────────
"""
fig, axes = plt.subplots(1, 3, figsize=(14, 4))

targets = ['roughness', 'tension_strenght', 'elongation']
for i, target in enumerate(targets):
    axes[i].hist(df[target], bins=10, edgecolor='black', alpha=0.7)
    axes[i].set_xlabel(target)
    axes[i].set_ylabel('Count')
    axes[i].set_title(f'Distribution of {target}')


plt.tight_layout()
plt.savefig('target_distributions.png', dpi=150)
plt.show()

# ───────────────────────────────────────────────────────────────────
# 2.2: Correlation heatmap (numeric columns only)
# ───────────────────────────────────────────────────────────────────

# Select only numeric columns for correlation
numeric_df = df.select_dtypes(include=['float64', 'int64'])
correlation_matrix = numeric_df.corr()

plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0,
            fmt='.2f', square=True, linewidths=0.5)
plt.title('Correlation Matrix: Settings vs Quality Metrics')
plt.tight_layout()
plt.savefig('correlation_heatmap.png', dpi=150)
plt.show()

# ───────────────────────────────────────────────────────────────────
# 2.3: Material comparison (categorical variable)
# ───────────────────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 3, figsize=(14, 4))

for i, target in enumerate(targets):
    sns.boxplot(data=df, x='material', y=target, ax=axes[i])
    axes[i].set_title(f'{target} by Material')

plt.tight_layout()
plt.savefig('material_comparison.png', dpi=150)
plt.show()

# ───────────────────────────────────────────────────────────────────
# 2.4: Infill pattern comparison
# ───────────────────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 3, figsize=(14, 4))

for i, target in enumerate(targets):
    sns.boxplot(data=df, x='infill_pattern', y=target, ax=axes[i])
    axes[i].set_title(f'{target} by Infill Pattern')

plt.tight_layout()
plt.savefig('infill_comparison.png', dpi=150)
plt.show()

# ───────────────────────────────────────────────────────────────────
# 2.5: Key scatter plots
# ───────────────────────────────────────────────────────────────────
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Layer height vs roughness (expect positive correlation)
axes[0, 0].scatter(df['layer_height'], df['roughness'], alpha=0.6)
axes[0, 0].set_xlabel('Layer Height (mm)')
axes[0, 0].set_ylabel('Roughness (µm)')
axes[0, 0].set_title('Layer Height vs Surface Roughness')

# Wall thickness vs tension strength (expect positive correlation)
axes[0, 1].scatter(df['wall_thickness'], df['tension_strenght'], alpha=0.6)
axes[0, 1].set_xlabel('Wall Thickness')
axes[0, 1].set_ylabel('Tension Strength (MPa)')
axes[0, 1].set_title('Wall Thickness vs Strength')

# Infill density vs tension strength
axes[1, 0].scatter(df['infill_density'], df['tension_strenght'], alpha=0.6)
axes[1, 0].set_xlabel('Infill Density (%)')
axes[1, 0].set_ylabel('Tension Strength (MPa)')
axes[1, 0].set_title('Infill Density vs Strength')

# Print speed vs roughness
axes[1, 1].scatter(df['print_speed'], df['roughness'], alpha=0.6)
axes[1, 1].set_xlabel('Print Speed (mm/s)')
axes[1, 1].set_ylabel('Roughness (µm)')
axes[1, 1].set_title('Print Speed vs Surface Roughness')

plt.tight_layout()
plt.savefig('scatter_plots.png', dpi=150)
plt.show()
"""
#═══════════════════════════════════════════════════════════════════
# SECTION 3: PREDICTIVE MODELING
# ═══════════════════════════════════════════════════════════════════

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# ───────────────────────────────────────────────────────────────────
# 3.1: Prepare the data
# ───────────────────────────────────────────────────────────────────

# Define features (X) and target (y)
# For now, use only numeric features — we'll handle categorical later
numeric_features = ['layer_height', 'wall_thickness', 'infill_density',
                    'nozzle_temperature', 'bed_temperature', 'print_speed',
                    'fan_speed']

X = df[numeric_features]
y = df['tension_strenght']

print("="*60)
print("FEATURE MATRIX (X)")
print("="*60)
print(f"Shape: {X.shape}")
print(f"Features: {list(X.columns)}")

print("\n" + "="*60)
print("TARGET VARIABLE (y)")
print("="*60)
print(f"Shape: {y.shape}")
print(f"Predicting: tension_strenght")

# ───────────────────────────────────────────────────────────────────
# 3.2: Split into training and testing sets
# ───────────────────────────────────────────────────────────────────

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,      # 20% for testing, 80% for training
    random_state=42     # Makes the split reproducible
)

print("="*60)
print("TRAIN/TEST SPLIT")
print("="*60)
print(f"Training samples: {X_train.shape[0]}")
print(f"Testing samples:  {X_test.shape[0]}")

# ───────────────────────────────────────────────────────────────────
# 3.3: Train a Linear Regression model
# ───────────────────────────────────────────────────────────────────

# Create the model
model = LinearRegression()

# Train it on the training data
model.fit(X_train, y_train)

print("="*60)
print("MODEL TRAINED")
print("="*60)
print("Linear Regression coefficients (how much each feature matters):\n")

for feature, coef in zip(numeric_features, model.coef_):
    print(f"  {feature:20} : {coef:+.4f}")

print(f"\n  {'intercept':20} : {model.intercept_:+.4f}")

# ───────────────────────────────────────────────────────────────────
# 3.4: Evaluate the model
# ───────────────────────────────────────────────────────────────────

# Make predictions on the test set
y_pred = model.predict(X_test)

# Calculate metrics
mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5  # Root mean squared error
r2 = r2_score(y_test, y_pred)

print("="*60)
print("MODEL PERFORMANCE")
print("="*60)
print(f"Mean Squared Error (MSE):  {mse:.2f}")
print(f"Root MSE (RMSE):           {rmse:.2f} MPa")
print(f"R² Score:                  {r2:.4f}")

print("\n" + "="*60)
print("PREDICTIONS vs ACTUAL")
print("="*60)
print(f"{'Actual':>10} {'Predicted':>10} {'Error':>10}")
print("-"*32)
for actual, pred in zip(y_test, y_pred):
    error = pred - actual
    print(f"{actual:>10.1f} {pred:>10.1f} {error:>+10.1f}")

# ───────────────────────────────────────────────────────────────────
# 3.5: Add categorical variables (one-hot encoding)
# ───────────────────────────────────────────────────────────────────

# One-hot encoding converts categories to numbers:
#   material: 'abs' → [1, 0]
#   material: 'pla' → [0, 1]

# pd.get_dummies() does this automatically
df_encoded = pd.get_dummies(df, columns=['material', 'infill_pattern'])

print("="*60)
print("ONE-HOT ENCODED COLUMNS")
print("="*60)
print(df_encoded.columns.tolist())

# ───────────────────────────────────────────────────────────────────
# 3.6: Retrain with all features (including encoded categories)
# ───────────────────────────────────────────────────────────────────

# Define all features (excluding target variables)
feature_columns = ['layer_height', 'wall_thickness', 'infill_density',
                   'nozzle_temperature', 'bed_temperature', 'print_speed',
                   'fan_speed', 'material_abs', 'material_pla',
                   'infill_pattern_grid', 'infill_pattern_honeycomb']

X_full = df_encoded[feature_columns]
y = df_encoded['tension_strenght']

# Split again (same random_state for consistency)
X_train, X_test, y_train, y_test = train_test_split(
    X_full, y, test_size=0.2, random_state=42
)

# Train new model
model_full = LinearRegression()
model_full.fit(X_train, y_train)

# Evaluate
y_pred = model_full.predict(X_test)
rmse = mean_squared_error(y_test, y_pred) ** 0.5
r2 = r2_score(y_test, y_pred)

print("="*60)
print("MODEL WITH CATEGORICAL FEATURES")
print("="*60)
print(f"RMSE:     {rmse:.2f} MPa")
print(f"R² Score: {r2:.4f}")

print("\n" + "="*60)
print("UPDATED COEFFICIENTS")
print("="*60)
for feature, coef in zip(feature_columns, model_full.coef_):
    print(f"  {feature:25} : {coef:+.4f}")

print("\n" + "="*60)
print("PREDICTIONS vs ACTUAL (with categories)")
print("="*60)
print(f"{'Actual':>10} {'Predicted':>10} {'Error':>10}")
print("-"*32)
for actual, pred in zip(y_test, y_pred):
    error = pred - actual
    print(f"{actual:>10.1f} {pred:>10.1f} {error:>+10.1f}")

# ───────────────────────────────────────────────────────────────────
# 3.7: Try a Random Forest (handles non-linear relationships)
# ───────────────────────────────────────────────────────────────────

from sklearn.ensemble import RandomForestRegressor

# Create and train
rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

# Evaluate
y_pred_rf = rf_model.predict(X_test)
rmse_rf = mean_squared_error(y_test, y_pred_rf) ** 0.5
r2_rf = r2_score(y_test, y_pred_rf)

print("="*60)
print("RANDOM FOREST MODEL")
print("="*60)
print(f"RMSE:     {rmse_rf:.2f} MPa")
print(f"R² Score: {r2_rf:.4f}")

print("\n" + "="*60)
print("FEATURE IMPORTANCE (what the model relies on)")
print("="*60)
importance = list(zip(feature_columns, rf_model.feature_importances_))
importance.sort(key=lambda x: x[1], reverse=True)
for feature, imp in importance:
    bar = '█' * int(imp * 50)
    print(f"  {feature:25} : {imp:.3f} {bar}")

print("\n" + "="*60)
print("PREDICTIONS vs ACTUAL (Random Forest)")
print("="*60)
print(f"{'Actual':>10} {'Predicted':>10} {'Error':>10}")
print("-"*32)
for actual, pred in zip(y_test, y_pred_rf):
    error = pred - actual
    print(f"{actual:>10.1f} {pred:>10.1f} {error:>+10.1f}")

# ═══════════════════════════════════════════════════════════════════
# SECTION 4: SUMMARY AND SAVE MODEL
# ═══════════════════════════════════════════════════════════════════

import joblib

print("="*60)
print("PROJECT SUMMARY")
print("="*60)
print("""
Dataset: 3D Printer Settings → Quality Metrics
Samples: 50 (40 train, 10 test)
Target:  Tensile Strength (MPa)

Model Comparison:
─────────────────────────────────────────
  Linear Regression:     R² = 0.44, RMSE = 6.85 MPa
  Random Forest:         R² = 0.58, RMSE = 5.91 MPa  ← Best

Key Findings:
─────────────────────────────────────────
  1. Infill density is the strongest predictor of strength
  2. Nozzle temperature matters (likely proxy for material)
  3. Wall thickness and layer height also contribute
  4. Infill pattern (grid vs honeycomb) has minimal impact
  5. Material effect is confounded with temperature settings

Limitations:
─────────────────────────────────────────
  - Only 50 samples — model may not generalize well
  - Some predictions still off by 5-10 MPa
  - Would need more data for production use
""")

# Save the best model
joblib.dump(rf_model, 'rf_tensile_strength_model.joblib')
print("Model saved to: rf_tensile_strength_model.joblib")

# Save the feature columns (needed for predictions later)
joblib.dump(feature_columns, 'feature_columns.joblib')
print("Feature columns saved to: feature_columns.joblib")

# ═══════════════════════════════════════════════════════════════════
# SECTION 5: FINDING OPTIMAL SETTINGS
# ═══════════════════════════════════════════════════════════════════

import numpy as np

# ───────────────────────────────────────────────────────────────────
# 5.1: Define the search space (realistic ranges from the dataset)
# ───────────────────────────────────────────────────────────────────

# Generate all combinations of settings to try
layer_heights = [0.02, 0.06, 0.10, 0.15, 0.20]
wall_thicknesses = [1, 3, 5, 7, 10]
infill_densities = [20, 40, 60, 80, 100]
nozzle_temps = [180, 200, 220, 240, 260]
bed_temps = [40, 50, 60, 70, 80]
print_speeds = [40, 60, 80, 100]
fan_speeds = [20, 40, 60, 80, 100]
materials = ['abs', 'pla']
infill_patterns = ['grid', 'honeycomb']

# Build all combinations
combinations = []
for lh in layer_heights:
    for wt in wall_thicknesses:
        for inf in infill_densities:
            for nt in nozzle_temps:
                for bt in bed_temps:
                    for ps in print_speeds:
                        for fs in fan_speeds:
                            for mat in materials:
                                for ip in infill_patterns:
                                    combinations.append({
                                        'layer_height': lh,
                                        'wall_thickness': wt,
                                        'infill_density': inf,
                                        'nozzle_temperature': nt,
                                        'bed_temperature': bt,
                                        'print_speed': ps,
                                        'fan_speed': fs,
                                        'material': mat,
                                        'infill_pattern': ip
                                    })

print(f"Testing {len(combinations):,} combinations...")

# ───────────────────────────────────────────────────────────────────
# 5.2: Convert to DataFrame and encode
# ───────────────────────────────────────────────────────────────────

df_search = pd.DataFrame(combinations)

# One-hot encode (must match training format)
df_search_encoded = pd.get_dummies(df_search, columns=['material', 'infill_pattern'])

# Ensure columns match training data (same order)
X_search = df_search_encoded[feature_columns]

# ───────────────────────────────────────────────────────────────────
# 5.3: Predict strength for all combinations
# ───────────────────────────────────────────────────────────────────

predictions = rf_model.predict(X_search)
df_search['predicted_strength'] = predictions

# ───────────────────────────────────────────────────────────────────
# 5.4: Find the best settings
# ───────────────────────────────────────────────────────────────────

# Sort by predicted strength (highest first)
df_sorted = df_search.sort_values('predicted_strength', ascending=False)

print("\n" + "="*60)
print("TOP 5 SETTINGS FOR MAXIMUM TENSILE STRENGTH")
print("="*60)

for i, (_, row) in enumerate(df_sorted.head(5).iterrows()):
    print(f"\n#{i+1} — Predicted Strength: {row['predicted_strength']:.1f} MPa")
    print(f"    Layer Height:     {row['layer_height']} mm")
    print(f"    Wall Thickness:   {row['wall_thickness']}")
    print(f"    Infill Density:   {row['infill_density']}%")
    print(f"    Nozzle Temp:      {row['nozzle_temperature']}°C")
    print(f"    Bed Temp:         {row['bed_temperature']}°C")
    print(f"    Print Speed:      {row['print_speed']} mm/s")
    print(f"    Fan Speed:        {row['fan_speed']}%")
    print(f"    Material:         {row['material'].upper()}")
    print(f"    Infill Pattern:   {row['infill_pattern']}")

print("\n" + "="*60)
print("WORST 3 SETTINGS (for comparison)")
print("="*60)

for i, (_, row) in enumerate(df_sorted.tail(3).iterrows()):
    print(f"\n#{i+1} — Predicted Strength: {row['predicted_strength']:.1f} MPa")
    print(f"    Layer Height:     {row['layer_height']} mm")
    print(f"    Infill Density:   {row['infill_density']}%")
    print(f"    Material:         {row['material'].upper()}")