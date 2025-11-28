import os
import sys
import argparse
import glob

#python combined_tool.py "C:\merged_partition_content\KingJ\NateWisemocha" --mode snapshot --output natewise-website-snapshot.txt
#python combined_tool.py "C:\merged_partition_content\KingJ\NateWisemocha" --output natedwise-website-tree.txt
# Default ignore lists
DEFAULT_IGNORE_DIRS = {
    "node_modules", ".git", ".cache", "dist", "build",
    ".next", ".nuxt", ".venv", "venv", "__pycache__"
}
DEFAULT_IGNORE_FILES = {".log", ".tmp", ".DS_Store", "Thumbs.db"}

# ---------- Tree Generation Functions ----------

def normalize_path(path: str) -> str:
    """Normalize Windows paths safely."""
    return os.path.normpath(os.path.expanduser(path.strip('"')))

def should_ignore_tree(name: str, ignore_dirs, ignore_exts) -> bool:
    """Return True if a file/folder should be ignored for tree generation."""
    if name in ignore_dirs:
        return True
    _, ext = os.path.splitext(name)
    return ext.lower() in ignore_exts

def filter_entries(entries, ignore_dirs, ignore_exts, include_files, include_exts):
    """Filter and sort directory entries: folders first, then files."""
    dirs, files = [], []
    for e in entries:
        if os.path.isdir(e):
            if not should_ignore_tree(os.path.basename(e), ignore_dirs, ignore_exts):
                dirs.append(e)
        else:
            if include_files:
                fname = os.path.basename(e)
                _, ext = os.path.splitext(fname)
                if fname not in DEFAULT_IGNORE_FILES and not should_ignore_tree(fname, ignore_dirs, ignore_exts):
                    if not include_exts or ext.lower() in include_exts:
                        files.append(e)
    return sorted(dirs, key=str.lower), sorted(files, key=str.lower)

def build_tree(root, prefix="", depth=0, max_depth=None,
               include_files=True, include_exts=None,
               ignore_dirs=None, ignore_exts=None):
    """
    Recursively build a folder tree string list.
    """
    lines = []
    try:
        entries = [os.path.join(root, e) for e in os.listdir(root)]
    except PermissionError:
        return [prefix + "[Permission Denied]"]
    except FileNotFoundError:
        return [prefix + "[Not Found]"]

    dirs, files = filter_entries(entries, ignore_dirs, ignore_exts, include_files, include_exts)
    children = dirs + files

    for idx, path in enumerate(children):
        connector = "└─ " if idx == len(children) - 1 else "├─ "
        name = os.path.basename(path)
        if os.path.isdir(path):
            lines.append(prefix + connector + name + "/")
            if max_depth is None or depth + 1 < max_depth:
                extension = "   " if idx == len(children) - 1 else "│  "
                lines.extend(build_tree(
                    path,
                    prefix + extension,
                    depth + 1,
                    max_depth,
                    include_files,
                    include_exts,
                    ignore_dirs,
                    ignore_exts
                ))
        else:
            lines.append(prefix + connector + name)
    return lines

def generate_tree(root, **kwargs):
    """Generate tree for a single root directory."""
    root_name = os.path.basename(normalize_path(root))
    lines = [root_name + "/"]
    lines.extend(build_tree(normalize_path(root), **kwargs))
    return "\n".join(lines)

# ---------- Snapshot Generation Functions ----------

def is_noisy_folder(folder_path):
    """Check if folder should be excluded from snapshot"""
    noisy_folders = {
        'node_modules', '.next', '.git', 'dist', 'build', 
        'coverage', '.nyc_output', '.cache', '.vscode',
        '__pycache__', '.pytest_cache', '.idea', '.DS_Store'
    }
    return any(noisy_part in folder_path for noisy_part in noisy_folders)

def is_relevant_file(file_path):
    """Check if file is relevant source code for snapshot"""
    relevant_extensions = {
        '.ts', '.tsx', '.js', '.jsx', '.py', '.json', 
        '.prisma', '.sql', '.md', '.txt', '.yml', '.yaml',
        '.css', '.scss', '.html', '.env', '.example'
    }
    return any(file_path.endswith(ext) for ext in relevant_extensions)

def should_include_file(file_path):
    """Determine if file should be included in snapshot output"""
    # Skip if in noisy folder
    if is_noisy_folder(file_path):
        return False
    
    # Skip large binary files and dependencies
    skip_files = {
        'package-lock.json', 'yarn.lock', '.DS_Store',
        '*.log', '*.min.js', '*.min.css'
    }
    
    filename = os.path.basename(file_path)
    if any(filename == pattern or filename.endswith(pattern.replace('*', '')) for pattern in skip_files):
        return False
    
    return is_relevant_file(file_path)

