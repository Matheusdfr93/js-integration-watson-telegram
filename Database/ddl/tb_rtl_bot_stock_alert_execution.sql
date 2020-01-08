CREATE TABLE rtl_bot_schema.tb_rtl_bot_stock_alert_execution
	(
	id_execution SERIAL NOT NULL,
	id_alert INTEGER NOT NULL,
	id_check_list INTEGER NOT NULL,
	id_check_list_item INTEGER NOT NULL,
	dt_execution TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	cd_user VARCHAR NOT NULL,
	
	CONSTRAINT pk_tb_rtl_bot_stock_alert_execution PRIMARY KEY (id_execution),

         CONSTRAINT fk_tb_rtl_bot_store_user_id_stock_alert FOREIGN KEY (id_alert)
	 REFERENCES rtl_bot_schema.tb_rtl_bot_stock_alert (id_alert) MATCH SIMPLE
	 ON UPDATE NO ACTION
	 ON DELETE NO ACTION,

	 CONSTRAINT fk_tb_rtl_bot_store_user_id_check_list FOREIGN KEY (id_check_list)
	 REFERENCES rtl_bot_schema.tb_rtl_bot_check_list (id_check_list) MATCH SIMPLE
	 ON UPDATE NO ACTION
	 ON DELETE NO ACTION,
	 
	 CONSTRAINT fk_tb_rtl_bot_store_user_id_check_list_item FOREIGN KEY (id_check_list_item)
	 REFERENCES rtl_bot_schema.tb_rtl_bot_check_list_item (id_check_list_item) MATCH SIMPLE
	 ON UPDATE NO ACTION
	 ON DELETE NO ACTION,

	 CONSTRAINT fk_tb_rtl_bot_store_user_cd_user FOREIGN KEY (cd_user)
	 REFERENCES rtl_bot_schema.tb_rtl_bot_user (cd_user) MATCH SIMPLE
	 ON UPDATE NO ACTION
	 ON DELETE NO ACTION	 

);

    CREATE INDEX ix_fk_tb_rtl_bot_store_user_id_alert
    ON rtl_bot_schema.tb_rtl_bot_stock_alert USING btree
    (id_alert)
    WITH (FILLFACTOR=90);

    --CREATE INDEX ix_fk_tb_rtl_bot_store_user_id_check_list
    --ON rtl_bot_schema.tb_rtl_bot_check_list USING btree
    --(id_check_list)
    --WITH (FILLFACTOR=90);

    CREATE INDEX ix_fk_tb_rtl_bot_store_user_id_check_list_item
    ON rtl_bot_schema.tb_rtl_bot_check_list_item USING btree
    (id_check_list_item)
    WITH (FILLFACTOR=90);    
    
    --CREATE INDEX ix_fk_tb_rtl_bot_store_user_cd_user
    --ON rtl_bot_schema.tb_rtl_bot_user USING btree
    --(cd_user COLLATE pg_catalog."default")
    --WITH (FILLFACTOR=90);    


   

