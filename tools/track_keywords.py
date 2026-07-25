import csv
import sys
import os

def track_keywords(csv_file):
    if not os.path.exists(csv_file):
        print(f"Error: CSV file not found at {csv_file}")
        return

    keywords = []
    
    with open(csv_file, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            keyword = row.get('Top queries', '')
            
            try:
                clicks = int(row.get('Clicks', 0))
                impressions = int(row.get('Impressions', 0))
                position = float(row.get('Position', 0))
            except ValueError:
                continue
                
            keywords.append({
                'keyword': keyword,
                'clicks': clicks,
                'impressions': impressions,
                'position': position
            })
            
    # Sort by Impressions (descending), then Clicks
    keywords.sort(key=lambda x: (x['impressions'], x['clicks']), reverse=True)
    
    print("=" * 60)
    print("  GHOST AVIATOR - TOP 5 KEYWORDS REPORT  ")
    print("=" * 60)
    print(f"{'Rank':<6} | {'Keyword':<30} | {'Impr.':<7} | {'Clicks':<7} | {'Avg. Pos'}")
    print("-" * 60)
    
    for i, data in enumerate(keywords[:5], 1):
        print(f"{i:<6} | {data['keyword']:<30} | {data['impressions']:<7} | {data['clicks']:<7} | {data['position']:.2f}")
        
    print("=" * 60)

if __name__ == "__main__":
    # Pointing exactly to the extracted file
    target_csv = r"D:\pk\ghost-aviator\gsc-data\Queries.csv"
    track_keywords(target_csv)
