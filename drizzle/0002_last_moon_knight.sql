CREATE TABLE "pageviews" (
	"day" date NOT NULL,
	"path" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "pageviews_day_path_pk" PRIMARY KEY("day","path")
);
