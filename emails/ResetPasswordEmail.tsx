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

interface ResetPasswordEmailProps {
    resetLink: string;
}

export const ResetPasswordEmail = ({
    resetLink,
}: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Prificient hesabınız için şifre sıfırlama talebi.</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px]">
                            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                                Prificient
                            </Heading>
                        </Section>
                        <Heading className="text-black text-[20px] font-normal text-start p-0 my-[30px] mx-0">
                            Şifrenizi Sıfırlayın
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hesabınız için bir şifre sıfırlama talebi aldık. Eğer bu talebi siz yapmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={resetLink}
                            >
                                Şifremi Sıfırla
                            </Button>
                        </Section>
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            Bu bağlantı güvenliğiniz için bir süre sonra geçerliliğini yitirecektir.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ResetPasswordEmail;

