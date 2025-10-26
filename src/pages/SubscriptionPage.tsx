import React, { useState, useEffect } from 'react';
import { Check, X, Zap, Star, Award, TrendingUp, Crown, Shield } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { useContracts } from '../hooks/useContracts';

interface SubscriptionPlan {
  id: number;
  name: string;
  price: string;
  yearlyPrice: string;
  features: string[];
  icon: React.ReactNode;
  gradient: string;
  recommended?: boolean;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 0,
    name: 'Базовый',
    price: '0',
    yearlyPrice: '0',
    features: [
      'До 3 объявлений',
      'Стандартная поддержка',
      'Базовая статистика',
      'Стандартное размещение',
    ],
    icon: <Shield size={32} />,
    gradient: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
  },
  {
    id: 1,
    name: 'Pro',
    price: '30',
    yearlyPrice: '288',
    features: [
      'До 10 объявлений',
      'Приоритетная поддержка',
      'Расширенная статистика',
      'Приоритетное размещение',
      'Премиум фильтры',
      'Аналитика просмотров',
    ],
    icon: <Star size={32} />,
    gradient: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
    recommended: true,
  },
  {
    id: 2,
    name: 'Premium',
    price: '50',
    yearlyPrice: '480',
    features: [
      'Неограниченно объявлений',
      'VIP поддержка 24/7',
      'Полная аналитика',
      'Топ размещение',
      'Все функции Pro',
      'Расширенная аналитика',
      'Личный менеджер',
      'Бейдж Premium',
    ],
    icon: <Crown size={32} />,
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
];

