import * as fs from 'fs';
import * as path from 'path';
import { parseAffFile, parseDicEntries, checkWordWithSuffixes, SuffixRule } from './suffix-engine';
import { SpellResult, Suggestion, TextCheckResult } from './types';
import { applyCommonRules, checkVowelHarmony } from './rules';

export interface MnSpellCheckerOptions {
  /** Нэмэлт үгс (dictionary-д байхгүй ч зөв гэж тооцох үгс) */
  customWords?: string[];
  /** Эгшиг зохицох ёс шалгах эсэх (default: true) */
  checkVowelHarmony?: boolean;
  /** Common rules ашиглах эсэх (default: true) */
  useCommonRules?: boolean;
  /** Гадны dic файлын агуулга (browser-д ашиглахад) */
  dicContent?: string;
  /** Гадны aff файлын агуулга (browser-д ашиглахад) */
  affContent?: string;
}

/**
 * Монгол кирилл бичгийн алдаа шалгагч.
 * bataak/dict-mn (dictionary-mn) толь бичгийг ашиглана.
 */
export class MnSpellChecker {
  private entries: Map<string, string[]>;
  private suffixRules: Map<string, SuffixRule[]>;
  private repRules: Array<[string, string]>;
  private options: Required<Pick<MnSpellCheckerOptions, 'checkVowelHarmony' | 'useCommonRules'>>;
  private _ready: boolean = false;

  constructor(options?: MnSpellCheckerOptions) {
    this.options = {
      checkVowelHarmony: options?.checkVowelHarmony ?? true,
      useCommonRules: options?.useCommonRules ?? true,
    };

    this.entries = new Map();
    this.suffixRules = new Map();
    this.repRules = [];

    let affContent: string;
    let dicContent: string;

    if (options?.dicContent && options?.affContent) {
      // Browser: string-ээс parse хийх
      affContent = options.affContent;
      dicContent = options.dicContent;
    } else {
      // Node.js: dictionary-mn package-аас файлуудыг унших
      const { affPath, dicPath } = this._findDictionaryFiles();
      affContent = fs.readFileSync(affPath, 'utf-8');
      dicContent = fs.readFileSync(dicPath, 'utf-8');
    }

    const affData = parseAffFile(affContent);
    this.suffixRules = affData.suffixRules;
    this.repRules = affData.repRules;
    this.entries = parseDicEntries(dicContent, affData.flagMode);

    // Нэмэлт үгс нэмэх
    if (options?.customWords) {
      for (const word of options.customWords) {
        this.entries.set(word, []);
        this.entries.set(word.toLowerCase(), []);
      }
    }

    this._ready = true;
  }

  /**
   * Checker амжилттай ачаалагдсан эсэхийг шалгана.
   */
  get ready(): boolean {
    return this._ready;
  }

  private _findDictionaryFiles(): { affPath: string; dicPath: string } {
    const searchPaths = [
      // Энэ package-ийн node_modules дотроос
      path.join(__dirname, '..', 'node_modules', 'dictionary-mn'),
      // Төслийн root node_modules дотроос
      path.join(process.cwd(), 'node_modules', 'dictionary-mn'),
    ];

    // require.resolve ашиглаж олох оролдлого
    try {
      const resolved = require.resolve('dictionary-mn/index.aff');
      const dir = path.dirname(resolved);
      searchPaths.unshift(dir);
    } catch {
      // нэмэлт хайлт ажиллахгүй бол үргэлжлүүлнэ
    }

    for (const dir of searchPaths) {
      const affPath = path.join(dir, 'index.aff');
      const dicPath = path.join(dir, 'index.dic');
      if (fs.existsSync(affPath) && fs.existsSync(dicPath)) {
        return { affPath, dicPath };
      }
    }

    throw new Error(
      'dictionary-mn package олдсонгүй. "npm install dictionary-mn" ажиллуулна уу. ' +
      'Эсвэл affContent/dicContent option-оор шууд дамжуулна уу.'
    );
  }

