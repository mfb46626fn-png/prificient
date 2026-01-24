import crypto from 'crypto';

interface UserInfo {
    email: string;
    phone_number?: string;
    name: string;
    address: string;
    ip_ip: string;
}

interface BasketItem {
    name: string;
    price: string; // "299.00"
}

export const PayTR = {

    // Generate Iframe Token
    async getPaymentToken(user: UserInfo, basket: BasketItem[], totalAmount: number, orderId: string) {
        const merchant_id = process.env.PAYTR_MERCHANT_ID;
        const merchant_key = process.env.PAYTR_MERCHANT_KEY;
        const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

        if (!merchant_id || !merchant_key || !merchant_salt) {
            console.error("PayTR Config Missing");
            throw new Error("Payment Configuration Error");
        }

        const email = user.email;
        const payment_amount = totalAmount * 100; // Kuruş
        const merchant_oid = orderId;
        const user_name = user.name;
        const user_address = user.address || "Dijital Teslimat";
        const user_phone = user.phone_number || "905555555555";
        const currency = "TL";
        const test_mode = "1"; // "0" for production

        // Basket encoding
        const user_basket = Buffer.from(JSON.stringify(basket.map(b => [b.name, b.price, 1]))).toString('base64');

        const merchant_ok_url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings/billing?status=success`;
        const merchant_fail_url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings/billing?status=fail`;
        const timeout_limit = "30";
        const debug_on = "1";
        const no_installment = "0"; // Taksit seçenekleri açık
        const max_installment = "0";

        // Generate Hash (PayTR Spec)
        // concat: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
        // then append merchant_salt
        // hmac sha256 with merchant_key
        const raw_str = `${merchant_id}${user.ip_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;

        const token_str = raw_str + merchant_salt;
        const paytr_token = crypto.createHmac('sha256', merchant_key).update(token_str).digest('base64');

        // Request Token from PayTR API
        const formData = new URLSearchParams();
        formData.append('merchant_id', merchant_id);
        formData.append('user_ip', user.ip_ip);
        formData.append('merchant_oid', merchant_oid);
        formData.append('email', email);
        formData.append('payment_amount', payment_amount.toString());
        formData.append('paytr_token', paytr_token);
        formData.append('user_basket', user_basket);
        formData.append('debug_on', debug_on);
        formData.append('no_installment', no_installment);
        formData.append('max_installment', max_installment);
        formData.append('user_name', user_name);
        formData.append('user_address', user_address);
        formData.append('user_phone', user_phone);
        formData.append('merchant_ok_url', merchant_ok_url);
        formData.append('merchant_fail_url', merchant_fail_url);
        formData.append('timeout_limit', timeout_limit);
        formData.append('currency', currency);
        formData.append('test_mode', test_mode);

        try {
            const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const resData = await response.json();

            if (resData.status === 'success') {
                return resData.token;
            } else {
                console.error('PayTR Token Error:', resData.reason);
                throw new Error(resData.reason);
            }
        } catch (e) {
            console.error('PayTR Network Error:', e);
            throw e;
        }
    },

    // Validate Callback Hash
    validateCallback(params: any) {
        const merchant_key = process.env.PAYTR_MERCHANT_KEY;
        const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

        const { hash, merchant_oid, status, total_amount } = params;

        const token_str = `${merchant_oid}${merchant_salt}${status}${total_amount}`;
        const calculated_hash = crypto.createHmac('sha256', merchant_key || '').update(token_str).digest('base64');

        return calculated_hash === hash;
    }
}
