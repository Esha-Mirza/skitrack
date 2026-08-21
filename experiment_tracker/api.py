import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from .storage import Storage

PACKAGE_STATIC_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "static",
)

STATIC_DIR = PACKAGE_STATIC_DIR

app = Flask(__name__, static_folder=None)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])
storage = Storage()


@app.route("/api/runs", methods=["GET"])
def get_runs():
    runs = storage.get_all_runs()

    for run in runs:
        run["timestamp"] = run["timestamp"].isoformat(timespec="milliseconds")

    return jsonify(
        {
            "status": "success",
            "count": len(runs),
            "data": runs,
        }
    )


@app.route("/api/runs/<run_id>", methods=["GET"])
def get_run(run_id):
    run = storage.get_run(run_id)

    if run:
        run["timestamp"] = run["timestamp"].isoformat(timespec="milliseconds")
        return jsonify({"status": "success", "data": run})

    return jsonify(
        {
            "status": "error",
            "message": f"Run {run_id} not found",
        }
    ), 404


@app.route(
    "/api/<path:path>",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
)
def unknown_api_path(path):
    return jsonify(
        {
            "status": "error",
            "message": f"API endpoint /api/{path} not found",
        }
    ), 404


@app.route("/assets/<path:path>")
def serve_assets(path):
    return send_from_directory(STATIC_DIR, path)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_dashboard(path):
    if path:
        candidate = os.path.join(STATIC_DIR, path)

        if os.path.isfile(candidate):
            return send_from_directory(STATIC_DIR, path)

    return send_from_directory(STATIC_DIR, "index.html")


if __name__ == "__main__":
    app.run(debug=True, port=5000)