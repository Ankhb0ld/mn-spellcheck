const { MnSpellChecker, createSpellChecker, applyCommonRules, checkVowelHarmony, COMMON_RULES } = require('../dist/index');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`   ✓ ${message}`);
  } else {
    failed++;
    console.log(`   ✗ FAIL: ${message}`);
  }
}

console.log('═══════════════════════════════════════');
console.log('  mn-spellcheck v1.0.0 — Бүрэн тест');
console.log('═══════════════════════════════════════\n');

// ─── 1. Инициализ ────────────────────────────────
console.log('1. Spell checker үүсгэх:');
const checker = createSpellChecker();
assert(checker instanceof MnSpellChecker, 'createSpellChecker() -> MnSpellChecker instance');
assert(checker.ready === true, 'checker.ready === true');
assert(checker.wordCount > 0, `Dictionary ачаалагдсан (${checker.wordCount} entries)`);

// ─── 2. Зөв үгс ─────────────────────────────────
console.log('\n2. Зөв үгс (correct = true):');
const correctWords = [
  'сайн', 'байна', 'монгол', 'хэл', 'улс', 'хүн',
  'ажил', 'сургууль', 'ном', 'гэр', 'хүмүүс', 'өнөөдөр',
  'өглөө', 'үнэн', 'Монгол', 'МОНГОЛ',
];
for (const word of correctWords) {
  assert(checker.correct(word), `"${word}" -> зөв`);
}

// ─── 3. Латин/тоо алгасах ────────────────────────
console.log('\n3. Латин, тоо алгасах (correct = true):');
const skipWords = ['hello', 'JavaScript', '12345', 'user@email.com', 'https://example.com'];
for (const word of skipWords) {
  assert(checker.correct(word), `"${word}" -> алгассан`);
}

// ─── 4. Алдаатай үгс + suggest ──────────────────
console.log('\n4. Алдаатай үгс + suggestion:');
const wrongWords = [
  { word: 'монгл', expected: 'монгол' },
  { word: 'сургуль', expected: 'сургууль' },
];
for (const { word, expected } of wrongWords) {
  const result = checker.check(word);
  assert(!result.correct, `"${word}" -> алдаатай`);
  assert(
    result.suggestions.includes(expected),
    `"${word}" suggestions-д "${expected}" байна`
  );
}

// ─── 5. Common rules ────────────────────────────
console.log('\n5. Common rules (автомат засвар):');

const ruleTests = [
  { input: 'мэдэхгуй', expected: 'мэдэхгүй', desc: '-хгүй нөхцөл' },
  { input: 'болохгуй', expected: 'болохгүй', desc: '-хгүй нөхцөл' },
  { input: 'хумуус', expected: 'хүмүүс', desc: 'ү/у алдаа' },
  { input: 'онодор', expected: 'өнөөдөр', desc: 'ө/о алдаа' },
  { input: 'оглоо', expected: 'өглөө', desc: 'ө/о алдаа' },
  { input: 'овол', expected: 'өвөл', desc: 'ө/о алдаа' },
  { input: 'угуй', expected: 'үгүй', desc: 'ү/у алдаа' },
  { input: 'одор', expected: 'өдөр', desc: 'ө/о алдаа' },
];

for (const { input, expected, desc } of ruleTests) {
  const result = applyCommonRules(input);
  assert(result.corrected === expected, `"${input}" -> "${expected}" (${desc})`);
}

// ─── 6. checkText ────────────────────────────────
console.log('\n6. checkText (бүтэн текст):');
const text1 = 'Би мэдэхгуй байна ,энэ болохгуй юм.';
const result1 = checker.checkText(text1);
assert(
  result1.corrected === 'Би мэдэхгүй байна, энэ болохгүй юм.',
  'Common rules + цэг таслал засвар'
);

const text2 = 'Монгол улсын нийслэл хотод хумуус олон байна';
const result2 = checker.checkText(text2);
assert(result2.corrected.includes('хүмүүс'), '"хумуус" -> "хүмүүс" бүтэн текстэнд');

// ─── 7. checkHTML ────────────────────────────────
console.log('\n7. checkHTML (HTML текст):');
const html = '<div class="title"><h1>Онодор сайхан одор байна</h1><p>Хумуус маш олон</p></div>';
const htmlResult = checker.checkHTML(html);
assert(htmlResult.corrected.includes('өнөөдөр'), 'HTML-с "Онодор" -> "өнөөдөр"');
assert(htmlResult.corrected.includes('хүмүүс'), 'HTML-с "Хумуус" -> "хүмүүс"');
assert(htmlResult.corrected.includes('өдөр'), 'HTML-с "одор" -> "өдөр"');

const htmlWithScript = '<script>var x = "монгл";</script><p>Сайн байна уу</p>';
const htmlResult2 = checker.checkHTML(htmlWithScript);
assert(htmlResult2.errorCount === 0, 'Script блок доторх текстийг алгассан');

// ─── 8. addWord / removeWord ─────────────────────
console.log('\n8. addWord / removeWord:');
assert(!checker.correct('нэйрлинк'), '"нэйрлинк" -> алдаатай (нэмэхээс өмнө)');
checker.addWord('нэйрлинк');
assert(checker.correct('нэйрлинк'), '"нэйрлинк" -> зөв (нэмсний дараа)');
checker.removeWord('нэйрлинк');
assert(!checker.correct('нэйрлинк'), '"нэйрлинк" -> алдаатай (хассаны дараа)');

checker.addWords(['крипто', 'токен', 'смарт']);
assert(checker.correct('крипто'), 'addWords: "крипто" зөв');
assert(checker.correct('токен'), 'addWords: "токен" зөв');
assert(checker.correct('смарт'), 'addWords: "смарт" зөв');

// ─── 9. Эгшиг зохицох ёс ────────────────────────
console.log('\n9. Эгшиг зохицох ёс:');
assert(checkVowelHarmony('сайхан') === true, '"сайхан" -> зохицсон (эр эгшиг)');
assert(checkVowelHarmony('хүмүүс') === true, '"хүмүүс" -> зохицсон (эм эгшиг)');
assert(checkVowelHarmony('сурагч') === true, '"сурагч" -> зохицсон');

// ─── 10. Тохиргоо ───────────────────────────────
console.log('\n10. Тохиргоо:');
const noRulesChecker = createSpellChecker({ useCommonRules: false });
const noRulesResult = noRulesChecker.checkText('мэдэхгуй');
assert(noRulesResult.corrected !== 'мэдэхгүй' || noRulesResult.corrected === 'мэдэхгуй',
  'useCommonRules: false -> common rules ажиллахгүй');

const customChecker = createSpellChecker({ customWords: ['энтерпрайз'] });
assert(customChecker.correct('энтерпрайз'), 'customWords option ажилласан');

// ─── 11. COMMON_RULES export ────────────────────
console.log('\n11. COMMON_RULES export:');
assert(Array.isArray(COMMON_RULES), 'COMMON_RULES нь array');
assert(COMMON_RULES.length > 20, `COMMON_RULES-д ${COMMON_RULES.length} дүрэм байна`);

// ─── Дүгнэлт ────────────────────────────────────
console.log('\n═══════════════════════════════════════');
console.log(`  Дүн: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
