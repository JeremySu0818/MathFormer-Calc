import sys
import json
import threading
import mathformer
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class CalculatorHandler(BaseHTTPRequestHandler):
    def _send_response(self, status, data):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request = json.loads(post_data.decode('utf-8'))

            operation = request.get('operation')
            a = request.get('a')
            b = request.get('b')

            if not all([operation, a, b]):
                self._send_response(400, {'error': 'Missing arguments'})
                return

            try:
                num_a = int(float(a))
                num_b = int(float(b))
            except ValueError:
                self._send_response(400, {'error': 'Invalid numbers'})
                return

            result = None
            if operation == 'add':
                result = mathformer.add(num_a, num_b)
            elif operation == 'sub':
                result = mathformer.sub(num_a, num_b)
            elif operation == 'mul':
                result = mathformer.mul(num_a, num_b)
            elif operation == 'div':
                if num_b == 0:
                     self._send_response(400, {'error': 'Division by zero'})
                     return
                result = mathformer.div(num_a, num_b)
            else:
                self._send_response(400, {'error': f'Unknown operation {operation}'})
                return

            self._send_response(200, {'result': str(result)})

        except Exception as e:
            self._send_response(500, {'error': str(e)})

    def log_message(self, format, *args):
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.client_address[0],
                          self.log_date_time_string(),
                          format%args))

def run(port=0):
    server_address = ('127.0.0.1', port)
    httpd = ThreadingHTTPServer(server_address, CalculatorHandler)
    port = httpd.server_port
    print(f"PORT:{port}", flush=True)

    def watchdog():
        try:
            sys.stdin.read()
        except EOFError:
            pass
        finally:
            print("Parent process closed stdin, exiting...", flush=True)
            import os
            os._exit(0)

    threading.Thread(target=watchdog, daemon=True).start()

    httpd.serve_forever()

if __name__ == '__main__':
    port = 0
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run(port)
