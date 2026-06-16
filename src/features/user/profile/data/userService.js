import { supabase } from '@/lib/supabase';
import { geocodeAddress } from '@/lib/geocoding';

const AVATAR_SIGNED_URL_TTL = 60 * 60 * 24 * 7;

export function extractAvatarStoragePath(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== 'string') return null;
  if (avatarUrl.startsWith('avatars/')) return avatarUrl;

  const markers = [
    '/object/public/product-images/',
    '/object/sign/product-images/',
    '/object/authenticated/product-images/',
    '/object/product-images/',
  ];

  for (const marker of markers) {
    const index = avatarUrl.indexOf(marker);
    if (index === -1) continue;
    return decodeURIComponent(avatarUrl.slice(index + marker.length).split('?')[0]);
  }

  return null;
}

export async function resolveAvatarDisplayUrl(avatarUrl) {
  if (!avatarUrl) return null;

  const storagePath = extractAvatarStoragePath(avatarUrl);
  if (!storagePath) {
    return /^https?:\/\//.test(avatarUrl) ? avatarUrl : null;
  }

  const { data, error } = await supabase.storage
    .from('product-images')
    .createSignedUrl(storagePath, AVATAR_SIGNED_URL_TTL);

  if (!error && data?.signedUrl) {
    return data.signedUrl;
  }

  const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(storagePath);
  return publicData.publicUrl;
}

function mapAddressRow(row) {
  return {
    id: row.id,
    type: row.type,
    location: row.location_details,
    location_details: row.location_details,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    isDefault: row.is_default,
    is_default: row.is_default,
    created_at: row.created_at,
  };
}

export function buildUserObject(profile, defaultAddress = null, sessionUser = null) {
  if (!profile) {
    return {
      id: sessionUser?.id,
      name: sessionUser?.user_metadata?.name || 'Usuario',
      email: sessionUser?.email,
      role: 'User',
      avatar: sessionUser?.user_metadata?.name?.[0]?.toUpperCase() || 'U',
      phone: null,
      address: '',
      defaultAddress: null,
    };
  }

  const mappedAddress = defaultAddress ? mapAddressRow(defaultAddress) : null;
  const fallbackAvatar = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

  return {
    ...profile,
    avatar: fallbackAvatar,
    address: mappedAddress?.location_details ?? '',
    defaultAddress: mappedAddress,
  };
}

async function fetchDefaultAddressRow(userId) {
  const { data: defaultRow, error: defaultError } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();

  if (defaultError) throw defaultError;
  if (defaultRow) return defaultRow;

  const { data: firstRow, error: firstError } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (firstError) throw firstError;
  return firstRow;
}

export async function fetchEnrichedUserProfile(userId, sessionUser = null) {
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('Could not fetch user profile from public.users:', error.message);
    return buildUserObject(null, null, sessionUser);
  }

  let defaultAddress = null;
  try {
    defaultAddress = await fetchDefaultAddressRow(userId);
  } catch (addressError) {
    console.warn('Could not fetch default address:', addressError.message);
  }

  let preferences = null;
  try {
    preferences = await fetchUserPreferences(userId);
  } catch (prefError) {
    console.warn('Could not fetch user preferences:', prefError.message);
  }

  const userObj = buildUserObject(profile, defaultAddress, sessionUser);
  userObj.currency = preferences?.currency || 'VES';

  if (profile.avatar_url) {
    userObj.avatar = (await resolveAvatarDisplayUrl(profile.avatar_url)) || userObj.avatar;
  }

  return userObj;
}

export async function updateUserProfile(userId, { name, phone, avatar_url }) {
  const updates = {};
  if (name != null) updates.name = name.trim();
  if (phone != null) updates.phone = phone.trim() || null;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadUserAvatar(userId, file) {
  const fileExt = file.name.split('.').pop();
  const filePath = `avatars/${userId}/${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || undefined,
    });

  if (error) throw error;

  return filePath;
}

export async function fetchUserAddresses(userId) {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapAddressRow);
}

async function clearDefaultAddresses(userId, excludeId = null) {
  let query = supabase
    .from('user_addresses')
    .update({ is_default: false })
    .eq('user_id', userId);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function insertUserAddress(userId, { type, location, isDefault = false, latitude, longitude, city = 'Caracas' }) {
  let lat = latitude;
  let lng = longitude;

  if (lat == null || lng == null) {
    const geocoded = await geocodeAddress(location, city);
    lat = geocoded.lat;
    lng = geocoded.lng;
  }

  if (isDefault) {
    await clearDefaultAddresses(userId);
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .insert({
      user_id: userId,
      type: type.trim(),
      location_details: location.trim(),
      latitude: lat,
      longitude: lng,
      is_default: isDefault,
    })
    .select()
    .single();

  if (error) throw error;
  return mapAddressRow(data);
}

export async function updateUserAddress(userId, addressId, { type, location, isDefault = false, latitude, longitude, city = 'Caracas' }) {
  let lat = latitude;
  let lng = longitude;

  if (lat == null || lng == null) {
    const geocoded = await geocodeAddress(location, city);
    lat = geocoded.lat;
    lng = geocoded.lng;
  }

  if (isDefault) {
    await clearDefaultAddresses(userId, addressId);
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .update({
      type: type.trim(),
      location_details: location.trim(),
      latitude: lat,
      longitude: lng,
      is_default: isDefault,
    })
    .eq('id', addressId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return mapAddressRow(data);
}

export async function deleteUserAddress(userId, addressId) {
  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function fetchUserPreferences(userId) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  return {
    newsletter: data?.newsletter ?? true,
    promotions: data?.promotions ?? true,
    currency: data?.currency ?? 'USD',
  };
}

export async function updateUserPreferences(userId, { newsletter, promotions, currency }) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      newsletter,
      promotions,
      currency,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

function formatOrderDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatOrderTotal(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount ?? 0));
}

export async function fetchUserOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total_amount,
      fulfillment_mode,
      payment_method,
      created_at,
      delivery_address,
      order_items (
        quantity,
        products (name)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((order) => {
    const lineItems = (order.order_items ?? []).map((item) => ({
      name: item.products?.name ?? 'Producto',
      quantity: Number(item.quantity ?? 0),
    }));
    const items = lineItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: order.order_number,
      orderId: order.id,
      date: formatOrderDate(order.created_at),
      totalRaw: order.total_amount,
      status: order.status,
      items,
      lineItems,
      fulfillmentMode: order.fulfillment_mode,
      paymentMethod: order.payment_method,
      deliveryAddress: order.delivery_address ?? '',
    };
  });
}
