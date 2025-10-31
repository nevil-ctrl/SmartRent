import React, { useState } from 'react';
import { Settings, Bell, Shield, User, Key, Trash2, Save } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { ThemeToggle } from '../components/ThemeToggle';

export const SettingsPage: React.FC = () => {
  const { account, isConnected } = useWeb3();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [language, setLanguage] = useState('ru');
  const [currency, setCurrency] = useState('MATIC');

  const handleSave = () => {
    console.log('Settings saved:', { notifications, language, currency });
    alert('Настройки сохранены!');
  };

  return (
    <div className="page-container">
        <div className="container">
          <div className="page-header">
            <div className="page-header-content">
              <div className="page-icon-wrapper">
                <Settings size={32} />
              </div>
            <div>
              <h1 className="page-title">Настройки</h1>
              <p className="page-subtitle">Управление настройками вашего аккаунта</p>
            </div>
            </div>
          </div>

        <div className="settings-container">
          {/* Общие настройки */}
          <section className="settings-section">
            <h2 className="settings-section-title">
              <User size={20} />
              Общие настройки
            </h2>
            <div className="settings-grid">
              <div className="setting-card">
                <div className="setting-header">
                  <label className="setting-label">Тема оформления</label>
                  <p className="setting-description">Выберите светлую или темную тему</p>
                </div>
                <div className="setting-control">
                  <ThemeToggle />
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <label className="setting-label">Язык интерфейса</label>
                  <p className="setting-description">Выберите предпочитаемый язык</p>
                </div>
                <div className="setting-control">
                  <select
                    className="form-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="uk">Українська</option>
                  </select>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <label className="setting-label">Валюта</label>
                  <p className="setting-description">Валюта для отображения цен</p>
                </div>
                <div className="setting-control">
                  <select
                    className="form-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="MATIC">MATIC</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Уведомления */}
          <section className="settings-section">
            <h2 className="settings-section-title">
              <Bell size={20} />
              Уведомления
            </h2>
            <div className="settings-grid">
              <div className="setting-card">
                <div className="setting-header">
                  <label className="setting-label">Email уведомления</label>
                  <p className="setting-description">Получать уведомления на почту</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <label className="setting-label">Push уведомления</label>
                  <p className="setting-description">Получать push уведомления в браузере</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-header">
                  <label className="setting-label">SMS уведомления</label>
                  <p className="setting-description">Получать уведомления по SMS</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Безопасность */}
          <section className="settings-section">
            <h2 className="settings-section-title">
              <Shield size={20} />
              Безопасность
            </h2>
            <div className="settings-grid">
              <div className="setting-card">
                <div className="setting-header">
                  <label className="setting-label">Адрес кошелька</label>
                  <p className="setting-description">
                    {isConnected && account ? (
                      <span>{account}</span>
                    ) : (
                      <span style={{ color: 'var(--color-warning)' }}>Кошелек не подключен</span>
                    )}
                  </p>
                </div>
                <div className="setting-control">
                  {isConnected && account && (
                    <button className="btn btn-outline" onClick={() => navigator.clipboard.writeText(account)}>
                      <Key size={16} />
                      Копировать
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Действия */}
          <section className="settings-section">
            <h2 className="settings-section-title">
              <Trash2 size={20} />
              Опасная зона
            </h2>
            <div className="settings-grid">
              <div className="setting-card danger-card">
                <div className="setting-header">
                  <label className="setting-label">Сброс настроек</label>
                  <p className="setting-description">Вернуть все настройки к значениям по умолчанию</p>
                </div>
                <div className="setting-control">
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
                        setNotifications({ email: true, push: false, sms: false });
                        setLanguage('ru');
                        setCurrency('MATIC');
                        alert('Настройки сброшены!');
                      }
                    }}
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Кнопка сохранения */}
          <div className="settings-actions">
            <button className="btn btn-primary btn-lg" onClick={handleSave}>
              <Save size={20} />
              Сохранить настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

