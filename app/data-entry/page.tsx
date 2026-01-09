'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import ManualEntryForm from '@/components/ManualEntryForm'
import { FileSpreadsheet, Keyboard } from 'lucide-react'
import DashboardHeader from '@/components/DashboardHeader' // Header Eklendi

export default function DataEntryPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual')

  return (
    <div className="min-h-screen bg-white pb-10 font-sans">
      {/* 1. HEADER EKLENDİ */}
      <DashboardHeader />

      <main className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
        
        {/* Başlık Alanı */}
        <div className="text-center space-y-2 pt-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Veri Girişi</h1>
          <p className="text-gray-500 font-medium">Finansal verilerini sisteme nasıl eklemek istersin?</p>
        </div>

        {/* TABLAR (Seçim Ekranı) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-200 ${
              activeTab === 'manual' 
                ? 'bg-white text-black shadow-sm ring-1 ring-black/5' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <Keyboard size={20} />
            Manuel Ekle
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-200 ${
              activeTab === 'upload' 
                ? 'bg-white text-black shadow-sm ring-1 ring-black/5' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <FileSpreadsheet size={20} />
            Excel / CSV Yükle
          </button>
        </div>

        {/* İÇERİK ALANI */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm ring-1 ring-gray-100">
          {activeTab === 'manual' ? (
            <ManualEntryForm />
          ) : (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-gray-900">Dosya Yükle</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Bankanızdan aldığınız Excel (.xlsx) veya CSV dökümünü aşağıdaki alana sürükleyin.
                </p>
              </div>
              <FileUpload />
            </div>
          )}
        </div>

      </main>
    </div>
  )
}