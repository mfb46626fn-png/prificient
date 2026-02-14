'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MetaParserCore, NormalizedAdRow } from '@/lib/import/meta-parser-core'
import { AttributionService } from '@/lib/services/attribution'
import { processImport } from '@/lib/actions/meta-import'
import { Upload, FileText, Check, AlertTriangle, ArrowRight, Save, X, Loader2, RefreshCw, HelpCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CryptoJS from 'crypto-js'
import { HowToImportModal } from '@/components/import/HowToImportModal'
import { MetaValidator } from '@/lib/import/meta-validator'

// --- Components ---
const Button = ({ children, onClick, disabled, variant = 'primary', className = '', icon: Icon }: any) => {
    const base = "px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
        ghost: "hover:bg-gray-100 text-gray-600",
        danger: "bg-red-50 text-red-600 hover:bg-red-100"
    }
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant as keyof typeof variants]} ${className}`}
        >
            {Icon && <Icon size={16} />}
            {children}
        </button>
    )
}

const Card = ({ children, className = '' }: any) => (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>{children}</div>
)

const StepIndicator = ({ current, step, title }: { current: number, step: number, title: string }) => {
    const active = current === step;
    const completed = current > step;
    return (
        <div className={`flex items-center gap-3 ${active ? 'text-blue-600' : (completed ? 'text-green-600' : 'text-gray-400')}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 
                ${active ? 'border-blue-600 bg-blue-50' : (completed ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-gray-50')}`}>
                {completed ? <Check size={16} /> : step}
            </div>
            <span className="font-medium">{title}</span>
            {step < 3 && <div className="w-12 h-px bg-gray-200 ml-2" />}
        </div>
    )
}

