
import pandas as pd
import json
import os

EXCEL_FILE = 'd:/m-t-growth-gateway/public/MT MICROFINANCE Admin 33.xlsx'
OUTPUT_FILE = 'd:/m-t-growth-gateway/loans.json'

def convert():
    try:
        # Read Excel using pandas, skipping the first row (header=1) as seen in analysis
        df = pd.read_excel(EXCEL_FILE, header=1)
        
        # Fill NaN with empty string or appropriate nulls to make it JSON serializable
        df = df.fillna('')
        
        # Convert to dictionary records
        records = df.to_dict(orient='records')
        
        # Save to JSON
        with open(OUTPUT_FILE, 'w') as f:
            json.dump(records, f, indent=2, default=str)
            
        print(f"Successfully converted {len(records)} rows to {OUTPUT_FILE}")
        
    except Exception as e:
        print(f"Error converting file: {e}")

if __name__ == '__main__':
    convert()
