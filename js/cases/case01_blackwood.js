/* ============================================================
   CASE 01 — DỄ (TUTORIAL: NGHỆ THUẬT SUY LUẬN)
   Cái Chết Tại Biệt Thự Blackwood
   ============================================================ */

const CASE_BLACKWOOD = {
  id: 'blackwood',
  title: 'Cái Chết Tại Biệt Thự Blackwood',
  fileNo: '221B-4',
  difficulty: { tier: 'easy', label: 'DỄ', emoji: '🟢' },
  timeBudget: 85,
  victim: 'Bà Eleanor Blackwood, 70 tuổi, goá phụ giàu có, chủ nhân trang viên hoa hồng Blackwood.',
  setup: 'Bà Eleanor được tìm thấy tử vong dưới chân chiếc thang trong nhà kính hoa hồng. Mọi người đều cho rằng đây là một vụ ngã thang do tai nạn tuổi già. Nhưng một thám tử quan sát sắc bén sẽ nhận ra: chiếc thang không bao giờ gãy theo cách tự nhiên như vậy...',

  // ------------------------------------------------------------
  // 1. Hồ sơ Độ khó & Thông số Thiết kế (Difficulty Profile)
  // ------------------------------------------------------------
  difficultyProfile: {
    suspectCount: 3,
    evidenceCount: 14,
    redHerringCount: 2,
    inferenceDepth: 3,
    timelineComplexity: 2,
    ambiguity: 'low',
    minimumReasoningSteps: 4
  },

  difficultyRules: {
    maxHints: 3,
    redHerrings: true,
    inferenceAmbiguity: 'medium',
    timelineComplexity: 'medium',
    suspectCount: 3
  },

  // ------------------------------------------------------------
  // 2. Sự thật Khách quan (Ground Truth - Nền tảng thiết kế)
  // ------------------------------------------------------------
  groundTruth: {
    culprit: 'son',
    motive: 'inheritance_cutoff',
    method: 'premeditated_ladder_sabotage',
    opportunityWindow: '09:20 - 09:35',
    sequence: [
      '09:15: Edward đến biệt thự bằng xe hơi.',
      '09:20: Edward lên phòng làm việc, phát hiện ghi chú đổi di chúc vào 10:00 sáng thứ Hai.',
      '09:25 - 09:32: Edward lẻn vào xưởng sau lấy cưa xếp, cưa đứt 85% bậc thang gỗ thông trong nhà kính.',
      '09:35: Bà Eleanor vào nhà kính tỉa hoa hồng, bước lên bậc thang chịu lực.',
      '09:40: Bậc thang gãy sập dưới tải trọng, bà Eleanor ngã tử vong.',
      '09:45: Edward tháo chạy qua cửa sau nhà kính, vạt áo len Cashmere rách ở bụi gai hồng.'
    ]
  },

  // ------------------------------------------------------------
  // 3. Yêu cầu Chứng minh 4 Trụ Cột (Proof Requirements: M.O.M.P)
  // ------------------------------------------------------------
  proofRequirements: {
    culprit: 'son',
    motive: ['note', 'fabric'],
    opportunity: ['evt_son_office', 'evt_victim_greenhouse'],
    means: ['pine_pocket_saw'],
    method: ['ladder_physics', 'pine_pocket_saw'],
    presence: ['fabric', 'footprints']
  },

  // ------------------------------------------------------------
  // 4. Các Giả Thuyết Cạnh Tranh (Competing Alternative Hypotheses)
  // ------------------------------------------------------------
  competingHypotheses: [
    {
      id: 'hyp_accident',
      title: 'Tai nạn ngã thang tự nhiên do tuổi già',
      status: 'eliminated',
      contradictedBy: ['ladder_physics', 'footprints'],
      explanation: 'Vết cắt phẳng phiu 85% tiết diện chịu lực và mạt cưa đè lên bụi cũ chứng minh bậc thang đã bị cưa ngầm có chủ đích.'
    },
    {
      id: 'hyp_wilson',
      title: 'Quản gia Wilson mưu sát do sợ bị sa thải',
      status: 'eliminated',
      contradictedBy: ['wilson_secret_letter', 'study_lavender_scent'],
      explanation: 'Bà Wilson chỉ lén lên phòng làm việc lấy cắp bức thư sa thải cá nhân; đôi dép vải hoàn toàn sạch và không có kết nối vật lý với nhà kính.'
    },
    {
      id: 'hyp_gardener',
      title: 'Người làm vườn Thomas sửa dở hoặc gài bẫy',
      status: 'eliminated',
      contradictedBy: ['gardener_alibi'],
      explanation: 'Khoảng cách 4 dặm từ chợ phiên thị trấn và hóa đơn lúc 09:05 loại trừ khả năng ông có mặt tại nhà kính lúc 09:20 - 09:35; đế ủng cao su khác biệt hoàn toàn với dấu giày quả trám.'
    },
    {
      id: 'hyp_thief',
      title: 'Kẻ trộm lạ mặt đột nhập',
      status: 'eliminated',
      contradictedBy: ['note', 'fabric'],
      explanation: 'Không có tài sản nào bị mất trong phòng làm việc và mẩu vải rách là chất liệu len Cashmere đắt tiền chỉ người thừa kế mới mặc.'
    },
    {
      id: 'hyp_son_murder',
      title: 'Con trai Edward cưa thang tạo bẫy sập',
      status: 'proven',
      supportedBy: ['ladder_physics', 'pine_pocket_saw', 'note', 'fabric', 'footprints'],
      explanation: 'Bị dồn vào chân tường bởi nợ cờ bạc và hạn chót di chúc thứ Hai, Edward lợi dụng khung giờ 09:20 - 09:35 dùng cưa xếp cưa thang rồi tháo chạy qua bụi gai.'
    }
  ],

  // ------------------------------------------------------------
  // 5. Mục tiêu điều tra (Objectives)
  // ------------------------------------------------------------
  objective: {
    primary: 'Chứng minh cái chết không phải tai nạn và chỉ đích danh kẻ thủ ác thực sự',
    secondary: [
      'Khám nghiệm vật lý để xác thực chiếc thang bị cưa trước hay sau khi ngã',
      'Phân biệt mùn cưa gỗ thông (hiện trường) và mùn cưa gỗ sồi (hòm tiền)',
      'Làm rõ bí mật của Quản gia và chứng cứ ngoại phạm của Người làm vườn'
    ]
  },

  // ------------------------------------------------------------
  // 6. Danh sách nhân vật & Nghi phạm (Suspects & Profiling)
  // ------------------------------------------------------------
  suspects: [
    {
      id: 'gardener',
      name: 'Thomas Green (Người làm vườn)',
      role: 'Người chăm sóc hoa viên 20 năm',
      desc: 'Nắm giữ chìa khóa nhà kính, phụ trách đồ mộc sân vườn — nhưng có 3 chủ tiệm ở chợ phiên làm chứng ngoại phạm.',
      eliminateWith: ['gardener_alibi'],
      eliminateExplanation: 'Hóa đơn mua hàng lúc 09:05 tại chợ phiên cách biệt thự 4 dặm cùng lời khai của 3 chủ tiệm xác nhận ông không thể có mặt tại nhà kính trong khung giờ án mạng 09:20 - 09:40.',

      suspectLogic: {
        motive: ['Từng tranh cãi gay gắt với bà chủ về việc thay mới chiếc thang mục'],
        opportunity: ['Vắng mặt khỏi trang viên, nhưng alibi chợ phiên cách 4 dặm loại trừ khung giờ 09:20 - 09:40'],
        means: ['Nắm chìa khóa xưởng mộc và am hiểu đồ gỗ sân vườn'],
        presence: ['Không có dấu vết hiện diện (đế ủng cao su lượn sóng khác hẳn dấu giày quả trám)'],
        lies: [],
        exculpatoryEvidence: ['gardener_alibi']
      },

      observations: [
        {
          id: 'gardener_hands',
          label: 'Bàn tay chai sạn & kẽ móng',
          detail: 'Bàn tay thô ráp chai sần do cầm kéo tỉa cành lâu năm, kẽ móng bám đất mùn ẩm của vườn hoa hồng, không hề có chút mạt cưa gỗ thông mới nào.',
          inferences: [
            { id: 'gardening_only', text: 'Chai sần đặc trưng của việc dùng kéo tỉa cành và đất mùn ẩm; hoàn toàn không có mạt cưa gỗ thông mới', confidence: 'high' },
            { id: 'woodcut_possible', text: 'Người làm vườn có thể đã dùng cưa từ hôm trước và đã rửa sạch tay', confidence: 'medium' },
            { id: 'washed_traces', text: 'Đã cố tình ngâm rửa xà phòng để tẩy sạch vết tích trước khi gặp cảnh sát', confidence: 'low' }
          ]
        },
        {
          id: 'gardener_boots',
          label: 'Ủng cao su làm vườn',
          detail: 'Ủng cao su đúc hoa văn lượn sóng tròn đã mòn vẹt, bám đất vườn trước, rãnh đế trơn nhẵn khác hẳn vân đế giày da quả trám ở hiện trường.',
          inferences: [
            { id: 'different_tread', text: 'Đế ủng cao su hoa văn lượn sóng tròn mòn vẹt — không thể tạo ra vết đế giày da quả trám sắc nét ở hiện trường', confidence: 'high' },
            { id: 'changed_shoes', text: 'Có thể ông ta đã đi một đôi giày da khác khi gây án rồi giấu đi trước khi ra chợ', confidence: 'medium' },
            { id: 'same_tread', text: 'Bùn đất trên ủng chứng minh ông ta vừa ở trong nhà kính', confidence: 'low' }
          ]
        }
      ],

      interrogation: {
        dialogues: [
          {
            id: 'q_g_alibi',
            question: 'Sáng nay ông đã ở đâu trong khoảng thời gian bà Blackwood gặp nạn?',
            answer: 'Tôi đã rời trang viên từ lúc 8h30 sáng để ra chợ phiên thị trấn mua phân bón và hạt giống hoa. Tôi có hóa đơn lúc 9h05 và các chủ sạp quen có thể làm chứng!',
            statements: [
              'Tôi đã rời trang viên từ lúc 8h30 sáng để ra chợ phiên thị trấn mua phân bón và hạt giống hoa.',
              'Tôi có hóa đơn lúc 9h05 và các chủ sạp quen có thể làm chứng!'
            ],
            contradictionClue: null
          },
          {
            id: 'q_g_ladder',
            question: 'Chiếc thang trong nhà kính do ai quản lý và bảo dưỡng?',
            answer: 'Chiếc thang gỗ đó bằng gỗ thông già, dùng cả chục năm nay. Tôi từng nhắc bà chủ cần thay mới, nhưng bà ấy bảo vẫn còn chắc chắn. Tôi không hề cưa phá bậc thang!',
            statements: [
              'Chiếc thang gỗ đó bằng gỗ thông già, dùng cả chục năm nay.',
              'Tôi từng nhắc bà chủ cần thay mới, nhưng bà ấy bảo vẫn còn chắc chắn. Tôi không hề cưa phá bậc thang!'
            ],
            contradictionClue: null
          }
        ],
        breakdownResponse: 'Ông người làm vườn bình tĩnh và thành thật: "Tôi làm việc cho gia đình này 20 năm rồi, tôi coi bà chủ như người thân!"'
      }
    },
    {
      id: 'housekeeper',
      name: 'Bà Wilson (Quản gia)',
      role: 'Quản gia phụ trách việc nhà và thư từ',
      desc: 'Quản lý chìa khóa các phòng trong biệt thự, có biểu hiện lúng túng khi nhắc đến phòng làm việc của bà chủ.',
      eliminateWith: ['wilson_secret_letter'],
      eliminateExplanation: 'Bà Wilson lén vào phòng làm việc lúc 09:00 chỉ để lấy cắp bức thư sa thải bà ta đã bị bà Blackwood soạn sẵn. Bà ta hoàn toàn không hề bước chân ra khu nhà kính.',

      suspectLogic: {
        motive: ['Sợ bị đuổi việc khi biết tin bà chủ đã soạn thư sa thải'],
        opportunity: ['Có mặt trong biệt thự suốt buổi sáng, nhưng chỉ ở khu bếp và phòng làm việc'],
        means: ['Không có công cụ cưa gỗ, không có liên hệ với xưởng sau'],
        presence: ['Đôi dép nỉ sạch bóng chứng minh không hề bước ra nền đất ẩm nhà kính'],
        lies: ['Nói dối không hề lên phòng làm việc tầng 2'],
        exculpatoryEvidence: ['wilson_secret_letter']
      },

      observations: [
        {
          id: 'wilson_apron',
          label: 'Tạp dề & mùi hương oải hương',
          detail: 'Tạp dề vải thô có vết cộm ở túi trong, tay áo thoang thoảng mùi xà phòng sáp hoa oải hương — loại sáp dùng để lau bàn trong phòng làm việc của bà Eleanor.',
          inferences: [
            { id: 'study_contact', text: 'Bà Wilson vừa tiếp xúc hoặc lục lọi bàn làm việc tầng 2 gần đây dù khẳng định cả sáng ở dưới bếp', confidence: 'high' },
            { id: 'kitchen_duty', text: 'Mùi hương từ việc giặt giũ ga trải giường thông thường', confidence: 'low' }
          ]
        },
        {
          id: 'wilson_slippers',
          label: 'Dép vải đi trong nhà',
          detail: 'Đôi dép vải mềm sạch sẽ, đế lót nỉ không dính một hạt đất cát nào của khu vườn hay nhà kính.',
          inferences: [
            { id: 'indoor_only', text: 'Bà Wilson hoàn toàn ở trong nhà, không hề bước chân ra bãi đất ẩm của nhà kính', confidence: 'high' },
            { id: 'cleaned_shoes', text: 'Có thể đã lau sạch dép trước khi cảnh sát đến', confidence: 'low' }
          ]
        }
      ],

      interrogation: {
        dialogues: [
          {
            id: 'q_w_morning',
            question: 'Sáng nay bà làm những công việc gì trong biệt thự?',
            answer: 'Tôi ở suốt dưới bếp chuẩn bị bữa trưa và ủi đồ từ 8h30 đến tận khi nghe tiếng hô hoán. Tôi tuyệt đối không hề bước lên tầng 2 hay ra ngoài vườn!',
            statements: [
              'Tôi ở suốt dưới bếp chuẩn bị bữa trưa và ủi đồ từ 8h30 đến tận khi nghe tiếng hô hoán.',
              'Tôi tuyệt đối không hề bước lên tầng 2 hay ra ngoài vườn!'
            ],
            contradictionStatementIdx: 1,
            contradictionClue: 'study_lavender_scent',
            credibilityImpact: -25
          },
          {
            id: 'q_w_will',
            question: 'Bà có biết gì về việc bà Blackwood định thay đổi di chúc hay thư từ gần đây không?',
            answer: 'Bà chủ rất kín tiếng chuyện tiền bạc, tôi chỉ là người hầu kẻ hạ. Tôi làm sao dám tò mò vào ngăn kéo bàn làm việc của bà ấy!',
            statements: [
              'Bà chủ rất kín tiếng chuyện tiền bạc, tôi chỉ là người hầu kẻ hạ.',
              'Tôi làm sao dám tò mò vào ngăn kéo bàn làm việc của bà ấy!'
            ],
            contradictionStatementIdx: 1,
            contradictionClue: 'wilson_secret_letter',
            credibilityImpact: -30
          }
        ],
        breakdownResponse: 'Bà Wilson bật khóc nức nở: "Tôi xin thề! Tôi chỉ lén lên bàn làm việc lấy lá thư bà ấy định đuổi việc tôi... Tôi không hề giết bà chủ!"'
      }
    },
    {
      id: 'son',
      name: 'Edward Blackwood (Con trai)',
      role: 'Người thừa kế duy nhất',
      desc: 'Đang ngập trong nợ nần cờ bạc, thừa nhận có ghé qua biệt thự sáng đó nhưng chối bỏ việc ra nhà kính.',
      eliminateWith: null,

      suspectLogic: {
        motive: ['Sắp bị gạch tên khỏi di chúc thừa kế vào sáng thứ Hai do nợ nần cờ bạc'],
        opportunity: ['Có mặt tại biệt thự lúc 09:15, khung giờ 09:20 - 09:35 hoàn toàn không có ai làm chứng'],
        means: ['Tiếp cận xưởng mộc lấy cưa xếp mini, dính dăm gỗ thông ở kẽ móng tay'],
        presence: ['Mảnh áo len Cashmere rách ở bụi gai cửa sau + Dấu giày da quả trám cỡ 42'],
        lies: ['Khai áo len bị trộm tuần trước, chối bỏ việc ra nhà kính'],
        exculpatoryEvidence: []
      },

      observations: [
        {
          id: 'jacket_tear',
          label: 'Vạt áo khoác len màu xám',
          detail: 'Vạt áo khoác len xám cashmere đắt tiền bị rách tưa một vệt dài ở hông phải, sợi len tưa còn mới tinh, dính chút nhựa cây hoa hồng.',
          inferences: [
            { id: 'fresh_rose_tear', text: 'Vết rách mới toanh ở hông phải, sợi len tơ xơ dính mủ cây — khớp hoàn hảo với chiều cao bụi gai hồng lối thoát hiểm', confidence: 'high' },
            { id: 'car_door_hook', text: 'Bị mắc vào móc khóa cửa xe khi kẻ trộm cạy xe tuần trước như lời anh ta phân trần', confidence: 'medium' },
            { id: 'old_wear', text: 'Vết rách cũ do va quẹt thông thường qua nhiều ngày', confidence: 'low' }
          ]
        },
        {
          id: 'sawdust_cuffs',
          label: 'Cổ tay áo & vết mùn cưa',
          detail: 'Mép cổ tay áo có dính vệt bột mùn cưa gỗ sồi đậm màu (Oak) do cạy hòm tiền cũ ở xưởng sau, nhưng kẽ móng tay trỏ lại dính mạt gỗ thông vàng (Pine) bám nhựa tươi.',
          inferences: [
            { id: 'pine_sawing_secret', text: 'Vết mùn gỗ sồi ngoài áo là từ hòm tiền cũ, nhưng mạt gỗ thông bám nhựa ở móng tay chứng minh đã cưa thang gỗ thông', confidence: 'high' },
            { id: 'oak_woodwork_only', text: 'Chỉ cưa hòm gỗ sồi ở xưởng sau, không liên quan đến chiếc thang', confidence: 'medium' },
            { id: 'dust_only', text: 'Bụi bặm thông thường trong phòng làm việc', confidence: 'low' }
          ]
        }
      ],

      interrogation: {
        dialogues: [
          {
            id: 'q_s_visit',
            question: 'Sáng nay anh đến biệt thự làm gì và đã đi những đâu?',
            answer: 'Tôi chỉ ghé qua lấy vài tài liệu cũ ở phòng làm việc lúc 9h15 rồi đi ngay. Tôi hoàn toàn không hề bước chân ra vườn hoa hay nhà kính!',
            statements: [
              'Tôi chỉ ghé qua lấy vài tài liệu cũ ở phòng làm việc lúc 9h15 rồi đi ngay.',
              'Tôi hoàn toàn không hề bước chân ra vườn hoa hay nhà kính!'
            ],
            contradictionStatementIdx: 1,
            contradictionClue: 'fabric',
            credibilityImpact: -30,
            revealClueId: 'son_contradiction'
          },
          {
            id: 'q_s_will',
            question: 'Mối quan hệ giữa anh và mẹ anh gần đây thế nào?',
            answer: 'Mẹ con tôi rất hòa thuận. Bà ấy luôn yêu thương tôi và chuẩn bị để lại toàn bộ gia tài cho tôi thừa kế.',
            statements: [
              'Mẹ con tôi rất hòa thuận.',
              'Bà ấy luôn yêu thương tôi và chuẩn bị để lại toàn bộ gia tài cho tôi thừa kế.'
            ],
            contradictionStatementIdx: 1,
            contradictionClue: 'note',
            credibilityImpact: -20
          },
          {
            id: 'q_s_ladder',
            question: 'Anh có nhận xét gì về việc chiếc thang nhà kính bị cưa đứt?',
            answer: 'Mẹ tôi luôn keo kiệt trong việc sửa chữa nhà cửa. Chiếc thang cũ tự gãy là chuyện tất yếu, sao lại đổ cho tôi?',
            statements: [
              'Mẹ tôi luôn keo kiệt trong việc sửa chữa nhà cửa.',
              'Chiếc thang cũ tự gãy là chuyện tất yếu, sao lại đổ cho tôi?'
            ],
            contradictionStatementIdx: 1,
            contradictionClue: 'ladder_physics',
            credibilityImpact: -35
          }
        ],
        breakdownResponse: 'Edward tái mét mặt mày, run rẩy khuỵu xuống: "Được rồi... tôi đã cưa chiếc thang đó! Thứ Hai bà ấy sẽ gạch tên tôi khỏi di chúc... Tôi không còn đường lùi nào khác!"'
      }
    }
  ],

  // ------------------------------------------------------------
  // 7. Bằng chứng hiện trường (Evidence: Type, Source, Reliability)
  // ------------------------------------------------------------
  evidence: {
    ladder: {
      label: 'Chiếc thang gỗ thông bị gãy',
      key: true,
      decoy: false,
      location: 'greenhouse',
      cost: 5,
      type: 'physical',
      source: 'greenhouse',
      reliability: 'high',
      text: 'Chiếc thang làm bằng gỗ thông (Pine) gồm 6 bậc. Bậc thứ 3 bị gãy rời làm đôi, hai đầu mộng chịu lực nằm ngay dưới chân thi thể nạn nhân.'
    },
    ladder_physics: {
      label: 'Giám định mặt cắt bậc thang',
      key: true,
      decoy: false,
      location: 'greenhouse',
      cost: 5,
      type: 'forensic',
      source: 'greenhouse',
      reliability: 'high',
      text: 'Mặt cắt ngang phẳng phiu tới 85% tiết diện chịu lực, 15% còn lại bị xé toạc dạng thớ gãy giòn do lực ép đột ngột từ trên xuống. Lớp mạt cưa gỗ thông vàng tươi nằm phủ đè lên bề mặt lớp bụi đất cũ bám trên thanh giằng.'
    },
    footprints: {
      label: 'Dấu giày da quả trám',
      key: true,
      decoy: false,
      location: 'greenhouse',
      cost: 5,
      type: 'physical',
      source: 'greenhouse',
      reliability: 'high',
      text: 'Dấu đế giày da nam gót vuông (cỡ 42) có vân quả trám in sâu phần gót trên nền đất ẩm gần bệ hoa vỡ, khoảng cách giữa các bước chân xa bất thường (~110cm) hướng một chiều ra phía cửa thoát hiểm.'
    },
    decoy_pots: {
      label: 'Kiểm tra các chậu hồng',
      key: false,
      decoy: true,
      location: 'greenhouse',
      cost: 5,
      type: 'physical',
      source: 'greenhouse',
      reliability: 'medium',
      text: 'Những chậu hồng leo giống Damask bình thường, đất ẩm đều, không có dấu vết đồ vật bị giấu bên dưới.'
    },
    note: {
      label: 'Mẩu giấy đổi di chúc thứ Hai',
      key: true,
      decoy: false,
      location: 'study',
      cost: 5,
      type: 'document',
      source: 'study',
      reliability: 'high',
      text: 'Bản thảo ghi chú viết tay của bà Eleanor trong ngăn kéo: "...hẹn luật sư lúc 10h sáng thứ Hai để hoàn tất thủ tục loại tên Edward khỏi di chúc thừa kế sau vụ nợ cờ bạc tuần trước..."'
    },
    study_lavender_scent: {
      label: 'Mùi sáp oải hương & ngăn kéo bị lục',
      key: false,
      decoy: false,
      location: 'study',
      cost: 5,
      type: 'forensic',
      source: 'study',
      reliability: 'high',
      text: 'Ngăn kéo bàn làm việc có dấu vân tay dính sáp hoa oải hương mới tinh — loại xà phòng sáp đặc trưng của Quản gia Wilson.'
    },
    wilson_secret_letter: {
      label: 'Bức thư bị giấu trong tạp dề',
      key: false,
      decoy: false,
      location: 'kitchen',
      cost: 5,
      type: 'document',
      source: 'kitchen',
      reliability: 'high',
      text: 'Bức thư thông báo sa thải Quản gia Wilson do bà Blackwood ký sẵn, bị vo tròn giấu trong túi tạp dề dưới bếp. Bà Wilson khai nhận lén lên phòng lấy trộm bức thư này lúc 09:00.'
    },
    decoy_letters: {
      label: 'Thư từ cũ của biệt thự',
      key: false,
      decoy: true,
      location: 'study',
      cost: 5,
      type: 'document',
      source: 'study',
      reliability: 'low',
      text: 'Toàn thư mời tiệc trà và hoá đơn cắt cỏ từ nhiều năm trước.'
    },
    fabric: {
      label: 'Mảnh vải len xám Cashmere',
      key: true,
      decoy: false,
      location: 'garden',
      cost: 5,
      type: 'physical',
      source: 'garden',
      reliability: 'high',
      text: 'Một mảnh vải len dệt vân chéo màu xám tro, chất liệu Cashmere đắt tiền mắc trên gai hồng cạnh then cài cửa sau nhà kính ở độ cao 80cm, sợi len còn tơ xơ dính mủ cây tươi.'
    },
    oak_sawdust_box: {
      label: 'Hòm tiền gỗ sồi ở xưởng sau',
      key: false,
      decoy: true,
      location: 'workshop',
      cost: 5,
      type: 'physical',
      source: 'workshop',
      reliability: 'high',
      text: 'Chiếc hòm gỗ sồi (Oak) sẫm màu trong xưởng có ổ khóa bị cưa gãy, tạo ra các hạt mùn cưa gỗ sồi thô sẫm màu vương vãi trên nắp hòm.'
    },
    pine_pocket_saw: {
      label: 'Chiếc cưa xếp mini ở xưởng sau',
      key: true,
      decoy: false,
      location: 'workshop',
      cost: 5,
      type: 'physical',
      source: 'workshop',
      reliability: 'high',
      text: 'Một chiếc cưa xếp mini giấu sau đống bao tải trong xưởng mộc, bước răng cưa nhỏ 1.5mm, kẽ răng còn bám dăm gỗ mềm màu vàng nhạt và vệt nhựa cây thông chưa khô hẳn.'
    },
    gardener_alibi: {
      label: 'Lời khai ngoại phạm Người làm vườn',
      key: false,
      decoy: false,
      location: 'gardener',
      cost: 10,
      type: 'witness',
      source: 'gardener',
      reliability: 'high',
      text: 'Hóa đơn thanh toán hạt giống lúc 09:05 tại chợ phiên thị trấn (cách biệt thự 4 dặm) cùng lời khai xác nhận của 3 chủ sạp quen mặt suốt từ 08:30 đến 11:00.',
      expiresAt: 25,
      expireWarning: 'Người làm vườn sắp đi chợ phiên lần hai, không thể hỏi thêm sau đó.'
    },
    son_motive: {
      label: 'Lời khai con trai',
      key: false,
      decoy: false,
      location: 'son',
      cost: 10,
      type: 'statement',
      source: 'son',
      reliability: 'medium',
      text: 'Con trai bà thừa nhận có ghé qua biệt thự sáng đó "chỉ để lấy vài tài liệu cũ", nhưng không giải thích được vì sao áo khoác của anh ta bị rách.'
    },
    son_contradiction: {
      label: 'Mâu thuẫn lời khai con trai',
      key: true,
      decoy: false,
      location: null,
      source: 'confrontation',
      type: 'behavior',
      reliability: 'high',
      text: 'Khi bị hỏi về mảnh vải, con trai khai áo khoác bị đánh cắp khỏi xe — nhưng không có báo cáo mất trộm nào được ghi nhận với cảnh sát.'
    }
  },

  // ------------------------------------------------------------
  // 8. Địa điểm điều tra (Locations)
  // ------------------------------------------------------------
  locations: [
    { id: 'greenhouse', name: 'Nhà kính — hiện trường', icon: '🌿', items: [{ id: 'ladder', cost: 5 }, { id: 'ladder_physics', cost: 5 }, { id: 'footprints', cost: 5 }, { id: 'decoy_pots', cost: 5 }] },
    { id: 'study', name: 'Phòng làm việc', icon: '✒️', items: [{ id: 'note', cost: 5 }, { id: 'study_lavender_scent', cost: 5 }, { id: 'decoy_letters', cost: 5 }] },
    { id: 'garden', name: 'Vườn sau & Lối thoát hiểm', icon: '🌱', items: [{ id: 'fabric', cost: 5 }] },
    { id: 'workshop', name: 'Xưởng gỗ phía sau', icon: '🪚', items: [{ id: 'oak_sawdust_box', cost: 5 }, { id: 'pine_pocket_saw', cost: 5 }] },
    { id: 'kitchen', name: 'Gian bếp & Khu quản gia', icon: '☕', items: [{ id: 'wilson_secret_letter', cost: 5 }] },
    { id: 'gardener', name: 'Thẩm vấn Người làm vườn (Thomas)', icon: '👤', items: [{ id: 'gardener_alibi', cost: 10 }] },
    { id: 'housekeeper', name: 'Thẩm vấn Quản gia (Bà Wilson)', icon: '👤', items: [] },
    { id: 'son', name: 'Thẩm vấn Con trai (Edward)', icon: '👤', items: [{ id: 'son_motive', cost: 10 }] }
  ],

  // ------------------------------------------------------------
  // 9. Trục thời gian khách quan (Timeline: Observation Events)
  // ------------------------------------------------------------
  timeline: [
    {
      id: 'evt_gardener_market',
      time: '08:30',
      event: 'Người làm vườn Thomas rời trang viên bằng xe kéo tay hướng ra chợ phiên thị trấn',
      suspect: 'gardener',
      verified: true,
      certainty: 'confirmed',
      source: 'witness',
      unlockClue: 'gardener_alibi'
    },
    {
      id: 'evt_wilson_kitchen',
      time: '09:00',
      event: 'Quản gia Wilson mang đồ giặt và chuẩn bị bữa trưa dưới tầng bếp biệt thự',
      suspect: 'housekeeper',
      verified: true,
      certainty: 'confirmed',
      source: 'witness',
      unlockClue: 'wilson_secret_letter'
    },
    {
      id: 'evt_son_arrive',
      time: '09:15',
      event: 'Chiếc xe hơi của Edward Blackwood tiến vào cổng trước biệt thự',
      suspect: 'son',
      verified: true,
      certainty: 'confirmed',
      source: 'witness',
      unlockClue: 'son_motive'
    },
    {
      id: 'evt_son_office',
      time: '09:20',
      event: 'Edward lên phòng làm việc tầng 2 tìm mẹ nhưng phòng trống',
      suspect: 'son',
      verified: false,
      certainty: 'inferred',
      source: 'statement',
      unlockClue: 'note'
    },
    {
      id: 'evt_workshop_sound',
      time: '09:28',
      event: 'Có tiếng mở chốt cửa xưởng mộc và bước chân di chuyển quanh lối hoa viên',
      suspect: 'son',
      verified: false,
      certainty: 'estimated',
      source: 'physical',
      unlockClue: 'ladder_physics'
    },
    {
      id: 'evt_victim_greenhouse',
      time: '09:35',
      event: 'Bà Eleanor cầm kéo tỉa cành tiến vào khu nhà kính hoa hồng và bước lên chiếc thang',
      victimEvent: true,
      verified: true,
      certainty: 'confirmed',
      source: 'witness'
    },
    {
      id: 'evt_ladder_collapse',
      time: '09:40',
      event: 'Tiếng động cơ học lớn vang lên từ nhà kính (Bậc thang gãy sập, bà Eleanor ngã tử vong)',
      victimEvent: true,
      verified: true,
      certainty: 'confirmed',
      source: 'forensic'
    },
    {
      id: 'evt_son_flee_gate',
      time: '09:45',
      event: 'Có bóng người vội vã mở chốt cửa sau nhà kính tháo chạy qua lối vườn sau',
      suspect: 'son',
      verified: false,
      certainty: 'inferred',
      source: 'physical',
      unlockClue: 'fabric'
    }
  ],

  // ------------------------------------------------------------
  // 10. Cây logic thẩm vấn (Interrogation Tree Logic)
  // ------------------------------------------------------------
  interrogationTree: {
    gardener: {
      q_g_alibi: { unlockRequires: [], contradictionClue: null },
      q_g_ladder: { unlockRequires: ['ladder'], contradictionClue: null }
    },
    housekeeper: {
      q_w_morning: { unlockRequires: [], contradictionClue: 'study_lavender_scent', credibilityImpact: -25 },
      q_w_will: { unlockRequires: ['wilson_secret_letter'], contradictionClue: 'wilson_secret_letter', credibilityImpact: -30 }
    },
    son: {
      q_s_visit: { unlockRequires: [], contradictionClue: 'fabric', credibilityImpact: -30, revealClueId: 'son_contradiction' },
      q_s_will: { unlockRequires: ['note'], contradictionClue: 'note', credibilityImpact: -20 },
      q_s_ladder: { unlockRequires: ['ladder_physics'], contradictionClue: 'ladder_physics', credibilityImpact: -35 }
    }
  },

  // ------------------------------------------------------------
  // 11. Lâu đài tư duy (Mind Palace Nodes)
  // ------------------------------------------------------------
  mindPalaceNodes: [
    {
      id: 'node_ladder_physics',
      label: 'Cơ chế vật lý chiếc thang',
      reqClues: ['ladder', 'ladder_physics'],
      question: 'Lớp mạt cưa gỗ thông đè lên bụi đất cũ và vết cắt phẳng 85% tiết diện chịu lực chứng minh điều gì?',
      branches: [
        {
          id: 'sabotage_premeditated',
          text: 'Mưu sát bằng bẫy tải trọng: Bậc thang đã bị cưa ngầm trước án mạng, tính toán để chỉ gãy sập khi nạn nhân dồn toàn bộ trọng lượng lên tỉa cây.',
          correct: true
        },
        {
          id: 'gardener_unfished_repair',
          text: 'Tai nạn do sửa chữa dở dang (Bẫy Người làm vườn): Người làm vườn cưa bậc thang mục để thay gỗ mới nhưng quên cảnh báo, nạn nhân vô tình bước lên.',
          correct: false
        },
        {
          id: 'post_murder_coverup',
          text: 'Ngụy tạo hiện trường sau xô ngã: Nạn nhân bị xô ngã từ trước, sau đó hung thủ mới dùng cưa để tạo hiện trường giả chiếc thang tự gãy.',
          correct: false
        }
      ],
      leadsTo: 'node_sawdust_discrimination'
    },
    {
      id: 'node_sawdust_discrimination',
      label: 'Bản chất của các vết mùn cưa',
      reqClues: ['oak_sawdust_box', 'pine_pocket_saw'],
      question: 'Phân tích hai loại mùn cưa: Mùn gỗ sồi (Oak) trên tay áo con trai và mạt gỗ thông (Pine) dính trên chiếc cưa xếp giấu sau xưởng:',
      branches: [
        {
          id: 'distinguish_redherring',
          text: 'Tách biệt chứng cứ thật & bẫy ngụy biện: Mùn gỗ sồi trên tay áo là do cạy hòm tiền cũ (động cơ tài chính); chiếc cưa xếp dính gỗ thông mới chính là hung khí cưa thang.',
          correct: true
        },
        {
          id: 'oak_means_innocent',
          text: 'Con trai hoàn toàn vô tội vì mùn cưa trên áo anh ta là gỗ sồi, không khớp với chiếc thang gỗ thông.',
          correct: false
        },
        {
          id: 'ladder_made_of_oak',
          text: 'Chiếc thang được làm từ gỗ sồi nên con trai chính là kẻ cưa thang.',
          correct: false
        }
      ],
      leadsTo: 'node_elimination_of_secrets'
    },
    {
      id: 'node_elimination_of_secrets',
      label: 'Lọc bỏ các bí mật không liên quan',
      reqClues: ['gardener_alibi', 'wilson_secret_letter'],
      question: 'Bà Wilson lấy trộm thư sa thải và ông Thomas ở chợ phiên — làm sao đánh giá hai nghi phạm này?',
      branches: [
        {
          id: 'eliminate_both_innocent',
          text: 'Lời nói dối không đồng nghĩa với tội giết người: Cả hai đều có bí mật riêng đáng ngờ nhưng đều có bằng chứng loại trừ không thể có mặt tại nhà kính lúc 09:20 - 09:40.',
          correct: true
        },
        {
          id: 'housekeeper_accomplice',
          text: 'Quản gia Wilson sợ bị sa thải nên đã thông đồng với Người làm vườn để sát hại bà chủ.',
          correct: false
        },
        {
          id: 'gardener_fake_alibi',
          text: 'Người làm vườn đã hối lộ 3 chủ sạp chợ phiên để tạo bằng chứng ngoại phạm giả.',
          correct: false
        }
      ],
      leadsTo: 'node_final_accusation_chain'
    },
    {
      id: 'node_final_accusation_chain',
      label: 'Bức tranh toàn cảnh & Động cơ',
      reqClues: ['note', 'fabric'],
      question: 'Hạn chót thứ Hai đổi di chúc kết hợp với mảnh vải len xám tại lối thoát hiểm chỉ ra kết luận tối hậu nào?',
      branches: [
        {
          id: 'son_desperate_strike',
          text: 'Kẻ thủ ác duy nhất: Edward bị dồn vào đường cùng vì nợ nần và sắp bị tước thừa kế sáng thứ Hai, đã cưa thang tạo bẫy rồi tháo chạy qua bụi gai cửa sau.',
          correct: true
        },
        {
          id: 'random_thief_murder',
          text: 'Một kẻ trộm đột nhập mặc áo len xám đã vô tình làm bà Blackwood ngã thang, bức thư di chúc chỉ là sự trùng hợp ngẫu nhiên.',
          correct: false
        },
        {
          id: 'framed_by_gardener',
          text: 'Người làm vườn đã lấy trộm áo khoác của con trai để lại hiện trường nhằm vu oan giá họa cho người thừa kế.',
          correct: false
        }
      ]
    }
  ],

  // ------------------------------------------------------------
  // 12. Bẫy manh mối đánh lạc hướng (Red Herrings)
  // ------------------------------------------------------------
  redHerrings: [
    {
      id: 'oak_sawdust_box',
      clues: ['oak_sawdust_box'],
      explanation: 'Mùn cưa gỗ sồi trên tay áo con trai tưởng như là bằng chứng cưa thang, nhưng thực chất là do cạy hòm tiền cũ ở xưởng sau.'
    },
    {
      id: 'housekeeper_lie_trap',
      clues: ['study_lavender_scent', 'wilson_secret_letter'],
      explanation: 'Quản gia nói dối không vào phòng làm việc, nhưng sự thật bà ta chỉ lén lấy trộm bức thư sa thải cá nhân chứ không ra khu nhà kính.'
    }
  ],

  // ------------------------------------------------------------
  // 13. Giả thuyết suy luận (Hypotheses)
  // ------------------------------------------------------------
  hypotheses: [
    {
      id: 'h_ladder',
      refs: ['ladder', 'ladder_physics'],
      hintVague: 'Quan sát kỹ lớp mạt cưa nằm đè lên lớp bụi cũ và vết gãy phẳng của thớ gỗ thông.',
      question: 'Lớp mạt cưa gỗ thông đè lên bụi đất cũ và vết cắt phẳng 85% chứng minh điều gì?',
      options: [
        { id: 'a', text: 'Chiếc thang gỗ đã bị cưa ngầm trước đó; kẻ gây án tạo bẫy sập tải trọng rồi tháo chạy ngay', correct: true, evalYes: ['Vết cưa phẳng 85% trên thớ gỗ thông mới', 'Mạt cưa đè lên lớp bụi cũ chứng minh có trước khi ngã'], evalNo: [] },
        { id: 'b', text: 'Người làm vườn cưa thang để sửa chữa dở dang nhưng quên cất đi, dẫn đến tai nạn ngoài ý muốn', correct: false, evalYes: [], evalNo: ['Người làm vườn không để lại mạt cưa gỗ thông trên tay', 'Dấu chân chạy trốn không khớp với phản ứng của người cứu nạn'] },
        { id: 'c', text: 'Hung thủ xô ngã bà Blackwood trước rồi mới cưa thang để ngụy tạo tai nạn', correct: false, evalYes: [], evalNo: ['Không có dấu hiệu vật lộn giằng co quanh chân thang'] },
      ]
    },
    {
      id: 'h_motive',
      refs: ['note', 'fabric'],
      hintVague: 'Đối chiếu mốc thời gian luật sư tới biệt thự với chất liệu vải len tìm thấy ở bụi gai.',
      question: 'Ghi chú về việc loại tên khỏi di chúc và mảnh vải rách trên bụi gai hồng liên kết với ai?',
      options: [
        { id: 'a', text: 'Con trai có động cơ tài chính khẩn cấp (sắp bị tước di chúc sáng thứ Hai) và đã đích thân tháo chạy qua bụi gai', correct: true, evalYes: ['Mẩu giấy nêu rõ hạn chót thứ Hai đổi di chúc', 'Vết rách mới toanh trên áo khoác len xám đắt tiền của con trai'], evalNo: [] },
        { id: 'b', text: 'Một kẻ trộm đột nhập tình cờ làm rách áo, bức thư di chúc chỉ là sự trùng hợp', correct: false, evalYes: [], evalNo: ['Không có tài sản quý giá nào trong phòng làm việc bị đánh cắp', 'Chất liệu len xám đắt tiền không phổ biến ở kẻ trộm vặt'] },
        { id: 'c', text: 'Người làm vườn lấy cắp áo khoác của con trai để gài bẫy đổ tội', correct: false, evalYes: [], evalNo: ['Con trai không có đơn trình báo mất áo khoác với cảnh sát'] },
      ]
    },
  ],

  // ------------------------------------------------------------
  // 14. Mạng lưới liên kết trực quan trên Bảng ghim (Clue Relations: 5 Types)
  // ------------------------------------------------------------
  clueRelations: [
    {
      clues: ['ladder', 'ladder_physics'],
      type: 'supports',
      label: 'Lớp mạt cưa đè lên bụi đất cũ chứng minh bậc thang đã bị cưa ngầm trước án mạng.',
      question: 'Hai manh mối này cùng chứng minh điều gì về hiện trường chiếc thang?',
      options: [
        { id: 'a', text: 'Bậc thang đã bị cưa ngầm từ trước, tính toán để gãy sập dưới tải trọng người leo', correct: true },
        { id: 'b', text: 'Chiếc thang bị mục tự nhiên theo thời gian, không có tác động phá hoại', correct: false }
      ]
    },
    {
      clues: ['ladder_physics', 'footprints'],
      type: 'supports',
      label: 'Vết cưa ngầm và dấu gót chân chạy một chiều xác thực cái chết không phải tai nạn.',
      question: 'Dấu vết cưa ngầm kết hợp dấu gót chân chạy tháo thân chỉ ra điều gì?',
      options: [
        { id: 'a', text: 'Kẻ gây án tạo bẫy sập rồi chạy tháo thân thẳng ra phía cửa sau', correct: true },
        { id: 'b', text: 'Nạn nhân bỏ chạy sau khi chiếc thang gãy', correct: false }
      ]
    },
    {
      clues: ['pine_pocket_saw', 'ladder_physics'],
      type: 'corroborates',
      label: 'Dăm gỗ thông và bước răng cưa 1.5mm trên cưa xếp đồng xác thực hung khí cưa thang.',
      question: 'Sự tương thích giữa chiếc cưa xếp mini và vết cắt bậc thang cho thấy điều gì?',
      options: [
        { id: 'a', text: 'Chiếc cưa xếp mini dính dăm gỗ thông chính là công cụ đã cưa bậc thang gỗ thông', correct: true },
        { id: 'b', text: 'Cưa xếp mini dùng để cưa hòm tiền gỗ sồi trong xưởng', correct: false }
      ]
    },
    {
      clues: ['gardener_alibi', 'fabric'],
      type: 'eliminates',
      label: 'Người làm vườn ở chợ phiên cách 4 dặm, loại trừ khả năng ông là chủ nhân mảnh vải xám.',
      question: 'Đối chiếu lời khai ngoại phạm của Người làm vườn và mảnh vải len xám cho thấy:',
      options: [
        { id: 'a', text: 'Người làm vườn có alibi độc lập, loại trừ khả năng ông là chủ nhân mảnh áo len xám đắt tiền', correct: true },
        { id: 'b', text: 'Người làm vườn mua mảnh vải len ở chợ phiên để gài bẫy con trai', correct: false }
      ]
    },
    {
      clues: ['study_lavender_scent', 'wilson_secret_letter'],
      type: 'contradicts',
      label: 'Quản gia chỉ lén vào phòng làm việc lấy trộm bức thư sa thải, không ra nhà kính.',
      question: 'Dấu vân tay dính sáp hoa oải hương và bức thư sa thải trong tạp dề hé lộ:',
      options: [
        { id: 'a', text: 'Bà Wilson chỉ lén lên phòng làm việc lấy cắp bức thư sa thải, không liên quan đến án mạng nhà kính', correct: true },
        { id: 'b', text: 'Bà Wilson là chủ mưu đã lên kế hoạch cưa thang', correct: false }
      ]
    },
    {
      clues: ['oak_sawdust_box', 'pine_pocket_saw'],
      type: 'explains',
      label: 'Mùn gỗ sồi trên áo do cạy hòm tiền; cưa xếp mini dính gỗ thông mới là hung khí.',
      question: 'Phân tích sự khác biệt giữa hai loại mạt gỗ (gỗ sồi vs gỗ thông) chứng minh điều gì?',
      options: [
        { id: 'a', text: 'Mùn gỗ sồi trên áo là do cạy hòm tiền; chiếc cưa xếp dính gỗ thông mới là hung khí cưa thang', correct: true },
        { id: 'b', text: 'Cả hai loại mùn gỗ đều không liên quan đến chiếc thang', correct: false }
      ]
    },
    {
      clues: ['note', 'fabric'],
      type: 'supports',
      label: 'Hạn chót đổi di chúc sáng thứ Hai khớp với mảnh áo rách của con trai tại cửa sau.',
      question: 'Mẩu giấy đổi di chúc và mảnh vải rách ở bụi gai liên kết với nhau thế nào?',
      options: [
        { id: 'a', text: 'Con trai có động cơ ra tay khẩn cấp trước thứ Hai và đã đích thân tháo chạy qua bụi gai', correct: true },
        { id: 'b', text: 'Kẻ trộm đột nhập tình cờ làm rách áo, di chúc chỉ là sự trùng hợp', correct: false }
      ]
    }
  ],

  // ------------------------------------------------------------
  // 15. Chân tướng vụ án & Lời giải (Ground Truth & Endings)
  // ------------------------------------------------------------
  truth: {
    correctSuspect: 'son',
    accusation: {
      methods: [
        {
          id: 'cut_ladder',
          text: 'Cưa ngầm 85% bậc thang chịu lực, tạo bẫy sập khi nạn nhân trèo lên',
          correct: true,
          reqClues: ['ladder_physics', 'pine_pocket_saw'],
          reqHint: 'Cần giám định vết cưa ngầm & tìm ra chiếc cưa xếp trong xưởng gỗ'
        },
        { id: 'push', text: 'Đợi nạn nhân leo lên thang rồi bất ngờ xô ngã từ phía sau', correct: false },
        { id: 'poison', text: 'Đầu độc trà khiến nạn nhân chóng mặt và ngã khỏi thang', correct: false },
      ],
      motives: [
        {
          id: 'inheritance',
          text: 'Sắp bị gạch tên khỏi di chúc vào sáng thứ Hai do nợ nần cờ bạc',
          correct: true,
          reqClues: ['note', 'fabric'],
          reqHint: 'Cần tìm mẩu giấy di chúc & mảnh áo len tháo chạy qua bụi gai'
        },
        { id: 'hatred', text: 'Mâu thuẫn và thù hận cá nhân lâu năm vì bị mẹ kiểm soát', correct: false },
        { id: 'theft', text: 'Bị bắt quả tang khi đang cạy hòm tiền gỗ sồi trong xưởng', correct: false },
      ]
    },
    endings: {
      perfect: {
        badge: 'Kết cục hoàn hảo', title: 'Vụ án được phá giải trọn vẹn',
        body: `<p>Vết cưa ngầm 85% với mạt cưa đè lên bụi cũ, chiếc cưa xếp dính gỗ thông giấu sau xưởng, dấu giày quả trám sải dài, và mảnh vải len xám dính mủ hoa hồng trên lối thoát hiểm — tất cả đã vạch trần âm mưu mưu sát tinh vi của Edward Blackwood.</p>
        <p>Bị dồn vào chân tường vì món nợ cờ bạc khổng lồ và biết rõ mẹ sẽ gạch tên mình khỏi di chúc vào sáng thứ Hai, Edward đã dùng cưa tạo nên chiếc bẫy chết người trong nhà kính trước khi tháo chạy qua bụi gai.</p>
        <p><strong>Bạn đã buộc tội đúng người, đúng phương thức và động cơ, phân biệt rạch ròi các bí mật cá nhân của Quản gia và Người làm vườn. Bạn xứng đáng với danh hiệu Thám Tử Lừng Danh!</strong></p>`
      },
      good: {
        badge: 'Đúng người', title: 'Kết luận đúng, còn vài khoảng trống',
        body: `<p>Bạn buộc tội đúng con trai bà Blackwood. Lập luận khá vững chắc, dù còn vài chi tiết vật lý về vết cưa hoặc bẫy mùn cưa bạn chưa kịp bóc tách trọn vẹn.</p>
        <p>Cảnh sát chấp nhận kết quả nhưng cần thêm thời gian đối chiếu tang vật trước khi hoàn tất hồ sơ khởi tố.</p>`
      },
      bad: {
        badge: 'Đúng người, sai lập luận', title: 'Đoán đúng, nhưng không chứng minh được',
        body: `<p>Bạn chỉ đích danh đúng Edward, nhưng khi được hỏi về cơ chế chiếc thang và vết mùn cưa, lập luận của bạn còn nhiều lỗ hổng khiến luật sư bào chữa phản bác kịch liệt.</p>`
      },
      incomplete: {
        badge: 'Hồ sơ còn bỏ ngỏ', title: 'Chưa đủ căn cứ để kết luận',
        body: `<p>Bạn phải đưa ra kết luận khi còn quá nhiều bằng chứng quan trọng chưa được xem xét. Hồ sơ vụ án tạm thời bị đình chỉ.</p>`
      },
      wrong_method: {
        badge: 'Sai phương thức', title: 'Đúng người, sai cách gây án',
        body: `<p>Bạn tìm đúng thủ phạm Edward nhưng mô tả sai cơ chế phá hoại chiếc thang, khiến bằng chứng vật lý tại tòa bị mâu thuẫn.</p>`
      },
      wrong_motive: {
        badge: 'Sai động cơ', title: 'Đúng người, sai nguyên nhân',
        body: `<p>Bạn chỉ đúng Edward nhưng không làm rõ được áp lực thời gian của bản di chúc sáng thứ Hai, khiến động cơ gây án bị thiếu thuyết phục.</p>`
      },
    },
    suspectEndings: {
      gardener: {
        badge: 'Buộc tội sai', title: 'Người làm vườn vô tội',
        body: `<p>Bạn nghi ngờ Người làm vườn Thomas — nhưng 3 chủ sạp ở chợ phiên thị trấn đã xác thực bằng chứng ngoại phạm không thể chối cãi của ông.</p>
        <p>Trong khi đó, Edward — kẻ thực sự cưa thang và chạy trốn qua bụi gai — đã tẩu thoát cùng toàn bộ tài sản thừa kế.</p>`
      },
      housekeeper: {
        badge: 'Buộc tội sai', title: 'Quản gia vô tội',
        body: `<p>Bạn nghi ngờ Quản gia Wilson vì lời nói dối của bà ta — nhưng sự thật bà ta chỉ lén lấy cắp lá thư sa thải cá nhân. Bà ta hoàn toàn không hề bước chân ra nhà kính.</p>`
      },
    },
    replaySteps: [
      '"Một chiếc thang gãy không tự nhiên nói dối. Lớp mạt cưa nằm đè lên bụi đất cũ chứng minh bậc thang đã bị cưa ngầm trước khi nạn nhân bước lên."',
      '"Dấu chân quả trám sải dài chạy một chiều — người tạo ra chúng không hề có ý định cứu giúp mà đang tháo chạy trong hoảng loạn."',
      '"Mẩu ghi chú về việc đổi di chúc sáng thứ Hai tạo ra động cơ thời gian khẩn cấp mà chỉ người thừa kế mới có."',
      '"Và chiếc cưa xếp dính gỗ thông giấu sau xưởng kết hợp cùng mảnh vải len xám trên bụi gai — đã khép lại vòng vây công lý đối với Edward Blackwood."',
    ],
    replayClues: ['ladder_physics', 'footprints', 'note', 'pine_pocket_saw', 'fabric']
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CASE_BLACKWOOD;
}
