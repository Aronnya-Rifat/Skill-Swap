import mysql.connector


def get_db_connection():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",          # put your MariaDB password here
        database="skill_swap" # change this if your DB name is different
    )

    return connection