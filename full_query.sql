BEGIN;


CREATE TABLE IF NOT EXISTS public.todos
(
    todo_id SERIAL NOT NULL,
    description text COLLATE pg_catalog."default",
    completed boolean DEFAULT false,
    user_id integer,
    CONSTRAINT todos_pkey PRIMARY KEY (todo_id)
);

CREATE TABLE IF NOT EXISTS public.users
(
    user_id SERIAL NOT NULL,
    username VARCHAR(255) COLLATE pg_catalog."default" NOT NULL UNIQUE,
    password text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (user_id)
);

ALTER TABLE IF EXISTS public.todos
    ADD CONSTRAINT fk_user_todo FOREIGN KEY (user_id)
    REFERENCES public.users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;