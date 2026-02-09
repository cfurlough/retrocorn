#!/usr/bin/env python3
"""
Simple HTTP server to run Retrocorn game.
Run this script and open http://localhost:8000 in your browser.
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

# Change to the script's directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

# Add MIME types for game assets
Handler.extensions_map.update({
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.html': 'text/html',
})

print(f"Starting Retrocorn server at http://localhost:{PORT}")
print("Press Ctrl+C to stop the server")
print()

# Open browser
webbrowser.open(f'http://localhost:{PORT}')

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
