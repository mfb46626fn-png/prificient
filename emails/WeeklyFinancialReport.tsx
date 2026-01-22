import {
    Body,
    Button,
    Container,
    Column,
    Head,
    Heading,
    Html,
    Preview,
    Row,
    Section,
    Text,
    Tailwind,
    Hr,
} from "@react-email/components";
import * as React from "react";

interface WeeklyFinancialReportProps {
    userName?: string;
    title?: string; // e.g. "Günlük Özet"
    netProfit: string; // e.g., "₺12.500"
    revenue: string;   // e.g., "₺45.000"
    adSpend: string;   // e.g., "₺5.000"
    roi: string;       // e.g., "%250"
    dashboardUrl: string;
    dateRange: string;
}

export const WeeklyFinancialReport = ({
    userName = "Kullanıcı",
    title = "Haftalık Özet",
    netProfit,
    revenue,
    adSpend,
    roi,
    dashboardUrl,
    dateRange,
}: WeeklyFinancialReportProps) => {
    const previewText = `${title}: Ciro ${revenue}, Kâr ${netProfit}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-gray-100 my-auto mx-auto font-sans">
                    <Container className="bg-white border border-gray-200 rounded shadow-sm my-[40px] mx-auto p-[40px] max-w-[600px]">
                        <Section className="text-center mb-8">
                            <Heading className="text-black text-[24px] font-bold p-0 my-0 mx-0">
                                Prificient
                            </Heading>
                        </Section>

                        <Heading className="text-gray-900 text-[24px] font-bold text-center p-0 mb-[4px] mx-0">
                            {title}
                        </Heading>
                        <Text className="text-gray-500 text-[14px] text-center mt-0 mb-[32px]">
                            {dateRange}
                        </Text>

                        {/* Summary Cards */}
                        <Section className="mb-[32px]">
                            <Row>
                                <Column align="center" className="w-1/2 p-2">
                                    <div className="bg-gray-50 border border-gray-100 rounded p-4 h-full">
                                        <Text className="text-gray-500 text-[12px] uppercase font-bold m-0 tracking-wider">Ciro</Text>
                                        <Text className="text-black text-[24px] font-bold m-0 mt-1">{revenue}</Text>
                                    </div>
                                </Column>
                                <Column align="center" className="w-1/2 p-2">
                                    <div className="bg-green-50 border border-green-100 rounded p-4 h-full">
                                        <Text className="text-green-600 text-[12px] uppercase font-bold m-0 tracking-wider">Net Kâr</Text>
                                        <Text className="text-green-700 text-[24px] font-bold m-0 mt-1">{netProfit}</Text>
                                    </div>
                                </Column>
                            </Row>
                            <Row className="mt-2">
                                <Column align="center" className="w-1/2 p-2">
                                    <div className="bg-gray-50 border border-gray-100 rounded p-4 h-full">
                                        <Text className="text-gray-500 text-[12px] uppercase font-bold m-0 tracking-wider">Reklam Harcaması</Text>
                                        <Text className="text-black text-[24px] font-bold m-0 mt-1">{adSpend}</Text>
                                    </div>
                                </Column>
                                <Column align="center" className="w-1/2 p-2">
                                    <div className="bg-gray-50 border border-gray-100 rounded p-4 h-full">
                                        <Text className="text-gray-500 text-[12px] uppercase font-bold m-0 tracking-wider">ROI</Text>
                                        <Text className="text-blue-600 text-[24px] font-bold m-0 mt-1">{roi}</Text>
                                    </div>
                                </Column>
                            </Row>
                        </Section>

                        <Text className="text-gray-600 text-[14px] leading-[24px] text-center mb-[24px]">
                            Daha detaylı analizler ve grafikler için panelinizi ziyaret edin.
                        </Text>

                        <Section className="text-center">
                            <Button
                                className="bg-black text-white rounded-md text-[14px] font-medium no-underline text-center px-6 py-3 hover:bg-gray-800 transition-colors"
                                href={dashboardUrl}
                            >
                                Panel'e Git
                            </Button>
                        </Section>

                        <Section className="mt-[32px] pt-[32px] border-t border-gray-100 text-center">
                            <Text className="text-gray-500 text-[12px] leading-[20px]">
                                Bu rapor otomatik olarak oluşturulmuştur.
                                <br />
                                © {new Date().getFullYear()} Prificient. Tüm hakları saklıdır.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WeeklyFinancialReport;
