
-- DELETE THIS BEFORE RUNNING:
-- ###STEPS TO RUN THIS FILE ON PGADMIN###

-- 1. Right-click on your target database in the left sidebar.

-- 2. Select PSQL Tool from the menu (this opens a command-line interface inside pgAdmin).

-- 3. Type the following command and hit Enter: \i 'THIS FILEPATH'






--
-- PostgreSQL database dump
--

\restrict 4cJvACUGcg46DSpzG6pAzHRfJaUrWbn1TZNAu7J5pAldy1hi233Hyu5zeLihmBv

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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

ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS "FK_fd9dfb97e21b75fc45d42aa614a";
ALTER TABLE IF EXISTS ONLY public.membership_plans DROP CONSTRAINT IF EXISTS "FK_fa94845ddeeed2afa8a7a30bd82";
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS "FK_f80ee3c0f6b2adf57520dc9e977";
ALTER TABLE IF EXISTS ONLY public.team_members DROP CONSTRAINT IF EXISTS "FK_f2e7448cbbe862061a76756f82d";
ALTER TABLE IF EXISTS ONLY public.teams DROP CONSTRAINT IF EXISTS "FK_f1cbcfd9d4a42fd2f74dfd228a3";
ALTER TABLE IF EXISTS ONLY public.member_teams DROP CONSTRAINT IF EXISTS "FK_efedd3dd196df032f7afe47638e";
ALTER TABLE IF EXISTS ONLY public.team_member_team_subscriptions DROP CONSTRAINT IF EXISTS "FK_e9b0987b7da6433631b7ebb6a09";
ALTER TABLE IF EXISTS ONLY public.teams DROP CONSTRAINT IF EXISTS "FK_e7549efb36cffda636b998c00b0";
ALTER TABLE IF EXISTS ONLY public.team_member_team_subscriptions DROP CONSTRAINT IF EXISTS "FK_e51480ed4b74f8ad64908eacc85";
ALTER TABLE IF EXISTS ONLY public.member_team_subscriptions DROP CONSTRAINT IF EXISTS "FK_df8672bd8a4c1fe28958e732703";
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS "FK_d8cf6a4746e15e59a6f19e2d0a6";
ALTER TABLE IF EXISTS ONLY public.field_operating_hours DROP CONSTRAINT IF EXISTS "FK_d0fc1c1e2e733bf77e42d1f5f05";
ALTER TABLE IF EXISTS ONLY public.booking_participants DROP CONSTRAINT IF EXISTS "FK_d0c6f1f0892061f1cc2d325c1c9";
ALTER TABLE IF EXISTS ONLY public.employee_details DROP CONSTRAINT IF EXISTS "FK_ce616d2905a24ea751ee4a155d7";
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS "FK_c91f868f79f8f90a40f0f2c1441";
ALTER TABLE IF EXISTS ONLY public.member_team_subscriptions DROP CONSTRAINT IF EXISTS "FK_c76c8c49dfca9c45bdabab586cd";
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS "FK_c6f70af95eeeb43d10dc64e9e6b";
ALTER TABLE IF EXISTS ONLY public.team_members DROP CONSTRAINT IF EXISTS "FK_c2d2b65f142ec7e11625d207e48";
ALTER TABLE IF EXISTS ONLY public.outsider_details DROP CONSTRAINT IF EXISTS "FK_c2c2ef9ea07bd29bed0aa144c9e";
ALTER TABLE IF EXISTS ONLY public.teams DROP CONSTRAINT IF EXISTS "FK_bbbf68b3a1d536cf947e672755b";
ALTER TABLE IF EXISTS ONLY public.team_member_team_subscriptions DROP CONSTRAINT IF EXISTS "FK_b56c17473724dedd599a8edba30";
ALTER TABLE IF EXISTS ONLY public.team_member_team_subscriptions DROP CONSTRAINT IF EXISTS "FK_b4d96f89e3f6b01de371a2a9442";
ALTER TABLE IF EXISTS ONLY public.member_memberships DROP CONSTRAINT IF EXISTS "FK_b3abd06e7d54744a465cae28e45";
ALTER TABLE IF EXISTS ONLY public.sports DROP CONSTRAINT IF EXISTS "FK_afbcb2e18168f9953dcf5323c90";
ALTER TABLE IF EXISTS ONLY public.branch_sports DROP CONSTRAINT IF EXISTS "FK_acfd37cabe9e021812c4e0aba63";
ALTER TABLE IF EXISTS ONLY public.employee_details DROP CONSTRAINT IF EXISTS "FK_ab316e333d6b1340bbb9b085bbd";
ALTER TABLE IF EXISTS ONLY public.university_student_details DROP CONSTRAINT IF EXISTS "FK_aae8fd0f54003779607b8862af3";
ALTER TABLE IF EXISTS ONLY public.member_team_subscriptions DROP CONSTRAINT IF EXISTS "FK_9f1b7eea77a3e81efbe6551c6b8";
ALTER TABLE IF EXISTS ONLY public.team_member_teams DROP CONSTRAINT IF EXISTS "FK_9c53cb1c8208713af5e8a0fd52c";
ALTER TABLE IF EXISTS ONLY public.fields DROP CONSTRAINT IF EXISTS "FK_98e53906288233fae9d298b10de";
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS "FK_8dd248667c8d4d3b55d483239a9";
ALTER TABLE IF EXISTS ONLY public.staff_packages DROP CONSTRAINT IF EXISTS "FK_89161db4e532a39136cfdf7fc3a";
ALTER TABLE IF EXISTS ONLY public.member_teams DROP CONSTRAINT IF EXISTS "FK_87bc2de61af82996d9e78888e76";
ALTER TABLE IF EXISTS ONLY public.outsider_details DROP CONSTRAINT IF EXISTS "FK_84d24e0972729fa85a8147d2f44";
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS "FK_84b3c11d3952c7ef3ddc170c5b9";
ALTER TABLE IF EXISTS ONLY public.team_member_team_subscriptions DROP CONSTRAINT IF EXISTS "FK_828d221066be24266e901f15593";
ALTER TABLE IF EXISTS ONLY public.university_student_details DROP CONSTRAINT IF EXISTS "FK_7a23f0ea6c43d33994fef2e89ab";
ALTER TABLE IF EXISTS ONLY public.member_teams DROP CONSTRAINT IF EXISTS "FK_7a121348af73f30a634c872ce16";
ALTER TABLE IF EXISTS ONLY public.staff_packages DROP CONSTRAINT IF EXISTS "FK_73a5e988b5f904320a4d7bacefa";
ALTER TABLE IF EXISTS ONLY public.fields DROP CONSTRAINT IF EXISTS "FK_6ebc287d37a3789be5f8d8fd07f";
ALTER TABLE IF EXISTS ONLY public.team_member_teams DROP CONSTRAINT IF EXISTS "FK_67649300c1d9ec0b1a4f7ad76f5";
ALTER TABLE IF EXISTS ONLY public.member_memberships DROP CONSTRAINT IF EXISTS "FK_6678dedb4ec622799f6c2b064a6";
ALTER TABLE IF EXISTS ONLY public.branch_sport_teams DROP CONSTRAINT IF EXISTS "FK_618dc73ce93d677427dba897e91";
ALTER TABLE IF EXISTS ONLY public.team_training_schedules DROP CONSTRAINT IF EXISTS "FK_5eb8f1fdecaf4834a6e0e80da42";
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS "FK_5c05e0f6998f982aeb68c73e373";
ALTER TABLE IF EXISTS ONLY public.branch_sport_teams DROP CONSTRAINT IF EXISTS "FK_5a508183b1bf316036992d2e7ad";
ALTER TABLE IF EXISTS ONLY public.retired_employee_details DROP CONSTRAINT IF EXISTS "FK_572ac1a4ffeab682c2e6e94a033";
ALTER TABLE IF EXISTS ONLY public.branch_sport_teams DROP CONSTRAINT IF EXISTS "FK_541ede056317834936f1e4f3e6c";
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS "FK_537a22371dd962659e2199450da";
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS "FK_52d9db0d044b7bcc372147cf5ea";
ALTER TABLE IF EXISTS ONLY public.staff_privileges_override DROP CONSTRAINT IF EXISTS "FK_5030f5e915c0be480ecb51719e2";
ALTER TABLE IF EXISTS ONLY public.branch_sport_teams DROP CONSTRAINT IF EXISTS "FK_500f48a90ce325ac4ca43372980";
ALTER TABLE IF EXISTS ONLY public.member_team_subscriptions DROP CONSTRAINT IF EXISTS "FK_4df6dfcd6f7586919f6d71708c2";
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS "FK_4d2399aabd15dae3014759ae87d";
ALTER TABLE IF EXISTS ONLY public.staff_activity_logs DROP CONSTRAINT IF EXISTS "FK_4864905fe52777c6acaf05c63f2";
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS "FK_3cbe5f47f75a72225e1efbfa6a6";
ALTER TABLE IF EXISTS ONLY public.sports DROP CONSTRAINT IF EXISTS "FK_393d8edd63dd2a7f0750b6d7243";
ALTER TABLE IF EXISTS ONLY public.member_relationships DROP CONSTRAINT IF EXISTS "FK_37b61d254a9dea14f2ef7f1add0";
ALTER TABLE IF EXISTS ONLY public.member_team_subscriptions DROP CONSTRAINT IF EXISTS "FK_34e97ab404f86e2bf24723b298e";
ALTER TABLE IF EXISTS ONLY public.team_member_teams DROP CONSTRAINT IF EXISTS "FK_3469a2e8a5960749ee89d58a7ca";
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS "FK_24c65e5c0da83ebcec78ba03644";
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS "FK_1dc7e0f9ea4c487f6c4095bc153";
ALTER TABLE IF EXISTS ONLY public.team_training_schedules DROP CONSTRAINT IF EXISTS "FK_1a5362e0ef87153f5bd994116ec";
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS "FK_19005eb47f5a9d92428494d734e";
ALTER TABLE IF EXISTS ONLY public.member_relationships DROP CONSTRAINT IF EXISTS "FK_18b3b0a7a0861a9260948a569f2";
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS "FK_0e988847b02aacb81233d41b739";
ALTER TABLE IF EXISTS ONLY public.staff_privileges_override DROP CONSTRAINT IF EXISTS "FK_09988fb0363aa3a5d5ba4952afe";
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS "FK_033c2ff321c67885781aa563581";
ALTER TABLE IF EXISTS ONLY public.team_training_schedules DROP CONSTRAINT IF EXISTS "FK_0073b8f7534d2f0b4ad3d88807b";
ALTER TABLE IF EXISTS ONLY public.branch_sports DROP CONSTRAINT IF EXISTS "FK_0022ce2aa47b58bcbbea1368549";
DROP INDEX IF EXISTS public.idx_uni_student_member;
DROP INDEX IF EXISTS public.idx_tmts_team_status;
DROP INDEX IF EXISTS public.idx_tmts_team_member_status;
DROP INDEX IF EXISTS public.idx_tmts_team_member_id;
DROP INDEX IF EXISTS public.idx_tmts_team_id;
DROP INDEX IF EXISTS public.idx_tmts_status;
DROP INDEX IF EXISTS public.idx_tmts_created_at;
DROP INDEX IF EXISTS public.idx_team_member_teams_team_member_id;
DROP INDEX IF EXISTS public.idx_team_member_teams_team_id;
DROP INDEX IF EXISTS public.idx_team_member_status;
DROP INDEX IF EXISTS public.idx_team_member_account;
DROP INDEX IF EXISTS public.idx_retired_member;
DROP INDEX IF EXISTS public.idx_relationship_related;
DROP INDEX IF EXISTS public.idx_relationship_member;
DROP INDEX IF EXISTS public.idx_outsider_member;
DROP INDEX IF EXISTS public.idx_mts_team_status;
DROP INDEX IF EXISTS public.idx_mts_team_id;
DROP INDEX IF EXISTS public.idx_mts_status;
DROP INDEX IF EXISTS public.idx_mts_member_status;
DROP INDEX IF EXISTS public.idx_mts_member_id;
DROP INDEX IF EXISTS public.idx_mts_created_at;
DROP INDEX IF EXISTS public.idx_membership_status;
DROP INDEX IF EXISTS public.idx_membership_member;
DROP INDEX IF EXISTS public.idx_membership_end_date;
DROP INDEX IF EXISTS public.idx_member_type;
DROP INDEX IF EXISTS public.idx_member_status;
DROP INDEX IF EXISTS public.idx_fields_status;
DROP INDEX IF EXISTS public.idx_fields_sport_id;
DROP INDEX IF EXISTS public.idx_fields_branch_id;
DROP INDEX IF EXISTS public.idx_field_operating_hours_field_id;
DROP INDEX IF EXISTS public.idx_employee_profession;
DROP INDEX IF EXISTS public.idx_employee_member;
DROP INDEX IF EXISTS public.idx_branch_sport_team_status;
DROP INDEX IF EXISTS public.idx_branch_sport_team_sport_id;
DROP INDEX IF EXISTS public.idx_branch_sport_team_composite;
DROP INDEX IF EXISTS public.idx_branch_sport_team_branch_id;
DROP INDEX IF EXISTS public.idx_branch_sport_sport_id;
DROP INDEX IF EXISTS public.idx_branch_sport_branch_id;
DROP INDEX IF EXISTS public.idx_bookings_team_member_id;
DROP INDEX IF EXISTS public.idx_bookings_status;
DROP INDEX IF EXISTS public.idx_bookings_start_time;
DROP INDEX IF EXISTS public.idx_bookings_member_id;
DROP INDEX IF EXISTS public.idx_bookings_field_id;
DROP INDEX IF EXISTS public.idx_booking_participants_national_id;
DROP INDEX IF EXISTS public.idx_booking_participants_email;
DROP INDEX IF EXISTS public.idx_booking_participants_booking_id;
DROP INDEX IF EXISTS public.idx_announcement_status;
DROP INDEX IF EXISTS public.idx_announcement_sport_id;
DROP INDEX IF EXISTS public.idx_announcement_created_at;
DROP INDEX IF EXISTS public.idx_announcement_branch_id;
DROP INDEX IF EXISTS public.idx_activity_member;
DROP INDEX IF EXISTS public.idx_activity_date;
DROP INDEX IF EXISTS public.idx_account_email;
ALTER TABLE IF EXISTS ONLY public.field_operating_hours DROP CONSTRAINT IF EXISTS uq_field_operating_hours_field_day;
ALTER TABLE IF EXISTS ONLY public.team_members DROP CONSTRAINT IF EXISTS "UQ_fa926382a454ac372575ff03d88";
ALTER TABLE IF EXISTS ONLY public.faculties DROP CONSTRAINT IF EXISTS "UQ_f1b2cd43a96c6fb75c8ad44de88";
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS "UQ_ee66de6cdc53993296d1ceb8aa0";
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS "UQ_e11317b655992c54d0ca4883191";
ALTER TABLE IF EXISTS ONLY public.packages DROP CONSTRAINT IF EXISTS "UQ_ced38866e7e59963188cd0a76df";
ALTER TABLE IF EXISTS ONLY public.employee_details DROP CONSTRAINT IF EXISTS "UQ_ce616d2905a24ea751ee4a155d7";
ALTER TABLE IF EXISTS ONLY public.outsider_details DROP CONSTRAINT IF EXISTS "UQ_c2c2ef9ea07bd29bed0aa144c9e";
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS "UQ_bd38e75d5d3cbf9d12fe38a3372";
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS "UQ_9c06cbb83feb2f0be6263bd47ee";
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS "UQ_9a0df2b5f7d9adac641696c7048";
ALTER TABLE IF EXISTS ONLY public.university_student_details DROP CONSTRAINT IF EXISTS "UQ_7a23f0ea6c43d33994fef2e89ab";
ALTER TABLE IF EXISTS ONLY public.professions DROP CONSTRAINT IF EXISTS "UQ_677d94462c7429c37bc1bdf67cc";
ALTER TABLE IF EXISTS ONLY public.branch_sports DROP CONSTRAINT IF EXISTS "UQ_5de594917a09c7d9e204fb74451";
ALTER TABLE IF EXISTS ONLY public.retired_employee_details DROP CONSTRAINT IF EXISTS "UQ_572ac1a4ffeab682c2e6e94a033";
ALTER TABLE IF EXISTS ONLY public.staff_types DROP CONSTRAINT IF EXISTS "UQ_4f6fa524d7efbde95138cc1e78c";
ALTER TABLE IF EXISTS ONLY public.privileges DROP CONSTRAINT IF EXISTS "UQ_483f0b483b71d1bd067f7c5ecf8";
ALTER TABLE IF EXISTS ONLY public.member_types DROP CONSTRAINT IF EXISTS "UQ_45eca89ed5b651a24e6c2a84f28";
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS "UQ_07273ea3fb0e3f0add915cf5636";
ALTER TABLE IF EXISTS ONLY public.membership_plans DROP CONSTRAINT IF EXISTS "UQ_043c72f6b04d7f90472893bf802";
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS "REL_fd9dfb97e21b75fc45d42aa614";
ALTER TABLE IF EXISTS ONLY public.team_members DROP CONSTRAINT IF EXISTS "REL_c2d2b65f142ec7e11625d207e4";
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS "REL_4d2399aabd15dae3014759ae87";
ALTER TABLE IF EXISTS ONLY public.faculties DROP CONSTRAINT IF EXISTS "PK_fd83e4a09c7182ccf7bdb3770b9";
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS "PK_f25287b6140c5ba18d38776a796";
ALTER TABLE IF EXISTS ONLY public.media_posts DROP CONSTRAINT IF EXISTS "PK_f0e5a497b04867b30a63ee647ab";
ALTER TABLE IF EXISTS ONLY public.branch_sport_teams DROP CONSTRAINT IF EXISTS "PK_efe9e63bd92ff724492249b2e13";
ALTER TABLE IF EXISTS ONLY public.fields DROP CONSTRAINT IF EXISTS "PK_ee7a215c6cd77a59e2cb3b59d41";
ALTER TABLE IF EXISTS ONLY public.attendance DROP CONSTRAINT IF EXISTS "PK_ee0ffe42c1f1a01e72b725c0cb2";
ALTER TABLE IF EXISTS ONLY public.member_teams DROP CONSTRAINT IF EXISTS "PK_e87e0c0503c1ddb8cf98a7be65a";
ALTER TABLE IF EXISTS ONLY public.team_training_schedules DROP CONSTRAINT IF EXISTS "PK_e7dff189291a5002a0ec100ea59";
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS "PK_e4ee98bb552756c180aec1e854a";
ALTER TABLE IF EXISTS ONLY public.team_members DROP CONSTRAINT IF EXISTS "PK_ca3eae89dcf20c9fd95bf7460aa";
ALTER TABLE IF EXISTS ONLY public.bookings DROP CONSTRAINT IF EXISTS "PK_bee6805982cc1e248e94ce94957";
ALTER TABLE IF EXISTS ONLY public.staff_packages DROP CONSTRAINT IF EXISTS "PK_b67d9795ce42e3df3d8f3a98dee";
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS "PK_b3ad760876ff2e19d58e05dc8b0";
ALTER TABLE IF EXISTS ONLY public.member_memberships DROP CONSTRAINT IF EXISTS "PK_a1ae11530c8ba3f5036ea3ff359";
ALTER TABLE IF EXISTS ONLY public.employee_details DROP CONSTRAINT IF EXISTS "PK_a0a0a4a5e5b63b1bf07b5f89c1d";
ALTER TABLE IF EXISTS ONLY public.booking_participants DROP CONSTRAINT IF EXISTS "PK_9cc32a61bd698b5831f4e5d66e8";
ALTER TABLE IF EXISTS ONLY public.professions DROP CONSTRAINT IF EXISTS "PK_9247c0d4b30fc6b796d59262058";
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS "PK_8d12ff38fcc62aaba2cab748772";
ALTER TABLE IF EXISTS ONLY public.membership_plans DROP CONSTRAINT IF EXISTS "PK_85ca9d6f4262a6bbff2a540c640";
ALTER TABLE IF EXISTS ONLY public.staff_types DROP CONSTRAINT IF EXISTS "PK_8540cd5e2ee4537bdd127d129b4";
ALTER TABLE IF EXISTS ONLY public.outsider_details DROP CONSTRAINT IF EXISTS "PK_823834ce03c1206ce732589bb3e";
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS "PK_7f37d3b42defea97f1df0d19535";
ALTER TABLE IF EXISTS ONLY public.teams DROP CONSTRAINT IF EXISTS "PK_7e5523774a38b08a6236d322403";
ALTER TABLE IF EXISTS ONLY public.university_student_details DROP CONSTRAINT IF EXISTS "PK_7a151c6534f25dfdc2ecaacbf73";
ALTER TABLE IF EXISTS ONLY public.staff_privileges_override DROP CONSTRAINT IF EXISTS "PK_726251b0aecb8afa6a0f3d3198b";
ALTER TABLE IF EXISTS ONLY public.staff_activity_logs DROP CONSTRAINT IF EXISTS "PK_69b7f3ac6197332591100e0401f";
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS "PK_5a7a02c20412299d198e097a8fe";
ALTER TABLE IF EXISTS ONLY public.staff_action_approvals DROP CONSTRAINT IF EXISTS "PK_56c557469ec804e1eeceba51b6a";
ALTER TABLE IF EXISTS ONLY public.sports DROP CONSTRAINT IF EXISTS "PK_4fa1063d368e1fd68ea63c7d860";
ALTER TABLE IF EXISTS ONLY public.member_team_subscriptions DROP CONSTRAINT IF EXISTS "PK_4c460d3fd686ddef5cda48b3b77";
ALTER TABLE IF EXISTS ONLY public.field_operating_hours DROP CONSTRAINT IF EXISTS "PK_30ccf6d400902a90f146f0eabab";
ALTER TABLE IF EXISTS ONLY public.branch_sports DROP CONSTRAINT IF EXISTS "PK_2e2b9f4d271f131cc2768da2f60";
ALTER TABLE IF EXISTS ONLY public.member_types DROP CONSTRAINT IF EXISTS "PK_296a6e4257fe047191274ddfa2d";
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS "PK_28b53062261b996d9c99fa12404";
ALTER TABLE IF EXISTS ONLY public.team_member_teams DROP CONSTRAINT IF EXISTS "PK_1cbafa870658501e7381af2a1f8";
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS "PK_1bb179d048bbc581caa3b013439";
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS "PK_197ab7af18c93fbb0c9b28b4a59";
ALTER TABLE IF EXISTS ONLY public.privileges DROP CONSTRAINT IF EXISTS "PK_13f3ff98ae4d5565ec5ed6036cd";
ALTER TABLE IF EXISTS ONLY public.retired_employee_details DROP CONSTRAINT IF EXISTS "PK_1042321167267b8fab95e80d894";
ALTER TABLE IF EXISTS ONLY public.team_member_team_subscriptions DROP CONSTRAINT IF EXISTS "PK_0f4bc83e9524b846fb3fabf55cc";
ALTER TABLE IF EXISTS ONLY public.member_relationships DROP CONSTRAINT IF EXISTS "PK_05c6f5115238713b2085c658167";
ALTER TABLE IF EXISTS ONLY public.packages DROP CONSTRAINT IF EXISTS "PK_020801f620e21f943ead9311c98";
ALTER TABLE IF EXISTS public.university_student_details ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.team_members ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.team_member_teams ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.team_member_team_subscriptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tasks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.staff_types ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.staff_activity_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.staff_action_approvals ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.staff ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sports ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.retired_employee_details ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.professions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.privileges ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.packages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.outsider_details ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.membership_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.members ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.member_types ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.member_teams ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.member_team_subscriptions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.member_relationships ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.member_memberships ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.media_posts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.faculties ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employee_details ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.branches ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.branch_sports ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.branch_sport_teams ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.announcements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.accounts ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.university_student_details_id_seq;
DROP TABLE IF EXISTS public.university_student_details;
DROP TABLE IF EXISTS public.teams;
DROP TABLE IF EXISTS public.team_training_schedules;
DROP SEQUENCE IF EXISTS public.team_members_id_seq;
DROP TABLE IF EXISTS public.team_members;
DROP SEQUENCE IF EXISTS public.team_member_teams_id_seq;
DROP TABLE IF EXISTS public.team_member_teams;
DROP SEQUENCE IF EXISTS public.team_member_team_subscriptions_id_seq;
DROP TABLE IF EXISTS public.team_member_team_subscriptions;
DROP SEQUENCE IF EXISTS public.tasks_id_seq;
DROP TABLE IF EXISTS public.tasks;
DROP SEQUENCE IF EXISTS public.staff_types_id_seq;
DROP TABLE IF EXISTS public.staff_types;
DROP TABLE IF EXISTS public.staff_privileges_override;
DROP TABLE IF EXISTS public.staff_packages;
DROP SEQUENCE IF EXISTS public.staff_id_seq;
DROP SEQUENCE IF EXISTS public.staff_activity_logs_id_seq;
DROP TABLE IF EXISTS public.staff_activity_logs;
DROP SEQUENCE IF EXISTS public.staff_action_approvals_id_seq;
DROP TABLE IF EXISTS public.staff_action_approvals;
DROP TABLE IF EXISTS public.staff;
DROP SEQUENCE IF EXISTS public.sports_id_seq;
DROP TABLE IF EXISTS public.sports;
DROP SEQUENCE IF EXISTS public.retired_employee_details_id_seq;
DROP TABLE IF EXISTS public.retired_employee_details;
DROP SEQUENCE IF EXISTS public.professions_id_seq;
DROP TABLE IF EXISTS public.professions;
DROP SEQUENCE IF EXISTS public.privileges_id_seq;
DROP TABLE IF EXISTS public.privileges;
DROP SEQUENCE IF EXISTS public.payments_id_seq;
DROP TABLE IF EXISTS public.payments;
DROP SEQUENCE IF EXISTS public.packages_id_seq;
DROP TABLE IF EXISTS public.packages;
DROP SEQUENCE IF EXISTS public.outsider_details_id_seq;
DROP TABLE IF EXISTS public.outsider_details;
DROP SEQUENCE IF EXISTS public.membership_plans_id_seq;
DROP TABLE IF EXISTS public.membership_plans;
DROP SEQUENCE IF EXISTS public.members_id_seq;
DROP TABLE IF EXISTS public.members;
DROP SEQUENCE IF EXISTS public.member_types_id_seq;
DROP TABLE IF EXISTS public.member_types;
DROP SEQUENCE IF EXISTS public.member_teams_id_seq;
DROP TABLE IF EXISTS public.member_teams;
DROP SEQUENCE IF EXISTS public.member_team_subscriptions_id_seq;
DROP TABLE IF EXISTS public.member_team_subscriptions;
DROP SEQUENCE IF EXISTS public.member_relationships_id_seq;
DROP TABLE IF EXISTS public.member_relationships;
DROP SEQUENCE IF EXISTS public.member_memberships_id_seq;
DROP TABLE IF EXISTS public.member_memberships;
DROP SEQUENCE IF EXISTS public.media_posts_id_seq;
DROP TABLE IF EXISTS public.media_posts;
DROP TABLE IF EXISTS public.fields;
DROP TABLE IF EXISTS public.field_operating_hours;
DROP SEQUENCE IF EXISTS public.faculties_id_seq;
DROP TABLE IF EXISTS public.faculties;
DROP SEQUENCE IF EXISTS public.employee_details_id_seq;
DROP TABLE IF EXISTS public.employee_details;
DROP SEQUENCE IF EXISTS public.branches_id_seq;
DROP TABLE IF EXISTS public.branches;
DROP SEQUENCE IF EXISTS public.branch_sports_id_seq;
DROP TABLE IF EXISTS public.branch_sports;
DROP SEQUENCE IF EXISTS public.branch_sport_teams_id_seq;
DROP TABLE IF EXISTS public.branch_sport_teams;
DROP TABLE IF EXISTS public.bookings;
DROP TABLE IF EXISTS public.booking_participants;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.attendance;
DROP SEQUENCE IF EXISTS public.announcements_id_seq;
DROP TABLE IF EXISTS public.announcements;
DROP SEQUENCE IF EXISTS public.activity_logs_id_seq;
DROP TABLE IF EXISTS public.activity_logs;
DROP SEQUENCE IF EXISTS public.accounts_id_seq;
DROP TABLE IF EXISTS public.accounts;
DROP TYPE IF EXISTS public.tasks_type_enum;
DROP TYPE IF EXISTS public.tasks_status_enum;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: tasks_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tasks_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: tasks_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tasks_type_enum AS ENUM (
    'SPORT_CREATION',
    'FINANCE',
    'MEMBERSHIP_UPDATE',
    'GENERAL'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'member'::character varying NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    last_login timestamp without time zone,
    password_changed_at timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    member_id integer,
    action character varying(100) NOT NULL,
    description character varying(255),
    action_date timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    sport_id integer NOT NULL,
    branch_id integer,
    created_by_staff_id integer NOT NULL,
    title_en character varying(200) NOT NULL,
    title_ar character varying(200) NOT NULL,
    description_en text,
    description_ar text,
    banner_image text,
    thumbnail_image text,
    external_link text,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    published_at timestamp without time zone,
    expires_at timestamp without time zone,
    view_count integer DEFAULT 0 NOT NULL,
    click_count integer DEFAULT 0 NOT NULL,
    subscription_count integer DEFAULT 0 NOT NULL,
    target_role character varying(20),
    min_age integer DEFAULT 0 NOT NULL,
    max_age integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    member_id integer,
    team_member_id integer,
    team_id uuid NOT NULL,
    training_schedule_id uuid NOT NULL,
    attendance_date date NOT NULL,
    attended boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userName" character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    action character varying(50) NOT NULL,
    module character varying(50) NOT NULL,
    description text,
    status character varying(20) NOT NULL,
    "ipAddress" character varying(45),
    "oldValue" jsonb,
    "newValue" jsonb,
    "dateTime" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: booking_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_participants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id uuid NOT NULL,
    full_name character varying(255) NOT NULL,
    phone_number character varying(20),
    national_id character varying(20),
    email character varying(255),
    national_id_front character varying(255),
    national_id_back character varying(255),
    is_creator boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    member_id integer,
    team_member_id integer,
    sport_id integer NOT NULL,
    field_id uuid NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    duration_minutes integer,
    price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    status character varying(50) DEFAULT 'pending_payment'::character varying NOT NULL,
    payment_reference character varying(255),
    payment_completed_at timestamp without time zone,
    share_token character varying(64) NOT NULL,
    expected_participants integer DEFAULT 1 NOT NULL,
    notes text,
    language character varying(2) DEFAULT 'ar'::character varying NOT NULL,
    cancelled_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: branch_sport_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_sport_teams (
    id integer NOT NULL,
    branch_id integer NOT NULL,
    sport_id integer NOT NULL,
    created_by_staff_id integer NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en character varying(500),
    description_ar character varying(500),
    training_days character varying(100) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    monthly_fee numeric(10,2) NOT NULL,
    registration_fee numeric(10,2),
    max_participants integer DEFAULT 0 NOT NULL,
    current_participants integer DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    status_reason character varying(500),
    approved_by_staff_id integer,
    approved_at timestamp without time zone,
    approval_comments text,
    team_image text,
    min_age integer DEFAULT 0 NOT NULL,
    max_age integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: branch_sport_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branch_sport_teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branch_sport_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branch_sport_teams_id_seq OWNED BY public.branch_sport_teams.id;


--
-- Name: branch_sports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_sports (
    id integer NOT NULL,
    branch_id integer NOT NULL,
    sport_id integer NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: branch_sports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branch_sports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branch_sports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branch_sports_id_seq OWNED BY public.branch_sports.id;


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    location_en character varying(100),
    location_ar character varying(100),
    phone character varying(20),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: employee_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_details (
    id integer NOT NULL,
    member_id integer NOT NULL,
    profession_id integer NOT NULL,
    department_en character varying(100),
    department_ar character varying(100),
    salary numeric(12,2),
    salary_slip character varying(255),
    employment_start_date date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: employee_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employee_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_details_id_seq OWNED BY public.employee_details.id;


--
-- Name: faculties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faculties (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: faculties_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faculties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faculties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faculties_id_seq OWNED BY public.faculties.id;


--
-- Name: field_operating_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.field_operating_hours (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    field_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    opening_time time without time zone NOT NULL,
    closing_time time without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fields (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name_en character varying(255) NOT NULL,
    name_ar character varying(255) NOT NULL,
    description_en text,
    description_ar text,
    sport_id integer NOT NULL,
    capacity integer,
    branch_id integer,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    hourly_rate numeric(10,2),
    is_available_for_booking boolean DEFAULT false NOT NULL,
    booking_slot_duration integer DEFAULT 60 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: COLUMN fields.is_available_for_booking; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.fields.is_available_for_booking IS 'Whether this field can be booked by members/team members';


--
-- Name: COLUMN fields.booking_slot_duration; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.fields.booking_slot_duration IS 'Booking time slot duration in minutes (e.g., 60 for 1-hour slots)';


--
-- Name: media_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    category character varying(50) NOT NULL,
    images text,
    "videoUrl" character varying(500),
    "videoDuration" character varying(20),
    date timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: media_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_posts_id_seq OWNED BY public.media_posts.id;


--
-- Name: member_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_memberships (
    id integer NOT NULL,
    member_id integer NOT NULL,
    membership_plan_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    payment_status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: member_memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_memberships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_memberships_id_seq OWNED BY public.member_memberships.id;


--
-- Name: member_relationships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_relationships (
    id integer NOT NULL,
    member_id integer NOT NULL,
    related_member_id integer NOT NULL,
    relationship_type character varying(50) NOT NULL,
    relationship_name_ar character varying(100),
    is_dependent boolean DEFAULT false NOT NULL,
    age_group character varying(50),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: member_relationships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_relationships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_relationships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_relationships_id_seq OWNED BY public.member_relationships.id;


--
-- Name: member_team_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_team_subscriptions (
    id integer NOT NULL,
    member_id integer NOT NULL,
    team_id integer NOT NULL,
    created_by_staff_id integer,
    approved_by_staff_id integer,
    announcement_id integer,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    decline_reason text,
    cancellation_reason text,
    start_date date,
    end_date date,
    approved_at timestamp without time zone,
    declined_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    monthly_fee numeric(10,2) NOT NULL,
    registration_fee numeric(10,2),
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    custom_price numeric(10,2),
    payment_status character varying(20) DEFAULT 'unpaid'::character varying NOT NULL,
    approval_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: member_team_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_team_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_team_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_team_subscriptions_id_seq OWNED BY public.member_team_subscriptions.id;


--
-- Name: member_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_teams (
    id integer NOT NULL,
    team_id uuid NOT NULL,
    member_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    start_date date,
    end_date date,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    subscription_status character varying(50) DEFAULT 'pending_payment'::character varying NOT NULL,
    payment_id integer,
    payment_reference character varying(255),
    payment_completed_at timestamp without time zone,
    admin_approved_at timestamp without time zone,
    approved_by_staff_id integer,
    price numeric(10,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: COLUMN member_teams.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.member_teams.status IS 'pending, approved, declined, cancelled, active, inactive';


--
-- Name: COLUMN member_teams.subscription_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.member_teams.subscription_status IS 'pending_payment, pending_admin_approval, active, cancelled, expired';


--
-- Name: member_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_teams_id_seq OWNED BY public.member_teams.id;


--
-- Name: member_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_types (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en text,
    description_ar character varying(4000),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: member_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_types_id_seq OWNED BY public.member_types.id;


--
-- Name: members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.members (
    id integer NOT NULL,
    account_id integer NOT NULL,
    first_name_en character varying(50) NOT NULL,
    first_name_ar character varying(50) NOT NULL,
    last_name_en character varying(50) NOT NULL,
    last_name_ar character varying(50) NOT NULL,
    gender character varying(20),
    phone character varying(20),
    nationality character varying(50),
    birthdate date,
    national_id character varying(50) NOT NULL,
    health_status character varying(100),
    is_foreign boolean DEFAULT false NOT NULL,
    photo text,
    national_id_front text,
    national_id_back text,
    address text,
    medical_report text,
    member_type_id integer NOT NULL,
    points_balance integer DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- Name: membership_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_plans (
    id integer NOT NULL,
    member_type_id integer NOT NULL,
    plan_code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en text,
    description_ar character varying(4000),
    price numeric(12,2) NOT NULL,
    currency character varying(10) DEFAULT 'EGP'::character varying NOT NULL,
    duration_months integer NOT NULL,
    renewal_price numeric(12,2),
    is_installable boolean DEFAULT false NOT NULL,
    max_installments integer,
    is_active boolean DEFAULT true NOT NULL,
    is_for_foreigner boolean DEFAULT false NOT NULL,
    min_age integer,
    max_age integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: membership_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.membership_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: membership_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.membership_plans_id_seq OWNED BY public.membership_plans.id;


--
-- Name: outsider_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.outsider_details (
    id integer NOT NULL,
    member_id integer NOT NULL,
    job_title_en character varying(100),
    job_title_ar character varying(100),
    employment_status character varying(50) DEFAULT 'employed'::character varying NOT NULL,
    branch_id integer,
    visitor_type character varying(50),
    passport_number character varying(50),
    passport_photo character varying(255),
    country character varying(100),
    visa_status character varying(50),
    duration_months integer,
    is_installable boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: outsider_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.outsider_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: outsider_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.outsider_details_id_seq OWNED BY public.outsider_details.id;


--
-- Name: packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.packages (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(150) NOT NULL,
    name_ar character varying(150) NOT NULL,
    description_en character varying(500),
    description_ar character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: packages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.packages_id_seq OWNED BY public.packages.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    payment_reference character varying(255) NOT NULL,
    transaction_id character varying(255),
    payment_type character varying(50) NOT NULL,
    entity_type character varying(50),
    entity_id integer,
    related_entity_type character varying(50),
    related_entity_id character varying(255),
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'EGP'::character varying NOT NULL,
    payment_method character varying(50),
    gateway_name character varying(50),
    gateway_response text,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    refunded_at timestamp without time zone,
    processed_by_staff_id integer,
    refunded_by_staff_id integer,
    description text,
    notes text,
    metadata jsonb
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: privileges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.privileges (
    id integer NOT NULL,
    code character varying(100) NOT NULL,
    name_en character varying(150) NOT NULL,
    name_ar character varying(150) NOT NULL,
    description_en character varying(500),
    description_ar character varying(500),
    module character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: privileges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.privileges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: privileges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.privileges_id_seq OWNED BY public.privileges.id;


--
-- Name: professions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professions (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: professions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.professions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: professions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.professions_id_seq OWNED BY public.professions.id;


--
-- Name: retired_employee_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.retired_employee_details (
    id integer NOT NULL,
    member_id integer NOT NULL,
    profession_code character varying(50),
    former_department_en character varying(100),
    former_department_ar character varying(100),
    retirement_date date NOT NULL,
    last_salary numeric(12,2),
    salary_slip character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: retired_employee_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.retired_employee_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: retired_employee_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.retired_employee_details_id_seq OWNED BY public.retired_employee_details.id;


--
-- Name: sports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sports (
    id integer NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en character varying(500),
    description_ar character varying(500),
    price numeric(10,2),
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_by_staff_id integer NOT NULL,
    approved_by_staff_id integer,
    approved_at timestamp without time zone,
    approval_comments text,
    sport_image text,
    max_participants integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sports_id_seq OWNED BY public.sports.id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    account_id integer NOT NULL,
    staff_type_id integer NOT NULL,
    first_name_en character varying(100) NOT NULL,
    first_name_ar character varying(100) NOT NULL,
    last_name_en character varying(100) NOT NULL,
    last_name_ar character varying(100) NOT NULL,
    national_id character varying(20) NOT NULL,
    phone character varying(20),
    address character varying(255),
    employment_start_date date NOT NULL,
    employment_end_date date,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    academic_certificate text,
    national_id_front text,
    national_id_back text,
    military_service_doc text,
    criminal_record text,
    employer_approval_letter text,
    employment_status_statement text,
    good_conduct_certificate text,
    personal_photo text,
    personal_info_form text,
    experience_certificates text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: staff_action_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_action_approvals (
    id integer NOT NULL,
    staff_id integer NOT NULL,
    action_type character varying(50) NOT NULL,
    action_data jsonb NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    submitted_by integer NOT NULL,
    approved_by integer,
    approval_comments text,
    submitted_at timestamp without time zone,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: staff_action_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.staff_action_approvals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: staff_action_approvals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.staff_action_approvals_id_seq OWNED BY public.staff_action_approvals.id;


--
-- Name: staff_activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_activity_logs (
    id integer NOT NULL,
    staff_id integer NOT NULL,
    action_type character varying(50) NOT NULL,
    description character varying(500),
    performed_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: staff_activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.staff_activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: staff_activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.staff_activity_logs_id_seq OWNED BY public.staff_activity_logs.id;


--
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- Name: staff_packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_packages (
    staff_id integer NOT NULL,
    package_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    assigned_by integer
);


--
-- Name: staff_privileges_override; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_privileges_override (
    staff_id integer NOT NULL,
    privilege_id integer NOT NULL,
    is_granted boolean DEFAULT true NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    assigned_by integer
);


--
-- Name: staff_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_types (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en character varying(500),
    description_ar character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: staff_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.staff_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: staff_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.staff_types_id_seq OWNED BY public.staff_types.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    type public.tasks_type_enum DEFAULT 'GENERAL'::public.tasks_type_enum NOT NULL,
    status public.tasks_status_enum DEFAULT 'pending'::public.tasks_status_enum NOT NULL,
    data jsonb,
    created_by character varying(100),
    assigned_to character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: team_member_team_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_member_team_subscriptions (
    id integer NOT NULL,
    team_member_id integer NOT NULL,
    team_id integer NOT NULL,
    created_by_staff_id integer,
    approved_by_staff_id integer,
    announcement_id integer,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    decline_reason text,
    cancellation_reason text,
    start_date date,
    end_date date,
    approved_at timestamp without time zone,
    declined_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    monthly_fee numeric(10,2) NOT NULL,
    registration_fee numeric(10,2),
    discount_amount numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    custom_price numeric(10,2),
    payment_status character varying(20) DEFAULT 'unpaid'::character varying NOT NULL,
    approval_notes text,
    special_notes text,
    is_captain boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: team_member_team_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.team_member_team_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: team_member_team_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.team_member_team_subscriptions_id_seq OWNED BY public.team_member_team_subscriptions.id;


--
-- Name: team_member_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_member_teams (
    id integer NOT NULL,
    team_member_id integer NOT NULL,
    team_id uuid,
    start_date date,
    end_date date,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    subscription_status character varying(50) DEFAULT 'pending_payment'::character varying NOT NULL,
    payment_id integer,
    payment_reference character varying(255),
    payment_completed_at timestamp without time zone,
    admin_approved_at timestamp without time zone,
    approved_by_staff_id integer,
    price numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: COLUMN team_member_teams.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.team_member_teams.status IS 'pending, approved, declined, cancelled, active, inactive';


--
-- Name: COLUMN team_member_teams.subscription_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.team_member_teams.subscription_status IS 'pending_payment, pending_admin_approval, active, cancelled, expired';


--
-- Name: team_member_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.team_member_teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: team_member_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.team_member_teams_id_seq OWNED BY public.team_member_teams.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    account_id integer NOT NULL,
    first_name_en character varying(50) NOT NULL,
    first_name_ar character varying(50) NOT NULL,
    last_name_en character varying(50) NOT NULL,
    last_name_ar character varying(50) NOT NULL,
    gender character varying(20),
    phone character varying(20),
    nationality character varying(50),
    birthdate date,
    national_id character varying(50) NOT NULL,
    address text,
    photo character varying(255),
    medical_report character varying(255),
    national_id_front character varying(255),
    national_id_back character varying(255),
    proof character varying(255),
    is_foreign boolean DEFAULT false NOT NULL,
    member_type_id integer,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: team_training_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_training_schedules (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    team_id uuid NOT NULL,
    sport_id integer,
    days_en character varying(255) NOT NULL,
    days_ar character varying(255) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    field_id uuid,
    training_fee numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sport_id integer NOT NULL,
    branch_id integer,
    field_id uuid,
    name_en character varying(255) NOT NULL,
    name_ar character varying(255) NOT NULL,
    max_participants integer DEFAULT 20 NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    visibility_type character varying(20) DEFAULT 'BOTH'::character varying NOT NULL,
    price numeric(10,2),
    subscription_price numeric(10,2),
    approval_required boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: COLUMN teams.visibility_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.teams.visibility_type IS 'INTERNAL | EXTERNAL | BOTH';


--
-- Name: university_student_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.university_student_details (
    id integer NOT NULL,
    member_id integer NOT NULL,
    faculty_id integer,
    graduation_year integer,
    enrollment_date date,
    student_proof character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: university_student_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.university_student_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: university_student_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.university_student_details_id_seq OWNED BY public.university_student_details.id;


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: branch_sport_teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_sport_teams ALTER COLUMN id SET DEFAULT nextval('public.branch_sport_teams_id_seq'::regclass);


--
-- Name: branch_sports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_sports ALTER COLUMN id SET DEFAULT nextval('public.branch_sports_id_seq'::regclass);


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: employee_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_details ALTER COLUMN id SET DEFAULT nextval('public.employee_details_id_seq'::regclass);


--
-- Name: faculties id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculties ALTER COLUMN id SET DEFAULT nextval('public.faculties_id_seq'::regclass);


--
-- Name: media_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_posts ALTER COLUMN id SET DEFAULT nextval('public.media_posts_id_seq'::regclass);


--
-- Name: member_memberships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_memberships ALTER COLUMN id SET DEFAULT nextval('public.member_memberships_id_seq'::regclass);


--
-- Name: member_relationships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_relationships ALTER COLUMN id SET DEFAULT nextval('public.member_relationships_id_seq'::regclass);


--
-- Name: member_team_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_team_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.member_team_subscriptions_id_seq'::regclass);


--
-- Name: member_teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_teams ALTER COLUMN id SET DEFAULT nextval('public.member_teams_id_seq'::regclass);


--
-- Name: member_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_types ALTER COLUMN id SET DEFAULT nextval('public.member_types_id_seq'::regclass);


--
-- Name: members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- Name: membership_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_plans ALTER COLUMN id SET DEFAULT nextval('public.membership_plans_id_seq'::regclass);


--
-- Name: outsider_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outsider_details ALTER COLUMN id SET DEFAULT nextval('public.outsider_details_id_seq'::regclass);


--
-- Name: packages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages ALTER COLUMN id SET DEFAULT nextval('public.packages_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: privileges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privileges ALTER COLUMN id SET DEFAULT nextval('public.privileges_id_seq'::regclass);


--
-- Name: professions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professions ALTER COLUMN id SET DEFAULT nextval('public.professions_id_seq'::regclass);


--
-- Name: retired_employee_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retired_employee_details ALTER COLUMN id SET DEFAULT nextval('public.retired_employee_details_id_seq'::regclass);


--
-- Name: sports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports ALTER COLUMN id SET DEFAULT nextval('public.sports_id_seq'::regclass);


--
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- Name: staff_action_approvals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_action_approvals ALTER COLUMN id SET DEFAULT nextval('public.staff_action_approvals_id_seq'::regclass);


--
-- Name: staff_activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_activity_logs ALTER COLUMN id SET DEFAULT nextval('public.staff_activity_logs_id_seq'::regclass);


--
-- Name: staff_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_types ALTER COLUMN id SET DEFAULT nextval('public.staff_types_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: team_member_team_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_team_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.team_member_team_subscriptions_id_seq'::regclass);


--
-- Name: team_member_teams id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_teams ALTER COLUMN id SET DEFAULT nextval('public.team_member_teams_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: university_student_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.university_student_details ALTER COLUMN id SET DEFAULT nextval('public.university_student_details_id_seq'::regclass);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (id, email, password, role, status, last_login, password_changed_at, is_active, created_at, updated_at) FROM stdin;
1	admin@club.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	admin	active	2026-05-10 00:44:16.996	\N	t	2026-05-13 00:44:16.997808	2026-05-13 00:44:16.997808
2	sport.manager@club.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	staff	active	2026-05-13 00:44:17.004	\N	t	2026-05-13 00:44:17.005704	2026-05-13 00:44:17.005704
3	sport.specialist@club.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	staff	active	2026-05-13 00:44:17.007	\N	t	2026-05-13 00:44:17.008567	2026-05-13 00:44:17.008567
4	finance.director@club.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	staff	active	2026-05-10 00:44:17.012	\N	t	2026-05-13 00:44:17.013777	2026-05-13 00:44:17.013777
5	registration@club.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	staff	active	2026-05-13 00:44:17.015	\N	t	2026-05-13 00:44:17.016588	2026-05-13 00:44:17.016588
6	team.manager@club.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	staff	active	2026-05-07 00:44:17.018	\N	t	2026-05-13 00:44:17.019014	2026-05-13 00:44:17.019014
7	support@club.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	staff	active	2026-05-12 00:44:17.02	\N	t	2026-05-13 00:44:17.021299	2026-05-13 00:44:17.021299
8	auditor@club.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	staff	active	2026-05-12 00:44:17.022	\N	t	2026-05-13 00:44:17.023254	2026-05-13 00:44:17.023254
9	media@club.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	staff	active	2026-05-13 00:44:17.024	\N	t	2026-05-13 00:44:17.025104	2026-05-13 00:44:17.025104
10	security@club.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	staff	active	2026-05-09 00:44:17.026	\N	t	2026-05-13 00:44:17.02757	2026-05-13 00:44:17.02757
11	student1@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-05 00:44:17.414	\N	t	2026-05-13 00:44:17.415172	2026-05-13 00:44:17.415172
12	student2@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-15 00:44:17.425	\N	t	2026-05-13 00:44:17.42587	2026-05-13 00:44:17.42587
13	student3@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-14 00:44:17.43	\N	t	2026-05-13 00:44:17.431731	2026-05-13 00:44:17.431731
14	student4@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-20 00:44:17.434	\N	t	2026-05-13 00:44:17.435293	2026-05-13 00:44:17.435293
15	student5@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-09 00:44:17.438	\N	t	2026-05-13 00:44:17.439189	2026-05-13 00:44:17.439189
16	student6@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-10 00:44:17.442	\N	t	2026-05-13 00:44:17.443193	2026-05-13 00:44:17.443193
17	student7@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	suspended	\N	\N	f	2026-05-13 00:44:17.447601	2026-05-13 00:44:17.447601
18	student8@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-26 00:44:17.45	\N	t	2026-05-13 00:44:17.451172	2026-05-13 00:44:17.451172
19	student9@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	pending	\N	\N	f	2026-05-13 00:44:17.454722	2026-05-13 00:44:17.454722
20	student10@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-20 00:44:17.457	\N	t	2026-05-13 00:44:17.458113	2026-05-13 00:44:17.458113
21	working1@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-24 01:44:17.461	\N	t	2026-05-13 00:44:17.461924	2026-05-13 00:44:17.461924
22	working2@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-01 00:44:17.467	\N	t	2026-05-13 00:44:17.468341	2026-05-13 00:44:17.468341
23	working3@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-27 00:44:17.471	\N	t	2026-05-13 00:44:17.471924	2026-05-13 00:44:17.471924
24	working4@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-25 00:44:17.474	\N	t	2026-05-13 00:44:17.475423	2026-05-13 00:44:17.475423
25	working5@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-21 00:44:17.48	\N	t	2026-05-13 00:44:17.481067	2026-05-13 00:44:17.481067
26	working6@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	suspended	\N	\N	f	2026-05-13 00:44:17.4845	2026-05-13 00:44:17.4845
27	working7@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-25 00:44:17.487	\N	t	2026-05-13 00:44:17.488282	2026-05-13 00:44:17.488282
28	working8@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-19 00:44:17.491	\N	t	2026-05-13 00:44:17.491844	2026-05-13 00:44:17.491844
29	retired1@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-24 01:44:17.494	\N	t	2026-05-13 00:44:17.495861	2026-05-13 00:44:17.495861
30	retired2@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-25 00:44:17.501	\N	t	2026-05-13 00:44:17.502206	2026-05-13 00:44:17.502206
31	retired3@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-23 00:44:17.504	\N	t	2026-05-13 00:44:17.505769	2026-05-13 00:44:17.505769
32	retired4@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-05 00:44:17.508	\N	t	2026-05-13 00:44:17.509171	2026-05-13 00:44:17.509171
33	retired5@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-21 00:44:17.512	\N	t	2026-05-13 00:44:17.512989	2026-05-13 00:44:17.512989
34	retired6@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-11 00:44:17.515	\N	t	2026-05-13 00:44:17.516144	2026-05-13 00:44:17.516144
35	foreigner1@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-11 00:44:17.518	\N	t	2026-05-13 00:44:17.519607	2026-05-13 00:44:17.519607
36	foreigner2@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-09 00:44:17.524	\N	t	2026-05-13 00:44:17.525493	2026-05-13 00:44:17.525493
37	foreigner3@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-05 00:44:17.529	\N	t	2026-05-13 00:44:17.530094	2026-05-13 00:44:17.530094
38	foreigner4@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-30 00:44:17.533	\N	t	2026-05-13 00:44:17.533859	2026-05-13 00:44:17.533859
39	seasonal1@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-20 00:44:17.536	\N	t	2026-05-13 00:44:17.537463	2026-05-13 00:44:17.537463
40	seasonal2@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-23 00:44:17.54	\N	t	2026-05-13 00:44:17.541097	2026-05-13 00:44:17.541097
41	seasonal3@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-03 00:44:17.545	\N	t	2026-05-13 00:44:17.546747	2026-05-13 00:44:17.546747
42	seasonal4@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-24 01:44:17.55	\N	t	2026-05-13 00:44:17.551036	2026-05-13 00:44:17.551036
43	dependent1@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-09 00:44:17.553	\N	t	2026-05-13 00:44:17.554439	2026-05-13 00:44:17.554439
44	dependent2@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-22 00:44:17.559	\N	t	2026-05-13 00:44:17.560718	2026-05-13 00:44:17.560718
45	dependent3@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-05-13 00:44:17.564	\N	t	2026-05-13 00:44:17.564893	2026-05-13 00:44:17.564893
46	dependent4@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-19 00:44:17.567	\N	t	2026-05-13 00:44:17.568212	2026-05-13 00:44:17.568212
47	dependent5@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-17 00:44:17.57	\N	t	2026-05-13 00:44:17.571624	2026-05-13 00:44:17.571624
48	dependent6@uni.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	member	active	2026-04-30 00:44:17.574	\N	t	2026-05-13 00:44:17.57488	2026-05-13 00:44:17.57488
49	player1@team.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	team_member	active	\N	\N	t	2026-05-13 00:44:17.626505	2026-05-13 00:44:17.626505
50	player2@team.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	team_member	active	\N	\N	t	2026-05-13 00:44:17.633209	2026-05-13 00:44:17.633209
51	player3@team.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	team_member	active	\N	\N	t	2026-05-13 00:44:17.635613	2026-05-13 00:44:17.635613
52	player4@team.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	team_member	active	\N	\N	t	2026-05-13 00:44:17.637841	2026-05-13 00:44:17.637841
53	coach5@team.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	team_manager	active	\N	\N	t	2026-05-13 00:44:17.64008	2026-05-13 00:44:17.64008
54	coach6@team.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	team_manager	active	\N	\N	t	2026-05-13 00:44:17.642403	2026-05-13 00:44:17.642403
55	player7@team.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	team_member	active	\N	\N	t	2026-05-13 00:44:17.645587	2026-05-13 00:44:17.645587
56	player8@team.local	$2b$10$VtajOGBZ2SKKObGMSiTaaecUxrk1cJOrGZ04UC3lpvox2CMJCoL0i	team_member	active	\N	\N	t	2026-05-13 00:44:17.648057	2026-05-13 00:44:17.648057
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, member_id, action, description, action_date) FROM stdin;
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, sport_id, branch_id, created_by_staff_id, title_en, title_ar, description_en, description_ar, banner_image, thumbnail_image, external_link, status, is_visible, priority, published_at, expires_at, view_count, click_count, subscription_count, target_role, min_age, max_age, created_at, updated_at) FROM stdin;
1	1	1	9	Football Tournament 2026	بطولة كرة القدم 2026	Football Tournament 2026 — open to all members.	بطولة كرة القدم 2026 — مفتوح لجميع الأعضاء.	\N	\N	\N	published	t	0	\N	\N	266	20	0	\N	0	0	2026-05-13 00:44:17.780294	2026-05-13 00:44:17.780294
2	2	\N	9	Swimming Open Day	يوم مفتوح للسباحة	Swimming Open Day — open to all members.	يوم مفتوح للسباحة — مفتوح لجميع الأعضاء.	\N	\N	\N	published	t	0	\N	\N	384	51	0	\N	0	0	2026-05-13 00:44:17.785511	2026-05-13 00:44:17.785511
3	3	1	9	Tennis Training - New Coach	تدريب التنس - مدرب جديد	Tennis Training - New Coach — open to all members.	تدريب التنس - مدرب جديد — مفتوح لجميع الأعضاء.	\N	\N	\N	published	t	0	\N	\N	430	51	0	\N	0	0	2026-05-13 00:44:17.787223	2026-05-13 00:44:17.787223
4	4	\N	9	Basketball League Registration	تسجيل دوري كرة السلة	Basketball League Registration — open to all members.	تسجيل دوري كرة السلة — مفتوح لجميع الأعضاء.	\N	\N	\N	published	t	0	\N	\N	94	13	0	\N	0	0	2026-05-13 00:44:17.788803	2026-05-13 00:44:17.788803
5	5	1	9	Yoga Sessions - Coming Soon	جلسات يوجا - قريباً	Yoga Sessions - Coming Soon — open to all members.	جلسات يوجا - قريباً — مفتوح لجميع الأعضاء.	\N	\N	\N	scheduled	t	0	\N	\N	384	15	0	\N	0	0	2026-05-13 00:44:17.790078	2026-05-13 00:44:17.790078
6	6	\N	9	Volleyball Tryouts	اختبارات الكرة الطائرة	Volleyball Tryouts — open to all members.	اختبارات الكرة الطائرة — مفتوح لجميع الأعضاء.	\N	\N	\N	published	t	0	\N	\N	308	42	0	\N	0	0	2026-05-13 00:44:17.791837	2026-05-13 00:44:17.791837
7	7	1	9	Karate Black Belt Exam	امتحان الحزام الأسود للكاراتيه	Karate Black Belt Exam — open to all members.	امتحان الحزام الأسود للكاراتيه — مفتوح لجميع الأعضاء.	\N	\N	\N	draft	t	0	\N	\N	338	34	0	\N	0	0	2026-05-13 00:44:17.793145	2026-05-13 00:44:17.793145
8	8	\N	9	Chess Open Championship	بطولة الشطرنج المفتوحة	Chess Open Championship — open to all members.	بطولة الشطرنج المفتوحة — مفتوح لجميع الأعضاء.	\N	\N	\N	archived	t	0	\N	\N	209	12	0	\N	0	0	2026-05-13 00:44:17.79498	2026-05-13 00:44:17.79498
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance (id, member_id, team_member_id, team_id, training_schedule_id, attendance_date, attended, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "userName", role, action, module, description, status, "ipAddress", "oldValue", "newValue", "dateTime") FROM stdin;
67a9bf4e-8791-4e68-a51f-c778ee0f1062	Ahmed Hassan	ADMIN	Create	Sports	Created sport: Football	نجح	192.168.1.106	\N	\N	2026-05-13 00:44:17.820138
add03ca1-a87b-486e-b011-bb23f2ee728c	Mohamed Saad	SPORT_MANAGER	Update	Sports	Updated price for Tennis	نجح	192.168.1.201	\N	\N	2026-05-13 00:44:17.823207
2970465d-60de-47f5-a5df-185ba3ae69d8	Sara Mostafa	FINANCIAL_DIRECTOR	Approve	Payments	Approved 8 payments totaling 4,500 EGP	نجح	192.168.1.56	\N	\N	2026-05-13 00:44:17.825088
c03a8f99-88dd-44e9-b8b8-32c68c8566d1	Mona Ibrahim	REGISTRATION_STAFF	Approve	Members	Approved member application	نجح	192.168.1.121	\N	\N	2026-05-13 00:44:17.827484
b757c095-d905-46ac-babc-5cef5ed311ab	Ahmed Hassan	ADMIN	Delete	Announcements	Removed expired announcement	نجح	192.168.1.189	\N	\N	2026-05-13 00:44:17.829717
083f16f9-e9d9-46ec-b0a1-d8c605b191d6	Khaled Naguib	SPORT_SPECIALIST	Create	Teams	Created Senior Basketball team	نجح	192.168.1.204	\N	\N	2026-05-13 00:44:17.831511
5b851780-b50d-4448-b3fd-8de6bbebc94b	Tarek El-Sayed	TEAM_MANAGER	Update	Bookings	Rescheduled booking #1234	نجح	192.168.1.126	\N	\N	2026-05-13 00:44:17.833554
086117f2-4b76-4953-a6f9-8ff3c0ee9cac	Hossam Fathy	AUDITOR	View	Audit	Reviewed Q1 audit report	نجح	192.168.1.185	\N	\N	2026-05-13 00:44:17.835381
6e405129-1167-4502-aa5e-b6f652fe00ca	Yasser Galal	SECURITY	Login	Security	Failed login attempt	فشل	192.168.1.58	\N	\N	2026-05-13 00:44:17.83691
896f19af-d07b-46e0-beae-34f027207438	Nour Kamal	MEDIA	Create	Media	Published 3 photos	نجح	192.168.1.245	\N	\N	2026-05-13 00:44:17.838436
2c9c06b2-a7da-44bd-a2ec-b25c107730f3	Ahmed Hassan	Administrator	Login	Auth	User logged in: Ahmed Hassan	نجح	127.0.0.1	\N	\N	2026-05-13 00:45:42.407
8f155fc6-c0c0-48b4-a0f5-8049aaf0b52b	Ahmed Hassan	Administrator	Login	Auth	User logged in: Ahmed Hassan	نجح	127.0.0.1	\N	\N	2026-05-13 00:59:56.569
a11b749b-daaf-4fe5-a7c1-fbb20bfe97a8	Ahmed Hassan	Administrator	Login	Auth	User logged in: Ahmed Hassan	نجح	127.0.0.1	\N	\N	2026-05-13 08:22:18.83
0aaf7435-356b-443d-a1bb-d60b25e07650	Ahmed Hassan	Administrator	Login	Auth	User logged in: Ahmed Hassan	نجح	127.0.0.1	\N	\N	2026-05-13 08:22:19.163
19e35d01-414e-4882-98cb-564809396645	Ahmed Hassan	Administrator	Login	Auth	User logged in: Ahmed Hassan	نجح	127.0.0.1	\N	\N	2026-05-13 08:22:19.472
668bff0c-352e-4aaa-955b-82b7e0eaf924	Ahmed Hassan	Administrator	Login	Auth	User logged in: Ahmed Hassan	نجح	127.0.0.1	\N	\N	2026-05-13 11:02:50.942
ad04fbdb-affb-4766-89cc-11ff8d5c6232	Amr El Sayed	Administrator	Login	Auth	User logged in: Amr El Sayed	نجح	127.0.0.1	\N	\N	2026-05-13 11:04:42.766
0246f0c0-b85c-4e3c-b231-ef06c0afe398	Amr El Sayed	Administrator	Login	Auth	User logged in: Amr El Sayed	نجح	127.0.0.1	\N	\N	2026-05-13 11:05:06.009
a1c39e7d-8bbb-4735-9400-b207387cdf52	Amr El Sayed	Administrator	Login	Auth	User logged in: Amr El Sayed	نجح	127.0.0.1	\N	\N	2026-05-13 11:15:44.079
3e86eef5-0f71-460a-94f1-cd96a71e9c08	Amr El Sayed	Administrator	Login	Auth	User logged in: Amr El Sayed	نجح	127.0.0.1	\N	\N	2026-05-13 11:20:56.985
\.


--
-- Data for Name: booking_participants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.booking_participants (id, booking_id, full_name, phone_number, national_id, email, national_id_front, national_id_back, is_creator, created_at) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, member_id, team_member_id, sport_id, field_id, start_time, end_time, duration_minutes, price, status, payment_reference, payment_completed_at, share_token, expected_participants, notes, language, cancelled_at, completed_at, created_at, updated_at) FROM stdin;
e024b92c-dd15-4ed7-bad7-e863b8771707	20	\N	5	17d18fec-d3d7-4818-a646-21a61059d140	2026-05-13 10:00:00	2026-05-13 11:00:00	60	100.00	completed	BK-4af460ac	2026-05-13 00:44:17.649	9e5c2d02a2c2fc51c382f74cc91b9fd3	1	\N	ar	\N	2026-05-13 11:00:00	2026-05-13 00:44:17.650529	2026-05-13 00:44:17.650529
f1aa97f0-52a5-4825-a971-046f4d46b467	19	\N	3	eacb4187-0985-41f8-b83f-a003d7e01334	2026-05-12 11:00:00	2026-05-12 12:00:00	60	110.00	completed	BK-6bc7a8ed	2026-05-12 00:44:17.656	b1b38e18b341b2f5c8853d58b773be64	2	\N	ar	\N	2026-05-12 12:00:00	2026-05-13 00:44:17.657357	2026-05-13 00:44:17.657357
004a398c-2699-4db1-90a0-49d9d591afd2	15	\N	4	7b7def96-3ac5-4489-87c8-b3ae87ed840a	2026-05-11 12:00:00	2026-05-11 13:00:00	60	120.00	completed	BK-5a0b7e32	2026-05-11 00:44:17.66	eb655a245a8ca8dc5b167d2ffc34c08b	3	\N	ar	\N	2026-05-11 13:00:00	2026-05-13 00:44:17.661608	2026-05-13 00:44:17.661608
5e9a5dfc-485c-4586-ba40-618626e91826	11	\N	6	8ecb60ec-9030-41a3-be0e-804105a01dc0	2026-05-10 13:00:00	2026-05-10 14:00:00	60	130.00	completed	BK-e54073db	2026-05-10 00:44:17.664	cc87de70f998517c8e6d48c7db1e5be0	1	\N	ar	\N	2026-05-10 14:00:00	2026-05-13 00:44:17.665314	2026-05-13 00:44:17.665314
c0435444-2af1-47ab-92ed-c1c831bea7c9	2	\N	2	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	2026-05-09 14:00:00	2026-05-09 15:00:00	60	140.00	completed	BK-58dce1ba	2026-05-09 00:44:17.666	3ec1d949fd4d6da99524b092affeb620	2	\N	ar	\N	2026-05-09 15:00:00	2026-05-13 00:44:17.667867	2026-05-13 00:44:17.667867
b901f707-eadc-489b-8ac9-2126e70de634	2	\N	5	889c5ca5-6a17-4284-ac72-a422899a10a4	2026-05-08 15:00:00	2026-05-08 16:00:00	60	150.00	completed	BK-826fc669	2026-05-08 00:44:17.669	42ba7e810add8aa0ba6b558030872a1e	3	\N	ar	\N	2026-05-08 16:00:00	2026-05-13 00:44:17.670081	2026-05-13 00:44:17.670081
04cd38a8-e79c-490b-9420-c35b6d7f1785	10	\N	6	6b688244-1629-402d-8363-23ff8f8f0d8c	2026-05-07 16:00:00	2026-05-07 17:00:00	60	160.00	completed	BK-f6df3bd6	2026-05-07 00:44:17.671	bcf22ff6500f5a4315ad66a6cd201f5d	1	\N	ar	\N	2026-05-07 17:00:00	2026-05-13 00:44:17.672254	2026-05-13 00:44:17.672254
992af183-40ac-4f35-b87c-a945dce3046c	3	\N	3	eacb4187-0985-41f8-b83f-a003d7e01334	2026-05-06 17:00:00	2026-05-06 18:00:00	60	170.00	confirmed	BK-55a16441	2026-05-06 00:44:17.673	ccb6639caaa15cf58addb419967d794c	2	\N	ar	\N	\N	2026-05-13 00:44:17.674282	2026-05-13 00:44:17.674282
5d6cb610-ab6a-46aa-9f85-e512f0c43257	14	\N	2	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	2026-05-05 18:00:00	2026-05-05 19:00:00	60	180.00	confirmed	BK-da17c696	2026-05-05 00:44:17.675	d0d915c7bad7c45a078025094d6dd44f	3	\N	ar	\N	\N	2026-05-13 00:44:17.676731	2026-05-13 00:44:17.676731
6329fcd7-c309-41a4-957b-7cc56814e1ea	20	\N	6	8f92894d-47f2-4ec1-a68d-09001b024132	2026-05-04 19:00:00	2026-05-04 20:00:00	60	190.00	confirmed	BK-9fde843d	2026-05-04 00:44:17.678	6dc9f714577331dc2e1c3c4206c320e7	1	\N	ar	\N	\N	2026-05-13 00:44:17.679667	2026-05-13 00:44:17.679667
f6d414fd-53ca-4208-ba40-f54cd27cec77	17	\N	5	889c5ca5-6a17-4284-ac72-a422899a10a4	2026-05-03 10:00:00	2026-05-03 11:00:00	60	200.00	confirmed	BK-2e3c3251	2026-05-03 00:44:17.681	1f4ef7006c3ed3963d012bacfe9c1a33	2	\N	ar	\N	\N	2026-05-13 00:44:17.682463	2026-05-13 00:44:17.682463
f2729742-5246-42ce-b840-a62bb5293b2b	15	\N	6	8ecb60ec-9030-41a3-be0e-804105a01dc0	2026-05-02 11:00:00	2026-05-02 12:00:00	60	210.00	confirmed	BK-1e316b55	2026-05-02 00:44:17.683	731e481b7decd776f1b47499ce852f18	3	\N	ar	\N	\N	2026-05-13 00:44:17.684641	2026-05-13 00:44:17.684641
4770d0d6-ad54-4418-a56e-deeb729eb857	19	\N	5	beb86bb8-0298-4455-951e-0ab19306fc3d	2026-05-01 12:00:00	2026-05-01 13:00:00	60	220.00	confirmed	BK-f367f1d0	2026-05-01 00:44:17.685	e5723e3ede37bc341b13049a4bd1ceb3	1	\N	ar	\N	\N	2026-05-13 00:44:17.686664	2026-05-13 00:44:17.686664
f5c28c0c-e0f3-4bee-b51f-e5276852ce76	11	\N	4	7b7def96-3ac5-4489-87c8-b3ae87ed840a	2026-04-30 13:00:00	2026-04-30 14:00:00	60	230.00	confirmed	BK-76237e12	2026-04-30 00:44:17.687	2726edfe931833c68cfdce14a06c6845	2	\N	ar	\N	\N	2026-05-13 00:44:17.688646	2026-05-13 00:44:17.688646
2890f655-8d32-4fdf-b125-39116dc7560a	12	\N	6	8ecb60ec-9030-41a3-be0e-804105a01dc0	2026-04-29 14:00:00	2026-04-29 15:00:00	60	240.00	pending_payment	\N	\N	0ca34871592e7bbb890f69e205001339	3	\N	ar	\N	\N	2026-05-13 00:44:17.690634	2026-05-13 00:44:17.690634
bbfc2de2-f73d-423e-9586-b9a856814bc3	4	\N	3	6620b223-2868-4e6c-8569-bcd9f59cc065	2026-05-14 15:00:00	2026-05-14 16:00:00	60	250.00	cancelled	\N	\N	6dd17c7ee4eba2dcade3b89b658ba9e5	1	\N	ar	2026-04-29 00:44:17.692	\N	2026-05-13 00:44:17.692854	2026-05-13 00:44:17.692854
ba48bde0-6e37-4858-8757-b287580fd3fd	5	\N	6	8ecb60ec-9030-41a3-be0e-804105a01dc0	2026-05-15 16:00:00	2026-05-15 17:00:00	60	260.00	confirmed	BK-ba030b77	2026-04-27 00:44:17.694	959af13fd20dee2b1e7a0c88600d7c70	2	\N	ar	\N	\N	2026-05-13 00:44:17.695226	2026-05-13 00:44:17.695226
52f5a0d5-4f60-4a6a-957c-b60b71daaacf	15	\N	6	8f92894d-47f2-4ec1-a68d-09001b024132	2026-05-16 17:00:00	2026-05-16 18:00:00	60	270.00	completed	BK-79018fef	2026-04-26 00:44:17.696	fe98847e7e0189c3a155bd7245bffb9d	3	\N	ar	\N	2026-05-16 18:00:00	2026-05-13 00:44:17.697043	2026-05-13 00:44:17.697043
0cb2b5ff-6cf4-4fbf-aea2-2c352624239f	6	\N	5	889c5ca5-6a17-4284-ac72-a422899a10a4	2026-05-17 18:00:00	2026-05-17 19:00:00	60	280.00	pending_payment	\N	\N	0b82a51c89fb50262a507b7f3af954de	1	\N	ar	\N	\N	2026-05-13 00:44:17.698713	2026-05-13 00:44:17.698713
2203852a-aab7-42a9-9b46-32b9ef74c062	19	\N	5	889c5ca5-6a17-4284-ac72-a422899a10a4	2026-05-18 19:00:00	2026-05-18 20:00:00	60	290.00	cancelled	\N	\N	54e37425a5269281eba309c491c1352b	2	\N	ar	2026-04-25 00:44:17.699	\N	2026-05-13 00:44:17.700316	2026-05-13 00:44:17.700316
13347534-f383-4eb8-9f13-2f0611e672a7	1	\N	2	07397454-e817-4fff-ae0f-077484d1cf12	2026-05-19 10:00:00	2026-05-19 11:00:00	60	100.00	confirmed	BK-8aa5c20f	2026-04-23 00:44:17.701	f8b4c23556d6899b62649d84a72171a3	3	\N	ar	\N	\N	2026-05-13 00:44:17.701856	2026-05-13 00:44:17.701856
c8fcb8ff-c70b-4207-aa63-9a74836921cc	4	\N	3	6620b223-2868-4e6c-8569-bcd9f59cc065	2026-05-20 11:00:00	2026-05-20 12:00:00	60	110.00	completed	BK-7dbdc694	2026-04-22 00:44:17.702	ea7e822fd2e553896e047a456558da32	1	\N	ar	\N	2026-05-20 12:00:00	2026-05-13 00:44:17.703399	2026-05-13 00:44:17.703399
25ae1a26-30d3-4316-a3da-9e50d4d2a488	20	\N	4	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	2026-05-21 12:00:00	2026-05-21 13:00:00	60	120.00	pending_payment	\N	\N	f46778f60f9993054886df4ad7cbdd8e	2	\N	ar	\N	\N	2026-05-13 00:44:17.704953	2026-05-13 00:44:17.704953
59ade5d4-27f1-4db3-b375-2ebe54a46999	11	\N	5	17d18fec-d3d7-4818-a646-21a61059d140	2026-05-22 13:00:00	2026-05-22 14:00:00	60	130.00	cancelled	\N	\N	8c031f4a68d0199012351be8d32b6dea	3	\N	ar	2026-04-21 00:44:17.705	\N	2026-05-13 00:44:17.706731	2026-05-13 00:44:17.706731
3813b6da-23d6-421a-b824-d928b985e0f7	20	\N	4	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	2026-05-23 14:00:00	2026-05-23 15:00:00	60	140.00	confirmed	BK-e098990b	2026-04-19 00:44:17.707	fad223a3128da8a837d88a676d1bf1a6	1	\N	ar	\N	\N	2026-05-13 00:44:17.708424	2026-05-13 00:44:17.708424
77ba7504-bbdb-49ae-ad9c-6d6e22cb04f4	11	\N	6	8ecb60ec-9030-41a3-be0e-804105a01dc0	2026-05-24 15:00:00	2026-05-24 16:00:00	60	150.00	completed	BK-949241e4	2026-04-18 00:44:17.709	b668f841a744b9a226c17f5fe7c67d99	2	\N	ar	\N	2026-05-24 16:00:00	2026-05-13 00:44:17.710534	2026-05-13 00:44:17.710534
6eb5b026-86c1-46df-be15-cbc4131f42a3	2	\N	6	8ecb60ec-9030-41a3-be0e-804105a01dc0	2026-05-25 16:00:00	2026-05-25 17:00:00	60	160.00	pending_payment	\N	\N	032695aef623cc2d37fbd6d8785ee37d	3	\N	ar	\N	\N	2026-05-13 00:44:17.712717	2026-05-13 00:44:17.712717
c58a55e8-7565-445c-9b79-e901f756d6b3	19	\N	2	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	2026-05-26 17:00:00	2026-05-26 18:00:00	60	170.00	cancelled	\N	\N	7664a14bfc2752c75245c735ccf10254	1	\N	ar	2026-04-17 00:44:17.713	\N	2026-05-13 00:44:17.714391	2026-05-13 00:44:17.714391
4a562318-3273-4460-b594-676504b96d5d	19	\N	3	fd06eb42-3a43-4d28-964f-a6d1d80e459f	2026-05-27 18:00:00	2026-05-27 19:00:00	60	180.00	confirmed	BK-5e32b281	2026-04-15 00:44:17.715	2cc498e57ddb59fa4809f86ed4210a43	2	\N	ar	\N	\N	2026-05-13 00:44:17.715976	2026-05-13 00:44:17.715976
3ae289a2-0e5a-4485-91ae-0085673329aa	17	\N	4	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	2026-05-28 19:00:00	2026-05-28 20:00:00	60	190.00	completed	BK-eeae71dd	2026-04-14 00:44:17.716	984005f4a0c5feedbc7a2fceb471169e	3	\N	ar	\N	2026-05-28 20:00:00	2026-05-13 00:44:17.717674	2026-05-13 00:44:17.717674
\.


--
-- Data for Name: branch_sport_teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branch_sport_teams (id, branch_id, sport_id, created_by_staff_id, name_en, name_ar, description_en, description_ar, training_days, start_time, end_time, monthly_fee, registration_fee, max_participants, current_participants, status, status_reason, approved_by_staff_id, approved_at, approval_comments, team_image, min_age, max_age, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: branch_sports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branch_sports (id, branch_id, sport_id, status, created_at, updated_at) FROM stdin;
1	1	1	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
2	1	2	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
3	1	3	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
4	1	4	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
5	1	5	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
6	1	6	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
7	1	7	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
8	1	8	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
9	1	9	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
10	1	10	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
11	2	1	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
12	2	2	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
13	2	3	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
14	2	4	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
15	2	5	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
16	2	6	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
17	2	7	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
18	2	8	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
19	2	9	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
20	2	10	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
21	3	1	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
22	3	2	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
23	3	3	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
24	3	4	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
25	3	5	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
26	3	6	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
27	3	7	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
28	3	8	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
29	3	9	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
30	3	10	active	2026-05-13 00:44:17.034862	2026-05-13 00:44:17.034862
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, code, name_en, name_ar, location_en, location_ar, phone, status, created_at, updated_at) FROM stdin;
1	MAIN	Main Branch - Capital University	الفرع الرئيسي - جامعة العاصمة	Capital University Campus, New Capital	حرم جامعة العاصمة، العاصمة الإدارية	02-25551111	active	2026-05-13 00:44:16.994178	2026-05-13 00:44:16.994178
4	MATARIA	Mataria Branch - Faculty of Engineering	فرع المطرية - كلية الهندسة	Faculty of Engineering, Mataria, Cairo	كلية الهندسة، المطرية، القاهرة	02-29991111	active	2026-05-13 00:44:16.994178	2026-05-13 00:44:16.994178
2	HARAM	Haram Branch - Faculty of Sports Science (Boys)	فرع الهرم - كلية علوم الرياضة للبنين	Faculty of Sports Science for Boys, Haram, Giza	كلية علوم الرياضة للبنين، الهرم، الجيزة	02-38881111	active	2026-05-13 00:44:16.994178	2026-05-13 00:44:16.994178
3	ZAMALEK	Zamalek Branch - Faculty of Sports Science (Girls)	فرع الزمالك - كلية علوم الرياضة للبنات	Faculty of Sports Science for Girls, Zamalek, Cairo	كلية علوم الرياضة للبنات، الزمالك، القاهرة	03-4441111	active	2026-05-13 00:44:16.994178	2026-05-13 00:44:16.994178
\.


--
-- Data for Name: employee_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_details (id, member_id, profession_id, department_en, department_ar, salary, salary_slip, employment_start_date, created_at, updated_at) FROM stdin;
1	11	7	Administration	الإدارة	19187.00	\N	2015-11-15	2026-05-13 00:44:17.464195	2026-05-13 00:44:17.464195
2	12	10	Administration	الإدارة	19178.00	\N	2020-10-02	2026-05-13 00:44:17.470739	2026-05-13 00:44:17.470739
3	13	3	Administration	الإدارة	14820.00	\N	2021-06-12	2026-05-13 00:44:17.4743	2026-05-13 00:44:17.4743
4	14	4	Administration	الإدارة	10146.00	\N	2017-08-16	2026-05-13 00:44:17.479427	2026-05-13 00:44:17.479427
5	15	3	Administration	الإدارة	19786.00	\N	2022-04-10	2026-05-13 00:44:17.483352	2026-05-13 00:44:17.483352
6	16	3	Administration	الإدارة	15695.00	\N	2023-06-16	2026-05-13 00:44:17.486871	2026-05-13 00:44:17.486871
7	17	6	Administration	الإدارة	12273.00	\N	2023-04-14	2026-05-13 00:44:17.490813	2026-05-13 00:44:17.490813
8	18	5	Administration	الإدارة	16238.00	\N	2020-08-10	2026-05-13 00:44:17.494322	2026-05-13 00:44:17.494322
\.


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faculties (id, code, name_en, name_ar, created_at, updated_at) FROM stdin;
1	ENG	Engineering	الهندسة	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
2	MED	Medicine	الطب	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
3	COM	Commerce	التجارة	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
4	LAW	Law	الحقوق	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
5	ART	Arts	الآداب	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
6	SCI	Science	العلوم	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
7	CIS	Computers & Information	الحاسبات والمعلومات	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
8	PHE	Physical Education	التربية الرياضية	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
9	PHA	Pharmacy	الصيدلة	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
10	EDU	Education	التربية	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
11	AGR	Agriculture	الزراعة	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
12	DEN	Dentistry	طب الأسنان	2026-05-13 00:44:16.975555	2026-05-13 00:44:16.975555
\.


--
-- Data for Name: field_operating_hours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.field_operating_hours (id, field_id, day_of_week, opening_time, closing_time, created_at) FROM stdin;
5518e254-e9a7-4914-ae60-c14ec0e191e2	ffd92b7f-8aeb-449a-b158-9754ded07484	0	08:00:00	22:00:00	2026-05-13 00:44:17.04825
b8ff8840-ffd1-4e5d-baae-c005fcdf81ee	ffd92b7f-8aeb-449a-b158-9754ded07484	1	08:00:00	22:00:00	2026-05-13 00:44:17.052577
a10e5a68-d250-45c4-9d26-27bd20ed031f	ffd92b7f-8aeb-449a-b158-9754ded07484	2	08:00:00	22:00:00	2026-05-13 00:44:17.054751
b5bac2f7-302b-44f1-b727-f03f9fce84b9	ffd92b7f-8aeb-449a-b158-9754ded07484	3	08:00:00	22:00:00	2026-05-13 00:44:17.05659
ed8f1ecc-123b-4279-a0b4-591fca52f77a	ffd92b7f-8aeb-449a-b158-9754ded07484	4	08:00:00	22:00:00	2026-05-13 00:44:17.058409
e7c59993-f078-48df-bd37-53f9dc88553a	ffd92b7f-8aeb-449a-b158-9754ded07484	5	08:00:00	22:00:00	2026-05-13 00:44:17.062758
041d9b7a-5548-4288-9ae5-82197c4fd8bb	ffd92b7f-8aeb-449a-b158-9754ded07484	6	08:00:00	22:00:00	2026-05-13 00:44:17.065287
fb059d64-54a8-4432-aef2-0ade8a450c7b	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	0	08:00:00	22:00:00	2026-05-13 00:44:17.069861
50c0ecdb-b67b-4e10-b3b5-3d5f8e991e7f	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	1	08:00:00	22:00:00	2026-05-13 00:44:17.072323
98c04db3-1fa7-4754-afd8-4b1f7e048f96	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	2	08:00:00	22:00:00	2026-05-13 00:44:17.074175
e4d96b1c-de08-4f20-938e-d9e6ff1cdeb6	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	3	08:00:00	22:00:00	2026-05-13 00:44:17.076567
c1033522-3f92-4c1b-893f-c2368e18732b	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	4	08:00:00	22:00:00	2026-05-13 00:44:17.078509
b368fb12-e42b-4907-968b-3015993b3371	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	5	08:00:00	22:00:00	2026-05-13 00:44:17.080786
cb1c12ef-7d9f-4ff5-a784-6ed61fc47a9e	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	6	08:00:00	22:00:00	2026-05-13 00:44:17.082658
ed103e87-5ef0-414d-ad9f-b16b60a2531f	6620b223-2868-4e6c-8569-bcd9f59cc065	0	08:00:00	22:00:00	2026-05-13 00:44:17.089224
73a245c9-4aea-4a3d-ab9b-21e3ac873c81	6620b223-2868-4e6c-8569-bcd9f59cc065	1	08:00:00	22:00:00	2026-05-13 00:44:17.091811
2bbccb39-01af-4f69-a51c-feca4ec28629	6620b223-2868-4e6c-8569-bcd9f59cc065	2	08:00:00	22:00:00	2026-05-13 00:44:17.094358
07d7a931-00ca-4d34-9126-81b6e4a41a1a	6620b223-2868-4e6c-8569-bcd9f59cc065	3	08:00:00	22:00:00	2026-05-13 00:44:17.096268
3048807a-1f49-4332-9257-3cbfb59b172a	6620b223-2868-4e6c-8569-bcd9f59cc065	4	08:00:00	22:00:00	2026-05-13 00:44:17.098088
228cb2a5-04a8-4514-b1e9-432df063556c	6620b223-2868-4e6c-8569-bcd9f59cc065	5	08:00:00	22:00:00	2026-05-13 00:44:17.099961
522690e2-74b3-4f99-921e-392ec93b6a98	6620b223-2868-4e6c-8569-bcd9f59cc065	6	08:00:00	22:00:00	2026-05-13 00:44:17.101857
7235aaee-88b3-48e4-90d0-346e03b3f99f	a2caabbd-0dcf-4d8e-a435-aae5d948c696	0	08:00:00	22:00:00	2026-05-13 00:44:17.106646
eaef55be-1869-44ae-945a-c5bea7edab15	a2caabbd-0dcf-4d8e-a435-aae5d948c696	1	08:00:00	22:00:00	2026-05-13 00:44:17.108706
b2770cce-bb1c-45fc-a9b0-a4fdf25b8f67	a2caabbd-0dcf-4d8e-a435-aae5d948c696	2	08:00:00	22:00:00	2026-05-13 00:44:17.110744
1c7230ba-8f54-4188-bf0d-41f86f75181f	a2caabbd-0dcf-4d8e-a435-aae5d948c696	3	08:00:00	22:00:00	2026-05-13 00:44:17.11248
60727fd3-ef6d-41bd-9268-24bf1816d235	a2caabbd-0dcf-4d8e-a435-aae5d948c696	4	08:00:00	22:00:00	2026-05-13 00:44:17.114138
2a549f24-7e8c-4789-98a0-f359a1063303	a2caabbd-0dcf-4d8e-a435-aae5d948c696	5	08:00:00	22:00:00	2026-05-13 00:44:17.115682
601a00b1-6745-405c-93f5-838d8d2b6527	a2caabbd-0dcf-4d8e-a435-aae5d948c696	6	08:00:00	22:00:00	2026-05-13 00:44:17.117394
a2e9ca1c-2b2e-48bc-a213-e4fd26e9f404	889c5ca5-6a17-4284-ac72-a422899a10a4	0	08:00:00	22:00:00	2026-05-13 00:44:17.120985
36085902-0ec0-4929-9abc-889f3ce32b67	889c5ca5-6a17-4284-ac72-a422899a10a4	1	08:00:00	22:00:00	2026-05-13 00:44:17.122716
90efc1e8-7a15-49e0-a5b8-f611cc66ac9e	889c5ca5-6a17-4284-ac72-a422899a10a4	2	08:00:00	22:00:00	2026-05-13 00:44:17.124766
329df83a-d842-456b-ad35-31c5b2f6bb85	889c5ca5-6a17-4284-ac72-a422899a10a4	3	08:00:00	22:00:00	2026-05-13 00:44:17.128379
97e2cb50-dccd-4a5a-b7fb-dadb614c7dae	889c5ca5-6a17-4284-ac72-a422899a10a4	4	08:00:00	22:00:00	2026-05-13 00:44:17.130708
f80f1aa1-cad7-45d2-93da-2319646754d8	889c5ca5-6a17-4284-ac72-a422899a10a4	5	08:00:00	22:00:00	2026-05-13 00:44:17.132404
9bd77827-90dd-475c-aa71-8173ba217e50	889c5ca5-6a17-4284-ac72-a422899a10a4	6	08:00:00	22:00:00	2026-05-13 00:44:17.133936
786bd82f-0290-4bfc-9213-0c0ccb55abb7	8ecb60ec-9030-41a3-be0e-804105a01dc0	0	08:00:00	22:00:00	2026-05-13 00:44:17.137607
36f60f7e-85a7-46dd-a4a0-dd130b6db360	8ecb60ec-9030-41a3-be0e-804105a01dc0	1	08:00:00	22:00:00	2026-05-13 00:44:17.139554
a8fe63cd-270c-478c-a4a1-e2797e6514b7	8ecb60ec-9030-41a3-be0e-804105a01dc0	2	08:00:00	22:00:00	2026-05-13 00:44:17.141079
a569cdd1-7ce2-4903-8433-1e6c3b5014fd	8ecb60ec-9030-41a3-be0e-804105a01dc0	3	08:00:00	22:00:00	2026-05-13 00:44:17.142582
4c50ca2a-992c-4407-b77e-7ad3791601fe	8ecb60ec-9030-41a3-be0e-804105a01dc0	4	08:00:00	22:00:00	2026-05-13 00:44:17.144082
38b91b7a-8649-495a-916e-f7aded93c30d	8ecb60ec-9030-41a3-be0e-804105a01dc0	5	08:00:00	22:00:00	2026-05-13 00:44:17.145486
2bbb74d0-e935-430e-ab8d-d7bbf608a4da	8ecb60ec-9030-41a3-be0e-804105a01dc0	6	08:00:00	22:00:00	2026-05-13 00:44:17.146902
9b83a114-0596-4e2f-a322-6e7699f1a8ec	36cb88bf-7ae1-44b8-9917-517e00f81bee	0	08:00:00	22:00:00	2026-05-13 00:44:17.150327
6eb686a7-47df-40cf-bf86-8004796fd2e1	36cb88bf-7ae1-44b8-9917-517e00f81bee	1	08:00:00	22:00:00	2026-05-13 00:44:17.151753
8b71e400-c865-4aaf-8966-f5999330f435	36cb88bf-7ae1-44b8-9917-517e00f81bee	2	08:00:00	22:00:00	2026-05-13 00:44:17.153182
26780200-5266-49e0-a2ef-f3a2d1b7aa63	36cb88bf-7ae1-44b8-9917-517e00f81bee	3	08:00:00	22:00:00	2026-05-13 00:44:17.154714
b6486288-7fb4-46b6-80cd-858882a3402e	36cb88bf-7ae1-44b8-9917-517e00f81bee	4	08:00:00	22:00:00	2026-05-13 00:44:17.156591
a7626785-8d4e-4433-9104-ac85e6090205	36cb88bf-7ae1-44b8-9917-517e00f81bee	5	08:00:00	22:00:00	2026-05-13 00:44:17.158503
5c8eb274-17c7-4902-9758-08069ed07925	36cb88bf-7ae1-44b8-9917-517e00f81bee	6	08:00:00	22:00:00	2026-05-13 00:44:17.160545
ee03930b-cb4c-4c5a-bb90-24759a2a0259	f342819d-3071-4f9e-8ad4-eabbee36d308	0	08:00:00	22:00:00	2026-05-13 00:44:17.164439
a3d8ad62-7bee-4881-9f53-6f0895e5e01e	f342819d-3071-4f9e-8ad4-eabbee36d308	1	08:00:00	22:00:00	2026-05-13 00:44:17.166712
025365d8-ceb5-413b-b460-1c746c50e934	f342819d-3071-4f9e-8ad4-eabbee36d308	2	08:00:00	22:00:00	2026-05-13 00:44:17.168646
6d85ec1d-03ec-4766-8017-dc546002689e	f342819d-3071-4f9e-8ad4-eabbee36d308	3	08:00:00	22:00:00	2026-05-13 00:44:17.170463
99f5ad22-b473-4ade-9a86-718989fff7e1	f342819d-3071-4f9e-8ad4-eabbee36d308	4	08:00:00	22:00:00	2026-05-13 00:44:17.172827
92e7fed6-fd87-42d9-827c-2527f674744c	f342819d-3071-4f9e-8ad4-eabbee36d308	5	08:00:00	22:00:00	2026-05-13 00:44:17.175073
2b50b080-4e5f-4c27-8f2e-8778ba16cb35	f342819d-3071-4f9e-8ad4-eabbee36d308	6	08:00:00	22:00:00	2026-05-13 00:44:17.179074
6c63e5dc-03c4-481e-9356-8d25f7f56cf2	eacb4187-0985-41f8-b83f-a003d7e01334	0	08:00:00	22:00:00	2026-05-13 00:44:17.183682
3894c12e-7201-41dc-aebf-e08d4cf291c1	eacb4187-0985-41f8-b83f-a003d7e01334	1	08:00:00	22:00:00	2026-05-13 00:44:17.185643
80b324ef-86a2-477c-af22-f4e53a9c7f13	eacb4187-0985-41f8-b83f-a003d7e01334	2	08:00:00	22:00:00	2026-05-13 00:44:17.187687
f09a26fa-dff0-4cd7-8553-14c97dedea30	eacb4187-0985-41f8-b83f-a003d7e01334	3	08:00:00	22:00:00	2026-05-13 00:44:17.189419
067496bf-6a42-4f99-a2ad-3eb6b905c9f1	eacb4187-0985-41f8-b83f-a003d7e01334	4	08:00:00	22:00:00	2026-05-13 00:44:17.191054
00faab04-5b40-4c53-b6fe-7377256394e1	eacb4187-0985-41f8-b83f-a003d7e01334	5	08:00:00	22:00:00	2026-05-13 00:44:17.193313
04d318ba-8af9-4605-a866-0a421374e322	eacb4187-0985-41f8-b83f-a003d7e01334	6	08:00:00	22:00:00	2026-05-13 00:44:17.195155
8b1d2ae7-76ea-4c0b-8d6c-5fc1cd6c364c	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	0	08:00:00	22:00:00	2026-05-13 00:44:17.19919
86440d03-b3f7-47a1-900f-98df2192665b	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	1	08:00:00	22:00:00	2026-05-13 00:44:17.206436
5e52e951-a376-4ac7-b57e-b9116ce8a939	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	2	08:00:00	22:00:00	2026-05-13 00:44:17.209119
f3366bbc-e63c-4493-b5e2-ec8736c18f36	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	3	08:00:00	22:00:00	2026-05-13 00:44:17.212133
fa1401fe-2bad-455e-b83e-ad09befe8b75	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	4	08:00:00	22:00:00	2026-05-13 00:44:17.217456
da8893bc-2fa9-4d2d-9aae-b9b31ffe2bd9	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	5	08:00:00	22:00:00	2026-05-13 00:44:17.219291
60005547-5caa-45e9-a809-20a507df2d5b	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	6	08:00:00	22:00:00	2026-05-13 00:44:17.220931
9f98ea98-1b82-4b56-9131-2918ccaa6b0b	17d18fec-d3d7-4818-a646-21a61059d140	0	08:00:00	22:00:00	2026-05-13 00:44:17.22386
49c5d787-2b68-43b1-ac46-d7bf49ae0a01	17d18fec-d3d7-4818-a646-21a61059d140	1	08:00:00	22:00:00	2026-05-13 00:44:17.225513
58f32a7e-811a-4501-97c4-46b54beea8d5	17d18fec-d3d7-4818-a646-21a61059d140	2	08:00:00	22:00:00	2026-05-13 00:44:17.228032
c225ef08-391b-4f65-ac04-f12e36bbea9b	17d18fec-d3d7-4818-a646-21a61059d140	3	08:00:00	22:00:00	2026-05-13 00:44:17.22978
a56e0148-f572-42ae-bc72-59d2788795fb	17d18fec-d3d7-4818-a646-21a61059d140	4	08:00:00	22:00:00	2026-05-13 00:44:17.231748
3c4a8622-1d6a-4df2-bf66-7c380e3cff0a	17d18fec-d3d7-4818-a646-21a61059d140	5	08:00:00	22:00:00	2026-05-13 00:44:17.233651
ca086a02-fba1-4a6f-8a79-8ef8ee9d99a0	17d18fec-d3d7-4818-a646-21a61059d140	6	08:00:00	22:00:00	2026-05-13 00:44:17.235298
2c7b607b-150f-44f9-b73d-030264784f3b	8f92894d-47f2-4ec1-a68d-09001b024132	0	08:00:00	22:00:00	2026-05-13 00:44:17.2386
1c3e6eee-dcba-4a69-adf2-d8341bbc33ce	8f92894d-47f2-4ec1-a68d-09001b024132	1	08:00:00	22:00:00	2026-05-13 00:44:17.240976
45f58742-a2aa-4eb4-b467-344ef54abdcb	8f92894d-47f2-4ec1-a68d-09001b024132	2	08:00:00	22:00:00	2026-05-13 00:44:17.242865
475d69b7-516a-43cb-b2a5-265fcb4775dc	8f92894d-47f2-4ec1-a68d-09001b024132	3	08:00:00	22:00:00	2026-05-13 00:44:17.246736
8a09f16d-6d1b-462c-9b81-ce7bd71222bf	8f92894d-47f2-4ec1-a68d-09001b024132	4	08:00:00	22:00:00	2026-05-13 00:44:17.249468
1ee4da8c-d135-486b-8f04-da818d893704	8f92894d-47f2-4ec1-a68d-09001b024132	5	08:00:00	22:00:00	2026-05-13 00:44:17.25143
d6624adc-0b1e-4cfb-b202-b6bcd6d8e3d9	8f92894d-47f2-4ec1-a68d-09001b024132	6	08:00:00	22:00:00	2026-05-13 00:44:17.252988
0cf18026-110f-4913-b3f5-93206934f358	2d159790-00db-424c-ac4c-23d85a834cf8	0	08:00:00	22:00:00	2026-05-13 00:44:17.256091
bde3bddb-643c-4a1f-a0fc-e0ae194e28ab	2d159790-00db-424c-ac4c-23d85a834cf8	1	08:00:00	22:00:00	2026-05-13 00:44:17.2575
b8663d9b-968a-4061-a425-3246488c18f4	2d159790-00db-424c-ac4c-23d85a834cf8	2	08:00:00	22:00:00	2026-05-13 00:44:17.258963
adc439bd-810e-4e27-a367-ddf90060d4cb	2d159790-00db-424c-ac4c-23d85a834cf8	3	08:00:00	22:00:00	2026-05-13 00:44:17.260991
d6af0af2-cf0c-460c-815b-ab4c53996970	2d159790-00db-424c-ac4c-23d85a834cf8	4	08:00:00	22:00:00	2026-05-13 00:44:17.262748
2e711633-fe13-497e-971c-88601ff991f6	2d159790-00db-424c-ac4c-23d85a834cf8	5	08:00:00	22:00:00	2026-05-13 00:44:17.264668
c327d8a0-e9f7-4d4e-a78d-34ea8e76e536	2d159790-00db-424c-ac4c-23d85a834cf8	6	08:00:00	22:00:00	2026-05-13 00:44:17.266287
7b504e13-5af2-4a8b-bb25-023792a4787d	07397454-e817-4fff-ae0f-077484d1cf12	0	08:00:00	22:00:00	2026-05-13 00:44:17.269628
ca4a43d5-fc35-4c8b-8970-ff9f13c6a68c	07397454-e817-4fff-ae0f-077484d1cf12	1	08:00:00	22:00:00	2026-05-13 00:44:17.27117
43730929-616d-46cd-ada4-1d08581c4416	07397454-e817-4fff-ae0f-077484d1cf12	2	08:00:00	22:00:00	2026-05-13 00:44:17.272819
ab176ec0-98c1-4d21-9eb4-a16d0661db78	07397454-e817-4fff-ae0f-077484d1cf12	3	08:00:00	22:00:00	2026-05-13 00:44:17.274172
7ccd7075-4426-4361-9e8d-d4b98a198eb5	07397454-e817-4fff-ae0f-077484d1cf12	4	08:00:00	22:00:00	2026-05-13 00:44:17.275571
c0392c66-7c1e-4def-a18c-16efb803150e	07397454-e817-4fff-ae0f-077484d1cf12	5	08:00:00	22:00:00	2026-05-13 00:44:17.277256
a1a75fb3-c3ae-402c-b585-c488ee051332	07397454-e817-4fff-ae0f-077484d1cf12	6	08:00:00	22:00:00	2026-05-13 00:44:17.279085
dcd5cde7-ecce-468a-ae44-2b05772c4fb4	fd06eb42-3a43-4d28-964f-a6d1d80e459f	0	08:00:00	22:00:00	2026-05-13 00:44:17.282649
2c551164-d131-4064-9d69-bf1fd8047710	fd06eb42-3a43-4d28-964f-a6d1d80e459f	1	08:00:00	22:00:00	2026-05-13 00:44:17.284181
0f82496b-2636-4b9d-bce7-91ffb8c9fb28	fd06eb42-3a43-4d28-964f-a6d1d80e459f	2	08:00:00	22:00:00	2026-05-13 00:44:17.285559
5af34c3a-3207-4969-ba36-7b4dfcd9be86	fd06eb42-3a43-4d28-964f-a6d1d80e459f	3	08:00:00	22:00:00	2026-05-13 00:44:17.28702
879c5132-5d98-429a-bcae-47e47f8223be	fd06eb42-3a43-4d28-964f-a6d1d80e459f	4	08:00:00	22:00:00	2026-05-13 00:44:17.288875
ebed1c0a-4141-4814-9fb1-51111606153f	fd06eb42-3a43-4d28-964f-a6d1d80e459f	5	08:00:00	22:00:00	2026-05-13 00:44:17.290282
3192cbe6-21b9-44da-bebe-ff741c181cbd	fd06eb42-3a43-4d28-964f-a6d1d80e459f	6	08:00:00	22:00:00	2026-05-13 00:44:17.291636
90a3f50f-ae66-4eba-881c-8b00fba2cc52	7b7def96-3ac5-4489-87c8-b3ae87ed840a	0	08:00:00	22:00:00	2026-05-13 00:44:17.295466
5dc1c555-2437-49ef-bae8-6997df70c768	7b7def96-3ac5-4489-87c8-b3ae87ed840a	1	08:00:00	22:00:00	2026-05-13 00:44:17.297131
ebd3ebe2-0620-4bab-bb7b-fd6317a702ee	7b7def96-3ac5-4489-87c8-b3ae87ed840a	2	08:00:00	22:00:00	2026-05-13 00:44:17.298735
f0f4abb4-f727-47f0-8f0e-bb37a2f99161	7b7def96-3ac5-4489-87c8-b3ae87ed840a	3	08:00:00	22:00:00	2026-05-13 00:44:17.300541
59bb70bd-ece8-4837-a8be-d1a097efc8b2	7b7def96-3ac5-4489-87c8-b3ae87ed840a	4	08:00:00	22:00:00	2026-05-13 00:44:17.302122
69675d9f-318e-47f6-b214-1dc0c38233ee	7b7def96-3ac5-4489-87c8-b3ae87ed840a	5	08:00:00	22:00:00	2026-05-13 00:44:17.304119
5a703821-af0e-4c76-a64e-af8267b5127a	7b7def96-3ac5-4489-87c8-b3ae87ed840a	6	08:00:00	22:00:00	2026-05-13 00:44:17.305679
3b77b017-d5b4-4649-b98f-55f3708fa236	beb86bb8-0298-4455-951e-0ab19306fc3d	0	08:00:00	22:00:00	2026-05-13 00:44:17.308749
c510d151-2fab-43aa-88d8-893298c8fb38	beb86bb8-0298-4455-951e-0ab19306fc3d	1	08:00:00	22:00:00	2026-05-13 00:44:17.311886
e1ee6979-1749-4549-9c8e-4f2b81cf689c	beb86bb8-0298-4455-951e-0ab19306fc3d	2	08:00:00	22:00:00	2026-05-13 00:44:17.314813
48a8f460-dd1e-4a28-9f8c-d4cf2f3ebeb4	beb86bb8-0298-4455-951e-0ab19306fc3d	3	08:00:00	22:00:00	2026-05-13 00:44:17.316473
266371b4-8e1b-4b1a-accf-fb18475434b4	beb86bb8-0298-4455-951e-0ab19306fc3d	4	08:00:00	22:00:00	2026-05-13 00:44:17.318261
7cfad009-82e2-44bd-acc6-88573b020f8b	beb86bb8-0298-4455-951e-0ab19306fc3d	5	08:00:00	22:00:00	2026-05-13 00:44:17.320027
a662d73b-727d-489e-bb8f-b78f27fc7bbc	beb86bb8-0298-4455-951e-0ab19306fc3d	6	08:00:00	22:00:00	2026-05-13 00:44:17.322161
1e118e67-5600-47af-8f7a-1fc769db5150	6b688244-1629-402d-8363-23ff8f8f0d8c	0	08:00:00	22:00:00	2026-05-13 00:44:17.326017
de4e2045-ca02-4974-8770-0a1ab176ef5c	6b688244-1629-402d-8363-23ff8f8f0d8c	1	08:00:00	22:00:00	2026-05-13 00:44:17.32926
4bf04a31-3a99-4a38-8b09-c802184f073c	6b688244-1629-402d-8363-23ff8f8f0d8c	2	08:00:00	22:00:00	2026-05-13 00:44:17.331842
a8c11bbb-aa4e-44eb-8355-e4f542fd674c	6b688244-1629-402d-8363-23ff8f8f0d8c	3	08:00:00	22:00:00	2026-05-13 00:44:17.334283
fccafad9-ada6-41b9-b569-8b26b4c94d71	6b688244-1629-402d-8363-23ff8f8f0d8c	4	08:00:00	22:00:00	2026-05-13 00:44:17.336351
d9ddccaf-f7d5-4ffd-8031-cf4001d5cb77	6b688244-1629-402d-8363-23ff8f8f0d8c	5	08:00:00	22:00:00	2026-05-13 00:44:17.338377
a8bf6c0d-d4a2-43b8-bfd6-fbbb9941a961	6b688244-1629-402d-8363-23ff8f8f0d8c	6	08:00:00	22:00:00	2026-05-13 00:44:17.340581
\.


--
-- Data for Name: fields; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fields (id, name_en, name_ar, description_en, description_ar, sport_id, capacity, branch_id, status, hourly_rate, is_available_for_booking, booking_slot_duration, created_at, updated_at) FROM stdin;
ffd92b7f-8aeb-449a-b158-9754ded07484	Football Court - MAIN	ملعب كرة القدم - الفرع الرئيسي - حلوان	Standard Football field at Main Branch - Helwan	ملعب كرة القدم بالـالفرع الرئيسي - حلوان	1	20	1	active	221.00	f	60	2026-05-13 00:44:17.040438	2026-05-13 00:44:17.040438
bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	Basketball Court - MAIN	ملعب كرة السلة - الفرع الرئيسي - حلوان	Standard Basketball field at Main Branch - Helwan	ملعب كرة السلة بالـالفرع الرئيسي - حلوان	2	20	1	active	186.00	f	60	2026-05-13 00:44:17.067219	2026-05-13 00:44:17.067219
6620b223-2868-4e6c-8569-bcd9f59cc065	Volleyball Court - MAIN	ملعب الكرة الطائرة - الفرع الرئيسي - حلوان	Standard Volleyball field at Main Branch - Helwan	ملعب الكرة الطائرة بالـالفرع الرئيسي - حلوان	3	20	1	active	209.00	f	60	2026-05-13 00:44:17.084893	2026-05-13 00:44:17.084893
a2caabbd-0dcf-4d8e-a435-aae5d948c696	Tennis Court - MAIN	ملعب التنس - الفرع الرئيسي - حلوان	Standard Tennis field at Main Branch - Helwan	ملعب التنس بالـالفرع الرئيسي - حلوان	4	20	1	active	220.00	f	60	2026-05-13 00:44:17.104283	2026-05-13 00:44:17.104283
889c5ca5-6a17-4284-ac72-a422899a10a4	Swimming Court - MAIN	ملعب السباحة - الفرع الرئيسي - حلوان	Standard Swimming field at Main Branch - Helwan	ملعب السباحة بالـالفرع الرئيسي - حلوان	5	20	1	active	125.00	f	60	2026-05-13 00:44:17.119078	2026-05-13 00:44:17.119078
8ecb60ec-9030-41a3-be0e-804105a01dc0	Judo Court - MAIN	ملعب الجودو - الفرع الرئيسي - حلوان	Standard Judo field at Main Branch - Helwan	ملعب الجودو بالـالفرع الرئيسي - حلوان	6	20	1	active	116.00	f	60	2026-05-13 00:44:17.13553	2026-05-13 00:44:17.13553
36cb88bf-7ae1-44b8-9917-517e00f81bee	Football Court - 6OCT	ملعب كرة القدم - فرع 6 أكتوبر	Standard Football field at 6th October Branch	ملعب كرة القدم بالـفرع 6 أكتوبر	1	20	2	active	182.00	f	60	2026-05-13 00:44:17.148736	2026-05-13 00:44:17.148736
f342819d-3071-4f9e-8ad4-eabbee36d308	Basketball Court - 6OCT	ملعب كرة السلة - فرع 6 أكتوبر	Standard Basketball field at 6th October Branch	ملعب كرة السلة بالـفرع 6 أكتوبر	2	20	2	active	116.00	f	60	2026-05-13 00:44:17.162335	2026-05-13 00:44:17.162335
eacb4187-0985-41f8-b83f-a003d7e01334	Volleyball Court - 6OCT	ملعب الكرة الطائرة - فرع 6 أكتوبر	Standard Volleyball field at 6th October Branch	ملعب الكرة الطائرة بالـفرع 6 أكتوبر	3	20	2	active	274.00	f	60	2026-05-13 00:44:17.18149	2026-05-13 00:44:17.18149
bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	Tennis Court - 6OCT	ملعب التنس - فرع 6 أكتوبر	Standard Tennis field at 6th October Branch	ملعب التنس بالـفرع 6 أكتوبر	4	20	2	active	111.00	f	60	2026-05-13 00:44:17.197004	2026-05-13 00:44:17.197004
17d18fec-d3d7-4818-a646-21a61059d140	Swimming Court - 6OCT	ملعب السباحة - فرع 6 أكتوبر	Standard Swimming field at 6th October Branch	ملعب السباحة بالـفرع 6 أكتوبر	5	20	2	active	179.00	f	60	2026-05-13 00:44:17.222315	2026-05-13 00:44:17.222315
8f92894d-47f2-4ec1-a68d-09001b024132	Judo Court - 6OCT	ملعب الجودو - فرع 6 أكتوبر	Standard Judo field at 6th October Branch	ملعب الجودو بالـفرع 6 أكتوبر	6	20	2	active	291.00	f	60	2026-05-13 00:44:17.236919	2026-05-13 00:44:17.236919
2d159790-00db-424c-ac4c-23d85a834cf8	Football Court - ALEX	ملعب كرة القدم - فرع الإسكندرية	Standard Football field at Alexandria Branch	ملعب كرة القدم بالـفرع الإسكندرية	1	20	3	active	133.00	f	60	2026-05-13 00:44:17.254518	2026-05-13 00:44:17.254518
07397454-e817-4fff-ae0f-077484d1cf12	Basketball Court - ALEX	ملعب كرة السلة - فرع الإسكندرية	Standard Basketball field at Alexandria Branch	ملعب كرة السلة بالـفرع الإسكندرية	2	20	3	active	166.00	f	60	2026-05-13 00:44:17.267883	2026-05-13 00:44:17.267883
fd06eb42-3a43-4d28-964f-a6d1d80e459f	Volleyball Court - ALEX	ملعب الكرة الطائرة - فرع الإسكندرية	Standard Volleyball field at Alexandria Branch	ملعب الكرة الطائرة بالـفرع الإسكندرية	3	20	3	active	217.00	f	60	2026-05-13 00:44:17.280551	2026-05-13 00:44:17.280551
7b7def96-3ac5-4489-87c8-b3ae87ed840a	Tennis Court - ALEX	ملعب التنس - فرع الإسكندرية	Standard Tennis field at Alexandria Branch	ملعب التنس بالـفرع الإسكندرية	4	20	3	active	145.00	f	60	2026-05-13 00:44:17.293266	2026-05-13 00:44:17.293266
beb86bb8-0298-4455-951e-0ab19306fc3d	Swimming Court - ALEX	ملعب السباحة - فرع الإسكندرية	Standard Swimming field at Alexandria Branch	ملعب السباحة بالـفرع الإسكندرية	5	20	3	active	129.00	f	60	2026-05-13 00:44:17.307195	2026-05-13 00:44:17.307195
6b688244-1629-402d-8363-23ff8f8f0d8c	Judo Court - ALEX	ملعب الجودو - فرع الإسكندرية	Standard Judo field at Alexandria Branch	ملعب الجودو بالـفرع الإسكندرية	6	20	3	active	214.00	f	60	2026-05-13 00:44:17.324025	2026-05-13 00:44:17.324025
\.


--
-- Data for Name: media_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.media_posts (id, title, description, category, images, "videoUrl", "videoDuration", date, created_at, updated_at) FROM stdin;
35	فتح باب التسجيل لعضويات نادي جامعة العاصمة	يعلن نادي جامعة العاصمة عن فتح باب التسجيل لعضويات النادي لجميع فئات الطلاب وأعضاء هيئة التدريس والموظفين والعاملين بالجامعة. تتنوع باقات العضوية لتناسب جميع الفئات مع تخفيضات حصرية للأعضاء الجدد. سجّل الآن واستمتع بجميع مرافق النادي الحديثة والتدريبات الاحترافية.	أخبار	uploads/news/club-hero.jpg	\N	\N	2026-05-05 03:00:00	2026-05-13 03:41:54.082574	2026-05-13 03:41:54.082574
36	فتح باب الاشتراك في الألعاب الرياضية وأكاديميات النادي	يسعد نادي جامعة العاصمة أن يعلن عن فتح باب الاشتراك في جميع الأكاديميات الرياضية بالنادي للفصل الجديد، تشمل: كرة القدم، السباحة، الجمباز، التايكوندو، الكاراتيه، الإسكواش، الملاكمة، التنس وغيرها. تتوفر برامج تدريبية لمختلف الأعمار والمستويات بإشراف نخبة من المدربين المعتمدين.	إعلان	uploads/news/image1.jpg	\N	\N	2026-05-08 03:00:00	2026-05-13 03:41:54.090996	2026-05-13 03:41:54.090996
37	فريق كرة القدم بنادي جامعة العاصمة يحقق فوزاً مستحقاً	حقّق فريق كرة القدم الأول بنادي جامعة العاصمة فوزاً مهماً في آخر مبارياته بنتيجة 3-1 على أحد المنافسين الأقوياء في الدوري. أداء مميز من اللاعبين وعمل جماعي رفع راية النادي عالياً. تتقدم إدارة النادي بخالص التهاني للفريق والجهاز الفني على هذا الإنجاز.	أخبار	uploads/news/football-juniors.jpg	\N	\N	2026-05-10 03:00:00	2026-05-13 03:41:54.09301	2026-05-13 03:41:54.09301
38	بطل الملاكمة بالنادي يتوج ببطولة الجمهورية	حصل لاعب فريق الملاكمة بنادي جامعة العاصمة على لقب بطولة الجمهورية للملاكمة بعد مشوار رائع في البطولة وتفوق على عدد من الأبطال. هذا الإنجاز يضاف لسلسلة إنجازات النادي في الرياضات الفردية ويؤكد المستوى الفني العالي لمنظومة التدريب بالنادي.	أخبار	uploads/news/boxing.jpg	\N	\N	2026-05-11 03:00:00	2026-05-13 03:41:54.094598	2026-05-13 03:41:54.094598
39	تهنئة معالي رئيس الجامعة الأستاذ الدكتور قنديل لفريق كرة القدم	تقدّم السيد الأستاذ الدكتور قنديل، رئيس جامعة العاصمة، بأحرّ التهاني لفريق كرة القدم بالنادي بمناسبة صعوده الرسمي إلى الدوري الممتاز "ب". وأشاد سيادته بالعمل الدؤوب لإدارة النادي والجهاز الفني وروح العزيمة التي أظهرها اللاعبون، مؤكداً دعم الجامعة الكامل للأنشطة الرياضية وكافة الأكاديميات.	أخبار	uploads/news/congratulations.jpg	\N	\N	2026-05-12 03:00:00	2026-05-13 03:41:54.096148	2026-05-13 03:41:54.096148
40	فريق كرة السلة يحقق المركز الأول في بطولة الجامعات	أحرز فريق كرة السلة بنادي جامعة العاصمة المركز الأول في بطولة الجامعات المصرية لكرة السلة بعد فوزه في النهائي بفارق 12 نقطة. اللاعبون قدّموا أداءً رائعاً طوال البطولة ورفعوا اسم الجامعة عالياً.	أخبار	uploads/news/basketball.jpg	\N	\N	2026-05-03 03:00:00	2026-05-13 03:41:54.097725	2026-05-13 03:41:54.097725
41	انطلاق فعاليات بطولة الجمباز الفني والإيقاعي	انطلقت فعاليات بطولة الجمباز الفني والإيقاعي بنادي جامعة العاصمة بمشاركة أكثر من 80 لاعبة من مختلف الفئات السنية. البطولة تستمر لمدة 3 أيام بمشاركة لجنة تحكيم محترفة، ويُتوقع أن تشهد منافسات قوية على المراكز الأولى.	فعاليات	uploads/news/gymnastics.jpg	\N	\N	2026-04-28 03:00:00	2026-05-13 03:41:54.099531	2026-05-13 03:41:54.099531
42	افتتاح أكاديمية التايكوندو بأحدث التجهيزات	افتتح النادي رسمياً أكاديمية التايكوندو بفرع الهرم بأحدث التجهيزات والمعدات الرياضية الاحترافية. الأكاديمية تستقبل الأعمار من 6 سنوات فأكثر وتقدّم برامج تدريبية متدرجة وفق المعايير العالمية تحت إشراف مدربين معتمدين دولياً.	إعلان	uploads/news/taekwondo.jpg	\N	\N	2026-04-22 02:00:00	2026-05-13 03:41:54.100985	2026-05-13 03:41:54.100985
43	فعاليات اليوم الرياضي للأطفال بمشاركة 200 طفل	احتفل نادي جامعة العاصمة باليوم الرياضي للأطفال بمشاركة أكثر من 200 طفل من أبناء أعضاء النادي. تضمنت الفعاليات سباقات ودياتية، مسابقات ترفيهية، وعروض للألعاب الرياضية المختلفة، وتم توزيع الجوائز والميداليات على المشاركين في جو من البهجة والمرح.	فعاليات	uploads/news/image2.jpg	\N	\N	2026-04-15 02:00:00	2026-05-13 03:41:54.102409	2026-05-13 03:41:54.102409
44	دورة تدريبية للحكام بإشراف الاتحاد المصري	استضاف نادي جامعة العاصمة دورة تدريبية متخصصة للحكام في كرة القدم بإشراف الاتحاد المصري لكرة القدم. شارك في الدورة 30 حكماً من مختلف المحافظات، وتناولت أحدث القوانين الدولية، وتم منح المشاركين شهادات معتمدة.	أخبار	uploads/news/image3.jpg	\N	\N	2026-04-08 02:00:00	2026-05-13 03:41:54.10463	2026-05-13 03:41:54.10463
45	لقطات من تدريبات فريق كرة اليد	مجموعة من الصور لتدريبات فريق كرة اليد بنادي جامعة العاصمة، تعكس روح الفريق والمستوى الفني العالي للاعبين.	صور	uploads/news/handball.jpg,uploads/news/image4.jpg,uploads/news/image5.jpg	\N	\N	2026-05-09 03:00:00	2026-05-13 03:41:54.106011	2026-05-13 03:41:54.106011
46	صور من بطولة الاسكواش والتنس بفرع الزمالك	تغطية مصورة لمنافسات بطولة الإسكواش والتنس التي نُظمت بفرع الزمالك، بمشاركة عدد كبير من اللاعبين والمتنافسين.	صور	uploads/news/squash.jpg,uploads/news/tennis.jpg	\N	\N	2026-05-06 03:00:00	2026-05-13 03:41:54.107172	2026-05-13 03:41:54.107172
47	ألبوم صور بطولة المصارعة الحرة	صور من بطولة المصارعة الحرة التي استضافها النادي بمشاركة 40 لاعباً من مختلف الفئات والأوزان.	صور	uploads/news/wrestling.jpg,uploads/news/image6.jpg	\N	\N	2026-05-01 03:00:00	2026-05-13 03:41:54.10837	2026-05-13 03:41:54.10837
48	صور من احتفال النادي بعيد الرياضة	صور تذكارية من احتفال النادي بعيد الرياضة بمشاركة الإدارة وأبطال النادي في مختلف الألعاب.	صور	uploads/news/image1.jpg,uploads/news/image2.jpg,uploads/news/club-hero.jpg	\N	\N	2026-04-25 03:00:00	2026-05-13 03:41:54.109397	2026-05-13 03:41:54.109397
49	فيديو: من هنا يبدأ الأبطال	فيديو ترويجي يعرض لمحات من تدريبات الأبطال داخل نادي جامعة العاصمة عبر مختلف الألعاب الرياضية.	فيديو	uploads/news/champions-start-here.jpg	uploads/news/champions.mp4	1:30	2026-05-12 03:00:00	2026-05-13 03:41:54.110493	2026-05-13 03:41:54.110493
50	فيديو: تدريبات الملاكمة باحترافية	لقطات من حصص تدريبات الملاكمة بالنادي، تظهر مستوى التحضير البدني والمهاري للمتنافسين.	فيديو	uploads/news/boxing.jpg	uploads/news/boxing.mp4	0:55	2026-05-04 03:00:00	2026-05-13 03:41:54.11232	2026-05-13 03:41:54.11232
51	فيديو: مهارات كرة الريشة في بطولة النادي	مقتطفات من منافسات كرة الريشة بنادي جامعة العاصمة، تعرض مهارة ودقة اللاعبين خلال البطولة.	فيديو	uploads/news/tennis.jpg	uploads/news/badminton.mp4	1:10	2026-04-30 03:00:00	2026-05-13 03:41:54.11337	2026-05-13 03:41:54.11337
52	بطولة الجمباز الإيقاعي - مرحلة المتقدمات	انطلاق منافسات الجمباز الإيقاعي لمرحلة المتقدمات في بطولة النادي السنوية، بمشاركة لاعبات من جميع الفروع.	فعاليات	uploads/news/gymnastics-2.jpg	\N	\N	2026-04-19 02:00:00	2026-05-13 03:41:54.1145	2026-05-13 03:41:54.1145
\.


--
-- Data for Name: member_memberships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_memberships (id, member_id, membership_plan_id, start_date, end_date, status, payment_status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: member_relationships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_relationships (id, member_id, related_member_id, relationship_type, relationship_name_ar, is_dependent, age_group, created_at) FROM stdin;
1	11	33	child	ابن/ابنة	t	child	2026-05-13 00:44:17.556701
2	12	34	spouse	الزوج/الزوجة	t	child	2026-05-13 00:44:17.563644
3	13	35	child	ابن/ابنة	t	child	2026-05-13 00:44:17.567134
4	14	36	spouse	الزوج/الزوجة	t	adult	2026-05-13 00:44:17.5704
5	15	37	child	ابن/ابنة	t	adult	2026-05-13 00:44:17.5738
6	16	38	spouse	الزوج/الزوجة	t	adult	2026-05-13 00:44:17.578097
\.


--
-- Data for Name: member_team_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_team_subscriptions (id, member_id, team_id, created_by_staff_id, approved_by_staff_id, announcement_id, status, decline_reason, cancellation_reason, start_date, end_date, approved_at, declined_at, cancelled_at, monthly_fee, registration_fee, discount_amount, custom_price, payment_status, approval_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: member_teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_teams (id, team_id, member_id, created_at, updated_at, start_date, end_date, status, subscription_status, payment_id, payment_reference, payment_completed_at, admin_approved_at, approved_by_staff_id, price) FROM stdin;
\.


--
-- Data for Name: member_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_types (id, code, name_en, name_ar, description_en, description_ar, created_at, updated_at) FROM stdin;
1	WORKING	Working Member	عضو عامل	Active university employee	موظف نشط بالجامعة	2026-05-13 00:44:16.958964	2026-05-13 00:44:16.958964
2	STUDENT	University Student	طالب جامعي	Enrolled student	طالب مسجل بالجامعة	2026-05-13 00:44:16.958964	2026-05-13 00:44:16.958964
3	RETIRED	Retired Member	عضو متقاعد	Retired university staff	موظف متقاعد	2026-05-13 00:44:16.958964	2026-05-13 00:44:16.958964
4	DEPENDENT	Family Dependent	تابع عائلي	Family member (spouse / child)	فرد من العائلة	2026-05-13 00:44:16.958964	2026-05-13 00:44:16.958964
5	FOREIGNER	Foreigner	أجنبي	Non-Egyptian member	عضو أجنبي	2026-05-13 00:44:16.958964	2026-05-13 00:44:16.958964
6	SEASONAL	Seasonal Member	عضو موسمي	Short-term seasonal access	اشتراك موسمي قصير	2026-05-13 00:44:16.958964	2026-05-13 00:44:16.958964
7	VISITOR	Visitor	زائر	Day-pass visitor	زائر يومي	2026-05-13 00:44:16.958964	2026-05-13 00:44:16.958964
8	REGULAR	Regular Member	عضو عادي	\N	\N	2026-05-13 00:44:40.679251	2026-05-13 00:44:40.679251
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.members (id, account_id, first_name_en, first_name_ar, last_name_en, last_name_ar, gender, phone, nationality, birthdate, national_id, health_status, is_foreign, photo, national_id_front, national_id_back, address, medical_report, member_type_id, points_balance, status, created_at, updated_at) FROM stdin;
1	11	Omar	عمر	Adel	عادل	male	01000000001	Egyptian	2005-06-15	30000000000001	\N	f	\N	\N	\N	القاهرة، مصر	\N	2	249	active	2026-05-13 00:44:17.416768	2026-05-13 00:44:17.416768
2	12	Yousef	يوسف	Naser	ناصر	male	01000000002	Egyptian	2000-06-15	30000000000002	\N	f	\N	\N	\N	القاهرة، مصر	\N	2	47	active	2026-05-13 00:44:17.427617	2026-05-13 00:44:17.427617
3	13	Karim	كريم	Salah	صلاح	male	01000000003	Egyptian	2002-06-15	30000000000003	\N	f	\N	\N	\N	القاهرة، مصر	\N	2	387	active	2026-05-13 00:44:17.43285	2026-05-13 00:44:17.43285
4	14	Aly	علي	Ibrahim	إبراهيم	male	01000000004	Egyptian	2000-06-15	30000000000004	\N	f	\N	\N	\N	القاهرة، مصر	\N	2	144	active	2026-05-13 00:44:17.436396	2026-05-13 00:44:17.436396
5	15	Mahmoud	محمود	Refaat	رفعت	male	01000000005	Egyptian	2005-06-15	30000000000005	\N	f	\N	\N	\N	القاهرة، مصر	\N	2	222	active	2026-05-13 00:44:17.440319	2026-05-13 00:44:17.440319
6	16	Maryam	مريم	Hossam	حسام	female	01000000006	Egyptian	2002-06-15	30000000000006	\N	f	\N	\N	\N	القاهرة، مصر	\N	2	263	active	2026-05-13 00:44:17.444591	2026-05-13 00:44:17.444591
7	17	Nour	نور	Adly	عدلي	female	01000000007	Egyptian	2003-06-15	30000000000007	\N	f	\N	\N	\N	القاهرة، مصر	\N	2	275	suspended	2026-05-13 00:44:17.448739	2026-05-13 00:44:17.448739
8	18	Salma	سلمى	Magdy	مجدي	female	01000000008	Egyptian	2000-06-15	30000000000008	\N	f	\N	\N	\N	القاهرة، مصر	\N	2	146	expired	2026-05-13 00:44:17.452274	2026-05-13 00:44:17.452274
9	19	Reem	ريم	Ashraf	أشرف	female	01000000009	Egyptian	2002-06-15	30000000000009	\N	f	\N	\N	\N	القاهرة، مصر	\N	2	69	pending	2026-05-13 00:44:17.455766	2026-05-13 00:44:17.455766
10	20	Habiba	حبيبة	Tarek	طارق	female	01000000010	Egyptian	2005-06-15	30000000000010	\N	f	\N	\N	\N	القاهرة، مصر	\N	2	406	active	2026-05-13 00:44:17.459286	2026-05-13 00:44:17.459286
11	21	Hassan	حسن	Fawzy	فوزي	male	01000000011	Egyptian	1994-06-15	30000000000011	\N	f	\N	\N	\N	القاهرة، مصر	\N	1	345	active	2026-05-13 00:44:17.462968	2026-05-13 00:44:17.462968
12	22	Ali	علي	Saber	صابر	male	01000000012	Egyptian	1999-06-15	30000000000012	\N	f	\N	\N	\N	القاهرة، مصر	\N	1	154	active	2026-05-13 00:44:17.469452	2026-05-13 00:44:17.469452
13	23	Mohamed	محمد	Galal	جلال	male	01000000013	Egyptian	1997-06-15	30000000000013	\N	f	\N	\N	\N	القاهرة، مصر	\N	1	72	active	2026-05-13 00:44:17.47296	2026-05-13 00:44:17.47296
14	24	Ibrahim	إبراهيم	Anwar	أنور	male	01000000014	Egyptian	1992-06-15	30000000000014	\N	f	\N	\N	\N	القاهرة، مصر	\N	1	477	active	2026-05-13 00:44:17.47652	2026-05-13 00:44:17.47652
15	25	Dina	دينا	Hosny	حسني	female	01000000015	Egyptian	1994-06-15	30000000000015	\N	f	\N	\N	\N	القاهرة، مصر	\N	1	15	active	2026-05-13 00:44:17.482161	2026-05-13 00:44:17.482161
16	26	Rania	رانيا	Magdy	مجدي	female	01000000016	Egyptian	1995-06-15	30000000000016	\N	f	\N	\N	\N	القاهرة، مصر	\N	1	278	suspended	2026-05-13 00:44:17.485468	2026-05-13 00:44:17.485468
17	27	Yasmine	ياسمين	Khalil	خليل	female	01000000017	Egyptian	1981-06-15	30000000000017	\N	f	\N	\N	\N	القاهرة، مصر	\N	1	222	active	2026-05-13 00:44:17.489259	2026-05-13 00:44:17.489259
18	28	Amani	أماني	Helmy	حلمي	female	01000000018	Egyptian	1997-06-15	30000000000018	\N	f	\N	\N	\N	القاهرة، مصر	\N	1	412	expired	2026-05-13 00:44:17.493019	2026-05-13 00:44:17.493019
19	29	Mostafa	مصطفى	El-Said	السعيد	male	01000000019	Egyptian	1961-06-15	30000000000019	\N	f	\N	\N	\N	القاهرة، مصر	\N	3	103	active	2026-05-13 00:44:17.497	2026-05-13 00:44:17.497
20	30	Adel	عادل	El-Banna	البنا	male	01000000020	Egyptian	1958-06-15	30000000000020	\N	f	\N	\N	\N	القاهرة، مصر	\N	3	213	active	2026-05-13 00:44:17.503433	2026-05-13 00:44:17.503433
21	31	Galal	جلال	Rashed	راشد	male	01000000021	Egyptian	1958-06-15	30000000000021	\N	f	\N	\N	\N	القاهرة، مصر	\N	3	77	active	2026-05-13 00:44:17.506811	2026-05-13 00:44:17.506811
22	32	Fawzia	فوزية	Sherif	شريف	female	01000000022	Egyptian	1959-06-15	30000000000022	\N	f	\N	\N	\N	القاهرة، مصر	\N	3	245	active	2026-05-13 00:44:17.510374	2026-05-13 00:44:17.510374
23	33	Samia	سامية	Younis	يونس	female	01000000023	Egyptian	1960-06-15	30000000000023	\N	f	\N	\N	\N	القاهرة، مصر	\N	3	330	active	2026-05-13 00:44:17.514036	2026-05-13 00:44:17.514036
24	34	Hoda	هدى	Selim	سليم	female	01000000024	Egyptian	1959-06-15	30000000000024	\N	f	\N	\N	\N	القاهرة، مصر	\N	3	198	active	2026-05-13 00:44:17.517417	2026-05-13 00:44:17.517417
25	35	John	جون	Smith	سميث	male	01000000025	American	1982-06-15	30000000000025	\N	t	\N	\N	\N	القاهرة، مصر	\N	5	382	active	2026-05-13 00:44:17.52063	2026-05-13 00:44:17.52063
26	36	Maria	ماريا	Garcia	جارسيا	female	01000000026	Spanish	1991-06-15	30000000000026	\N	t	\N	\N	\N	القاهرة، مصر	\N	5	330	active	2026-05-13 00:44:17.526781	2026-05-13 00:44:17.526781
27	37	Hans	هانز	Mueller	مولر	male	01000000027	German	1993-06-15	30000000000027	\N	t	\N	\N	\N	القاهرة، مصر	\N	5	398	active	2026-05-13 00:44:17.531153	2026-05-13 00:44:17.531153
28	38	Aiko	أيكو	Tanaka	تاناكا	female	01000000028	Japanese	1985-06-15	30000000000028	\N	t	\N	\N	\N	القاهرة، مصر	\N	5	97	active	2026-05-13 00:44:17.53486	2026-05-13 00:44:17.53486
29	39	Seasonal1	موسمي	Member	عضو 1	male	01000000029	Egyptian	1997-06-15	30000000000029	\N	f	\N	\N	\N	القاهرة، مصر	\N	6	362	active	2026-05-13 00:44:17.538457	2026-05-13 00:44:17.538457
30	40	Seasonal2	موسمي	Member	عضو 2	female	01000000030	Egyptian	1993-06-15	30000000000030	\N	f	\N	\N	\N	القاهرة، مصر	\N	6	69	active	2026-05-13 00:44:17.542137	2026-05-13 00:44:17.542137
31	41	Seasonal3	موسمي	Member	عضو 3	male	01000000031	Egyptian	1980-06-15	30000000000031	\N	f	\N	\N	\N	القاهرة، مصر	\N	6	418	active	2026-05-13 00:44:17.548328	2026-05-13 00:44:17.548328
32	42	Seasonal4	موسمي	Member	عضو 4	female	01000000032	Egyptian	1996-06-15	30000000000032	\N	f	\N	\N	\N	القاهرة، مصر	\N	6	217	expired	2026-05-13 00:44:17.5521	2026-05-13 00:44:17.5521
33	43	Sara	سارة	Fawzy	فوزي	female	01000000033	Egyptian	1989-06-15	30000000000033	\N	f	\N	\N	\N	القاهرة، مصر	\N	4	315	active	2026-05-13 00:44:17.555477	2026-05-13 00:44:17.555477
34	44	Lina	لينا	Saber	صابر	female	01000000034	Egyptian	1990-06-15	30000000000034	\N	f	\N	\N	\N	القاهرة، مصر	\N	4	270	active	2026-05-13 00:44:17.562227	2026-05-13 00:44:17.562227
35	45	Yara	يارا	Galal	جلال	female	01000000035	Egyptian	1996-06-15	30000000000035	\N	f	\N	\N	\N	القاهرة، مصر	\N	4	292	active	2026-05-13 00:44:17.565948	2026-05-13 00:44:17.565948
36	46	Amr	عمرو	Anwar	أنور	male	01000000036	Egyptian	1993-06-15	30000000000036	\N	f	\N	\N	\N	القاهرة، مصر	\N	4	184	active	2026-05-13 00:44:17.569227	2026-05-13 00:44:17.569227
37	47	Hady	هادي	Hosny	حسني	male	01000000037	Egyptian	1995-06-15	30000000000037	\N	f	\N	\N	\N	القاهرة، مصر	\N	4	103	active	2026-05-13 00:44:17.572658	2026-05-13 00:44:17.572658
38	48	Karim	كريم	Magdy	مجدي	male	01000000038	Egyptian	1992-06-15	30000000000038	\N	f	\N	\N	\N	القاهرة، مصر	\N	4	265	active	2026-05-13 00:44:17.57663	2026-05-13 00:44:17.57663
\.


--
-- Data for Name: membership_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.membership_plans (id, member_type_id, plan_code, name_en, name_ar, description_en, description_ar, price, currency, duration_months, renewal_price, is_installable, max_installments, is_active, is_for_foreigner, min_age, max_age, created_at, updated_at) FROM stdin;
1	1	WRK-FAC	Faculty Member	عضوية هيئة التدريس	\N	مخصصة لأعضاء هيئة التدريس بالجامعة. تجديد سنوي بسعر رمزي.	20000.00	EGP	12	300.00	t	4	t	f	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
2	1	WRK-S1	Employee — Salary < 5000	موظف — راتب أقل من 5000 ج	\N	للموظفين والمعيدين ومدرسي المساعدين الذين يقل راتبهم عن 5000 جنيه.	2000.00	EGP	12	300.00	t	4	t	f	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
3	1	WRK-S2	Employee — Salary 5000-8000	موظف — راتب من 5000 حتى 8000 ج	\N	للموظفين الذين يتراوح راتبهم بين 5000 و 8000 جنيه.	5000.00	EGP	12	300.00	t	4	t	f	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
4	1	WRK-S3	Employee — Salary 8000-10000	موظف — راتب من 8000 حتى 10000 ج	\N	للموظفين الذين يتراوح راتبهم بين 8000 و 10000 جنيه.	8000.00	EGP	12	300.00	t	4	t	f	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
5	1	WRK-S4	Employee — Salary 10000+	موظف — راتب 10000 ج فأكثر	\N	للموظفين الذين يبلغ راتبهم 10000 جنيه أو أكثر.	10000.00	EGP	12	300.00	t	4	t	f	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
6	2	STU-Y	Student / Sports Member	عضوية الطالب أو الرياضي المتميز	\N	تُمنح للطالب أو الرياضي المتميز في أحد الرياضات بالنادي.	1000.00	EGP	12	1000.00	t	2	t	f	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
7	4	DEP-Y	Dependent Member	عضوية التابع	\N	للزوجة، الأبناء، والدا العضو، والطفل اليتيم المتكفل.	2000.00	EGP	12	2000.00	t	2	t	f	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
8	7	VIS-Y	Visitor Member	عضوية زائر	\N	للأعضاء من غير العاملين بجامعة العاصمة (سابقاً جامعة حلوان).	5000.00	EGP	12	5000.00	t	2	t	f	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
9	6	SEAS-6	Seasonal — 6 months	عضوية موسمية — 6 أشهر	\N	مدة أقصاها 6 أشهر. يتم الموافقة على العضو فردياً.	2000.00	EGP	6	2000.00	f	\N	t	f	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
10	5	FOR-Y-USD	Foreigner — Annual	عضوية موسمية للأجانب — سنة	\N	تُجدد بنفس السعر. حامل الجنسية غير المصرية.	100.00	USD	12	100.00	f	\N	t	t	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
11	5	FOR-H-USD	Foreigner — 6 months	عضوية موسمية للأجانب — 6 أشهر	\N	تُجدد بنفس السعر. حامل الجنسية غير المصرية.	50.00	USD	6	50.00	f	\N	t	t	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
12	5	FOR-M-USD	Foreigner — Monthly	عضوية موسمية للأجانب — شهر	\N	تُجدد بنفس السعر. حامل الجنسية غير المصرية.	10.00	USD	1	10.00	f	\N	t	t	\N	\N	2026-05-13 04:19:19.206488	2026-05-13 04:19:19.206488
\.


--
-- Data for Name: outsider_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.outsider_details (id, member_id, job_title_en, job_title_ar, employment_status, branch_id, visitor_type, passport_number, passport_photo, country, visa_status, duration_months, is_installable, created_at, updated_at) FROM stdin;
1	25	Researcher	باحث	employed	\N	visitor	P1000000	\N	USA	valid	\N	f	2026-05-13 00:44:17.521714	2026-05-13 00:44:17.521714
2	26	Researcher	باحث	employed	\N	visitor	P1000001	\N	Spain	valid	\N	f	2026-05-13 00:44:17.528627	2026-05-13 00:44:17.528627
3	27	Researcher	باحث	employed	\N	visitor	P1000002	\N	Germany	valid	\N	f	2026-05-13 00:44:17.532529	2026-05-13 00:44:17.532529
4	28	Researcher	باحث	employed	\N	visitor	P1000003	\N	Japan	expired	\N	f	2026-05-13 00:44:17.536348	2026-05-13 00:44:17.536348
5	29	\N	\N	employed	\N	seasonal-egy	\N	\N	\N	\N	3	f	2026-05-13 00:44:17.539817	2026-05-13 00:44:17.539817
6	30	\N	\N	employed	\N	seasonal-foreigner	\N	\N	\N	\N	6	f	2026-05-13 00:44:17.543378	2026-05-13 00:44:17.543378
7	31	\N	\N	employed	\N	seasonal-egy	\N	\N	\N	\N	12	t	2026-05-13 00:44:17.549884	2026-05-13 00:44:17.549884
8	32	\N	\N	employed	\N	seasonal-foreigner	\N	\N	\N	\N	6	f	2026-05-13 00:44:17.553265	2026-05-13 00:44:17.553265
\.


--
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.packages (id, code, name_en, name_ar, description_en, description_ar, is_active, created_at, updated_at) FROM stdin;
1	PKG_ADMIN	Admin Full Access	حزمة المدير	\N	\N	t	2026-05-13 00:44:16.991117	2026-05-13 00:44:16.991117
2	PKG_SPORTS	Sports Management	حزمة الرياضات	\N	\N	t	2026-05-13 00:44:16.991117	2026-05-13 00:44:16.991117
3	PKG_FINANCE	Finance Management	حزمة الشؤون المالية	\N	\N	t	2026-05-13 00:44:16.991117	2026-05-13 00:44:16.991117
4	PKG_REG	Registration	حزمة التسجيل	\N	\N	t	2026-05-13 00:44:16.991117	2026-05-13 00:44:16.991117
5	PKG_MEDIA	Media	حزمة الإعلام	\N	\N	t	2026-05-13 00:44:16.991117	2026-05-13 00:44:16.991117
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, payment_reference, transaction_id, payment_type, entity_type, entity_id, related_entity_type, related_entity_id, amount, currency, payment_method, gateway_name, gateway_response, status, created_at, updated_at, completed_at, refunded_at, processed_by_staff_id, refunded_by_staff_id, description, notes, metadata) FROM stdin;
1	PAY-000001	TXN-75872D3D544F	field_booking	member	5	\N	\N	1279.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.719388	2026-05-13 00:44:17.719388	\N	\N	\N	\N	\N	\N	\N
2	PAY-000002	TXN-E39CDEB09517	field_booking	member	4	\N	\N	1543.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.722079	2026-05-13 00:44:17.722079	\N	\N	\N	\N	\N	\N	\N
3	PAY-000003	TXN-E8ABC8B5B4F5	field_booking	member	13	\N	\N	153.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.723359	2026-05-13 00:44:17.723359	\N	\N	\N	\N	\N	\N	\N
4	PAY-000004	TXN-7874A4B43132	field_booking	member	4	\N	\N	295.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.724413	2026-05-13 00:44:17.724413	\N	\N	\N	\N	\N	\N	\N
5	PAY-000005	TXN-29F21251BA24	field_booking	member	10	\N	\N	840.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.725417	2026-05-13 00:44:17.725417	\N	\N	\N	\N	\N	\N	\N
6	PAY-000006	TXN-3B4A1F0E4B95	field_booking	member	2	\N	\N	586.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.726725	2026-05-13 00:44:17.726725	\N	\N	\N	\N	\N	\N	\N
7	PAY-000007	TXN-9A590D2E2385	field_booking	member	5	\N	\N	260.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.730226	2026-05-13 00:44:17.730226	\N	\N	\N	\N	\N	\N	\N
8	PAY-000008	TXN-D1808AB1456C	field_booking	member	19	\N	\N	1155.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.732454	2026-05-13 00:44:17.732454	\N	\N	\N	\N	\N	\N	\N
9	PAY-000009	TXN-2FDD6D8C94BF	field_booking	member	13	\N	\N	1268.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.73375	2026-05-13 00:44:17.73375	\N	\N	\N	\N	\N	\N	\N
10	PAY-000010	TXN-FC56810B0998	field_booking	member	2	\N	\N	188.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.734918	2026-05-13 00:44:17.734918	\N	\N	\N	\N	\N	\N	\N
11	PAY-000011	TXN-5C85F1829BC2	field_booking	member	13	\N	\N	424.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.736049	2026-05-13 00:44:17.736049	\N	\N	\N	\N	\N	\N	\N
12	PAY-000012	TXN-1FF99BA1EF02	field_booking	member	5	\N	\N	976.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.737226	2026-05-13 00:44:17.737226	\N	\N	\N	\N	\N	\N	\N
13	PAY-000013	TXN-0AC2EE6F00FE	field_booking	member	14	\N	\N	1130.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.738286	2026-05-13 00:44:17.738286	\N	\N	\N	\N	\N	\N	\N
14	PAY-000014	TXN-718EA36390BA	field_booking	member	15	\N	\N	601.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.739216	2026-05-13 00:44:17.739216	\N	\N	\N	\N	\N	\N	\N
15	PAY-000015	TXN-CBA1DE9EB5D6	field_booking	member	5	\N	\N	581.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.740042	2026-05-13 00:44:17.740042	\N	\N	\N	\N	\N	\N	\N
16	PAY-000016	TXN-ECF22C46A834	field_booking	member	5	\N	\N	265.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.741164	2026-05-13 00:44:17.741164	\N	\N	\N	\N	\N	\N	\N
17	PAY-000017	TXN-B6D5CC8016BC	field_booking	member	4	\N	\N	637.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.742128	2026-05-13 00:44:17.742128	\N	\N	\N	\N	\N	\N	\N
18	PAY-000018	TXN-A273A27DEF86	field_booking	member	19	\N	\N	1025.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.742958	2026-05-13 00:44:17.742958	\N	\N	\N	\N	\N	\N	\N
19	PAY-000019	TXN-C1E295771E5D	field_booking	member	12	\N	\N	1112.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.744018	2026-05-13 00:44:17.744018	\N	\N	\N	\N	\N	\N	\N
20	PAY-000020	TXN-171FD81A0B7B	field_booking	member	12	\N	\N	1418.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.745303	2026-05-13 00:44:17.745303	\N	\N	\N	\N	\N	\N	\N
21	PAY-000021	TXN-7DA56609CF2D	field_booking	member	12	\N	\N	677.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.746173	2026-05-13 00:44:17.746173	\N	\N	\N	\N	\N	\N	\N
22	PAY-000022	TXN-3512D1C5F179	field_booking	member	4	\N	\N	1309.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.746973	2026-05-13 00:44:17.746973	\N	\N	\N	\N	\N	\N	\N
23	PAY-000023	TXN-0BE84EB67799	field_booking	member	20	\N	\N	1402.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.747992	2026-05-13 00:44:17.747992	\N	\N	\N	\N	\N	\N	\N
24	PAY-000024	TXN-160E874B4565	field_booking	member	2	\N	\N	1366.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.749016	2026-05-13 00:44:17.749016	\N	\N	\N	\N	\N	\N	\N
25	PAY-000025	TXN-7F3EE73A13D9	field_booking	member	6	\N	\N	313.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.750059	2026-05-13 00:44:17.750059	\N	\N	\N	\N	\N	\N	\N
26	PAY-000026	TXN-951F9534A748	field_booking	member	17	\N	\N	1094.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.751075	2026-05-13 00:44:17.751075	\N	\N	\N	\N	\N	\N	\N
27	PAY-000027	TXN-6F0621567474	field_booking	member	2	\N	\N	522.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.751878	2026-05-13 00:44:17.751878	\N	\N	\N	\N	\N	\N	\N
28	PAY-000028	TXN-F71FF478F2F2	field_booking	member	4	\N	\N	148.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.752757	2026-05-13 00:44:17.752757	\N	\N	\N	\N	\N	\N	\N
29	PAY-000029	TXN-373D2423E1D0	field_booking	member	13	\N	\N	1551.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.753545	2026-05-13 00:44:17.753545	\N	\N	\N	\N	\N	\N	\N
30	PAY-000030	TXN-5F6B42A266BE	field_booking	member	19	\N	\N	969.00	EGP	credit_card	\N	\N	completed	2026-05-13 00:44:17.754701	2026-05-13 00:44:17.754701	\N	\N	\N	\N	\N	\N	\N
31	PAY-000031	TXN-6412C62BEA72	membership_fee	member	4	\N	\N	1365.00	EGP	cash	\N	\N	completed	2026-05-13 00:44:17.755826	2026-05-13 00:44:17.755826	\N	\N	\N	\N	\N	\N	\N
32	PAY-000032	TXN-879C8AB67655	membership_fee	member	12	\N	\N	1361.00	EGP	cash	\N	\N	completed	2026-05-13 00:44:17.756836	2026-05-13 00:44:17.756836	\N	\N	\N	\N	\N	\N	\N
33	PAY-000033	TXN-230EDB31E07D	membership_fee	member	20	\N	\N	1009.00	EGP	cash	\N	\N	completed	2026-05-13 00:44:17.757851	2026-05-13 00:44:17.757851	\N	\N	\N	\N	\N	\N	\N
34	PAY-000034	TXN-F35A0E5C6D0C	membership_fee	member	15	\N	\N	1439.00	EGP	cash	\N	\N	completed	2026-05-13 00:44:17.758975	2026-05-13 00:44:17.758975	\N	\N	\N	\N	\N	\N	\N
35	PAY-000035	TXN-B5ECC8E89A2C	membership_fee	member	3	\N	\N	1217.00	EGP	cash	\N	\N	completed	2026-05-13 00:44:17.760282	2026-05-13 00:44:17.760282	\N	\N	\N	\N	\N	\N	\N
36	PAY-000036	TXN-FD02F7CFDBA1	membership_fee	member	17	\N	\N	638.00	EGP	cash	\N	\N	completed	2026-05-13 00:44:17.761977	2026-05-13 00:44:17.761977	\N	\N	\N	\N	\N	\N	\N
37	PAY-000037	TXN-6350849F39A6	membership_fee	member	3	\N	\N	712.00	EGP	cash	\N	\N	completed	2026-05-13 00:44:17.763048	2026-05-13 00:44:17.763048	\N	\N	\N	\N	\N	\N	\N
38	PAY-000038	TXN-237D90890378	membership_fee	member	6	\N	\N	551.00	EGP	cash	\N	\N	completed	2026-05-13 00:44:17.764096	2026-05-13 00:44:17.764096	\N	\N	\N	\N	\N	\N	\N
39	PAY-000039	\N	team_subscription	member	19	\N	\N	770.00	EGP	bank_transfer	\N	\N	pending	2026-05-13 00:44:17.765094	2026-05-13 00:44:17.765094	\N	\N	\N	\N	\N	\N	\N
40	PAY-000040	\N	team_subscription	member	2	\N	\N	839.00	EGP	bank_transfer	\N	\N	pending	2026-05-13 00:44:17.766204	2026-05-13 00:44:17.766204	\N	\N	\N	\N	\N	\N	\N
41	PAY-000041	\N	team_subscription	member	19	\N	\N	664.00	EGP	bank_transfer	\N	\N	pending	2026-05-13 00:44:17.767305	2026-05-13 00:44:17.767305	\N	\N	\N	\N	\N	\N	\N
42	PAY-000042	\N	team_subscription	member	12	\N	\N	940.00	EGP	bank_transfer	\N	\N	pending	2026-05-13 00:44:17.768301	2026-05-13 00:44:17.768301	\N	\N	\N	\N	\N	\N	\N
43	PAY-000043	\N	team_subscription	member	20	\N	\N	409.00	EGP	bank_transfer	\N	\N	pending	2026-05-13 00:44:17.769302	2026-05-13 00:44:17.769302	\N	\N	\N	\N	\N	\N	\N
44	PAY-000044	\N	field_booking	member	11	\N	\N	1236.00	EGP	credit_card	\N	\N	failed	2026-05-13 00:44:17.770412	2026-05-13 00:44:17.770412	\N	\N	\N	\N	\N	\N	\N
45	PAY-000045	\N	field_booking	member	2	\N	\N	899.00	EGP	credit_card	\N	\N	failed	2026-05-13 00:44:17.771445	2026-05-13 00:44:17.771445	\N	\N	\N	\N	\N	\N	\N
46	PAY-000046	\N	field_booking	member	14	\N	\N	433.00	EGP	credit_card	\N	\N	failed	2026-05-13 00:44:17.772098	2026-05-13 00:44:17.772098	\N	\N	\N	\N	\N	\N	\N
47	PAY-000047	\N	field_booking	member	5	\N	\N	1214.00	EGP	credit_card	\N	\N	failed	2026-05-13 00:44:17.772927	2026-05-13 00:44:17.772927	\N	\N	\N	\N	\N	\N	\N
48	PAY-000048	\N	field_booking	member	5	\N	\N	264.00	EGP	credit_card	\N	\N	refunded	2026-05-13 00:44:17.773539	2026-05-13 00:44:17.773539	\N	\N	\N	\N	\N	\N	\N
49	PAY-000049	\N	field_booking	member	10	\N	\N	1181.00	EGP	credit_card	\N	\N	refunded	2026-05-13 00:44:17.774139	2026-05-13 00:44:17.774139	\N	\N	\N	\N	\N	\N	\N
50	PAY-000050	\N	package_purchase	member	1	\N	\N	1099.00	EGP	wallet	\N	\N	processing	2026-05-13 00:44:17.774907	2026-05-13 00:44:17.774907	\N	\N	\N	\N	\N	\N	\N
51	PAY-000051	\N	package_purchase	member	17	\N	\N	1037.00	EGP	wallet	\N	\N	processing	2026-05-13 00:44:17.775815	2026-05-13 00:44:17.775815	\N	\N	\N	\N	\N	\N	\N
52	PAY-000052	\N	package_purchase	member	1	\N	\N	1453.00	EGP	wallet	\N	\N	processing	2026-05-13 00:44:17.778313	2026-05-13 00:44:17.778313	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: privileges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.privileges (id, code, name_en, name_ar, description_en, description_ar, module, is_active, created_at, updated_at) FROM stdin;
1	MEMBERS_VIEW	View Members	عرض الأعضاء	\N	\N	\N	t	2026-05-13 00:44:16.987814	2026-05-13 00:44:16.987814
2	MEMBERS_EDIT	Edit Members	تعديل الأعضاء	\N	\N	\N	t	2026-05-13 00:44:16.987814	2026-05-13 00:44:16.987814
3	MEMBERS_APPROVE	Approve Members	اعتماد الأعضاء	\N	\N	\N	t	2026-05-13 00:44:16.987814	2026-05-13 00:44:16.987814
4	SPORTS_MANAGE	Manage Sports	إدارة الرياضات	\N	\N	\N	t	2026-05-13 00:44:16.987814	2026-05-13 00:44:16.987814
5	TEAMS_MANAGE	Manage Teams	إدارة الفرق	\N	\N	\N	t	2026-05-13 00:44:16.987814	2026-05-13 00:44:16.987814
6	BOOKINGS_VIEW	View Bookings	عرض الحجوزات	\N	\N	\N	t	2026-05-13 00:44:16.987814	2026-05-13 00:44:16.987814
7	BOOKINGS_MANAGE	Manage Bookings	إدارة الحجوزات	\N	\N	\N	t	2026-05-13 00:44:16.987814	2026-05-13 00:44:16.987814
8	PAYMENTS_VIEW	View Payments	عرض المدفوعات	\N	\N	\N	t	2026-05-13 00:44:16.987814	2026-05-13 00:44:16.987814
9	PAYMENTS_APPROVE	Approve Payments	اعتماد المدفوعات	\N	\N	\N	t	2026-05-13 00:44:16.987814	2026-05-13 00:44:16.987814
10	AUDIT_VIEW	View Audit Logs	عرض سجلات التدقيق	\N	\N	\N	t	2026-05-13 00:44:16.987814	2026-05-13 00:44:16.987814
11	MEDIA_MANAGE	Manage Media	إدارة المحتوى الإعلامي	\N	\N	\N	t	2026-05-13 00:44:16.987814	2026-05-13 00:44:16.987814
\.


--
-- Data for Name: professions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.professions (id, code, name_en, name_ar, created_at, updated_at) FROM stdin;
1	PROF	Professor	أستاذ	2026-05-13 00:44:16.979338	2026-05-13 00:44:16.979338
2	AST_PROF	Associate Professor	أستاذ مساعد	2026-05-13 00:44:16.979338	2026-05-13 00:44:16.979338
3	LECT	Lecturer	مدرس	2026-05-13 00:44:16.979338	2026-05-13 00:44:16.979338
4	TA	Teaching Assistant	معيد	2026-05-13 00:44:16.979338	2026-05-13 00:44:16.979338
5	ADMIN_STAFF	Administrative Staff	موظف إداري	2026-05-13 00:44:16.979338	2026-05-13 00:44:16.979338
6	ACCT	Accountant	محاسب	2026-05-13 00:44:16.979338	2026-05-13 00:44:16.979338
7	ENG_W	Engineer	مهندس	2026-05-13 00:44:16.979338	2026-05-13 00:44:16.979338
8	DOC	Doctor	طبيب	2026-05-13 00:44:16.979338	2026-05-13 00:44:16.979338
9	TECH	Technician	فني	2026-05-13 00:44:16.979338	2026-05-13 00:44:16.979338
10	SEC	Security	أمن	2026-05-13 00:44:16.979338	2026-05-13 00:44:16.979338
\.


--
-- Data for Name: retired_employee_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.retired_employee_details (id, member_id, profession_code, former_department_en, former_department_ar, retirement_date, last_salary, salary_slip, created_at, updated_at) FROM stdin;
1	19	RETIRED_PROF	Engineering	الهندسة	2025-03-29	19389.00	\N	2026-05-13 00:44:17.498241	2026-05-13 00:44:17.498241
2	20	RETIRED_TA	Engineering	الهندسة	2022-12-20	12043.00	\N	2026-05-13 00:44:17.50459	2026-05-13 00:44:17.50459
3	21	RETIRED_AL	Engineering	الهندسة	2022-03-05	17621.00	\N	2026-05-13 00:44:17.507919	2026-05-13 00:44:17.507919
4	22	RETIRED_STAFF	Engineering	الهندسة	2021-05-15	13559.00	\N	2026-05-13 00:44:17.511832	2026-05-13 00:44:17.511832
5	23	RETIRED_PROF	Engineering	الهندسة	2024-06-23	18876.00	\N	2026-05-13 00:44:17.515105	2026-05-13 00:44:17.515105
6	24	RETIRED_TA	Engineering	الهندسة	2025-04-21	15631.00	\N	2026-05-13 00:44:17.518538	2026-05-13 00:44:17.518538
\.


--
-- Data for Name: sports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sports (id, name_en, name_ar, description_en, description_ar, price, status, created_by_staff_id, approved_by_staff_id, approved_at, approval_comments, sport_image, max_participants, is_active, created_at, updated_at) FROM stdin;
1	Football	كرة القدم	Football sport for all members	رياضة كرة القدم لجميع الأعضاء	150.00	active	2	1	2026-04-13 00:44:17.028	\N	\N	50	t	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
2	Basketball	كرة السلة	Basketball sport for all members	رياضة كرة السلة لجميع الأعضاء	120.00	active	2	1	2026-04-13 00:44:17.028	\N	\N	50	t	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
3	Volleyball	الكرة الطائرة	Volleyball sport for all members	رياضة الكرة الطائرة لجميع الأعضاء	100.00	active	2	1	2026-04-13 00:44:17.028	\N	\N	50	t	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
4	Tennis	التنس	Tennis sport for all members	رياضة التنس لجميع الأعضاء	200.00	active	2	1	2026-04-13 00:44:17.028	\N	\N	50	t	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
5	Swimming	السباحة	Swimming sport for all members	رياضة السباحة لجميع الأعضاء	180.00	active	2	1	2026-04-13 00:44:17.028	\N	\N	50	t	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
6	Judo	الجودو	Judo sport for all members	رياضة الجودو لجميع الأعضاء	130.00	active	2	1	2026-04-13 00:44:17.028	\N	\N	50	t	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
7	Karate	الكاراتيه	Karate sport for all members	رياضة الكاراتيه لجميع الأعضاء	130.00	active	2	1	2026-04-13 00:44:17.028	\N	\N	50	t	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
8	Squash	الإسكواش	Squash sport for all members	رياضة الإسكواش لجميع الأعضاء	160.00	active	2	1	2026-04-13 00:44:17.028	\N	\N	50	t	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
9	Snooker	السنوكر	Snooker sport for all members	رياضة السنوكر لجميع الأعضاء	80.00	active	2	1	2026-04-13 00:44:17.028	\N	\N	50	t	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
10	Chess	الشطرنج	Chess sport for all members	رياضة الشطرنج لجميع الأعضاء	50.00	active	2	1	2026-04-13 00:44:17.028	\N	\N	50	t	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
11	Athletics	ألعاب القوى	Athletics sport for all members	رياضة ألعاب القوى لجميع الأعضاء	90.00	pending	2	\N	\N	\N	\N	50	f	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
12	Yoga	اليوجا	Yoga sport for all members	رياضة اليوجا لجميع الأعضاء	110.00	inactive	2	\N	\N	\N	\N	50	f	2026-05-13 00:44:17.029772	2026-05-13 00:44:17.029772
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff (id, account_id, staff_type_id, first_name_en, first_name_ar, last_name_en, last_name_ar, national_id, phone, address, employment_start_date, employment_end_date, status, is_active, academic_certificate, national_id_front, national_id_back, military_service_doc, criminal_record, employer_approval_letter, employment_status_statement, good_conduct_certificate, personal_photo, personal_info_form, experience_certificates, created_at, updated_at) FROM stdin;
2	2	2	Mohamed	محمد	Saad	سعد	28503044322002	01001110002	القاهرة، مصر	2023-10-24	\N	active	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-13 00:44:17.006882	2026-05-13 00:44:17.006882
3	3	3	Khaled	خالد	Naguib	نجيب	29007054411003	01001110003	القاهرة، مصر	2021-06-15	\N	active	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-13 00:44:17.010214	2026-05-13 00:44:17.010214
4	4	4	Sara	سارة	Mostafa	مصطفى	28602025566004	01001110004	القاهرة، مصر	2021-12-17	\N	active	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-13 00:44:17.015135	2026-05-13 00:44:17.015135
5	5	5	Mona	منى	Ibrahim	إبراهيم	29104077788005	01001110005	القاهرة، مصر	2023-04-13	\N	active	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-13 00:44:17.017563	2026-05-13 00:44:17.017563
6	6	6	Tarek	طارق	El-Sayed	السيد	28709044455006	01001110006	القاهرة، مصر	2023-07-19	\N	active	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-13 00:44:17.020093	2026-05-13 00:44:17.020093
7	7	7	Heba	هبة	Adel	عادل	29002088899007	01001110007	القاهرة، مصر	2022-05-22	\N	active	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-13 00:44:17.022307	2026-05-13 00:44:17.022307
8	8	8	Hossam	حسام	Fathy	فتحي	28412033322008	01001110008	القاهرة، مصر	2021-07-23	\N	active	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-13 00:44:17.024046	2026-05-13 00:44:17.024046
9	9	9	Nour	نور	Kamal	كمال	29306016677009	01001110009	القاهرة، مصر	2021-12-12	\N	active	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-13 00:44:17.026428	2026-05-13 00:44:17.026428
10	10	10	Yasser	ياسر	Galal	جلال	28508099911010	01001110010	القاهرة، مصر	2024-02-09	\N	active	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-13 00:44:17.028518	2026-05-13 00:44:17.028518
1	1	1	Amr	عمرو	El Sayed	السيد	29001011234001	01001110001	القاهرة، مصر	2022-01-18	\N	active	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-13 00:44:17.001773	2026-05-13 00:44:17.001773
\.


--
-- Data for Name: staff_action_approvals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_action_approvals (id, staff_id, action_type, action_data, status, submitted_by, approved_by, approval_comments, submitted_at, approved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff_activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_activity_logs (id, staff_id, action_type, description, performed_by, created_at) FROM stdin;
\.


--
-- Data for Name: staff_packages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_packages (staff_id, package_id, assigned_at, assigned_by) FROM stdin;
\.


--
-- Data for Name: staff_privileges_override; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_privileges_override (staff_id, privilege_id, is_granted, assigned_at, assigned_by) FROM stdin;
\.


--
-- Data for Name: staff_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_types (id, code, name_en, name_ar, description_en, description_ar, is_active, created_at, updated_at) FROM stdin;
1	ADMIN	Administrator	مدير النظام	Full admin access	صلاحيات كاملة	t	2026-05-13 00:44:16.971478	2026-05-13 00:44:16.971478
2	SPORT_MANAGER	Sports Manager	مدير النشاط الرياضي	Manages sports and teams	إدارة الرياضات والفرق	t	2026-05-13 00:44:16.971478	2026-05-13 00:44:16.971478
3	SPORT_SPECIALIST	Sports Specialist	أخصائي رياضي	Sport-level specialist	متخصص رياضي	t	2026-05-13 00:44:16.971478	2026-05-13 00:44:16.971478
4	FINANCIAL_DIRECTOR	Financial Director	مدير الشؤون المالية	Financial oversight	إدارة الشؤون المالية	t	2026-05-13 00:44:16.971478	2026-05-13 00:44:16.971478
5	REGISTRATION_STAFF	Registration Staff	موظف تسجيل	Member registration & approval	تسجيل وقبول الأعضاء	t	2026-05-13 00:44:16.971478	2026-05-13 00:44:16.971478
6	TEAM_MANAGER	Team Manager	مدير الفريق	Manages a sport team	إدارة فريق رياضي	t	2026-05-13 00:44:16.971478	2026-05-13 00:44:16.971478
7	SUPPORT	Support Staff	موظف دعم	Customer support	دعم العملاء	t	2026-05-13 00:44:16.971478	2026-05-13 00:44:16.971478
8	AUDITOR	Auditor	مدقق	Read-only audit access	صلاحيات مراجعة فقط	t	2026-05-13 00:44:16.971478	2026-05-13 00:44:16.971478
9	MEDIA	Media Officer	مسؤول الإعلام	Manages media posts and announcements	إدارة المحتوى الإعلامي	t	2026-05-13 00:44:16.971478	2026-05-13 00:44:16.971478
10	SECURITY	Security Officer	مسؤول الأمن	Security dashboard & access control	لوحة الأمن ومراقبة الدخول	t	2026-05-13 00:44:16.971478	2026-05-13 00:44:16.971478
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, title, description, type, status, data, created_by, assigned_to, created_at, updated_at) FROM stdin;
1	Review pending member applications	Task: Review pending member applications	GENERAL	pending	\N	\N	\N	2026-05-13 00:44:17.807831	2026-05-13 00:44:17.807831
2	Approve sport: Athletics	Task: Approve sport: Athletics	GENERAL	pending	\N	\N	\N	2026-05-13 00:44:17.810771	2026-05-13 00:44:17.810771
3	Reset security gate firmware	Task: Reset security gate firmware	GENERAL	pending	\N	\N	\N	2026-05-13 00:44:17.817523	2026-05-13 00:44:17.817523
\.


--
-- Data for Name: team_member_team_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_member_team_subscriptions (id, team_member_id, team_id, created_by_staff_id, approved_by_staff_id, announcement_id, status, decline_reason, cancellation_reason, start_date, end_date, approved_at, declined_at, cancelled_at, monthly_fee, registration_fee, discount_amount, custom_price, payment_status, approval_notes, special_notes, is_captain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: team_member_teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_member_teams (id, team_member_id, team_id, start_date, end_date, status, subscription_status, payment_id, payment_reference, payment_completed_at, admin_approved_at, approved_by_staff_id, price, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (id, account_id, first_name_en, first_name_ar, last_name_en, last_name_ar, gender, phone, nationality, birthdate, national_id, address, photo, medical_report, national_id_front, national_id_back, proof, is_foreign, member_type_id, status, created_at, updated_at) FROM stdin;
1	49	Ahmed	أحمد	Goalie	الحارس	male	01000000039	Egyptian	1995-01-01	30000000000039	\N	\N	\N	\N	\N	\N	f	1	active	2026-05-13 00:44:17.627945	2026-05-13 00:44:17.627945
2	50	Mohamed	محمد	Striker	المهاجم	male	01000000040	Egyptian	1995-01-01	30000000000040	\N	\N	\N	\N	\N	\N	f	1	active	2026-05-13 00:44:17.634318	2026-05-13 00:44:17.634318
3	51	Hossam	حسام	Defender	المدافع	male	01000000041	Egyptian	1995-01-01	30000000000041	\N	\N	\N	\N	\N	\N	f	1	active	2026-05-13 00:44:17.636634	2026-05-13 00:44:17.636634
4	52	Karim	كريم	Mid	الوسط	male	01000000042	Egyptian	1995-01-01	30000000000042	\N	\N	\N	\N	\N	\N	f	1	active	2026-05-13 00:44:17.638876	2026-05-13 00:44:17.638876
5	53	Ramzy	رمزي	Coach	المدرب	male	01000000043	Egyptian	1995-01-01	30000000000043	\N	\N	\N	\N	\N	\N	f	1	active	2026-05-13 00:44:17.641135	2026-05-13 00:44:17.641135
6	54	Hany	هاني	Coach	المدرب	male	01000000044	Egyptian	1995-01-01	30000000000044	\N	\N	\N	\N	\N	\N	f	1	active	2026-05-13 00:44:17.643643	2026-05-13 00:44:17.643643
7	55	Mariam	مريم	Wing	الجناح	female	01000000045	Egyptian	1995-01-01	30000000000045	\N	\N	\N	\N	\N	\N	f	1	active	2026-05-13 00:44:17.6467	2026-05-13 00:44:17.6467
8	56	Salma	سلمى	Captain	القائد	female	01000000046	Egyptian	1995-01-01	30000000000046	\N	\N	\N	\N	\N	\N	f	1	active	2026-05-13 00:44:17.64909	2026-05-13 00:44:17.64909
\.


--
-- Data for Name: team_training_schedules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_training_schedules (id, team_id, sport_id, days_en, days_ar, start_time, end_time, field_id, training_fee, status, created_at, updated_at) FROM stdin;
0886509f-7dc6-41eb-9dac-8e676fac00a5	bc75b22a-6652-46df-b068-91a1d6d4e705	1	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	ffd92b7f-8aeb-449a-b158-9754ded07484	0.00	active	2026-05-13 00:44:17.349301	2026-05-13 00:44:17.349301
fa2763ba-9cac-42d3-93b4-af41fc69fb1c	1645d815-1d80-46a8-8439-a9e7cee5a162	1	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	36cb88bf-7ae1-44b8-9917-517e00f81bee	0.00	active	2026-05-13 00:44:17.355815	2026-05-13 00:44:17.355815
d27b075c-dd7e-4218-b36e-911afbd8dbcd	12898f30-b34d-431f-8f27-628aa00c81b7	2	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	0.00	active	2026-05-13 00:44:17.360833	2026-05-13 00:44:17.360833
f643e8a1-ee94-4857-9063-e7dec2261022	36c4267f-fcbd-4fa4-973d-0518198aaea7	2	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	f342819d-3071-4f9e-8ad4-eabbee36d308	0.00	active	2026-05-13 00:44:17.366967	2026-05-13 00:44:17.366967
053590f5-e696-4794-b667-8a56363ec74d	292f64d1-b7c0-4ed9-8961-186bee5f1496	3	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	6620b223-2868-4e6c-8569-bcd9f59cc065	0.00	active	2026-05-13 00:44:17.371007	2026-05-13 00:44:17.371007
228a7da2-d917-4e21-9d84-492180c690f7	31947fe1-cc31-4e80-b646-9c22e2ba4fd6	3	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	eacb4187-0985-41f8-b83f-a003d7e01334	0.00	active	2026-05-13 00:44:17.375193	2026-05-13 00:44:17.375193
08c0ccea-d756-4a59-bb9d-a884fdac1c5b	1cfde507-cf64-4f24-90fc-9234fde24ee2	4	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	a2caabbd-0dcf-4d8e-a435-aae5d948c696	0.00	active	2026-05-13 00:44:17.380268	2026-05-13 00:44:17.380268
ca0f5dbe-abda-4e82-8c31-6f8bd90301d4	cf4b8a84-bad7-443c-ad77-80bfe46f1623	4	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	0.00	active	2026-05-13 00:44:17.383578	2026-05-13 00:44:17.383578
d7280b44-79d2-4b22-b93c-3930b6f00afd	93c9a4ee-28ff-45b8-95ed-7aa6f6015fff	5	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	889c5ca5-6a17-4284-ac72-a422899a10a4	0.00	active	2026-05-13 00:44:17.386791	2026-05-13 00:44:17.386791
6f02e980-f74b-4e80-bdff-96df25487111	7f286438-bd65-4135-8190-9da2195c4a25	5	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	17d18fec-d3d7-4818-a646-21a61059d140	0.00	active	2026-05-13 00:44:17.389823	2026-05-13 00:44:17.389823
354150e4-ff47-4f94-85f9-5baf3cd3cab9	de903003-30b4-4b03-adb8-8199f7686735	6	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	8ecb60ec-9030-41a3-be0e-804105a01dc0	0.00	active	2026-05-13 00:44:17.394013	2026-05-13 00:44:17.394013
49d1e837-5163-4371-9927-a2a5fd1a901b	940fa480-f81d-4463-aca0-a59b3df57a11	6	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	8f92894d-47f2-4ec1-a68d-09001b024132	0.00	active	2026-05-13 00:44:17.397796	2026-05-13 00:44:17.397796
6b6f0224-ddc0-4194-99a0-c95f10762b3a	e7b1acc7-aec8-4187-9bc7-3ada60d3272a	7	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	\N	0.00	active	2026-05-13 00:44:17.401503	2026-05-13 00:44:17.401503
48c4face-501e-4cc2-a71d-2a4a0d463a31	01200731-9346-48d1-b4b8-830e843950ad	7	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	\N	0.00	active	2026-05-13 00:44:17.404801	2026-05-13 00:44:17.404801
cb2eb471-4289-4d0d-82ae-5baffa61c1a8	0be9030e-0e1b-4c79-bb33-a3f1bd504132	8	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	\N	0.00	active	2026-05-13 00:44:17.408412	2026-05-13 00:44:17.408412
0c2c779e-0272-49e8-926b-4d1cb24bf848	b9ac47bb-a4a9-4858-94d5-cee472e079f5	8	Sunday, Tuesday, Thursday	الأحد، الثلاثاء، الخميس	18:00:00	20:00:00	\N	0.00	active	2026-05-13 00:44:17.412904	2026-05-13 00:44:17.412904
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teams (id, sport_id, branch_id, field_id, name_en, name_ar, max_participants, status, visibility_type, price, subscription_price, approval_required, created_at, updated_at) FROM stdin;
bc75b22a-6652-46df-b068-91a1d6d4e705	1	1	ffd92b7f-8aeb-449a-b158-9754ded07484	Football Team - MAIN	فريق كرة القدم - الفرع الرئيسي - حلوان	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.342904	2026-05-13 00:44:17.342904
1645d815-1d80-46a8-8439-a9e7cee5a162	1	2	36cb88bf-7ae1-44b8-9917-517e00f81bee	Football Team - 6OCT	فريق كرة القدم - فرع 6 أكتوبر	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.353311	2026-05-13 00:44:17.353311
12898f30-b34d-431f-8f27-628aa00c81b7	2	1	bf6c49e3-ee01-4f51-927a-d0fe5949c7ea	Basketball Team - MAIN	فريق كرة السلة - الفرع الرئيسي - حلوان	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.358026	2026-05-13 00:44:17.358026
36c4267f-fcbd-4fa4-973d-0518198aaea7	2	2	f342819d-3071-4f9e-8ad4-eabbee36d308	Basketball Team - 6OCT	فريق كرة السلة - فرع 6 أكتوبر	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.364666	2026-05-13 00:44:17.364666
292f64d1-b7c0-4ed9-8961-186bee5f1496	3	1	6620b223-2868-4e6c-8569-bcd9f59cc065	Volleyball Team - MAIN	فريق الكرة الطائرة - الفرع الرئيسي - حلوان	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.369086	2026-05-13 00:44:17.369086
31947fe1-cc31-4e80-b646-9c22e2ba4fd6	3	2	eacb4187-0985-41f8-b83f-a003d7e01334	Volleyball Team - 6OCT	فريق الكرة الطائرة - فرع 6 أكتوبر	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.372979	2026-05-13 00:44:17.372979
1cfde507-cf64-4f24-90fc-9234fde24ee2	4	1	a2caabbd-0dcf-4d8e-a435-aae5d948c696	Tennis Team - MAIN	فريق التنس - الفرع الرئيسي - حلوان	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.377954	2026-05-13 00:44:17.377954
cf4b8a84-bad7-443c-ad77-80bfe46f1623	4	2	bfdd88b9-7dba-4ed2-84b8-ee4785ddbff6	Tennis Team - 6OCT	فريق التنس - فرع 6 أكتوبر	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.381959	2026-05-13 00:44:17.381959
93c9a4ee-28ff-45b8-95ed-7aa6f6015fff	5	1	889c5ca5-6a17-4284-ac72-a422899a10a4	Swimming Team - MAIN	فريق السباحة - الفرع الرئيسي - حلوان	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.38517	2026-05-13 00:44:17.38517
7f286438-bd65-4135-8190-9da2195c4a25	5	2	17d18fec-d3d7-4818-a646-21a61059d140	Swimming Team - 6OCT	فريق السباحة - فرع 6 أكتوبر	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.38827	2026-05-13 00:44:17.38827
de903003-30b4-4b03-adb8-8199f7686735	6	1	8ecb60ec-9030-41a3-be0e-804105a01dc0	Judo Team - MAIN	فريق الجودو - الفرع الرئيسي - حلوان	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.391464	2026-05-13 00:44:17.391464
940fa480-f81d-4463-aca0-a59b3df57a11	6	2	8f92894d-47f2-4ec1-a68d-09001b024132	Judo Team - 6OCT	فريق الجودو - فرع 6 أكتوبر	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.396001	2026-05-13 00:44:17.396001
e7b1acc7-aec8-4187-9bc7-3ada60d3272a	7	1	\N	Karate Team - MAIN	فريق الكاراتيه - الفرع الرئيسي - حلوان	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.399735	2026-05-13 00:44:17.399735
01200731-9346-48d1-b4b8-830e843950ad	7	2	\N	Karate Team - 6OCT	فريق الكاراتيه - فرع 6 أكتوبر	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.403213	2026-05-13 00:44:17.403213
0be9030e-0e1b-4c79-bb33-a3f1bd504132	8	1	\N	Squash Team - MAIN	فريق الإسكواش - الفرع الرئيسي - حلوان	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.406475	2026-05-13 00:44:17.406475
b9ac47bb-a4a9-4858-94d5-cee472e079f5	8	2	\N	Squash Team - 6OCT	فريق الإسكواش - فرع 6 أكتوبر	25	active	BOTH	\N	\N	f	2026-05-13 00:44:17.410488	2026-05-13 00:44:17.410488
\.


--
-- Data for Name: university_student_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.university_student_details (id, member_id, faculty_id, graduation_year, enrollment_date, student_proof, created_at, updated_at) FROM stdin;
1	1	1	2028	2023-10-10	\N	2026-05-13 00:44:17.421809	2026-05-13 00:44:17.421809
2	2	2	2028	2023-12-29	\N	2026-05-13 00:44:17.430466	2026-05-13 00:44:17.430466
3	3	3	2028	2023-08-28	\N	2026-05-13 00:44:17.434223	2026-05-13 00:44:17.434223
4	4	4	2027	2023-07-28	\N	2026-05-13 00:44:17.437974	2026-05-13 00:44:17.437974
5	5	5	2028	2023-11-14	\N	2026-05-13 00:44:17.441884	2026-05-13 00:44:17.441884
6	6	6	2027	2023-04-10	\N	2026-05-13 00:44:17.446356	2026-05-13 00:44:17.446356
7	7	7	2026	2024-08-09	\N	2026-05-13 00:44:17.449969	2026-05-13 00:44:17.449969
8	8	8	2027	2023-10-20	\N	2026-05-13 00:44:17.45362	2026-05-13 00:44:17.45362
9	9	9	2028	2024-01-22	\N	2026-05-13 00:44:17.456997	2026-05-13 00:44:17.456997
10	10	10	2026	2023-03-18	\N	2026-05-13 00:44:17.460553	2026-05-13 00:44:17.460553
\.


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.accounts_id_seq', 56, true);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 1, false);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 8, true);


--
-- Name: branch_sport_teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branch_sport_teams_id_seq', 1, false);


--
-- Name: branch_sports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branch_sports_id_seq', 30, true);


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branches_id_seq', 4, true);


--
-- Name: employee_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employee_details_id_seq', 8, true);


--
-- Name: faculties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.faculties_id_seq', 12, true);


--
-- Name: media_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.media_posts_id_seq', 52, true);


--
-- Name: member_memberships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_memberships_id_seq', 1, false);


--
-- Name: member_relationships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_relationships_id_seq', 6, true);


--
-- Name: member_team_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_team_subscriptions_id_seq', 1, false);


--
-- Name: member_teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_teams_id_seq', 1, false);


--
-- Name: member_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_types_id_seq', 8, true);


--
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.members_id_seq', 38, true);


--
-- Name: membership_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.membership_plans_id_seq', 17, true);


--
-- Name: outsider_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.outsider_details_id_seq', 8, true);


--
-- Name: packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.packages_id_seq', 5, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_id_seq', 52, true);


--
-- Name: privileges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.privileges_id_seq', 11, true);


--
-- Name: professions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.professions_id_seq', 10, true);


--
-- Name: retired_employee_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.retired_employee_details_id_seq', 6, true);


--
-- Name: sports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sports_id_seq', 12, true);


--
-- Name: staff_action_approvals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staff_action_approvals_id_seq', 1, false);


--
-- Name: staff_activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staff_activity_logs_id_seq', 1, false);


--
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staff_id_seq', 10, true);


--
-- Name: staff_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staff_types_id_seq', 10, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tasks_id_seq', 3, true);


--
-- Name: team_member_team_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.team_member_team_subscriptions_id_seq', 1, false);


--
-- Name: team_member_teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.team_member_teams_id_seq', 1, false);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.team_members_id_seq', 8, true);


--
-- Name: university_student_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.university_student_details_id_seq', 10, true);


--
-- Name: packages PK_020801f620e21f943ead9311c98; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT "PK_020801f620e21f943ead9311c98" PRIMARY KEY (id);


--
-- Name: member_relationships PK_05c6f5115238713b2085c658167; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_relationships
    ADD CONSTRAINT "PK_05c6f5115238713b2085c658167" PRIMARY KEY (id);


--
-- Name: team_member_team_subscriptions PK_0f4bc83e9524b846fb3fabf55cc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT "PK_0f4bc83e9524b846fb3fabf55cc" PRIMARY KEY (id);


--
-- Name: retired_employee_details PK_1042321167267b8fab95e80d894; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retired_employee_details
    ADD CONSTRAINT "PK_1042321167267b8fab95e80d894" PRIMARY KEY (id);


--
-- Name: privileges PK_13f3ff98ae4d5565ec5ed6036cd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privileges
    ADD CONSTRAINT "PK_13f3ff98ae4d5565ec5ed6036cd" PRIMARY KEY (id);


--
-- Name: payments PK_197ab7af18c93fbb0c9b28b4a59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY (id);


--
-- Name: audit_logs PK_1bb179d048bbc581caa3b013439; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY (id);


--
-- Name: team_member_teams PK_1cbafa870658501e7381af2a1f8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_teams
    ADD CONSTRAINT "PK_1cbafa870658501e7381af2a1f8" PRIMARY KEY (id);


--
-- Name: members PK_28b53062261b996d9c99fa12404; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY (id);


--
-- Name: member_types PK_296a6e4257fe047191274ddfa2d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_types
    ADD CONSTRAINT "PK_296a6e4257fe047191274ddfa2d" PRIMARY KEY (id);


--
-- Name: branch_sports PK_2e2b9f4d271f131cc2768da2f60; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_sports
    ADD CONSTRAINT "PK_2e2b9f4d271f131cc2768da2f60" PRIMARY KEY (id);


--
-- Name: field_operating_hours PK_30ccf6d400902a90f146f0eabab; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_operating_hours
    ADD CONSTRAINT "PK_30ccf6d400902a90f146f0eabab" PRIMARY KEY (id);


--
-- Name: member_team_subscriptions PK_4c460d3fd686ddef5cda48b3b77; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT "PK_4c460d3fd686ddef5cda48b3b77" PRIMARY KEY (id);


--
-- Name: sports PK_4fa1063d368e1fd68ea63c7d860; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT "PK_4fa1063d368e1fd68ea63c7d860" PRIMARY KEY (id);


--
-- Name: staff_action_approvals PK_56c557469ec804e1eeceba51b6a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_action_approvals
    ADD CONSTRAINT "PK_56c557469ec804e1eeceba51b6a" PRIMARY KEY (id);


--
-- Name: accounts PK_5a7a02c20412299d198e097a8fe; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY (id);


--
-- Name: staff_activity_logs PK_69b7f3ac6197332591100e0401f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_activity_logs
    ADD CONSTRAINT "PK_69b7f3ac6197332591100e0401f" PRIMARY KEY (id);


--
-- Name: staff_privileges_override PK_726251b0aecb8afa6a0f3d3198b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_privileges_override
    ADD CONSTRAINT "PK_726251b0aecb8afa6a0f3d3198b" PRIMARY KEY (staff_id, privilege_id);


--
-- Name: university_student_details PK_7a151c6534f25dfdc2ecaacbf73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.university_student_details
    ADD CONSTRAINT "PK_7a151c6534f25dfdc2ecaacbf73" PRIMARY KEY (id);


--
-- Name: teams PK_7e5523774a38b08a6236d322403; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY (id);


--
-- Name: branches PK_7f37d3b42defea97f1df0d19535; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY (id);


--
-- Name: outsider_details PK_823834ce03c1206ce732589bb3e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outsider_details
    ADD CONSTRAINT "PK_823834ce03c1206ce732589bb3e" PRIMARY KEY (id);


--
-- Name: staff_types PK_8540cd5e2ee4537bdd127d129b4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_types
    ADD CONSTRAINT "PK_8540cd5e2ee4537bdd127d129b4" PRIMARY KEY (id);


--
-- Name: membership_plans PK_85ca9d6f4262a6bbff2a540c640; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT "PK_85ca9d6f4262a6bbff2a540c640" PRIMARY KEY (id);


--
-- Name: tasks PK_8d12ff38fcc62aaba2cab748772; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY (id);


--
-- Name: professions PK_9247c0d4b30fc6b796d59262058; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT "PK_9247c0d4b30fc6b796d59262058" PRIMARY KEY (id);


--
-- Name: booking_participants PK_9cc32a61bd698b5831f4e5d66e8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_participants
    ADD CONSTRAINT "PK_9cc32a61bd698b5831f4e5d66e8" PRIMARY KEY (id);


--
-- Name: employee_details PK_a0a0a4a5e5b63b1bf07b5f89c1d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_details
    ADD CONSTRAINT "PK_a0a0a4a5e5b63b1bf07b5f89c1d" PRIMARY KEY (id);


--
-- Name: member_memberships PK_a1ae11530c8ba3f5036ea3ff359; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_memberships
    ADD CONSTRAINT "PK_a1ae11530c8ba3f5036ea3ff359" PRIMARY KEY (id);


--
-- Name: announcements PK_b3ad760876ff2e19d58e05dc8b0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "PK_b3ad760876ff2e19d58e05dc8b0" PRIMARY KEY (id);


--
-- Name: staff_packages PK_b67d9795ce42e3df3d8f3a98dee; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_packages
    ADD CONSTRAINT "PK_b67d9795ce42e3df3d8f3a98dee" PRIMARY KEY (staff_id, package_id);


--
-- Name: bookings PK_bee6805982cc1e248e94ce94957; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY (id);


--
-- Name: team_members PK_ca3eae89dcf20c9fd95bf7460aa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT "PK_ca3eae89dcf20c9fd95bf7460aa" PRIMARY KEY (id);


--
-- Name: staff PK_e4ee98bb552756c180aec1e854a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY (id);


--
-- Name: team_training_schedules PK_e7dff189291a5002a0ec100ea59; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_training_schedules
    ADD CONSTRAINT "PK_e7dff189291a5002a0ec100ea59" PRIMARY KEY (id);


--
-- Name: member_teams PK_e87e0c0503c1ddb8cf98a7be65a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_teams
    ADD CONSTRAINT "PK_e87e0c0503c1ddb8cf98a7be65a" PRIMARY KEY (id);


--
-- Name: attendance PK_ee0ffe42c1f1a01e72b725c0cb2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY (id);


--
-- Name: fields PK_ee7a215c6cd77a59e2cb3b59d41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT "PK_ee7a215c6cd77a59e2cb3b59d41" PRIMARY KEY (id);


--
-- Name: branch_sport_teams PK_efe9e63bd92ff724492249b2e13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_sport_teams
    ADD CONSTRAINT "PK_efe9e63bd92ff724492249b2e13" PRIMARY KEY (id);


--
-- Name: media_posts PK_f0e5a497b04867b30a63ee647ab; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_posts
    ADD CONSTRAINT "PK_f0e5a497b04867b30a63ee647ab" PRIMARY KEY (id);


--
-- Name: activity_logs PK_f25287b6140c5ba18d38776a796; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY (id);


--
-- Name: faculties PK_fd83e4a09c7182ccf7bdb3770b9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT "PK_fd83e4a09c7182ccf7bdb3770b9" PRIMARY KEY (id);


--
-- Name: staff REL_4d2399aabd15dae3014759ae87; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "REL_4d2399aabd15dae3014759ae87" UNIQUE (account_id);


--
-- Name: team_members REL_c2d2b65f142ec7e11625d207e4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT "REL_c2d2b65f142ec7e11625d207e4" UNIQUE (account_id);


--
-- Name: members REL_fd9dfb97e21b75fc45d42aa614; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "REL_fd9dfb97e21b75fc45d42aa614" UNIQUE (account_id);


--
-- Name: membership_plans UQ_043c72f6b04d7f90472893bf802; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT "UQ_043c72f6b04d7f90472893bf802" UNIQUE (plan_code);


--
-- Name: payments UQ_07273ea3fb0e3f0add915cf5636; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "UQ_07273ea3fb0e3f0add915cf5636" UNIQUE (payment_reference);


--
-- Name: member_types UQ_45eca89ed5b651a24e6c2a84f28; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_types
    ADD CONSTRAINT "UQ_45eca89ed5b651a24e6c2a84f28" UNIQUE (code);


--
-- Name: privileges UQ_483f0b483b71d1bd067f7c5ecf8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privileges
    ADD CONSTRAINT "UQ_483f0b483b71d1bd067f7c5ecf8" UNIQUE (code);


--
-- Name: staff_types UQ_4f6fa524d7efbde95138cc1e78c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_types
    ADD CONSTRAINT "UQ_4f6fa524d7efbde95138cc1e78c" UNIQUE (code);


--
-- Name: retired_employee_details UQ_572ac1a4ffeab682c2e6e94a033; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retired_employee_details
    ADD CONSTRAINT "UQ_572ac1a4ffeab682c2e6e94a033" UNIQUE (member_id);


--
-- Name: branch_sports UQ_5de594917a09c7d9e204fb74451; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_sports
    ADD CONSTRAINT "UQ_5de594917a09c7d9e204fb74451" UNIQUE (branch_id, sport_id);


--
-- Name: professions UQ_677d94462c7429c37bc1bdf67cc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT "UQ_677d94462c7429c37bc1bdf67cc" UNIQUE (code);


--
-- Name: university_student_details UQ_7a23f0ea6c43d33994fef2e89ab; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.university_student_details
    ADD CONSTRAINT "UQ_7a23f0ea6c43d33994fef2e89ab" UNIQUE (member_id);


--
-- Name: staff UQ_9a0df2b5f7d9adac641696c7048; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "UQ_9a0df2b5f7d9adac641696c7048" UNIQUE (national_id);


--
-- Name: branches UQ_9c06cbb83feb2f0be6263bd47ee; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "UQ_9c06cbb83feb2f0be6263bd47ee" UNIQUE (code);


--
-- Name: bookings UQ_bd38e75d5d3cbf9d12fe38a3372; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "UQ_bd38e75d5d3cbf9d12fe38a3372" UNIQUE (share_token);


--
-- Name: outsider_details UQ_c2c2ef9ea07bd29bed0aa144c9e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outsider_details
    ADD CONSTRAINT "UQ_c2c2ef9ea07bd29bed0aa144c9e" UNIQUE (member_id);


--
-- Name: employee_details UQ_ce616d2905a24ea751ee4a155d7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_details
    ADD CONSTRAINT "UQ_ce616d2905a24ea751ee4a155d7" UNIQUE (member_id);


--
-- Name: packages UQ_ced38866e7e59963188cd0a76df; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT "UQ_ced38866e7e59963188cd0a76df" UNIQUE (code);


--
-- Name: members UQ_e11317b655992c54d0ca4883191; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "UQ_e11317b655992c54d0ca4883191" UNIQUE (national_id);


--
-- Name: accounts UQ_ee66de6cdc53993296d1ceb8aa0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "UQ_ee66de6cdc53993296d1ceb8aa0" UNIQUE (email);


--
-- Name: faculties UQ_f1b2cd43a96c6fb75c8ad44de88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT "UQ_f1b2cd43a96c6fb75c8ad44de88" UNIQUE (code);


--
-- Name: team_members UQ_fa926382a454ac372575ff03d88; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT "UQ_fa926382a454ac372575ff03d88" UNIQUE (national_id);


--
-- Name: field_operating_hours uq_field_operating_hours_field_day; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_operating_hours
    ADD CONSTRAINT uq_field_operating_hours_field_day UNIQUE (field_id, day_of_week);


--
-- Name: idx_account_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_account_email ON public.accounts USING btree (email);


--
-- Name: idx_activity_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_date ON public.activity_logs USING btree (action_date);


--
-- Name: idx_activity_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_member ON public.activity_logs USING btree (member_id);


--
-- Name: idx_announcement_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_announcement_branch_id ON public.announcements USING btree (branch_id);


--
-- Name: idx_announcement_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_announcement_created_at ON public.announcements USING btree (created_at);


--
-- Name: idx_announcement_sport_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_announcement_sport_id ON public.announcements USING btree (sport_id);


--
-- Name: idx_announcement_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_announcement_status ON public.announcements USING btree (status);


--
-- Name: idx_booking_participants_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_participants_booking_id ON public.booking_participants USING btree (booking_id);


--
-- Name: idx_booking_participants_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_participants_email ON public.booking_participants USING btree (email);


--
-- Name: idx_booking_participants_national_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_booking_participants_national_id ON public.booking_participants USING btree (national_id);


--
-- Name: idx_bookings_field_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_field_id ON public.bookings USING btree (field_id);


--
-- Name: idx_bookings_member_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_member_id ON public.bookings USING btree (member_id);


--
-- Name: idx_bookings_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_start_time ON public.bookings USING btree (start_time);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_team_member_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_team_member_id ON public.bookings USING btree (team_member_id);


--
-- Name: idx_branch_sport_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branch_sport_branch_id ON public.branch_sports USING btree (branch_id);


--
-- Name: idx_branch_sport_sport_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branch_sport_sport_id ON public.branch_sports USING btree (sport_id);


--
-- Name: idx_branch_sport_team_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branch_sport_team_branch_id ON public.branch_sport_teams USING btree (branch_id);


--
-- Name: idx_branch_sport_team_composite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branch_sport_team_composite ON public.branch_sport_teams USING btree (branch_id, sport_id);


--
-- Name: idx_branch_sport_team_sport_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branch_sport_team_sport_id ON public.branch_sport_teams USING btree (sport_id);


--
-- Name: idx_branch_sport_team_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branch_sport_team_status ON public.branch_sport_teams USING btree (status);


--
-- Name: idx_employee_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_member ON public.employee_details USING btree (member_id);


--
-- Name: idx_employee_profession; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_employee_profession ON public.employee_details USING btree (profession_id);


--
-- Name: idx_field_operating_hours_field_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_field_operating_hours_field_id ON public.field_operating_hours USING btree (field_id);


--
-- Name: idx_fields_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fields_branch_id ON public.fields USING btree (branch_id);


--
-- Name: idx_fields_sport_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fields_sport_id ON public.fields USING btree (sport_id);


--
-- Name: idx_fields_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fields_status ON public.fields USING btree (status);


--
-- Name: idx_member_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_member_status ON public.members USING btree (status);


--
-- Name: idx_member_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_member_type ON public.members USING btree (member_type_id);


--
-- Name: idx_membership_end_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_membership_end_date ON public.member_memberships USING btree (end_date);


--
-- Name: idx_membership_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_membership_member ON public.member_memberships USING btree (member_id);


--
-- Name: idx_membership_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_membership_status ON public.member_memberships USING btree (status);


--
-- Name: idx_mts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mts_created_at ON public.member_team_subscriptions USING btree (created_at);


--
-- Name: idx_mts_member_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mts_member_id ON public.member_team_subscriptions USING btree (member_id);


--
-- Name: idx_mts_member_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mts_member_status ON public.member_team_subscriptions USING btree (member_id, status);


--
-- Name: idx_mts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mts_status ON public.member_team_subscriptions USING btree (status);


--
-- Name: idx_mts_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mts_team_id ON public.member_team_subscriptions USING btree (team_id);


--
-- Name: idx_mts_team_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mts_team_status ON public.member_team_subscriptions USING btree (team_id, status);


--
-- Name: idx_outsider_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_outsider_member ON public.outsider_details USING btree (member_id);


--
-- Name: idx_relationship_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_relationship_member ON public.member_relationships USING btree (member_id);


--
-- Name: idx_relationship_related; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_relationship_related ON public.member_relationships USING btree (related_member_id);


--
-- Name: idx_retired_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_retired_member ON public.retired_employee_details USING btree (member_id);


--
-- Name: idx_team_member_account; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_member_account ON public.team_members USING btree (account_id);


--
-- Name: idx_team_member_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_member_status ON public.team_members USING btree (status);


--
-- Name: idx_team_member_teams_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_member_teams_team_id ON public.team_member_teams USING btree (team_id);


--
-- Name: idx_team_member_teams_team_member_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_member_teams_team_member_id ON public.team_member_teams USING btree (team_member_id);


--
-- Name: idx_tmts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tmts_created_at ON public.team_member_team_subscriptions USING btree (created_at);


--
-- Name: idx_tmts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tmts_status ON public.team_member_team_subscriptions USING btree (status);


--
-- Name: idx_tmts_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tmts_team_id ON public.team_member_team_subscriptions USING btree (team_id);


--
-- Name: idx_tmts_team_member_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tmts_team_member_id ON public.team_member_team_subscriptions USING btree (team_member_id);


--
-- Name: idx_tmts_team_member_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tmts_team_member_status ON public.team_member_team_subscriptions USING btree (team_member_id, status);


--
-- Name: idx_tmts_team_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tmts_team_status ON public.team_member_team_subscriptions USING btree (team_id, status);


--
-- Name: idx_uni_student_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_uni_student_member ON public.university_student_details USING btree (member_id);


--
-- Name: branch_sports FK_0022ce2aa47b58bcbbea1368549; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_sports
    ADD CONSTRAINT "FK_0022ce2aa47b58bcbbea1368549" FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- Name: team_training_schedules FK_0073b8f7534d2f0b4ad3d88807b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_training_schedules
    ADD CONSTRAINT "FK_0073b8f7534d2f0b4ad3d88807b" FOREIGN KEY (field_id) REFERENCES public.fields(id) ON DELETE SET NULL;


--
-- Name: staff FK_033c2ff321c67885781aa563581; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_033c2ff321c67885781aa563581" FOREIGN KEY (staff_type_id) REFERENCES public.staff_types(id);


--
-- Name: staff_privileges_override FK_09988fb0363aa3a5d5ba4952afe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_privileges_override
    ADD CONSTRAINT "FK_09988fb0363aa3a5d5ba4952afe" FOREIGN KEY (privilege_id) REFERENCES public.privileges(id) ON DELETE CASCADE;


--
-- Name: payments FK_0e988847b02aacb81233d41b739; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_0e988847b02aacb81233d41b739" FOREIGN KEY (refunded_by_staff_id) REFERENCES public.staff(id);


--
-- Name: member_relationships FK_18b3b0a7a0861a9260948a569f2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_relationships
    ADD CONSTRAINT "FK_18b3b0a7a0861a9260948a569f2" FOREIGN KEY (related_member_id) REFERENCES public.members(id);


--
-- Name: bookings FK_19005eb47f5a9d92428494d734e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_19005eb47f5a9d92428494d734e" FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE RESTRICT;


--
-- Name: team_training_schedules FK_1a5362e0ef87153f5bd994116ec; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_training_schedules
    ADD CONSTRAINT "FK_1a5362e0ef87153f5bd994116ec" FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: bookings FK_1dc7e0f9ea4c487f6c4095bc153; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_1dc7e0f9ea4c487f6c4095bc153" FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE SET NULL;


--
-- Name: attendance FK_24c65e5c0da83ebcec78ba03644; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "FK_24c65e5c0da83ebcec78ba03644" FOREIGN KEY (training_schedule_id) REFERENCES public.team_training_schedules(id) ON DELETE CASCADE;


--
-- Name: team_member_teams FK_3469a2e8a5960749ee89d58a7ca; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_teams
    ADD CONSTRAINT "FK_3469a2e8a5960749ee89d58a7ca" FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: member_team_subscriptions FK_34e97ab404f86e2bf24723b298e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT "FK_34e97ab404f86e2bf24723b298e" FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: member_relationships FK_37b61d254a9dea14f2ef7f1add0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_relationships
    ADD CONSTRAINT "FK_37b61d254a9dea14f2ef7f1add0" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: sports FK_393d8edd63dd2a7f0750b6d7243; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT "FK_393d8edd63dd2a7f0750b6d7243" FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: attendance FK_3cbe5f47f75a72225e1efbfa6a6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "FK_3cbe5f47f75a72225e1efbfa6a6" FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;


--
-- Name: staff_activity_logs FK_4864905fe52777c6acaf05c63f2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_activity_logs
    ADD CONSTRAINT "FK_4864905fe52777c6acaf05c63f2" FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: staff FK_4d2399aabd15dae3014759ae87d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_4d2399aabd15dae3014759ae87d" FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: member_team_subscriptions FK_4df6dfcd6f7586919f6d71708c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT "FK_4df6dfcd6f7586919f6d71708c2" FOREIGN KEY (announcement_id) REFERENCES public.announcements(id);


--
-- Name: branch_sport_teams FK_500f48a90ce325ac4ca43372980; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_sport_teams
    ADD CONSTRAINT "FK_500f48a90ce325ac4ca43372980" FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id);


--
-- Name: staff_privileges_override FK_5030f5e915c0be480ecb51719e2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_privileges_override
    ADD CONSTRAINT "FK_5030f5e915c0be480ecb51719e2" FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: attendance FK_52d9db0d044b7bcc372147cf5ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT "FK_52d9db0d044b7bcc372147cf5ea" FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: activity_logs FK_537a22371dd962659e2199450da; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT "FK_537a22371dd962659e2199450da" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: branch_sport_teams FK_541ede056317834936f1e4f3e6c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_sport_teams
    ADD CONSTRAINT "FK_541ede056317834936f1e4f3e6c" FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- Name: retired_employee_details FK_572ac1a4ffeab682c2e6e94a033; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retired_employee_details
    ADD CONSTRAINT "FK_572ac1a4ffeab682c2e6e94a033" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: branch_sport_teams FK_5a508183b1bf316036992d2e7ad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_sport_teams
    ADD CONSTRAINT "FK_5a508183b1bf316036992d2e7ad" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: members FK_5c05e0f6998f982aeb68c73e373; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "FK_5c05e0f6998f982aeb68c73e373" FOREIGN KEY (member_type_id) REFERENCES public.member_types(id);


--
-- Name: team_training_schedules FK_5eb8f1fdecaf4834a6e0e80da42; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_training_schedules
    ADD CONSTRAINT "FK_5eb8f1fdecaf4834a6e0e80da42" FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE SET NULL;


--
-- Name: branch_sport_teams FK_618dc73ce93d677427dba897e91; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_sport_teams
    ADD CONSTRAINT "FK_618dc73ce93d677427dba897e91" FOREIGN KEY (approved_by_staff_id) REFERENCES public.staff(id);


--
-- Name: member_memberships FK_6678dedb4ec622799f6c2b064a6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_memberships
    ADD CONSTRAINT "FK_6678dedb4ec622799f6c2b064a6" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: team_member_teams FK_67649300c1d9ec0b1a4f7ad76f5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_teams
    ADD CONSTRAINT "FK_67649300c1d9ec0b1a4f7ad76f5" FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: fields FK_6ebc287d37a3789be5f8d8fd07f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT "FK_6ebc287d37a3789be5f8d8fd07f" FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: staff_packages FK_73a5e988b5f904320a4d7bacefa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_packages
    ADD CONSTRAINT "FK_73a5e988b5f904320a4d7bacefa" FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: member_teams FK_7a121348af73f30a634c872ce16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_teams
    ADD CONSTRAINT "FK_7a121348af73f30a634c872ce16" FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: university_student_details FK_7a23f0ea6c43d33994fef2e89ab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.university_student_details
    ADD CONSTRAINT "FK_7a23f0ea6c43d33994fef2e89ab" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: team_member_team_subscriptions FK_828d221066be24266e901f15593; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT "FK_828d221066be24266e901f15593" FOREIGN KEY (team_id) REFERENCES public.branch_sport_teams(id) ON DELETE CASCADE;


--
-- Name: payments FK_84b3c11d3952c7ef3ddc170c5b9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_84b3c11d3952c7ef3ddc170c5b9" FOREIGN KEY (processed_by_staff_id) REFERENCES public.staff(id);


--
-- Name: outsider_details FK_84d24e0972729fa85a8147d2f44; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outsider_details
    ADD CONSTRAINT "FK_84d24e0972729fa85a8147d2f44" FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: member_teams FK_87bc2de61af82996d9e78888e76; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_teams
    ADD CONSTRAINT "FK_87bc2de61af82996d9e78888e76" FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- Name: staff_packages FK_89161db4e532a39136cfdf7fc3a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_packages
    ADD CONSTRAINT "FK_89161db4e532a39136cfdf7fc3a" FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- Name: announcements FK_8dd248667c8d4d3b55d483239a9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "FK_8dd248667c8d4d3b55d483239a9" FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- Name: fields FK_98e53906288233fae9d298b10de; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT "FK_98e53906288233fae9d298b10de" FOREIGN KEY (sport_id) REFERENCES public.sports(id);


--
-- Name: team_member_teams FK_9c53cb1c8208713af5e8a0fd52c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_teams
    ADD CONSTRAINT "FK_9c53cb1c8208713af5e8a0fd52c" FOREIGN KEY (team_member_id) REFERENCES public.team_members(id);


--
-- Name: member_team_subscriptions FK_9f1b7eea77a3e81efbe6551c6b8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT "FK_9f1b7eea77a3e81efbe6551c6b8" FOREIGN KEY (team_id) REFERENCES public.branch_sport_teams(id) ON DELETE CASCADE;


--
-- Name: university_student_details FK_aae8fd0f54003779607b8862af3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.university_student_details
    ADD CONSTRAINT "FK_aae8fd0f54003779607b8862af3" FOREIGN KEY (faculty_id) REFERENCES public.faculties(id);


--
-- Name: employee_details FK_ab316e333d6b1340bbb9b085bbd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_details
    ADD CONSTRAINT "FK_ab316e333d6b1340bbb9b085bbd" FOREIGN KEY (profession_id) REFERENCES public.professions(id);


--
-- Name: branch_sports FK_acfd37cabe9e021812c4e0aba63; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_sports
    ADD CONSTRAINT "FK_acfd37cabe9e021812c4e0aba63" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: sports FK_afbcb2e18168f9953dcf5323c90; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT "FK_afbcb2e18168f9953dcf5323c90" FOREIGN KEY (approved_by_staff_id) REFERENCES public.staff(id);


--
-- Name: member_memberships FK_b3abd06e7d54744a465cae28e45; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_memberships
    ADD CONSTRAINT "FK_b3abd06e7d54744a465cae28e45" FOREIGN KEY (membership_plan_id) REFERENCES public.membership_plans(id);


--
-- Name: team_member_team_subscriptions FK_b4d96f89e3f6b01de371a2a9442; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT "FK_b4d96f89e3f6b01de371a2a9442" FOREIGN KEY (announcement_id) REFERENCES public.announcements(id);


--
-- Name: team_member_team_subscriptions FK_b56c17473724dedd599a8edba30; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT "FK_b56c17473724dedd599a8edba30" FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;


--
-- Name: teams FK_bbbf68b3a1d536cf947e672755b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "FK_bbbf68b3a1d536cf947e672755b" FOREIGN KEY (field_id) REFERENCES public.fields(id) ON DELETE SET NULL;


--
-- Name: outsider_details FK_c2c2ef9ea07bd29bed0aa144c9e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outsider_details
    ADD CONSTRAINT "FK_c2c2ef9ea07bd29bed0aa144c9e" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: team_members FK_c2d2b65f142ec7e11625d207e48; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT "FK_c2d2b65f142ec7e11625d207e48" FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: announcements FK_c6f70af95eeeb43d10dc64e9e6b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "FK_c6f70af95eeeb43d10dc64e9e6b" FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: member_team_subscriptions FK_c76c8c49dfca9c45bdabab586cd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT "FK_c76c8c49dfca9c45bdabab586cd" FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id);


--
-- Name: bookings FK_c91f868f79f8f90a40f0f2c1441; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_c91f868f79f8f90a40f0f2c1441" FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE SET NULL;


--
-- Name: employee_details FK_ce616d2905a24ea751ee4a155d7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_details
    ADD CONSTRAINT "FK_ce616d2905a24ea751ee4a155d7" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: booking_participants FK_d0c6f1f0892061f1cc2d325c1c9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_participants
    ADD CONSTRAINT "FK_d0c6f1f0892061f1cc2d325c1c9" FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: field_operating_hours FK_d0fc1c1e2e733bf77e42d1f5f05; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.field_operating_hours
    ADD CONSTRAINT "FK_d0fc1c1e2e733bf77e42d1f5f05" FOREIGN KEY (field_id) REFERENCES public.fields(id) ON DELETE CASCADE;


--
-- Name: announcements FK_d8cf6a4746e15e59a6f19e2d0a6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "FK_d8cf6a4746e15e59a6f19e2d0a6" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- Name: member_team_subscriptions FK_df8672bd8a4c1fe28958e732703; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT "FK_df8672bd8a4c1fe28958e732703" FOREIGN KEY (approved_by_staff_id) REFERENCES public.staff(id);


--
-- Name: team_member_team_subscriptions FK_e51480ed4b74f8ad64908eacc85; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT "FK_e51480ed4b74f8ad64908eacc85" FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id);


--
-- Name: teams FK_e7549efb36cffda636b998c00b0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "FK_e7549efb36cffda636b998c00b0" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- Name: team_member_team_subscriptions FK_e9b0987b7da6433631b7ebb6a09; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT "FK_e9b0987b7da6433631b7ebb6a09" FOREIGN KEY (approved_by_staff_id) REFERENCES public.staff(id);


--
-- Name: member_teams FK_efedd3dd196df032f7afe47638e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_teams
    ADD CONSTRAINT "FK_efedd3dd196df032f7afe47638e" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: teams FK_f1cbcfd9d4a42fd2f74dfd228a3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT "FK_f1cbcfd9d4a42fd2f74dfd228a3" FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- Name: team_members FK_f2e7448cbbe862061a76756f82d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT "FK_f2e7448cbbe862061a76756f82d" FOREIGN KEY (member_type_id) REFERENCES public.member_types(id);


--
-- Name: bookings FK_f80ee3c0f6b2adf57520dc9e977; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_f80ee3c0f6b2adf57520dc9e977" FOREIGN KEY (field_id) REFERENCES public.fields(id) ON DELETE RESTRICT;


--
-- Name: membership_plans FK_fa94845ddeeed2afa8a7a30bd82; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT "FK_fa94845ddeeed2afa8a7a30bd82" FOREIGN KEY (member_type_id) REFERENCES public.member_types(id);


--
-- Name: members FK_fd9dfb97e21b75fc45d42aa614a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "FK_fd9dfb97e21b75fc45d42aa614a" FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- PostgreSQL database dump complete
--


