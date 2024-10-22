import psutil
import time
from flask import Flask
from flask import render_template
import sys

app = Flask(__name__)


def get_cpu_count():
    return psutil.cpu_count(), psutil.cpu_count(False)


def cpu_usage(interval: float = 1):
    return psutil.cpu_percent(interval=interval, percpu=True)


def memory_usage(interval: float = 1):
    time.sleep(interval)
    return psutil.virtual_memory()


def disk_usage():
    return psutil.disk_usage("/")


# Get the list of running processes
def get_running_processes(interval=0.1):
    processes = []
    for p in psutil.pids():
        try:
            process = psutil.Process(p)
            if process.cpu_percent(interval=interval) > 1:
                print("add")
                processes.append(psutil.Process(p))

        except psutil.NoSuchProcess:
            print("No process found")

    print(processes[:4])
    processes.sort(reverse=False)
    print(processes[:4])
    return processes


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/metrics")
def get_metrics():
    print(disk_usage())

    return {
        "cpu_usage": cpu_usage(),
        "memory_usage": memory_usage().percent,
        "disk_usage": (disk_usage().total, disk_usage().used, disk_usage().free),
    }


@app.route("/info")
def get_system_info():
    return {
        "cpus": get_cpu_count()[0],
        "memory": "{0:.2f}".format(memory_usage().total / 1_000_000_000),
    }


if __name__ == "__main__":
    port = 5000
    if len(sys.argv) == 2:
        port = sys.argv[1]
    app.run("0.0.0.0", debug=True, port=port)
