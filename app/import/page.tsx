'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { SmartParser, ParsedCampaign } from '@/lib/import/smart-parser' // Ensure this path is correct
import { Upload, FileText, Check, AlertTriangle, ArrowRight, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Simple Components (since shadcn might be partial)
const Button = ({ children, onClick, disabled, variant = 'primary', className = '' }: any) => {
    const base = "px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
        ghost: "hover:bg-gray-100 text-gray-600",
        danger: "bg-red-50 text-red-600 hover:bg-red-100"
    }
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant as keyof typeof variants]} ${className}`}
        >
            {children}
        </button>
    )
}

const Card = ({ children, className = '' }: any) => (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>{children}</div>
)

export default function ImportWizardPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Review, 3: Success
    const [file, setFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedCampaign[]>([]);
    const [groupedCampaigns, setGroupedCampaigns] = useState<Map<string, { total: number, count: number, status: string, pid?: string, pName?: string }>>(new Map());
    const [products, setProducts] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    // Load Products for matching
    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase.from('products').select('variant_id, title, sku');
            if (data) {
                setProducts(data.map(p => ({ id: p.variant_id, title: p.title, sku: p.sku })));
            }
        };
        fetchProducts();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);

        setIsParsing(true);
        const parser = new SmartParser(products);
        try {
            const results = await parser.parseAndMatch(f);
            setParsedData(results);
            groupResults(results);
            setStep(2);
        } catch (err) {
            console.error(err);
            alert("Dosya okunamadı.");
        } finally {
            setIsParsing(false);
        }
    };

    const groupResults = (results: ParsedCampaign[]) => {
        const groups = new Map<string, any>();

        results.forEach(r => {
            const current = groups.get(r.campaignName) || {
                total: 0,
                count: 0,
                status: r.matchStatus,
                pid: r.matchedProduct?.id,
                pName: r.matchedProduct?.title
            };

            current.total += r.amount;
            current.count += 1;
            // Keep "matched" status if ANY row matched? Or if generic logic?
            // Usually if SmartParser says matched, it's consistent for the campaign name.
            groups.set(r.campaignName, current);
        });
        setGroupedCampaigns(groups);
    };

    const handleMappingChange = (campaignName: string, productId: string) => {
        const newGroups = new Map(groupedCampaigns);
        const group = newGroups.get(campaignName);
        if (group) {
            group.pid = productId;
            group.status = productId === 'IGNORE' ? 'ignored' : (productId === 'GENERAL' ? 'matched' : 'matched');
            // If product selected, find name
            if (productId !== 'GENERAL' && productId !== 'IGNORE') {
                const p = products.find(prod => prod.id === productId);
                group.pName = p?.title;
            } else {
                group.pName = undefined;
            }
            newGroups.set(campaignName, group);
            setGroupedCampaigns(newGroups);
        }
    };

    const saveAndProcess = async () => {
        setIsSaving(true);
        try {
            // 1. Save Mappings (only changed or manual ones)
            // We save ALL confirmed mappings to "teach" the system
            const mappingsPayload: any[] = [];

            // Get User ID from somewhere (auth check needed)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Oturum süresi dolmuş.");

            Array.from(groupedCampaigns.entries()).forEach(([name, data]) => {
                if (data.status === 'ignored') return;

                mappingsPayload.push({
                    user_id: user.id,
                    campaign_name_pattern: name,
                    target_product_id: data.pid === 'GENERAL' ? 'GENERAL' : data.pid, // 'GENERAL' or ProductID
                    match_type: 'manual' // User confirmed it
                });
            });

            if (mappingsPayload.length > 0) {
                const { error: mapErr } = await supabase.from('ad_campaign_mappings').upsert(mappingsPayload, { onConflict: 'user_id,campaign_name_pattern' });
                if (mapErr) console.error("Mapping save error", mapErr);
            }

            // 2. Save Spends
            const spendsPayload = parsedData.map(row => {
                const group = groupedCampaigns.get(row.campaignName);
                if (!group || group.status === 'ignored') return null;

                return {
                    user_id: user.id,
                    date: row.date, // Ensure format is YYYY-MM-DD? SmartParser passes string.
                    campaign_name: row.campaignName,
                    amount: row.amount,
                    product_id: group.pid === 'GENERAL' ? null : group.pid,
                    is_general_spend: group.pid === 'GENERAL'
                };
            }).filter(Boolean);

            if (spendsPayload.length > 0) {
                const { error: spendErr } = await supabase.from('marketing_spends').insert(spendsPayload);
                if (spendErr) throw spendErr;
            }

            setStep(3);
        } catch (e: any) {
            alert("Hata oluştu: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reklam Harcaması İçeri Aktar</h1>
                    <p className="text-gray-500">Meta/Facebook CSV veya Excel dosyasını yükleyin ve harcamaları ürünlere dağıtın.</p>
                </div>
            </div>

            {step === 1 && (
                <Card className="p-12 border-dashed border-2 border-gray-300 bg-gray-50 text-center">
                    <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={isParsing}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload size={48} className="text-gray-400 mb-4" />
                        <span className="text-lg font-medium text-gray-700">Dosyayı Buraya Sürükleyin veya Seçin</span>
                        <span className="text-sm text-gray-500 mt-2">.csv, .xlsx, .xls formatları</span>
                        {isParsing && <span className="mt-4 text-blue-600 animate-pulse">Analiz ediliyor...</span>}
                    </label>
                </Card>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="p-4 bg-blue-50 border-blue-100">
                            <span className="text-sm text-blue-600 font-bold uppercase">Toplam Harcama</span>
                            <div className="text-2xl font-bold mt-1">
                                {Array.from(groupedCampaigns.values()).reduce((a, b) => a + b.total, 0).toLocaleString()} ₺
                            </div>
                        </Card>
                        <Card className="p-4 bg-green-50 border-green-100">
                            <span className="text-sm text-green-600 font-bold uppercase">Eşleşen Kampanya</span>
                            <div className="text-2xl font-bold mt-1">
                                {Array.from(groupedCampaigns.values()).filter(g => g.pid).length} / {groupedCampaigns.size}
                            </div>
                        </Card>
                        <Card className="p-4 bg-amber-50 border-amber-100">
                            <span className="text-sm text-amber-600 font-bold uppercase">İşlem Bekleyen</span>
                            <div className="text-2xl font-bold mt-1">
                                {Array.from(groupedCampaigns.values()).filter(g => !g.pid).length}
                            </div>
                        </Card>
                    </div>

                    {/* Mapping List */}
                    <div className="bg-white border rounded-lg overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-4">Kampanya Adı</div>
                            <div className="col-span-2 text-right">Tutar</div>
                            <div className="col-span-6">Eşleşen Ürün / Aksiyon</div>
                        </div>
                        <div className="divide-y max-h-[500px] overflow-y-auto">
                            {Array.from(groupedCampaigns.entries()).map(([name, data]) => (
                                <div key={name} className={`grid grid-cols-12 gap-4 p-4 items-center ${!data.pid ? 'bg-amber-50/50' : ''}`}>
                                    <div className="col-span-4 font-medium text-sm truncate" title={name}>
                                        {name}
                                        <div className="text-xs text-gray-400 font-normal">{data.count} satır</div>
                                    </div>
                                    <div className="col-span-2 text-right font-mono text-sm">
                                        {data.total.toLocaleString()} ₺
                                    </div>
                                    <div className="col-span-6 flex gap-2">
                                        <select
                                            className="flex-1 border rounded-md text-sm p-2 bg-white"
                                            value={data.pid || ''}
                                            onChange={(e) => handleMappingChange(name, e.target.value)}
                                        >
                                            <option value="" disabled>-- Seçin --</option>
                                            <option value="GENERAL">🏢 Genel Mağaza Gideri</option>
                                            <option value="IGNORE">❌ Yok Say (İşleme)</option>
                                            <optgroup label="Ürünler">
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.title}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="ghost" onClick={() => setStep(1)}>İptal</Button>
                        <Button onClick={saveAndProcess} disabled={isSaving}>
                            {isSaving ? 'Kaydediliyor...' : 'Onayla ve İşle'} <ArrowRight size={16} className="ml-2 inline" />
                        </Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Başarıyla Aktarıldı!</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Reklam verileri işlendi ve finansal tablolara yansıtıldı. Akıllı sistem eşleştirmelerinizi kaydetti.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={() => setStep(1)}>Yeni Dosya Yükle</Button>
                        <Button onClick={() => router.push('/dashboard')}>Dashboard'a Dön</Button>
                    </div>
                </div>
            )}
        </div>
    )
}
