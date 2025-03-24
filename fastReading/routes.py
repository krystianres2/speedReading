from flask import ( # type: ignore
    render_template, redirect, url_for, request, jsonify, flash, session
)
from flask_login import login_user, logout_user, login_required, current_user # type: ignore
from werkzeug.utils import secure_filename # type: ignore
from sqlalchemy.sql.expression import func # type: ignore
from datetime import datetime, timedelta
import os
import pandas as pd
from json.decoder import JSONDecodeError

from fastReading import app, db
from fastReading.models import (
    User, WpmResult, TextQuiz, QuizResult, ExerciseResult, Admin
)
from fastReading.forms import RegisterForm, LoginForm
from fastReading.validation import validate_quiz_json

@app.route('/')
@app.route('/home')
def home_page():
    logout_user()
    return render_template('index.html')

@app.route('/dashboard')
@login_required
def main_page():
    return render_template('dashboard.html')

@app.route('/dashboard/wpm-exercise')
@login_required
def wpm_exercise_page():
    return render_template('wpm-exercise.html')

@app.route('/dashboard/effectivity-exercise')
@login_required
def effectivity_exercise_page():
    return render_template('effectivity-exercise.html')

@app.route('/dashboard/training')
@login_required
def training_page():
    return render_template('training.html')

@app.route('/dashboard/training/exercise1')
@login_required
def exercise1_page():
    return render_template('exercise1.html')

@app.route('/dashboard/training/exercise2')
@login_required
def exercise2_page():
    return render_template('exercise2.html')

@app.route('/dashboard/training/exercise3')
@login_required
def exercise3_page():
    return render_template('exercise3.html')

@app.route('/dashboard/training/exercise4')
@login_required
def exercise4_page():
    return render_template('exercise4.html')

@app.route('/dashboard/training/exercise5')
@login_required
def exercise5_page():
    return render_template('exercise5.html')

@app.route('/dashboard/training/exercise6')
@login_required
def exercise6_page():
    return render_template('exercise6.html')

@app.route('/dashboard/progress')
@login_required
def progress_page():
    return render_template('progress.html')

@app.route('/dashboard/ranking')
@login_required
def ranking_page():
    return render_template('ranking.html')

@app.route('/text/<string:text_type>', methods=['GET'])
@login_required
def get_text(text_type):
    text = TextQuiz.query.filter_by(type=text_type).order_by(func.rand()).first()
    if text is None:
        return jsonify(error='No Text found'), 404
    file_path = text.text_file_path

    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    return jsonify(text)

