import "server-only";

export {
  SPORTMONKS_BASE_URL,
  SportmonksError,
  getSportmonksToken,
  isSportmonksConfigured,
  sportmonksGet,
} from "./client";

export type {
  SportmonksRateLimit,
  SportmonksResponse,
} from "./client";

export {
  getFixtureById,
  getFixtureWithParticipants,
  getFixtureWithEvents,
  getFixtureWithLineups,
  getFixtureWithLineupDetails,
} from "./fixtures";

export type {
  SportmonksFixture,
  SportmonksParticipant,
  SportmonksEvent,
  SportmonksLineup,
  SportmonksLineupDetail,
  FixtureWithParticipants,
  FixtureWithEvents,
  FixtureWithLineups,
} from "./fixtures";
