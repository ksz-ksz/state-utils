export class EffectError extends Error {
  readonly name = 'EffectError';

  constructor(
    readonly effectName: string,
    readonly effectKey: string,
    readonly cause: any
  ) {
    super(`Error in ${effectName}::${effectKey}`, { cause });
  }
}
