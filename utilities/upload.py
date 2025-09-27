import json
from upload_class import Item
from check_products import check_product

ACTUAL_TICKET = r"C:\Users\nical\OneDrive\Coding\Super\data\receipts\new_receipt.json"

def auto_complete(current_product, dimension, condition):
    return current_product[dimension] if condition else input(dimension)

def open_json(path=ACTUAL_TICKET):
    with open(path, "r", encoding="utf-8") as json_file:
        return json.load(json_file)

database = check_product()
actual_ticket = open_json()

for code in actual_ticket:

    CONDITION = False
    print('Codigo', code)
    current_ticket_product = actual_ticket[code]

    code = int(code)
    try: 
        current_product = database[code]
        CONDITION = True
    except:
        current_product = ...

    category = auto_complete(current_product, 'category', CONDITION)
    brand = auto_complete(current_product, 'brand', CONDITION)
    base_unit = auto_complete(current_product, 'base_unit', CONDITION)
    presentation_factor = auto_complete(current_product, 'presentation_factor', CONDITION)

    price = current_ticket_product['Price']
    print(price)
    # quantity = 1 if (quantity := input('quantity')) == '' else quantity
    quantity = current_ticket_product['Units']

    # inputs transformations
    code = int(code)
    presentation_factor = float(presentation_factor)
    price = float(price)
    print(price)
    quantity = int(quantity)

    # logic
    p = Item(code, category, brand, base_unit, presentation_factor)
    p.upload_product_BD()

    p.new_instance(price, quantity)
    p.upload_instance_BD()

    if input('Seguir?') != '': break
    