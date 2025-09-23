-- CREATE VIEW v_historic_prices AS
WITH cte_prices AS (
SELECT 
	products.branch,
    CONCAT(products.category, ' ', products.presentation_factor, products.base_unit, ' - ', products.brand) AS `product`,
    instances.price AS `p_price`,
    CASE
		WHEN instances.quantity = 1 THEN 
			ROUND(normalized_price(products.base_unit, products.presentation_factor, instances.price), 2) 
            ELSE
			ROUND(standarized_price(instances.quantity, instances.price), 2)
		END AS 'f_price',
        instances.date AS price_date
FROM
	products
JOIN
	instances ON instances.product_id = products.id_product)

SELECT 
	branch,
    product,
    round(avg(p_price),2) AS p_price, 
    max(f_price) AS f_price,
    price_date
FROM 
	cte_prices
GROUP BY
	branch, product, price_date
;