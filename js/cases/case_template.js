/* ============================================================
   CASE TEMPLATE — KHUÔN MẪU CHUẨN ĐỂ NHÂN BẢN VỤ ÁN MỚI
   Art of Deduction (Nghệ Thuật Suy Luận)
   ============================================================
   HƯỚNG DẪN SỬ DỤNG:
   - Copy file này thành caseXX_[ten_vu_an].js trong thư mục js/cases/
   - Điền đầy đủ thông tin theo các section được đánh số bên dưới.
   - Nhớ đăng ký vụ án mới vào js/cases.js và kiểm tra bằng node test/smoke_test.js.
   ============================================================ */

const CASE_TEMPLATE = {
  // ------------------------------------------------------------
  // THÔNG TIN CƠ BẢN VỤ ÁN (Bắt buộc)
  // ------------------------------------------------------------
  id: 'case_id_slug',                    // [BẮT BUỘC] string, định danh duy nhất (VD: 'blackwood', 'ravenscroft')
  title: 'Tên Vụ Án Đầy Đủ',             // [BẮT BUỘC] string, hiển thị trên thanh tiêu đề & danh sách vụ án
  fileNo: '221B-XX',                     // [BẮT BUỘC] string, số hiệu hồ sơ mật phong cách Victorian
  difficulty: {                          // [BẮT BUỘC] object độ khó hiển thị
    tier: 'easy',                        // 'easy' | 'medium' | 'hard'
    label: 'DỄ',                         // 'DỄ' | 'TRUNG BÌNH' | 'KHÓ'
    emoji: '🟢'                          // '🟢' | '🟡' | '🔴'
  },
  timeBudget: 60,                        // [BẮT BUỘC] integer (phút), tổng quỹ thời gian điều tra
  victim: 'Họ tên, độ tuổi, thân thế và tóm tắt ngắn về nạn nhân.',
  setup: 'Bối cảnh ban đầu của vụ án khi thám tử vừa đặt chân tới hiện trường.',

  // ------------------------------------------------------------
  // 1. Hồ sơ Độ khó & Thông số Thiết kế (Difficulty Profile)
  // ------------------------------------------------------------
  difficultyProfile: {
    suspectCount: 3,                     // Số lượng nghi phạm
    evidenceCount: 12,                    // Số lượng manh mối
    redHerringCount: 2,                  // Số lượng bẫy ngụy biện
    inferenceDepth: 3,                   // Độ sâu suy luận (1-5)
    timelineComplexity: 2,               // Độ phức tạp trục thời gian (1-5)
    ambiguity: 'medium',                 // 'low' | 'medium' | 'high'
    minimumReasoningSteps: 4             // Số bước suy luận tối thiểu để phá án
  },

  difficultyRules: {
    maxHints: 3,                         // Số lượt gợi ý tối đa cho phép (Easy: 3, Med: 2, Hard: 1)
    redHerrings: true,                   // boolean, có áp dụng bẫy manh mối ngụy biện hay không
    inferenceAmbiguity: 'medium',        // 'low' | 'medium' | 'high'
    timelineComplexity: 'medium',        // 'low' | 'medium' | 'high'
    suspectCount: 3                      // integer, tổng số nghi phạm
  },

  // ------------------------------------------------------------
  // 2. Sự thật Khách quan (Ground Truth - Nền tảng thiết kế)
  // ------------------------------------------------------------
  groundTruth: {
    culprit: 'suspect_culprit_id',       // [BẮT BUỘC] ID thủ phạm thực sự
    motive: 'motive_key',                // [BẮT BUỘC] Mã định danh động cơ
    method: 'method_key',                // [BẮT BUỘC] Mã định danh phương thức
    opportunityWindow: 'HH:mm - HH:mm',  // [BẮT BUỘC] Khung giờ gây án
    sequence: [                          // Trình tự diễn biến thực tế của tội ác từ lúc chuẩn bị đến lúc tẩu thoát
      'HH:mm: Thủ phạm đến hiện trường...',
      'HH:mm: Thủ phạm chuẩn bị hung khí/bẫy...',
      'HH:mm: Án mạng xảy ra...',
      'HH:mm: Thủ phạm tẩu thoát...'
    ]
  },

  // ------------------------------------------------------------
  // 3. Yêu cầu Chứng minh 4 Trụ Cột (Proof Requirements: M.O.M.P)
  // ------------------------------------------------------------
  proofRequirements: {
    culprit: 'suspect_culprit_id',
    motive: ['clue_motive_1', 'clue_motive_2'],
    opportunity: ['timeline_event_a', 'timeline_event_b'],
    means: ['clue_weapon_or_tool'],
    method: ['clue_forensic_1', 'clue_forensic_2'],
    presence: ['clue_trace_1', 'clue_trace_2']
  },

  // ------------------------------------------------------------
  // 4. Các Giả Thuyết Cạnh Tranh (Competing Alternative Hypotheses)
  // ------------------------------------------------------------
  competingHypotheses: [
    {
      id: 'hyp_1_accident_or_innocent',
      title: 'Giả thuyết 1: Tai nạn hoặc nghi phạm vô tội A ra tay',
      status: 'eliminated',              // 'eliminated' | 'proven' | 'unproven'
      contradictedBy: ['clue_id_x', 'clue_id_y'],
      explanation: 'Lời giải thích vì sao giả thuyết này bị bác bỏ dựa trên chứng cứ thực tế.'
    },
    {
      id: 'hyp_culprit_proven',
      title: 'Giả thuyết chuẩn: Thủ phạm thực sự lên kế hoạch',
      status: 'proven',
      supportedBy: ['clue_id_1', 'clue_id_2', 'clue_id_3'],
      explanation: 'Chuỗi chứng minh hoàn chỉnh gắn kết 4 trụ cột M.O.M.P.'
    }
  ],

  // ------------------------------------------------------------
  // 5. Mục tiêu điều tra (Objectives)
  // ------------------------------------------------------------
  objective: {
    primary: 'Mục tiêu tối thượng (chỉ đúng thủ phạm, phương thức và động cơ)',
    secondary: [
      'Mục tiêu phụ 1 (khám nghiệm vật lý hiện trường)',
      'Mục tiêu phụ 2 (bóc tách bẫy chứng cứ ngụy biện)',
      'Mục tiêu phụ 3 (xác minh bằng chứng ngoại phạm của người vô tội)'
    ]
  },

  // ------------------------------------------------------------
  // 6. Danh sách nhân vật & Nghi phạm (Suspects & Profiling)
  // ------------------------------------------------------------
  suspects: [
    {
      id: 'suspect_1_id',
      name: 'Họ Tên Nghi Phạm (Vai trò)',
      role: 'Mối quan hệ với nạn nhân hoặc vị trí trong vụ án',
      desc: 'Mô tả ngoại hình, thái độ ban đầu và biểu hiện đáng ngờ.',
      eliminateWith: ['clue_alibi_id'],  // Mảng clueId dùng để minh oan (null nếu là thủ phạm)
      eliminateExplanation: 'Giải thích logic vì sao người này vô tội.',

      // Phân tích logic nghi phạm (Suspect Logic):
      suspectLogic: {
        motive: ['Mô tả động cơ bị nghi ngờ'],
        opportunity: ['Đánh giá khung giờ xuất hiện'],
        means: ['Khả năng tiếp cận hung khí'],
        presence: ['Dấu vết hiện diện tại hiện trường'],
        lies: ['Những điểm nói dối trong lời khai'],
        exculpatoryEvidence: ['clue_alibi_id']
      },

      // Nghệ thuật Đọc vị Holmes (Suspect Profiling):
      observations: [
        {
          id: 'obs_1',
          label: 'Tên chi tiết quan sát',
          detail: 'Mô tả kỹ lưỡng vết tích trên trang phục, bàn tay hoặc cử chỉ.',
          inferences: [
            // confidence: 'high' (+5đ), 'medium' (+2đ), 'low' (+0đ)
            { id: 'inf_1', text: 'Suy luận sâu sắc và chính xác (+5đ)', confidence: 'high' },
            { id: 'inf_2', text: 'Suy luận bề mặt thông thường (+2đ)', confidence: 'medium' },
            { id: 'inf_3', text: 'Suy luận suy đoán thiếu căn cứ (+0đ)', confidence: 'low' }
          ]
        }
      ],

      // Hội thoại thẩm vấn tương tác:
      interrogation: {
        dialogues: [
          {
            id: 'q_1',
            question: 'Nội dung câu hỏi thám tử đặt ra?',
            answer: 'Câu trả lời đầy đủ của nghi phạm.',
            statements: [
              'Mệnh đề 1: sự thật hoặc lời giải thích chung.',
              'Mệnh đề 2: lời nói dối hoặc chi tiết mâu thuẫn.'
            ],
            contradictionStatementIdx: 1, // Index (0-based) của mệnh đề chứa sơ hở nói dối
            contradictionClue: 'clue_id_x', // Manh mối dùng để bẻ gãy lời nói dối (null nếu thật)
            credibilityImpact: -25       // % độ tin cậy bị trừ khi bị bẻ gãy
          }
        ],
        breakdownResponse: 'Lời thú nhận hoặc phản ứng tâm lý khi đối tượng bị vạch trần.'
      }
    }
  ],

  // ------------------------------------------------------------
  // 7. Bằng chứng hiện trường (Evidence: Type, Source, Reliability)
  // ------------------------------------------------------------
  evidence: {
    clue_id_1: {
      label: 'Tên Manh Mối 1',
      key: true,                         // true: manh mối cốt lõi (+10đ), false: manh mối phụ (+5đ)
      decoy: false,                      // true: bẫy đánh lạc hướng (-thời gian, 0đ), false: vật chứng thật
      location: 'location_id_1',         // ID địa điểm phát hiện manh mối này
      cost: 5,                           // Số phút tiêu hao để điều tra
      type: 'physical',                  // 'physical' | 'forensic' | 'document' | 'witness' | 'statement' | 'behavior'
      source: 'location_id_1',           // Nguồn thu thập
      reliability: 'high',               // 'high' | 'medium' | 'low'
      text: 'Mô tả khách quan, khoa học về vật chứng (không spoil trực tiếp kết luận).'
    },
    clue_decoy_example: {
      label: 'Manh Mối Bẫy Đánh Lạc Hướng',
      key: false,
      decoy: true,
      location: 'location_id_1',
      cost: 5,
      type: 'physical',
      source: 'location_id_1',
      reliability: 'medium',
      text: 'Vật dụng bình thường không liên quan đến vụ án.'
    }
  },

  // ------------------------------------------------------------
  // 8. Địa điểm điều tra (Locations)
  // ------------------------------------------------------------
  locations: [
    {
      id: 'location_id_1',
      name: 'Tên Hiện Trường',
      icon: '🌿',
      items: [
        { id: 'clue_id_1', cost: 5 },
        { id: 'clue_decoy_example', cost: 5 }
      ]
    },
    {
      id: 'suspect_1_id',
      name: 'Thẩm vấn Nghi phạm 1',
      icon: '👤',
      items: []
    }
  ],

  // ------------------------------------------------------------
  // 9. Trục thời gian khách quan (Timeline: Observation Events)
  // ------------------------------------------------------------
  timeline: [
    {
      id: 'evt_1',
      time: '08:30',
      event: 'Mô tả sự kiện quan sát khách quan tại mốc giờ này.',
      suspect: 'suspect_1_id',
      victimEvent: false,
      verified: true,
      certainty: 'confirmed',            // 'confirmed' | 'estimated' | 'inferred'
      source: 'witness',                 // 'witness' | 'physical' | 'forensic' | 'statement'
      unlockClue: 'clue_id_1'
    }
  ],

  // ------------------------------------------------------------
  // 10. Cây logic thẩm vấn (Interrogation Tree Logic)
  // ------------------------------------------------------------
  interrogationTree: {
    suspect_1_id: {
      q_1: {
        unlockRequires: ['clue_id_1'],   // Manh mối cần có trong tay để mở khóa câu hỏi này
        contradictionClue: 'clue_id_x',  // Manh mối vạch trần (null nếu không có mâu thuẫn)
        credibilityImpact: -25           // Mức giảm độ tin cậy khi bẻ gãy thành công
      }
    }
  },

  // ------------------------------------------------------------
  // 11. Lâu đài tư duy (Mind Palace Nodes)
  // ------------------------------------------------------------
  mindPalaceNodes: [
    {
      id: 'node_1',
      label: 'Tên mắt xích suy luận',
      reqClues: ['clue_id_1', 'clue_id_2'],
      question: 'Câu hỏi logic kết nối các mảnh ghép?',
      branches: [
        {
          id: 'branch_correct',
          text: 'Nhánh suy luận logic đúng đắn, phản ánh bản chất sự thật.',
          correct: true
        },
        {
          id: 'branch_wrong',
          text: 'Nhánh suy luận sai lầm / bẫy ngụy biện (-10đ, -5 phút).',
          correct: false
        }
      ],
      leadsTo: 'node_2'
    }
  ],

  // ------------------------------------------------------------
  // 12. Bẫy manh mối đánh lạc hướng (Red Herrings)
  // ------------------------------------------------------------
  redHerrings: [
    {
      id: 'rh_1',
      clues: ['clue_decoy_example'],
      explanation: 'Lời giải thích cảnh báo người chơi khi rơi vào bẫy suy luận ngụy biện.'
    }
  ],

  // ------------------------------------------------------------
  // 13. Giả thuyết suy luận (Hypotheses)
  // ------------------------------------------------------------
  hypotheses: [
    {
      id: 'h_1',
      refs: ['clue_id_1', 'clue_id_2'],
      hintVague: 'Gợi ý gián tiếp hướng dẫn suy luận.',
      question: 'Câu hỏi kiểm chứng giả thuyết?',
      options: [
        {
          id: 'a',
          text: 'Lựa chọn suy luận đúng đắn.',
          correct: true,
          evalYes: ['Căn cứ xác thực 1', 'Căn cứ xác thực 2'],
          evalNo: []
        },
        {
          id: 'b',
          text: 'Lựa chọn sai lầm.',
          correct: false,
          evalYes: [],
          evalNo: ['Lý do phủ định 1']
        }
      ]
    }
  ],

  // ------------------------------------------------------------
  // 14. Mạng lưới liên kết trực quan trên Bảng ghim (Clue Relations: 5 Types)
  // ------------------------------------------------------------
  clueRelations: [
    {
      clues: ['clue_id_1', 'clue_id_2'],
      // 5 loại quan hệ logic: 'supports' | 'contradicts' | 'eliminates' | 'explains' | 'corroborates'
      type: 'supports',
      label: 'Mô tả quan hệ logic giữa hai manh mối.',
      question: 'Câu hỏi tổng hợp suy luận khi người chơi nối 2 ghim này (+10đ)?',
      options: [
        { id: 'a', text: 'Đáp án phân tích chính xác mối liên hệ.', correct: true },
        { id: 'b', text: 'Đáp án ngụy biện sai lệch (-2 phút).', correct: false }
      ]
    }
  ],

  // ------------------------------------------------------------
  // 15. Chân tướng vụ án & Lời giải (Ground Truth & Endings)
  // ------------------------------------------------------------
  truth: {
    correctSuspect: 'suspect_1_id',
    accusation: {
      methods: [
        {
          id: 'method_correct',
          text: 'Mô tả đúng phương thức gây án',
          correct: true,
          reqClues: ['clue_id_1'],
          reqHint: 'Gợi ý nếu người chơi chưa tìm đủ manh mối chứng minh cách thức gây án'
        },
        { id: 'method_wrong', text: 'Phương thức sai', correct: false }
      ],
      motives: [
        {
          id: 'motive_correct',
          text: 'Mô tả đúng động cơ gây án',
          correct: true,
          reqClues: ['clue_id_2'],
          reqHint: 'Gợi ý nếu người chơi chưa tìm đủ manh mối chứng minh động cơ'
        },
        { id: 'motive_wrong', text: 'Động cơ sai', correct: false }
      ]
    },
    endings: {
      perfect: {
        badge: 'Kết cục hoàn hảo',
        title: 'Vụ án được phá giải trọn vẹn',
        body: '<p>Nội dung tường thuật chi tiết khi người chơi phá án điểm tuyệt đối.</p>'
      },
      good: {
        badge: 'Đúng người',
        title: 'Kết luận đúng, còn vài khoảng trống',
        body: '<p>Nội dung khi buộc tội đúng thủ phạm nhưng còn thiếu sót vài lập luận phụ.</p>'
      },
      bad: {
        badge: 'Đúng người, sai lập luận',
        title: 'Đoán đúng, nhưng không chứng minh được',
        body: '<p>Nội dung khi đoán đúng thủ phạm nhưng chọn sai phương thức hoặc động cơ.</p>'
      },
      incomplete: {
        badge: 'Hồ sơ còn bỏ ngỏ',
        title: 'Chưa đủ căn cứ để kết luận',
        body: '<p>Nội dung khi hết giờ hoặc thiếu quá nhiều chứng cứ cốt lõi.</p>'
      },
      wrong_method: {
        badge: 'Sai phương thức',
        title: 'Đúng người, sai cách gây án',
        body: '<p>Nội dung khi chỉ đúng thủ phạm nhưng sai phương thức.</p>'
      },
      wrong_motive: {
        badge: 'Sai động cơ',
        title: 'Đúng người, sai nguyên nhân',
        body: '<p>Nội dung khi chỉ đúng thủ phạm nhưng sai động cơ.</p>'
      }
    },
    suspectEndings: {
      innocent_suspect_id: {
        badge: 'Buộc tội sai',
        title: 'Nghi phạm vô tội',
        body: '<p>Nội dung giải thích vì sao nghi phạm này bị oan và thủ phạm thực sự đã tẩu thoát.</p>'
      }
    },
    replaySteps: [
      '"Bước 1: Giám định hiện trường và cơ chế vật lý."',
      '"Bước 2: Phục dựng chuỗi thời gian và bóc tách lời nói dối."',
      '"Bước 3: Tách biệt chứng cứ thật khỏi bẫy ngụy biện."',
      '"Bước 4: Đóng đinh động cơ và chỉ danh thủ phạm thực sự."'
    ],
    replayClues: ['clue_id_1', 'clue_id_2']
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CASE_TEMPLATE;
}
