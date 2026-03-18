#!/usr/bin/env python3
import os
import re

def clean_console_from_file(filepath):
    """Remove all console.log/error/warn/info/debug lines from a file"""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            original_content = f.read()
        
        # Pattern to match console statements on entire lines or as part of statements
        # This regex matches: console.log(...), console.error(...) etc. including multi-line
        # We'll do this line by line but track multi-line statements
        
        lines = original_content.split('\n')
        result_lines = []
        i = 0
        
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()
            
            # Skip lines that are just console statements
            if re.match(r'^\s*console\.(log|error|warn|info|debug)\s*\(', line):
                # This line starts with console, check if it's a complete statement
                # Count parentheses
                paren_depth = 0
                j = i
                full_statement = ''
                
                # Find where the statement ends
                while j < len(lines):
                    curr_line = lines[j]
                    full_statement += curr_line + '\n'
                    paren_depth += curr_line.count('(') - curr_line.count(')')
                    
                    if paren_depth <= 0:
                        j += 1
                        break
                    j += 1
                
                # Skip all these lines
                i = j
                continue
            
            # Handle catch handlers with console: .catch(err => console.error(...))
            if '.catch(err' in line and 'console.' in line:
                # Need to extract and keep the .catch part
                # Find where .catch starts
                match = re.search(r'^(\s*)(.*?)\.catch\s*\(\s*\w+\s*=>\s*console\.\w+\s*\(.*?\)\)', line)
                if match:
                    prefix = match.group(1)
                    code_before = match.group(2)
                    # Keep the code before .catch and skip the rest
                    if code_before.strip():
                        result_lines.append(prefix + code_before.strip() + ';')
                    i += 1
                    continue
            
            # Regular line - keep it
            result_lines.append(line)
            i += 1
        
        new_content = '\n'.join(result_lines)
        
        # Clean up excessive blank lines
        new_content = re.sub(r'\n\n\n+', '\n\n', new_content)
        
        if new_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
        
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False

def main():
    project_root = '/Users/mpiyush/Documents/Pixels_web_ dashboard'
    
    extensions = ('.js', '.ts', '.jsx', '.tsx')
    skip_dirs = {'node_modules', '.git', '.next', 'build', 'dist', 'android', 'chunks 2'}
    
    total_files = 0
    cleaned_files = 0
    
    # Process backend
    print("🧹 Processing backend...")
    backend_path = os.path.join(project_root, 'backend')
    for root, dirs, files in os.walk(backend_path):
        # Remove skip directories
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for filename in files:
            if filename.endswith(extensions):
                filepath = os.path.join(root, filename)
                total_files += 1
                if clean_console_from_file(filepath):
                    cleaned_files += 1
                    rel_path = filepath.replace(backend_path, '')
                    print(f"  ✅ {rel_path}")
    
    # Process frontend
    print("\n🧹 Processing frontend...")
    frontend_path = os.path.join(project_root, 'frontend')
    for root, dirs, files in os.walk(frontend_path):
        # Remove skip directories
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for filename in files:
            if filename.endswith(extensions):
                filepath = os.path.join(root, filename)
                total_files += 1
                if clean_console_from_file(filepath):
                    cleaned_files += 1
                    rel_path = filepath.replace(frontend_path, '')
                    if 'src/' in rel_path or 'components/' in rel_path or 'hooks/' in rel_path or 'lib/' in rel_path or '/app/' in rel_path:
                        print(f"  ✅ {rel_path}")
    
    print(f"\n{'='*70}")
    print(f"✅ SUCCESS!")
    print(f"{'='*70}")
    print(f"📊 Total files scanned: {total_files}")
    print(f"📊 Files with console logs removed: {cleaned_files}")
    print(f"{'='*70}\n")

if __name__ == '__main__':
    main()
