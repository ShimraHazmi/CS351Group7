import os
from datetime import datetime

# Path to query log file
QUERY_LOG_FILE = os.path.join(
    os.path.dirname(__file__), 
    'data', 
    'queries.txt'
)

def log_query(query):
    """
    Save a query to the queries.txt file.
    Args:
        query: The search query string
    """

    os.makedirs(os.path.dirname(QUERY_LOG_FILE), exist_ok=True)
    
    try:
        with open(QUERY_LOG_FILE, 'a', encoding='utf-8') as f:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            f.write(f"[{timestamp}] {query}\n")
        return True
    except Exception as e:
        print(f"Error logging query: {e}")
        return False
