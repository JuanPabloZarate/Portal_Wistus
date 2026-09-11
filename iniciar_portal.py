#!/usr/bin/env python3
"""
Servidor local ultraligero sin dependencias externas para Portal Fraternal Entrada Universitaria La Paz 2026.
Compatible con Python 3.x nativo.
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Log limpio y legible
        print(f"[{self.log_date_time_string()}] {args[0]} - {args[1]}")

def main():
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            url = f"http://localhost:{PORT}/index.html"
            print("=" * 72)
            print("  PORTAL FRATERNAL TINKUS WISTUS - ENTRADA UNIVERSITARIA LA PAZ 2026")
            print(f"  Servidor activo en: {url}")
            print("  Presione CTRL+C en esta ventana para detener el servidor.")
            print("=" * 72)
            try:
                webbrowser.open(url)
            except Exception:
                pass
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido correctamente.")
        sys.exit(0)
    except Exception as e:
        print(f"\nError iniciando servidor en puerto {PORT}: {e}")
        print("Abriendo index.html directamente...")
        webbrowser.open(os.path.join(DIRECTORY, "index.html"))

if __name__ == "__main__":
    main()
