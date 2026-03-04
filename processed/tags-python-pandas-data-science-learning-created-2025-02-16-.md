tags: [python, pandas, data-science, learning] created: 2025-02-16 session: Exploring Data with Python status: processed
Python Data Exploration: Methods & Lists
⚡ Quick Reference
High-density table for immediate syntax recall.

.lower() : String method // Convert to lowercase

.sort() : List method // Sort ascending in-place

.append(item) : List method // Add item to end of list

reverse=True : Parameter // Sort descending

🧠 Functional Logic
Concept: [[Methods]] // Built-in functions that perform actions (use parentheses).

Concept: [[Attributes]] // Stored information about data (no parentheses).

Dependency: Requires basic [[Python-Variables]] and data structures.

💻 Implementation
Python
# List manipulation
my_list = [10, 5, 8]
my_list.append(12)
my_list.sort(reverse=True) # Result: [12, 10, 8, 5]

# String manipulation
category = "REPAIR"
clean_category = category.lower()
🕸️ Graph Connections
Parents: [[Python-Basics]]

Children: [[List-Manipulation]], [[String-Formatting]]

Lateral: [[Python-Dictionaries]], [[Pandas-Methods]]

🛠️ Sandbox / To Explore
When should I use .describe() vs .value_counts()?

What's the difference between .head() and .tail()?

How do I create visualizations from this data?