from fastReading import app
from flask import render_template, redirect, url_for, request, jsonify # type: ignore
from fastReading.models import User, WpmResult
from fastReading.forms import RegisterForm, LoginForm
from fastReading import db
from flask_login import login_user, logout_user, login_required, current_user # type: ignore
from datetime import datetime

@app.route('/')
@app.route('/home')
def home_page():
    return render_template('index.html')

@app.route('/dashboard')
def main_page():
    return render_template('dashboard.html')

@app.route('/exercise1')
def exercise1_page():
    return render_template('exercise1.html')

@app.route('/get_ex1_text')
def get_ex1_text():
    with open('Sources/Texts/SampleText.txt', 'r', encoding='utf-8') as file:
        content = file.read()
    return jsonify({'file_content': content})

@app.route('/submit_wpm', methods=['POST'])
def submit_wpm():
    data = request.get_json()
    wpm = data.get('wpm')
    result = WpmResult(wpm=wpm, timestamp=datetime.now(), user_id=current_user.id)
    db.session.add(result)
    db.session.commit()

    return jsonify({'redirect': url_for('main_page')})

@app.route('/dashboard/reports')
def reports_page():
    return render_template('reports.html')

@app.route('/exercise2')
def exercise2_page():
    return render_template('exercise2.html')

@app.route('/get_wpm_data')
@login_required
def get_wpm_data():
    results = WpmResult.query.filter_by(user_id=current_user.id).all()
    data = [{'wpm': result.wpm, 'timestamp': result.timestamp.strftime('%Y-%m-%d %H:%M:%S')} for result in results]
    return jsonify(data)

@app.route('/register', methods=['GET', 'POST'])
def register_page():
    form = RegisterForm()
    if form.validate_on_submit():
        user_to_create = User(username=form.username.data, email=form.email.data, password=form.password.data)
        db.session.add(user_to_create)
        db.session.commit()
        login_user(user_to_create)
        return redirect(url_for('home_page'))

    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login_page():
    form = LoginForm()
    if form.validate_on_submit():
        attempted_user = User.query.filter_by(username=form.username.data).first()
        if attempted_user and attempted_user.check_password_correction(attempted_password=form.password.data):
            login_user(attempted_user)
            return redirect(url_for('main_page'))
    return render_template('login.html', form=form)