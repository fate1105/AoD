/* ============================================================
   CASES.JS — Trình nạp Registry tập trung các vụ án
   Mỗi vụ án nằm trong file riêng tại thư mục js/cases/
   ============================================================ */

let CASES = [];

if (typeof module !== 'undefined' && module.exports) {
  // Môi trường Node.js (dùng cho Smoke Test Suite)
  const CASE_BLACKWOOD = require('./cases/case01_blackwood.js');
  const CASE_RAVENSCROFT = require('./cases/case02_ravenscroft.js');
  const CASE_FINAL_MELODY = require('./cases/case03_final_melody.js');
  CASES = [CASE_BLACKWOOD, CASE_RAVENSCROFT, CASE_FINAL_MELODY];
  module.exports = CASES;
} else {
  // Môi trường Trình duyệt: nạp từ các biến toàn cục được import qua thẻ script
  CASES = [
    typeof CASE_BLACKWOOD !== 'undefined' ? CASE_BLACKWOOD : null,
    typeof CASE_RAVENSCROFT !== 'undefined' ? CASE_RAVENSCROFT : null,
    typeof CASE_FINAL_MELODY !== 'undefined' ? CASE_FINAL_MELODY : null,
  ].filter(Boolean);
}
