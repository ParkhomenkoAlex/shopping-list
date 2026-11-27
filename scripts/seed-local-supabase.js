#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const LOCAL_API_PORT = '54321';

const users = {
    local1: {
        email: 'local1@gmail.com',
        password: 'local1local1',
    },
    local2: {
        email: 'local2@gmail.com',
        password: 'local2local2',
    },
    local3: {
        email: 'local3@gmail.com',
        password: 'local3local3',
    },
};

const lists = [
    {
        id: '10000000-0000-4000-8000-000000000001',
        owner: 'local1',
        name: 'Local 1 groceries',
        description: 'Personal unfinished shopping.',
        iconKey: 'groceries',
        colorKey: 'indigo',
        items: [
            { name: 'Milk', isCompleted: false },
            { name: 'Bread', isCompleted: false },
        ],
    },
    {
        id: '10000000-0000-4000-8000-000000000002',
        owner: 'local1',
        name: 'Local 1 empty list',
        description: 'Personal empty list.',
        iconKey: 'home',
        colorKey: 'blue',
        items: [],
    },
    {
        id: '10000000-0000-4000-8000-000000000003',
        owner: 'local1',
        sharedWith: 'local2',
        name: 'Weekend groceries',
        description: 'Shared from Local 1 to Local 2.',
        iconKey: 'produce',
        colorKey: 'green',
        items: [
            { name: 'Apples', isCompleted: true },
            { name: 'Onions', isCompleted: false },
        ],
    },
    {
        id: '10000000-0000-4000-8000-000000000004',
        owner: 'local1',
        sharedWith: 'local2',
        name: 'Movie night',
        description: 'Completed shared list from Local 1.',
        iconKey: 'cafe',
        colorKey: 'purple',
        items: [
            { name: 'Popcorn', isCompleted: true },
            { name: 'Juice', isCompleted: true },
        ],
    },
    {
        id: '10000000-0000-4000-8000-000000000005',
        owner: 'local2',
        name: 'Travel packing',
        description: 'Personal unfinished list.',
        iconKey: 'travel',
        colorKey: 'teal',
        items: [
            { name: 'Sunscreen', isCompleted: false },
            { name: 'Map', isCompleted: false },
        ],
    },
    {
        id: '10000000-0000-4000-8000-000000000006',
        owner: 'local2',
        name: 'Local 2 empty list',
        description: 'Personal empty list.',
        iconKey: 'gifts',
        colorKey: 'pink',
        items: [],
    },
    {
        id: '10000000-0000-4000-8000-000000000007',
        owner: 'local2',
        sharedWith: 'local1',
        name: 'Kitchen restock',
        description: 'Shared from Local 2 to Local 1.',
        iconKey: 'home',
        colorKey: 'amber',
        items: [
            { name: 'Soap', isCompleted: true },
            { name: 'Sponges', isCompleted: false },
        ],
    },
    {
        id: '10000000-0000-4000-8000-000000000008',
        owner: 'local2',
        sharedWith: 'local1',
        name: 'Work supplies',
        description: 'Completed shared list from Local 2.',
        iconKey: 'work',
        colorKey: 'gray',
        items: [
            { name: 'Paper', isCompleted: true },
            { name: 'Pens', isCompleted: true },
        ],
    },
];

function fail(message) {
    throw new Error(message);
}

function getLocalConfiguration() {
    const appEnvironment = process.env.EXPO_PUBLIC_APP_ENV?.toLowerCase();
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (process.env.ALLOW_LOCAL_SUPABASE_SEED !== 'true') {
        fail('ALLOW_LOCAL_SUPABASE_SEED must be true.');
    }

    if (appEnvironment !== 'local') {
        fail('Local seed is only permitted when EXPO_PUBLIC_APP_ENV is Local.');
    }

    if (!supabaseUrl || !publishableKey) {
        fail('Local Supabase URL and publishable key are required.');
    }

    const target = new URL(supabaseUrl);
    const isLoopbackHost =
        target.hostname === '127.0.0.1' || target.hostname === 'localhost';
    const isAndroidEmulatorAlias = target.hostname === '10.0.2.2';

    if (
        target.protocol !== 'http:' ||
        (!isLoopbackHost && !isAndroidEmulatorAlias) ||
        target.port !== LOCAL_API_PORT
    ) {
        fail('Refusing to seed a non-local Supabase API target.');
    }

    return {
        supabaseUrl: isAndroidEmulatorAlias
            ? `http://127.0.0.1:${LOCAL_API_PORT}`
            : supabaseUrl,
        publishableKey,
    };
}

