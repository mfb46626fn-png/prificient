import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Hr,
} from '@react-email/components';
import * as React from 'react';

interface OrderProfitEmailProps {
    orderName: string;
    revenue: string;
    costs: string;
    profit: string;
    orderId: string;
}

const OrderProfitEmail = ({
    orderName = '#0000',
    revenue = '0.00',
    costs = '0.00',
    profit = '0.00',
    orderId = '',
}: OrderProfitEmailProps) => (
    <Html>
        <Head />
        <Preview>Sipariş {orderName}: ₺{profit} Net Kâr Bıraktı</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Tebrikler, yeni bir sipariş!</Heading>

                <Section style={card}>
                    <Text style={row}>
                        <span style={label}>Sipariş Tutarı (Ciro):</span>
                        <span style={value}>₺{revenue}</span>
                    </Text>
                    <Text style={row}>
                        <span style={label}>Maliyetler:</span>
                        <span style={{ ...value, color: '#ef4444' }}>-₺{costs}</span>
                    </Text>
                    <Hr style={hr} />
                    <Text style={row}>
                        <span style={label}>Tahmini Net Kâr:</span>
                        <span style={{ ...value, fontSize: '18px', color: '#16a34a' }}>₺{profit}</span>
                    </Text>
                </Section>

                <Link href={`https://prificient.com/dashboard/orders/${orderId}`} style={btn}>
                    Detaylı Analiz
                </Link>
            </Container>
        </Body>
    </Html>
);

export default OrderProfitEmail;

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
    textAlign: 'center' as const,
};

const card = {
    backgroundColor: '#f4f4f5',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px',
    marginBottom: '20px',
}

const row = {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '5px 0',
}

const label = {
    fontWeight: 'bold',
    color: '#555',
}

const value = {
    fontWeight: 'normal',
    color: '#333',
    float: 'right' as const, // Fallback for email clients
}

const hr = {
    borderColor: '#ddd',
    margin: '15px 0',
}

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
};
