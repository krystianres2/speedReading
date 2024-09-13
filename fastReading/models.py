from fastReading import db, login_manager
from fastReading import bcrypt
from flask_login import UserMixin # type: ignore
from datetime import datetime, timezone
from flask import render_template, redirect, url_for, request, jsonify, flash, session # type: ignore


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized_callback():
    flash('Proszę się zalogować, aby uzyskać dostęp do tej strony', 'error')
    return redirect(url_for('login_page'))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(60), nullable=False)
    level = db.Column(db.Integer, nullable=False, default=1)
    points = db.Column(db.Integer, nullable=False, default=0)

    @property
    def password(self):
        return self.password
    
    @password.setter
    def password(self, plain_text_password):
        self.password_hash = bcrypt.generate_password_hash(plain_text_password).decode('utf-8')

    def check_password_correction(self, attempted_password):
        return bcrypt.check_password_hash(self.password_hash, attempted_password)

class WpmResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    wpm = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('wpm_results', lazy=True))

class TextQuiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text_file_path = db.Column(db.String(100), unique=True, nullable=False)
    quiz_file_path = db.Column(db.String(100), unique=True, nullable=False)
    type = db.Column(db.String(20), nullable=False)

class QuizResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    score = db.Column(db.Float, nullable=False) #percentage
    effectivity = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship('User', backref=db.backref('quiz_results', lazy=True))

class ReadedTexts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    text_quiz_id = db.Column(db.Integer, db.ForeignKey('text_quiz.id'), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('readed_texts', lazy=True))
    text_quiz = db.relationship('TextQuiz', backref=db.backref('readed_texts', lazy=True))

class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exerciseName = db.Column(db.String(100), nullable=False)

class ExerciseResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    exerciseId = db.Column(db.Integer, db.ForeignKey('exercise.id'), nullable=False)
    score = db.Column(db.Float, nullable=False) #points
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))

    exercise = db.relationship('Exercise', backref=db.backref('exercise_results', lazy=True))
    user = db.relationship('User', backref=db.backref('exercise_results', lazy=True))

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(60), nullable=False)

    @property
    def password(self):
        return self.password
    
    @password.setter
    def password(self, plain_text_password):
        self.password_hash = bcrypt.generate_password_hash(plain_text_password).decode('utf-8')

    def check_password_correction(self, attempted_password):
        return bcrypt.check_password_hash(self.password_hash, attempted_password)
    
    @property
    def is_active(self):
        # Możesz dodać logikę, aby sprawdzić, czy konto jest aktywne
        return True
    
    def get_id(self):
        return str(self.id)

    
    


