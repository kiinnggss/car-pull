// Supabase Auth, Postgres booking/chat persistence, and Realtime corridor subscriptions.

import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './client';
import type { CommuteMatch, ChatMessage } from '../types';

export interface SupabaseAuthResult {
  ok: boolean;
  userId?: string;
  email?: string;
  fullName?: string;
  employer?: string;
  phone?: string;
  role?: 'rider' | 'driver';
  error?: string;
}

export interface RemoteChatPayload {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  created_at: string;
}

export interface RemoteMatchPayload {
  id: string;
  corridor_id: string;
  rider_id: string;
  driver_id: string;
  final_agreed_fare_ngn: number;
  has_ac_included: boolean;
  escrow_reference: string | null;
  status: CommuteMatch['status'];
  scheduled_for: string;
  driver_name?: string;
  rider_name?: string;
  plate_number?: string;
  pickup_hub?: string;
}

export async function signInWithSupabase(
  email: string,
  password: string
): Promise<SupabaseAuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, error: 'Supabase is not configured.' };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { ok: false, error: error?.message || 'Sign in failed.' };
  }

  const meta = data.user.user_metadata || {};
  return {
    ok: true,
    userId: data.user.id,
    email: data.user.email || email,
    fullName: typeof meta.full_name === 'string' ? meta.full_name : undefined,
    employer: typeof meta.employer === 'string' ? meta.employer : undefined,
    phone: typeof meta.phone === 'string' ? meta.phone : undefined,
    role: meta.role === 'driver' ? 'driver' : 'rider',
  };
}

export async function signUpWithSupabase(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  employer: string;
  role: 'rider' | 'driver';
}): Promise<SupabaseAuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, error: 'Supabase is not configured.' };
  }

  const { data, error } = await client.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
        phone: params.phone,
        employer: params.employer,
        role: params.role,
      },
    },
  });

  if (error || !data.user) {
    return { ok: false, error: error?.message || 'Account creation failed.' };
  }

  return {
    ok: true,
    userId: data.user.id,
    email: data.user.email || params.email,
    fullName: params.fullName,
    employer: params.employer,
    phone: params.phone,
    role: params.role,
  };
}

export async function signOutFromSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.auth.signOut().catch(() => {});
}

export async function getActiveSupabaseSession(): Promise<SupabaseAuthResult | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.auth.getSession();
  if (error || !data.session?.user) {
    return null;
  }

  const user = data.session.user;
  const meta = user.user_metadata || {};
  return {
    ok: true,
    userId: user.id,
    email: user.email || undefined,
    fullName: typeof meta.full_name === 'string' ? meta.full_name : undefined,
    employer: typeof meta.employer === 'string' ? meta.employer : undefined,
    phone: typeof meta.phone === 'string' ? meta.phone : undefined,
    role: meta.role === 'driver' ? 'driver' : 'rider',
  };
}

export async function persistRemoteMatch(match: CommuteMatch, escrowRef: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const payload = {
    escrow_reference: escrowRef,
    final_agreed_fare_ngn: match.fareNgn,
    has_ac_included: match.hasAc,
    status: match.status,
    scheduled_for: new Date().toISOString().slice(0, 10),
  };

  // Best-effort insert when DB tables are provisioned; broadcast ensures live peers sync immediately.
  await client.from('commute_matches').insert(payload).then(() => {}, () => {});

  const channel = client.channel('corridor-live');
  await channel.send({
    type: 'broadcast',
    event: 'match_locked',
    payload: {
      id: match.id,
      driverId: match.driverId,
      driverName: match.driverName,
      riderId: match.riderId,
      riderName: match.riderName,
      fareNgn: match.fareNgn,
      plateNumber: match.plateNumber,
      pickupHub: match.pickupSafeZone?.name,
      status: match.status,
    },
  }).catch(() => {});
}

export async function persistRemoteMatchStatus(
  matchId: string,
  status: CommuteMatch['status']
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  await client
    .from('commute_matches')
    .update({ status })
    .eq('id', matchId)
    .then(() => {}, () => {});

  const channel = client.channel('corridor-live');
  await channel.send({
    type: 'broadcast',
    event: 'match_status',
    payload: { id: matchId, status },
  }).catch(() => {});
}

export async function persistRemoteChatMessage(
  threadId: string,
  message: ChatMessage
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  await client
    .from('chat_messages')
    .insert({
      thread_id: threadId,
      sender_id: message.senderId,
      sender_name: message.senderName,
      body: message.text,
    })
    .then(() => {}, () => {});

  const channel = client.channel('corridor-live');
  await channel.send({
    type: 'broadcast',
    event: 'chat_message',
    payload: {
      id: message.id,
      thread_id: threadId,
      sender_id: message.senderId,
      sender_name: message.senderName,
      body: message.text,
      created_at: new Date().toISOString(),
    } satisfies RemoteChatPayload,
  }).catch(() => {});
}

export function subscribeToCorridorRealtime(handlers: {
  currentUserId: string;
  onRemoteChat: (payload: RemoteChatPayload) => void;
  onRemoteMatchStatus: (payload: { id: string; status: CommuteMatch['status'] }) => void;
}): () => void {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }

  const channel: RealtimeChannel = client
    .channel('corridor-live')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
      (change) => {
        const row = change.new as RemoteChatPayload | undefined;
        if (!row || row.sender_id === handlers.currentUserId) return;
        handlers.onRemoteChat(row);
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'commute_matches' },
      (change) => {
        const row = change.new as RemoteMatchPayload | undefined;
        if (!row) return;
        handlers.onRemoteMatchStatus({ id: row.id, status: row.status });
      }
    )
    .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
      const msg = payload as RemoteChatPayload | undefined;
      if (!msg || msg.sender_id === handlers.currentUserId) return;
      handlers.onRemoteChat(msg);
    })
    .on('broadcast', { event: 'match_status' }, ({ payload }) => {
      const update = payload as { id: string; status: CommuteMatch['status'] } | undefined;
      if (!update?.id) return;
      handlers.onRemoteMatchStatus(update);
    })
    .subscribe();

  return () => {
    client.removeChannel(channel).catch(() => {});
  };
}
