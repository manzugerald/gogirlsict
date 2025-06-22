--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-06-21 19:08:21

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

--
-- TOC entry 5 (class 2615 OID 25640)
-- Name: public; Type: SCHEMA; Schema: -; Owner: Admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO "Admin";

--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: Admin
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 861 (class 1247 OID 25662)
-- Name: PublishStatus; Type: TYPE; Schema: public; Owner: Admin
--

CREATE TYPE public."PublishStatus" AS ENUM (
    'draft',
    'published'
);


ALTER TYPE public."PublishStatus" OWNER TO "Admin";

--
-- TOC entry 864 (class 1247 OID 25668)
-- Name: Role; Type: TYPE; Schema: public; Owner: Admin
--

CREATE TYPE public."Role" AS ENUM (
    'viewer',
    'contributor',
    'admin'
);


ALTER TYPE public."Role" OWNER TO "Admin";

--
-- TOC entry 858 (class 1247 OID 25655)
-- Name: Status; Type: TYPE; Schema: public; Owner: Admin
--

CREATE TYPE public."Status" AS ENUM (
    'active',
    'completed',
    'paused'
);


ALTER TYPE public."Status" OWNER TO "Admin";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 25687)
-- Name: HomePage; Type: TABLE; Schema: public; Owner: Admin
--

