from fastReading import app
from flask import render_template, redirect, url_for, request, jsonify # type: ignore
from fastReading.models import User
from fastReading.forms import RegisterForm, LoginForm
from fastReading import db
from flask_login import login_user, logout_user, login_required, current_user # type: ignore

@app.route('/')
@app.route('/home')
def home_page():
    return render_template('index.html')

@app.route('/main')
def main_page():
    return render_template('main.html')

@app.route('/exercise1')
def exercise1_page():
    return render_template('exercise1.html')

@app.route('/get_ex1_text')
def get_ex1_text():
    with open('Sources/Texts/SampleText.txt', 'r', encoding='utf-8') as file:
        content = file.read()
    return jsonify({'file_content': content})

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