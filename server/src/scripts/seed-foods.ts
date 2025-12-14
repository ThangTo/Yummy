/**
 * Script để seed dữ liệu món ăn vào database
 * Chạy: npm run seed:foods
 *
 * Danh sách món ăn theo thứ tự training của AI models
 */

import { connectDB } from '../config/db';
import { Food } from '../models/Food';

// Danh sách món ăn theo đúng thứ tự training (từ class_names.json)
const foodsData = [
  {
    name_key: 'banh_beo',
    name_vi: 'Bánh Bèo',
    province_name: 'Huế',
    how_to_eat:
      'Chan nước mắm ngọt trực tiếp lên chén, dùng thìa tre hoặc muỗng nhỏ xúc ăn kèm tôm chấy và da heo chiên giòn.',
    story:
      'Món bánh dân dã từ ngự thiện cung đình Huế. Tên gọi "bánh bèo" xuất phát từ hình dáng mỏng, tròn như lá bèo. Một mâm bánh bèo đúng điệu miền Trung phải có "nhụy" tôm chấy đỏ au và tóp mỡ giòn rụm.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/B%C3%A1nh_b%C3%A8o_Quy_Nhon.JPG',
  },
  {
    name_key: 'banh_bot_loc',
    name_vi: 'Bánh Bột Lọc',
    province_name: 'Huế',
    how_to_eat:
      'Bóc lá chuối (nếu có), chấm ngập vào nước mắm cốt pha ớt cay nồng. Có thể ăn kèm chả cây.',
    story:
      'Đặc sản cố đô làm từ bột năng (tinh bột sắn), khi hấp chín trở nên trong suốt lộ rõ nhân tôm thịt đỏ au bên trong. Vỏ bánh dai sần sật quyện với vị đậm đà của nhân tôm rim là tinh hoa ẩm thực Huế.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/e/ed/B%C3%A1nh_b%E1%BB%99t_l%E1%BB%8Dc_saigonnais.jpg',
  },
  {
    name_key: 'banh_can',
    name_vi: 'Bánh Căn',
    province_name: 'Nha Trang',
    how_to_eat:
      'Nhúng ngập cặp bánh vào chén nước mắm pha mỡ hành, xoài bằm và xíu mại, ăn khi còn nóng hổi.',
    story:
      'Xuất phát từ món bánh nướng của người Chăm ở Ninh Thuận, khi đến Nha Trang đã biến tấu thêm hải sản. Bánh được nướng trên khuôn đất nung, không dùng dầu mỡ, dậy mùi thơm của gạo và trứng.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/e/e9/B%C3%A1nh_c%C4%83n_in_phan_rang%2C_vietnam.jpg',
  },
  {
    name_key: 'banh_canh',
    name_vi: 'Bánh Canh',
    province_name: 'Thành phố Hồ Chí Minh',
    how_to_eat:
      'Dùng thìa và đũa, vắt thêm chanh, ớt sa tế. Thường ăn kèm bánh quẩy chấm nước lèo sệt.',
    story:
      'Món ăn có sợi bánh to và dày làm từ bột gạo hoặc bột lọc. Nước dùng thường nấu sệt và ngọt thanh từ xương, phổ biến nhất là bánh canh cua, ghẹ hoặc giò heo, thể hiện sự phóng khoáng trong khẩu vị người miền Nam.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Banh-Canh-Noodle-Soup.jpg',
  },
  {
    name_key: 'banh_chung',
    name_vi: 'Bánh Chưng',
    province_name: 'Hà Nội',
    how_to_eat:
      'Dùng chính dây lạt gói bánh để cắt thành miếng tam giác. Ăn kèm dưa hành muối chua để cân bằng vị béo.',
    story:
      'Biểu tượng ẩm thực Tết Nguyên Đán, gắn liền với truyền thuyết Lang Liêu đời Hùng Vương. Hình vuông tượng trưng cho Đất, gói trọn tinh hoa đồng ruộng (gạo nếp, đậu xanh, thịt lợn) trong màu xanh lá dong.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Banh_chung_vuong.jpg',
  },
  {
    name_key: 'banh_cuon',
    name_vi: 'Bánh Cuốn',
    province_name: 'Hà Nội',
    how_to_eat:
      'Gắp miếng bánh nóng hổi, chấm nước mắm cà cuống (truyền thống) hoặc nước mắm chua ngọt, ăn kèm chả quế.',
    story:
      'Món quà sáng thanh tao của người Hà Nội, nổi tiếng nhất là bánh cuốn Thanh Trì. Bánh được tráng mỏng tang như tờ giấy, nhân thịt mộc nhĩ thơm lừng, hành phi giòn rụm rắc lên trên khơi dậy vị giác.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Banh_cuon.jpg',
  },
  {
    name_key: 'banh_duc',
    name_vi: 'Bánh Đúc',
    province_name: 'Hà Nội',
    how_to_eat:
      'Nếu là bánh đúc nóng: Xúc ăn cùng thịt băm mộc nhĩ, chan nước mắm ấm. Nếu là bánh đúc lạc: Chấm tương bần.',
    story:
      'Món ăn quê mùa của miền Bắc. Xưa kia bánh đúc lạc là món ăn no, chắc dạ. Ngày nay, bánh đúc nóng dẻo quánh, chan nước mắm chua ngọt, thêm rau mùi là thức quà chiều gây thương nhớ trong tiết trời se lạnh.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Banhduc-northern.jpg',
  },
  {
    name_key: 'banh_gio',
    name_vi: 'Bánh Giò',
    province_name: 'Hà Nội',
    how_to_eat:
      'Dùng thìa xúc ăn nóng, thường ăn kèm dưa góp (dưa leo muối), tương ớt và chả cốm hoặc xúc xích.',
    story:
      'Thức quà bình dân hình chóp, gói trong lá chuối dày. Vỏ bánh làm từ bột gạo tẻ mềm tan, nhân thịt băm mộc nhĩ đậm đà. Bánh giò là món ăn lót dạ quen thuộc của người Hà Thành mọi lứa tuổi.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/B%C3%A1nh_gi%C3%B2.jpg',
  },
  {
    name_key: 'banh_khot',
    name_vi: 'Bánh Khọt',
    province_name: 'Vũng Tàu',
    how_to_eat:
      'Cuốn bánh trong lá xà lách và rau thơm, thêm chút đu đủ ngâm chua, chấm ngập nước mắm chua ngọt.',
    story:
      'Đặc sản trứ danh Vũng Tàu. Tên gọi "khọt" được cho là âm thanh khi đổ bột vào khuôn dầu sôi. Bánh có lớp vỏ vàng giòn rụm, nhân tôm tươi rói, ăn kèm rau sống tạo nên sự cân bằng hoàn hảo.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/B%C3%A1nh_kh%E1%BB%8Dt.jpg',
  },
  {
    name_key: 'banh_mi',
    name_vi: 'Bánh Mì',
    province_name: 'Thành phố Hồ Chí Minh',
    how_to_eat:
      'Cắn trực tiếp miếng lớn để cảm nhận độ giòn của vỏ và nhân đậm đà. Có thể rưới thêm nước tương hoặc tương ớt.',
    story:
      'Sự giao thoa hoàn hảo giữa ẩm thực Pháp (baguette) và Việt Nam. Bánh mì Sài Gòn nổi danh thế giới nhờ vỏ bánh giòn xốp và nhân biến tấu vô tận: pate, thịt nguội, chả lụa, đồ chua, rau ngò.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/01_Baoguette_Pork_Banh_Mi.jpg/800px-01_Baoguette_Pork_Banh_Mi.jpg',
  },
  {
    name_key: 'banh_pia',
    name_vi: 'Bánh Pía',
    province_name: 'Sóc Trăng',
    how_to_eat: 'Cắt bánh thành miếng nhỏ, thưởng thức chậm rãi cùng trà nóng để làm dịu vị ngọt.',
    story:
      'Có nguồn gốc từ người Triều Châu di cư. "Pía" âm đọc là "bánh". Đặc trưng là lớp vỏ ngàn lớp mỏng manh bao bọc nhân đậu xanh, sầu riêng và trứng muối thơm lừng, là niềm tự hào của vùng đất Sóc Trăng.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/60/B%C3%A1nh_p%C3%ADa.JPG',
  },
  {
    name_key: 'banh_tet',
    name_vi: 'Bánh Tét',
    province_name: 'Miền Nam',
    how_to_eat: 'Cắt khoanh tròn bằng dây lạt, ăn kèm củ kiệu, tôm khô hoặc chiên giòn để đổi vị.',
    story:
      'Biểu tượng Tết phương Nam, biến thể từ bánh chưng nhưng gói hình trụ tròn để phù hợp khí hậu nóng (dễ bảo quản hơn). Nhân bánh tét đa dạng từ nhân mặn (thịt mỡ) đến nhân ngọt (chuối, đậu đen).',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Banh_tet_chien.jpg',
  },
  {
    name_key: 'banh_trang_nuong',
    name_vi: 'Bánh Tráng Nướng',
    province_name: 'Đà Lạt',
    how_to_eat:
      'Cắt miếng tam giác như pizza hoặc cuộn tròn lại, ăn nóng ngay tại lò than, chấm tương ớt hoặc sốt me.',
    story:
      'Mệnh danh là "Pizza Việt Nam". Món ăn đường phố đặc trưng của Đà Lạt, nơi bánh tráng mỏng được nướng giòn tan trên than hồng cùng trứng, hành lá, tép khô, phô mai, xua tan cái lạnh phố núi.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Pizzabanhtrangnuong3.JPG',
  },
  {
    name_key: 'banh_xeo',
    name_vi: 'Bánh Xèo',
    province_name: 'Miền Nam',
    how_to_eat:
      'Cắt miếng, cuốn trong lá cải bẹ xanh hoặc bánh tráng cùng nhiều loại rau rừng, chấm nước mắm chua ngọt.',
    story:
      'Tên gọi đến từ tiếng "xèo xèo" vui tai khi đổ bột vào chảo gang nóng. Bánh xèo miền Tây to như cái mâm, vỏ mỏng giòn tan, màu vàng nghệ bắt mắt, nhân tôm thịt giá đỗ đầy đặn.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/B%C3%A1nh_x%C3%A8o_%2815826153307%29.jpg/800px-B%C3%A1nh_x%C3%A8o_%2815826153307%29.jpg',
  },
  {
    name_key: 'bun_bo_hue',
    name_vi: 'Bún Bò Huế',
    province_name: 'Huế',
    how_to_eat:
      'Vắt chanh, thêm ớt sa tế, ăn kèm rau sống (bắp chuối bào, rau muống chẻ). Húp nước dùng đậm đà vị mắm ruốc.',
    story:
      'Linh hồn của ẩm thực cố đô. Nét đặc sắc nằm ở nước dùng hầm từ xương bò có vị mắm ruốc và sả đặc trưng. Một tô đầy đủ có giò heo, chả cua, huyết và sợi bún to, mang vị cay nồng đúng chất Huế.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/B%C3%BAn_b%C3%B2_Hu%E1%BA%BF_-_Ch%E1%BB%A3_%C4%90%C3%B4ng_Ba_%282024%29_-_img_02.jpg/800px-B%C3%BAn_b%C3%B2_Hu%E1%BA%BF_-_Ch%E1%BB%A3_%C4%90%C3%B4ng_Ba_%282024%29_-_img_02.jpg',
  },
  {
    name_key: 'bun_dau_mam_tom',
    name_vi: 'Bún Đậu Mắm Tôm',
    province_name: 'Hà Nội',
    how_to_eat:
      'Đánh bông mắm tôm với chanh đường. Gắp bún lá, đậu rán, chả cốm chấm đẫm vào bát mắm tôm.',
    story:
      'Món ăn dân dã gây nghiện của Hà Nội. Sự kết hợp giữa bún lá ép chặt, đậu phụ Mơ rán giòn ngoài mềm trong và mắm tôm dậy mùi. Món ăn kén người nhưng ai đã mê thì khó lòng dứt.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/0/06/B%C3%BAn_%C4%91%E1%BA%ADu_m%E1%BA%AFm_t%C3%B4m_%282019%29.jpg',
  },
  {
    name_key: 'bun_mam',
    name_vi: 'Bún Mắm',
    province_name: 'Miền Tây',
    how_to_eat:
      'Ăn nóng kèm theo dĩa rau sống "khổng lồ" gồm bông súng, điên điển, rau đắng, kèo nèo.',
    story:
      'Biến tấu từ mắm kho của người Khmer. Nước lèo được nấu từ mắm cá linh hoặc cá sặc, lọc kỹ xương, có mùi thơm nồng nàn đặc trưng. Topping phong phú với tôm, mực, cá lóc và heo quay.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/B%C3%BAn_m%E1%BA%AFm.jpg',
  },
  {
    name_key: 'bun_rieu',
    name_vi: 'Bún Riêu',
    province_name: 'Hà Nội',
    how_to_eat: 'Thêm chút mắm tôm, giấm bỗng và ớt chưng. Ăn kèm rau kinh giới, xà lách thái nhỏ.',
    story:
      'Món bún giải nhiệt mùa hè với vị chua thanh từ giấm bỗng hoặc me, vị ngọt từ cua đồng giã tay. Gạch cua đóng tảng vàng ươm, nước dùng màu đỏ cà chua tạo nên vẻ đẹp bình dị mà quyến rũ.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Bun_rieu_with_herbs.jpg/800px-Bun_rieu_with_herbs.jpg',
  },
  {
    name_key: 'bun_thit_nuong',
    name_vi: 'Bún Thịt Nướng',
    province_name: 'Thành phố Hồ Chí Minh',
    how_to_eat:
      'Trộn đều bún với thịt, mỡ hành, đậu phộng rang và chan nước mắm chua ngọt xâm xấp.',
    story:
      'Món bún khô (bún trộn) phổ biến miền Nam. Sức hấp dẫn đến từ thịt nướng sả thơm lừng, chả giò giòn rụm và sự tươi mát của rau sống, dưa leo băm, hòa quyện trong nước mắm tỏi ớt.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Bun_thit_nuong.jpg',
  },
  {
    name_key: 'ca_kho_to',
    name_vi: 'Cá Kho Tộ',
    province_name: 'Miền Nam',
    how_to_eat: 'Ăn với cơm trắng nóng hổi, chấm rau luộc vào nước kho kẹo đậm đà.',
    story:
      'Món ăn đưa cơm số một trong bữa cơm gia đình Nam Bộ. Cá (thường là cá lóc, cá kèo) được kho trong niêu đất với nước màu dừa, tiêu sọ và nước mắm cho đến khi nước sền sệt, thịt cá săn cứng.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/8/87/C%C3%A1_kho_t%E1%BB%99%2C_c%C3%A1_h%C3%BA.jpg',
  },
  {
    name_key: 'canh_chua',
    name_vi: 'Canh Chua',
    province_name: 'Miền Nam',
    how_to_eat: 'Chan nước canh vào cơm hoặc bún, chấm cá với nước mắm mặn dầm ớt hiểm.',
    story:
      'Đại diện tiêu biểu cho vị giác miền Tây: chua, cay, ngọt, mặn hài hòa. Nấu từ cá đồng (lóc, bông lau) với me chua, dứa, cà chua và các loại rau đặc trưng như bạc hà, đậu bắp, ngò gai.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Canhchua2.jpg',
  },
  {
    name_key: 'cao_lau',
    name_vi: 'Cao Lầu',
    province_name: 'Hội An',
    how_to_eat:
      'Trộn đều sợi mì với thịt xá xíu, rau sống (cải con), da heo chiên giòn và ít nước sốt đậm đà dưới đáy.',
    story:
      'Món ăn "huyền thoại" phố Hội, có nguồn gốc giao thoa Hoa - Nhật - Việt. Sợi cao lầu dai sần sật đặc biệt nhờ được ngâm nước tro lấy từ Cù Lao Chàm và nước giếng Bá Lễ ngàn năm tuổi.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Cao_l%E1%BA%A7u_H%E1%BB%99i_An.jpg',
  },
  {
    name_key: 'chao_long',
    name_vi: 'Cháo Lòng',
    province_name: 'Hà Nội',
    how_to_eat:
      'Rắc thêm tiêu, hành, ăn nóng kèm quẩy giòn và chấm lòng vào nước mắm cốt hoặc mắm tôm.',
    story:
      'Món cháo nấu từ nước luộc lòng và huyết heo, gạo rang thơm nức. Bát cháo sánh mịn, nâu sẫm, ăn cùng dồi tiết, gan, tim luộc... là thức quà sáng hoặc món nhậu bình dân lâu đời.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Ch%C3%A1o_l%C3%B2ng.jpg',
  },
  {
    name_key: 'com_tam',
    name_vi: 'Cơm Tấm',
    province_name: 'Thành phố Hồ Chí Minh',
    how_to_eat:
      'Rưới nước mắm kẹo lên sườn và cơm, dùng thìa và nĩa để ăn. Thường kèm đồ chua để đỡ ngán.',
    story:
      'Từ món ăn của người lao động nghèo (tận dụng gạo tấm vỡ), nay trở thành "vua" ẩm thực đường phố Sài Gòn. Đĩa cơm tấm sà bì chưởng (sườn, bì, chả) với mỡ hành và nước mắm pha kẹo là hương vị khó quên.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Com-Tam-2008.jpg',
  },
  {
    name_key: 'goi_cuon',
    name_vi: 'Gỏi Cuốn',
    province_name: 'Miền Nam',
    how_to_eat:
      'Cầm tay chấm trực tiếp vào tương đen (có đậu phộng, hành phi) hoặc mắm nêm đậm đà.',
    story:
      'Món ăn lọt top ngon nhất thế giới, đại diện cho sự tươi mát (fresh) của ẩm thực Việt. Bánh tráng mỏng cuốn tôm luộc đỏ au, thịt ba chỉ, bún tươi và rau hẹ, vừa nhẹ bụng vừa đủ chất.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/03/G%E1%BB%8Fi_cu%E1%BB%91n.jpg',
  },
  {
    name_key: 'hu_tieu',
    name_vi: 'Hủ Tiếu',
    province_name: 'Thành phố Hồ Chí Minh',
    how_to_eat:
      'Có thể ăn nước hoặc ăn khô (trộn sốt hắc xì dầu, kèm chén nước súp riêng). Thêm chanh, giá, hẹ.',
    story:
      'Gốc từ người Tiều (Trung Hoa), du nhập qua Campuchia (Nam Vang) rồi về Sài Gòn. Sợi hủ tiếu dai, nước lèo ngọt từ xương ống và mực khô. Hủ tiếu gõ là nét văn hóa đêm đặc trưng của Sài thành.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/6/61/H%E1%BB%A7_ti%E1%BA%BFu_Nam_Vang.jpg',
  },
  {
    name_key: 'mi_quang',
    name_vi: 'Mì Quảng',
    province_name: 'Đà Nẵng',
    how_to_eat:
      'Bẻ bánh tráng nướng vào tô, trộn đều với rất ít nước lèo (xâm xấp), ăn kèm rau sống và ớt xanh.',
    story:
      'Hồn cốt của xứ Quảng Nam - Đà Nẵng. Sợi mì to màu vàng nghệ hoặc trắng. Điểm đặc biệt là nước nhưn (nước lèo) rất ít và đậm đặc, chan vừa đủ thấm sợi mì chứ không ngập như phở hay bún.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/e/ec/M%C3%AC_Qu%E1%BA%A3ng%2C_Da_Nang%2C_Vietnam.jpg',
  },
  {
    name_key: 'nem_chua',
    name_vi: 'Nem Chua',
    province_name: 'Thanh Hóa',
    how_to_eat: 'Bóc lớp lá chuối, chấm tương ớt. Thường uống kèm bia hoặc rượu.',
    story:
      'Đặc sản xứ Thanh làm từ thịt lợn sống lên men tự nhiên với thính gạo và bì heo. Nem chín có màu hồng đỏ, vị chua thanh, giòn sần sật, gói kèm lá ổi hoặc lá đinh lăng để dậy mùi thơm.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Nem_Chua.jpg',
  },
  {
    name_key: 'pho',
    name_vi: 'Phở',
    province_name: 'Hà Nội',
    how_to_eat:
      'Húp một thìa nước dùng nguyên bản trước, sau đó thêm giấm tỏi, tương ớt, chanh. Ăn nóng hổi, kèm quẩy.',
    story:
      'Quốc hồn quốc túy của Việt Nam. Phở Hà Nội xưa nước dùng phải trong, ngọt từ xương bò, thơm mùi gừng nướng, quế hồi thảo quả. Bánh phở mềm dẻo quyện với thịt bò tái/chín là bữa sáng chuẩn mực.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Ph%E1%BB%9F_b%C3%B2.JPG',
  },
  {
    name_key: 'xoi_xeo',
    name_vi: 'Xôi Xéo',
    province_name: 'Hà Nội',
    how_to_eat:
      'Trộn đều xôi với đậu xanh, hành phi và rưới thêm chút mỡ gà béo ngậy trước khi ăn.',
    story:
      'Món xôi cầu kỳ nhất đất Bắc. Hạt nếp cái hoa vàng nấu với nước nghệ để có màu vàng óng. Đậu xanh đồ chín nắm chặt, khi ăn người bán dùng dao thái lát mỏng phủ lên xôi, gói trong lá sen hoặc lá chuối thơm lừng.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/X%C3%B4i_x%C3%A9o.jpg',
  },
];

