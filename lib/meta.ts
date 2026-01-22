import { FacebookAdsApi, AdAccount, Campaign } from 'facebook-nodejs-business-sdk';

const APP_ID = process.env.META_APP_ID!;
const APP_SECRET = process.env.META_APP_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const REDIRECT_URI = `${APP_URL}/api/meta/callback`;

export const MetaService = {
    // 1. Get Login URL
    getLoginUrl: () => {
        const scope = 'ads_read,read_insights'; // Essential permissions
        return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}&state=prificient_meta_connect`;
    },

    // 2. Exchange Code for Token
    exchangeCodeForToken: async (code: string) => {
        const url = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${APP_SECRET}&code=${code}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) throw new Error(data.error.message);
        return data.access_token as string;
    },

    // 3. Get Long Lived Token (Valid for 60 days)
    getLongLivedToken: async (shortLivedToken: string) => {
        const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortLivedToken}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) throw new Error(data.error.message);
        return data.access_token as string;
    },

    // 4. List Ad Accounts
    getAdAccounts: async (accessToken: string) => {
        FacebookAdsApi.init(accessToken);
        const user = new AdAccount('me');
        // 'account_id', 'name', 'currency'
        const accounts = await user.getAdAccounts(['account_id', 'name', 'account_status', 'currency', 'amount_spent']);
        return accounts.map((a: any) => ({
            id: `act_${a.account_id}`,
            name: a.name,
            currency: a.currency,
            status: a.account_status,
        }));
    },

    // 5. Get Daily Insights (Yesterday)
    getDailyInsights: async (accessToken: string, adAccountId: string) => {
        FacebookAdsApi.init(accessToken);
        const account = new AdAccount(adAccountId);

        // Date Range: Yesterday
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

        const fields = ['campaign_name', 'spend', 'clicks', 'impressions', 'cpc', 'cpm', 'roas', 'actions'];
        const params = {
            time_range: { since: dateStr, until: dateStr },
            level: 'campaign',
        };

        try {
            const insights = await account.getInsights(fields, params);
            return insights.map((i: any) => ({
                campaign_name: i.campaign_name,
                spend: i.spend, // string
                clicks: i.clicks,
                impressions: i.impressions,
                date: dateStr,
                roas: i.purchase_roas ? i.purchase_roas[0]?.value : 0
            }));
        } catch (error) {
            console.error(`Meta Sync Error [${adAccountId}]:`, error);
            throw error;
        }
    }
};
