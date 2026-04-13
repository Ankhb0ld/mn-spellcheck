export interface SuffixRule {
  flag: string;
  strip: string;
  add: string;
  condition: RegExp;
  continuationFlags: string[];
}

export interface DicEntry {
  word: string;
  flags: string[];
}

/**
 * .aff файлаас SFX дүрмүүдийг parse хийнэ.
 * FLAG long форматыг дэмжинэ (2 тэмдэгтийн flag).
 */
export function parseAffFile(content: string): {
  suffixRules: Map<string, SuffixRule[]>;
  repRules: Array<[string, string]>;
  flagMode: 'long' | 'short';
} {
  const lines = content.split('\n');
  const suffixRules = new Map<string, SuffixRule[]>();
  const repRules: Array<[string, string]> = [];
  let flagMode: 'long' | 'short' = 'short';

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'FLAG long') {
      flagMode = 'long';
      continue;
    }

    // REP дүрмүүд
    if (trimmed.startsWith('REP ')) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 3 && !/^\d+$/.test(parts[1])) {
        repRules.push([parts[1], parts[2]]);
      }
      continue;
    }

    // SFX дүрмүүд (header мөрүүдийг алгасах)
    if (trimmed.startsWith('SFX ')) {
      const parts = trimmed.split(/\s+/);
      // SFX flag Y count - header мөр
      if (parts.length === 4 && (parts[2] === 'Y' || parts[2] === 'N')) {
        continue;
      }
      // SFX flag strip add [condition]
      if (parts.length >= 4) {
        const flag = parts[1];
        const stripRaw = parts[2];
        const addRaw = parts[3];

        const strip = stripRaw === '0' ? '' : stripRaw;
        // add хэсэгт flag байж болно: "на/040870" -> зөвхөн "на" авна
        const addSlash = addRaw.indexOf('/');
        const add = addSlash >= 0 ? addRaw.substring(0, addSlash) : (addRaw === '0' ? '' : addRaw);
        const continuationFlags = addSlash >= 0 ? splitFlags(addRaw.substring(addSlash + 1), flagMode) : [];

        const conditionStr = parts.length >= 5 ? parts[4] : '.';
        let condition: RegExp;
        try {
          condition = new RegExp(conditionStr + '$');
        } catch {
          condition = /./;
        }

        if (!suffixRules.has(flag)) {
          suffixRules.set(flag, []);
        }
        suffixRules.get(flag)!.push({ flag, strip, add, condition, continuationFlags });
      }
    }
  }

  return { suffixRules, repRules, flagMode };
}

/**
 * .dic файлаас үг + flag-уудыг parse хийнэ.
 * FLAG long форматыг дэмжинэ.
 */
export function parseDicEntries(content: string, flagMode: 'long' | 'short'): Map<string, string[]> {
  const entries = new Map<string, string[]>();
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || /^\d+$/.test(trimmed)) continue;

    const slashIdx = trimmed.indexOf('/');
    if (slashIdx >= 0) {
      const word = trimmed.substring(0, slashIdx);
      const flagStr = trimmed.substring(slashIdx + 1);
      const flags = splitFlags(flagStr, flagMode);
      if (word) {
        entries.set(word, flags);
      }
    } else {
      entries.set(trimmed, []);
    }
  }

  return entries;
}

/**
 * Flag string-г салгах.
 * FLAG long: "F0A00A" -> ["F0", "A0", "0A"]
 * FLAG short: "ABC" -> ["A", "B", "C"]
 */
function splitFlags(flagStr: string, mode: 'long' | 'short'): string[] {
  const flags: string[] = [];
  if (mode === 'long') {
    for (let i = 0; i < flagStr.length; i += 2) {
      if (i + 1 < flagStr.length) {
        flags.push(flagStr.substring(i, i + 2));
      }
    }
  } else {
    for (const ch of flagStr) {
      flags.push(ch);
    }
  }
  return flags;
}

/**
 * Suffix stripping ашиглан үг зөв эсэхийг шалгах.
 *
 * 1. Шууд dictionary-д байвал -> зөв
 * 2. Suffix rule-ийн дагуу strip хийж root word олоход
 *    тухайн root-д зохих flag байвал -> зөв
 */
export function checkWordWithSuffixes(
  word: string,
  entries: Map<string, string[]>,
  suffixRules: Map<string, SuffixRule[]>,
): boolean {
  // Шууд хайх
  if (entries.has(word)) return true;

  const lower = word.toLowerCase();
  if (entries.has(lower)) return true;

  // Том үсгээр эхэлсэн бол жижиг үсгээр шалгах
  if (word.length > 0 && word[0] !== lower[0]) {
    const capitalized = lower;
    if (entries.has(capitalized)) return true;
  }

  // Suffix stripping (starts with undefined continuation flag constraint, max depth 3)
  if (checkWithSuffixStripping(lower, entries, suffixRules)) return true;

  // Compound word check: үгийг хоёр хэсэгт хуваагаад тус тусыг нь шалгах
  if (lower.length >= 4) {
    for (let i = 2; i <= lower.length - 2; i++) {
      const left = lower.substring(0, i);
      const right = lower.substring(i);

      const leftOk = entries.has(left)
        || checkWithSuffixStripping(left, entries, suffixRules);
      if (!leftOk) continue;

      const rightOk = entries.has(right)
        || checkWithSuffixStripping(right, entries, suffixRules);
      if (rightOk) return true;
    }
  }

  return false;
}

function checkWithSuffixStripping(
  word: string,
  entries: Map<string, string[]>,
  suffixRules: Map<string, SuffixRule[]>,
  requiredContinuationFlag?: string,
  depth: number = 0
): boolean {
  if (depth > 3) return false;

  for (const [flag, rules] of suffixRules) {
    for (const rule of rules) {
      if (!rule.add) continue;
      
      // If we are recursing inwards, the inner suffix MUST have the outer suffix's flag in its continuationFlags
      if (requiredContinuationFlag && !rule.continuationFlags.includes(requiredContinuationFlag)) {
        continue;
      }

      if (word.endsWith(rule.add)) {
        const base = word.substring(0, word.length - rule.add.length);
        const root = base + rule.strip;

        if (root.length === 0) continue;

        const toCheck = rule.strip ? root : base;
        if (!rule.condition.test(toCheck)) continue;

        const rootFlags = entries.get(root);
        if (rootFlags && rootFlags.includes(flag)) {
          return true;
        }

        if (checkWithSuffixStripping(root, entries, suffixRules, flag, depth + 1)) {
          return true;
        }
      }
    }
  }
  return false;
}
