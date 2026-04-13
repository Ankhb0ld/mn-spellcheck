import { MnSpellChecker, MnSpellCheckerOptions } from './checker';
import { SpellResult, Suggestion, TextCheckResult } from './types';

export { MnSpellChecker } from './checker';
export type { MnSpellCheckerOptions } from './checker';
export type { SpellResult, Suggestion, TextCheckResult } from './types';
export { parseAffFile, parseDicEntries, checkWordWithSuffixes } from './suffix-engine';
export { applyCommonRules, checkVowelHarmony, COMMON_RULES } from './rules';
export type { CorrectionRule } from './rules';

/**
 * Шинэ MnSpellChecker instance үүсгэж буцаана.
 * Mongolian spell checker-г хялбар ашиглах factory function.
 */
export function createSpellChecker(options?: MnSpellCheckerOptions): MnSpellChecker {
  return new MnSpellChecker(options);
}

export default MnSpellChecker;
