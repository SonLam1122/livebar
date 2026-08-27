// =========================================================================
// DASHBOARD CONSTANTS & STATIC CATALOGS
// =========================================================================

const DEMO_USERS = [
  { username: 'nguoi_xem_demo1', name: 'Khán giả Demo', avatar: '/api/avatars/nguoi_xem_demo1.svg' },
  { username: 'thanh_hoa_12', name: 'Thanh Hoa Streamer', avatar: '/api/avatars/nguoi_xem_demo2.svg' },
  { username: 'hoang_long_vip', name: 'Hoàng Long VIP', avatar: '/api/avatars/nguoi_xem_demo3.svg' },
  { username: 'minh_thu_cute', name: 'Minh Thư ✨', avatar: '/api/avatars/nguoi_xem_demo4.svg' },
  { username: 'bao_ngoc_99', name: 'Bảo Ngọc 👑', avatar: '/api/avatars/nguoi_xem_demo5.svg' },
  { username: 'tuan_kiet_pro', name: 'Tuấn Kiệt 💎', avatar: '/api/avatars/nguoi_xem_demo6.svg' }
];

const FOOTBALL_STADIUMS = [
  { url: "/football-duel/stadium-field.png", label: "Sân cỏ truyền thống", hint: "Mặt cỏ tự nhiên chuẩn quốc tế" },
  { url: "/football-duel/stadium-field-night.png", label: "Đêm xanh", hint: "Ánh đèn sân vận động rực rỡ" },
  { url: "/football-duel/stadium-field-sunset.png", label: "Hoàng hôn", hint: "Ánh chiều tà ấm áp kịch tính" },
  { url: "/football-duel/stadium-field-neon.png", label: "Cúp neon", hint: "Phong cách Cyberpunk tương lai" }
];

