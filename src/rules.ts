/**
 * Монгол кирилл бичгийн түгээмэл алдааны дүрмүүд.
 * Хүмүүсийн байнга хийдэг алдаануудыг тодорхойлсон.
 */

export interface CorrectionRule {
  /** Алдаатай хэлбэр (regex pattern) */
  pattern: RegExp;
  /** Зөв хэлбэр */
  replacement: string;
  /** Тайлбар */
  description: string;
}

// Кирилл word boundary — \b нь Кирилл үсэгтэй ажиллахгүй тул
// lookbehind/lookahead ашиглана
const CYR = '[а-яА-ЯөӨүҮёЁ]';
const WB_START = `(?<!${CYR})`; // Кирилл үсгийн өмнө Кирилл байхгүй
const WB_END = `(?!${CYR})`;    // Кирилл үсгийн ард Кирилл байхгүй

/** Кирилл word boundary-тай regex үүсгэх helper */
function mnWord(word: string, flags = 'gi'): RegExp {
  return new RegExp(`${WB_START}${word}${WB_END}`, flags);
}

/**
 * Монгол хэлний түгээмэл зөв бичих дүрмийн алдаанууд.
 * 
 * ЧУХАЛ: Дүрмийн дараалал чухал!
 * Тодорхой бүтэн үгийн дүрмүүдийг ЭХЭНД тавина.
 * Ерөнхий suffix дүрмүүдийг (-гүй, -хгүй гэх мэт) СҮҮЛД тавина.
 * Ингэхгүй бол ерөнхий дүрэм эхэлж ажиллаад тодорхой дүрэм таарахаа больно.
 */
