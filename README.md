# mn-spellcheck

[![npm version](https://img.shields.io/npm/v/mn-spellcheck.svg)](https://www.npmjs.com/package/mn-spellcheck)
[![license](https://img.shields.io/npm/l/mn-spellcheck.svg)](https://github.com/user/mn-spellcheck/blob/main/LICENSE)

Монгол кирилл бичгийн алдаа шалгагч / Mongolian Cyrillic spell checker for Node.js and websites.

580,000+ root words, suffix analysis, compound word support — powered by [bataak/dict-mn](https://github.com/bataak/dict-mn).

## ✨ Боломжууд

- 🔍 **580,000+ root word** dictionary
- 🧩 **Suffix stripping** — нөхцөл дагавартай үгсийг шалгах
- 🔗 **Compound word** — нийлмэл үг шалгах
- ✏️ **Common rules** — түгээмэл алдааны автомат засвар (ү/у, ө/о, -гүй/-гуй)
- 🎯 **Suggestion engine** — REP дүрмүүд + edit distance
- 📝 **Бүтэн текст шалгах** — `checkText()` ашиглаж бүх алдааг олох
- 🌐 **HTML шалгах** — `checkHTML()` ашиглаж website-ийн текстийг шалгах
- 🎵 **Эгшиг зохицох ёс** — vowel harmony шалгалт
- 🖥️ **Node.js + Browser** дэмжих
- 📘 **TypeScript** type definitions

## Суулгах / Install

```bash
npm install mn-spellcheck
```

## Хэрэглэх / Usage

### Үндсэн хэрэглээ

```js
const { createSpellChecker } = require('mn-spellcheck');

const checker = createSpellChecker();

// Нэг үг шалгах
checker.correct('сайн');     // true
checker.correct('байна');    // true
checker.correct('монгл');    // false

// Suggestion авах
checker.suggest('монгл');    // ['монгол']
checker.suggest('сургуль');  // ['сургууль', ...]

// Дэлгэрэнгүй шалгалт
checker.check('монгл');
// { word: 'монгл', correct: false, suggestions: ['монгол'] }
```

### Бүтэн текст шалгах

```js
const result = checker.checkText('Би мэдэхгуй байна ,энэ болохгуй юм.');

console.log(result.corrected);
// "Би мэдэхгүй байна, энэ болохгүй юм."

console.log(result.errorCount); // 0 (common rules засварлав)
console.log(result.errors);     // алдаа бүрийн дэлгэрэнгүй
```

### 🌐 Website / HTML текст шалгах

Website-ийн HTML контентыг шалгахад `checkHTML()` функцийг ашиглана.
HTML таг, script, style бүгдийг алгасаж зөвхөн текстийг шалгана.

```js
const html = '<h1>Онодор сайхан одор</h1><p>Хумуус олон байна</p>';
const result = checker.checkHTML(html);

console.log(result.corrected);
// "өнөөдөр сайхан өдөр хүмүүс олон байна"

console.log(result.errorCount);
console.log(result.errors);
```

**Жишээ: Express middleware**

```js
const express = require('express');
const { createSpellChecker } = require('mn-spellcheck');

const checker = createSpellChecker();
const app = express();

app.post('/api/spellcheck', express.json(), (req, res) => {
  const { text } = req.body;
  const result = checker.checkText(text);
  res.json(result);
});

app.post('/api/spellcheck-html', express.json(), (req, res) => {
  const { html } = req.body;
  const result = checker.checkHTML(html);
  res.json(result);
});
```

### Нэмэлт үг нэмэх

```js
const checker = createSpellChecker({
  customWords: ['клауд', 'энтерпрайз']
});

// Эсвэл дараа нь нэмэх
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

## API

### `createSpellChecker(options?)`
Шинэ spell checker үүсгэнэ.

### `checker.correct(word): boolean`
Үг зөв эсэхийг шалгана.

### `checker.check(word): SpellResult`
Үгийг шалгаж дэлгэрэнгүй үр дүн буцаана.
```ts
interface SpellResult {
  word: string;
  correct: boolean;
  suggestions: string[];
}
```

### `checker.suggest(word): string[]`
Алдаатай үгэнд засвар санал болгоно.

### `checker.checkText(text): TextCheckResult`
Бүтэн текстийг шалгана. Common rules + dictionary check.
```ts
interface TextCheckResult {
  errorCount: number;
  errors: Suggestion[];
  corrected: string;  // Автоматаар засарсан текст
}
```

### `checker.checkHTML(html): TextCheckResult`
HTML контентоос текстийг ялган авч шалгана. Script, style блокуудыг алгасна.

### `checker.addWord(word)` / `checker.addWords(words)`
Dictionary-д шинэ үг нэмнэ.

### `checker.removeWord(word)`
Dictionary-аас үг хасна.

### `checker.wordCount`
Dictionary-д хэдэн root word байгааг буцаана.

### `checker.ready`
Checker амжилттай ачаалагдсан эсэхийг шалгана.

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
// .aff, .dic файлуудыг fetch хийж дамжуулна
const affContent = await fetch('/dict/index.aff').then(r => r.text());
const dicContent = await fetch('/dict/index.dic').then(r => r.text());

const checker = createSpellChecker({
  affContent,
  dicContent,
});

checker.correct('сайн'); // true
```

## Common Rules-ыг тусад нь ашиглах

```js
const { applyCommonRules, COMMON_RULES } = require('mn-spellcheck');

// Зөвхөн common rules ашиглах (dictionary ачаалахгүй — хурдан)
const result = applyCommonRules('Би мэдэхгуй байна');
console.log(result.corrected); // "Би мэдэхгүй байна"
console.log(result.appliedRules); // ["-хгүй нөхцөл нь ү-тэй..."]

// Нийт дүрмийн жагсаалт
console.log(COMMON_RULES.length); // 42
```

## Лиценз / License

MIT

Dictionary files: [LPPL-1.3c](https://www.latex-project.org/lppl.txt) © Batmunkh Dorjgotov
