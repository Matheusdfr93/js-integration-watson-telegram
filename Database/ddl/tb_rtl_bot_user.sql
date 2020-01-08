CREATE TABLE rtl_bot_schema.tb_rtl_bot_user
(
	cd_user VARCHAR(255) NOT NULL,
	nr_national_registry CHAR(11) NOT NULL,
	nm_user VARCHAR(255) NOT NULL,
	nm_family VARCHAR(255),
	nm_telegram CHARACTER VARYING(25) NOT NULL,
	nb_telephone VARCHAR (20),
	fl_active BOOLEAN NOT NULL DEFAULT TRUE,
	dt_created IMESTAMP WITHOUT TIME ZONE DEFAULT NOW(), 
	cd_created_by CHARACTER VARYING(20) NOT NULL,
	dt_change TIMESTAMP WITHOUT TIME ZONE,
	cd_changed_by CHARACTER VARYING(20),
	CONSTRAINT pk_tb_rtl_bot_user PRIMARY KEY (cd_user)
);