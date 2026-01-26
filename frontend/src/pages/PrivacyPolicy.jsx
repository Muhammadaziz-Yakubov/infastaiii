import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Globe, Mail, Phone, User, Database, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPolicy = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const sections = [
    {
      icon: User,
      title: "Biz kimligimiz",
      content: "InFast AI — hayotni boshqarish, vazifalar, odatlar (habits), vaqt, moliya va sun'iy intellekt yordamida shaxsiy samaradorlikni oshirishga mo'ljallangan raqamli platforma."
    },
    {
      icon: Database,
      title: "Qaysi ma'lumotlarni yig'amiz",
      subsections: [
        {
          title: "Siz taqdim etadigan ma'lumotlar",
          items: ["Ism yoki nickname", "Telefon raqami", "Email manzil", "Google akkaunt orqali kirish ma'lumotlari", "Profil sozlamalari", "Foydalanuvchi tomonidan kiritilgan matnlar (tasklar, rejalar, eslatmalar va boshqalar)"]
        },
        {
          title: "Avtomatik yig'iladigan ma'lumotlar",
          items: ["Qurilma turi va modeli", "Operatsion tizim", "IP-manzil", "Ilovadan foydalanish statistikasi", "Loglar va texnik diagnostika ma'lumotlari"]
        },
        {
          title: "Moliyaviy ma'lumotlar",
          items: ["Daromad va xarajat yozuvlari"],
          note: "InFast AI **bank karta raqamlari yoki to'lov parollarini saqlamaydi**."
        }
      ]
    },
    {
      icon: Eye,
      title: "Ma'lumotlardan qanday foydalanamiz",
      items: [
        "Akkaunt yaratish va boshqarish",
        "Login va xavfsizlikni ta'minlash",
        "AI funksiyalarini ishlatish va takomillashtirish",
        "Shaxsiylashtirilgan tavsiyalar berish",
        "Texnik muammolarni aniqlash",
        "Ilovani yaxshilash va rivojlantirish"
      ]
    },
    {
      icon: Shield,
      title: "Sun'iy intellekt (AI) va ma'lumotlar",
      items: [
        "AI foydalanuvchi kiritgan ma'lumotlar asosida ishlashi mumkin",
        "Ma'lumotlar **anonimlashtirilgan** holda modelni yaxshilash uchun ishlatilishi mumkin",
        "Shaxsiy chatlar yoki yozuvlar **ochiq e'lon qilinmaydi**",
        "AI hech qachon foydalanuvchi nomidan mustaqil qaror qabul qilmaydi"
      ]
    },
    {
      icon: Lock,
      title: "Ma'lumotlarni saqlash va himoyalash",
      items: [
        "Shifrlash (encryption)",
        "Xavfsiz serverlar",
        "Cheklangan kirish huquqlari",
        "Doimiy xavfsizlik monitoringi"
      ],
      note: "Ma'lumotlar faqat zarur bo'lgan muddat davomida saqlanadi."
    },
    {
      icon: Globe,
      title: "Ma'lumotlarni uchinchi tomonlarga berish",
      items: [
        "Biz foydalanuvchi ma'lumotlarini **sotmaymiz**",
        "Qonuniy talab bo'lsa ma'lumotlar berilishi mumkin",
        "Texnik xizmat ko'rsatuvchi hamkorlar (hosting, analytics)",
        "Xavfsizlikni ta'minlash zarur bo'lsa"
      ],
      note: "Barcha hamkorlar maxfiylik talablariga rioya qiladi."
    },
    {
      icon: AlertCircle,
      title: "Foydalanuvchi huquqlari",
      items: [
        "Ma'lumotlaringizni ko'rish",
        "Tahrirlash yoki yangilash",
        "O'chirishni talab qilish",
        "Rozilikni bekor qilish"
      ],
      note: "Buning uchun ilova ichidan yoki qo'llab-quvvatlash orqali murojaat qilishingiz mumkin."
    }
  ];

  const additionalInfo = [
    {
      title: "Yosh cheklovi",
      content: "InFast AI 13 yoshdan kichik foydalanuvchilar uchun mo'ljallanmagan."
    },
    {
      title: "Xalqaro foydalanuvchilar",
      content: "Agar siz boshqa davlatdan foydalansangiz, ma'lumotlaringiz boshqa davlatlardagi serverlarda qayta ishlanishi mumkin. Biz GDPR va boshqa xalqaro standartlarga mos ishlashga intilamiz."
    },
    {
      title: "Siyosatga o'zgartirishlar",
      content: "Biz ushbu Maxfiylik Siyosatini vaqti-vaqti bilan yangilashimiz mumkin. Muhim o'zgarishlar ilova yoki veb-sayt orqali e'lon qilinadi."
    }
  ];

  const contactInfo = [
    { icon: Mail, label: "Email", value: "infastai@gmail.com" },
    { icon: Globe, label: "Veb-sayt", value: "InFast AI rasmiy sahifasi" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Orqaga</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Maxfiylik Siyosati</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">InFast AI – Maxfiylik Siyosati</h1>
              <p className="text-white/80 mt-1">(Privacy Policy)</p>
            </div>
          </div>
          <p className="text-white/90">
            <strong>Oxirgi yangilanish:</strong> 14-yanvar, 2026-yil
          </p>
          <p className="text-white/80 mt-3">
            Ushbu Maxfiylik Siyosati ("Siyosat") <strong>InFast AI</strong> mobil ilovasi va veb-xizmatlaridan 
            (birgalikda — "Xizmat") foydalanishda foydalanuvchilarning shaxsiy ma'lumotlari qanday yig'ilishi, 
            ishlatilishi, saqlanishi va himoyalanishini tushuntiradi.
          </p>
          <p className="text-white/80 mt-2 font-semibold">
            InFast AI'dan foydalanish orqali siz ushbu Siyosat shartlariga rozilik bildirasiz.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{section.title}</h2>
                  
                  {section.content && (
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{section.content}</p>
                  )}

                  {section.items && (
                    <ul className="space-y-2 mt-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 dark:text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.subsections && (
                    <div className="space-y-4 mt-4">
                      {section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex}>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{subsection.title}</h3>
                          <ul className="space-y-2">
                            {subsection.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-600 dark:text-gray-300">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.note && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>⚠️ Eslatma:</strong> {section.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Qo'shimcha Ma'lumotlar</h2>
          <div className="space-y-4">
            {additionalInfo.map((info, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{info.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{info.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Bog'lanish</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Agar savollaringiz bo'lsa, biz bilan bog'laning:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contactInfo.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{contact.label}</p>
                    <p className="text-gray-900 dark:text-white font-medium">{contact.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
          <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
          <p className="text-blue-900 dark:text-blue-100 font-semibold">
            InFast AI'dan foydalanish orqali siz ushbu Maxfiylik Siyosatiga rozilik bildirasiz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
