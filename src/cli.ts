#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { MnSpellChecker } from './checker';
import { applyCommonRules } from './rules';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const GRAY = '\x1b[90m';
const RESET = '\x1b[0m';

function printHelp() {
  console.log(`
Usage: mn-spellcheck [command] [options]

Commands:
  check [path]   Алдаатай үгсийг хайж, жагсааж харуулна
  fix [path]     Олдсон алдаануудыг автоматаар засна

Опционууд:
  --ext <exts>   Шалгах файлын өргөтгөлүүд (жишээ: .html,.md,.txt)
                 Үндсэн утга: .html,.tsx,.jsx,.md,.txt
  -h, --help     Тусламж харуулах

Жишээ:
  mn-spellcheck check
  mn-spellcheck check ./src
  mn-spellcheck fix ./pages --ext .html,.txt
`);
}

function getExts(args: string[]): string[] {
  const extIndex = args.findIndex(a => a === '--ext');
  if (extIndex >= 0 && args.length > extIndex + 1) {
    return args[extIndex + 1].split(',').map(e => e.trim());
  }
  return ['.html', '.tsx', '.jsx', '.md', '.txt'];
}

function findFiles(dir: string, exts: string[], fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;

  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    if (exts.some(ext => dir.endsWith(ext))) {
      fileList.push(dir);
    }
    return fileList;
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, exts, fileList);
    } else {
      if (exts.some(ext => file.endsWith(ext))) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

function extractCyrillicWords(text: string) {
  const words: { word: string; index: number; line: number }[] = [];
  const lines = text.split('\n');
  let currentIndex = 0;
  const regex = /[а-яА-ЯөӨүҮёЁ-]+/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match[0].length <= 1) continue; // Ганц үсэг алгасах
      words.push({
        word: match[0],
        index: currentIndex + match.index,
        line: i + 1
      });
    }
    currentIndex += line.length + 1; // +1 for '\n'
  }
  return words;
}

async function runDir(mode: 'check' | 'fix', targetPath: string, exts: string[]) {
  const checker = new MnSpellChecker();
  const files = findFiles(targetPath, exts);

  if (files.length === 0) {
    console.log(`${YELLOW}Шалгах файл олдсонгүй: ${targetPath}${RESET}`);
    return;
  }

  let totalErrors = 0;
  let totalFixed = 0;

  console.log(`${BLUE}Нийт ${files.length} файл шалгаж байна...${RESET}\n`);

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    let fileErrors = 0;
    const fixesMade: string[] = [];

    // Auto-fix common rules first if in FIX mode
    if (mode === 'fix') {
      const ruleResult = applyCommonRules(content);
      if (ruleResult.appliedRules.length > 0) {
        content = ruleResult.corrected;
        fixesMade.push(`Нийтлэг дүрэм засварлагдсан (${ruleResult.appliedRules.length})`);
      }
    }

    const words = extractCyrillicWords(content);
    const errorsToFix: { index: number, length: number, replacement: string }[] = [];

    for (const { word, line, index } of words) {
      // Илүү нарийн шалгалт (Тоо болон латин үсэгтэй үгийг алгасах)
      if (/^[a-zA-Z0-9]+$/.test(word)) continue;
      
      if (!checker.correct(word)) {
        const suggestions = checker.suggest(word);
        fileErrors++;
        totalErrors++;

        if (mode === 'check') {
          const suggStr = suggestions.length > 0 ? suggestions.slice(0, 3).join(', ') : 'Санал олдсонгүй';
          console.log(`  ${GRAY}${file}:${line}${RESET} - ${RED}${word}${RESET} -> ${GREEN}${suggStr}${RESET}`);
        } else if (mode === 'fix' && suggestions.length > 0) {
          // Засах жагсаалтад нэмэх
          errorsToFix.push({
            index,
            length: word.length,
            replacement: suggestions[0]
          });
          fixesMade.push(`${word} -> ${suggestions[0]}`);
          totalFixed++;
        }
      }
    }

    if (mode === 'fix' && (fixesMade.length > 0 || content !== originalContent)) {
      // Ухрах чиглэлд засах (индекс зөрөхөөс сэргийлэх)
      errorsToFix.sort((a, b) => b.index - a.index);
      for (const fix of errorsToFix) {
        content = content.substring(0, fix.index) + fix.replacement + content.substring(fix.index + fix.length);
      }
      
      fs.writeFileSync(file, content, 'utf8');
      console.log(`  ${GREEN}✓ Засагдсан: ${file}${RESET} (${fixesMade.length} алдаа)`);
    } else if (mode === 'check' && fileErrors > 0) {
      console.log(`--> ${file} файлд нийт ${fileErrors} алдаа олдлоо.\n`);
    }
  }

  console.log('\n=======================================');
  if (mode === 'check') {
    if (totalErrors === 0) {
      console.log(`${GREEN}Ямар ч алдаа олдсонгүй. Гайхалтай!${RESET}`);
    } else {
      console.log(`${RED}Нийт ${totalErrors} алдаа олдлоо.${RESET}`);
      console.log(`Автоматаар засахыг хүсвэл: ${BLUE}npx mn-spellcheck fix${RESET}`);
    }
  } else {
    console.log(`${GREEN}Нийт ${totalFixed} алдааг амжилттай засаж хадгаллаа!${RESET}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp();
    return;
  }

  const command = args[0];
  if (command !== 'check' && command !== 'fix') {
    console.log(`${RED}Тодорхойгүй команд: ${command}${RESET}\n`);
    printHelp();
    process.exit(1);
  }

  let targetPath = args[1] && !args[1].startsWith('-') ? args[1] : '.';
  targetPath = path.resolve(targetPath);
  
  const exts = getExts(args);

  await runDir(command as 'check' | 'fix', targetPath, exts);
}

main().catch(err => {
  console.error(`${RED}Алдаа гарлаа:${RESET}`, err);
  process.exit(1);
});
