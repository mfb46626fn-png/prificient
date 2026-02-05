import { createClient } from '@/utils/supabase/server'
import DecisionsClient from '@/components/DecisionsClient'
import { redirect } from 'next/navigation'
import { generateComprehensiveAnalysis } from '@/lib/onboarding/comprehensive-analysis'

interface Decision {
    id: number
    title: string
    description: string
    date: string
    type: 'suggestion' | 'warning'
}

export default async function DecisionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const analysis = await generateComprehensiveAnalysis(user.id);
    const decisions: Decision[] = [];
    let idCounter = 1;
    const today = new Date().toLocaleDateString('tr-TR');

    // 1. From Recommendations
    analysis.recommendations.forEach((rec) => {
        decisions.push({
            id: idCounter++,
            title: rec.title,
            description: rec.description,
            date: today,
            type: rec.type === 'warning' ? 'warning' : 'suggestion'
        });
    });

    // 2. From Danger Products
    if (analysis.dangerProducts.length > 0) {
        decisions.push({
            id: idCounter++,
            title: 'Kârsız Ürün Uyarısı',
            description: `${analysis.dangerProducts.length} adet ürününüz zarar ediyor veya çok düşük kâr marjına sahip. İncelemek için analiz sayfasına gidin.`,
            date: today,
            type: 'warning'
        });
    }

    // 3. From Opportunity Cost
    if (analysis.opportunityCost.lostProfit > 0) {
        decisions.push({
            id: idCounter++,
            title: 'Fırsat Maliyeti Tespit Edildi',
            description: `Zarar eden ürünleri optimize ederek tahmini ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: analysis.currency }).format(analysis.opportunityCost.lostProfit)} kazanabilirsiniz.`,
            date: today,
            type: 'suggestion'
        });
    }

    // 4. Cash Flow Warning
    if (analysis.cashFlow.dailyBurnRate > 0) {
        decisions.push({
            id: idCounter++,
            title: 'Nakit Akışı Riski',
            description: `Günlük nakit yakma hızınız ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: analysis.currency }).format(analysis.cashFlow.dailyBurnRate)}. Önlem almanız önerilir.`,
            date: today,
            type: 'warning'
        });
    }

    return <DecisionsClient decisions={decisions} />
}
