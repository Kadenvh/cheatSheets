tags: [statistics, data-science, descriptive-statistics, learning] created: 2026-02-11 session: Fundamental Math for Data Science - Descriptive Statistics status: processed
Standard Deviation
⚡ Quick Reference
High-density table for immediate syntax recall.

np.std(data) : Calculate σ // Direct standard deviation

variance ** 0.5 : Manual calc // Square root of variance

(x - μ) / σ : Z-Score // Number of standard deviations from mean

σ : Symbol // Represents standard deviation

🧠 Functional Logic
Concept: [[Standard-Deviation]] // A measure of spread that returns units to the original scale by taking the square root of variance.

Dependency: Requires [[Variance]] calculation as a prerequisite.

💻 Implementation
Python
import numpy as np

dataset = [4, 8, 15, 16, 23, 42]

# Direct calculation
std_dev = np.std(dataset)

# Z-Score calculation (How unusual is a data point?)
mean = np.mean(dataset)
data_point = 80
num_std_devs = (data_point - mean) / std_dev
🕸️ Graph Connections
Parents: [[Descriptive-Statistics]]

Children: [[Z-Score]], [[Outlier-Detection]]

Lateral: [[Variance]], [[Normal-Distribution]]

🛠️ Sandbox / To Explore
When should you use population vs. sample standard deviation?

How does standard deviation help with data cleaning and outlier removal?

What's the relationship between standard deviation and confidence intervals?