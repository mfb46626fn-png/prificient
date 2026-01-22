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
    Hr,
} from '@react-email/components';
import React from 'react';

interface TicketRepliedEmailProps {
    userName: string;
    ticketId: string;
    subject: string;
    replyMessage: string;
}

export default function TicketRepliedEmail({
    userName = 'Kullanıcı',
    ticketId = '123456',
    subject = 'Ödeme Sorunu',
    replyMessage = 'Merhaba, ödeme işleminizi kontrol ettik ve sorun giderildi. Lütfen tekrar deneyin.',
}: TicketRepliedEmailProps) {
    const dashboardLink = `https://prificient.com/dashboard/support/${ticketId}`; // Update with actual domain if known or process.env

    return (
        <Html>
            <Head />
            <Preview>Destek talebinize cevap verildi.</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px]">
                            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                                Prificient Destek
                            </Heading>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Merhaba <strong>{userName}</strong>,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            <strong>{subject}</strong> konulu destek talebinize bir cevap verildi:
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-gray-700 text-[14px] leading-[24px] bg-gray-50 p-4 rounded border border-gray-100 italic">
                            &quot;{replyMessage}&quot;
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={dashboardLink}
                            >
                                Talebi Görüntüle
                            </Button>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Veya şu bağlantıya tıklayın: <br />
                            <a href={dashboardLink} className="text-blue-600 no-underline">{dashboardLink}</a>
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px] mt-8">
                            Teşekkürler,
                            <br />
                            Prificient Ekibi
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