def get_file_content(file_path):
    """Read file content with proper encoding handling"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                return f.read()
        except:
            return f"# ERROR: Could not read {file_path} (binary or unsupported encoding)\n\n"
    except Exception as e:
        return f"# ERROR: Could not read {file_path} - {str(e)}\n\n"

def create_project_snapshot(root_dir, output_file='project_snapshot.txt'):
    """Create a comprehensive snapshot of the project code"""
    
    print(f"📁 Creating project snapshot from: {root_dir}")
    print("⏳ Scanning for relevant files...")
    
    # Get all files recursively
    all_files = []
    for root, dirs, files in os.walk(root_dir):
        # Skip noisy directories
        dirs[:] = [d for d in dirs if not is_noisy_folder(os.path.join(root, d))]
        
        for file in files:
            file_path = os.path.join(root, file)
            if should_include_file(file_path):
                all_files.append(file_path)
    
    print(f"📄 Found {len(all_files)} relevant files")
    
    # Sort files for better organization
    all_files.sort()
    
    # Create output file
    with open(output_file, 'w', encoding='utf-8') as outfile:
        # Write header
        outfile.write("=" * 80 + "\n")
        outfile.write("PROJECT SNAPSHOT\n")
        outfile.write("=" * 80 + "\n")
        outfile.write(f"Generated from: {os.path.abspath(root_dir)}\n")
        outfile.write(f"Total files included: {len(all_files)}\n")
        outfile.write("=" * 80 + "\n\n")
        
        # Group files by directory for better organization
        files_by_dir = {}
        for file_path in all_files:
            rel_path = os.path.relpath(file_path, root_dir)
            dir_name = os.path.dirname(rel_path)
            if dir_name not in files_by_dir:
                files_by_dir[dir_name] = []
            files_by_dir[dir_name].append(rel_path)
        
        # Write files organized by directory
        for dir_name in sorted(files_by_dir.keys()):
            outfile.write(f"\n{'=' * 60}\n")
            outfile.write(f"DIRECTORY: {dir_name if dir_name else 'ROOT'}\n")
            outfile.write(f"{'=' * 60}\n\n")
            
            for file_path in sorted(files_by_dir[dir_name]):
                full_path = os.path.join(root_dir, file_path)
                outfile.write(f"{'─' * 40}\n")
                outfile.write(f"FILE: {file_path}\n")
                outfile.write(f"{'─' * 40}\n\n")
                
                content = get_file_content(full_path)
                outfile.write(content)
                outfile.write("\n\n")  # Add spacing between files
    
    print(f"✅ Project snapshot created: {output_file}")
    print(f"📊 Total size: {os.path.getsize(output_file)} bytes")
    
    # Show summary
    print("\n📋 SUMMARY:")
    extensions_count = {}
    for file_path in all_files:
        ext = os.path.splitext(file_path)[1]
        extensions_count[ext] = extensions_count.get(ext, 0) + 1
    
    for ext, count in sorted(extensions_count.items()):
        print(f"  {ext or 'no ext'}: {count} files")
    
    return len(all_files)

# ---------- Combined CLI ----------

def main():
    parser = argparse.ArgumentParser(description="Generate folder trees and project snapshots.")
    parser.add_argument("paths", nargs="+", help="Root directory paths")
    parser.add_argument("--mode", choices=["tree", "snapshot"], default="tree", 
                       help="Operation mode: tree (folder structure) or snapshot (file contents)")
    parser.add_argument("--max-depth", type=int, default=None, help="Limit recursion depth (tree mode only)")
    parser.add_argument("--include-files", action="store_true", default=True, help="Include files (tree mode only)")
    parser.add_argument("--include-exts", type=str, default="", help="Comma-separated list of file extensions to include")
    parser.add_argument("--output", type=str, default=None, help="Output file")
    parser.add_argument("--ignore", type=str, default="", help="Comma-separated list of extra dirs to ignore")

    args = parser.parse_args()

    include_exts = {e.strip().lower() for e in args.include_exts.split(",") if e.strip()} if args.include_exts else set()
    ignore_dirs = DEFAULT_IGNORE_DIRS.union({d.strip() for d in args.ignore.split(",") if d.strip()})
    ignore_exts = DEFAULT_IGNORE_FILES

    for path in args.paths:
        norm_path = normalize_path(path)
        if not os.path.exists(norm_path):
            print(f"Error: Path not found -> {norm_path}", file=sys.stderr)
            continue

        if args.mode == "tree":
            # Tree generation mode
            tree_str = generate_tree(
                norm_path,
                max_depth=args.max_depth,
                include_files=args.include_files,
                include_exts=include_exts,
                ignore_dirs=ignore_dirs,
                ignore_exts=ignore_exts
            )

            print(tree_str)

            out_file = args.output or f"{os.path.basename(norm_path)}-tree.txt"
            try:
                with open(out_file, "w", encoding="utf-8") as f:
                    f.write(tree_str)
                print(f"\n[Saved to {out_file}]\n")
            except OSError as e:
                print(f"Error writing to {out_file}: {e}", file=sys.stderr)

        elif args.mode == "snapshot":
            # Snapshot generation mode
            print("🚀 Project Snapshot Generator")
            print(f"📁 Project root: {norm_path}")
            
            out_file = args.output or f"{os.path.basename(norm_path)}_snapshot.txt"
            
            try:
                file_count = create_project_snapshot(norm_path, out_file)
                
                # Show some stats about the output
                with open(out_file, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    print(f"📄 Output file: {len(lines)} lines")
                    
            except Exception as e:
                print(f"❌ Error: {e}")
                print("💡 Make sure you have read permissions for all files")

if __name__ == "__main__":
    main()

