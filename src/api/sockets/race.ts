const PREFIX = "race:";

export const CLIENT_RACE_UPDATE_EVENT = `${PREFIX}race-update`;
export const SERVER_RACE_UPDATE_EVENT = `${PREFIX}server-race-update`;
export const RACER_FINISHED_EVENT = `${PREFIX}racer-finished`;
export const RACE_COMPLETE_EVENT = `${PREFIX}race-complete`;

export interface MatchUpdate {
  id: string;
  percentage: number;
  wpm: number;
}

export interface RacerFinish {
  id: string;
  place: number;
  wpm: number;
}
