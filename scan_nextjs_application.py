import os
import sys
from datetime import datetime

def generate_nextjs_doc(app_name):
    """
    Generates a markdown documentation for a Next.js application.
    The documentation will be saved in the application directory.
    
    Args:
        app_name: Name of the Next.js application to document
    """
    # Check if the application exists
    if not os.path.exists(app_name):
        print(f"❌ Error: The application {app_name} does not exist in the project!")
        sys.exit(1)

    app_path = os.path.abspath(app_name)
    markdown_content = []
    
    # Document header
    markdown_content.extend([
        f"# Documentation of the Next.js application {app_name}",
        f"\n*Documentation generated on {datetime.now().strftime('%d/%m/%Y at %H:%M:%S')}*\n",
        "\n## File Structure\n"
    ])

    # File extensions to document
    valid_extensions = {
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.css': 'css',
        '.scss': 'scss',
        '.json': 'json',
        '.html': 'html',
        '.md': 'markdown',
    }
    
    # Traverse the application files
    for dirpath, dirnames, filenames in os.walk(app_path):
        # Ignore irrelevant directories
        dirnames[:] = [d for d in dirnames if not d.startswith('.') and 
                      d not in ['node_modules', '.next', 'public', 'build', 'dist']]
        
        # Relative path for display
        rel_dir = os.path.relpath(dirpath, app_path)
        if rel_dir != '.':
            markdown_content.append(f"\n### 📁 {rel_dir}\n")
        
        # Sort files for better organization
        filenames.sort()
        
        for filename in filenames:
            ext = os.path.splitext(filename)[1]
            if ext in valid_extensions:
                file_path = os.path.join(dirpath, filename)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read().strip()
                    
                    # Identify important Next.js files
                    file_emoji = '📄'
                    if filename == '_app.js' or filename == '_app.tsx': file_emoji = '⚡'
                    elif filename == '_document.js' or filename == '_document.tsx': file_emoji = '📄'
                    elif filename == 'index.js' or filename == 'index.tsx': file_emoji = '🏠'
                    elif filename == 'api.js' or filename == 'api.ts': file_emoji = '🌐'
                    elif filename == 'next.config.js': file_emoji = '⚙️'
                    elif filename == 'package.json': file_emoji = '📦'
                    elif filename == 'README.md': file_emoji = '📖'
                    
                    markdown_content.extend([
                        f"\n#### {file_emoji} {filename}\n",
                        f"```{valid_extensions[ext]}",
                        content,
                        "```\n"
                    ])
                
                except Exception as e:
                    markdown_content.extend([
                        f"\n#### ❌ {filename}",
                        f"Read error: {str(e)}\n"
                    ])

    # Generate the file in the application directory with version management
    base_filename = f'nextjs_code_{app_name}'
    version = 1
    output_path = os.path.join(app_path, f'{base_filename}_v{version:02d}.md')  # Start directly with v01

    # Increment version if file exists
    while os.path.exists(output_path):
        version += 1
        output_path = os.path.join(app_path, f'{base_filename}_v{version:02d}.md')  # v02, v03, etc.

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(markdown_content))
        
    print(f"✅ Documentation generated: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scan_nextjs_application.py appname")
        sys.exit(1)
    
    app_name = sys.argv[1]
    generate_nextjs_doc(app_name)