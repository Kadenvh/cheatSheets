# ═══════════════════════════════════════════════════════════════════
# AMD Stock Price Direction Prediction
# Project: Predict if tomorrow's close will be higher than today's
# Models: Logistic Regression, Random Forest
# ═══════════════════════════════════════════════════════════════════

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# ═══════════════════════════════════════════════════════════════════
# SECTION 1: LOAD AND EXPLORE DATA
# ═══════════════════════════════════════════════════════════════════

data = pd.read_csv("data.csv")
data['date'] = pd.to_datetime(data['date'])

print("="*60)
print("DATASET OVERVIEW")
print("="*60)
print(f"Shape: {data.shape[0]} rows, {data.shape[1]} columns")
print(f"Date range: {data['date'].min().strftime('%Y-%m-%d')} to {data['date'].max().strftime('%Y-%m-%d')}")
print(f"\nColumns: {list(data.columns)}")
print(f"\nMissing values: {data.isnull().sum().sum()}")

# ═══════════════════════════════════════════════════════════════════
# SECTION 2: VISUALIZATION (uncomment to display plots)
# ═══════════════════════════════════════════════════════════════════

"""
# Set style
sns.set_style("whitegrid")

# 2.1: Full price history
plt.figure(figsize=(14, 6))
plt.plot(data['date'], data['close'], linewidth=0.8)
plt.xlabel('Date')
plt.ylabel('Close Price ($)')
plt.title('AMD Stock Price (1980 - Present)')
plt.tight_layout()
plt.savefig('amd_price_history.png', dpi=150)
plt.show()

# 2.2: Volume history
plt.figure(figsize=(14, 4))
plt.bar(data['date'], data['volume'], width=2, alpha=0.7)
plt.xlabel('Date')
plt.ylabel('Volume')
plt.title('AMD Trading Volume')
plt.tight_layout()
plt.savefig('amd_volume_history.png', dpi=150)
plt.show()

# 2.3: Recent data (2023+)
recent = data[data['date'] >= '2023-01-01']
fig, axes = plt.subplots(2, 1, figsize=(14, 8), sharex=True)

axes[0].plot(recent['date'], recent['close'], linewidth=1, color='blue')
axes[0].set_ylabel('Close Price ($)')
axes[0].set_title('AMD Stock Price (2023 - Present)')
axes[0].grid(True, alpha=0.3)

axes[1].bar(recent['date'], recent['volume'], width=1, alpha=0.7, color='gray')
axes[1].set_ylabel('Volume')
axes[1].set_xlabel('Date')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('amd_recent.png', dpi=150)
plt.show()
"""

# ═══════════════════════════════════════════════════════════════════
# SECTION 3: FEATURE ENGINEERING
# ═══════════════════════════════════════════════════════════════════

df = data.copy()
df = df.sort_values('date').reset_index(drop=True)

# Price-based features
df['price_change_pct'] = df['close'].pct_change() * 100
df['daily_range_pct'] = (df['high'] - df['low']) / df['close'] * 100
df['gap_pct'] = (df['open'] - df['close'].shift(1)) / df['close'].shift(1) * 100

# Moving Averages
df['ma_5'] = df['close'].rolling(window=5).mean()
df['ma_10'] = df['close'].rolling(window=10).mean()
df['ma_20'] = df['close'].rolling(window=20).mean()
df['ma_50'] = df['close'].rolling(window=50).mean()

# Price vs Moving Averages (trend position)
df['price_vs_ma20'] = (df['close'] - df['ma_20']) / df['ma_20'] * 100
df['price_vs_ma50'] = (df['close'] - df['ma_50']) / df['ma_50'] * 100
df['ma_5_vs_20'] = (df['ma_5'] - df['ma_20']) / df['ma_20'] * 100

# RSI (Relative Strength Index)
delta = df['close'].diff()
gain = delta.where(delta > 0, 0)
loss = (-delta).where(delta < 0, 0)
avg_gain = gain.rolling(window=14).mean()
avg_loss = loss.rolling(window=14).mean()
rs = avg_gain / avg_loss
df['rsi_14'] = 100 - (100 / (1 + rs))

# MACD (Moving Average Convergence Divergence)
ema_12 = df['close'].ewm(span=12, adjust=False).mean()
ema_26 = df['close'].ewm(span=26, adjust=False).mean()
df['macd'] = ema_12 - ema_26
df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
df['macd_histogram'] = df['macd'] - df['macd_signal']

# Volume features
df['volume_change_pct'] = df['volume'].pct_change() * 100
df['volume_ma_10'] = df['volume'].rolling(window=10).mean()
df['volume_vs_avg'] = (df['volume'] - df['volume_ma_10']) / df['volume_ma_10'] * 100

# Target: will tomorrow's close be higher?
df['target'] = (df['close'].shift(-1) > df['close']).astype(int)

