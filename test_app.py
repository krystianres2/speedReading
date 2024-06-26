# test_app.py
import pytest # type: ignore
from fastReading import app, db, bcrypt
from flask import url_for # type: ignore
from fastReading.models import User, TextQuiz, WpmResult
from urllib.parse import urlparse

@pytest.fixture(scope='module')
def test_client():
    app.config.from_object('test_config.Config')
    with app.test_client() as testing_client:
        with app.app_context():
            db.create_all()
            yield testing_client
            db.session.remove()
            parsed_uri = urlparse(app.config['SQLALCHEMY_DATABASE_URI'])
            if parsed_uri.scheme == 'sqlite':
                db.drop_all()

@pytest.fixture(scope='module')
def new_user():
    password_hash = bcrypt.generate_password_hash('Password123').decode('utf-8')
    user = User(username='testuser', email='test@example.com', password_hash=password_hash)
    return user

@pytest.fixture(scope='module')
def init_database(test_client, new_user):
    db.session.add(new_user)
    db.session.commit()
    yield db
    db.session.remove()
    parsed_uri = urlparse(app.config['SQLALCHEMY_DATABASE_URI'])
    if parsed_uri.scheme == 'sqlite':
        db.drop_all()

def test_home_page(test_client):
    response = test_client.get('/')
    assert response.status_code == 200
    assert 'Zaloguj się' in response.data.decode('utf-8')

def test_register_page(test_client):
    response = test_client.get('/register')
    assert response.status_code == 200
    assert 'Zarejestruj się' in response.data.decode('utf-8')

def test_valid_register(test_client, init_database):
    response = test_client.post('/register', data=dict(
        username='newuser', email='newuser@example.com', password='NewPassword123', confirm_password='NewPassword123'
    ), follow_redirects=True)
    assert response.status_code == 200
    assert 'Zaloguj się' in response.data.decode('utf-8')

def test_invalid_register_existing_username(test_client, init_database):
    response = test_client.post('/register', data=dict(
        username='testuser', email='newemail@example.com', password='Password123', confirm_password='Password123'
    ), follow_redirects=True)
    assert response.status_code == 200
    assert 'Istnieje już taka nazwa użytkownika' in response.data.decode('utf-8')

def test_login_page(test_client):
    response = test_client.get('/login')
    assert response.status_code == 200
    assert 'Zaloguj się' in response.data.decode('utf-8')

def test_valid_login_logout(test_client, init_database):
    response = test_client.post('/login', data=dict(
        username='testuser', password='Password123'
    ), follow_redirects=True)
    assert response.status_code == 200
    assert 'Dashboard' in response.data.decode('utf-8')
    
    response = test_client.get('/logout', follow_redirects=True)
    assert response.status_code == 200
    assert 'Zaloguj się' in response.data.decode('utf-8')

def test_invalid_login(test_client, init_database):
    response = test_client.post('/login', data=dict(
        username='wronguser', password='WrongPassword123'
    ), follow_redirects=True)
    assert response.status_code == 200
    assert 'Nazwa użytkownika lub hasło są niepoprawne' in response.data.decode('utf-8')

def test_dashboard_requires_login(test_client):
    response = test_client.get('/dashboard', follow_redirects=True)
    assert response.status_code == 200
    assert 'Zaloguj się' in response.data.decode('utf-8')

def test_get_ex1_text_requires_login(test_client):
    response = test_client.get('/get_ex1_text', follow_redirects=True)
    assert response.status_code == 200
    assert 'Zaloguj się' in response.data.decode('utf-8')

def test_submit_wpm(test_client, init_database):
    test_client.post('/login', data=dict(
        username='testuser', password='Password123'
    ), follow_redirects=True)

    response = test_client.post('/submit_wpm', json={
        'wpm': 250,
        'id': 1
    }, follow_redirects=True)
    assert response.status_code == 200

def test_submit_quiz(test_client, init_database):
    test_client.post('/login', data=dict(
        username='testuser', password='Password123'
    ), follow_redirects=True)

    response = test_client.post('/submit_quiz', json={
        'percentage': 85,
        'effectivity': 90
    }, follow_redirects=True)
    assert response.status_code == 200

def test_submit_rsvp(test_client, init_database):
    test_client.post('/login', data=dict(
        username='testuser', password='Password123'
    ), follow_redirects=True)

    response = test_client.post('/submit_rsvp', json={
        'percentage': 80
    }, follow_redirects=True)
    assert response.status_code == 200

def test_submit_grouping(test_client, init_database):
    test_client.post('/login', data=dict(
        username='testuser', password='Password123'
    ), follow_redirects=True)

    response = test_client.post('/submit_grouping', json={
        'percentage': 75
    }, follow_redirects=True)
    assert response.status_code == 200

def test_get_progress_data(test_client, init_database):
    test_client.post('/login', data=dict(
        username='testuser', password='Password123'
    ), follow_redirects=True)

    response = test_client.get('/get_progress_data', follow_redirects=True)
    assert response.status_code == 200
    assert 'wpm' in response.data.decode('utf-8')

def test_get_ranking_data(test_client, init_database):
    test_client.post('/login', data=dict(
        username='testuser', password='Password123'
    ), follow_redirects=True)

    response = test_client.get('/get_ranking_data', follow_redirects=True)
    assert response.status_code == 200
    assert 'username' in response.data.decode('utf-8')
