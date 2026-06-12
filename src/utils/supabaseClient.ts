import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js'

export interface SupabaseClientState {
  configured: boolean
  client: SupabaseClient | null
  message: string
}

export interface SupabaseAuthState {
  configured: boolean
  user: User | null
  session: Session | null
  message: string
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
let cachedClient: SupabaseClient | null = null

export const getSupabaseClientState = (): SupabaseClientState => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      configured: false,
      client: null,
      message: 'Cloud Sync Not Configured: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.',
    }
  }

  return {
    configured: true,
    client: getSupabaseClient(),
    message: 'Cloud Sync Configured.',
  }
}

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseUrl || !supabaseAnonKey) return null
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return cachedClient
}

export const getSupabaseAuthState = async (): Promise<SupabaseAuthState> => {
  const state = getSupabaseClientState()
  if (!state.configured || !state.client) {
    return {
      configured: false,
      user: null,
      session: null,
      message: state.message,
    }
  }

  const { data, error } = await state.client.auth.getSession()
  if (error) {
    return {
      configured: true,
      user: null,
      session: null,
      message: error.message,
    }
  }

  return {
    configured: true,
    user: data.session?.user ?? null,
    session: data.session ?? null,
    message: data.session?.user.email ? `Signed in as ${data.session.user.email}.` : 'Not signed in.',
  }
}

export const signInWithEmailMagicLink = async (email: string) => {
  const state = getSupabaseClientState()
  if (!state.configured || !state.client) {
    return { ok: false, error: state.message }
  }

  const { error } = await state.client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })

  return { ok: !error, error: error?.message ?? null }
}

export const signOutSupabase = async () => {
  const state = getSupabaseClientState()
  if (!state.configured || !state.client) {
    return { ok: false, error: state.message }
  }

  const { error } = await state.client.auth.signOut()
  return { ok: !error, error: error?.message ?? null }
}

export const onSupabaseAuthStateChange = (onChange: (authState: SupabaseAuthState) => void) => {
  const state = getSupabaseClientState()
  if (!state.configured || !state.client) return null

  const { data } = state.client.auth.onAuthStateChange((_event, session) => {
    onChange({
      configured: true,
      user: session?.user ?? null,
      session,
      message: session?.user.email ? `Signed in as ${session.user.email}.` : 'Not signed in.',
    })
  })

  return data.subscription
}
