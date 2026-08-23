# Contributing to skitrack

Thanks for your interest in contributing! This document explains how to get set up and how the contribution workflow works.

## Getting Started

1. **Fork the repository**
   Click "Fork" on [GitHub](https://github.com/Esha-Mirza/Local-First-Experiment-Tracker-for-Scikit-Learn).

2. **Clone your fork**
   ```bash
   git clone https://github.com/<your-username>/Local-First-Experiment-Tracker-for-Scikit-Learn.git
   cd Local-First-Experiment-Tracker-for-Scikit-Learn
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements-dev.txt
   pip install -e .
   ```

4. **Create a development environment**
   ```bash
   python -m venv venv
   source venv/bin/activate    # Windows: venv\Scripts\activate
   ```

5. **Configure `.env`** (optional)
   ```bash
   cp .env.example .env
   ```
   Only needed if you want to point the tracker's local database somewhere other than the default OS app-data folder.

6. **Run locally**
   ```bash
   tracker dashboard
   ```

## Development Workflow

```
Fork
 ↓
Create branch
 ↓
Make changes
 ↓
Run tests
 ↓
Commit
 ↓
Push
 ↓
Create Pull Request
```

### Branch Naming

Use a prefix that describes the type of change:

```
feature/add-xgboost-support
fix/dashboard-empty-state
docs/update-readme
refactor/storage-layer
```

### Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:      a new feature
fix:       a bug fix
docs:      documentation-only changes
refactor:  code change that neither fixes a bug nor adds a feature
test:      adding or fixing tests
chore:     tooling, dependencies, maintenance
```

Example: `feat: add support for logging confusion matrices`

## Code Standards

- **Formatting**: keep formatting consistent with the surrounding code. Standard Python (PEP 8) conventions apply.
- **Linting**: fix any linter warnings before submitting a PR.
- **Naming conventions**: use descriptive, `snake_case` names for functions and variables, `PascalCase` for classes.
- **Type hints**: add type hints for new functions where practical (see `decorator.py` for the existing style).
- **Documentation requirements**: update the relevant file(s) under `docs/` or the `README.md` if your change affects installation, usage, configuration, or the API.
- **Testing requirements**: add or update tests under `tests/` for any new behavior or bug fix.

## Pull Requests

A good PR should contain:

- A clear description of **what** changed and **why**
- A reference to the related issue, if any (e.g. `Closes #12`)
- Passing tests (`pytest`)
- Screenshots, for any change to the dashboard UI
- Updated documentation, if applicable

**Before submitting:**
```bash
pytest
```
All tests must pass, and any new functionality should include new tests.

### Review Process

- A maintainer will review your PR and may request changes.
- Once approved, your PR will be merged.
- Please be patient — this is a small, actively-maintained project, but review times can vary.

## Reporting Issues

When reporting a problem or requesting a feature, please use the appropriate template:

- **Bugs**: use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template — include steps to reproduce, expected vs. actual behavior, and your environment (OS, Python version).
- **Feature requests**: use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template — describe the problem you're trying to solve, not just the solution.
- **Documentation problems**: open a regular issue describing what's missing, unclear, or incorrect, and where.

Thanks again for contributing!
