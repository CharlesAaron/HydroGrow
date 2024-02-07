from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_mysqldb import MySQL
from datetime import datetime

app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'hydrogrow'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)

app.secret_key = 'wilddogs'

@app.route('/')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':

        fname = request.form['signup-name']
        email = request.form['signup-email']
        birthday = request.form['signup-birthday']
        uname = request.form['signup-username']
        password = request.form['signup-password']

        cur = mysql.connection.cursor()

        cur.execute("INSERT INTO account (fname, email, birthday, uname, password) VALUES (%s, %s, %s, %s, %s)",
                    (fname, email, birthday, uname, password))

        mysql.connection.commit()
        cur.close()

        return redirect(url_for('Login'))  # Redirect to the login page after signup

    return render_template('signup.html')
    
@app.route('/Login', methods=['GET', 'POST'])
def Login():
    if request.method == 'POST':
        
        uname = request.form['login-username']
        password = request.form['login-password']

        cur = mysql.connection.cursor()

        cur.execute("SELECT * FROM account WHERE uname = %s AND password = %s", (uname, password))
        user = cur.fetchone()

        cur.close()

        if user:
            
            session['username'] = uname

            
            return redirect(url_for('homepage'))
        else:
            
            return render_template('Login.html', error_message='Invalid username or password')

    return render_template('Login.html')

@app.route('/dashboard')
def dashboard():
    try:

        cur = mysql.connection.cursor()
   
        cur.execute("SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1")
        latest_data = cur.fetchone()

        cur.close()

        return render_template('dashboard.html', latest_data=latest_data)

    except Exception as e:

        return render_template('error.html', error_message=str(e))

@app.route('/settings')
def settings():
    return render_template('settings.html')
    
@app.route('/gallery')
def gallery():
    return render_template('gallery.html')

@app.route('/homepage')
def homepage():
    return render_template('homepage.html')
    
@app.route('/profile')
def profile():
    try:
        if 'username' in session:
            
            cur = mysql.connection.cursor()

            cur.execute("SELECT uname, fname, birthday, email FROM account WHERE uname = %s", (session['username'],))
            user_data = cur.fetchone()

            cur.close()

            return render_template('profile.html', user_data=user_data)
        else:
            return redirect(url_for('login'))

    except Exception as e:
        
        return render_template('error.html', error_message=str(e))

@app.route('/set_dummy_data', methods=['POST'])
def set_dummy_data():
    try:
        data = request.json

        temperature = data.get('temperature')
        humidity = data.get('humidity')
        ph = data.get('ph')
        water = data.get('water')
        nutrient = data.get('nutrient')

        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO sensor_data (temperature, humidity, ph, water, nutrient) VALUES (%s, %s, %s, %s, %s)", (temperature, humidity, ph, water, nutrient))
        mysql.connection.commit()

        cur.execute("SELECT timestamp FROM sensor_data WHERE id = %s", (cur.lastrowid,))
        timestamp = cur.fetchone()['timestamp']
        cur.close()

        return jsonify({'message': 'Dummy data set successfully', 'timestamp': timestamp})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
        
@app.route('/get_sensor_data', methods=['GET', 'POST'])
def get_sensor_data():
    if request.method == 'GET':
        try:
            
            cur = mysql.connection.cursor()

            start_date = request.args.get('startDate')
            start_time = request.args.get('startTime')
            end_date = request.args.get('endDate')
            end_time = request.args.get('endTime')

            cur.execute("SELECT timestamp, temperature, humidity, ph, water, nutrient FROM sensor_data WHERE timestamp BETWEEN %s AND %s ORDER BY timestamp",
                        (f"{start_date} {start_time}", f"{end_date} {end_time}"))

            data = cur.fetchall()

            cur.close()

            result = [['Timestamp', 'Temperature', 'Humidity', 'pH', 'Water', 'Nutrient']]
          
            for row in data:
                result.append([str(row['timestamp']), row['temperature'], row['humidity'], row['ph'], row['water'], row['nutrient']])

            return jsonify({'data': result})

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    elif request.method == 'POST':
        
        pass
        
if __name__ == '__main__':
    app.run(debug=True)