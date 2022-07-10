export type OperationDetail = {
  /**
   * The unique identifier of the operation
   */
  id: string;

  /**
   * The ISO timestamp when the operation was created
   */
  created: string;

  /**
   * The status of this operation
   */
  status: string;

  /**
   * The user defined key for this operation
   */
  stateKey: string;

  /**
   * The input supplied to this step of the state machine
   */
  input: unknown;

  /**
   * The output from this step of the state machine
   */
  output: unknown;
};