export const SubscriptionPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, account } = useWeb3();
  const { createSubscription, hasPremiumFeature } = useContracts();

  useEffect(() => {
    if (isConnected && account) {
      loadCurrentSubscription();
    }
  }, [isConnected, account]);

  const loadCurrentSubscription = async () => {
    try {
      // Проверяем, есть ли у пользователя активная подписка
      const hasProFeature = await hasPremiumFeature(account!, 1);
      const hasPremiumFeature_ = await hasPremiumFeature(account!, 8);
      
      if (hasPremiumFeature_) {
        setCurrentPlan(2); // Premium
      } else if (hasProFeature) {
        setCurrentPlan(1); // Pro
      } else {
        setCurrentPlan(0); // Free
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const handleSubscribe = async (planId: number) => {
    if (!isConnected) {
      alert('Пожалуйста, подключите кошелек');
      return;
    }

    if (planId === 0) {
      alert('Вы уже на базовом плане');
      return;
    }

    setIsLoading(true);
    try {
      const plan = PLANS[planId];
      const duration = billingCycle === 'yearly' ? 12 : 1;
      const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;

      await createSubscription(planId, duration, false, price);
      
      alert(`Подписка ${plan.name} успешно оформлена!`);
      setCurrentPlan(planId);
    } catch (error: any) {
      console.error('Subscription failed:', error);
      alert(`Ошибка при оформлении подписки: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getSavings = (plan: SubscriptionPlan) => {
    if (billingCycle === 'monthly') return null;
    const monthlyTotal = parseFloat(plan.price) * 12;
    const yearlyTotal = parseFloat(plan.yearlyPrice);
    const savings = monthlyTotal - yearlyTotal;
    return savings > 0 ? savings.toFixed(0) : null;
  };

  return (
    <section className="section">
      <div className="container">
        {/* Page Header */}
        <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <h1 className="section-title">Выберите подписку</h1>
          <p className="section-subtitle">
            Увеличьте свои возможности с премиум-функциями SmartRent
          </p>
        </div>

        {/* Billing Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-2xl)'
        }}>
          <span style={{
            color: billingCycle === 'monthly' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            fontWeight: billingCycle === 'monthly' ? 600 : 400,
            fontSize: 'var(--font-size-lg)'
          }}>
            Помесячно
          </span>
          
          <button
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            style={{
              width: '60px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: billingCycle === 'yearly' ? 'var(--color-primary)' : 'var(--color-border)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all var(--transition-base)'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'white',
              position: 'absolute',
              top: '3px',
              left: billingCycle === 'yearly' ? '31px' : '3px',
              transition: 'left var(--transition-base)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>

          <span style={{
            color: billingCycle === 'yearly' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            fontWeight: billingCycle === 'yearly' ? 600 : 400,
            fontSize: 'var(--font-size-lg)'
          }}>
            Годовая
          </span>

          {billingCycle === 'yearly' && (
            <span style={{
              backgroundColor: 'var(--color-success-light)',
              color: 'var(--color-secondary)',
              padding: 'var(--spacing-xs) var(--spacing-md)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600
            }}>
              Скидка 20%
            </span>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-xl)' }}>
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const savings = getSavings(plan);
            const price = billingCycle === 'yearly' 
              ? (parseFloat(plan.yearlyPrice) / 12).toFixed(0)
              : plan.price;

            return (
              <div
                key={plan.id}
                className="card"
                style={{
                  padding: 'var(--spacing-xl)',
                  position: 'relative',
                  border: plan.recommended 
                    ? '2px solid var(--color-primary)' 
                    : isCurrentPlan
                    ? '2px solid var(--color-secondary)'
                    : '1px solid var(--color-border)',
                  transform: plan.recommended ? 'scale(1.05)' : 'scale(1)',
                  zIndex: plan.recommended ? 10 : 1,
                  transition: 'all var(--transition-base)'
                }}
              >
                {/* Recommended Badge */}
                {plan.recommended && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--color-primary)',
                    color: 'white',
                    padding: 'var(--spacing-xs) var(--spacing-lg)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(88, 86, 214, 0.3)'
                  }}>
                    Рекомендуем
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div style={{
                    position: 'absolute',
                    top: 'var(--spacing-md)',
                    right: 'var(--spacing-md)',
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-secondary)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)'
                  }}>
                    <Check size={14} />
                    Текущий план
                  </div>
                )}

                {/* Plan Icon */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: plan.gradient,
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  margin: '0 auto var(--spacing-lg)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
                }}>
                  {plan.icon}
                </div>

                {/* Plan Name */}
                <h3 style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 700,
                  textAlign: 'center',
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--color-text-primary)'
                }}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: 'var(--color-text-primary)'
                  }}>
                    {price === '0' ? 'Бесплатно' : `$${price}`}
                  </div>
                  {price !== '0' && (
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)'
                    }}>
                      {billingCycle === 'yearly' ? 'в месяц (оплата годовая)' : 'в месяц'}
                    </div>
                  )}
                  {savings && (
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-secondary)',
                      fontWeight: 600,
                      marginTop: 'var(--spacing-xs)'
                    }}>
                      Экономия ${savings} в год
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  marginBottom: 'var(--spacing-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-sm)'
                }}>
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'start',
                        gap: 'var(--spacing-sm)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      <Check
                        size={18}
                        color="var(--color-secondary)"
                        style={{ marginTop: '2px', flexShrink: 0 }}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading || isCurrentPlan}
                  className={`btn ${plan.recommended ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    width: '100%',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 600
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner spinner-sm" />
                      Обработка...
                    </>
                  ) : isCurrentPlan ? (
                    'Текущий план'
                  ) : (
                    `Выбрать ${plan.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div style={{
          marginTop: 'var(--spacing-3xl)',
          padding: 'var(--spacing-xl)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <TrendingUp size={32} color="var(--color-primary)" />
            <div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-xs)' }}>
                Преимущества подписки
              </h3>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                Повышайте видимость ваших объявлений и получайте больше откликов
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-lg)' }}>
            <div>
              <h4 style={{ 
                fontSize: 'var(--font-size-lg)', 
                marginBottom: 'var(--spacing-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)'
              }}>
                <Zap size={20} color="var(--color-warning)" />
                Приоритетное размещение
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Ваши объявления появляются выше в результатах поиска
              </p>
            </div>

            <div>
              <h4 style={{ 
                fontSize: 'var(--font-size-lg)', 
                marginBottom: 'var(--spacing-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)'
              }}>
                <Award size={20} color="var(--color-secondary)" />
                Бейдж Premium
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Подтвержденный статус повышает доверие арендаторов
              </p>
            </div>

            <div>
              <h4 style={{ 
                fontSize: 'var(--font-size-lg)', 
                marginBottom: 'var(--spacing-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)'
              }}>
                <TrendingUp size={20} color="var(--color-primary)" />
                Аналитика
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Отслеживайте просмотры и эффективность объявлений
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 'var(--spacing-3xl)' }}>
          <h3 style={{
            fontSize: 'var(--font-size-2xl)',
            textAlign: 'center',
            marginBottom: 'var(--spacing-xl)'
          }}>
            Часто задаваемые вопросы
          </h3>

          <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
            <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
              <h4 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
                Как оплачивается подписка?
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Оплата производится через смарт-контракт в MATIC токенах. 
                Все транзакции прозрачны и записываются в блокчейн.
              </p>
            </div>

            <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
              <h4 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
                Можно ли отменить подписку?
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Да, вы можете отменить подписку в любой момент. Она будет активна до конца 
                оплаченного периода.
              </p>
            </div>

            <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
              <h4 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
                Что происходит при смене плана?
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                При переходе на более высокий план изменения вступают в силу немедленно. 
                При понижении плана - с начала следующего периода.
              </p>
            </div>

            <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
              <h4 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
                Есть ли возврат средств?
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Возврат средств возможен в течение 7 дней после оплаты, 
                если вы не использовали премиум-функции.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

