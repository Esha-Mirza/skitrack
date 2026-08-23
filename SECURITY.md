# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 0.1.x | :white_check_mark: |

As this project is early-stage (pre-1.0), only the latest released version is actively supported with security fixes.

## Reporting a Vulnerability

If you discover a security vulnerability in `skitrack`, please **do not** open a public GitHub issue.

Instead, report it privately:

- Open a [GitHub Security Advisory](https://github.com/Esha-Mirza/Local-First-Experiment-Tracker-for-Scikit-Learn/security/advisories/new) on the repository, **or**
- Contact the maintainer directly through the contact details on the [GitHub profile](https://github.com/Esha-Mirza).

When reporting, please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce it
- The version of `skitrack` (and OS/Python version) you tested on

### Response Time

This is a solo-maintained, community project — please allow a reasonable amount of time (typically up to a couple of weeks) for an initial response. There is no guaranteed SLA.

### Disclosure Process

1. You report the issue privately.
2. The maintainer confirms and investigates.
3. A fix is developed and released.
4. Once a fix is available, the vulnerability is disclosed publicly (with credit to the reporter, unless anonymity is requested).

## Security Considerations Specific to This Project

`skitrack` is a **local-first** tool: it does not send data to any external server or third-party API. That said, a few things are worth being aware of:

- **Local database**: experiment data (including hyperparameters and dataset fingerprints) is stored unencrypted in a local SQLite file. Don't track experiments containing secrets or sensitive data in parameter values.
- **Local dashboard/API**: the Flask API (`tracker dashboard`) is intended to run on `127.0.0.1` for local use only. It has **no authentication layer** — do not expose it on a public network or bind it to `0.0.0.0` without adding your own access controls.
- **No prompt injection / LLM risk**: this project does not call any external LLM or AI service, so there is no prompt-injection surface.
- **Dependencies**: this project relies on third-party packages (Flask, SQLAlchemy, scikit-learn, etc.). Keep dependencies up to date via `pip install -U -r requirements.txt` to pick up upstream security fixes.
