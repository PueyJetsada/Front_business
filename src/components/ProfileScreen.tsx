import React, { useState } from 'react';
import {
  VIBE_CATEGORIES,
  type UserProfile,
  type UserRoleType,
} from '../data/mockData';
import {
  DriverBunnySvg,
  IconCheck,
  IconCrown,
  IconFacebook,
  IconInstagram,
  IconShieldCheck,
  PassengerBunnySvg,
} from './Icons';

interface ProfileScreenProps {
  profile: UserProfile;
  onChangeProfile: (updated: UserProfile) => void;
  isPremium: boolean;
  onTogglePremium: () => void;
  onOpenPremiumModal: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onChangeProfile,
  isPremium,
  onTogglePremium,
  onOpenPremiumModal,
}) => {
  const [savedToast, setSavedToast] = useState(false);

  const toggleVibeTag = (tag: string) => {
    const exists = profile.vibes.includes(tag);
    const nextVibes = exists
      ? profile.vibes.filter((t) => t !== tag)
      : [...profile.vibes, tag];
    onChangeProfile({ ...profile, vibes: nextVibes });
  };

  const handleSaveNotice = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  return (
    <div className="flex-1 p-4 pb-28 bg-slate-50 overflow-y-auto custom-scroll space-y-3.5">
      {/* Profile Identity Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-3.5 items-center">
        <div className="w-20 h-20 bg-orange-50 border-2 border-orange-300 rounded-full flex items-center justify-center shadow-sm text-orange-500 shrink-0 relative">
          {profile.role === 'passenger' ? (
            <PassengerBunnySvg size={46} />
          ) : (
            <DriverBunnySvg size={46} />
          )}
          {isPremium && (
            <span
              title="HOP Premium Member"
              className="absolute -bottom-1 -right-1 bg-orange-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black border-2 border-white shadow-sm flex items-center gap-0.5"
            >
              <IconCrown size={10} />
              <span>PRO</span>
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                onChangeProfile({ ...profile, name: e.target.value })
              }
              aria-label="ชื่อเล่น"
              className="w-full border-b border-slate-300 bg-transparent py-0.5 text-sm font-black focus:border-orange-500 text-slate-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={profile.faculty}
              onChange={(e) =>
                onChangeProfile({ ...profile, faculty: e.target.value })
              }
              aria-label="คณะและชั้นปี"
              className="w-full border-b border-slate-300 bg-transparent py-0.5 text-[11px] font-bold text-slate-700"
            >
              <option value="SIIT • CPE ปี 3">SIIT • CPE ปี 3</option>
              <option value="SIIT • IE ปี 4">SIIT • IE ปี 4</option>
              <option value="SIIT • DE ปี 2">SIIT • DE ปี 2</option>
              <option value="SIIT • ME ปี 3">SIIT • ME ปี 3</option>
              <option value="TBS • TU ปี 2">TBS • TU ปี 2</option>
            </select>
            <select
              value={profile.university}
              onChange={(e) =>
                onChangeProfile({ ...profile, university: e.target.value })
              }
              aria-label="มหาวิทยาลัย"
              className="w-full border-b border-slate-300 bg-transparent py-0.5 text-[11px] font-bold text-slate-700"
            >
              <option value="Thammasat University (SIIT)">SIIT Thammasat</option>
              <option value="Thammasat University (Rangsit)">TU Rangsit</option>
              <option value="Chulalongkorn (CU)">Chulalongkorn</option>
              <option value="Kasetsart (KU)">Kasetsart</option>
            </select>
          </div>
        </div>
      </div>

      {/* Role Selector (มีรถ / หาคนหาร / ทั้งคู่) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="text-xs font-black text-slate-900">
          บทบาทการใช้งาน (User Role)
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { key: 'driver', label: 'มีรถ (Driver)' },
              { key: 'passenger', label: 'หาคนหาร (Hopper)' },
              { key: 'both', label: 'ทั้งคู่ (Both)' },
            ] as { key: UserRoleType; label: string }[]
          ).map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => onChangeProfile({ ...profile, role: r.key })}
              className={`py-2 px-2 rounded-xl text-[11px] font-black border transition ${
                profile.role === r.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bio / Description & Optional Social Links (IG / Facebook) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div>
          <div className="text-xs font-black text-slate-900 mb-1">
            แนะนำตัวสั้นๆ (Bio / Description)
          </div>
          <textarea
            rows={2}
            value={profile.bio}
            onChange={(e) =>
              onChangeProfile({ ...profile, bio: e.target.value })
            }
            placeholder="แนะนำตัวสั้นๆ เช่น คณะ สไตล์การเดินทาง เพลงที่ฟัง..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900">
              ช่องทางติดต่อ Social Links
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Optional • ไม่บังคับ
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2">
              <IconInstagram size={14} className="text-rose-500 shrink-0" />
              <input
                type="text"
                value={profile.ig}
                onChange={(e) =>
                  onChangeProfile({ ...profile, ig: e.target.value })
                }
                placeholder="Instagram (เช่น @name)"
                className="w-full bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2">
              <IconFacebook size={14} className="text-blue-600 shrink-0" />
              <input
                type="text"
                value={profile.facebook}
                onChange={(e) =>
                  onChangeProfile({ ...profile, facebook: e.target.value })
                }
                placeholder="Facebook (ไม่บังคับ)"
                className="w-full bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vibe & Genre Tagging across 4 Categories */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-900">
              Vibe & Genre Tags (ใช้คำนวณ % Match)
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              แตะเพื่อเลือก/ยกเลิกแท็กความชอบของคุณ ({profile.vibes.length} แท็ก)
            </p>
          </div>
          <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg">
            Live Match
          </span>
        </div>

        <div className="space-y-2.5">
          {VIBE_CATEGORIES.map((category) => (
            <div key={category.id} className="space-y-1.5">
              <div className="text-[10px] font-extrabold text-slate-600">
                {category.label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {category.tags.map((tag) => {
                  const selected = profile.vibes.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleVibeTag(tag)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border transition flex items-center gap-1 ${
                        selected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      {selected && <IconCheck size={11} />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Vehicle Info when role includes driver */}
      {(profile.role === 'driver' || profile.role === 'both') && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <h3 className="text-xs font-black text-slate-900">
            ข้อมูลรถยนต์สำหรับเปิดหาร (Driver Vehicle)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                รุ่นรถ / พลังงาน
              </span>
              <input
                type="text"
                value={profile.carBrand}
                onChange={(e) =>
                  onChangeProfile({ ...profile, carBrand: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                ทะเบียนรถ
              </span>
              <input
                type="text"
                value={profile.carLicense}
                onChange={(e) =>
                  onChangeProfile({ ...profile, carLicense: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Safety Lock from Front_business */}
      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
            <IconShieldCheck size={15} className="text-rose-600" />
            <span>Gender & Campus Safety Lock</span>
          </span>
          <span className="text-[9px] bg-rose-200 text-rose-900 font-black px-2 py-0.5 rounded-full">
            VERIFIED TU ID
          </span>
        </div>
        <label className="flex items-center gap-2 text-xs font-bold text-rose-900 pt-0.5 cursor-pointer">
          <input
            type="checkbox"
            checked={profile.womenOnlyDefault}
            onChange={(e) =>
              onChangeProfile({
                ...profile,
                womenOnlyDefault: e.target.checked,
              })
            }
            className="w-4 h-4 accent-rose-600 rounded"
          />
          <span>ตั้งค่าเริ่มต้นจับคู่เฉพาะเพศเดียวกัน (Same-Gender Priority)</span>
        </label>
      </div>

      {/* HOP Premium (฿49/month) Membership Card */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md space-y-2.5 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white">
              <IconCrown size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                HOP Premium • ฿49/เดือน
              </h3>
              <p className="text-[10px] text-slate-300">
                สถานะปัจจุบัน:{' '}
                <strong className="text-orange-400">
                  {isPremium ? 'สมาชิก HOP Premium' : 'Free User (ใช้งาน GUI ฟรี 100%)'}
                </strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenPremiumModal}
            className="text-[10px] font-black bg-slate-800 hover:bg-slate-700 text-orange-300 border border-slate-700 px-2.5 py-1.5 rounded-lg transition"
          >
            รายละเอียดแพ็กเกจ
          </button>
        </div>

        <button
          type="button"
          onClick={onTogglePremium}
          className={`w-full py-2.5 rounded-xl font-black text-xs transition ${
            isPremium
              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {isPremium
            ? 'เปิดใช้งาน HOP Premium อยู่ (แตะเพื่อสลับเป็น Free User)'
            : 'อัปเกรดเป็น HOP Premium (฿49/เดือน)'}
        </button>
      </div>

      <button
        type="button"
        onClick={handleSaveNotice}
        className="w-full bg-white hover:bg-orange-50 border-2 border-orange-500 text-orange-600 font-black text-xs py-3 rounded-xl transition"
      >
        {savedToast
          ? 'บันทึกโปรไฟล์และคำนวณ % Match ใหม่เรียบร้อย!'
          : 'บันทึกข้อมูลโปรไฟล์'}
      </button>
    </div>
  );
};
