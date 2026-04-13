# mn-spellcheck

[![npm version](https://img.shields.io/npm/v/mn-spellcheck.svg)](https://www.npmjs.com/package/mn-spellcheck)
[![license](https://img.shields.io/npm/l/mn-spellcheck.svg)](https://github.com/Ankhb0ld/mn-spellcheck/blob/main/LICENSE)

Монгол кирилл бичгийн алдаа шалгагч / Mongolian Cyrillic spell checker for Node.js, CLI, and websites.

580,000+ root words, suffix analysis, compound word support — powered by [bataak/dict-mn](https://github.com/bataak/dict-mn).

## Боломжууд

- **580,000+ root word** dictionary
- **Suffix stripping** — нөхцөл дагавартай үгсийг шалгах
- **Compound word** — нийлмэл үг шалгах
- **Common rules** — түгээмэл алдааны автомат засвар (ү/у, ө/о, -гүй/-гуй)
- **Suggestion engine** — REP дүрмүүд болон edit distance ашиглан санал болгох
- **CLI хэрэгсэл** — Терминалаас бүх файлыг шалгаж, автоматаар засах боломжтой
- **Бүтэн текст шалгах** — `checkText()` ашиглаж засах
- **HTML шалгах** — `checkHTML()` ашиглаж website-ийн текстийг шалгах
- **Эгшиг зохицох ёс** — vowel harmony шалгалт
- **Node.js, Browser** болон **TypeScript** дэмжинэ.

## Суулгах / Install

Төсөлд шууд суулгах:

```bash
npm install mn-spellcheck
```

Шууд глобал эсвэл CLI байдлаар ашиглах:

```bash
npm install -g mn-spellcheck
# эсвэл
npx mn-spellcheck --help
```

## CLI команд (Терминалаас ашиглах)

Төслийн бүх файлын алдааг терминалаас хялбархан шалгаж, автоматаар засах боломжтой.

### Алдаа шалгах (Check)

Тухайн хавтас доторх бүх файлыг шалгаж, алдаатай үгс болон санал болгож буй хувилбаруудыг харуулна:

```bash
npx mn-spellcheck check
npx mn-spellcheck check ./src
```

### Автоматаар засах (Fix)

Олдсон алдаануудыг болон нийтлэг дүрмийн алдаануудыг автоматаар файланд нь орж засна:

```bash
npx mn-spellcheck fix
npx mn-spellcheck fix ./src
```

### Нэмэлт тохиргоо

Анхны тохиргоогоор `.html`, `.tsx`, `.jsx`, `.md`, `.txt` файлуудыг шалгана. Файлын өргөтгөлийг өөрчлөх бол `--ext` ашиглана:

```bash
npx mn-spellcheck check ./src --ext .svelte,.vue,.ts
```

## Хөгжүүлэлтэд ашиглах (API)

### Үндсэн хэрэглээ

```js
const { createSpellChecker } = require('mn-spellcheck');

const checker = createSpellChecker();

// Нэг үг шалгах
checker.correct('сайн');     // true
checker.correct('монгл');    // false

// Suggestion авах
checker.suggest('монгл');    // ['монгол']

// Дэлгэрэнгүй шалгалт
checker.check('монгл');
// { word: 'монгл', correct: false, suggestions: ['монгол'] }
```

### Бүтэн текст шалгах

```js
const result = checker.checkText('Би мэдэхгуй байна ,энэ болохгуй юм.');

console.log(result.corrected);
// "Би мэдэхгүй байна, энэ болохгүй юм."

console.log(result.errorCount); 
console.log(result.errors);     
```

### Website / HTML текст шалгах

HTML таг, script, style бүгдийг алгасаж зөвхөн текстийг шалгана.

```js
const html = '<h1>Онодор сайхан одор</h1><p>Хумуус олон байна</p>';
const result = checker.checkHTML(html);

console.log(result.corrected);
// "өнөөдөр сайхан өдөр хүмүүс олон байна"
```

### Нэмэлт үг нэмэх

```js
const checker = createSpellChecker({
  customWords: ['клауд', 'энтерпрайз']
});

checker.addWord('блокчейн');
checker.addWords(['крипто', 'токен']);
```

### Тохиргоо

```js
const checker = createSpellChecker({
  customWords: [],           // Нэмэлт үгс
  checkVowelHarmony: true,   // Эгшиг зохицох ёс шалгах
  useCommonRules: true,      // Түгээмэл алдааны дүрмүүд ашиглах
});
```

## Common Rules (Автомат засвар)

42 дүрэм бүхий автомат засвар. Дараах түгээмэл алдаануудыг засна:

| Алдаатай | Зөв | Тайлбар |
|----------|------|---------|
| мэдэхгуй | мэдэхгүй | -хгүй нөхцөл |
| болохгуй | болохгүй | -хгүй нөхцөл |
| ...гуй | ...гүй | -гүй нөхцөл |
| хумуус | хүмүүс | ү/у алдаа |
| угуй | үгүй | ү/у алдаа |
| хуний | хүний | ү/у алдаа |
| онодор | өнөөдөр | ө/о алдаа |
| оглоо | өглөө | ө/о алдаа |
| одор | өдөр | ө/о алдаа |
| овол | өвөл | ө/о алдаа |
| ... | ... | + 30 дүрэм |

## Dictionary

[bataak/dict-mn](https://github.com/bataak/dict-mn) толь бичгийг ашиглана:
- 580,000+ root words
- Suffix rules (нөхцөл дагавар)
- Compound word support (нийлмэл үг)
- REP rules (орлуулалтын дүрмүүд)

## Browser дээр ашиглах

```js
const affContent = await fetch('/dict/index.aff').then(r => r.text());
const dicContent = await fetch('/dict/index.dic').then(r => r.text());

const checker = createSpellChecker({
  affContent,
  dicContent,
});

checker.correct('сайн'); // true
```

## Common Rules тусад нь ашиглах

```js
const { applyCommonRules, COMMON_RULES } = require('mn-spellcheck');

const result = applyCommonRules('Би мэдэхгуй байна');
console.log(result.corrected); // "Би мэдэхгүй байна"
```

## Лиценз / License

MIT

Dictionary files: [LPPL-1.3c](https://www.latex-project.org/lppl.txt) © Batmunkh Dorjgotov
