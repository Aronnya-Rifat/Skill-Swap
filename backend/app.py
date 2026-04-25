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

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO users (firstname, lastname, email, passwordhash, bio, tradetokens)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING userid
            """,
            (
                data.get("FirstName"),
                data.get("LastName"),
                data.get("Email"),
                data.get("PasswordHash"),
                data.get("Bio", ""),
                data.get("TradeTokens", 10),
            ),
        )

        user = cursor.fetchone()
        conn.commit()

        return jsonify({
            "message": "User registered successfully",
            "UserID": user["userid"]
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()


@app.route("/login", methods=["POST"])
def login():
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT userid, firstname, lastname, email, bio, tradetokens
            FROM users
            WHERE email = %s AND passwordhash = %s
            """,
            (data.get("Email"), data.get("PasswordHash")),
        )

        user = cursor.fetchone()

        if user:
            return jsonify({"message": "Login successful", "user": user}), 200

        return jsonify({"message": "Invalid email or password"}), 401

    finally:
        cursor.close()
        conn.close()


@app.route("/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT 
            userid AS "UserID",
            firstname AS "FirstName",
            lastname AS "LastName",
            email AS "Email",
            bio AS "Bio",
            tradetokens AS "TradeTokens"
        FROM users
        ORDER BY userid DESC
        """
    )

    users = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(users)


# ---------------- SKILLS ----------------

@app.route("/skills", methods=["GET"])
def get_skills():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT 
            skillid AS "SkillID",
            skillname AS "SkillName",
            category AS "Category"
        FROM skills
        ORDER BY skillid DESC
        """
    )

    skills = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(skills)


@app.route("/skills", methods=["POST"])
def add_skill():
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO skills (skillname, category)
            VALUES (%s, %s)
            RETURNING skillid
            """,
            (data.get("SkillName"), data.get("Category")),
        )

        skill = cursor.fetchone()
        conn.commit()

        return jsonify({
            "message": "Skill added successfully",
            "SkillID": skill["skillid"]
        }), 201

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
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT 
            uo.userid AS "UserID",
            uo.skillid AS "SkillID",
            s.skillname AS "SkillName",
            s.category AS "Category",
            uo.proficiencylevel AS "ProficiencyLevel"
        FROM user_offers uo
        JOIN skills s ON uo.skillid = s.skillid
        WHERE uo.userid = %s
        """,
        (user_id,),
    )

    offers = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(offers)


@app.route("/users/<int:user_id>/offers", methods=["POST"])
def add_user_offer(user_id):
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO user_offers (userid, skillid, proficiencylevel)
            VALUES (%s, %s, %s)
            """,
            (user_id, data.get("SkillID"), data.get("ProficiencyLevel")),
        )

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
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT 
            uw.userid AS "UserID",
            uw.skillid AS "SkillID",
            s.skillname AS "SkillName",
            s.category AS "Category"
        FROM user_wants uw
        JOIN skills s ON uw.skillid = s.skillid
        WHERE uw.userid = %s
        """,
        (user_id,),
    )

    wants = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(wants)


@app.route("/users/<int:user_id>/wants", methods=["POST"])
def add_user_want(user_id):
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO user_wants (userid, skillid)
            VALUES (%s, %s)
            """,
            (user_id, data.get("SkillID")),
        )

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

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO swap_requests
            (senderid, receiverid, wantedskillid, offeredskillid, status)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING requestid
            """,
            (
                data.get("SenderID"),
                data.get("ReceiverID"),
                data.get("WantedSkillID"),
                data.get("OfferedSkillID"),
                data.get("Status", "Pending"),
            ),
        )

        swap = cursor.fetchone()
        conn.commit()

        return jsonify({
            "message": "Swap request sent successfully",
            "RequestID": swap["requestid"]
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()


@app.route("/swap-requests/user/<int:user_id>", methods=["GET"])
def get_user_swap_requests(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT 
            requestid AS "RequestID",
            senderid AS "SenderID",
            receiverid AS "ReceiverID",
            wantedskillid AS "WantedSkillID",
            offeredskillid AS "OfferedSkillID",
            status AS "Status"
        FROM swap_requests
        WHERE senderid = %s OR receiverid = %s
        ORDER BY requestid DESC
        """,
        (user_id, user_id),
    )

    requests = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(requests)


@app.route("/swap-requests/<int:request_id>/status", methods=["PUT"])
def update_swap_status(request_id):
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE swap_requests
            SET status = %s
            WHERE requestid = %s
            """,
            (data.get("Status"), request_id),
        )

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

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO reviews (swapid, reviewerid, revieweeid, rating, comment)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING reviewid
            """,
            (
                data.get("SwapID"),
                data.get("ReviewerID"),
                data.get("RevieweeID"),
                data.get("Rating"),
                data.get("Comment", ""),
            ),
        )

        review = cursor.fetchone()
        conn.commit()

        return jsonify({
            "message": "Review added successfully",
            "ReviewID": review["reviewid"]
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()


@app.route("/reviews/user/<int:user_id>", methods=["GET"])
def get_user_reviews(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT 
            reviewid AS "ReviewID",
            swapid AS "SwapID",
            reviewerid AS "ReviewerID",
            revieweeid AS "RevieweeID",
            rating AS "Rating",
            comment AS "Comment"
        FROM reviews
        WHERE revieweeid = %s
        ORDER BY reviewid DESC
        """,
        (user_id,),
    )

    reviews = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(reviews)


if __name__ == "__main__":
    app.run(debug=True)
