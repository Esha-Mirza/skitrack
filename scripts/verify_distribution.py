from pathlib import Path
import sys
import tarfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

REQUIRED_WHEEL = {
    "experiment_tracker/__init__.py",
    "experiment_tracker/api.py",
    "experiment_tracker/cli.py",
    "experiment_tracker/decorator.py",
    "experiment_tracker/models.py",
    "experiment_tracker/storage.py",
    "experiment_tracker/static/index.html",
}

REQUIRED_STATIC_EXTENSIONS = {".js", ".css"}

FORBIDDEN_PARTS = {
    "node_modules",
    ".vite",
    "dashboard",
}

FORBIDDEN_SUFFIXES = {
    ".db",
    ".sqlite",
    ".sqlite3",
}

def verify_wheel(path):
    with zipfile.ZipFile(path) as archive:
        names = set(archive.namelist())

    missing = REQUIRED_WHEEL - names
    static_files = {
        name
        for name in names
        if name.startswith("experiment_tracker/static/")
        and Path(name).suffix in REQUIRED_STATIC_EXTENSIONS
    }

    forbidden = {
        name
        for name in names
        if any(part in FORBIDDEN_PARTS for part in Path(name).parts)
        or Path(name).suffix.lower() in FORBIDDEN_SUFFIXES
    }

    errors = []

    if missing:
        errors.append(f"Wheel is missing required files: {sorted(missing)}")

    if not static_files:
        errors.append("Wheel does not contain compiled JavaScript or CSS assets.")

    if forbidden:
        errors.append(f"Wheel contains forbidden files: {sorted(forbidden)}")

    return errors

def verify_sdist(path):
    with tarfile.open(path, "r:gz") as archive:
        names = archive.getnames()

    normalized = {
        name.split("/", 1)[1] if "/" in name else name
        for name in names
    }

    required = {
        "experiment_tracker/__init__.py",
        "experiment_tracker/api.py",
        "experiment_tracker/cli.py",
        "experiment_tracker/decorator.py",
        "experiment_tracker/models.py",
        "experiment_tracker/storage.py",
        "experiment_tracker/static/index.html",
    }

    missing = {
        item
        for item in required
        if not any(name.endswith(item) for name in normalized)
    }

    forbidden = {
        name
        for name in names
        if any(part in FORBIDDEN_PARTS for part in Path(name).parts)
        or Path(name).suffix.lower() in FORBIDDEN_SUFFIXES
    }

    errors = []

    if missing:
        errors.append(f"Source distribution is missing required files: {sorted(missing)}")

    if forbidden:
        errors.append(f"Source distribution contains forbidden files: {sorted(forbidden)}")

    return errors

def main():
    wheels = sorted(DIST.glob("*.whl"))
    sdists = sorted(DIST.glob("*.tar.gz"))

    if not wheels:
        print("ERROR: No wheel found in dist/.")
        return 1

    if not sdists:
        print("ERROR: No source distribution found in dist/.")
        return 1

    errors = []

    for wheel in wheels:
        print(f"Checking wheel: {wheel.name}")
        errors.extend(verify_wheel(wheel))

    for sdist in sdists:
        print(f"Checking source distribution: {sdist.name}")
        errors.extend(verify_sdist(sdist))

    if errors:
        print()
        print("Distribution verification FAILED.")
        for error in errors:
            print(f"- {error}")
        return 1

    print()
    print("Distribution verification PASSED.")
    print("Required runtime files are present.")
    print("Compiled dashboard assets are present.")
    print("Forbidden development/runtime artifacts are absent.")
    return 0

if __name__ == "__main__":
    sys.exit(main())