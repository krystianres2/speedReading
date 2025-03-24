from flask import Flask # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
from flask_bcrypt import Bcrypt # type: ignore
from flask_login import LoginManager # type: ignore
from flask_migrate import Migrate # type: ignore
from flask_wtf.csrf import CSRFProtect # type: ignore
from flask_limiter import Limiter  # type: ignore
from flask_limiter.util import get_remote_address # type: ignore
import redis # type: ignore



app = Flask(__name__)

userpass = 'mysql+pymysql://root:@'
host = '127.0.0.1'
port = '3306'  # default MySQL port
dbname = '/fastreading'
app.config['SQLALCHEMY_DATABASE_URI'] = f'{userpass}{host}:{port}{dbname}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

app.config['SECRET_KEY'] = 'ba5703a7e06598357f9a7e21'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login_page'

# redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)

# limiter = Limiter(
#     get_remote_address,  # Rate limit based on IP address
#     app=app,
#     storage_uri="redis://localhost:6379/0",
#     default_limits=["2000 per day", "500 per hour"],  # Set default rate limits globally
# )

from fastReading import routes



# with app.app_context():
#     db.create_all()
#     db.session.commit()
#     db.session.close()
#     print('Database created!')