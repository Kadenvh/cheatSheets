tags: [variance, statistics, data-science, descriptive-statistics, learning] created: 2026-02-11 session: Fundamental Math for Data Science - Variance status: processed
Variance
⚡ Quick Reference
High-density table for immediate syntax recall.

np.var(data) : Calculate σ² // Returns variance of dataset

σ² : Symbol // Sigma squared

Σ(X - μ)² / N : Formula // Average of squared differences

Small Variance : Clustered data // Points near the mean

🧠 Functional Logic
Concept: [[Variance]] // A numerical measure of spread that squares differences from the mean to ensure all values are positive.

Dependency: Requires the [[Mean]] (μ) for calculation.

💻 Implementation
Python
import numpy as np

grades = [88, 82, 85, 84, 90]

# Method 1: NumPy (Recommended)
variance = np.var(grades)

# Method 2: Manual Logic
mean = np.mean(grades)
squared_diffs = [(x - mean)**2 for x in grades]
manual_variance = sum(squared_diffs) / len(grades)
🕸️ Graph Connections
Parents: [[Descriptive-Statistics]]

Children: [[Standard-Deviation]]

Lateral: [[Mean]], [[Data-Spread]], [[Normal-Distribution]]

🛠️ Sandbox / To Explore
How does variance behave with outliers?

When would you use sample variance (N-1) vs population variance (N)?

How do you compare variances across datasets with different units?