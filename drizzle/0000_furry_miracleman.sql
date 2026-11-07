CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE TABLE "airports" (
	"iata" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"country_code" text NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"is_eu" boolean DEFAULT false NOT NULL,
	"kind" text,
	"search_text" text NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flight_cache" (
	"cache_key" text PRIMARY KEY NOT NULL,
	"origin" text NOT NULL,
	"dest" text NOT NULL,
	"date" date NOT NULL,
	"adults" integer DEFAULT 1 NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"payload" jsonb NOT NULL,
	"min_price_eur" numeric(10, 2),
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"search_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"destination_iata" text NOT NULL,
	"departure_date" date NOT NULL,
	"return_date" date NOT NULL,
	"gap_minutes" integer NOT NULL,
	"total_price_eur" numeric(10, 2) NOT NULL,
	"max_price_per_person_eur" numeric(10, 2) NOT NULL,
	"legs" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"search_id" uuid NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"total_steps" integer DEFAULT 0 NOT NULL,
	"done_steps" integer DEFAULT 0 NOT NULL,
	"current_step" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "search_jobs_search_id_unique" UNIQUE("search_id"),
	CONSTRAINT "search_jobs_status_check" CHECK ("search_jobs"."status" in ('queued','running','done','failed','cancelled'))
);
--> statement-breakpoint
CREATE TABLE "searches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"origins" jsonb NOT NULL,
	"window_start" date NOT NULL,
	"window_end" date NOT NULL,
	"nights" integer NOT NULL,
	"budget_eur" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"max_gap_hours" integer DEFAULT 24 NOT NULL,
	"max_flight_minutes" integer,
	"top_k" integer DEFAULT 10 NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "searches_slug_unique" UNIQUE("slug"),
	CONSTRAINT "searches_status_check" CHECK ("searches"."status" in ('queued','running','completed','failed','cancelled'))
);
--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_search_id_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."searches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_jobs" ADD CONSTRAINT "search_jobs_search_id_searches_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."searches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "airports_search_text_trgm_idx" ON "airports" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "airports_is_eu_idx" ON "airports" USING btree ("is_eu");--> statement-breakpoint
CREATE INDEX "flight_cache_expires_idx" ON "flight_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "results_search_rank_uidx" ON "results" USING btree ("search_id","rank");--> statement-breakpoint
CREATE INDEX "results_search_gap_idx" ON "results" USING btree ("search_id","gap_minutes");--> statement-breakpoint
CREATE INDEX "search_jobs_status_locked_idx" ON "search_jobs" USING btree ("status","locked_at");--> statement-breakpoint
CREATE INDEX "searches_created_at_idx" ON "searches" USING btree ("created_at");