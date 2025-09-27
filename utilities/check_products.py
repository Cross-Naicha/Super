import mysql.connector
from sql_connection import sql_details

def check_product():
    
    QUERY = "SELECT * FROM mercado.products;"
    SUCCESS_MESSAGE = "Consulta lograda con éxito"
    FAILURE_MESSAGE = "Error en la base de datos:"

    try:
        conn = mysql.connector.connect(**sql_details)
        cursor = conn.cursor()

        cursor.execute(QUERY)
        results = cursor.fetchall()
        print(SUCCESS_MESSAGE)

    except mysql.connector.Error as e:
        print(FAILURE_MESSAGE, e)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    registered_codes = dict()
    for product in results:
        code, branch, category, brand, base_unit, presentation_factor = product
        registered_codes[code] = {'branch': branch,'category':category,'brand':brand,'base_unit':base_unit,'presentation_factor':presentation_factor}

    return registered_codes