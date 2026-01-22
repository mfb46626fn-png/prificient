export interface Ticket {
    id: string;
    user_id: string;
    subject: string;
    status: 'open' | 'answered' | 'closed';
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    updated_at: string;
}

export interface TicketMessage {
    id: string;
    ticket_id: string;
    user_id: string | null; // Null if system or external admin
    message: string;
    is_internal: boolean;
    created_at: string;
}

// Client-side support functions could go here if needed,
// but for actions we use app/actions/support.ts
// We keep types here.