  /**
   * Нэг үг зөв эсэхийг шалгана.
   */
  correct(word: string): boolean {
    const cleaned = word.trim();
    if (!cleaned) return true;

    // Тоо, латин тэмдэгт, цэг таслал бол шалгахгүй
    if (/^[a-zA-Z0-9\s.,!?@#$%^&*()\-_+=\[\]{};':"\\|<>\/]+$/.test(cleaned)) {
      return true;
    }

    // Хэт богино монгол үг (1 тэмдэгт бол зөв гэж тооцох — жишээ: "Би", "ч")
    if (cleaned.length === 1) return true;

    return checkWordWithSuffixes(cleaned, this.entries, this.suffixRules);
  }

  /**
   * Нэг үгийг шалгаж, дэлгэрэнгүй үр дүн буцаана.
   */
  check(word: string): SpellResult {
    const cleaned = word.trim();

    if (!cleaned || /^[a-zA-Z0-9\s.,!?@#$%^&*()\-_+=\[\]{};':"\\|<>\/]+$/.test(cleaned)) {
      return { word: cleaned, correct: true, suggestions: [] };
    }

    const isCorrect = this.correct(cleaned);

    let suggestions: string[] = [];
    if (!isCorrect) {
      suggestions = this.suggest(cleaned);
    }

    return {
      word: cleaned,
      correct: isCorrect,
      suggestions,
    };
  }

  /**
   * Үгэнд санал болгох засваруудыг буцаана.
   */
  suggest(word: string): string[] {
    const lower = word.toLowerCase();
    const suggestions = new Set<string>();

    // 1. REP дүрмүүд ашиглах
    for (const [from, to] of this.repRules) {
      let idx = lower.indexOf(from);
      while (idx >= 0) {
        const candidate = lower.substring(0, idx) + to + lower.substring(idx + from.length);
        if (this.correct(candidate)) {
          suggestions.add(candidate);
        }
        if (suggestions.size >= 10) break;
        idx = lower.indexOf(from, idx + 1);
      }
      if (suggestions.size >= 10) break;
    }

    // 2. Edit distance 1
    if (suggestions.size < 5) {
      const edits = this._edits1(lower);
      for (const candidate of edits) {
        if (this.correct(candidate)) {
          suggestions.add(candidate);
        }
        if (suggestions.size >= 10) break;
      }
    }

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Бүтэн текстийг шалгаж, бүх алдааг олж, засвар санал болгоно.
   */
  checkText(text: string): TextCheckResult {
    let processedText = text;

    // 1. Common rules ашиглах
    if (this.options.useCommonRules) {
      const ruleResult = applyCommonRules(processedText);
      processedText = ruleResult.corrected;
    }

    // 2. Үг бүрийг шалгах
    const words = this._extractMongolianWords(processedText);
    const allErrors: Suggestion[] = [];

    for (const { word, index } of words) {
      if (/^[a-zA-Z0-9]+$/.test(word)) continue;

      const isCorrect = this.correct(word);

      if (!isCorrect) {
        const suggestions = this.suggest(word);
        allErrors.push({ word, index, suggestions });
      }

      // Эгшиг зохицох ёс
      if (this.options.checkVowelHarmony && !checkVowelHarmony(word)) {
        if (isCorrect) continue;
        const existing = allErrors.find(e => e.index === index);
        if (!existing) {
          allErrors.push({
            word,
            index,
            suggestions: [`"${word}" - эгшиг зохицох ёсны алдаатай байж болзошгүй`],
          });
        }
      }
    }

    // Автомат засвар
    let corrected = processedText;
    const sortedErrors = [...allErrors].sort((a, b) => b.index - a.index);
    for (const error of sortedErrors) {
      if (error.suggestions.length > 0 && !error.suggestions[0].startsWith('"')) {
        corrected =
          corrected.slice(0, error.index) +
          error.suggestions[0] +
          corrected.slice(error.index + error.word.length);
      }
    }

    return {
      errorCount: allErrors.length,
      errors: allErrors.sort((a, b) => a.index - b.index),
      corrected,
    };
  }

  /**
   * HTML агуулгаас текстийг ялган авч шалгана.
   * Website-ийн DOM текстэд ашиглахад тохиромжтой.
   * HTML таг, attribute-ыг алгасж зөвхөн текстийг шалгана.
   */
  checkHTML(html: string): TextCheckResult {
    // HTML таг-уудыг устгаж, зөвхөн текстийг авах
    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')  // script блок устгах
      .replace(/<style[\s\S]*?<\/style>/gi, '')    // style блок устгах
      .replace(/<[^>]+>/g, ' ')                     // HTML тагуудыг зайгаар солих
      .replace(/&nbsp;/gi, ' ')                     // &nbsp; -ыг зайгаар солих
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')                        // Олон зайг нэг болгох
      .trim();

    return this.checkText(textContent);
  }

  /**
   * Нэмэлт үг dictionary-д оруулах.
   */
  addWord(word: string): void {
    this.entries.set(word, []);
    this.entries.set(word.toLowerCase(), []);
  }

  /**
   * Олон үг нэмэх.
   */
  addWords(words: string[]): void {
    for (const word of words) {
      this.addWord(word);
    }
  }

  /**
   * Үг dictionary-аас хасах.
   */
  removeWord(word: string): void {
    this.entries.delete(word);
    this.entries.delete(word.toLowerCase());
  }

  /**
   * Dictionary-д хэдэн root word байгааг буцаана.
   */
  get wordCount(): number {
    return this.entries.size;
  }

  private _extractMongolianWords(text: string): { word: string; index: number }[] {
    const results: { word: string; index: number }[] = [];
    const regex = /[а-яА-ЯөӨүҮёЁa-zA-Z0-9-]+/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      results.push({ word: match[0], index: match.index });
    }

    return results;
  }

  private _edits1(word: string): string[] {
    const results: string[] = [];
    const letters = 'абвгдеёжзийклмноөпрстуүфхцчшщъыьэюя';

    // Нэг тэмдэгт хасах
    for (let i = 0; i < word.length; i++) {
      results.push(word.slice(0, i) + word.slice(i + 1));
    }

    // Хоёр тэмдэгт солих
    for (let i = 0; i < word.length - 1; i++) {
      results.push(word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2));
    }

    // Нэг тэмдэгт өөрчлөх
    for (let i = 0; i < word.length; i++) {
      for (const c of letters) {
        if (c !== word[i]) {
          results.push(word.slice(0, i) + c + word.slice(i + 1));
        }
      }
    }

    // Нэг тэмдэгт нэмэх
    for (let i = 0; i <= word.length; i++) {
      for (const c of letters) {
        results.push(word.slice(0, i) + c + word.slice(i));
      }
    }

    return results;
  }
}
