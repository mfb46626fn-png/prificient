import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';
import React from 'react';

interface TicketReceivedEmailProps {
    userName: string;
    ticketId: string;
    subject: string;
}

export default function TicketReceivedEmail({
    userName = 'Kullanıcı',
    ticketId = '123456',
    subject = 'Ödeme Sorunu',
}: TicketReceivedEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Destek talebiniz alındı.</Preview>
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
                            <strong>{subject}</strong> konulu destek talebinizi aldık. Ekibimiz en kısa sürede inceleyip size dönüş yapacaktır.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Talep Numaranız: <span className="font-mono text-gray-500">{ticketId}</span>
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
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
