#!/usr/bin/env python3
import os
import subprocess
import sys

def convert_svg_to_png(svg_path, png_path, size=400):
    """Convert SVG to PNG using imagemagick or inkscape if available"""
    try:
        # Try using imagemagick convert command
        subprocess.run([
            'convert', 
            '-background', 'transparent',
            '-size', f'{size}x{size}',
            svg_path, 
            png_path
        ], check=True, capture_output=True)
        print(f"Converted {svg_path} -> {png_path}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        try:
            # Try using inkscape
            subprocess.run([
                'inkscape',
                '--export-type=png',
                '--export-width', str(size),
                '--export-height', str(size),
                '--export-filename', png_path,
                svg_path
            ], check=True, capture_output=True)
            print(f"Converted {svg_path} -> {png_path}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"Failed to convert {svg_path} - no suitable converter found")
            return False

def main():
    base_dir = "client/src/assets"
    
    # Find all SVG files
    svg_files = []
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.svg'):
                svg_files.append(os.path.join(root, file))
    
    print(f"Found {len(svg_files)} SVG files to convert")
    
    converted = 0
    for svg_file in svg_files:
        png_file = svg_file.replace('.svg', '.png')
        if convert_svg_to_png(svg_file, png_file):
            converted += 1
    
    print(f"Successfully converted {converted}/{len(svg_files)} files")

if __name__ == "__main__":
    main()