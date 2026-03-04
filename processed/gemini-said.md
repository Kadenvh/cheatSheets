
Gemini said
tags: [python, pandas, data-science, learning] created: 2025-02-16 session: Exploring Data with Python status: processed
Data Exploration with Pandas
⚡ Quick Reference
High-density table for immediate syntax recall.

import pandas as pd : Load library // Standard alias

pd.read_csv('file.csv') : Load data // Creates a DataFrame

.head(n=5) : View top rows // Defaults to 5 rows

.dtypes : Check data types // Attribute: No parentheses

.value_counts() : Count categories // Defaults to descending order

.describe() : Statistical summary // Works for numeric and text data

🧠 Functional Logic
Concept: [[DataFrame]] // 2D table-like structure with rows and columns.

Concept: [[Series]] // 1D column extracted from a DataFrame.

Dependency: Requires the pandas library and typically a .csv source file.

💻 Implementation
Python
import pandas as pd
repair = pd.read_csv('repair.csv')

# Accessing data
single_col = repair['product_category']              # Series
multi_col = repair[['country', 'product_category']]  # DataFrame

# Analysis patterns
repair['repair_status'].value_counts(normalize=True)  # Percentages
repair['product_age'].describe()                      # Numeric stats
🕸️ Graph Connections
Parents: [[Python-for-Data-Science]]

Children: [[DataFrame-Filtering]], [[Data-Cleaning]]

Lateral: [[Python-Lists]], [[Python-Dictionaries]]

🛠️ Sandbox / To Explore
How do I filter DataFrames to show only specific rows?

What are the best practices for handling missing data?

How can I combine data from multiple columns?