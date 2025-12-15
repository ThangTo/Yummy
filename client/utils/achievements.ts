import { normalizeProvinceName } from './geojsonLoader';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  earned: boolean;
};

const REGION_GROUPS: Record<string, string[]> = {
  bac: [
    'Hà Nội',
    'Hải Phòng',
    'Quảng Ninh',
    'Bắc Ninh',
    'Bắc Giang',
    'Hải Dương',
    'Hưng Yên',
    'Thái Bình',
    'Nam Định',
    'Ninh Bình',
    'Vĩnh Phúc',
    'Phú Thọ',
    'Hà Nam',
    'Thanh Hóa',
    'Nghệ An',
    'Hà Tĩnh',
    'Lào Cai',
    'Yên Bái',
    'Điện Biên',
    'Lai Châu',
    'Sơn La',
    'Hòa Bình',
    'Thái Nguyên',
    'Tuyên Quang',
    'Cao Bằng',
    'Bắc Kạn',
    'Lạng Sơn',
    'Hà Giang',
  ],
  trung: [
    'Quảng Bình',
    'Quảng Trị',
    'Thừa Thiên Huế',
    'Đà Nẵng',
    'Quảng Nam',
    'Quảng Ngãi',
    'Bình Định',
    'Phú Yên',
    'Khánh Hòa',
    'Ninh Thuận',
    'Bình Thuận',
    'Kon Tum',
    'Gia Lai',
    'Đắk Lắk',
    'Đắk Nông',
    'Lâm Đồng',
  ],
  nam: [
    'Thành phố Hồ Chí Minh',
    'TP. Hồ Chí Minh',
    'Bà Rịa - Vũng Tàu',
    'Bình Dương',
    'Bình Phước',
    'Đồng Nai',
    'Tây Ninh',
    'An Giang',
    'Bạc Liêu',
    'Bến Tre',
    'Cà Mau',
    'Cần Thơ',
    'Đồng Tháp',
    'Hậu Giang',
    'Kiên Giang',
    'Long An',
    'Sóc Trăng',
    'Tiền Giang',
    'Trà Vinh',
    'Vĩnh Long',
  ],
};

const normalizeList = (items: string[]) => items.map((p) => normalizeProvinceName(p));

const regionUnlocked = (userProvinces: string[], regionKey: keyof typeof REGION_GROUPS) => {
  const normalizedUser = normalizeList(userProvinces);
  const normalizedRegion = normalizeList(REGION_GROUPS[regionKey]);
  return normalizedRegion.every((p) => normalizedUser.includes(p));
};

export const computeAchievements = (unlockedProvinces: string[]): Achievement[] => {
  const count = unlockedProvinces.length;
  const achievements: Achievement[] = [
    {
      id: 'start',
      title: 'Lữ khách khởi động',
      description: 'Mở khóa tỉnh đầu tiên',
      earned: count >= 1,
    },
    {
      id: 'foodie',
      title: 'Nhà săn vị',
      description: 'Mở 5 tỉnh bất kỳ',
      earned: count >= 5,
    },
    {
      id: 'explorer',
      title: 'Kẻ phiêu lưu',
      description: 'Mở 10 tỉnh',
      earned: count >= 10,
    },
    {
      id: 'vietnam-run',
      title: 'Xuyên Việt',
      description: 'Mở 15 tỉnh',
      earned: count >= 15,
    },
    {
      id: 'north',
      title: 'Tinh thông Bắc Bộ',
      description: 'Thu thập đủ tỉnh Bắc Bộ',
      earned: regionUnlocked(unlockedProvinces, 'bac'),
    },
    {
      id: 'central',
      title: 'Tinh thông Trung Bộ',
      description: 'Thu thập đủ tỉnh Trung Bộ & Tây Nguyên',
      earned: regionUnlocked(unlockedProvinces, 'trung'),
    },
    {
      id: 'south',
      title: 'Tinh thông Nam Bộ',
      description: 'Thu thập đủ tỉnh Nam Bộ',
      earned: regionUnlocked(unlockedProvinces, 'nam'),
    },
    {
      id: 'grandmaster',
      title: 'Đại sứ ẩm thực',
      description: 'Chạm mốc 20 tỉnh',
      earned: count >= 20,
    },
  ];

  return achievements;
};
