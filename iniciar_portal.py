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

    def do_GET(self):
        # Servir landing.html en la raíz / como página principal
        if self.path in ("/", ""):
            self.send_response(302)
            self.send_header("Location", "/landing.html")
            self.end_headers()
            return
        super().do_GET()

    def log_message(self, format, *args):
        # Log limpio y legible
        print(f"[{self.log_date_time_string()}] {args[0]} - {args[1]}")

def main():
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            url = f"http://localhost:{PORT}/landing.html"
            print("=" * 72)
            print("  TINKUS WISTUS 2026 - PAGINA PRINCIPAL & PORTAL FRATERNAL")
            print(f"  Página Principal (Landing): {url}")
            print(f"  Portal Fraterno: http://localhost:{PORT}/index.html")
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
        print("Abriendo landing.html directamente...")
        webbrowser.open(os.path.join(DIRECTORY, "landing.html"))

if __name__ == "__main__":
    main()
