CREATE TABLE rtl_bot_schema.tb_rtl_bot_check_list
	(
	id_check_list SERIAL NOT NULL,
	ds_check_list VARCHAR(255) NOT NULL,
	id_subject INTEGER NOT NULL,
	tp_data VARCHAR(3) NOT NULL CHECK (tp_data in ('BOO','NUM', 'TEX')),
	fl_active BOOLEAN DEFAULT TRUE,
	dt_created TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(), 
	cd_created_by CHARACTER VARYING(20) NOT NULL,
	dt_change TIMESTAMP WITHOUT TIME ZONE,
	cd_changed_by CHARACTER VARYING(20),
	
	CONSTRAINT pk_tb_rtl_bot_check_list PRIMARY KEY (id_check_list),

         CONSTRAINT fk_tb_rtl_bot_id_subject FOREIGN KEY (id_subject)
	 REFERENCES rtl_bot_schema.tb_rtl_bot_subject (id_subject) MATCH SIMPLE
	 ON UPDATE NO ACTION
	 ON DELETE NO ACTION

);

    CREATE INDEX ix_fk_tb_rtl_bot_store_user_id_subject
    ON rtl_bot_schema.tb_rtl_bot_subject USING btree
    (id_subject)
    WITH (FILLFACTOR=90);


   

