// ══════════════════════════════════════
// 🍪 VMM Training — Telegram Snack Reminder
// Chạy bởi GitHub Actions, gửi mẹo tập lén theo ngày/tuần
// ══════════════════════════════════════

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const SLOT = parseInt(process.env.SLOT || '0'); // 0-7 tương ứng 8 khung giờ

// ══════════════════════════════════════
// 📅 CẤU HÌNH
// ══════════════════════════════════════
const CFG = { start: '2026-03-17', race: '2026-09-19' };

// 8 khung giờ
const SLOTS = ['06:00','09:00','11:00','13:30','15:00','17:00','19:00','21:00'];
const SLOT_EMOJI = ['☀️','☕','🌤️','🍽️','⏰','🌇','🌙','🛏️'];
const SLOT_CONTEXT = [
  'Vừa dậy, khởi động nhẹ nào!',
  'Đến cơ quan rồi, tranh thủ tí!',
  'Giữa buổi sáng, nạp năng lượng!',
  'Sau ăn trưa, đừng ngồi yên!',
  'Chiều rồi, cơ thể cần vận động!',
  'Sắp tan làm, tập thêm chút!',
  'Tối rồi, tập nhẹ thư giãn!',
  'Trước ngủ, routine cuối ngày!'
];

// ══════════════════════════════════════
// 📊 DỮ LIỆU BÀI TẬP THEO TUẦN
// type: run|str|pick|rest|long
// ══════════════════════════════════════
const W = [
{w:1,t:'Làm quen lại — Run-Walk',d:{
  1:[{y:'str',t:'Bổ trợ thân dưới',i:['Squat','Lunge','Calf Raise','Single-leg Balance']}],
  2:[{y:'run',t:'Run-Walk 20\'',i:['Chạy 1\' → Đi bộ 3\'','Push-up','Plank','Superman']},{y:'pick',t:'Pickleball',i:['Giãn cơ bắp chân + cổ chân']}],
  3:[{y:'rest',t:'Nghỉ / Giãn cơ',i:['Ankle Circles','Calf Stretch','Foam Roll bắp chân']}],
  4:[{y:'run',t:'Run-Walk 25\'',i:['Chạy 1.5\' → Đi bộ 2.5\'','Push-up','Plank']}],
  5:[{y:'str',t:'Bổ trợ thân dưới',i:['Squat','Walking Lunge','Step-up','Calf Raise']}],
  6:[{y:'pick',t:'Pickleball',i:['Tập máy + đơn']},{y:'long',t:'Đi bộ nhanh/Run-Walk',i:['Tùy cổ chân sau pick']}],
  0:[{y:'pick',t:'Pick sáng + tối',i:['Giãn cơ kỹ giữa 2 trận']}]
}},
{w:2,t:'Run-Walk nâng cấp',d:{
  1:[{y:'str',t:'Bổ trợ thân dưới',i:['Squat','Lunge','Calf Raise','Clamshell']}],
  2:[{y:'run',t:'Run-Walk 25\'',i:['Chạy 2\' → Đi bộ 2\'','Push-up','Plank']},{y:'pick',t:'Pickleball',i:[]}],
  3:[{y:'rest',t:'Nghỉ / Giãn cơ',i:['Giãn cơ cổ chân + foam roll']}],
  4:[{y:'run',t:'Run-Walk 30\'',i:['Chạy 3\' → Đi bộ 2\'','Push-up','Plank']}],
  5:[{y:'str',t:'Bổ trợ thân dưới',i:['Squat','Walking Lunge','Step-up','Calf Raise']}],
  6:[{y:'pick',t:'Pickleball',i:[]},{y:'long',t:'Test chạy liên tục 2-3km',i:['Pace thoải mái']}],
  0:[{y:'pick',t:'Pick sáng + tối',i:[]}]
}},
{w:3,t:'Chạy liên tục 3-4km',d:{
  1:[{y:'str',t:'Bổ trợ thân dưới',i:['Squat','Lunge','Step-up','Calf Raise 1 chân']}],
  2:[{y:'run',t:'Easy Run 3-3.5km',i:['Chạy liên tục','Push-up','Plank']},{y:'pick',t:'Pickleball',i:[]}],
  3:[{y:'rest',t:'Nghỉ / Giãn cơ',i:['Giãn cơ + Foam roll']}],
  4:[{y:'run',t:'Easy Run 3.5-4km',i:['Nhịp thở 3-2','Push-up','Plank']}],
  5:[{y:'str',t:'Bổ trợ thân dưới',i:['Full routine + Glute Bridge']}],
  6:[{y:'pick',t:'Pickleball',i:[]},{y:'long',t:'Long Run 4-4.5km',i:['Easy pace']}],
  0:[{y:'pick',t:'Pick sáng + tối',i:[]}]
}},
{w:4,t:'DELOAD — Hồi phục',d:{
  1:[{y:'str',t:'Bổ trợ NHẸ',i:['Squat nhẹ','Giãn cơ + foam roll']}],
  2:[{y:'run',t:'Easy Run nhẹ 2.5-3km',i:['Recovery pace']},{y:'pick',t:'Pickleball',i:[]}],
  3:[{y:'rest',t:'Nghỉ hoàn toàn',i:['Ngủ đủ, ăn tốt']}],
  4:[{y:'run',t:'Easy Run 3km NHẸ',i:['Chill','Push-up nhẹ','Plank']}],
  5:[{y:'rest',t:'Nghỉ / Mobility',i:['Giãn cơ toàn thân']}],
  6:[{y:'pick',t:'Pickleball nhẹ',i:[]},{y:'run',t:'Đi bộ nhanh/chạy nhẹ',i:[]}],
  0:[{y:'pick',t:'Pick nhẹ nhàng',i:[]}]
}},
{w:5,t:'Đột phá 5km 🎯',d:{
  1:[{y:'str',t:'Bổ trợ thân dưới',i:['Squat','Walking Lunge','Step-up','Calf Raise 1 chân']}],
  2:[{y:'run',t:'Easy Run 3.5km',i:['Easy pace','Push-up','Plank']},{y:'pick',t:'Pickleball',i:[]}],
  3:[{y:'rest',t:'Nghỉ / Giãn cơ',i:[]}],
  4:[{y:'run',t:'Easy Run 4km',i:['Cadence cao sải ngắn','Push-up','Plank']}],
  5:[{y:'str',t:'Bổ trợ thân dưới',i:['Full routine + Glute Bridge']}],
  6:[{y:'pick',t:'Pickleball',i:[]},{y:'long',t:'Long Run 5km',i:['Easy pace 🎯']}],
  0:[{y:'pick',t:'Pick sáng + tối',i:[]}]
}},
{w:6,t:'Ổn định 5-6km',d:{
  1:[{y:'str',t:'Bổ trợ + Đi bộ nhanh',i:['Full routine','Đi bộ nhanh 20\'']}],
  2:[{y:'run',t:'Easy Run 4km',i:['Easy 4km']},{y:'pick',t:'Pickleball',i:[]}],
  3:[{y:'run',t:'Easy Run 3.5km',i:['Easy 3.5km']}],
  4:[{y:'str',t:'Bổ trợ thân dưới',i:['Full routine']}],
  5:[{y:'rest',t:'Nghỉ (Pre-Long Run)',i:[]}],
  6:[{y:'pick',t:'Pickleball',i:[]},{y:'long',t:'Long Run 5.5-6km',i:['Easy pace']}],
  0:[{y:'pick',t:'Pick sáng + tối',i:[]}]
}},
{w:7,t:'Tiến tới 7km',d:{
  1:[{y:'str',t:'Bổ trợ thân dưới',i:['Full routine']}],
  2:[{y:'run',t:'Easy Run 4-4.5km',i:['Easy 4-4.5km']},{y:'pick',t:'Pickleball',i:[]}],
  3:[{y:'run',t:'Easy Run 4km',i:['Easy 4km']}],
  4:[{y:'str',t:'Bổ trợ thân dưới',i:['Full routine']}],
  5:[{y:'rest',t:'Nghỉ (Pre-Long Run)',i:[]}],
  6:[{y:'pick',t:'Pickleball',i:[]},{y:'long',t:'Long Run 6.5-7km',i:['Easy pace']}],
  0:[{y:'pick',t:'Pick sáng + tối',i:[]}]
}},
{w:8,t:'Chinh phục 8km 🏆',d:{
  1:[{y:'str',t:'Bổ trợ thân dưới',i:['Full routine']}],
  2:[{y:'run',t:'Easy Run 4.5-5km',i:['Easy 4.5-5km']},{y:'pick',t:'Pickleball',i:[]}],
  3:[{y:'run',t:'Easy Run 4km',i:['Easy 4km']}],
  4:[{y:'str',t:'Bổ trợ thân dưới',i:['Full routine']}],
  5:[{y:'rest',t:'Nghỉ (Pre-Long Run)',i:[]}],
  6:[{y:'pick',t:'Pickleball',i:[]},{y:'long',t:'Long Run 8km 🏆',i:['Easy pace, enjoy!']}],
  0:[{y:'pick',t:'Pick sáng + tối 🎉',i:[]}]
}}
];

