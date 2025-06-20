--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Ubuntu 17.5-1.pgdg24.04+1)
-- Dumped by pg_dump version 17.5 (Ubuntu 17.5-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aspect; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aspect (
    aspect_id integer NOT NULL,
    parameter_id integer NOT NULL,
    aspect_name character varying(100) NOT NULL
);


ALTER TABLE public.aspect OWNER TO postgres;

--
-- Name: aspect_aspect_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aspect_aspect_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aspect_aspect_id_seq OWNER TO postgres;

--
-- Name: aspect_aspect_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aspect_aspect_id_seq OWNED BY public.aspect.aspect_id;


--
-- Name: assessment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment (
    assessment_id integer NOT NULL,
    chapter_id integer NOT NULL,
    assessment_date date NOT NULL,
    assessor_name character varying(100) NOT NULL,
    status character varying(20) NOT NULL,
    notes text,
    total_score numeric(5,2),
    predicate character varying(50)
);


ALTER TABLE public.assessment OWNER TO postgres;

--
-- Name: assessment_assessment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessment_assessment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessment_assessment_id_seq OWNER TO postgres;

--
-- Name: assessment_assessment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessment_assessment_id_seq OWNED BY public.assessment.assessment_id;


--
-- Name: assessment_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_detail (
    detail_id integer NOT NULL,
    assessment_id integer NOT NULL,
    sub_aspect_id integer NOT NULL,
    error_count integer DEFAULT 0
);


ALTER TABLE public.assessment_detail OWNER TO postgres;

--
-- Name: assessment_detail_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessment_detail_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessment_detail_detail_id_seq OWNER TO postgres;

--
-- Name: assessment_detail_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessment_detail_detail_id_seq OWNED BY public.assessment_detail.detail_id;


--
-- Name: assessment_parameter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_parameter (
    parameter_id integer NOT NULL,
    parameter_name character varying(100) NOT NULL
);


ALTER TABLE public.assessment_parameter OWNER TO postgres;

--
-- Name: assessment_parameter_parameter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessment_parameter_parameter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessment_parameter_parameter_id_seq OWNER TO postgres;

--
-- Name: assessment_parameter_parameter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessment_parameter_parameter_id_seq OWNED BY public.assessment_parameter.parameter_id;


--
-- Name: chapter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapter (
    chapter_id integer NOT NULL,
    chapter_name character varying(100) NOT NULL,
    weight numeric(5,2) NOT NULL,
    project_name character varying(100),
    no character varying(10)
);


ALTER TABLE public.chapter OWNER TO postgres;

--
-- Name: chapter_chapter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chapter_chapter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chapter_chapter_id_seq OWNER TO postgres;

--
-- Name: chapter_chapter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chapter_chapter_id_seq OWNED BY public.chapter.chapter_id;


--
-- Name: score_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.score_category (
    category_id integer NOT NULL,
    min_score integer NOT NULL,
    max_score integer NOT NULL,
    category_name character varying(50) NOT NULL
);


ALTER TABLE public.score_category OWNER TO postgres;

--
-- Name: score_category_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.score_category_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.score_category_category_id_seq OWNER TO postgres;

--
-- Name: score_category_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.score_category_category_id_seq OWNED BY public.score_category.category_id;


--
-- Name: sub_aspect; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_aspect (
    sub_aspect_id integer NOT NULL,
    aspect_id integer NOT NULL,
    sub_aspect_name character varying(100) NOT NULL
);


ALTER TABLE public.sub_aspect OWNER TO postgres;

--
-- Name: sub_aspect_sub_aspect_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sub_aspect_sub_aspect_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sub_aspect_sub_aspect_id_seq OWNER TO postgres;

--
-- Name: sub_aspect_sub_aspect_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sub_aspect_sub_aspect_id_seq OWNED BY public.sub_aspect.sub_aspect_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'assessor'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'assessor'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: view_project_assessments; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_project_assessments AS
 SELECT c.project_name,
    c.chapter_name,
    a.assessment_id,
    a.assessment_date,
    a.assessor_name,
    a.total_score,
    a.predicate,
    a.status
   FROM (public.chapter c
     JOIN public.assessment a ON ((a.chapter_id = c.chapter_id)))
  ORDER BY c.project_name, c.chapter_name, a.assessment_date;


ALTER VIEW public.view_project_assessments OWNER TO postgres;

--
-- Name: aspect aspect_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspect ALTER COLUMN aspect_id SET DEFAULT nextval('public.aspect_aspect_id_seq'::regclass);


--
-- Name: assessment assessment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment ALTER COLUMN assessment_id SET DEFAULT nextval('public.assessment_assessment_id_seq'::regclass);


--
-- Name: assessment_detail detail_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_detail ALTER COLUMN detail_id SET DEFAULT nextval('public.assessment_detail_detail_id_seq'::regclass);


--
-- Name: assessment_parameter parameter_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_parameter ALTER COLUMN parameter_id SET DEFAULT nextval('public.assessment_parameter_parameter_id_seq'::regclass);


--
-- Name: chapter chapter_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter ALTER COLUMN chapter_id SET DEFAULT nextval('public.chapter_chapter_id_seq'::regclass);


--
-- Name: score_category category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.score_category ALTER COLUMN category_id SET DEFAULT nextval('public.score_category_category_id_seq'::regclass);


--
-- Name: sub_aspect sub_aspect_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_aspect ALTER COLUMN sub_aspect_id SET DEFAULT nextval('public.sub_aspect_sub_aspect_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: aspect aspect_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspect
    ADD CONSTRAINT aspect_pkey PRIMARY KEY (aspect_id);


--
-- Name: assessment_detail assessment_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_detail
    ADD CONSTRAINT assessment_detail_pkey PRIMARY KEY (detail_id);


--
-- Name: assessment_parameter assessment_parameter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_parameter
    ADD CONSTRAINT assessment_parameter_pkey PRIMARY KEY (parameter_id);


--
-- Name: assessment assessment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment
    ADD CONSTRAINT assessment_pkey PRIMARY KEY (assessment_id);


--
-- Name: chapter chapter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter
    ADD CONSTRAINT chapter_pkey PRIMARY KEY (chapter_id);


--
-- Name: score_category score_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.score_category
    ADD CONSTRAINT score_category_pkey PRIMARY KEY (category_id);


--
-- Name: sub_aspect sub_aspect_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_aspect
    ADD CONSTRAINT sub_aspect_pkey PRIMARY KEY (sub_aspect_id);


--
-- Name: assessment_parameter unique_parameter_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_parameter
    ADD CONSTRAINT unique_parameter_name UNIQUE (parameter_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: aspect aspect_parameter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspect
    ADD CONSTRAINT aspect_parameter_id_fkey FOREIGN KEY (parameter_id) REFERENCES public.assessment_parameter(parameter_id);


--
-- Name: assessment assessment_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment
    ADD CONSTRAINT assessment_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapter(chapter_id);


--
-- Name: assessment_detail assessment_detail_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_detail
    ADD CONSTRAINT assessment_detail_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessment(assessment_id);


--
-- Name: assessment_detail assessment_detail_sub_aspect_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_detail
    ADD CONSTRAINT assessment_detail_sub_aspect_id_fkey FOREIGN KEY (sub_aspect_id) REFERENCES public.sub_aspect(sub_aspect_id);


--
-- Name: sub_aspect sub_aspect_aspect_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_aspect
    ADD CONSTRAINT sub_aspect_aspect_id_fkey FOREIGN KEY (aspect_id) REFERENCES public.aspect(aspect_id);


--
-- PostgreSQL database dump complete
--