const FOOTBALL_PLAYERS = [
  { id: "ronaldo", label: "🇵🇹 Ronaldo · 7", idleUrl: "/football-duel/ronaldo-idle.png", kickUrl: "/football-duel/ronaldo-kick.png" },
  { id: "messi", label: "🇦🇷 Messi · 10", idleUrl: "/football-duel/messi-idle.png", kickUrl: "/football-duel/messi-kick.png" },
  { id: "mbappe", label: "🇫🇷 Mbappé · 9", idleUrl: "/football-duel/mbappe-idle.png", kickUrl: "/football-duel/mbappe-kick.png" },
  { id: "haaland", label: "🇳🇴 Haaland · 9", idleUrl: "/football-duel/haaland-idle.png", kickUrl: "/football-duel/haaland-kick.png" },
  { id: "neymar", label: "🇧🇷 Neymar · 10", idleUrl: "/football-duel/neymar-idle.png", kickUrl: "/football-duel/neymar-kick.png" },
  { id: "yamal", label: "🇪🇸 Yamal · 19", idleUrl: "/football-duel/yamal-idle.png", kickUrl: "/football-duel/yamal-kick.png" },
  { id: "vinicius", label: "🇧🇷 Vinícius · 7", idleUrl: "/football-duel/vinicius-idle.png", kickUrl: "/football-duel/vinicius-kick.png" },
  { id: "kane", label: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Kane · 9", idleUrl: "/football-duel/kane-idle.png", kickUrl: "/football-duel/kane-kick.png" }
];

const ARMY_GROUNDS = [
  { id: "transparent", label: "Không lát", hint: "Để lộ cảnh OBS phía sau chiến trường", url: "" },
  { id: "bamboo", label: "Rừng tre", hint: "Sáng, xanh — hợp mọi kênh", url: "/army/ground-bamboo.webp" },
  { id: "snow", label: "Đồng tuyết", hint: "Lạnh, tương phản cao, quân nổi rõ nhất", url: "/army/ground-snow.webp" },
  { id: "volcano", label: "Hoả ngục", hint: "Tối, gắt — hợp kênh game", url: "/army/ground-volcano.webp" },
  { id: "ancient_castle_night", label: "Thành cổ ban đêm", hint: "Xanh đen, hào nước — không khí công thành", url: "/army/ground-castle-night.webp" },
  { id: "desert_sunset", label: "Sa mạc hoàng hôn", hint: "Đỏ nâu, rộng thoáng — quân nổi rõ", url: "/army/ground-desert-sunset.webp" },
  { id: "swamp", label: "Đầm lầy ma ám", hint: "Xanh độc, sương mờ — bí hiểm", url: "/army/ground-swamp.webp" },
  { id: "sakura_night", label: "Rừng anh đào đêm", hint: "Tím hồng dịu — hợp kênh nhẹ nhàng", url: "/army/ground-sakura.webp" },
  { id: "temple_forest", label: "Đền cổ trong rừng", hint: "Ngọc bích, rêu đá — không khí huyền sử", url: "/army/ground-temple.webp" },
  { id: "crystal_cave", label: "Hang pha lê", hint: "Tím lam phát sáng — kỳ ảo", url: "/army/ground-crystal.webp" },
  { id: "pirate_ship", label: "Tàu cướp biển", hint: "Boong tàu giữa bão — đậm chất phiêu lưu", url: "/army/ground-pirate.webp" },
  { id: "blood_moon_cemetery", label: "Nghĩa địa trăng máu", hint: "Đỏ đen, sương lạnh — rùng rợn", url: "/army/ground-blood-moon.webp" },
  { id: "candy_curse", label: "Xứ kẹo bị nguyền", hint: "Ngọt ngào nhưng u tối — vui nhộn khác lạ", url: "/army/ground-candy.webp" },
  { id: "mecha_arena", label: "Đấu trường máy móc", hint: "Thép tối, lửa máy — hợp kênh công nghệ", url: "/army/ground-mecha.webp" },
  { id: "lightning_field", label: "Cánh đồng sấm sét", hint: "Tím đen, điện xanh — căng thẳng", url: "/army/ground-lightning.webp" },
  { id: "post_apocalypse", label: "Thành phố hậu tận thế", hint: "Bê tông, khói bụi — chiến trường hiện đại", url: "/army/ground-post-apocalypse.webp" }
];

const ARMY_HEROES = [
  { id: "panda", label: "Gấu Trúc Võ Sĩ", hint: "Mập, chắc, hợp kênh vui nhộn", url: "/army/hero-panda.webp", skill: "Trấn Thủ" },
  { id: "dragon", label: "Rồng Phương Đông", hint: "Uy nghi, hợp kênh cổ trang", url: "/army/hero-dragon.webp", skill: "Phun Lửa" },
  { id: "golem", label: "Người Đá Nham Thạch", hint: "To nặng, đọc ra ngay là món đắt nhất", url: "/army/hero-golem.webp", skill: "Húc" },
  { id: "tiger", label: "Hổ Chiến", hint: "Nhanh, hung, hợp kênh game", url: "/army/hero-tiger.webp", skill: "Vồ" }
];

const CHAINSAW_FLOORS = [
  { id: "transparent", label: "Không lát", hint: "Ô đấu trường trong mờ, cảnh OBS phía sau xuyên qua", url: "" },
  { id: "sawmill", label: "Xưởng cưa", hint: "Thép tấm xỉn màu, mùn cưa và vệt dầu — tông mặc định của game", url: "/chainsaw/floor-sawmill.webp" },
  { id: "concrete", label: "Sàn bê tông", hint: "Bê tông xám lạnh, ít chi tiết — hợp kênh esport và phong cách tối giản", url: "/chainsaw/floor-concrete.webp" },
  { id: "arena", label: "Sàn đấu võ đài", hint: "Gỗ sẫm cũ và viền sơn mờ — hợp kênh làm show, có chất sân khấu", url: "/chainsaw/floor-arena.webp" }
];
