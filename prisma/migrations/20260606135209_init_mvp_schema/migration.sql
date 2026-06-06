-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fantasy_leagues" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "owner_user_id" INTEGER NOT NULL,
    "season_id" INTEGER,
    "start_mode" TEXT NOT NULL DEFAULT 'dengeli_baslangic',
    "budget_start" INTEGER NOT NULL DEFAULT 100000000,
    "max_members" INTEGER NOT NULL DEFAULT 8,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fantasy_leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fantasy_league_members" (
    "id" SERIAL NOT NULL,
    "fantasy_league_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'active',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fantasy_league_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_teams" (
    "id" SERIAL NOT NULL,
    "fantasy_league_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "budget" INTEGER NOT NULL DEFAULT 0,
    "points_total" INTEGER NOT NULL DEFAULT 0,
    "squad_value" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_squad_players" (
    "id" SERIAL NOT NULL,
    "manager_team_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "purchase_price" INTEGER NOT NULL DEFAULT 0,
    "current_value_at_purchase" INTEGER NOT NULL DEFAULT 0,
    "acquired_via" TEXT NOT NULL DEFAULT 'initial_squad',
    "status" TEXT NOT NULL DEFAULT 'active',
    "acquired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sold_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_squad_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_lineups" (
    "id" SERIAL NOT NULL,
    "manager_team_id" INTEGER NOT NULL,
    "round_id" INTEGER NOT NULL,
    "formation" TEXT NOT NULL DEFAULT '4-4-2',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "locked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_lineup_slots" (
    "id" SERIAL NOT NULL,
    "manager_lineup_id" INTEGER NOT NULL,
    "slot_index" INTEGER NOT NULL,
    "slot_position" TEXT NOT NULL,
    "player_id" INTEGER,
    "is_empty" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_lineup_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "real_teams" (
    "id" SERIAL NOT NULL,
    "sportmonks_team_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "short_code" TEXT,
    "country_id" INTEGER,
    "venue_id" INTEGER,
    "logo_url" TEXT,
    "founded" INTEGER,
    "last_played_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "real_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "sportmonks_player_id" INTEGER NOT NULL,
    "current_team_id" INTEGER,
    "name" TEXT NOT NULL,
    "display_name" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "position_id" INTEGER,
    "image_url" TEXT,
    "nationality_country_id" INTEGER,
    "current_market_value" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" SERIAL NOT NULL,
    "sportmonks_season_id" INTEGER NOT NULL,
    "league_id" INTEGER NOT NULL,
    "name" TEXT,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" SERIAL NOT NULL,
    "sportmonks_round_id" INTEGER NOT NULL,
    "season_id" INTEGER NOT NULL,
    "name" TEXT,
    "round_number" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixtures" (
    "id" SERIAL NOT NULL,
    "sportmonks_fixture_id" INTEGER NOT NULL,
    "sport_id" INTEGER,
    "league_id" INTEGER,
    "season_id" INTEGER,
    "stage_id" INTEGER,
    "round_id" INTEGER,
    "state_id" INTEGER,
    "venue_id" INTEGER,
    "home_team_id" INTEGER,
    "away_team_id" INTEGER,
    "name" TEXT,
    "starting_at" TIMESTAMP(3),
    "starting_at_timestamp" BIGINT,
    "result_info" TEXT,
    "length" INTEGER,
    "has_odds" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixtures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixture_participants" (
    "id" SERIAL NOT NULL,
    "fixture_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "location" TEXT,
    "winner" BOOLEAN,
    "position" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixture_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixture_events" (
    "id" SERIAL NOT NULL,
    "sportmonks_event_id" INTEGER NOT NULL,
    "fixture_id" INTEGER NOT NULL,
    "team_id" INTEGER,
    "player_id" INTEGER,
    "related_player_id" INTEGER,
    "type_id" INTEGER,
    "minute" INTEGER,
    "extra_minute" INTEGER,
    "result" TEXT,
    "info" TEXT,
    "addition" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixture_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixture_lineups" (
    "id" SERIAL NOT NULL,
    "sportmonks_lineup_id" INTEGER NOT NULL,
    "fixture_id" INTEGER NOT NULL,
    "player_id" INTEGER,
    "team_id" INTEGER,
    "position_id" INTEGER,
    "formation_field" TEXT,
    "formation_position" TEXT,
    "type_id" INTEGER,
    "player_name" TEXT,
    "jersey_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixture_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixture_lineup_details" (
    "id" SERIAL NOT NULL,
    "sportmonks_detail_id" INTEGER NOT NULL,
    "fixture_id" INTEGER NOT NULL,
    "lineup_id" INTEGER,
    "player_id" INTEGER,
    "team_id" INTEGER,
    "type_id" INTEGER,
    "value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixture_lineup_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_match_scores" (
    "id" SERIAL NOT NULL,
    "fixture_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "team_id" INTEGER,
    "position_id" INTEGER,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "penalty_goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellow_cards" INTEGER NOT NULL DEFAULT 0,
    "red_cards" INTEGER NOT NULL DEFAULT 0,
    "clean_sheet" BOOLEAN NOT NULL DEFAULT false,
    "own_goals" INTEGER NOT NULL DEFAULT 0,
    "missed_penalties" INTEGER NOT NULL DEFAULT 0,
    "points_rating" INTEGER NOT NULL DEFAULT 0,
    "points_minutes" INTEGER NOT NULL DEFAULT 0,
    "points_goals" INTEGER NOT NULL DEFAULT 0,
    "points_assists" INTEGER NOT NULL DEFAULT 0,
    "points_cards" INTEGER NOT NULL DEFAULT 0,
    "points_clean_sheet" INTEGER NOT NULL DEFAULT 0,
    "points_total" INTEGER NOT NULL DEFAULT 0,
    "calculated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_match_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_round_scores" (
    "id" SERIAL NOT NULL,
    "manager_team_id" INTEGER NOT NULL,
    "round_id" INTEGER NOT NULL,
    "points_lineup" INTEGER NOT NULL DEFAULT 0,
    "points_empty_slots" INTEGER NOT NULL DEFAULT 0,
    "points_total" INTEGER NOT NULL DEFAULT 0,
    "rank_in_round" INTEGER,
    "calculated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_round_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_sync_logs" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'sportmonks',
    "sync_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "items_fetched" INTEGER NOT NULL DEFAULT 0,
    "items_created" INTEGER NOT NULL DEFAULT 0,
    "items_updated" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scoring_runs" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER,
    "fixture_id" INTEGER,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "players_scored" INTEGER NOT NULL DEFAULT 0,
    "managers_scored" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scoring_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fantasy_leagues_invite_code_key" ON "fantasy_leagues"("invite_code");

-- CreateIndex
CREATE INDEX "fantasy_leagues_owner_user_id_idx" ON "fantasy_leagues"("owner_user_id");

-- CreateIndex
CREATE INDEX "fantasy_leagues_season_id_idx" ON "fantasy_leagues"("season_id");

-- CreateIndex
CREATE INDEX "fantasy_league_members_user_id_idx" ON "fantasy_league_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "fantasy_league_members_fantasy_league_id_user_id_key" ON "fantasy_league_members"("fantasy_league_id", "user_id");

-- CreateIndex
CREATE INDEX "manager_teams_user_id_idx" ON "manager_teams"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "manager_teams_fantasy_league_id_user_id_key" ON "manager_teams"("fantasy_league_id", "user_id");

-- CreateIndex
CREATE INDEX "manager_squad_players_manager_team_id_idx" ON "manager_squad_players"("manager_team_id");

-- CreateIndex
CREATE INDEX "manager_squad_players_player_id_idx" ON "manager_squad_players"("player_id");

-- CreateIndex
CREATE INDEX "manager_lineups_round_id_idx" ON "manager_lineups"("round_id");

-- CreateIndex
CREATE UNIQUE INDEX "manager_lineups_manager_team_id_round_id_key" ON "manager_lineups"("manager_team_id", "round_id");

-- CreateIndex
CREATE INDEX "manager_lineup_slots_player_id_idx" ON "manager_lineup_slots"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "manager_lineup_slots_manager_lineup_id_slot_index_key" ON "manager_lineup_slots"("manager_lineup_id", "slot_index");

-- CreateIndex
CREATE UNIQUE INDEX "real_teams_sportmonks_team_id_key" ON "real_teams"("sportmonks_team_id");

-- CreateIndex
CREATE UNIQUE INDEX "players_sportmonks_player_id_key" ON "players"("sportmonks_player_id");

-- CreateIndex
CREATE INDEX "players_current_team_id_idx" ON "players"("current_team_id");

-- CreateIndex
CREATE INDEX "players_position_id_idx" ON "players"("position_id");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_sportmonks_season_id_key" ON "seasons"("sportmonks_season_id");

-- CreateIndex
CREATE UNIQUE INDEX "rounds_sportmonks_round_id_key" ON "rounds"("sportmonks_round_id");

-- CreateIndex
CREATE INDEX "rounds_season_id_idx" ON "rounds"("season_id");

-- CreateIndex
CREATE UNIQUE INDEX "fixtures_sportmonks_fixture_id_key" ON "fixtures"("sportmonks_fixture_id");

-- CreateIndex
CREATE INDEX "fixtures_round_id_idx" ON "fixtures"("round_id");

-- CreateIndex
CREATE INDEX "fixtures_season_id_idx" ON "fixtures"("season_id");

-- CreateIndex
CREATE UNIQUE INDEX "fixture_participants_fixture_id_team_id_key" ON "fixture_participants"("fixture_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "fixture_events_sportmonks_event_id_key" ON "fixture_events"("sportmonks_event_id");

-- CreateIndex
CREATE INDEX "fixture_events_fixture_id_idx" ON "fixture_events"("fixture_id");

-- CreateIndex
CREATE INDEX "fixture_events_player_id_idx" ON "fixture_events"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "fixture_lineups_sportmonks_lineup_id_key" ON "fixture_lineups"("sportmonks_lineup_id");

-- CreateIndex
CREATE INDEX "fixture_lineups_fixture_id_idx" ON "fixture_lineups"("fixture_id");

-- CreateIndex
CREATE INDEX "fixture_lineups_player_id_idx" ON "fixture_lineups"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "fixture_lineup_details_sportmonks_detail_id_key" ON "fixture_lineup_details"("sportmonks_detail_id");

-- CreateIndex
CREATE INDEX "fixture_lineup_details_fixture_id_idx" ON "fixture_lineup_details"("fixture_id");

-- CreateIndex
CREATE INDEX "fixture_lineup_details_lineup_id_idx" ON "fixture_lineup_details"("lineup_id");

-- CreateIndex
CREATE INDEX "fixture_lineup_details_player_id_idx" ON "fixture_lineup_details"("player_id");

-- CreateIndex
CREATE INDEX "player_match_scores_player_id_idx" ON "player_match_scores"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_match_scores_fixture_id_player_id_key" ON "player_match_scores"("fixture_id", "player_id");

-- CreateIndex
CREATE INDEX "manager_round_scores_round_id_idx" ON "manager_round_scores"("round_id");

-- CreateIndex
CREATE UNIQUE INDEX "manager_round_scores_manager_team_id_round_id_key" ON "manager_round_scores"("manager_team_id", "round_id");

-- CreateIndex
CREATE INDEX "api_sync_logs_sync_type_idx" ON "api_sync_logs"("sync_type");

-- CreateIndex
CREATE INDEX "scoring_runs_round_id_idx" ON "scoring_runs"("round_id");

-- CreateIndex
CREATE INDEX "scoring_runs_fixture_id_idx" ON "scoring_runs"("fixture_id");

-- AddForeignKey
ALTER TABLE "fantasy_leagues" ADD CONSTRAINT "fantasy_leagues_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fantasy_leagues" ADD CONSTRAINT "fantasy_leagues_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fantasy_league_members" ADD CONSTRAINT "fantasy_league_members_fantasy_league_id_fkey" FOREIGN KEY ("fantasy_league_id") REFERENCES "fantasy_leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fantasy_league_members" ADD CONSTRAINT "fantasy_league_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_teams" ADD CONSTRAINT "manager_teams_fantasy_league_id_fkey" FOREIGN KEY ("fantasy_league_id") REFERENCES "fantasy_leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_teams" ADD CONSTRAINT "manager_teams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_squad_players" ADD CONSTRAINT "manager_squad_players_manager_team_id_fkey" FOREIGN KEY ("manager_team_id") REFERENCES "manager_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_squad_players" ADD CONSTRAINT "manager_squad_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_lineups" ADD CONSTRAINT "manager_lineups_manager_team_id_fkey" FOREIGN KEY ("manager_team_id") REFERENCES "manager_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_lineups" ADD CONSTRAINT "manager_lineups_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_lineup_slots" ADD CONSTRAINT "manager_lineup_slots_manager_lineup_id_fkey" FOREIGN KEY ("manager_lineup_id") REFERENCES "manager_lineups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_lineup_slots" ADD CONSTRAINT "manager_lineup_slots_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_current_team_id_fkey" FOREIGN KEY ("current_team_id") REFERENCES "real_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_participants" ADD CONSTRAINT "fixture_participants_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_events" ADD CONSTRAINT "fixture_events_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_lineups" ADD CONSTRAINT "fixture_lineups_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_lineup_details" ADD CONSTRAINT "fixture_lineup_details_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_lineup_details" ADD CONSTRAINT "fixture_lineup_details_lineup_id_fkey" FOREIGN KEY ("lineup_id") REFERENCES "fixture_lineups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_scores" ADD CONSTRAINT "player_match_scores_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_scores" ADD CONSTRAINT "player_match_scores_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_scores" ADD CONSTRAINT "player_match_scores_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "real_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_round_scores" ADD CONSTRAINT "manager_round_scores_manager_team_id_fkey" FOREIGN KEY ("manager_team_id") REFERENCES "manager_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_round_scores" ADD CONSTRAINT "manager_round_scores_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scoring_runs" ADD CONSTRAINT "scoring_runs_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scoring_runs" ADD CONSTRAINT "scoring_runs_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
