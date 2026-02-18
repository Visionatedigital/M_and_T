
import pandas as pd

EXCEL_FILE = 'd:/m-t-growth-gateway/public/MT MICROFINANCE Admin 33.xlsx'

try:
    df = pd.read_excel(EXCEL_FILE, header=1)
    print("Columns found in Excel:")
    for col in df.columns:
        print(f"- {col}")
        
    # Check for anything resembling "Group"
    group_cols = [c for c in df.columns if 'group' in str(c).lower()]
    print(f"\nPotential Group Columns: {group_cols}")
    
    if group_cols:
        print("\nSample Group Data:")
        print(df[group_cols].head(10))
        
except Exception as e:
    print(f"Error reading Excel: {e}")