async function seedFoods() {
  try {
    console.log('🔄 Đang kết nối database...');
    await connectDB();
    console.log('✅ Đã kết nối database');

    console.log(`\n🔄 Đang seed ${foodsData.length} món ăn...`);

    let created = 0;
    let skipped = 0;

    for (const foodData of foodsData) {
      try {
        // Kiểm tra xem đã tồn tại chưa
        const existing = await Food.findOne({ name_key: foodData.name_key });
        if (existing) {
          console.log(`⏭️  Đã tồn tại: ${foodData.name_vi} (${foodData.name_key})`);
          skipped++;
          continue;
        }

        // Tạo món ăn mới
        await Food.create(foodData);
        console.log(`✅ Đã tạo: ${foodData.name_vi} (${foodData.name_key})`);
        created++;
      } catch (error: any) {
        console.error(`❌ Lỗi khi tạo ${foodData.name_vi}:`, error.message);
      }
    }

    console.log(`\n📊 Kết quả:`);
    console.log(`   ✅ Đã tạo: ${created} món ăn`);
    console.log(`   ⏭️  Đã bỏ qua: ${skipped} món ăn (đã tồn tại)`);
    console.log(`   📦 Tổng cộng: ${foodsData.length} món ăn`);

    // Đếm tổng số món ăn trong database
    const total = await Food.countDocuments();
    console.log(`\n📈 Tổng số món ăn trong database: ${total}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed foods:', error);
    process.exit(1);
  }
}

// Chạy script
seedFoods();
