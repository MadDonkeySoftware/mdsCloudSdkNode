export type FunctionDetails = {
  /**
   * The identifier of the function
   */
  orid: string;

  /**
   * The friendly name of the function
   */
  name: string;

  /**
   * THe current runtime specified for the function
   */
  runtime: string;

  /**
   * The specified entry point for the current version of the function
   */
  entryPoint: string;

  /**
   * ISO formatted timestamp for when this function was created
   */
  created: string;

  /**
   * ISO formatted timestamp for when this function was last updated
   */
  lastUpdate?: string;

  /**
   * ISO formatted timestamp for when this function was last invoked
   */
  lastInvoke?: string;
};
