# Changelog

Бүх өөрчлөлтийг энд тэмдэглэнэ. Формат нь [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) стандартыг дагана.

## [1.0.0] - 2026-04-13

### Нэмэгдсэн
- Монгол кирилл бичгийн алдаа шалгагч (spell checker)
- 580,000+ root word dictionary (`dictionary-mn` ашигласан)
- Suffix stripping engine — нөхцөл дагавартай үгсийг шалгах
- Compound word support — нийлмэл үг шалгах
- Common rules — түгээмэл алдааны автомат засвар (ү/у, ө/о, -гүй/-гуй гэх мэт)
- Эгшиг зохицох ёсны шалгалт (vowel harmony)
- REP rules-д суурилсан suggestion engine
- Edit distance 1 ашигласан suggestion
- Бүтэн текст шалгах функц (`checkText`)
- Нэмэлт үг нэмэх/хасах (`addWord`, `removeWord`)
- Browser support (affContent/dicContent шууд дамжуулах)
- TypeScript type definitions
- Латин, тоо зэргийг автоматаар алгасах
