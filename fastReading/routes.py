from fastReading import app
from flask import render_template, redirect, url_for, request, jsonify, Response, flash, session # type: ignore
from fastReading.models import User, WpmResult, TextQuiz, QuizResult, ReadedTexts, Exercise, ExerciseResult, Admin
from fastReading.forms import RegisterForm, LoginForm
from fastReading import db
from flask_login import login_user, logout_user, login_required, current_user # type: ignore
from datetime import datetime
import os
from sqlalchemy.sql.expression import func # type: ignore
from fastReading.validation import validate_quiz_json
from werkzeug.utils import secure_filename # type: ignore
from json.decoder import JSONDecodeError

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

@app.route('/get_ex1_text', methods=['GET'])
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

@app.route('/dashboard/training/grouping')
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

@app.route('/submit_selection', methods=['POST'])
@login_required
def submit_selection():
    weight = 25
    data = request.get_json()
    score = (data.get('percentage') / 100) * weight
    result = ExerciseResult(user_id=current_user.id, exerciseId=3, score=score, timestamp=datetime.now())
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

@app.route('/dashboard/ranking')
@login_required
def ranking_page():
    return render_template('ranking.html')

@app.route('/get_ranking_data', methods=['GET'])
@login_required
def get_ranking_data():
    users = User.query.order_by(User.points.asc()).all()
    data = [{'username': user.username, 'level': user.level, 'points': user.points} for user in users]
    return jsonify(data)

@app.route('/dashboard/training/selection')
@login_required
def selection_page():
    return render_template('selection.html')

@app.route('/dashboard/training/exercise6')
@login_required
def exercise6_page():
    return render_template('exercise6.html')

@app.route('/submit_ex6', methods=['POST'])
@login_required
def submit_ex6():
    weight = 30
    data = request.get_json()
    score = (data.get('percentage') / 100) * weight
    result = ExerciseResult(user_id=current_user.id, exerciseId=4, score=score, timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    current_user.points += score
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/dashboard/training/exercise7')
@login_required
def exercise7_page():
    return render_template('exercise7.html')

@app.route('/get_character_pairs', methods=['GET'])
@login_required
def getCharacterPairs():
    pairs_file_path = 'Sources/Words/pairs.json'

    with open(pairs_file_path, 'r', encoding='utf-8') as file:
        pairs = file.read()
    return jsonify({ 'character_pairs': pairs})

@app.route('/submit_ex7', methods=['POST'])
@login_required
def submit_ex7():
    weight = 2
    data = request.get_json()
    score = data.get('gamePoints') * weight
    result = ExerciseResult(user_id=current_user.id, exerciseId=5, score=score, timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    current_user.points += score
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/dashboard/training/exercise8')
@login_required
def exercise8_page():
    return render_template('exercise8.html')

@app.route('/submit_ex8', methods=['POST'])
@login_required
def submit_ex8():
    weight = 1
    data = request.get_json()
    seconds = 80 - data.get('totalSeconds')
    score = data.get('gamePoints') * (1+seconds/100) * weight
    result = ExerciseResult(user_id=current_user.id, exerciseId=6, score=score, timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    current_user.points += score
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/upload_files', methods=['POST'])
def upload_files():
    if session.get('admin') == True:
        if 'file1' not in request.files or 'file2' not in request.files:
            return jsonify({'error': 'No files found'}), 400
        text = request.files['file1']
        quiz = request.files['file2']
        if text.filename == '' or quiz.filename == '':
            return jsonify({'error': 'No selected files'}), 400
        
        temp_dir = 'temp_uploads'
        os.makedirs(temp_dir, exist_ok=True)

        filename1 = secure_filename(text.filename)
        filename2 = secure_filename(quiz.filename)

        file1_path = os.path.join(temp_dir, filename1)
        file2_path = os.path.join(temp_dir, filename2)

        text.save(file1_path)
        quiz.save(file2_path)

        try:
            # Validate the JSON file
            if not validate_quiz_json(file2_path):
                raise ValueError('Invalid quiz file structure')

        except JSONDecodeError as e:
            os.remove(file1_path)
            os.remove(file2_path)
            return jsonify({'error': f'JSON Decode Error: {str(e)}'}), 400
        
        except Exception as e:
            os.remove(file1_path)
            os.remove(file2_path)
            return jsonify({'error': f'Unexpected Error: {str(e)}'}), 500

        # Clean up temporary files
        os.remove(file1_path)
        os.remove(file2_path)

        # Reset file pointers
        text.seek(0)
        quiz.seek(0)

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename1 = f"{timestamp}_{filename1}"
        filename2 = f"{timestamp}_{filename2}"

        selected_option = request.form.get('option')

        upload_folder_text = f"Sources/Texts"
        upload_folder_quiz = f"Sources/Quizes"

        text.save(os.path.join(upload_folder_text, filename1))
        quiz.save(os.path.join(upload_folder_quiz, filename2))

        text_quiz = TextQuiz(text_file_path=os.path.join(upload_folder_text, filename1), quiz_file_path=os.path.join(upload_folder_quiz, filename2), type=selected_option)
        db.session.add(text_quiz)
        db.session.commit()
        return jsonify({'redirect': url_for('admin_page')})


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
    if current_user.is_authenticated:
        return redirect(url_for('logout_page'))
    form = LoginForm()
    if form.validate_on_submit():
        attempted_user = User.query.filter_by(username=form.username.data).first()
        if attempted_user and attempted_user.check_password_correction(attempted_password=form.password.data):
            login_user(attempted_user)
            return redirect(url_for('main_page'))
        else:
            flash('Nazwa użytkownika lub hasło są niepoprawne, spróbuj ponownie później', 'error')
    return render_template('login.html', form=form)


@app.route('/admin')
def admin_page():
    if session.get('admin') == True:
        return render_template('admin.html')
    else:
        return redirect(url_for('admin_login_page'))
    
@app.route('/admin_login', methods=['GET', 'POST'])
def admin_login_page():
    if session.get('admin') == True:
        return redirect(url_for('admin_page'))
    form = LoginForm()
    if form.validate_on_submit():
        attempted_user = Admin.query.filter_by(username=form.username.data).first()
        if attempted_user and attempted_user.check_password_correction(attempted_password=form.password.data):
            login_user(attempted_user)
            session['admin'] = True
            return redirect(url_for('admin_page'))
        else:
            flash('Nazwa użytkownika lub hasło są niepoprawne, spróbuj ponownie później', 'error')
    return render_template('login.html', form=form)

@app.route('/admin_logout')
def admin_logout_page():
    session['admin'] = False
    return redirect(url_for('home_page'))

@app.route('/logout')
def logout_page():
    logout_user()
    return redirect(url_for('home_page'))

