export type StateMachineDetails = {
  /**
   * The ORID of the state machine
   */
  orid: string;

  /**
   * The friendly name for this state machine
   */
  name: string;

  /**
   * The definition for this state machine
   */
  definition: unknown; // TODO: Figure out the best type here. Potentially Record<string, unknown>?
};
