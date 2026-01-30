import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Text,
} from '@react-email/components';
import * as React from 'react';

const SystemReadyEmail = () => (
    <Html>
        <Head />
        <Preview>Verileriniz işlendi. Analizleriniz hazır.</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Analizleriniz Hazır</Heading>
                <Text style={text}>
                    Tüm geçmiş verileriniz Prificient finansal zeka motoruna başarıyla aktarıldı ve işlendi.
                </Text>
                <Text style={text}>
                    Artık Dashboard üzerinden işletmenizin gerçek kârlılığını görebilirsiniz.
                </Text>
                <Link href="https://prificient.com/dashboard" style={btn}>
                    Sonuçları Gör
                </Link>
            </Container>
        </Body>
    </Html>
);

export default SystemReadyEmail;

const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '560px',
};

const h1 = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
};

const text = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#555',
};

const btn = {
    backgroundColor: '#000000',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '100%',
    padding: '12px',
    marginTop: '20px',
};