@app.route('/text-quiz/<string:type>', methods=['GET'])
@login_required
def get_text_quiz(type):
    text_quiz = TextQuiz.query.filter_by(type=type).order_by(func.rand()).first()
    if text_quiz is None:
        return jsonify(error='No Text and Quiz found'), 404
    text_file_path = text_quiz.text_file_path
    quiz_file_path = text_quiz.quiz_file_path

    with open(text_file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    with open(quiz_file_path, 'r', encoding='utf-8') as file:
        quiz = file.read()
    return jsonify({'text': text, 'quiz': quiz})

@app.route('/wpm-submission', methods=['POST'])
@login_required
def submit_wpm():
    data = request.get_json()
    wpm = data.get('wpm')
    result = WpmResult(wpm=wpm, timestamp=datetime.now(), user_id=current_user.id)
    db.session.add(result)
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/quiz-submission', methods=['POST'])
@login_required
def submit_quiz():
    data = request.get_json()
    result = QuizResult(score=data.get('percentage'), effectivity=data.get('effectivity'), timestamp=datetime.now(), user_id=current_user.id)
    db.session.add(result)
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/exercise1-submission', methods=['POST'])
@login_required
def submit_exercise1():
    data = request.get_json()
    print(f"Received data: {data}")
    
    if not data or 'percentage' not in data:
        return jsonify({'error': 'Invalid input'}), 400

    score = ((data.get('percentage') / 100) * 20)
    result = ExerciseResult(user_id=current_user.id, exerciseId=1, score=score, timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    current_user.points += score
    db.session.commit()
    
    return jsonify({'redirect': url_for('main_page')})

@app.route('/exercise2-submission', methods=['POST'])
@login_required
def submit_exercise2():
    data = request.get_json()
    score = ((data.get('percentage')/100)*20)
    result = ExerciseResult(user_id=current_user.id, exerciseId=2, score=score, timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    current_user.points += score
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/exercise3-submission', methods=['POST'])
@login_required
def submit_exercise3():
    data = request.get_json()
    score = ((data.get('percentage')/100)*20)
    result = ExerciseResult(user_id=current_user.id, exerciseId=3, score=score, timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    current_user.points += score
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/exercise4-submission', methods=['POST'])
@login_required
def submit_exercise4():
    data = request.get_json()
    score = ((data.get('percentage')/100)*20)
    result = ExerciseResult(user_id=current_user.id, exerciseId=4, score=score, timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    current_user.points += score
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/exercise5-submission', methods=['POST'])
@login_required
def submit_exercise5():
    data = request.get_json()
    score = (data.get('gamePoints')*2)
    result = ExerciseResult(user_id=current_user.id, exerciseId=5, score=score, timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    current_user.points += score
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/exercise6-submission', methods=['POST'])
@login_required
def submit_exercise6():
    data = request.get_json()
    score = data.get('gamePoints')+(data.get('secondsLeft')/10)
    result = ExerciseResult(user_id=current_user.id, exerciseId=6, score=score, timestamp=datetime.now())
    db.session.add(result)
    db.session.commit()
    current_user.points += score
    db.session.commit()
    return jsonify({'redirect': url_for('main_page')})

@app.route('/user/progress-data', methods=['GET'])
@login_required
def get_reports_data():
    seven_days_ago = (datetime.now() - timedelta(days=7)).date()
    data = WpmResult.query.filter_by(user_id=current_user.id).order_by(WpmResult.timestamp).all()
    df = pd.DataFrame([{'wpm': result.wpm, 'timestamp': result.timestamp.date()} for result in data])
    average_wpm = df['wpm'].mean() #output
    df_last_seven_days = df[df['timestamp'] > seven_days_ago].copy()
    df_last_seven_days['timestamp'] = pd.to_datetime(df['timestamp'])
    seven_days_average_wpm = df_last_seven_days['wpm'].mean() #output
    date_range = pd.date_range(start=seven_days_ago + timedelta(days=1), end=datetime.now().date())
    date_df = pd.DataFrame(date_range, columns=['timestamp'])
    merged_df = date_df.merge(df_last_seven_days.groupby('timestamp')['wpm'].mean().reset_index(), on='timestamp', how='left')
    merged_df['wpm'] = merged_df['wpm'].fillna(0)
    seven_days_wpm_list = [{'date': row['timestamp'].strftime('%Y-%m-%d'), 'wpm': row['wpm']} for _, row in merged_df.iterrows()] #output

    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['Month'] = df['timestamp'].dt.strftime('%Y-%m')
    monthly_avg_wpm = df.groupby('Month').mean(numeric_only=True)
    all_months = pd.date_range(start=df['timestamp'].min().to_period('M').to_timestamp(),
                            end=df['timestamp'].max().to_period('M').to_timestamp(),
                            freq='MS').strftime('%Y-%m')
    all_months_df = pd.DataFrame(all_months, columns=['Month'])
    merged_monthly_df = all_months_df.merge(monthly_avg_wpm, on='Month', how='left')
    merged_monthly_df['wpm'] = merged_monthly_df['wpm'].fillna(0)
    monthly_wpm_list = [{'date': row['Month'], 'wpm': row['wpm']} for _, row in merged_monthly_df.iterrows()] #output

    return jsonify([{'average_wpm': average_wpm, 'last_week_average_wpm': seven_days_average_wpm, 'last_week_wpm': seven_days_wpm_list, 'monthly_wpm': monthly_wpm_list}])

@app.route('/user/average-wpm', methods=['GET'])
@login_required
def get_average_wpm():
    results = WpmResult.query.filter_by(user_id=current_user.id).all()
    if not results:
        return jsonify({'average_wpm': 0})
    average_wpm = sum(result.wpm for result in results) / len(results)
    return jsonify({'average_wpm': average_wpm})

@app.route('/users-ranking', methods=['GET'])
@login_required
def get_ranking_data():
    users = User.query.order_by(User.points.asc()).all()
    data = [{'username': user.username, 'level': user.level, 'points': user.points} for user in users]
    return jsonify(data)

@app.route('/character-pairs', methods=['GET'])
@login_required
def getCharacterPairs():
    pairs_file_path = 'Sources/Words/pairs.json'

    with open(pairs_file_path, 'r', encoding='utf-8') as file:
        pairs = file.read()
    return jsonify({ 'character_pairs': pairs})

@app.route('/upload-files', methods=['POST'])
@login_required
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
        flash("Rejestracja się powiodła! Teraz możesz się zalogować", 'success')
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
            flash('Nazwa użytkownika lub hasło są niepoprawne, spróbuj ponownie później', 'danger')
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

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(429)
def ratelimit_handler(e):
    return render_template('429.html'), 429
