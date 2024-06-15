from flask import Flask # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
from flask_bcrypt import Bcrypt # type: ignore
from flask_login import LoginManager # type: ignore
from flask_migrate import Migrate # type: ignore



app = Flask(__name__)

userpass = 'mysql+pymysql://root:@'
host = '127.0.0.1'
port = '3306'  # default MySQL port
dbname = '/pracadyplomowatest'
app.config['SQLALCHEMY_DATABASE_URI'] = f'{userpass}{host}:{port}{dbname}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

app.config['SECRET_KEY'] = 'ba5703a7e06598357f9a7e21'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login_page'

from fastReading import routes



# with app.app_context():
#     db.create_all()
#     db.session.commit()
#     db.session.close()
#     print('Database created!')