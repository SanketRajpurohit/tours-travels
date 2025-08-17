# tours-travels
@"
# Tours & Travels Project

## Stack
- Frontend: React + TailwindCSS
- Backend: Django + Django REST Framework

## Getting Started

### Clone
git clone <https://github.com/SanketRajpurohit/tours-travels.git>
cd <tours-travels>

### Backend (Django)
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver   # http://127.0.0.1:8000/

### Frontend (React)
cd ../frontend
npm install
npm start                    # http://localhost:3000/

## Team Git Workflow
git pull origin main
git add .
git commit -m "message"
git push origin main
"@ | Set-Content README.md
