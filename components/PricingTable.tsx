'use client'

import { useState } from 'react'
import { Check, X, Zap, Star, Shield } from 'lucide-react'

export default function PricingTable() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans = [
    {
      name: 'Clear',
      description: '“Gerçekten kârda mıyım?” sorusunun cevabı.',
      price: { monthly: 299, yearly: 2999 },
      features: [
        'Manuel gelir / gider girişi',
        'CSV / Excel yükleme (Sınırlı)',
        'Temel komisyon hesapları',
        'Net kâr & basit kâr marjı',
        'Aylık özet dashboard',
        'AI: 10 konuşma / ay',
        'Tek mağaza / tek platform',
      ],
      missing: ['Gelişmiş gider kırılımı', 'Senaryo simülasyonları'],
      color: 'gray',
      icon: <Zap size={24} />,
      popular: false
    },
    {
      name: 'Control',
      description: '“Parayı ben mi yönetiyorum, para mı beni?”',
      price: { monthly: 799, yearly: 7999 },
      features: [
        'Clear’daki her şey dahil',
        'Çoklu platform desteği',
        'Gelişmiş gider kırılımı (reklam, iade)',
        'Dönemsel karşılaştırmalar',
        'Kâr erozyonu tespiti',
        'AI: 50 konuşma / ay',
        'Trend bazlı öngörü sinyalleri',
        'Genişletilmiş veri geçmişi'
      ],
      missing: ['Senaryo simülasyonları'],
      color: 'blue',
      icon: <Star size={24} />,
      popular: true // Öne çıkan paket
    },
    {
      name: 'Vision',
      description: '“Bu işi böyle yaparsam 3 ay sonra ne olur?”',
      price: { monthly: 1999, yearly: 19999 },
      features: [
        'Control’daki her şey dahil',
        'Derin kârlılık analizi',
        'Senaryo simülasyonları',
        'AI destekli karar yorumları',
        'Risk sinyalleri',
        'AI: 100 konuşma / ay',
        'Sınırsız veri geçmişi',
        'Öncelikli destek'
      ],
      missing: [],
      color: 'purple',
      icon: <Shield size={24} />,
      popular: false
    }
  ]

  return (
    <div className="space-y-12">
      
      {/* TOGGLE SWITCH (AYLIK / YILLIK) */}
      <div className="flex justify-center items-center gap-4">
        <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>Aylık</span>
        <button 
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className="w-16 h-8 bg-gray-200 rounded-full p-1 transition-colors duration-300 relative focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-8' : ''}`}></div>
        </button>
        <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Yıllık <span className="text-green-600 text-xs ml-1 bg-green-100 px-2 py-0.5 rounded-full">2 ay bedava</span>
        </span>
      </div>

      {/* PLAN KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col ${
              plan.popular 
                ? 'bg-white border-blue-500 shadow-2xl shadow-blue-500/10 scale-105 z-10' 
                : 'bg-white border-gray-100 shadow-lg hover:border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                En Popüler
              </div>
            )}

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
              plan.color === 'blue' ? 'bg-blue-100 text-blue-600' : 
              plan.color === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {plan.icon}
            </div>

            <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
            <p className="text-gray-500 text-sm mt-2 min-h-10">{plan.description}</p>

            <div className="my-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">
                  ₺{billingCycle === 'monthly' ? plan.price.monthly : Math.round(plan.price.yearly / 12)}
                </span>
                <span className="text-gray-400 text-sm font-medium">/ay</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs text-green-600 font-bold mt-1">
                  Yıllık ₺{plan.price.yearly.toLocaleString('tr-TR')} ödenir
                </p>
              )}
            </div>

            <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all mb-8 ${
              plan.popular 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20' 
                : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
            }`}>
              {plan.name === 'Clear' ? 'Başla' : plan.name === 'Control' ? 'Control\'e Geç' : 'İletişime Geç'}
            </button>

            <div className="space-y-4 flex-1">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <Check size={16} className={`mt-0.5 shrink-0 ${
                    plan.popular ? 'text-blue-600' : 'text-green-600'
                  }`} />
                  <span>{feature}</span>
                </div>
              ))}
              {plan.missing.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-400 opacity-60">
                  <X size={16} className="mt-0.5 shrink-0" />
                  <span className="line-through">{feature}</span>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}