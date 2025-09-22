from upload_functions import insert_instance, insert_product

class Item:
    
    # Product
    def __init__(self, code, category, brand, base_unit, presentation_factor):
        
        self.code = code
        self.category = category
        self.brand = brand
        self.base_unit = base_unit
        self.presentation_factor = presentation_factor
        self.price = False
        self.instances = 1

    def upload_product_BD(self):
        insert_product(self.code, self.category, self.brand, self.base_unit, self.presentation_factor)

    # Instance
    def new_instance(self, price, quantity = 1):
        
        self.quantity = quantity
        
        if quantity > 1:
            self.instances = quantity
        elif quantity < 1:
            self.price = price * quantity
        else:
            self.price = price
    
    def upload_instance_BD(self):
        for _ in range(self.instances):
            insert_instance(self.code, self.price, self.quantity)