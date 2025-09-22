CREATE VIEW v_prices AS
SELECT 
	products.category,
    products.brand,
    instances.price AS `p_price`,
    CASE
		WHEN instances.quantity = 1 THEN 
			ROUND(normalized_price(products.base_unit, products.presentation_factor, instances.price), 2) 
            ELSE
			ROUND(standarized_price(instances.quantity, instances.price), 2)
		END AS 'f_price',
    CONCAT(
		products.presentation_factor, ' ',
        products.base_unit
    ) AS 'presentation'
FROM
	products
JOIN
	instances ON instances.product_id = products.id_product
;