function createSessionClient(supabaseUrl, publishableKey) {
    return createClient(supabaseUrl, publishableKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

async function signIn(client, account) {
    const { data, error } = await client.auth.signInWithPassword({
        email: account.email,
        password: account.password,
    });

    if (error || !data.user || !data.session) {
        return null;
    }

    if (!data.user.email_confirmed_at) {
        fail(`Local account ${account.email} is not email-confirmed.`);
    }

    return data;
}

async function ensureUser(supabaseUrl, publishableKey, account) {
    const client = createSessionClient(supabaseUrl, publishableKey);
    const existingSession = await signIn(client, account);

    if (existingSession) {
        return { client, user: existingSession.user, created: false };
    }

    const { data, error } = await client.auth.signUp({
        email: account.email,
        password: account.password,
    });

    if (error) {
        fail(
            `Unable to create local account ${account.email}: ${error.message}`
        );
    }

    if (data.user?.identities?.length === 0) {
        fail(
            `Local account ${account.email} already exists with different credentials. Refusing to change its password.`
        );
    }

    const createdSession = await signIn(client, account);

    if (!createdSession) {
        fail(`Unable to verify local account ${account.email} after sign-up.`);
    }

    return { client, user: createdSession.user, created: true };
}

async function ensureList(client, definition) {
    const { data: existing, error: selectError } = await client
        .from('lists')
        .select('id')
        .eq('id', definition.id)
        .maybeSingle();

    if (selectError) {
        fail(
            `Unable to check seeded list ${definition.id}: ${selectError.message}`
        );
    }

    if (existing) {
        return false;
    }

    const { error: insertError } = await client.from('lists').insert({
        id: definition.id,
        name: definition.name,
        description: definition.description,
        icon_key: definition.iconKey,
        color_key: definition.colorKey,
    });

    if (insertError) {
        fail(
            `Unable to create seeded list ${definition.id}: ${insertError.message}`
        );
    }

    return true;
}

async function ensureMembership(client, definition, member) {
    if (!definition.sharedWith) {
        return false;
    }

    const { data: members, error: membersError } = await client.rpc(
        'get_list_shared_members',
        { target_list_id: definition.id }
    );

    if (membersError) {
        fail(
            `Unable to read memberships for ${definition.id}: ${membersError.message}`
        );
    }

    if (
        members.some((existingMember) => existingMember.user_id === member.id)
    ) {
        return false;
    }

    const { error: addError } = await client.rpc('add_list_member_by_email', {
        target_list_id: definition.id,
        target_email: member.email,
    });

    if (addError) {
        fail(`Unable to share ${definition.id}: ${addError.message}`);
    }

    return true;
}

async function ensureItems(client, definition) {
    const { data: existingItems, error: itemsError } = await client
        .from('list_items')
        .select('name')
        .eq('list_id', definition.id);

    if (itemsError) {
        fail(
            `Unable to read items for ${definition.id}: ${itemsError.message}`
        );
    }

    const existingNames = new Set(existingItems.map((item) => item.name));
    const missingItems = definition.items.filter(
        (item) => !existingNames.has(item.name)
    );

    if (missingItems.length === 0) {
        return 0;
    }

    const { error: insertError } = await client.from('list_items').insert(
        missingItems.map((item) => ({
            list_id: definition.id,
            name: item.name,
            is_completed: item.isCompleted,
        }))
    );

    if (insertError) {
        fail(
            `Unable to add items for ${definition.id}: ${insertError.message}`
        );
    }

    return missingItems.length;
}

async function verifySeededSummaries(seededUsers, createdListIds) {
    for (const [userKey, seededUser] of Object.entries(seededUsers)) {
        const { data: summaries, error } = await seededUser.client.rpc(
            'get_accessible_list_summaries'
        );

        if (error) {
            fail(
                `Unable to verify summaries for ${users[userKey].email}: ${error.message}`
            );
        }

        for (const definition of lists) {
            if (!createdListIds.has(definition.id)) {
                continue;
            }

            const expectedRole =
                definition.owner === userKey
                    ? 'owner'
                    : definition.sharedWith === userKey
                      ? 'member'
                      : null;

            if (!expectedRole) {
                continue;
            }

            const summary = summaries.find((item) => item.id === definition.id);

            if (!summary) {
                fail(
                    `Expected seeded list ${definition.id} is missing for ${users[userKey].email}.`
                );
            }

            const ownerId = seededUsers[definition.owner].user.id;
            const completedItemCount = definition.items.filter(
                (item) => item.isCompleted
            ).length;

            if (
                summary.owner_id !== ownerId ||
                summary.membership_role !== expectedRole ||
                summary.item_count !== definition.items.length ||
                summary.completed_item_count !== completedItemCount ||
                summary.icon_key !== definition.iconKey ||
                summary.color_key !== definition.colorKey
            ) {
                fail(
                    `Seeded summary ${definition.id} does not match its expected data.`
                );
            }
        }
    }
}

async function main() {
    const { supabaseUrl, publishableKey } = getLocalConfiguration();
    const seededUsers = {};
    let createdUsers = 0;
    let createdLists = 0;
    let createdMemberships = 0;
    let createdItems = 0;
    const createdListIds = new Set();

    for (const [key, account] of Object.entries(users)) {
        const seededUser = await ensureUser(
            supabaseUrl,
            publishableKey,
            account
        );
        seededUsers[key] = seededUser;
        createdUsers += seededUser.created ? 1 : 0;
    }

    for (const definition of lists) {
        const owner = seededUsers[definition.owner];
        const member = definition.sharedWith
            ? seededUsers[definition.sharedWith]
            : null;

        const wasCreated = await ensureList(owner.client, definition);
        createdLists += wasCreated ? 1 : 0;

        if (!wasCreated) {
            continue;
        }

        createdListIds.add(definition.id);
        createdMemberships += member
            ? (await ensureMembership(owner.client, definition, member.user))
                ? 1
                : 0
            : 0;
        createdItems += await ensureItems(owner.client, definition);
    }

    for (const account of Object.values(users)) {
        const client = createSessionClient(supabaseUrl, publishableKey);
        const verifiedSession = await signIn(client, account);

        if (!verifiedSession) {
            fail(
                `Unable to authenticate seeded local account ${account.email}.`
            );
        }
    }

    await verifySeededSummaries(seededUsers, createdListIds);

    console.log(
        `Local seed complete: ${createdUsers} users, ${createdLists} lists, ${createdMemberships} memberships, and ${createdItems} items created.`
    );
}

main().catch((error) => {
    console.error(`Local seed failed: ${error.message}`);
    process.exitCode = 1;
});