// ══════════════════════════════════════
// 🍪 NGÂN HÀNG MẸO TẬP LÉN
// ══════════════════════════════════════
const SNACK_DB = [
  // Calf Raise
  {k:['Calf Raise','calf'], tips:[
    'Đợi nước nóng → kiễng gót 15 cái, hạ chậm 3 giây 🦵',
    'Rửa bát → kiễng gót 1 chân, 10 cái rồi đổi chân 🍽️',
    'Đứng chờ thang máy → kiễng gót 10 cái 🏢',
    'Đang nấu ăn → kiễng gót chậm 15 cái, tập cơ bắp chân 🍳',
  ]},
  // Balance
  {k:['Balance','1 chân','thăng bằng'], tips:[
    'Đánh răng → đứng 1 chân trái 1 phút, đổi chân phải 🪥',
    'Chờ pha trà/cà phê → đứng 1 chân 30 giây ☕',
    'Đợi xe buýt/grab → đứng 1 chân luyện thăng bằng 🚌',
  ]},
  // Squat
  {k:['Squat','squat'], tips:[
    'Mỗi lần ngồi xuống ghế → squat hover 3 giây rồi mới ngồi 🪑',
    'Đi vệ sinh xong → squat 10 cái trước khi ra 🚿',
    'Lấy đồ dưới thấp → squat thay vì cúi lưng 📦',
  ]},
  // Plank
  {k:['Plank','plank'], tips:[
    'Chờ file tải / build code → plank 30 giây 💻',
    'Quảng cáo TV → plank tới hết quảng cáo 📺',
    'Họp online tắt cam → plank 20 giây 🎧',
  ]},
  // Glute Bridge
  {k:['Glute Bridge','glute','nâng hông'], tips:[
    'Trước ngủ trên giường → nâng hông 15 cái, giữ 2 giây 🛏️',
    'Nằm xem youtube → tranh thủ nâng hông 20 cái 📱',
  ]},
  // Lunge
  {k:['Lunge','lunge','Walking Lunge'], tips:[
    'Đi hành lang cơ quan → walking lunge 5-8 bước 🏢',
    'Từ bàn ra toilet → lunge walk luôn 🚶',
  ]},
  // Foam Roll
  {k:['Foam Roll','foam','Giãn cơ'], tips:[
    'Xem TV tối → foam roll bắp chân 5 phút 📺',
    'Trước ngủ → giãn cơ bắp chân 2 phút mỗi bên 🌙',
  ]},
  // Push-up
  {k:['Push-up','chống đẩy'], tips:[
    'Quảng cáo TV → push-up 10 cái 📺',
    'Chờ microwave → push-up bám bàn bếp 10 cái 🍳',
    'Vừa dậy → push-up 5 cái cho tỉnh ngủ ☀️',
  ]},
  // Superman
  {k:['Superman'], tips:[
    'Trước ngủ trên giường → superman 10 cái, giữ 3 giây 🛏️',
  ]},
  // Step-up
  {k:['Step-up'], tips:[
    'Gặp bậc thang → step-up 5 cái mỗi chân trước khi đi tiếp 🪜',
  ]},
  // General / Rest day
  {k:['rest','Nghỉ','Giãn cơ','Ankle','Calf Stretch'], tips:[
    'Ngồi lâu → đứng lên vươn vai, xoay cổ chân 10 vòng 🧘',
    'Dưới bàn làm việc → xoay cổ chân, co duỗi 🦶',
    'Khi ngồi → kéo giãn bắp chân bằng khăn 30 giây 🧣',
  ]},
];

