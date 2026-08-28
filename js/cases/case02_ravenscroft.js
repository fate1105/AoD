/* ============================================================
   CASE 02 — TRUNG BÌNH (ÁNH SÁNG PHÒNG KÍN)
   Cái Chết Tại Thư Viện Ravenscroft
   ============================================================ */

const CASE_RAVENSCROFT = {
  id: 'ravenscroft',
  title: 'Cái Chết Tại Thư Viện Ravenscroft',
  fileNo: '221B-9',
  difficulty: {tier:'medium', label:'TRUNG BÌNH', emoji:'🟡'},
  timeBudget: 85,
  victim: 'Ngài Edmund Ravenscroft, 61 tuổi, nhà sưu tầm cổ vật giàu có, sống một mình cùng người quản gia trong dinh thự ngoại ô London.',
  setup: 'Sáng nay, người quản gia phát hiện ông chết gục trên ghế trong thư viện riêng. Cửa phòng khóa chốt từ bên trong, chìa khóa duy nhất nằm trong túi áo nạn nhân. Bác sĩ sơ bộ nghi là đau tim. Nhưng chiếc đồng hồ vỡ mặt kính dừng ở 11:47 và ly rượu vang đục màu cặn lạ kể một câu chuyện hoàn toàn khác...',

  difficultyRules: {
    maxHints: 3,
    redHerrings: true,
    inferenceAmbiguity: 'medium',
    timelineComplexity: 'medium',
    suspectCount: 3
  },

  objective: {
    primary: 'Giải mã bí ẩn phòng kín và tìm ra kẻ đã đầu độc Ngài Edmund Ravenscroft',
    secondary: [
      'Chứng minh hiện trường phòng kín được dàn dựng qua lối cửa sổ tầng hai',
      'Vạch trần việc chỉnh kim đồng hồ để tạo bằng chứng thời gian giả',
      'Làm rõ chứng cứ ngoại phạm của Cháu trai và Quản gia'
    ]
  },

  suspects: [
    {
      id: 'nephew',
      name: 'Arthur Ravenscroft (Cháu trai)',
      role: 'Người thừa kế hợp pháp',
      desc: 'Nợ nần cờ bạc, biết trước về việc di chúc có thể bị hủy, hút cùng loại xì gà tìm thấy tại hiện trường.',
      eliminateWith: ['nephew_alibi_proof'],
      eliminateExplanation: 'Cuống vé đóng dấu tại câu lạc bộ Pall Mall cùng lời khai của 5 nhân chứng xác nhận Arthur ở câu lạc bộ liên tục từ 23:30 đến 01:00 sáng.',

      observations: [
        {
          id: 'nephew_suit',
          label: 'Bộ âu phục dạ tiệc & mùi xì gà',
          detail: 'Bộ âu phục đắt tiền thoang thoảng mùi khói xì gà Trichinopoly, túi áo có cuống vé câu lạc bộ Pall Mall.',
          inferences: [
            { id: 'club_visitor', text: 'Có mặt tại câu lạc bộ quý tộc đêm qua, mùi xì gà là thói quen hút thuốc thường nhật', confidence: 'high' },
            { id: 'murderer_trace', text: 'Vừa từ hiện trường thư viện bước ra', confidence: 'low' }
          ]
        }
      ],

      interrogation: {
        dialogues: [
          {
            id: 'q_n_cigar',
            question: 'Tại sao tàn xì gà Trichinopoly anh hay hút lại nằm trong gạt tàn thư viện của chú anh?',
            answer: 'Tôi có ghé thăm chú tôi lúc 8h tối hôm qua và hút một điếu, nhưng sau đó tôi đến câu lạc bộ Pall Mall suốt từ 11h đêm đến tận 1h sáng. Tôi có cuống vé và nhân chứng làm chứng!',
            statements: [
              'Tôi có ghé thăm chú tôi lúc 8h tối hôm qua và hút một điếu, nhưng sau đó tôi đến câu lạc bộ Pall Mall suốt từ 11h đêm đến tận 1h sáng.',
              'Tôi có cuống vé và nhân chứng làm chứng!'
            ],
            contradictionStatementIdx: 0,
            contradictionClue: 'ashtray',
            credibilityImpact: 0,
            revealClueId: 'nephew_alibi_proof'
          },
          {
            id: 'q_n_will',
            question: 'Anh có biết gì về việc Ngài Ravenscroft muốn sửa đổi di chúc không?',
            answer: 'Chú tôi luôn dọa dẫm tôi về chuyện tiền bạc, nhưng ông ấy không bao giờ tuyệt tình đến mức cắt đứt quyền thừa kế.',
            statements: [
              'Chú tôi luôn dọa dẫm tôi về chuyện tiền bạc.',
              'Nhưng ông ấy không bao giờ tuyệt tình đến mức cắt đứt quyền thừa kế.'
            ],
            contradictionClue: null
          }
        ],
        breakdownResponse: 'Arthur đưa ra cuống vé có dấu thời gian: "Tôi thề có Chúa, tôi ở câu lạc bộ cả đêm! Ai đó đã cố tình dùng tàn xì gà của tôi để gài bẫy!"'
      }
    },
    {
      id: 'butler',
      name: 'Leonard Higgins (Quản gia)',
      role: 'Quản gia 15 năm',
      desc: 'Người phát hiện thi thể đầu tiên, sống trong dinh thự nhiều năm, có alibi ở bếp tầng hầm.',
      eliminateWith: ['butler_alibi'],
      eliminateExplanation: 'Lời khai đối chiếu chéo của cô phụ bếp xác nhận Leonard ở dưới tầng hầm chuẩn bị tiệc từ 23:00 đến sau nửa đêm, không có khoảng trống để lên tầng hai.',

      observations: [
        {
          id: 'butler_keys',
          label: 'Chùm chìa khóa & tạp dề bếp',
          detail: 'Chùm chìa khóa chỉ gồm các phòng sinh hoạt chung, không hề có chìa khóa dự phòng của thư viện riêng.',
          inferences: [
            { id: 'no_spare_key', text: 'Chỉ có nạn nhân giữ chiếc chìa duy nhất của thư viện', confidence: 'high' },
            { id: 'hidden_master_key', text: 'Có thể có chìa khóa vạn năng', confidence: 'low' }
          ]
        }
      ],

      interrogation: {
        dialogues: [
          {
            id: 'q_b_alibi',
            question: 'Ông đã ở đâu vào khoảng thời gian trước và sau nửa đêm?',
            answer: 'Tôi ở dưới bếp tầng hầm kiểm kê đồ sứ và chuẩn bị nước trà. Cô phụ bếp có thể làm chứng cho tôi suốt từ 11h đêm!',
            statements: [
              'Tôi ở dưới bếp tầng hầm kiểm kê đồ sứ và chuẩn bị nước trà.',
              'Cô phụ bếp có thể làm chứng cho tôi suốt từ 11h đêm!'
            ],
            contradictionClue: null
          },
          {
            id: 'q_b_argument',
            question: 'Ông có nghe thấy âm thanh bất thường nào từ phòng thư viện đêm qua không?',
            answer: 'Tôi... tôi nghe tiếng cãi cọ lúc gần 12h đêm qua ống thông gió. Ngài ấy tiếp một vị khách nữ bí mật... chiếc găng tay da rơi sau kệ sách là của người đó!',
            statements: [
              'Tôi... tôi nghe tiếng cãi cọ lúc gần 12h đêm qua ống thông gió.',
              'Ngài ấy tiếp một vị khách nữ bí mật... chiếc găng tay da rơi sau kệ sách là của người đó!'
            ],
            contradictionStatementIdx: 1,
            contradictionClue: 'glove',
            credibilityImpact: -20,
            revealClueId: 'butler_secret'
          }
        ],
        breakdownResponse: 'Leonard cúi đầu: "Ngài Ravenscroft thi thoảng có tiếp một người phụ nữ tên Isolde Marsh về việc kinh doanh vào ban đêm... Tôi không dám xen vào chuyện của chủ nhân."'
      }
    },
    {
      id: 'isolde',
      name: 'Bà Isolde Marsh',
      role: 'Đối tác kinh doanh cổ vật bí mật',
      desc: 'Một cái tên xuất hiện từ bức thư viết dở "I.", có liên quan đến việc biển thủ quỹ công ty cổ vật.',
      revealAfter: ['glove', 'letter'],
      revealText: 'Từ chiếc găng tay nữ và chữ cái "I." trong bức thư bị bỏ dở, thân phận đối tác bí mật Isolde Marsh đã lộ diện.',
      eliminateWith: null,

      observations: [
        {
          id: 'isolde_heels',
          label: 'Gót giày nhung & vết bùn khô',
          detail: 'Gót giày nhung đen của bà Isolde có bám vết bùn đất khô và xước xát nhẹ ở mũi giày — khớp với bùn bờ tường thường xuân ngoài cửa sổ thư viện.',
          inferences: [
            { id: 'wall_climb_trace', text: 'Vết xước và bùn đất chứng minh đã leo bệ tường và dây thường xuân tầng hai', confidence: 'high' },
            { id: 'street_mud', text: 'Bùn bẩn thông thường từ đường phố London', confidence: 'low' }
          ]
        },
        {
          id: 'isolde_gloves',
          label: 'Bàn tay phải đeo nhẫn',
          detail: 'Bà ta chỉ đeo một chiếc găng tay da mỏng bên tay trái, tay phải để trần để lộ vết xước nhẹ ở cổ tay.',
          inferences: [
            { id: 'missing_glove_match', text: 'Chiếc găng tay da nữ rơi lại sau kệ sách chính là chiếc bên tay phải bị mất', confidence: 'high' },
            { id: 'lost_elsewhere', text: 'Làm mất găng tay ở tiệm trà', confidence: 'low' }
          ]
        }
      ],

      interrogation: {
        dialogues: [
          {
            id: 'q_i_letter',
            question: 'Ngài Ravenscroft nhắc đến chữ cái "I." và việc đối chất biển thủ sổ sách vào thứ Hai tới. Bà giải thích sao?',
            answer: 'Chỉ là sự trùng hợp ngẫu nhiên! Tôi và ông ấy có hợp tác làm ăn nhưng mọi sổ sách đều minh bạch!',
            statements: [
              'Chỉ là sự trùng hợp ngẫu nhiên!',
              'Tôi và ông ấy có hợp tác làm ăn nhưng mọi sổ sách đều minh bạch!'
            ],
            contradictionStatementIdx: 1,
            contradictionClue: 'letter',
            credibilityImpact: -30
          },
          {
            id: 'q_i_mud',
            question: 'Bùn đất trên gót giày và chiếc găng tay da sau giá sách liên kết bà với hiện trường phòng kín ra sao?',
            answer: 'Găng tay da đó là mẫu bán đại trà khắp London! Vết bùn là do tôi đi bộ dưới trời mưa đêm qua!',
            statements: [
              'Găng tay da đó là mẫu bán đại trà khắp London!',
              'Vết bùn là do tôi đi bộ dưới trời mưa đêm qua!'
            ],
            contradictionStatementIdx: 1,
            contradictionClue: 'mud',
            credibilityImpact: -35
          }
        ],
        breakdownResponse: 'Isolde Marsh tái mặt, run rẩy lùi lại: "Lão già đó đã phát hiện việc tôi chuyển tiền quỹ sang tài khoản riêng... Lão dọa sẽ tống tôi vào tù vào sáng thứ Hai! Tôi buộc phải ra tay!"'
      }
    }
  ],

  evidence: {
    clock:   {label:'Đồng hồ bàn dừng ở 11:47', key:true, decoy:false, location:'library', cost:5, text:'Đồng hồ để bàn vỡ mặt kính, kim dừng ở 11:47. Kim giờ bị uốn cong tập trung đúng một điểm — dấu hiệu bị dùng ngón tay xoay chỉnh cưỡng bức để tạo mốc thời gian giả.'},
    wine:    {label:'Ly rượu vang đỏ có cặn độc', key:true, decoy:false, location:'library', cost:5, text:'Một ly rượu vang đỏ uống dở trên bàn, dưới đáy đọng lớp bột đục của Cyanide — chất độc cực mạnh gây tử vong nhanh mà không để lại thương tích ngoài da.'},
    glove:   {label:'Chiếc găng tay da nữ bên phải', key:true, decoy:false, location:'library', cost:5, text:'Một chiếc găng tay da nữ màu đen sang trọng kẹt sau khe giá sách, dính thoang thoảng mùi nước hoa oải hương.'},
    decoy_body:{label:'Khám nghiệm thi thể bên ngoài', key:false, decoy:true, location:'library', cost:5, text:'Không có vết thương hở hay dấu hiệu vật lộn. Bác sĩ ban đầu dễ nhầm lẫn thành cơn đau tim.'},
    letter:  {label:'Bức thư tố giác viết dở', key:true, decoy:false, location:'desk', cost:5, text:'"...tôi đã phát hiện toàn bộ số tiền quỹ cổ vật bị rút ruột. Tôi sẽ gặp cảnh sát và đối chất với I. vào thứ Hai tới..." — câu chữ bị bỏ dở.'},
    ashtray: {label:'Tàn xì gà trong gạt tàn', key:false, decoy:true, location:'desk', cost:5, text:'Một mẩu tàn xì gà Trichinopoly trong gạt tàn. Cháu trai Arthur thừa nhận hút loại này khi ghé thăm lúc 20:00 tối.'},
    perfume: {label:'Mùi nước hoa oải hương', key:false, decoy:false, location:'desk', cost:5, text:'Hương thơm oải hương nhạt quanh bàn làm việc, hoàn toàn trùng khớp với mùi trên chiếc găng tay da nữ.', expiresAt: 40, expireWarning: 'Mùi nước hoa đang phai dần, hãy kiểm tra bàn làm việc sớm.'},
    decoy_drawer:{label:'Ngăn kéo giấy tờ cá nhân', key:false, decoy:true, location:'desk', cost:5, text:'Chỉ chứa các hóa đơn mua tranh và đồ gốm sứ cũ.'},
    mud:     {label:'Vết bùn khô trên bệ cửa sổ', key:true, decoy:false, location:'window', cost:5, text:'Vết bùn khô in trên bệ cửa sổ tầng hai ở phía trong phòng, chứng minh có người trèo vào thư viện qua cửa sổ.'},
    ivy:     {label:'Dây thường xuân bị đè gãy', key:true, decoy:false, location:'window', cost:5, text:'Dây leo thường xuân dày đặc bám tường ngoài bị dập gãy thành một vệt thẳng đứng từ mặt đất lên bệ cửa sổ tầng hai.'},
    argument:{label:'Tiếng tranh cãi trước nửa đêm', key:false, decoy:false, location:'butler', cost:10, text:'Quản gia khai nghe thấy tiếng phụ nữ tranh cãi gay gắt với ngài Ravenscroft qua ống thông gió lúc 23:20.'},
    butler_alibi:{label:'Alibi của Quản gia Leonard', key:false, decoy:false, location:'butler', cost:10, text:'Cô phụ bếp xác nhận Quản gia Leonard ở dưới bếp tầng hầm liên tục từ 23:00 đến sau nửa đêm.'},
    butler_secret: {label:'Lời khai về vị khách nữ bí mật', key:false, decoy:false, location:null, source:'confrontation', text:'Quản gia Leonard thừa nhận ngài Ravenscroft có tiếp một nữ đối tác tên Isolde Marsh vào các tối cuối tuần.'},
    nephew_alibi_proof: {label:'Cuống vé câu lạc bộ Pall Mall', key:true, decoy:false, location:null, source:'confrontation', text:'Cuống vé câu lạc bộ Pall Mall đóng dấu thời gian 23:30–01:00 sáng, chứng minh cháu trai Arthur có ngoại phạm vững chắc.'},
  },

  locations: [
    {id:'library', name:'Hiện trường: Thư viện', icon:'📖', items:[{id:'clock',cost:5},{id:'wine',cost:5},{id:'glove',cost:5},{id:'decoy_body',cost:5}]},
    {id:'desk', name:'Bàn làm việc & Thư từ', icon:'✒️', items:[{id:'letter',cost:5},{id:'ashtray',cost:5},{id:'perfume',cost:5},{id:'decoy_drawer',cost:5}]},
    {id:'window', name:'Cửa sổ tầng hai & Tường ngoài', icon:'🪟', items:[{id:'mud',cost:5},{id:'ivy',cost:5}]},
    {id:'butler', name:'Thẩm vấn Quản gia Leonard', icon:'👤', items:[{id:'argument',cost:10},{id:'butler_alibi',cost:10}]},
    {id:'nephew', name:'Thẩm vấn Cháu trai Arthur', icon:'👤', items:[]},
    {id:'isolde', name:'Thẩm vấn Bà Isolde Marsh', icon:'👤', items:[]}
  ],

  timeline: [
    { id: 'evt_nephew_visit', time: '20:00', event: 'Cháu trai Arthur ghé thăm, hút một điếu xì gà rồi rời đi', suspect: 'nephew', verified: true, unlockClue: 'ashtray' },
    { id: 'evt_butler_kitchen', time: '23:00', event: 'Quản gia Leonard xuống bếp tầng hầm cùng cô phụ bếp', suspect: 'butler', verified: true, unlockClue: 'butler_alibi' },
    { id: 'evt_isolde_climb', time: '23:15', event: 'Isolde Marsh trèo dây thường xuân qua cửa sổ tầng hai vào thư viện', suspect: 'isolde', verified: false, unlockClue: 'mud' },
    { id: 'evt_isolde_poison_fight', time: '23:25', event: 'Hai bên tranh cãi về việc biển thủ quỹ; Isolde bỏ độc vào ly rượu vang', suspect: 'isolde', verified: false, unlockClue: 'argument' },
    { id: 'evt_nephew_club', time: '23:30', event: 'Arthur có mặt tại câu lạc bộ Pall Mall (cuống vé đóng dấu)', suspect: 'nephew', verified: true, unlockClue: 'nephew_alibi_proof' },
    { id: 'evt_victim_poison_clock', time: '23:35', event: 'Nạn nhân uống rượu và tử vong; Isolde chỉnh kim đồng hồ về 11:47 rồi trèo ra cửa sổ', suspect: 'isolde', verified: false, unlockClue: 'clock' }
  ],

  interrogationTree: {
    nephew: {
      q_n_cigar: { unlockRequires: [], contradictionClue: 'ashtray', credibilityImpact: 0, revealClueId: 'nephew_alibi_proof' },
      q_n_will: { unlockRequires: [], contradictionClue: null }
    },
    butler: {
      q_b_alibi: { unlockRequires: [], contradictionClue: null },
      q_b_argument: { unlockRequires: ['glove'], contradictionClue: 'glove', credibilityImpact: -20, revealClueId: 'butler_secret' }
    },
    isolde: {
      q_i_letter: { unlockRequires: ['letter'], contradictionClue: 'letter', credibilityImpact: -30 },
      q_i_mud: { unlockRequires: ['mud'], contradictionClue: 'mud', credibilityImpact: -35 }
    }
  },

  mindPalaceNodes: [
    {
      id: 'node_locked_room_entry',
      label: 'Giải mã hiện trường phòng kín',
      reqClues: ['mud', 'ivy'],
      question: 'Cửa chính khóa chốt từ bên trong, nhưng bệ cửa sổ có vết bùn và dây thường xuân bị đè gãy:',
      branches: [
        {
          id: 'window_break_in',
          text: 'Đột nhập và tẩu thoát qua cửa sổ: Thủ phạm leo tường bằng dây thường xuân, gây án rồi trèo ra ngoài, để cửa chính vẫn khóa chốt.',
          correct: true
        },
        {
          id: 'inside_suicide',
          text: 'Tự sát trong phòng kín: Nạn nhân tự khóa cửa và tự uống thuốc độc, không có ai trèo vào.',
          correct: false
        }
      ]
    },
    {
      id: 'node_clock_fabrication',
      label: 'Bản chất chiếc đồng hồ dừng ở 11:47',
      reqClues: ['clock', 'wine'],
      question: 'Kim giờ bị bẻ cong tập trung một điểm quanh số 47 phút chỉ ra điều gì?',
      branches: [
        {
          id: 'fake_time_of_death',
          text: 'Tạo giờ chết giả: Thủ phạm cố tình chỉnh kim đồng hồ về 11:47 để làm lệch hướng điều tra về khung thời gian của mình.',
          correct: true
        },
        {
          id: 'accidental_fall',
          text: 'Đồng hồ rơi vỡ tự nhiên đúng thời điểm nạn nhân ngã gục lúc 11:47.',
          correct: false
        }
      ]
    },
    {
      id: 'node_female_presence',
      label: 'Danh tính vị khách trong đêm',
      reqClues: ['glove', 'letter'],
      question: 'Chiếc găng tay da nữ rơi sau kệ sách và bức thư nhắc đến tên "I." dẫn tới ai?',
      branches: [
        {
          id: 'isolde_identified',
          text: 'Đối tác bí mật Isolde Marsh: Người phụ nữ có tên bắt đầu bằng chữ I., bị phát hiện biển thủ quỹ và đã trực tiếp có mặt.',
          correct: true
        },
        {
          id: 'butler_visitor',
          text: 'Khách mời của Quản gia: Người phụ nữ này là khách riêng của Leonard, không liên quan đến cái chết.',
          correct: false
        }
      ]
    }
  ],

  redHerrings: [
    {
      id: 'nephew_cigar_trap',
      clues: ['ashtray'],
      explanation: 'Tàn xì gà Trichinopoly khiến Cháu trai bị nghi ngờ, nhưng thực chất anh ta đã hút từ lúc 20:00 và có ngoại phạm tại câu lạc bộ lúc nửa đêm.'
    }
  ],

  hypotheses: [
    {
      id:'h_clock', refs:['clock'],
      hintVague:'Quan sát kỹ vết cong cưỡng bức trên kim giờ đồng hồ.',
      question:'Kim giờ đồng hồ cong bất thường quanh đúng con số 47 phút gợi ý điều gì?',
      options:[
        {id:'a', text:'Có người cố tình chỉnh kim đồng hồ để tạo mốc thời gian chết giả', correct:true, evalYes:['Vết cong tập trung đúng một điểm do lực ngón tay'], evalNo:[]},
        {id:'b', text:'Đồng hồ rơi vỡ tự nhiên đúng lúc ngã', correct:false, evalYes:[], evalNo:['Mặt kính vỡ nhưng kim bị bẻ uốn cưỡng bức']},
      ]
    },
    {
      id:'h_window', refs:['mud','ivy'],
      hintVague:'Nếu cửa chính khóa trong, hãy tìm lối ra vào khác của căn phòng.',
      question:'Dấu bùn trên bệ cửa sổ và dây thường xuân bị đè gãy chứng minh điều gì?',
      options:[
        {id:'a', text:'Thủ phạm trèo qua cửa sổ tầng hai bằng dây thường xuân để vào và tẩu thoát', correct:true, evalYes:['Bùn đất bệ cửa sổ','Vệt thường xuân dập gãy thẳng đứng'], evalNo:[]},
        {id:'b', text:'Nạn nhân tự tử trong phòng kín', correct:false, evalYes:[], evalNo:['Không giải thích được dấu vết trèo tường bên ngoài']},
      ]
    }
  ],

  clueRelations: [
    {
      clues: ['mud', 'ivy'],
      type: 'supports',
      label: 'Dấu bùn và dây thường xuân đè gãy chứng minh lối đột nhập qua cửa sổ tầng hai.',
      question: 'Dấu bùn bệ cửa sổ và dây thường xuân bị dập gãy chứng minh điều gì?',
      options: [
        { id: 'a', text: 'Kẻ thủ ác đã leo bệ tường và dây thường xuân để đột nhập và tẩu thoát qua cửa sổ tầng hai', correct: true },
        { id: 'b', text: 'Nạn nhân tự leo ra ngoài cửa sổ để hái hoa rồi trèo vào', correct: false }
      ]
    },
    {
      clues: ['glove', 'perfume'],
      type: 'supports',
      label: 'Găng tay da nữ và mùi nước hoa oải hương cùng chỉ tới một phụ nữ.',
      question: 'Chiếc găng tay da nữ và mùi hương oải hương quanh bàn làm việc chứng minh điều gì?',
      options: [
        { id: 'a', text: 'Có một người phụ nữ đã ở trong thư viện và đánh rơi chiếc găng tay tay phải sau giá sách', correct: true },
        { id: 'b', text: 'Quản gia Leonard có sở thích sưu tầm găng tay phụ nữ', correct: false }
      ]
    },
    {
      clues: ['argument', 'butler_alibi'],
      type: 'contradicts',
      label: 'Quản gia ở tầng hầm nhưng nghe được tiếng cãi vã, hé lộ việc ông biết sự có mặt của vị khách nữ.',
      question: 'Đối chiếu lời khai nghe thấy tiếng cãi vã và alibi ở bếp của Quản gia cho thấy:',
      options: [
        { id: 'a', text: 'Quản gia có alibi ở bếp tầng hầm nhưng qua ống thông gió ông biết nạn nhân tiếp một vị khách nữ', correct: true },
        { id: 'b', text: 'Quản gia trực tiếp tham gia cuộc cãi vã trong thư viện', correct: false }
      ]
    },
    {
      clues: ['ashtray', 'nephew_alibi_proof'],
      type: 'contradicts',
      label: 'Tàn xì gà ở hiện trường nhưng cháu trai có cuống vé ngoại phạm tại câu lạc bộ Pall Mall.',
      question: 'Mâu thuẫn giữa tàn xì gà và cuống vé câu lạc bộ Pall Mall của cháu trai chứng minh:',
      options: [
        { id: 'a', text: 'Arthur chỉ ghé từ 8h tối; anh ta có alibi ngoại phạm vững chắc lúc nửa đêm ở câu lạc bộ', correct: true },
        { id: 'b', text: 'Arthur là thủ phạm đã quay lại gây án sau khi rời câu lạc bộ', correct: false }
      ]
    }
  ],

  truth: {
    correctSuspect:'isolde',
    method: 'poison',
    motive: 'embezzle',
    accusation: {
      methods: [
        {
          id:'poison',
          text:'Đầu độc ly rượu vang bằng Cyanide, trèo qua cửa sổ dàn cảnh phòng kín',
          correct:true,
          reqClues: ['wine', 'mud'],
          reqHint: 'Cần giám định ly rượu độc & dấu vết đột nhập bệ cửa sổ'
        },
        {id:'strangle', text:'Bóp cổ nạn nhân từ phía sau ghế', correct:false},
        {id:'scare', text:'Hù dọa khiến nạn nhân lên cơn đau tim', correct:false},
      ],
      motives: [
        {
          id:'embezzle',
          text:'Bị phát hiện biển thủ quỹ công ty cổ vật, giết người diệt khẩu trước thứ Hai',
          correct:true,
          reqClues: ['letter', 'glove'],
          reqHint: 'Cần tìm bức thư tố giác & găng tay da của đối tác bí mật'
        },
        {id:'inheritance', text:'Giết người để cướp đoạt tài sản thừa kế', correct:false},
        {id:'revenge', text:'Trả thù vì mâu thuẫn tình cảm trong quá khứ', correct:false},
      ]
    },
    endings:{
      perfect:{badge:'Kết cục hoàn hảo', title:'Vụ án được phá giải trọn vẹn',
        body:`<p>Từng mảnh ghép khớp lại: chiếc đồng hồ bị chỉnh giờ để dựng khung thời gian giả, dấu vết ở cửa sổ chứng minh lối vào bí mật, và bức thư viết dở dẫn thẳng tới đối tác kinh doanh bí mật — Isolde Marsh.</p>
        <p>Bị phát hiện biển thủ quỹ và biết rõ sẽ bị đối chất vào sáng thứ Hai, bà đã leo qua dây thường xuân vào thư viện, đầu độc ly rượu vang, dàn dựng hiện trường giả rồi trèo ra ngoài, để rơi chiếc găng tay sau giá sách.</p>
        <p><strong>Bạn đã buộc tội đúng người, đúng phương thức và động cơ. Vụ án khép lại hoàn hảo!</strong></p>`},
      good:{badge:'Đúng người', title:'Kết luận đúng, còn vài khoảng trống',
        body:`<p>Bạn buộc tội đúng Isolde Marsh. Lập luận khá vững, dù còn một vài manh mối phụ bạn chưa kịp liên kết trọn vẹn.</p>`},
      bad:{badge:'Đúng người, sai lập luận', title:'Đoán đúng, nhưng không chứng minh được',
        body:`<p>Bạn chỉ đích danh đúng Isolde Marsh nhưng thiếu chứng cứ đối chiếu chặt chẽ, khiến bà ta kịp thời tẩu thoát trước khi lệnh bắt được ban hành.</p>`},
      incomplete:{badge:'Hồ sơ còn bỏ ngỏ', title:'Chưa đủ căn cứ để kết luận',
        body:`<p>Thời gian eo hẹp khiến bạn phải đưa ra kết luận khi còn quá nhiều mảnh ghép chưa được xem xét.</p>`},
      wrong_method:{badge:'Sai phương thức', title:'Đúng người, sai cách gây án',
        body:`<p>Bạn tìm ra Isolde Marsh nhưng mô tả sai cơ chế đầu độc và hiện trường phòng kín.</p>`},
      wrong_motive:{badge:'Sai động cơ', title:'Đúng người, sai nguyên nhân',
        body:`<p>Bạn không làm rõ được vụ biển thủ quỹ công ty, khiến động cơ vụ án thiếu thuyết phục.</p>`},
    },
    suspectEndings:{
      nephew:{badge:'Buộc tội sai', title:'Người cháu trai vô tội',
        body:`<p>Bạn buộc tội Arthur — nhưng cuống vé và 5 nhân chứng tại câu lạc bộ Pall Mall đã minh oan cho anh ta. Vụ buộc tội sụp đổ hoàn toàn.</p>`},
      butler:{badge:'Buộc tội sai', title:'Người quản gia vô tội',
        body:`<p>Bạn nghi ngờ Quản gia Leonard — nhưng phụ bếp xác nhận ông ở dưới bếp suốt đêm. Thủ phạm thực sự đã trốn thoát.</p>`},
    },
    replaySteps:[
      '"Một chiếc đồng hồ bị chỉnh giờ có chủ ý nhằm tạo khung thời gian chết giả."',
      '"Cửa khóa từ bên trong — nhưng dấu bùn dưới bệ cửa sổ và dây thường xuân bị đè gãy trả lời câu hỏi về lối vào."',
      '"Găng tay da nữ và mùi nước hoa oải hương chỉ ra một phụ nữ có mặt đêm đó."',
      '"Bức thư viết dở nhắc đến chữ cái I. — dẫn thẳng đến đối tác bí mật Isolde Marsh."',
    ],
    replayClues:['clock','mud','glove','letter']
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CASE_RAVENSCROFT;
}
