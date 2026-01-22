import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
    Tailwind,
    Section,
    Hr,
    Img,
} from "@react-email/components";
import * as React from "react";

interface TicketCreatedProps {
    userName?: string;
    ticketId: string;
    subject: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL : 'https://prificient.com';
const logoUrl = baseUrl.includes('localhost') ? 'https://placehold.co/48x48/000000/ffffff?text=P' : `${baseUrl}/logo.png`;

export const TicketCreated = ({
    userName = "Kullanıcı",
    ticketId,
    subject
}: TicketCreatedProps) => {
    const previewText = `Talebiniz Alındı: ${subject}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans text-gray-900 antialiased">
                    <Container className="bg-white border border-gray-100 rounded-lg shadow-sm my-[40px] mx-auto p-[40px] max-w-[500px]">
                        <Section className="text-center mb-8">
                            <Img
                                src={logoUrl}
                                width="48"
                                height="48"
                                alt="Prificient"
                                className="mx-auto"
                            />
                            <Text className="text-gray-900 text-[20px] font-bold mt-2 tracking-tight">
                                Prificient
                            </Text>
                        </Section>

                        <Heading className="text-gray-900 text-[18px] font-semibold text-center p-0 mb-[24px] mx-0">
                            Talebiniz Bize Ulaştı
                        </Heading>

                        <Text className="text-gray-700 text-[15px] leading-[24px]">
                            Merhaba {userName},
                        </Text>
                        <Text className="text-gray-700 text-[15px] leading-[24px]">
                            <strong>"{subject}"</strong> konulu destek talebiniz başarıyla oluşturulmuştur. Ekibimiz konuyu inceleyip en kısa sürede size dönüş yapacaktır.
                        </Text>

                        <Section className="bg-gray-50 rounded p-4 my-6 text-center border border-gray-100">
                            <Text className="text-gray-500 text-[11px] uppercase font-bold m-0 tracking-wider">Ticket ID</Text>
                            <Text className="text-gray-900 text-[16px] font-mono font-bold m-0 mt-2 tracking-wider">{ticketId}</Text>
                        </Section>

                        <Text className="text-gray-700 text-[15px] leading-[24px] text-center">
                            Panelinizden durumu takip edebilirsiniz.
                        </Text>

                        <Hr className="border-gray-100 my-[26px]" />

                        <Text className="text-rose-500 text-[12px] font-medium leading-[20px] text-center bg-rose-50 p-2 rounded">
                            Lütfen bu e-postayı yanıtlamayın. Bu otomatik bir bilgilendirme mesajıdır.
                        </Text>

                        <Section className="mt-[32px] pt-[32px] border-t border-gray-50 text-center">
                            <Text className="text-gray-400 text-[11px] leading-[18px]">
                                © {new Date().getFullYear()} Prificient. Tüm hakları saklıdır.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default TicketCreated;