print("\n" + "="*60)
print("ENGINEERED FEATURES")
print("="*60)
new_cols = [col for col in df.columns if col not in data.columns]
print(f"Added {len(new_cols)} features: {new_cols}")

# ═══════════════════════════════════════════════════════════════════
# SECTION 4: PREPARE DATA FOR MODELING
# ═══════════════════════════════════════════════════════════════════

# Define feature columns
feature_columns = [
    'price_change_pct', 'daily_range_pct', 'gap_pct',
    'price_vs_ma20', 'price_vs_ma50', 'ma_5_vs_20',
    'rsi_14', 'macd', 'macd_signal', 'macd_histogram',
    'volume_change_pct', 'volume_vs_avg'
]

# Clean data: drop NaN and infinite values
df_clean = df.dropna()
df_clean = df_clean.replace([np.inf, -np.inf], np.nan).dropna()

X = df_clean[feature_columns]
y = df_clean['target']

print("\n" + "="*60)
print("DATA PREPARATION")
print("="*60)
print(f"Clean samples: {len(df_clean)} (removed {len(df) - len(df_clean)} rows)")
print(f"Features: {len(feature_columns)}")
print(f"Target distribution: {y.mean()*100:.1f}% up days, {(1-y.mean())*100:.1f}% down days")

# Time-based train/test split (no data leakage)
split_ratio = 0.80
split_index = int(len(X) * split_ratio)
split_date = df_clean.iloc[split_index]['date']

X_train, X_test = X.iloc[:split_index], X.iloc[split_index:]
y_train, y_test = y.iloc[:split_index], y.iloc[split_index:]

print(f"\nTrain/Test split at {split_date.strftime('%Y-%m-%d')}:")
print(f"  Training: {len(X_train)} samples")
print(f"  Testing:  {len(X_test)} samples")

# ═══════════════════════════════════════════════════════════════════
# SECTION 5: TRAIN AND EVALUATE MODELS
# ═══════════════════════════════════════════════════════════════════

print("\n" + "="*60)
print("MODEL RESULTS")
print("="*60)

# Baseline: always predict majority class
baseline_acc = max(y_test.mean(), 1 - y_test.mean())
print(f"Baseline (majority class): {baseline_acc*100:.2f}%")

# Logistic Regression
lr_model = LogisticRegression(max_iter=1000, random_state=42)
lr_model.fit(X_train, y_train)
lr_pred = lr_model.predict(X_test)
lr_acc = accuracy_score(y_test, lr_pred)
print(f"Logistic Regression:       {lr_acc*100:.2f}%")

# Random Forest
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)
rf_pred = rf_model.predict(X_test)
rf_acc = accuracy_score(y_test, rf_pred)
print(f"Random Forest:             {rf_acc*100:.2f}%")

# Best model analysis
best_model = "Logistic Regression" if lr_acc > rf_acc else "Random Forest"
best_pred = lr_pred if lr_acc > rf_acc else rf_pred
best_acc = max(lr_acc, rf_acc)

print(f"\nBest model: {best_model} ({best_acc*100:.2f}%)")
print(f"Edge over baseline: {(best_acc - baseline_acc)*100:+.2f}%")

# Confusion Matrix
print("\n" + "="*60)
print(f"CONFUSION MATRIX ({best_model})")
print("="*60)
cm = confusion_matrix(y_test, best_pred)
print(f"                 Predicted")
print(f"                 Down    Up")
print(f"Actual Down      {cm[0,0]:<6}  {cm[0,1]:<6}")
print(f"Actual Up        {cm[1,0]:<6}  {cm[1,1]:<6}")

# Feature Importance (Random Forest)
print("\n" + "="*60)
print("FEATURE IMPORTANCE (Random Forest)")
print("="*60)
importance = sorted(zip(feature_columns, rf_model.feature_importances_),
                    key=lambda x: x[1], reverse=True)
for feature, imp in importance:
    bar = '█' * int(imp * 50)
    print(f"  {feature:20} : {imp:.3f} {bar}")

# ═══════════════════════════════════════════════════════════════════
# SECTION 6: SUMMARY
# ═══════════════════════════════════════════════════════════════════

print("\n" + "="*60)
print("PROJECT SUMMARY")
print("="*60)
print(f"""
Dataset: AMD Stock Price ({data['date'].min().year}-{data['date'].max().year})
Samples: {len(df_clean)} ({len(X_train)} train, {len(X_test)} test)
Target:  Next-day price direction (up/down)

Results:
  Baseline accuracy: {baseline_acc*100:.2f}%
  Best model:        {best_model} ({best_acc*100:.2f}%)

Key insight: Technical indicators alone provide minimal edge for
daily prediction. Next steps could include:
  • Adding fundamental data (earnings, news sentiment)
  • Using sequence models (LSTM) to learn from price history
  • Predicting longer timeframes (weekly/monthly direction)
  • Building a trading strategy with proper risk management
""")