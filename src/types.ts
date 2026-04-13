/** Нэг үгийн шалгалтын үр дүн */
export interface SpellResult {
  /** Шалгасан үг */
  word: string;
  /** Зөв эсэх */
  correct: boolean;
  /** Санал болгох засварууд */
  suggestions: string[];
}

/** Текст дэх нэг алдааны мэдээлэл */
export interface Suggestion {
  /** Алдаатай үг */
  word: string;
  /** Текст дэх байрлал (index) */
  index: number;
  /** Санал болгох засварууд */
  suggestions: string[];
}

/** Бүтэн текст шалгасны үр дүн */
export interface TextCheckResult {
  /** Нийт алдааны тоо */
  errorCount: number;
  /** Алдаа бүрийн дэлгэрэнгүй мэдээлэл */
  errors: Suggestion[];
  /** Автоматаар засарсан текст (хамгийн эхний suggestion-г ашигласан) */
  corrected: string;
}
