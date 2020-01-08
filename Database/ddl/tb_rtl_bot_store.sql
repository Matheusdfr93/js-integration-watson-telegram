CREATE TABLE rtl_bot_schema.tb_rtl_bot_store
(
	id_store SERIAL NOT NULL,
	nr_national_registry CHAR(14) NOT NULL,
	nm_store VARCHAR NOT NULL,
	nm_fantasy VARCHAR NULL,
	ds_adress VARCHAR,
	nm_district VARCHAR,
	nm_city VARCHAR,
	cd_state CHAR(2),
	cd_zip CHAR(8),
	vl_latitude DECIMAL,
	vl_longitude DECIMAL,
	ds_status VARCHAR,
	CONSTRAINT pk_tb_rtl_bot_store PRIMARY KEY (id_store)
);