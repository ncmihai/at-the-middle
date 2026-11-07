CREATE TABLE "provider_usage" (
	"ym" text NOT NULL,
	"provider" text NOT NULL,
	"calls" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "provider_usage_ym_provider_pk" PRIMARY KEY("ym","provider")
);
--> statement-breakpoint
ALTER TABLE "searches" ADD COLUMN "usage_limited" boolean DEFAULT false NOT NULL;