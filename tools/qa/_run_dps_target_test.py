import subprocess
import sys
import time
import urllib.request
from pathlib import Path


def _wait_for_server(url: str, attempts: int = 60, sleep_seconds: float = 0.25) -> bool:
    for _ in range(attempts):
        try:
            with urllib.request.urlopen(url, timeout=1.0) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(sleep_seconds)
    return False


def main() -> int:
    repo = Path(__file__).resolve().parents[2]
    proc = subprocess.Popen(
        ["python", "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=str(repo),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        if not _wait_for_server("http://127.0.0.1:8000/api/health"):
            print("Server did not start in time", file=sys.stderr)
            return 2

        cmd = [
            "python", "-m", "pytest", "--tb=short", "-vv", "-s",
            "tests/unit/features/test_feature_tutorial_flow.py::test_feature_tutorial_dps_arrow_targets_value",
        ]
        completed = subprocess.run(cmd, cwd=str(repo))
        return int(completed.returncode)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


if __name__ == "__main__":
    raise SystemExit(main())
