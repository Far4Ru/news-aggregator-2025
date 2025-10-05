// Заглушка для Supabase - в реальном приложении здесь был бы реальный клиент
export const supabase = {
    from: (table: string) => ({
        select: () => ({
            eq: () => ({
                or: () => ({
                    gte: () => ({
                        lte: () => ({
                            in: () => ({
                                contains: () => ({
                                    order: () => Promise.resolve({ data: [], error: null })
                                }),
                                order: () => Promise.resolve({ data: [], error: null })
                            }),
                            order: () => Promise.resolve({ data: [], error: null })
                        }),
                        order: () => Promise.resolve({ data: [], error: null })
                    }),
                    order: () => Promise.resolve({ data: [], error: null })
                }),
                order: () => Promise.resolve({ data: [], error: null })
            }),
            order: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
            eq: () => Promise.resolve({ data: null, error: null })
        })
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: (callback: any) => ({
            subscription: { unsubscribe: () => { } }
        })
    }
}

export const supabaseModerator = supabase