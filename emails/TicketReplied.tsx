import {
    Body,
    Button,
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

interface TicketRepliedProps {
    userName?: string;
    ticketSubject: string;
    ticketId: string;
    dashboardUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL : 'https://prificient.com';
const logoUrl = baseUrl.includes('localhost') ? 'https://placehold.co/48x48/000000/ffffff?text=P' : `${baseUrl}/logo.png`;

export const TicketReplied = ({
    userName = "Kullanıcı",
    ticketSubject,
    ticketId,
    dashboardUrl,
}: TicketRepliedProps) => {
    const previewText = `Yeni Yanıt: ${ticketSubject}`;

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
                            Yeni Yanıtınız Var
                        </Heading>

                        <Text className="text-gray-700 text-[15px] leading-[24px]">
                            Merhaba {userName},
                        </Text>
                        <Text className="text-gray-700 text-[15px] leading-[24px]">
                            <strong>"{ticketSubject}"</strong> konulu destek talebinize yeni bir yanıt verildi.
                        </Text>

                        <Section className="text-center my-[32px]">
                            <Button
                                className="bg-black text-white rounded-md text-[14px] font-medium no-underline text-center px-6 py-3 shadow-sm"
                                href={dashboardUrl}
                            >
                                Panelden Yanıtla
                            </Button>
                        </Section>

                        <Hr className="border-gray-100 my-[26px]" />

                        <Text className="text-rose-500 text-[12px] font-medium leading-[20px] text-center bg-rose-50 p-2 rounded">
                            Lütfen bu e-postayı yanıtlamayın. Yukarıdaki butonu kullanarak panel üzerinden iletişime geçin.
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

export default TicketReplied;