// --- Main Page ---
export default function ImportWizardPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [mappings, setMappings] = useState<any[]>([]);
    const [showGuide, setShowGuide] = useState(false);

    // Upload State
    const [fileHash, setFileHash] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [parseErrors, setParseErrors] = useState<string[]>([]);

    // Mapping State
    const [rows, setRows] = useState<NormalizedAdRow[]>([]);

    // Review State
    const [groupedCampaigns, setGroupedCampaigns] = useState<Map<string, any>>(new Map());

    const supabase = createClient();
    const router = useRouter();

    // Load Data on Mount
    useEffect(() => {
        const load = async () => {
            const [pRes, mRes] = await Promise.all([
                supabase.from('products').select('variant_id, title, sku, handle'),
                supabase.from('ad_campaign_mappings').select('*')
            ]);

            if (pRes.data) setProducts(pRes.data.map(p => ({ id: p.variant_id, title: p.title, sku: p.sku, handle: p.handle })));
            if (mRes.data) setMappings(mRes.data);
        };
        load();
    }, []);

    const computeHash = (content: string) => {
        return CryptoJS.MD5(content).toString();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setParseErrors([]);

        try {
            const text = await file.text();

            const hash = computeHash(text);

            // Check Duplicate
            const { data: existing } = await supabase.from('ad_imports').select('id').eq('file_hash', hash).single();
            if (existing) {
                if (!confirm("Bu dosya daha önce yüklenmiş görünüyor. Yine de devam etmek istiyor musunuz?")) {
                    setIsProcessing(false);
                    return;
                }
            }

            setFileHash(hash);
            setFileName(file.name);

            // Parse
            const parser = new MetaParserCore(text);
            const { data, errors } = await parser.parse();

            if (errors.length > 0) {
                if (data.length === 0) {
                    setParseErrors(errors);
                    setIsProcessing(false);
                    return;
                }
            }

            // DAILY BREAKDOWN VALIDATION via Class
            const valErrors = MetaValidator.validateDailyBreakdown(data);
            if (valErrors.length > 0) {
                const proceed = confirm(valErrors[0] + "\n\nDevam edilsin mi?");
                if (!proceed) {
                    setIsProcessing(false);
                    return;
                }
            }

            setRows(data);

            // Attribute
            const attributor = new AttributionService(products, mappings);
            const groups = new Map<string, any>();

            data.forEach(row => {
                const current = groups.get(row.campaign_name) || {
                    total: 0,
                    count: 0,
                    campaign_name: row.campaign_name
                };
                current.total += row.amount;
                current.count += 1;
                groups.set(row.campaign_name, current);
            });

            // Run smart attribution on unique campaigns
            Array.from(groups.values()).forEach(group => {
                const attr = attributor.attribute(group.campaign_name);
                group.selectedPid = attr.product_id || (attr.confidence > 0.8 ? attr.product_id : null);
                group.suggestedPid = attr.product_id;
                group.method = attr.method;
                group.confidence = attr.confidence;
                group.product_title = attr.product_title;
                if (!group.selectedPid) group.selectedPid = 'GENERAL';
            });

            setGroupedCampaigns(groups);
            setStep(2);

        } catch (err: any) {
            alert("Dosya okuma hatası: " + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMappingChange = (campaign: string, pid: string) => {
        const newGroups = new Map(groupedCampaigns);
        const g = newGroups.get(campaign);
        if (g) {
            g.selectedPid = pid;
            newGroups.set(campaign, g);
        }
        setGroupedCampaigns(newGroups);
    };

    const handleSave = async () => {
        setIsProcessing(true);
        try {
            // Prepare Payload
            const mappedRows = rows.map(row => {
                const group = groupedCampaigns.get(row.campaign_name);
                return {
                    row,
                    product_id: group?.selectedPid || 'IGNORE'
                };
            });

            const result = await processImport({
                fileHash,
                mappedRows: JSON.parse(JSON.stringify(mappedRows))
            });

            if (result.success) {
                setStep(3);
            }
        } catch (e: any) {
            alert("Kayıt hatası: " + e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <HowToImportModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Akıllı İçe Aktarım</h1>
                    <p className="text-gray-500">Meta Reklamları için hatasız, öğrenen içe aktarım sihirbazı.</p>
                </div>
                <Button variant="secondary" onClick={() => setShowGuide(true)} icon={HelpCircle}>
                    Nasıl İndirilir?
                </Button>
            </div>

            {/* Stepper */}
            <div className="flex justify-center gap-8 py-4">
                <StepIndicator current={step} step={1} title="Yükleme" />
                <StepIndicator current={step} step={2} title="Eşleştirme" />
                <StepIndicator current={step} step={3} title="Sonuç" />
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
                <Card className="p-12 border-dashed border-2 border-gray-300 bg-gray-50 text-center transition-colors hover:bg-gray-100 relative group">
                    <input
                        type="file"
                        accept=".csv, .xlsx, .xls, .txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={isProcessing}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full h-full">
                        {isProcessing ? (
                            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                        ) : (
                            <Upload size={48} className="text-gray-400 mb-4 group-hover:text-blue-500 transition-colors" />
                        )}
                        <span className="text-lg font-medium text-gray-700">
                            {isProcessing ? "Dosya Analiz Ediliyor..." : "Dosyayı Buraya Sürükleyin veya Tıklayın"}
                        </span>
                        <span className="text-sm text-gray-500 mt-2">.csv, .xlsx (Maks 10MB)</span>

                        {parseErrors.length > 0 && (
                            <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm text-left w-full max-w-lg rounded-md border border-red-200">
                                <p className="font-bold flex items-center gap-2 mb-2"><AlertTriangle size={16} /> Hatalar Tespit Edildi:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    {parseErrors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                                    {parseErrors.length > 5 && <li>... ve {parseErrors.length - 5} hata daha.</li>}
                                </ul>
                            </div>
                        )}
                    </label>

                    {/* Quick Helper */}
                    <button
                        onClick={(e) => { e.preventDefault(); setShowGuide(true); }}
                        className="absolute top-4 right-4 text-gray-400 hover:text-blue-600"
                        title="Hangi formatı yüklemeliyim?"
                    >
                        <HelpCircle size={24} />
                    </button>
                </Card>
            )}

            {/* Step 2: Mapping */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
                        <div className="flex items-center gap-2">
                            <Check size={18} className="text-blue-600" />
                            <span className="font-medium">{rows.length} satır işlendi.</span>
                        </div>
                        <div className="text-sm">
                            Toplam Harcama: <span className="font-bold">{rows.reduce((a, b) => a + b.amount, 0).toLocaleString()} ₺</span>
                        </div>
                    </div>

                    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                        <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase">
                            <div className="col-span-5">Kampanya Adı</div>
                            <div className="col-span-2 text-right">Tutar</div>
                            <div className="col-span-5">Eşleşen Ürün</div>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto divide-y">
                            {Array.from(groupedCampaigns.values()).map((group) => {
                                const isManual = group.method === 'manual';
                                const isAuto = group.method === 'fuzzy' || group.method === 'regex' || group.method === 'cache';

                                return (
                                    <div key={group.campaign_name} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                                        <div className="col-span-5">
                                            <div className="font-medium text-gray-900 text-sm" title={group.campaign_name}>{group.campaign_name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{group.count} kayıt</span>
                                                {isAuto && (
                                                    <span className="text-[10px] text-green-600 border border-green-200 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        <RefreshCw size={10} /> Otomatik (%{Math.round(group.confidence * 100)})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-right font-mono text-sm text-gray-700">
                                            {group.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="col-span-5">
                                            <select
                                                className={`w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2
                                                    ${group.selectedPid === 'GENERAL' ? 'bg-amber-50 border-amber-200 text-amber-800' : ''}
                                                    ${group.selectedPid === 'IGNORE' ? 'bg-gray-100 text-gray-400' : ''}
                                                    ${group.selectedPid && group.selectedPid.length > 10 ? 'bg-green-50 border-green-200 text-green-800' : ''}
                                                `}
                                                value={group.selectedPid || 'GENERAL'}
                                                onChange={(e) => handleMappingChange(group.campaign_name, e.target.value)}
                                            >
                                                <option value="GENERAL">🏢 Genel Marka Gideri</option>
                                                <option value="IGNORE">❌ Yok Say (İşleme)</option>
                                                <optgroup label="Ürünler">
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.sku ? `[${p.sku}] ` : ''}{p.title}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setStep(1)} disabled={isProcessing}>İptal</Button>
                        <Button onClick={handleSave} disabled={isProcessing} icon={isProcessing ? Loader2 : Save}>
                            {isProcessing ? 'İşleniyor...' : 'Onayla ve Kaydet'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
                <div className="text-center py-20 bg-white rounded-lg border shadow-sm">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">İçe Aktarım Başarılı!</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Tüm harcamalar başarıyla muhasebeleştirildi ve ürün kârlılıklarına dağıtıldı.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="secondary" onClick={() => { setStep(1); setRows([]); setGroupedCampaigns(new Map()); setFileHash(''); }}>
                            Yeni Dosya Yükle
                        </Button>
                        <Button onClick={() => router.push('/dashboard')}>
                            Dashboard'a Dön
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
