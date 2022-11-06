import { OperationDetail } from './operation-detail';

export type StateMachineExecutionDetailsResult = {
  /**
   * The ORID of the state machine execution
   */
  orid: string;
  /**
   * The status of the execution at the time of the request
   */
  status: string;
  /**
   * Operations that are associated with this execution
   */
  operations: OperationDetail[];
};
