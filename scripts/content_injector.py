#!/usr/bin/env python3
"""
NATED Engineering Content Injector
Automatically processes LLM-generated SQL and injects into database
"""

import sqlite3
import re
import json
import os
from pathlib import Path
from typing import Dict, List, Tuple

class ContentInjector:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        
    def execute_sql_file(self, file_path: str) -> Dict:
        """Execute SQL file and return results with validation"""
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Split into individual statements
        statements = self._split_sql_statements(sql_content)
        
        results = {
            'total_statements': len(statements),
            'successful': 0,
            'failed': 0,
            'errors': [],
            'inserted_ids': {}
        }
        
        for i, statement in enumerate(statements):
            if not statement.strip():
                continue
                
            try:
                cursor = self.conn.cursor()
                cursor.execute(statement)
                
                if statement.strip().upper().startswith('INSERT'):
                    results['successful'] += 1
                    last_id = cursor.lastrowid
                    # Extract table name for tracking
                    table_match = re.search(r'INSERT INTO (\w+)', statement, re.IGNORECASE)
                    if table_match:
                        table_name = table_match.group(1)
                        if table_name not in results['inserted_ids']:
                            results['inserted_ids'][table_name] = []
                        results['inserted_ids'][table_name].append(last_id)
                
            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'statement': i + 1,
                    'error': str(e),
                    'sql': statement[:100] + '...' if len(statement) > 100 else statement
                })
                print(f"❌ Error in statement {i+1}: {e}")
        
        self.conn.commit()
        return results
    
    def _split_sql_statements(self, sql_content: str) -> List[str]:
        """Split SQL content into individual statements"""
        # Remove comments
        sql_content = re.sub(r'--.*$', '', sql_content, flags=re.MULTILINE)
        sql_content = re.sub(r'/\*.*?\*/', '', sql_content, flags=re.DOTALL)
        
        # Split on semicolons, but not within quotes or parentheses
        statements = []
        current = ""
        paren_depth = 0
        in_quote = False
        quote_char = None
        
        for char in sql_content:
            if char in ['"', "'"] and not in_quote:
                in_quote = True
                quote_char = char
            elif char == quote_char and in_quote:
                in_quote = False
                quote_char = None
            elif char == '(' and not in_quote:
                paren_depth += 1
            elif char == ')' and not in_quote:
                paren_depth -= 1
            elif char == ';' and not in_quote and paren_depth == 0:
                statements.append(current.strip())
                current = ""
                continue
            
            current += char
        
        if current.strip():
            statements.append(current.strip())
            
        return [s for s in statements if s and not s.isspace()]
    
    def get_content_stats(self) -> Dict:
        """Get current database content statistics"""
        cursor = self.conn.cursor()
        
        stats = {}
        tables = ['subjects', 'modules', 'topics', 'skills', 'questions']
        
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) as count FROM {table} WHERE is_active = 1")
            stats[table] = cursor.fetchone()['count']
        
        return stats
    
    def backup_database(self, backup_path: str):
        """Create database backup before injection"""
        backup_conn = sqlite3.connect(backup_path)
        self.conn.backup(backup_conn)
        backup_conn.close()
        print(f"✅ Database backed up to: {backup_path}")

def find_database_file():
    """Find the SQLite database file in common locations"""
    possible_paths = [
        ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/",  # Local development
        ".wrangler/state/v3/d1/",  # Alternative location
        "./"  # Current directory
    ]
    
    for base_path in possible_paths:
        if os.path.exists(base_path):
            for file in os.listdir(base_path):
                if file.endswith('.sqlite'):
                    return os.path.join(base_path, file)
    
    return None

def main():
    print("🚀 NATED Content Injector Starting...")
    
    # Find database file automatically
    db_path = find_database_file()
    
    if not db_path:
        print("❌ Could not find database file automatically.")
        print("Please specify the path to your SQLite database file:")
        db_path = input("Database path: ").strip()
        
        if not os.path.exists(db_path):
            print(f"❌ Database file not found: {db_path}")
            return
    
    print(f"📁 Using database: {db_path}")
    
    # Initialize injector
    injector = ContentInjector(db_path)
    
    # Create backup
    backup_dir = "database_backups"
    os.makedirs(backup_dir, exist_ok=True)
    backup_path = os.path.join(backup_dir, f"backup_before_injection.sqlite")
    injector.backup_database(backup_path)
    
    # Show current stats
    print("\n📊 Current Database Statistics:")
    current_stats = injector.get_content_stats()
    for table, count in current_stats.items():
        print(f"  {table}: {count}")
    
    # Process SQL files
    sql_content_dir = "generated_content"
    if not os.path.exists(sql_content_dir):
        print(f"\n📁 Creating {sql_content_dir} directory...")
        os.makedirs(sql_content_dir)
        print(f"✅ Please place your SQL files in the '{sql_content_dir}' folder")
        print(f"   Then run this script again.")
        injector.conn.close()
        return
    
    sql_files = list(Path(sql_content_dir).glob("*.sql"))
    
    if not sql_files:
        print(f"\n❌ No SQL files found in {sql_content_dir}")
        print(f"Please add SQL files to the '{sql_content_dir}' folder.")
        injector.conn.close()
        return
    
    print(f"\n📁 Found {len(sql_files)} SQL file(s) to process:")
    for sql_file in sql_files:
        print(f"  - {sql_file.name}")
    
    total_results = {
        'files_processed': 0,
        'total_statements': 0,
        'successful': 0,
        'failed': 0
    }
    
    # Process each SQL file
    for sql_file in sql_files:
        print(f"\n🔄 Processing: {sql_file.name}")
        results = injector.execute_sql_file(str(sql_file))
        
        total_results['files_processed'] += 1
        total_results['total_statements'] += results['total_statements']
        total_results['successful'] += results['successful']
        total_results['failed'] += results['failed']
        
        print(f"  📝 Statements: {results['total_statements']}")
        print(f"  ✅ Successful: {results['successful']}")
        print(f"  ❌ Failed: {results['failed']}")
        
        if results['errors']:
            print("  ⚠️  Errors (first 3):")
            for error in results['errors'][:3]:
                print(f"    - Statement {error['statement']}: {error['error']}")
    
    # Show final statistics
    print(f"\n🎉 INJECTION COMPLETE")
    print("=" * 50)
    print(f"📁 Files processed: {total_results['files_processed']}")
    print(f"📝 Total statements: {total_results['total_statements']}")
    print(f"✅ Successful: {total_results['successful']}")
    print(f"❌ Failed: {total_results['failed']}")
    
    print("\n📊 Database Statistics Comparison:")
    new_stats = injector.get_content_stats()
    for table in ['subjects', 'modules', 'topics', 'skills', 'questions']:
        old_count = current_stats.get(table, 0)
        new_count = new_stats.get(table, 0)
        growth = new_count - old_count
        print(f"  {table}: {old_count} → {new_count} (+{growth})")
    
    injector.conn.close()
    print(f"\n✅ All operations completed successfully!")
    print(f"💾 Backup saved as: {backup_path}")

if __name__ == "__main__":
    main()