import React, { useState } from 'react';
import { 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  Eye, 
  Database,
  Save,
  CheckCircle
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      taskReminders: true,
      weeklyReport: false
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      compactMode: false
    },
    privacy: {
      profileVisibility: 'private',
      showCompletedTasks: true,
      dataCollection: false
    },
    language: 'uz'
  });

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // Here you would typically save to backend
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const settingSections = [
    {
      id: 'notifications',
      title: 'Bildirishnomalar',
      icon: <Bell className="w-5 h-5" />,
      description: 'Bildirishnoma sozlamalaringizni boshqaring',
      settings: [
        {
          key: 'email',
          label: 'Email bildirishnomalari',
          description: 'Muhim yangiliklarni email orqali oling'
        },
        {
          key: 'push',
          label: 'Push bildirishnomalari',
          description: 'Vazifa eslatmalari va yangiliklarni oling'
        },
        {
          key: 'taskReminders',
          label: 'Vazifa eslatmalari',
          description: 'Muddati yaqin vazifalar haqida eslatma'
        },
        {
          key: 'weeklyReport',
          label: 'Haftalik hisobot',
          description: 'Har hafta faollik hisobotini oling'
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Koʻrinish',
      icon: <Moon className="w-5 h-5" />,
      description: 'Ilova koʻrinishini sozlang',
      settings: [
        {
          key: 'theme',
          label: 'Mavzu',
          description: 'Ilova rang sxemasi',
          type: 'select',
          options: [
            { value: 'light', label: 'Och' },
            { value: 'dark', label: 'Qora' },
            { value: 'auto', label: 'Avtomatik' }
          ]
        },
        {
          key: 'fontSize',
          label: 'Shrift hajmi',
          description: 'Matn oʻlchamini sozlang',
          type: 'select',
          options: [
            { value: 'small', label: 'Kichik' },
            { value: 'medium', label: 'Oʻrta' },
            { value: 'large', label: 'Katta' }
          ]
        },
        {
          key: 'compactMode',
          label: 'Qisqa rejim',
          description: 'Kamroq joy egallagan koʻrinish'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Maxfiylik',
      icon: <Shield className="w-5 h-5" />,
      description: 'Maxfiylik sozlamalaringizni boshqaring',
      settings: [
        {
          key: 'profileVisibility',
          label: 'Profil koʻrinishi',
          description: 'Kim sizning profil ma\'lumotlaringizni ko\'ra oladi',
          type: 'select',
          options: [
            { value: 'public', label: 'Ochiq (hamma)' },
            { value: 'contacts', label: 'Faqat kontaktlar' },
            { value: 'private', label: 'Yashirin (faqat men)' }
          ]
        },
        {
          key: 'showCompletedTasks',
          label: 'Bajarilgan vazifalarni koʻrsatish',
          description: 'Bajarilgan vazifalar roʻyxatda koʻrinsinmi?'
        },
        {
          key: 'dataCollection',
          label: 'Ma\'lumot yigʻish',
          description: 'Takomillashtirish uchun anonim ma\'lumotlarni yuborish'
        }
      ]
    },
    {
      id: 'language',
      title: 'Til va mintaqa',
      icon: <Globe className="w-5 h-5" />,
      description: 'Til va vaqt mintaqasini sozlang',
      settings: [
        {
          key: 'language',
          label: 'Til',
          description: 'Ilova interfeys tili',
          type: 'select',
          options: [
            { value: 'uz', label: 'Oʻzbekcha' },
            { value: 'ru', label: 'Русский' },
            { value: 'en', label: 'English' }
          ]
        },
        {
          key: 'timezone',
          label: 'Vaqt mintaqasi',
          description: 'Mahalliy vaqt mintaqasi',
          type: 'select',
          options: [
            { value: 'tashkent', label: 'Toshkent (UTC+5)' },
            { value: 'samarkand', label: 'Samarqand (UTC+5)' }
          ]
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Sozlamalar</h1>
        <p className="text-gray-600">Ilova sozlamalaringizni shaxsiylashtiring</p>
      </div>

      {/* Save Status */}
      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-700 font-medium">Sozlamalar muvaffaqiyatli saqlandi</p>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-8">
        {settingSections.map((section) => (
          <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                {section.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                <p className="text-gray-600 text-sm">{section.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {section.settings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{setting.label}</p>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  
                  <div className="ml-4">
                    {setting.type === 'select' ? (
                      <select
                        value={settings[section.id][setting.key]}
                        onChange={(e) => handleSettingChange(section.id, setting.key, e.target.value)}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                      >
                        {setting.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[section.id][setting.key]}
                          onChange={(e) => handleSettingChange(section.id, setting.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          Bekor qilish
        </button>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all"
        >
          <Save className="w-4 h-4 mr-2" />
          Saqlash
        </button>
      </div>
    </div>
  );
};

export default Settings;