// ══════════════════════════════════════
// 🎯 LOGIC CHÍNH
// ══════════════════════════════════════
function getWeekAndDay() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const start = new Date(CFG.start);
  const diff = Math.floor((now - start) / 86400000);
  const week = diff < 0 ? 0 : Math.min(Math.floor(diff / 7) + 1, 9);
  const dow = now.getDay(); // 0=CN, 1=T2...
  return { week, dow, now };
}

function getSnacksForDay(week, dow) {
  if (week < 1 || week > 8) return [];
  const wk = W[week - 1];
  const sessions = wk.d[dow] || [];
  const allKeywords = sessions.flatMap(s => [s.t, ...s.i].join(' ')).join(' ').toLowerCase();
  
  const matched = [];
  for (const group of SNACK_DB) {
    if (group.k.some(k => allKeywords.includes(k.toLowerCase()))) {
      matched.push(...group.tips);
    }
  }
  
  // Nếu không match → dùng general tips
  if (matched.length === 0) {
    matched.push(...SNACK_DB[SNACK_DB.length - 1].tips);
  }
  
  return matched;
}

function pickTip(tips, slot) {
  // Chọn tip dựa trên slot để không trùng trong ngày
  return tips[slot % tips.length];
}

function buildMessage(week, dow, slot) {
  const DAYS = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
  const ICONS = {run:'🏃',str:'💪',pick:'🏓',rest:'😴',long:'🔵'};
  
  const emoji = SLOT_EMOJI[slot];
  const time = SLOTS[slot];
  const context = SLOT_CONTEXT[slot];
  
  if (week < 1) {
    return `${emoji} *${time} — Chưa bắt đầu*\n\n` +
      `📅 Tuần 1 bắt đầu ngày 17/03.\n` +
      `Hôm nay nghỉ ngơi, chuẩn bị tinh thần! 🏔️`;
  }
  
  if (week > 8) {
    return `${emoji} *${time} — Giai đoạn 1 hoàn thành!*\n\n` +
      `🏆 Bạn đã vượt qua 8 tuần đầu tiên!\nSẵn sàng cho Giai đoạn 2! 💪`;
  }
  
  const wk = W[week - 1];
  const sessions = wk.d[dow] || [];
  const tips = getSnacksForDay(week, dow);
  const tip = pickTip(tips, slot);
  
  // Mô tả bài tập hôm nay
  const todayPlan = sessions.length > 0
    ? sessions.map(s => `${ICONS[s.y]||'📋'} ${s.t}`).join('\n')
    : '😴 Nghỉ ngơi';
  
  let msg = `🍪 *MẸO TẬP LÉN — ${time}*\n`;
  msg += `${emoji} ${context}\n\n`;
  msg += `👉 *${tip}*\n\n`;
  msg += `━━━━━━━━━━━━━━━━━\n`;
  msg += `📅 ${DAYS[dow]} — Tuần ${week}/8: _${wk.t}_\n`;
  msg += `${todayPlan}\n`;
  
  // Lời động viên theo slot
  if (slot === 0) msg += `\n🌅 Ngày mới, cơ hội mới! Cố lên!`;
  if (slot === 7) msg += `\n🌙 Ngày tốt lành! Nghỉ ngơi nhé!`;
  
  return msg;
}

// ══════════════════════════════════════
// 📤 GỬI TIN NHẮN
// ══════════════════════════════════════
async function sendMessage(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    })
  });
  const data = await res.json();
  if (!data.ok) throw new Error(JSON.stringify(data));
  console.log(`✅ Sent slot ${SLOT} at ${SLOTS[SLOT]}`);
  return data;
}

// ══════════════════════════════════════
// 🚀 CHẠY
// ══════════════════════════════════════
async function main() {
  const { week, dow } = getWeekAndDay();
  console.log(`Week: ${week}, Day: ${dow}, Slot: ${SLOT} (${SLOTS[SLOT]})`);
  const msg = buildMessage(week, dow, SLOT);
  console.log(msg);
  await sendMessage(msg);
}

main().catch(e => { console.error(e); process.exit(1); });
