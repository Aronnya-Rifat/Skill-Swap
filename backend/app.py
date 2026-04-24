from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db_connection

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify({"message": "Skill Swap API is running"})


# ---------------- USERS ----------------

@app.route("/register", methods=["POST"])
def register():
    data = request.json

    first_name = data.get("FirstName")
    last_name = data.get("LastName")
    email = data.get("Email")
    password_hash = data.get("PasswordHash")
    bio = data.get("Bio", "")
    trade_tokens = data.get("TradeTokens", 0)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        INSERT INTO USERS (FirstName, LastName, Email, PasswordHash, Bio, TradeTokens)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (first_name, last_name, email, password_hash, bio, trade_tokens))
        conn.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()


@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("Email")
    password_hash = data.get("PasswordHash")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT UserID, FirstName, LastName, Email, Bio, TradeTokens
    FROM USERS
    WHERE Email = %s AND PasswordHash = %s
    """

    cursor.execute(query, (email, password_hash))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user:
        return jsonify({"message": "Login successful", "user": user}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401


@app.route("/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT UserID, FirstName, LastName, Email, Bio, TradeTokens FROM USERS")
    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(users)


# ---------------- SKILLS ----------------

@app.route("/skills", methods=["GET"])
def get_skills():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM SKILLS")
    skills = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(skills)


@app.route("/skills", methods=["POST"])
def add_skill():
    data = request.json

    skill_name = data.get("SkillName")
    category = data.get("Category")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        INSERT INTO SKILLS (SkillName, Category)
        VALUES (%s, %s)
        """
        cursor.execute(query, (skill_name, category))
        conn.commit()

        return jsonify({"message": "Skill added successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()


# ---------------- USER OFFERS ----------------

@app.route("/users/<int:user_id>/offers", methods=["GET"])
def get_user_offers(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT uo.UserID, uo.SkillID, s.SkillName, s.Category, uo.ProficiencyLevel
    FROM USER_OFFERS uo
    JOIN SKILLS s ON uo.SkillID = s.SkillID
    WHERE uo.UserID = %s
    """

    cursor.execute(query, (user_id,))
    offers = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(offers)


@app.route("/users/<int:user_id>/offers", methods=["POST"])
def add_user_offer(user_id):
    data = request.json

    skill_id = data.get("SkillID")
    proficiency_level = data.get("ProficiencyLevel")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        INSERT INTO USER_OFFERS (UserID, SkillID, ProficiencyLevel)
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (user_id, skill_id, proficiency_level))
        conn.commit()

        return jsonify({"message": "Offered skill added successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()


# ---------------- USER WANTS ----------------

@app.route("/users/<int:user_id>/wants", methods=["GET"])
def get_user_wants(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT uw.UserID, uw.SkillID, s.SkillName, s.Category
    FROM USER_WANTS uw
    JOIN SKILLS s ON uw.SkillID = s.SkillID
    WHERE uw.UserID = %s
    """

    cursor.execute(query, (user_id,))
    wants = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(wants)


@app.route("/users/<int:user_id>/wants", methods=["POST"])
def add_user_want(user_id):
    data = request.json

    skill_id = data.get("SkillID")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        INSERT INTO USER_WANTS (UserID, SkillID)
        VALUES (%s, %s)
        """
        cursor.execute(query, (user_id, skill_id))
        conn.commit()

        return jsonify({"message": "Wanted skill added successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()


# ---------------- SWAP REQUESTS ----------------

@app.route("/swap-requests", methods=["POST"])
def create_swap_request():
    data = request.json

    sender_id = data.get("SenderID")
    receiver_id = data.get("ReceiverID")
    wanted_skill_id = data.get("WantedSkillID")
    offered_skill_id = data.get("OfferedSkillID")
    status = data.get("Status", "Pending")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        INSERT INTO SWAP_REQUESTS
        (SenderID, ReceiverID, WantedSkillID, OfferedSkillID, Status)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (sender_id, receiver_id, wanted_skill_id, offered_skill_id, status))
        conn.commit()

        return jsonify({"message": "Swap request sent successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()


@app.route("/swap-requests/user/<int:user_id>", methods=["GET"])
def get_user_swap_requests(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT *
    FROM SWAP_REQUESTS
    WHERE SenderID = %s OR ReceiverID = %s
    """

    cursor.execute(query, (user_id, user_id))
    requests = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(requests)


@app.route("/swap-requests/<int:request_id>/status", methods=["PUT"])
def update_swap_status(request_id):
    data = request.json

    status = data.get("Status")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        UPDATE SWAP_REQUESTS
        SET Status = %s
        WHERE RequestID = %s
        """
        cursor.execute(query, (status, request_id))
        conn.commit()

        return jsonify({"message": "Swap request status updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()


# ---------------- REVIEWS ----------------

@app.route("/reviews", methods=["POST"])
def add_review():
    data = request.json

    swap_id = data.get("SwapID")
    reviewer_id = data.get("ReviewerID")
    reviewee_id = data.get("RevieweeID")
    rating = data.get("Rating")
    comment = data.get("Comment", "")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        query = """
        INSERT INTO REVIEWS (SwapID, ReviewerID, RevieweeID, Rating, Comment)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (swap_id, reviewer_id, reviewee_id, rating, comment))
        conn.commit()

        return jsonify({"message": "Review added successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()


@app.route("/reviews/user/<int:user_id>", methods=["GET"])
def get_user_reviews(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT *
    FROM REVIEWS
    WHERE RevieweeID = %s
    """

    cursor.execute(query, (user_id,))
    reviews = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(reviews)


if __name__ == "__main__":
    app.run(debug=True)