CREATE TABLE rtl_bot_schema.tb_rtl_bot_subject
	(
	id_subject SERIAL NOT NULL,
	nm_subject VARCHAR(255) NOT NULL,
	fl_active BOOLEAN NOT NULL DEFAULT TRUE,
	dt_created TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(), 
	cd_created_by CHARACTER VARYING(20) NOT NULL,
	dt_change TIMESTAMP WITHOUT TIME ZONE,
	cd_changed_by CHARACTER VARYING(20),
	
	CONSTRAINT pk_tb_rtl_bot_subject PRIMARY KEY (id_subject)

);

   