export const COMMON_RULES: CorrectionRule[] = [
  // ═══════════════════════════════════════════════════
  // БҮЛЭГ 1: Тодорхой бүтэн үгийн дүрмүүд (эхэнд!)
  // ═══════════════════════════════════════════════════

  // --- ү/у алдаанууд (бүтэн үг) ---
  {
    pattern: mnWord('угуй'),
    replacement: 'үгүй',
    description: 'ү/у алдаа - "үгүй" зөв'
  },
  {
    pattern: mnWord('хумуус'),
    replacement: 'хүмүүс',
    description: 'ү/у алдаа - "хүмүүс" зөв'
  },
  {
    pattern: mnWord('хуний'),
    replacement: 'хүний',
    description: 'ү/у алдаа - "хүний" зөв'
  },
  {
    pattern: mnWord('хучтэй'),
    replacement: 'хүчтэй',
    description: 'ү/у алдаа - "хүчтэй" зөв'
  },
  {
    pattern: mnWord('унэн'),
    replacement: 'үнэн',
    description: 'ү/у алдаа - "үнэн" зөв'
  },
  {
    pattern: mnWord('узэх'),
    replacement: 'үзэх',
    description: 'ү/у алдаа - "үзэх" зөв'
  },
  {
    pattern: mnWord('унэ'),
    replacement: 'үнэ',
    description: 'ү/у алдаа - "үнэ" зөв'
  },
  {
    pattern: mnWord('ундэс'),
    replacement: 'үндэс',
    description: 'ү/у алдаа - "үндэс" зөв'
  },
  {
    pattern: mnWord('уулэн'),
    replacement: 'үүлэн',
    description: 'ү/у алдаа'
  },
  {
    pattern: mnWord('уул'),
    replacement: 'үүл',
    description: 'ү/у алдаа - тэнгэрийн "үүл"'
  },
  {
    pattern: mnWord('удэш'),
    replacement: 'үдэш',
    description: 'ү/у алдаа - "үдэш" зөв'
  },
  {
    pattern: mnWord('усэг'),
    replacement: 'үсэг',
    description: 'ү/у алдаа - "үсэг" зөв'
  },
  {
    pattern: mnWord('узуулэх'),
    replacement: 'үзүүлэх',
    description: 'ү/у алдаа - "үзүүлэх" зөв'
  },
  {
    pattern: mnWord('ургэлж'),
    replacement: 'үргэлж',
    description: 'ү/у алдаа - "үргэлж" зөв'
  },
  {
    pattern: mnWord('удэр'),
    replacement: 'үдэр',
    description: 'ү/у алдаа - "үдэр" зөв'
  },
  {
    pattern: mnWord('ундэслэх'),
    replacement: 'үндэслэх',
    description: 'ү/у алдаа - "үндэслэх" зөв'
  },
  {
    pattern: mnWord('удэшлэг'),
    replacement: 'үдэшлэг',
    description: 'ү/у алдаа - "үдэшлэг" зөв'
  },

  // --- ө/о алдаанууд (бүтэн үг) ---
  {
    pattern: mnWord('оноодор'),
    replacement: 'өнөөдөр',
    description: 'ө/о алдаа - "өнөөдөр" зөв'
  },
  {
    pattern: mnWord('онодор'),
    replacement: 'өнөөдөр',
    description: 'ө/о алдаа - "өнөөдөр" зөв'
  },
  {
    pattern: mnWord('оглоо'),
    replacement: 'өглөө',
    description: 'ө/о алдаа - "өглөө" зөв'
  },
  {
    pattern: mnWord('овол'),
    replacement: 'өвөл',
    description: 'ө/о алдаа - "өвөл" зөв'
  },
  {
    pattern: mnWord('оргон'),
    replacement: 'өргөн',
    description: 'ө/о алдаа - "өргөн" зөв'
  },
  {
    pattern: mnWord('ондор'),
    replacement: 'өндөр',
    description: 'ө/о алдаа - "өндөр" зөв'
  },
  {
    pattern: mnWord('орго'),
    replacement: 'өргө',
    description: 'ө/о алдаа - "өргө" зөв'
  },
  {
    pattern: mnWord('ондорлог'),
    replacement: 'өндөрлөг',
    description: 'ө/о алдаа - "өндөрлөг" зөв'
  },
  {
    pattern: mnWord('одор'),
    replacement: 'өдөр',
    description: 'ө/о алдаа - "өдөр" зөв'
  },
  {
    pattern: mnWord('олгий'),
    replacement: 'өлгий',
    description: 'ө/о алдаа - "өлгий" зөв'
  },

  // --- Давхар эгшиг алдаанууд ---
  {
    pattern: mnWord('хийгед'),
    replacement: 'хийгээд',
    description: 'Давхар эгшиг алдаа - "хийгээд" зөв'
  },
  {
    pattern: mnWord('оорийн'),
    replacement: 'өөрийн',
    description: 'Давхар эгшиг алдаа - "өөрийн" зөв'
  },
  {
    pattern: mnWord('оорчлох'),
    replacement: 'өөрчлөх',
    description: 'Давхар эгшиг алдаа - "өөрчлөх" зөв'
  },

  // --- Нийтлэг бүтэн үгийн -хгүй ---
  {
    pattern: mnWord('чадахгуй'),
    replacement: 'чадахгүй',
    description: '"-хгүй" нөхцөл - "чадахгүй" зөв'
  },
  {
    pattern: mnWord('ирэхгуй'),
    replacement: 'ирэхгүй',
    description: '"-хгүй" нөхцөл - "ирэхгүй" зөв'
  },
  {
    pattern: mnWord('явахгуй'),
    replacement: 'явахгүй',
    description: '"-хгүй" нөхцөл - "явахгүй" зөв'
  },

  // ═══════════════════════════════════════════════════
  // БҮЛЭГ 2: Ерөнхий suffix дүрмүүд (сүүлд!)
  // ═══════════════════════════════════════════════════

  // -хгүй нөхцөлийн алдаа (ерөнхий)
  {
    pattern: /хгуй(?![а-яА-ЯөӨүҮёЁ])/gi,
    replacement: 'хгүй',
    description: '"-хгүй" нөхцөл нь "ү"-тэй бичигдэнэ'
  },

  // -гүй нөхцөлийн алдаа (ерөнхий)
  {
    pattern: /гуй(?![а-яА-ЯөӨүҮёЁ])/gi,
    replacement: 'гүй',
    description: 'Үгүйсгэх "-гүй" нөхцөл нь "ү"-тэй бичигдэнэ'
  },

  // "үг" - богино тул сүүлд тавих (бусад "уг..." pattern-д саад болохгүй)
  {
    pattern: mnWord('уг'),
    replacement: 'үг',
    description: 'ү/у алдаа - "үг" зөв'
  },

  // "өр" - богино тул сүүлд тавих
  {
    pattern: mnWord('ор'),
    replacement: 'өр',
    description: 'ө/о алдаа - "өр" зөв'
  },

  // ═══════════════════════════════════════════════════
  // БҮЛЭГ 3: Зай, цэг таслалын алдаанууд
  // ═══════════════════════════════════════════════════
  {
    pattern: /\s+,/g,
    replacement: ',',
    description: 'Таслалын өмнө зай байх ёсгүй'
  },
  {
    pattern: /\s+\./g,
    replacement: '.',
    description: 'Цэгийн өмнө зай байх ёсгүй'
  },
  {
    pattern: /,([^\s])/g,
    replacement: ', $1',
    description: 'Таслалын ард зай байх ёстой'
  },
  {
    pattern: /\s+\?/g,
    replacement: '?',
    description: 'Асуултын тэмдгийн өмнө зай байх ёсгүй'
  },
  {
    pattern: /\s+!/g,
    replacement: '!',
    description: 'Анхааруулах тэмдгийн өмнө зай байх ёсгүй'
  },
];

/**
 * Монгол эгшиг үсгүүд
 */
export const MONGOLIAN_VOWELS = 'аэийоуөүыеёюя';
export const MALE_VOWELS = 'аоу';   // Эр эгшиг
export const FEMALE_VOWELS = 'эөү'; // Эм эгшиг

/**
 * Үгийн эгшиг зохицох ёсыг шалгах.
 * Монгол хэлэнд нэг үгэнд эр болон эм эгшиг хольж хэрэглэхгүй.
 * "и" эгшиг нь саармаг тул хоёуланд орж болно.
 */
export function checkVowelHarmony(word: string): boolean {
  const lower = word.toLowerCase();
  let hasMale = false;
  let hasFemale = false;

  for (const ch of lower) {
    if (MALE_VOWELS.includes(ch)) hasMale = true;
    if (FEMALE_VOWELS.includes(ch)) hasFemale = true;
  }

  // Эр болон эм эгшиг хоёулаа байвал алдаатай
  return !(hasMale && hasFemale);
}

/**
 * Текстэнд common rules ашиглаж, засагдсан текст буцаана.
 */
export function applyCommonRules(text: string): { corrected: string; appliedRules: string[] } {
  let corrected = text;
  const appliedRules: string[] = [];

  for (const rule of COMMON_RULES) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(corrected)) {
      appliedRules.push(rule.description);
      rule.pattern.lastIndex = 0;
      corrected = corrected.replace(rule.pattern, rule.replacement);
    }
    rule.pattern.lastIndex = 0;
  }

  return { corrected, appliedRules };
}
