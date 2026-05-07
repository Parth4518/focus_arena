import os
import json
from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    session,
    redirect
)
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = "focusarena-secret"

UPLOAD_FOLDER = "static/uploads"
DB_FILE = "users.json"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# ---------------- database ----------------

def load_users():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except:
                return {}
    return {}


def save_users():
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(users_db, f, indent=2)


users_db = load_users()


# ---------------- helpers ----------------

def logged_in():
    username = session.get("username")
    return bool(username and username in users_db)


def current_username():
    username = session.get("username")

    if not username:
        return None

    if username not in users_db:
        session.clear()
        return None

    return username


def current_user():
    username = current_username()

    if not username:
        return None

    return users_db.get(username)


# ---------------- pages ----------------

@app.route("/")
def login_page():
    return render_template("login.html")


@app.route("/dashboard")
def dashboard():
    if not logged_in():
        session.clear()
        return redirect("/")
    return render_template("dashboard.html")


@app.route("/leaderboard_page")
def leaderboard_page():
    if not logged_in():
        session.clear()
        return redirect("/")
    return render_template("leaderboard.html")


@app.route("/profile")
def profile():
    if not logged_in():
        session.clear()
        return redirect("/")
    return render_template("profile.html")


@app.route("/settings")
def settings():
    if not logged_in():
        session.clear()
        return redirect("/")
    return render_template("settings.html")


# ---------------- auth ----------------

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"message": "Enter username and password"})

    if username in users_db:
        return jsonify({"message": "User already exists"})

    users_db[username] = {
        "password": password,
        "profile": {
            "avatar": "",
            "accent": "#38bdf8"
        },
        "stats": {
            "streak": 0
        },
        "sessions": []
    }

    save_users()

    return jsonify({"message": "Signup successful"})


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"message": "Enter username and password"})

    if username not in users_db:
        return jsonify({"message": "User not found"})

    if users_db[username]["password"] != password:
        return jsonify({"message": "Wrong password"})

    session.clear()
    session["username"] = username

    return jsonify({
        "message": "Login successful",
        "username": username
    })


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


# ---------------- user info ----------------

@app.route("/me")
def me():
    username = current_username()

    if not username:
        return jsonify({})

    user = users_db[username]

    return jsonify({
        "username": username,
        "avatar": user["profile"]["avatar"],
        "accent": user["profile"]["accent"],
        "streak": user["stats"]["streak"]
    })


# ---------------- save session ----------------

@app.route("/save_session", methods=["POST"])
def save_session():
    username = current_username()

    if not username:
        return jsonify({"message": "Not logged in"})

    data = request.get_json(silent=True) or {}

    minutes = int(data.get("minutes", 0))
    pauses = int(data.get("pauses", 0))
    score = int(data.get("score", 0))

    users_db[username]["sessions"].append({
        "minutes": minutes,
        "pauses": pauses,
        "score": score
    })

    if minutes >= 30:
        users_db[username]["stats"]["streak"] += 1

    save_users()

    return jsonify({"message": "Session saved"})


# ---------------- leaderboard ----------------

@app.route("/leaderboard")
def leaderboard():
    board = []

    for username, user in users_db.items():
        total_score = sum(
            s["score"] for s in user["sessions"]
        )

        board.append({
            "name": username,
            "score": total_score,
            "avatar": user["profile"]["avatar"]
        })

    board.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return jsonify(board)


# ---------------- avatar upload ----------------

@app.route("/upload_avatar", methods=["POST"])
def upload_avatar():
    username = current_username()

    if not username:
        return jsonify({"message": "Not logged in"})

    if "avatar" not in request.files:
        return jsonify({"message": "No file"})

    file = request.files["avatar"]

    if file.filename == "":
        return jsonify({"message": "No selected file"})

    filename = secure_filename(file.filename)
    filename = f"{username}_{filename}"

    path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        filename
    )

    file.save(path)

    users_db[username]["profile"]["avatar"] = "/" + path.replace("\\", "/")

    save_users()

    return jsonify({
        "message": "Uploaded",
        "avatar": users_db[username]["profile"]["avatar"]
    })


# ---------------- theme ----------------

@app.route("/save_theme", methods=["POST"])
def save_theme():
    username = current_username()

    if not username:
        return jsonify({"message": "Not logged in"})

    data = request.get_json(silent=True) or {}

    accent = data.get("accent", "#38bdf8")

    users_db[username]["profile"]["accent"] = accent

    save_users()

    return jsonify({"message": "Theme saved"})


# ---------------- profile data ----------------

@app.route("/profile_data")
def profile_data():
    username = current_username()

    if not username:
        return jsonify({})

    user = users_db[username]
    sessions = user["sessions"]

    best = 0
    avg = 0

    if sessions:
        scores = [s["score"] for s in sessions]
        best = max(scores)
        avg = round(sum(scores) / len(scores), 2)

    return jsonify({
        "username": username,
        "avatar": user["profile"]["avatar"],
        "streak": user["stats"]["streak"],
        "total_sessions": len(sessions),
        "best_score": best,
        "average_score": avg,
        "sessions": sessions[-5:]
    })


# ---------------- run ----------------

if __name__ == "__main__":
    app.run(debug=False)