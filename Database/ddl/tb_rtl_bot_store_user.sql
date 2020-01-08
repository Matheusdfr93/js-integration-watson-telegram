CREATE TABLE rtl_bot_schema.tb_rtl_bot_store_user
	(
	id_store_user SERIAL NOT NULL,
	id_store INTEGER NOT NULL,
	cd_user VARCHAR(255) NOT NULL,
	id_sector INTEGER NOT NULL,
	fl_active BOOLEAN NOT NULL DEFAULT TRUE,
	dt_created TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(), 
	cd_created_by CHARACTER VARYING(20) NOT NULL,
	dt_change TIMESTAMP WITHOUT TIME ZONE,
	cd_changed_by CHARACTER VARYING(20),
	CONSTRAINT pk_tb_rtl_bot_store_user PRIMARY KEY (id_store_user),
	
	 CONSTRAINT fk_tb_rtl_bot_store_user_id_store FOREIGN KEY (id_store)
	 REFERENCES rtl_bot_schema.tb_rtl_bot_store (id_store) MATCH SIMPLE
	 ON UPDATE NO ACTION
	 ON DELETE NO ACTION,

	 CONSTRAINT fk_tb_rtl_bot_store_user_id_sector FOREIGN KEY (id_sector)
	 REFERENCES rtl_bot_schema.tb_rtl_bot_sector (id_sector) MATCH SIMPLE
	 ON UPDATE NO ACTION
	 ON DELETE NO ACTION,
	 
	 CONSTRAINT fk_tb_rtl_bot_store_user_cd_user FOREIGN KEY (cd_user)
	 REFERENCES rtl_bot_schema.tb_rtl_bot_user (cd_user) MATCH SIMPLE
	 ON UPDATE NO ACTION
	 ON DELETE NO ACTION
	
);
    CREATE INDEX ix_fk_tb_rtl_bot_store_user_id_store
    ON rtl_bot_schema.tb_rtl_bot_store USING btree
    (id_store)
    WITH (FILLFACTOR=90);

    CREATE INDEX ix_fk_tb_rtl_bot_store_user_id_sector
    ON rtl_bot_schema.tb_rtl_bot_sector USING btree
    (id_sector)
    WITH (FILLFACTOR=90);
    
    CREATE INDEX ix_fk_tb_rtl_bot_store_user_cd_user
    ON rtl_bot_schema.tb_rtl_bot_user USING btree
    (cd_user COLLATE pg_catalog."default")
    WITH (FILLFACTOR=90);    

