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
} from "@react-email/components";
import * as React from "react";

interface WaitlistWelcomeEmailProps {
    waitlistPosition?: number;
}

export const WaitlistWelcomeEmail = ({
    waitlistPosition = 1204,
}: WaitlistWelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>{`Gerçeklerle Yüzleşmeye Hoş Geldiniz. Sıranız: #${waitlistPosition}`}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        {/* Header */}
                        <Section className="mt-[32px]">
                            <Heading className="text-black text-[24px] font-bold text-center p-0 my-[16px] mx-0">
                                Prificient
                            </Heading>
                        </Section>

                        {/* Waitlist Badge */}
                        <Section className="text-center my-[24px]">
                            <Text className="text-[#6d28d9] text-[12px] font-semibold tracking-widest uppercase m-0">
                                Erken Erişim Sırası
                            </Text>
                            <Heading className="text-black text-[36px] font-bold p-0 m-0">
                                #{waitlistPosition.toLocaleString('tr-TR')}
                            </Heading>
                        </Section>

                        <Hr className="border-[#eaeaea] my-[24px]" />

                        {/* Content */}
                        <Text className="text-black text-[14px] leading-[24px]">
                            Ücretsiz araçlarımızı kullandınız. Gördüğünüz rakamlar sadece buzdağının görünen kısmı.
                        </Text>

                        <Text className="text-black text-[14px] leading-[24px]">
                            Prificient tam sürümü yayınlandığında, bu hesaplamaları manuel yapmak zorunda kalmayacaksınız.
                            Sisteme Meta ve Shopify&apos;ı bağlayacak, arkanıza yaslanacaksınız.
                        </Text>

                        <Text className="text-[#6b7280] text-[14px] leading-[24px]">
                            Erken erişim sırasındasınız. Beklerken diğer ücretsiz araçlarımızı kullanmaya devam edebilirsiniz.
                        </Text>

                        {/* CTA Button */}
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#6d28d9] rounded-lg text-white text-[14px] font-semibold no-underline text-center px-6 py-3"
                                href="https://tools.prificient.com/tools-home"
                            >
                                Araçları Keşfet
                            </Button>
                        </Section>

                        <Hr className="border-[#eaeaea] my-[24px]" />

                        {/* Footer */}
                        <Text className="text-[#9ca3af] text-[12px] leading-[20px] text-center">
                            Bu e-posta Prificient Erken Erişim sistemi tarafından gönderilmiştir.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WaitlistWelcomeEmail;
