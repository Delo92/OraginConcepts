--
-- PostgreSQL database dump
--

\restrict mrsDGgpnufaO9x98Nm4Aiu8i7XIKnbsTpGODgbfbmTdpwAAJg5S58gsE4JbtTcT

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.availability OVERRIDING SYSTEM VALUE VALUES (1, 0, '09:00:00', '14:00:00', true);
INSERT INTO public.availability OVERRIDING SYSTEM VALUE VALUES (6, 5, '09:00:00', '17:00:00', true);
INSERT INTO public.availability OVERRIDING SYSTEM VALUE VALUES (5, 4, '09:00:00', '17:00:00', true);
INSERT INTO public.availability OVERRIDING SYSTEM VALUE VALUES (2, 1, '09:00:00', '17:00:00', true);
INSERT INTO public.availability OVERRIDING SYSTEM VALUE VALUES (3, 2, '09:00:00', '17:00:00', true);
INSERT INTO public.availability OVERRIDING SYSTEM VALUE VALUES (4, 3, '09:00:00', '17:00:00', true);
INSERT INTO public.availability OVERRIDING SYSTEM VALUE VALUES (7, 6, '09:00:00', '17:00:00', true);


--
-- Data for Name: blocked_dates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (1, 'Concept Development Meeting', 'This is a meeting where we discuss your vision, idea, or concept. flush out concepts to bring it to life, with results at the end of the session that you can take home and refine as you see fit. this is a 2 hour meeting, 2 hours is the minimum. additional hours can be plan and purchased in advance.', 120, 5000, NULL, true, 1, 'both');
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (2, 'Logo design', 'You will give me all the relevant ideas and concepts for the logo design you wish to have. I will create you 10 still renders and 5 moving icons', 120, 5000, NULL, true, 2, 'both');
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (3, 'Website Skeleton Design', 'Do you have a website that has to many moving parts? several 3rd party sources are needed to make what you feel like should be simple? Come have a creative meeting and leave with a visual representation of the website that is what you want the world to think of when they think your brand.', 120, 5000, NULL, true, 3, 'both');
INSERT INTO public.services OVERRIDING SYSTEM VALUE VALUES (4, 'Website Launch', 'You spent the time needed to get your site made as your dreams described and now your ready to go live to the world?', 120, 10000, NULL, true, 4, 'both');


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: custom_fonts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: gallery_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.gallery_items OVERRIDING SYSTEM VALUE VALUES (1, 'The Oraginal Concept', '/objects/uploads/935bc419-620c-443e-9551-2adbbbd4c6ff.mp4', 'video', true, '2026-01-06 06:08:46.932953', '''The Oragin'' the oraginal gamer. spelled wrong on purpose a young 12yr old Mr. Johnson wanted to beat other people in games and other means and it annoy the defeated or loser that Origin is spelled wrong.', 'OraginConcept.com', 'both');
INSERT INTO public.gallery_items OVERRIDING SYSTEM VALUE VALUES (2, 'Chronic Docs', '/objects/uploads/f932068b-43ec-48d5-893a-8f88f93fa60f.png', 'image', false, '2026-01-06 06:36:26.318613', 'The Nations Premier medical cannabis recommendation service, wanted a website that could could house patients, doctors, agents or representatives to handle patients, admin for customer and agent management and owner for brand and analytics all in one closed house, with full GA4 tracking built in, with GoHighLevel integration ready and in use.', 'ChronicDocs.com', 'professional');
INSERT INTO public.gallery_items OVERRIDING SYSTEM VALUE VALUES (3, 'Sacred Wellness Association ', '/objects/uploads/55eab9c0-c3c1-4547-a34e-699e5301938d.png', 'image', false, '2026-01-06 06:39:46.897419', 'A company striving to get your wellness underway, from diet plans, to meal prep, to GLP-! and other means of weight loss and wellness.', 'sacredwellnessassociation.com', 'professional');
INSERT INTO public.gallery_items OVERRIDING SYSTEM VALUE VALUES (5, 'Chronic TV', '/objects/uploads/81229160-0a33-4b4f-bb9a-f08d3e6c6180.png', 'image', false, '2026-01-06 06:49:45.598864', 'The community that Chronic Brands strives to build lives on Chronic TV. with a 24/7 live broadcast with dedicated time slots, on demand video of any show or series that is on Chronic TV, including the Originals series, and any member of the community that chooses to have a unfiltered show that no mainstream media platform can take down.', 'https://chronicbrandsusa.com/chronic-tv', 'edge');
INSERT INTO public.gallery_items OVERRIDING SYSTEM VALUE VALUES (4, 'Chronic Brands USA', '/objects/uploads/897867a9-aa2a-4202-bf67-000c7bb3b8be.png', 'image', false, '2026-01-06 06:44:39.898737', 'One of the nations most exclusive Cannabis friendly spaces and  community in the nation, founded by a couple based out of OKC, self made local moguls. Music, modeling, growing, networking, event throwing, event hosting, from NYC to Hawaii there''s no where in the Cannabis culture or community you wont find them. ', 'Chronicbrandsusa.com', 'edge');


--
-- Data for Name: display_mode_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: portfolio_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.portfolio_media OVERRIDING SYSTEM VALUE VALUES (1, 2, 'Gizmo ridin’ shotgun down these Oklahoma.mp3', '/objects/uploads/4556041c-d9f7-4233-b9df-8d57786e3c95.mp3', 'audio', 0, '2026-01-09 03:58:23.484671');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.sessions VALUES ('OU-kk50vWYxAGzwsTrougqdQkh2ZSQ_H', '{"cookie": {"path": "/", "secure": false, "expires": "2026-01-13T05:29:57.122Z", "httpOnly": true, "originalMaxAge": 604800000}, "isAdmin": true}', '2026-01-16 06:24:48');


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.site_settings OVERRIDING SYSTEM VALUE VALUES (1, 'Oraginal Concepts', 'Give Me Your Concept, Let''s Make It Real.', 'At Oraginal Concepts, we believe every idea deserves to be brought to life. Whether you need a stunning website, captivating video content, visual mockups, or custom music production — we''re here to turn your concept into reality. Give us your vision, and let''s make it happen. with 3D prints Coming Soon.', '', '', '', '', '', 'nbadelo@gmail.com', '4056962095', '4522 Nw 16th st', '', 'Give Me Your Concept, Let''s Make It Real. Websites, videos, mockups, music — we bring your ideas to life.');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.availability_id_seq', 7, true);


--
-- Name: blocked_dates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blocked_dates_id_seq', 1, false);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 1, false);


--
-- Name: custom_fonts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.custom_fonts_id_seq', 1, false);


--
-- Name: display_mode_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.display_mode_settings_id_seq', 1, false);


--
-- Name: gallery_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gallery_items_id_seq', 5, true);


--
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 1, false);


--
-- Name: portfolio_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.portfolio_media_id_seq', 1, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 4, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict mrsDGgpnufaO9x98Nm4Aiu8i7XIKnbsTpGODgbfbmTdpwAAJg5S58gsE4JbtTcT

