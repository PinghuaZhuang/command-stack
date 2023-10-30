import invariant from 'invariant';
import type { SyncHook, AsyncHook } from 'tapable';

export type Hook<T = unknown[], R = unknown> = SyncHook<T> | AsyncHook<T, R>;

export interface IPluginHooks<T = unknown[], R = unknown> {
  [k: string]: Hook<T, R>;
}

export interface IPlugin<T = unknown[], R = unknown> {
  (...args: unknown[]): void;
  apply: (hooks: IPluginHooks<T, R>) => void;
}

class HookSys<
  T = unknown[],
  R = unknown,
  U extends IPluginHooks<T, R> = IPluginHooks<T, R>,
> {
  hooks: U;

  constructor(hooks: U, plugins: IPlugin<T, R>[] = []) {
    this.hooks = hooks;

    if (plugins.length) {
      plugins.forEach((plugin) => this.use(plugin));
    }
  }

  use(plugin: IPlugin<T, R>) {
    invariant(plugin.apply, 'plugin.apply cannot be undefined');
    plugin.apply(this.hooks);
  }
}

export default HookSys;
