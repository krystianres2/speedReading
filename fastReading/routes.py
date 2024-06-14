from fastReading import app
from flask import render_template, redirect, url_for, request, jsonify, Response, flash # type: ignore
from fastReading.models import User, WpmResult, TextQuiz, QuizResult, ReadedTexts, Exercise, ExerciseResult
from fastReading.forms import RegisterForm, LoginForm
from fastReading import db
from flask_login import login_user, logout_user, login_required, current_user # type: ignore
from datetime import datetime
import json
from sqlalchemy.sql.expression import func # type: ignore

@app.route('/')
@app.route('/home')
def home_page():
    logout_user()
    return render_template('index.html')

@app.route('/dashboard')
@login_required
def main_page():
    return render_template('dashboard.html')

@app.route('/dashboard/exercise1')
@login_required
def exercise1_page():
    return render_template('exercise1.html')

@app.route('/get_ex1_text')
@login_required
def get_ex1_text():
    text_quiz = TextQuiz.query.order_by(func.rand()).first()
    if text_quiz is None:
        return jsonify(error='No TextQuiz found'), 404
    file_path = text_quiz.text_file_path

    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()

    return jsonify({'file_content': text, 'id': text_quiz.id})

@app.route('/submit_wpm', methods=['POST'])
@login_required
def submit_wpm():
    data = request.get_json()
    wpm = data.get('wpm')
    result = WpmResult(wpm=wpm, timestamp=datetime.now(), user_id=current_user.id)
    db.session.add(result)
    db.session.commit()
    print(data.get('id'))
    result2 = ReadedTexts(user_id=current_user.id, text_quiz_id=data.get('id'), timestamp=datetime.now())
    db.session.add(result2)
    db.session.commit()
    print(data.get('id'))
    return jsonify({'redirect': url_for('main_page')})

@app.route('/dashboard/exercise2')
@login_required
def exercise2_page():
    return render_template('exercise2.html')

@app.route('/submit_quiz', methods=['POST'])
@login_required
def submit_quiz():
    data = request.get_json()
    result = QuizResult(score=data.get('percentage'), effectivity=data.get('effectivity'), timestamp=datetime.now(), user_id=current_user.id)
    db.session.add(result)
    db.session.commit()

    return jsonify({'redirect': url_for('main_page')})

@app.route('/get_text_quiz')
@login_required
def get_text_quiz():
    text_quiz = TextQuiz.query.order_by(func.rand()).first()
    if text_quiz is None:
        return jsonify(error='No TextQuiz found'), 404
    text_file_path = text_quiz.text_file_path
    quiz_file_path = text_quiz.quiz_file_path

    with open(text_file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    with open(quiz_file_path, 'r', encoding='utf-8') as file:
        quiz = file.read()
    return jsonify({'file_content': text, 'quiz_content': quiz, 'id': text_quiz.id})

@app.route('/get_wpm_data')
@login_required
def get_wpm_data():
    results = WpmResult.query.filter_by(user_id=current_user.id).all()
    data = [{'wpm': result.wpm, 'timestamp': result.timestamp.strftime('%Y-%m-%d %H:%M:%S')} for result in results]
    return jsonify(data)

@app.route('/dashboard/training')
@login_required
def training_page():
    return render_template('training.html')

@app.route('/dashboard/training/rsvp')
@login_required
def rsvp_page():
    return render_template('rsvp.html')

@app.route('/get_rsvp_data', methods=['GET']) 
@login_required
def get_rsvp_data():
    text_quiz = TextQuiz.query.order_by(func.rand()).first()
    if text_quiz is None:
        return jsonify(error='No TextQuiz found'), 404
    text_file_path = text_quiz.text_file_path
    quiz_file_path = text_quiz.quiz_file_path

    with open(text_file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    with open(quiz_file_path, 'r', encoding='utf-8') as file:
        quiz = file.read()

    wpm_results = WpmResult.query.filter_by(user_id=current_user.id).all()

    if wpm_results:
        average_wpm = sum(result.wpm for result in wpm_results) / len(wpm_results)
    else:
        average_wpm = 0

    return jsonify({'file_content': text, 'quiz_content': quiz, 'id': text_quiz.id, 'average_wpm': average_wpm})

@app.route('/submit_readed_text', methods=['POST'])
@login_required
def submit_readed_text():
    data = request.get_json()
    result = ReadedTexts(user_id=current_user.id, text_quiz_id=data.get('id'), timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/submit_rsvp', methods=['POST'])
@login_required
def submit_rsvp():
    weight = 20
    data = request.get_json()
    score = (data.get('percentage') / 100) * weight
    result = ExerciseResult(user_id=current_user.id, exerciseId=1, score=score, timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    current_user.points += score
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('//dashboard/training/grouping')
@login_required
def grouping_page():
    return render_template('grouping.html')

@app.route('/submit_grouping', methods=['POST'])
@login_required
def submit_grouping():
    weight = 25
    data = request.get_json()
    score = (data.get('percentage') / 100) * weight
    result = ExerciseResult(user_id=current_user.id, exerciseId=2, score=score, timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    current_user.points += score
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/dashboard/progress')
@login_required
def reports_page():
    return render_template('progress.html')

@app.route('/get_progress_data', methods=['GET'])
@login_required
def get_reports_data():
    results = WpmResult.query.filter_by(user_id=current_user.id).order_by(WpmResult.timestamp).all()
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
        else:
            flash('Nazwa użytkownika lub hasło są niepoprawne, spróbuj ponownie później', 'error')
    return render_template('login.html', form=form)

@app.route('/logout')
def logout_page():
    logout_user()
    return redirect(url_for('home_page'))