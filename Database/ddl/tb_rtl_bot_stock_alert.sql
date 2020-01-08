CREATE TABLE rtl_bot_schema.tb_rtl_bot_stock_alert
	(
	id_alert SERIAL NOT NULL,
	id_store INTEGER NOT NULL,
	id_sector INTEGER NOT NULL,
	cd_sku VARCHAR NOT NULL,
	cd_ean VARCHAR NOT NULL,
	ds_product VARCHAR,
	tp_kpi VARCHAR(3) NOT NULL  CHECK (tp_kpi in ('ED', 'EV', 'RUP')), 
	dt_reference TIMESTAMP NOT NULL,
	dt_end TIMESTAMP,
	fl_active BOOLEAN NOT NULL DEFAULT TRUE,
	dt_create TIMESTAMP NOT NULL,
	
	CONSTRAINT pk_tb_rtl_bot_stock_alert PRIMARY KEY (id_alert),

         CONSTRAINT fk_tb_rtl_bot_store_user_id_store FOREIGN KEY (id_store)
	 REFERENCES rtl_bot_schema.tb_rtl_bot_store (id_store) MATCH SIMPLE
	 ON UPDATE NO ACTION
	 ON DELETE NO ACTION,

	 CONSTRAINT fk_tb_rtl_bot_store_user_id_sector FOREIGN KEY (id_sector)
	 REFERENCES rtl_bot_schema.tb_rtl_bot_sector (id_sector) MATCH SIMPLE
	 ON UPDATE NO ACTION
	 ON DELETE NO ACTION

);

    --CREATE INDEX ix_fk_tb_rtl_bot_store_user_id_store
    --ON rtl_bot_schema.tb_rtl_bot_store USING btree
    --(/id_store)
    --WITH (FILLFACTOR=90);

    CREATE INDEX ix_fk_tb_rtl_bot_sector_user_id_sector
    ON rtl_bot_schema.tb_rtl_bot_sector USING btree
    (id_sector)
    WITH (FILLFACTOR=90);    


   

