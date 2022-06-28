import axios from 'axios';
import urlJoin from 'url-join';
import { VError } from 'verror';
import { AuthManager } from '../lib';
import { getRequestOptions } from '../lib/utils';

export interface CreateStateMachineResult {
  /**
   * The unique identifier of the newly created state machine
   */
  orid: string;
  /**
   * Status of the operation result
   */
  status: string;
}

export interface OperationDetail {
  /**
   * The unique identifier of the operation
   */
  orid: string;
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
   * A JSON formatted object for the input
   */
  input: string;
  /**
   * A JSON formatted object for the output
   */
  output: string;
}

export interface ExecutionDetailsResult {
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
}

export interface StateMachineDetails {
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
}

export interface ExecutionInvokeResult {
  /**
   * The ORID of the state machine execution
   */
  orid: string;
  /**
   * The status of the state machine execution.
   */
  status: string;
}

export interface StateMachineListItem {
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
}

export interface UpdateStateMachineResult {
  /**
   * The ORID of the state machine being updated
   */
  orid: string;
  /**
   * The status of the state machine execution.
   */
  status: string;
}

export interface DeleteStateMachineResult {
  /**
   * The ORID of the state machine being updated
   */
  orid: string;
}

export class StateMachineServiceClient {
  private _serviceUrl: string;
  private authManager: AuthManager;

  /**
   * Initializes a new instance of the State Machine Service client
   * @param serviceUrl The url base that this client should use for service communication
   * @param authManager
   */
  constructor(serviceUrl: string, authManager?: AuthManager) {
    this._serviceUrl = serviceUrl;
    this.authManager = authManager;
  }

  public get serviceUrl(): string {
    return this._serviceUrl;
  }

  /**
   * Create a new state machine
   * @param definition The state machine definition
   */
  async createStateMachine(
    definition: unknown,
  ): Promise<CreateStateMachineResult> {
    const url = urlJoin(this.serviceUrl, 'v1', 'machine');

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.post(url, definition, options);
    switch (resp.status) {
      case 200: {
        const parsedBody = resp.data;
        return { status: 'created', orid: parsedBody.orid };
      }
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while creating the state machine.',
        );
    }
  }

  /**
   * Get the details of an execution
   * @param orid The ORID of the state machine execution
   * @returns
   */
  async getDetailsForExecution(
    orid: string,
  ): Promise<ExecutionDetailsResult | null> {
    const url = urlJoin(this.serviceUrl, 'v1', 'execution', orid);

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.get(url, options);
    switch (resp.status) {
      case 200:
        return resp.data;
      case 404:
        return undefined;
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while obtaining details of the execution.',
        );
    }
  }

  /**
   * Get the details of a state machine
   * @param orid The ORID of the state machine
   */
  async getStateMachine(orid: string): Promise<StateMachineDetails> {
    const url = urlJoin(this.serviceUrl, 'v1', 'machine', orid);

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.get(url, options);
    switch (resp.status) {
      case 200:
        return resp.data;
      case 404:
        return undefined;
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while obtaining details of the state machine.',
        );
    }
  }

  /**
   * Invoke a new execution of the state machine
   * @param orid The ORID of the state machine
   * @param data The input data for the state machine
   */
  async invokeStateMachine(
    orid: string,
    data: unknown, // TODO: Figure out best type here. Was Object.
  ): Promise<ExecutionInvokeResult> {
    const url = urlJoin(this.serviceUrl, 'v1', 'machine', orid, 'invoke');

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.post(url, data, options);
    switch (resp.status) {
      case 200: {
        const parsedBody = resp.data;
        return { status: 'invoked', orid: parsedBody.orid };
      }
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while invoking the state machine.',
        );
    }
  }

  /**
   * Get a list of available state machines
   */
  async listStateMachines(): Promise<StateMachineListItem[]> {
    const url = urlJoin(this.serviceUrl, 'v1', 'machines');

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.get(url, options);
    switch (resp.status) {
      case 200:
        return resp.data;
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while listing the available state machines.',
        );
    }
  }

  /**
   * Create a new state machine
   * @param orid The ORID of the state machine
   * @param definition The state machine definition
   */
  async updateStateMachine(
    orid: string,
    definition: unknown, // TODO: Determine the best type for here. Was string.
  ): Promise<UpdateStateMachineResult> {
    const url = urlJoin(this.serviceUrl, 'v1', 'machine', orid);

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.post(url, definition, options);
    switch (resp.status) {
      case 200: {
        const parsedBody = resp.data;
        return { status: 'updated', orid: parsedBody.orid };
      }
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while updating the state machine.',
        );
    }
  }

  /**
   * Deletes a state machine
   * @param orid The orid of the state machine
   */
  async deleteStateMachine(orid: string): Promise<DeleteStateMachineResult> {
    const url = urlJoin(this.serviceUrl, 'v1', 'machine', orid);

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.delete(url, options);
    switch (resp.status) {
      case 200: {
        const parsedBody = resp.data;
        return { orid: parsedBody.orid };
      }
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while deleting the state machine.',
        );
    }
  }
}
