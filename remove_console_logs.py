#!/usr/bin/env python3
import os
import re
from pathlib import Path

def remove_console_logs_v2(file_path):
    """Remove all console.log/error/warn/info/debug statements from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Split into lines
        lines = content.split('\n')
        new_lines = []
        i = 0
        
        while i < len(lines):
            line = lines[i]
            
            # Check if line contains console statement
            if re.search(r'console\.(log|error|warn|info|debug)\s*\(', line):
                # Find the full extent of the statement
                statement_lines = [i]
                
                # Count parentheses to find where statement ends
                full_text = line
                paren_count = full_text.count('(') - full_text.count(')')
                
                j = i + 1
                while paren_count > 0 and j < len(lines):
                    full_text += '\n' + lines[j]
                    paren_count += lines[j].count('(') - lines[j].count(')')
                    statement_lines.append(j)
                    j += 1
                
                # Check if it's part of a catch handler - then just skip the console line
                # Pattern: }).catch(err => console.log(...))
                if i > 0 and re.search(r'\.catch\s*\(\s*err\s*=>', lines[i-1]):
                    # This is a catch handler, remove this entire console line
                    i = j
                    continue
                
                # Check if there's code before console statement on the same line
                before_console = re.match(r'^(\s*)(.+?)(console\.(log|error|warn|info|debug)\s*\()', line)
                if before_console and before_console.group(2).strip() and not before_console.group(2).strip().startswith('//'):
                    # There's actual code before console, so we need to keep the line structure
                    # Extract the part before console
                    indent = before_console.group(1)
                    code_before = before_console.group(2).strip()
                    
                    # Check if code_before ends with something that needs the console statement
                    # e.g., ').catch(err => console.error(...))' - in this case we might need to handle it
                    if code_before.endswith('.catch(err =>'):
                        # Just skip the console part, but reconstruct the line
                        # Actually for catch handlers, we can just skip the entire console part
                        i = j
                        continue
                    else:
                        # Keep the code before part
                        new_lines.append(indent + code_before)
                        i = j
                        continue
                
                # No code before, just skip this console statement entirely
                i = j
                continue
            
            # Regular line, keep it
            new_lines.append(line)
            i += 1
        
        new_content = '\n'.join(new_lines)
        
        # Clean up excessive blank lines
        while '\n\n\n' in new_content:
            new_content = new_content.replace('\n\n\n', '\n\n')
        
        if original_content != new_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def process_directory(directory, extensions=['.js', '.jsx', '.ts', '.tsx']):
    """Process all files in a directory"""
    count = 0
    total = 0
    
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and other non-essential directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build', '.next', 'chunks 2', 'android']]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_path = os.path.join(root, file)
                total += 1
                if remove_console_logs_v2(file_path):
                    count += 1
                    # Only print for core files, not every file
                    if 'src/' in file_path or 'components/' in file_path or 'app/' in file_path or 'lib/' in file_path or 'hooks/' in file_path:
                        print(f"✅ {file_path.split('/')[-1]}")
    
    return count, total

# Main execution
if __name__ == '__main__':
    project_root = '/Users/mpiyush/Documents/Pixels_web_ dashboard'
    
    print("🧹 Removing console logs from backend...\n")
    backend_path = os.path.join(project_root, 'backend')
    backend_cleaned, backend_total = process_directory(backend_path)
    
    print(f"\n🧹 Removing console logs from frontend...\n")
    frontend_path = os.path.join(project_root, 'frontend')
    frontend_cleaned, frontend_total = process_directory(frontend_path)
    
    print(f"\n{'='*60}")
    print(f"📊 SUMMARY:")
    print(f"{'='*60}")
    print(f"✅ Backend: {backend_cleaned}/{backend_total} files cleaned")
    print(f"✅ Frontend: {frontend_cleaned}/{frontend_total} files cleaned")
    print(f"✅ Total: {backend_cleaned + frontend_cleaned}/{backend_total + frontend_total} files cleaned")
    print(f"{'='*60}\n")
