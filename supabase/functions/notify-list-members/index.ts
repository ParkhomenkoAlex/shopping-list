import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
};

interface RequestPayload {
    listId?: string;
    list_id?: string;
}

interface ExpoPushTicket {
    status: 'ok' | 'error';
    id?: string;
    message?: string;
    details?: {
        error?: string;
        [key: string]: unknown;
    };
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');

        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Missing Authorization header' }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const supabaseServiceRoleKey =
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const {
            data: { user },
            error: userError,
        } = await userClient.auth.getUser();

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
            });
        }

        const body: RequestPayload = await req.json().catch(() => ({}));
        const listId = body.listId || body.list_id;

        if (!listId) {
            return new Response(JSON.stringify({ error: 'Missing listId' }), {
                status: 400,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
            });
        }

        const { data: list, error: listError } = await userClient
            .from('lists')
            .select('id, name')
            .eq('id', listId)
            .maybeSingle();

        if (listError || !list) {
            return new Response(
                JSON.stringify({ error: 'List not found or access denied' }),
                {
                    status: 403,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

        const { data: members, error: membersError } = await adminClient
            .from('list_members')
            .select('user_id')
            .eq('list_id', listId)
            .neq('user_id', user.id);

        if (membersError) {
            return new Response(
                JSON.stringify({ error: 'Failed to fetch list members' }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const recipientUserIds = (members || []).map(
            (member: { user_id: string }) => member.user_id
        );

        if (recipientUserIds.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'No other members to notify',
                    notifiedCount: 0,
                    failedCount: 0,
                }),
                {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const { data: pushTokens, error: tokensError } = await adminClient
            .from('user_push_tokens')
            .select('token, user_id')
            .in('user_id', recipientUserIds);

        if (tokensError) {
            return new Response(
                JSON.stringify({ error: 'Failed to fetch push tokens' }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const validTokens = [
            ...new Set(
                (pushTokens || [])
                    .map((token: { token: string }) => token.token)
                    .filter(Boolean)
            ),
        ];

        if (validTokens.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'No push tokens registered for other members',
                    notifiedCount: 0,
                    failedCount: 0,
                }),
                {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        const senderIdentifier = user.email || 'Участник';
        const notificationTitle = 'Shopping List';
        const notificationBody = `${senderIdentifier} updated list «${list.name}»`;

        const messages = validTokens.map((token: string) => ({
            to: token,
            sound: 'default',
            title: notificationTitle,
            body: notificationBody,
            data: {
                listId,
                url: `/lists/${listId}`,
            },
        }));

        const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
        const chunkSize = 100;
        const tickets: ExpoPushTicket[] = [];

        for (let i = 0; i < messages.length; i += chunkSize) {
            const chunk = messages.slice(i, i + chunkSize);

            const pushResponse = await fetch(expoPushUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Accept-Encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk),
            });

            const responseText = await pushResponse.text();

            if (!pushResponse.ok) {
                console.error('Expo push notification request failed:', {
                    status: pushResponse.status,
                    statusText: pushResponse.statusText,
                    body: responseText,
                });

                return new Response(
                    JSON.stringify({
                        error: 'Expo push notification request failed',
                    }),
                    {
                        status: 502,
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }

            try {
                const pushResult = JSON.parse(responseText) as {
                    data?: ExpoPushTicket[];
                };

                if (!Array.isArray(pushResult.data)) {
                    console.error('Invalid Expo push response:', {
                        body: responseText,
                    });

                    return new Response(
                        JSON.stringify({
                            error: 'Invalid response from Expo push service',
                        }),
                        {
                            status: 502,
                            headers: {
                                ...corsHeaders,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                }

                tickets.push(...pushResult.data);
            } catch (error) {
                console.error('Failed to parse Expo push response:', {
                    error,
                    body: responseText,
                });

                return new Response(
                    JSON.stringify({
                        error: 'Invalid response from Expo push service',
                    }),
                    {
                        status: 502,
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }
        }

        const successfulTickets = tickets.filter(
            (ticket) => ticket.status === 'ok'
        );

        const failedTickets = tickets.filter(
            (ticket) => ticket.status === 'error'
        );

        if (failedTickets.length > 0) {
            console.error('Expo push notification tickets failed:', {
                failedCount: failedTickets.length,
                failedTickets,
            });

            return new Response(
                JSON.stringify({
                    success: false,
                    notifiedCount: successfulTickets.length,
                    failedCount: failedTickets.length,
                    tickets,
                    error: 'Some push notifications failed',
                }),
                {
                    status: 502,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                notifiedCount: successfulTickets.length,
                failedCount: 0,
                tickets,
            }),
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (err) {
        const message =
            err instanceof Error ? err.message : 'Internal server error';

        console.error('notify-list-members failed:', err);

        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
        });
    }
});
