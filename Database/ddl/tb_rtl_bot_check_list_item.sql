CREATE TABLE rtl_bot_schema.tb_rtl_bot_check_list_item
	(
	id_check_list_item SERIAL NOT NULL,
	id_check_list INTEGER NOT NULL,
	fl_active BOOLEAN NOT NULL DEFAULT TRUE,
	dt_create TIMESTAMP,
	cd_created_by VARCHAR NOT NULL,
	dt_change TIMESTAMP,
	cd_changed_by VARCHAR,
	
	 CONSTRAINT pk_tb_rtl_bot_check_list_item PRIMARY KEY (id_check_list_item),

	 CONSTRAINT fk_tb_rtl_bot_store_user_id_check_list FOREIGN KEY (id_check_list)
	 REFERENCES rtl_bot_schema.tb_rtl_bot_check_list (id_check_list) MATCH SIMPLE
	 ON UPDATE NO ACTION
	 ON DELETE NO ACTION

);


    CREATE INDEX ix_fk_tb_rtl_bot_store_user_id_check_list
    ON rtl_bot_schema.tb_rtl_bot_check_list USING btree
    (id_check_list)
    WITH (FILLFACTOR=90);



   

