from upload_class import Item

while True:

    # inputs
    code = input('code')
    category = input('category')
    brand = input('brand')
    base_unit = input('base_unit')
    presentation_factor = input('presentation_factor')
    price = input('price')
    quantity = 1 if (quantity := input('quantity')) == '' else quantity

    # inputs transformations
    code = int(code)
    presentation_factor = int(presentation_factor)
    price = float(price)
    quantity = int(quantity)

    # logic
    p = Item(code, category, brand, base_unit, presentation_factor)
    p.upload_product_BD()

    p.new_instance(price, quantity)
    p.upload_instance_BD()

    if input('Seguir?') != '': break
    