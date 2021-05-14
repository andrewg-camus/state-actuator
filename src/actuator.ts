import ActuatorImpl from "./actuatorImpl";

/**
 * All messages require an identifier.
 * The identifier should be serializable so messages can be persisted.
 */
export type AnyMsg = { id: string };

/**
 * An updater receives messages to be processed by the state generator.
 */
export type Updater<M extends AnyMsg> = (msg: M) => void;

/**
 * An update function can return new state plus message(s) to send.
 */
export type StateChange<Model, Msg extends AnyMsg> = {
  model: Model;
  message?: Promise<Msg> | Promise<Msg>[];
};

/**
 * The functions necessary to implement a stateful component that can
 * process messages.
 */
// TODO: renname me!
export interface Stateful<Model, Msg extends AnyMsg> {
  /**
   * Creates the initial state.
   * // TODO: Also allow folks to send an initial message!
   */
  init(): Model;
  /**
   * Converts messages into new models.
   * Can also return messages to be sent asynchronously, enabling
   * state changes based on network responses or other async activity.
   */
  update(model: Model, msg: Msg): Model | StateChange<Model, Msg>;
  /**
   * Provides a mechanism to generate messages based on an asynchronous API.
   * It's called on every model update.
   */
  subscriptions?(model: Model): void;
}

/**
 * The core implementation
 */
export interface StateActuator<Model, Msg extends AnyMsg> {
  /**
   * The state when the actuator is created.
   */
  readonly initialModel: Readonly<Model>;

  /**
   * The updater recevies messages generated by the application.
   */
  readonly updater: Updater<Msg>;

  /**
   * The updater that receives messages not handled by this actuator.
   */
  unhandledUpdater?: Updater<Msg>;

  /**
   * Return a new iterator over state changes.
   * Multiple iterators can be created and work in parallel.
   */
  stateIterator(): AsyncIterableIterator<Model>;
}

/**
 * Create a state actuator given the state definition
 * @returns The actuator implementation
 */
export function StateActuator<Model, Msg extends AnyMsg>(state: Stateful<Model, Msg>) {
  return new ActuatorImpl(state);
}
