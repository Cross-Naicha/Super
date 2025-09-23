import mysql.connector
from utilities.sql_connection import sql_details

def insert_product(code, category, brand, base_unit, presentation_factor):
    
    STORED_PROCEDURE = "sp_insert_product"
    SUCCESS_MESSAGE = "Producto insertado con éxito"
    FAILURE_MESSAGE = "Error en la base de datos:"

    try:
        conn = mysql.connector.connect(**sql_details)
        cursor = conn.cursor()

        cursor.callproc(STORED_PROCEDURE, (code, category, brand, base_unit, presentation_factor))

        conn.commit()
        print(SUCCESS_MESSAGE)

    except mysql.connector.Error as e:
        print(FAILURE_MESSAGE, e)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def insert_instance(code, price, quantity):
    
    STORED_PROCEDURE = "sp_insert_instance"
    SUCCESS_MESSAGE = "Instancia insertada con éxito"
    FAILURE_MESSAGE = "Error en la base de datos:"

    try:
        conn = mysql.connector.connect(**sql_details)
        cursor = conn.cursor()

        cursor.callproc(STORED_PROCEDURE, (code, price, quantity))

        conn.commit()
        print(SUCCESS_MESSAGE)

    except mysql.connector.Error as e:
        print(FAILURE_MESSAGE, e)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