CREATE TABLE public."HomePage" (
    id integer NOT NULL,
    "heroVideo" text NOT NULL,
    vision text NOT NULL,
    mission text NOT NULL,
    focus text NOT NULL,
    "coreValues" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HomePage" OWNER TO "Admin";

--
-- TOC entry 220 (class 1259 OID 25686)
-- Name: HomePage_id_seq; Type: SEQUENCE; Schema: public; Owner: Admin
--

CREATE SEQUENCE public."HomePage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."HomePage_id_seq" OWNER TO "Admin";

--
-- TOC entry 4933 (class 0 OID 0)
-- Dependencies: 220
-- Name: HomePage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Admin
--

ALTER SEQUENCE public."HomePage_id_seq" OWNED BY public."HomePage".id;


--
-- TOC entry 223 (class 1259 OID 25697)
-- Name: Message; Type: TABLE; Schema: public; Owner: Admin
--

CREATE TABLE public."Message" (
    id integer NOT NULL,
    title text NOT NULL,
    affiliated text NOT NULL,
    name text NOT NULL,
    message text NOT NULL,
    "nameImageUrl" text,
    "messageImageUrl" text,
    "messageStatus" public."PublishStatus" DEFAULT 'draft'::public."PublishStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text NOT NULL,
    "updatedById" text,
    "approvedById" text
);


ALTER TABLE public."Message" OWNER TO "Admin";

--
-- TOC entry 222 (class 1259 OID 25696)
-- Name: Message_id_seq; Type: SEQUENCE; Schema: public; Owner: Admin
--

CREATE SEQUENCE public."Message_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Message_id_seq" OWNER TO "Admin";

--
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 222
-- Name: Message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Admin
--

ALTER SEQUENCE public."Message_id_seq" OWNED BY public."Message".id;


--
-- TOC entry 219 (class 1259 OID 25676)
-- Name: Project; Type: TABLE; Schema: public; Owner: Admin
--

CREATE TABLE public."Project" (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content jsonb NOT NULL,
    images text[],
    "projectStatus" public."Status" NOT NULL,
    "publishStatus" public."PublishStatus" DEFAULT 'draft'::public."PublishStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text NOT NULL,
    "updatedById" text,
    "approvedById" text
);


ALTER TABLE public."Project" OWNER TO "Admin";

--
-- TOC entry 218 (class 1259 OID 25675)
-- Name: Project_id_seq; Type: SEQUENCE; Schema: public; Owner: Admin
--

CREATE SEQUENCE public."Project_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Project_id_seq" OWNER TO "Admin";

--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 218
-- Name: Project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Admin
--

ALTER SEQUENCE public."Project_id_seq" OWNED BY public."Project".id;


--
-- TOC entry 225 (class 1259 OID 25708)
-- Name: Report; Type: TABLE; Schema: public; Owner: Admin
--

CREATE TABLE public."Report" (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    images text[],
    files text[],
    "publishStatus" public."PublishStatus" DEFAULT 'draft'::public."PublishStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text NOT NULL,
    "updatedById" text,
    "approvedById" text,
    "projectId" integer,
    "accessCount" integer DEFAULT 0 NOT NULL,
    "downloadCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Report" OWNER TO "Admin";

--
-- TOC entry 224 (class 1259 OID 25707)
-- Name: Report_id_seq; Type: SEQUENCE; Schema: public; Owner: Admin
--

CREATE SEQUENCE public."Report_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Report_id_seq" OWNER TO "Admin";

--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 224
-- Name: Report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Admin
--

ALTER SEQUENCE public."Report_id_seq" OWNED BY public."Report".id;


--
-- TOC entry 226 (class 1259 OID 25718)
-- Name: User; Type: TABLE; Schema: public; Owner: Admin
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text,
    image text,
    role public."Role" DEFAULT 'viewer'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO "Admin";

--
-- TOC entry 217 (class 1259 OID 25641)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: Admin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO "Admin";

--
-- TOC entry 4733 (class 2604 OID 25690)
-- Name: HomePage id; Type: DEFAULT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."HomePage" ALTER COLUMN id SET DEFAULT nextval('public."HomePage_id_seq"'::regclass);


--
-- TOC entry 4735 (class 2604 OID 25700)
-- Name: Message id; Type: DEFAULT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Message" ALTER COLUMN id SET DEFAULT nextval('public."Message_id_seq"'::regclass);


--
-- TOC entry 4730 (class 2604 OID 25679)
-- Name: Project id; Type: DEFAULT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Project" ALTER COLUMN id SET DEFAULT nextval('public."Project_id_seq"'::regclass);


--
-- TOC entry 4738 (class 2604 OID 25711)
-- Name: Report id; Type: DEFAULT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Report" ALTER COLUMN id SET DEFAULT nextval('public."Report_id_seq"'::regclass);


--
-- TOC entry 4920 (class 0 OID 25687)
-- Dependencies: 221
-- Data for Name: HomePage; Type: TABLE DATA; Schema: public; Owner: Admin
--

COPY public."HomePage" (id, "heroVideo", vision, mission, focus, "coreValues", "createdAt", "updatedAt") FROM stdin;
1	/assets/videos/homePage/heroVideo.mov	Empowering communities.	Technology for all.	Education and inclusion.	Integrity, Innovation, Inclusion.	2025-06-10 08:22:35.574	2025-06-10 08:22:35.574
\.


--
-- TOC entry 4922 (class 0 OID 25697)
-- Dependencies: 223
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: Admin
--

COPY public."Message" (id, title, affiliated, name, message, "nameImageUrl", "messageImageUrl", "messageStatus", "createdAt", "updatedAt", "createdById", "updatedById", "approvedById") FROM stdin;
1	Welcome Message	Founder	Eva Yayi	We are excited to launch our new programs	/assets/images/messages/nameImages/programsDirector.jpg	\N	published	2025-06-10 08:22:35.577	2025-06-10 08:22:35.577	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u
\.


--
-- TOC entry 4918 (class 0 OID 25676)
-- Dependencies: 219
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: Admin
--

COPY public."Project" (id, title, slug, content, images, "projectStatus", "publishStatus", "createdAt", "updatedAt", "createdById", "updatedById", "approvedById") FROM stdin;
4	Test 22	test-22	{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2}, "content": [{"text": "This must work... ", "type": "text"}]}, {"type": "horizontalRule"}, {"type": "paragraph", "content": [{"text": "Checking again", "type": "text"}]}, {"type": "paragraph", "content": [{"text": "How to boil water", "type": "text"}]}, {"type": "horizontalRule"}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Step 1", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Step 2", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Step 3", "type": "text"}]}]}]}]}	{/assets/images/projects/1749729363420_Whiskey_Chitto_Creek_combined_Univariate_residuals.png}	active	draft	2025-06-12 11:56:03.453	2025-06-15 04:09:41.597	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u	\N
5	How to Boil Water	how-to-boil-water	{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"text": "                            ", "type": "text"}, {"text": "How to Boil Water", "type": "text", "marks": [{"type": "underline"}]}]}, {"type": "heading", "attrs": {"level": 2}, "content": [{"text": "Steps to Boil Water", "type": "text"}]}, {"type": "blockquote", "content": [{"type": "heading", "attrs": {"level": 2}, "content": [{"text": "Before you continue, first wait! JayJe says if you burn, you learn!", "type": "text", "marks": [{"type": "textStyle", "attrs": {"color": "#800000"}}]}]}, {"type": "horizontalRule"}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Fill a pot or kettle", "type": "text", "marks": [{"type": "bold"}]}, {"text": " with cold tap water. The amount depends on how much you need.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Place the pot on the stove", "type": "text", "marks": [{"type": "bold"}]}, {"text": " or plug in your electric kettle.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Turn on the heat.", "type": "text", "marks": [{"type": "bold"}]}, {"text": " If you're using a stove, set the burner to high.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Wait for the water to heat up.", "type": "text", "marks": [{"type": "bold"}]}, {"text": " You'll start to see small bubbles at the bottom—this is called ", "type": "text"}, {"text": "simmering", "type": "text", "marks": [{"type": "italic"}]}, {"text": ".", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "When the water reaches a ", "type": "text"}, {"text": "rolling boil", "type": "text", "marks": [{"type": "italic"}]}, {"text": " (large, steady bubbles rising to the top), it's ready.", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Use the boiling water carefully", "type": "text", "marks": [{"type": "bold"}]}, {"text": ", otherwise you're on your on, pal!", "type": "text"}]}]}]}]}	{/assets/images/projects/1749732391848_Tchefuncte_River_combined_Bivariate_residuals.png,/assets/images/projects/1749732391863_Tchefuncte_River_combined_Univariate_residuals.png,/assets/images/projects/1749732391871_Whiskey_Chitto_Creek_combined_Bivariate_residuals.png,/assets/images/projects/1749732391889_Whiskey_Chitto_Creek_combined_Univariate_residuals.png}	active	draft	2025-06-12 12:46:31.946	2025-06-12 12:46:31.946	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u	\N
6	Yoo Test #2 in the Admin Areadddd	yoo-test-2-in-the-admin-areadddd	{"type": "doc", "content": [{"type": "paragraph", "content": [{"text": "A project must load from within the admin area Hellllllllllllllllllllllllloooooooooooooooo", "type": "text"}]}, {"type": "paragraph", "content": [{"text": "A project must load from within the admin area Hellllllllllllllllllllllllloooooooooooooooo", "type": "text"}]}, {"type": "horizontalRule"}, {"type": "horizontalRule"}, {"type": "paragraph", "content": [{"text": "I am ....", "type": "text"}]}, {"type": "horizontalRule"}, {"type": "horizontalRule"}, {"type": "horizontalRule"}, {"type": "horizontalRule"}, {"type": "table", "content": [{"type": "tableRow", "content": [{"type": "tableHeader", "attrs": {"colspan": 1, "rowspan": 1, "colwidth": null, "backgroundColor": null}, "content": [{"type": "paragraph", "content": [{"text": "Name", "type": "text"}]}]}, {"type": "tableHeader", "attrs": {"colspan": 1, "rowspan": 1, "colwidth": null, "backgroundColor": null}, "content": [{"type": "paragraph", "content": [{"text": "Age", "type": "text"}]}]}, {"type": "tableHeader", "attrs": {"colspan": 1, "rowspan": 1, "colwidth": null, "backgroundColor": null}, "content": [{"type": "paragraph", "content": [{"text": "Class", "type": "text"}]}]}]}, {"type": "tableRow", "content": [{"type": "tableCell", "attrs": {"colspan": 1, "rowspan": 1, "colwidth": null, "backgroundColor": null}, "content": [{"type": "paragraph", "content": [{"text": "Tom", "type": "text"}]}]}, {"type": "tableCell", "attrs": {"colspan": 1, "rowspan": 1, "colwidth": null, "backgroundColor": null}, "content": [{"type": "paragraph", "content": [{"text": "13", "type": "text"}]}]}, {"type": "tableCell", "attrs": {"colspan": 1, "rowspan": 1, "colwidth": null, "backgroundColor": null}, "content": [{"type": "paragraph", "content": [{"text": "Form 1", "type": "text"}]}]}]}, {"type": "tableRow", "content": [{"type": "tableCell", "attrs": {"colspan": 1, "rowspan": 1, "colwidth": null, "backgroundColor": null}, "content": [{"type": "paragraph", "content": [{"text": "Rome", "type": "text"}]}]}, {"type": "tableCell", "attrs": {"colspan": 1, "rowspan": 1, "colwidth": null, "backgroundColor": null}, "content": [{"type": "paragraph", "content": [{"text": "12", "type": "text"}]}]}, {"type": "tableCell", "attrs": {"colspan": 1, "rowspan": 1, "colwidth": null, "backgroundColor": null}, "content": [{"type": "paragraph", "content": [{"text": "Form 3", "type": "text"}]}]}]}]}]}	{/assets/images/projects/1749891450510_Tchefuncte_River_combined_Bivariate_scatter.png,/assets/images/projects/1749891450531_Tchefuncte_River_combined_Univariate_scatter.png}	completed	published	2025-06-14 08:57:30.882	2025-06-15 03:59:33.443	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u	\N
8	New Project	new-project	{"type": "doc", "content": [{"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "How to create a project", "type": "text", "marks": [{"type": "textStyle", "attrs": {"color": "#ff0080"}}, {"type": "bold"}]}]}, {"type": "horizontalRule"}]}]}, {"type": "orderedList", "attrs": {"type": null, "start": 1}, "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Login as an Admin", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Click on Projects", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Click on the Add new project button", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Type in the title", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Type the text", "type": "text"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"text": "Select images for the project", "type": "text"}]}, {"type": "horizontalRule"}, {"type": "paragraph"}]}]}]}	{/assets/images/projects/1750086744353_1749891450510_Tchefuncte_River_combined_Bivariate_scatter.png,/assets/images/projects/1750086744423_1749961289696_image.jpg,/assets/images/projects/1750086744435_image_(1).jpg,/assets/images/projects/1750086744470_image.jpg}	active	published	2025-06-16 15:12:24.487	2025-06-16 15:12:24.487	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u	\N
\.


--
-- TOC entry 4924 (class 0 OID 25708)
-- Dependencies: 225
-- Data for Name: Report; Type: TABLE DATA; Schema: public; Owner: Admin
--

COPY public."Report" (id, title, slug, images, files, "publishStatus", "createdAt", "updatedAt", "createdById", "updatedById", "approvedById", "projectId", "accessCount", "downloadCount") FROM stdin;
7	GoGirls ICT supports 20 Secondary Schools in Juba, South Sudanwwwwwwwwwww	gogirls-ict-supports-20-secondary-schools-in-juba-south-sudanwwwwwwwwwww	{/assets/images/reports/1749614220610_Fig2.jpeg}	{/assets/pdfs/report/1749614222314_ClarityOnTheStatusOfMrFrancisLitang.pdf}	draft	2025-06-11 03:57:07.497	2025-06-15 03:32:53.964	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u	\N	14	3
5	GoGirls ICT and MTN sign A memorandum of understanding	gogirls-ict-and-mtn-sign-a-memorandum-of-understanding	{/assets/images/reports/1750083795643_RandomForest_Confusion_Matrix___Test_Set.png}	{/assets/pdfs/report/sample3.pdf}	draft	2025-06-10 13:00:14.454	2025-06-16 14:23:37.728	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u	\N	39	1
9	GoGirls ITU Report 2025bbbb	gogirls-itu-report-2025bbbb	{/assets/images/reports/1749615258515_ee-chart_(12).png}	{/assets/pdfs/report/1749615258560_01.pdf}	published	2025-06-11 04:14:18.762	2025-06-16 14:40:53.136	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u	cmbq96hi20000c4w4nmrmf14u	\N	14	2
\.


--
-- TOC entry 4925 (class 0 OID 25718)
-- Dependencies: 226
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: Admin
--

COPY public."User" (id, "firstName", "lastName", username, password, email, image, role, "createdAt", "updatedAt") FROM stdin;
cmc5l9u1y0001c4a4gbwcdo6x	Manzu	Gerald	mgerald	$2b$10$U7rclQ5aH1zMAJ57t2.2.e98W9bSxFrrvX2AlJ8rSSkgnCI609YbS	manzugerald@gmail.com	/assets/images/users/1e36cbeb-ac54-4a2f-8738-a8b8b42b5b4d.png	viewer	2025-06-21 01:57:39.813	2025-06-21 04:38:45.427
cmbq96hi20000c4w4nmrmf14u	Eva	Yayi	evayayi	$2b$10$3jZX7B4AKUffQzFQgAFkW.3jekSY3.HLzPS0nZJn266lav8TkQD4.	evayayi@gogirlsict.org	/assets/images/users/evayayi.jpg	admin	2025-06-10 08:22:35.546	2025-06-21 04:39:30.688
cmbw2psxv0000c418t7m92xwj	Yine Yenki	Nyika	yineyenki	$2b$10$mjwb.hl2XB8YjU/zgen2IOskcguyApiNX3UrCxJbiQf9kF6DaAU1G	yineyenki@gogirlsict.org	/assets/images/users/38825815-1307-46bd-91c3-a7f9ccb9891e.png	viewer	2025-06-14 10:08:16.579	2025-06-21 06:01:04.45
cmc5m7xox0002c4a40ldqe310	Tom Gerald	Hofman	tf	$2b$10$PeJqG6LPPmxH4Du5m4urseOI3Cdj6vxKbgFuyFkU3R6jm470UH4ny	tf@tf.com	/assets/images/users/e99c524f-270a-4701-940a-e9bea2bbd8b7.png	viewer	2025-06-21 02:24:10.833	2025-06-21 07:03:35.434
\.


--
-- TOC entry 4916 (class 0 OID 25641)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: Admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b475b98c-2fcd-4a68-a184-99bcc0ed1297	32f2b54ea3714cdc446268d55d9071711d22a7b1788675bca9b8bef6ca6c5d62	2025-06-10 17:12:57.810055+09	20250610081256_add_download_and_access_counts	\N	\N	2025-06-10 17:12:57.684709+09	1
8ff44170-2781-46ff-97f5-625028ff5dc0	c1dcc09dbd93d1bf4ec8b96b2696bef7a939d687e4481c179ca70009fd0ae910	2025-06-10 17:17:56.096752+09	20250610081755_add_download_and_access_counts	\N	\N	2025-06-10 17:17:56.082313+09	1
\.


--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 220
-- Name: HomePage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Admin
--

SELECT pg_catalog.setval('public."HomePage_id_seq"', 1, true);


--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 222
-- Name: Message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Admin
--

SELECT pg_catalog.setval('public."Message_id_seq"', 1, true);


--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 218
-- Name: Project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Admin
--

SELECT pg_catalog.setval('public."Project_id_seq"', 8, true);


--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 224
-- Name: Report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Admin
--

SELECT pg_catalog.setval('public."Report_id_seq"', 13, true);


--
-- TOC entry 4751 (class 2606 OID 25695)
-- Name: HomePage HomePage_pkey; Type: CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."HomePage"
    ADD CONSTRAINT "HomePage_pkey" PRIMARY KEY (id);


--
-- TOC entry 4753 (class 2606 OID 25706)
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- TOC entry 4748 (class 2606 OID 25685)
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- TOC entry 4755 (class 2606 OID 25717)
-- Name: Report Report_pkey; Type: CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_pkey" PRIMARY KEY (id);


--
-- TOC entry 4759 (class 2606 OID 25726)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 4746 (class 2606 OID 25649)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4749 (class 1259 OID 25727)
-- Name: Project_slug_key; Type: INDEX; Schema: public; Owner: Admin
--

CREATE UNIQUE INDEX "Project_slug_key" ON public."Project" USING btree (slug);


--
-- TOC entry 4756 (class 1259 OID 25728)
-- Name: Report_slug_key; Type: INDEX; Schema: public; Owner: Admin
--

CREATE UNIQUE INDEX "Report_slug_key" ON public."Report" USING btree (slug);


--
-- TOC entry 4757 (class 1259 OID 25730)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: Admin
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 4760 (class 1259 OID 25729)
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: Admin
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- TOC entry 4764 (class 2606 OID 25746)
-- Name: Message Message_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4765 (class 2606 OID 25751)
-- Name: Message Message_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4766 (class 2606 OID 25756)
-- Name: Message Message_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4761 (class 2606 OID 25731)
-- Name: Project Project_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4762 (class 2606 OID 25736)
-- Name: Project Project_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4763 (class 2606 OID 25741)
-- Name: Project Project_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4767 (class 2606 OID 25761)
-- Name: Report Report_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4768 (class 2606 OID 25766)
-- Name: Report Report_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4769 (class 2606 OID 25771)
-- Name: Report Report_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4770 (class 2606 OID 25776)
-- Name: Report Report_updatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Admin
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: Admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-06-21 19:08:22

--
-- PostgreSQL database dump complete
--

