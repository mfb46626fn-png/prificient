import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
    Row,
    Column,
} from '@react-email/components';
import React from 'react';

interface WeeklyReportEmailProps {
    userName: string;
    startDate: string;
    endDate: string;
    netProfit: number;
    revenue: number;
    adSpend: number;
    roi: number;
}

export default function WeeklyReportEmail({
    userName = 'Kullanıcı',
    startDate = '12 Ocak',
    endDate = '19 Ocak',
    netProfit = 12500,
    revenue = 45000,
    adSpend = 8000,
    roi = 5.6,
}: WeeklyReportEmailProps) {
    const dashboardLink = 'https://prificient.com/dashboard/reports';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    return (
        <Html>
            <Head />
            <Preview>Haftalık finansal özetiniz hazır.</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[600px]">
                        <Section className="mt-[32px]">
                            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                                Haftalık Finansal Özet
                            </Heading>
                            <Text className="text-center text-gray-500 text-[14px]">
                                {startDate} - {endDate}
                            </Text>
                        </Section>

                        <Text className="text-black text-[14px] leading-[24px]">
                            Merhaba <strong>{userName}</strong>,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Geçtiğimiz haftanın performans verileri aşağıdadır. Detaylı analiz için dashboard&apos;u ziyaret edebilirsiniz.
                        </Text>

                        <Section className="my-[20px]">
                            <Row>
                                <Column className="w-1/2 p-2">
                                    <div className="bg-green-50 border border-green-100 rounded p-4 text-center">
                                        <Text className="text-green-800 text-[12px] font-bold uppercase m-0">Net Kâr</Text>
                                        <Text className="text-green-600 text-[20px] font-bold m-0 mt-1">{formatCurrency(netProfit)}</Text>
                                    </div>
                                </Column>
                                <Column className="w-1/2 p-2">
                                    <div className="bg-blue-50 border border-blue-100 rounded p-4 text-center">
                                        <Text className="text-blue-800 text-[12px] font-bold uppercase m-0">Ciro</Text>
                                        <Text className="text-blue-600 text-[20px] font-bold m-0 mt-1">{formatCurrency(revenue)}</Text>
                                    </div>
                                </Column>
                            </Row>
                            <Row>
                                <Column className="w-1/2 p-2">
                                    <div className="bg-orange-50 border border-orange-100 rounded p-4 text-center">
                                        <Text className="text-orange-800 text-[12px] font-bold uppercase m-0">Reklam Harcaması</Text>
                                        <Text className="text-orange-600 text-[20px] font-bold m-0 mt-1">{formatCurrency(adSpend)}</Text>
                                    </div>
                                </Column>
                                <Column className="w-1/2 p-2">
                                    <div className="bg-purple-50 border border-purple-100 rounded p-4 text-center">
                                        <Text className="text-purple-800 text-[12px] font-bold uppercase m-0">ROI</Text>
                                        <Text className="text-purple-600 text-[20px] font-bold m-0 mt-1">{roi}x</Text>
                                    </div>
                                </Column>
                            </Row>
                        </Section>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={dashboardLink}
                            >
                                Detaylı Raporu Gör
                            </Button>
                        </Section>

                        <Text className="text-gray-500 text-[12px] leading-[20px] mt-8 text-center">
                            Bu e-posta otomatik olarak oluşturulmuştur.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
