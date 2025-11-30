# 🗽 CivicConnect

## 🌟 Highlights

- Instant election insights across all 50 states with race details and ballot measures pulled from civicapi.org
- High-speed candidate search from logging API results
- Clear and Unified dashboard UI that gives easy access to login, voter info, and 
help in one place
- Django REST backend with SQLite to handle backend caching and API calls
- React frontend using stylish reusable components and ready with WorkOS authenticator


## ℹ️ Overview

Young voters can stay informed without having to navigate between government websites thanks to CivicConnect, a full-stack civic data companion.  Calls to civicapi.org are coordinated by our Django API, which also caches results in SQLite and exposes clean endpoints for election timelines, ballot measures, and candidate lookups.  A Trie based autocomplete keeps searches fast even on mobile devices, and a React dashboard arranges everything into manageable tabs, from recent races and registration materials to impending election dates.  The objective is straightforward: provide communities, particularly young adults navigating a complex political environment, with a single, trustworthy source of up-to-date election information.


### ✍️ Authors

Abrar Makki
Shimra Hazmi
Thuy Duong Pham
Hau Tran

## 🚀 Usage

*Show off what your software looks like in action! Try to limit it to one-liners if possible and don't delve into API specifics.*

```py
>>> import mypackage
>>> mypackage.do_stuff()
'Oh yeah!'
```


## ⬇️ Installation

Here are the instructions on running our website.

```bash
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate

# Frontend
cd ..\frontend
npm install
```

Minimum requirements for
running the project:

- Python 3.12+
- Node.js 18+
- npm 10+
- SQLite (bundled with Python on Windows)
- civicapi.org API key (set via environment variable `CIVIC_API_KEY`)
