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

interface SecurityAlertEmailProps {
    type: 'password_changed' | 'account_deleted';
    date: string;
    name?: string;
    ipAddress?: string;
}

export const SecurityAlertEmail = ({
    type,
    date,
    name,
    ipAddress,
}: SecurityAlertEmailProps) => {
    const isDeletion = type === 'account_deleted';
    const title = isDeletion ? "Hesabınız Silindi" : "Şifreniz Değiştirildi";
    const message = isDeletion
        ? "Hesabınız ve ilişkili tüm verileriniz kalıcı olarak silinmiştir. Sizinle çalışmak bir zevkti."
        : "Hesabınızın şifresi başarıyla değiştirildi. Eğer bu işlemi siz yapmadıysanız lütfen hemen bizimle iletişime geçin.";

    return (
        <Html>
            <Head />
            <Preview>⚠️ Güvenlik Uyarısı: {title}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px]">
                            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                                Prificient
                            </Heading>
                        </Section>
                        <Section className="bg-red-50 p-4 rounded-md mb-6 border border-red-100">
                            <Heading className="text-red-800 text-[18px] font-bold text-start p-0 m-0">
                                ⚠️ Güvenlik Uyarısı
                            </Heading>
                        </Section>

                        <Heading className="text-black text-[20px] font-normal text-start p-0 mb-[20px] mx-0">
                            {title}
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            {message}
                        </Text>
                        <Text className="text-[#666666] text-[12px] mt-[20px]">
                            İşlem Tarihi: {date}
                        </Text>
                        {!isDeletion && (
                            <Section className="text-center mt-[32px] mb-[32px]">
                                <Button
                                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                    href="mailto:info@prificient.com"
                                >
                                    Destek Ekibi ile İletişime Geç
                                </Button>
                            </Section>
                        )}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default SecurityAlertEmail;

