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
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    name?: string;
}

export const WelcomeEmail = ({
    name,
}: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Prificient'a Hoş Geldiniz - Gerçekler Başlıyor.</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px]">
                            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                                Prificient
                            </Heading>
                        </Section>
                        <Heading className="text-black text-[20px] font-normal text-start p-0 my-[30px] mx-0">
                            Hoş Geldiniz{name ? `, ${name}` : ''}
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hesabınız başarıyla oluşturuldu. Artık e-ticaret operasyonlarınızı tahminlerle değil, gerçek veri ve analizlerle yönetme zamanı.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            İlk tarama işleminizi başlatmak ve işletmenizin finansal röntgenini çekmek için panele giriş yapın.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href="https://prificient.com/dashboard"
                            >
                                Panele Git
                            </Button>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WelcomeEmail;

