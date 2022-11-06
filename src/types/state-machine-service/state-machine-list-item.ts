export type StateMachineListItem = {
  /**
   * The ORID of the state machine
   */
  orid: string;

  /**
   * The friendly name of the state machine
   */
  name: string;

  /**
   * The currently active definition for this state machine
   */
  activeVersion: string;

  /**
   * Boolean indicator for if the state machine has been scheduled for deletion
   */
  isDeleted: boolean;
};
