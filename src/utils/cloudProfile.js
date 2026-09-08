import { supabase } from '../lib/supabase';

export const loadCloudProfile = async (profileNumber) => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('player_profiles')
        .select('id, display_name, parent_verified, cosmetics, progression, stats, preferences')
        .eq('profile_number', profileNumber)
        .maybeSingle();
    if (error) throw error;
    return data;
};

export const saveCloudProfile = async (profileNumber, snapshot) => {
    if (!supabase) return null;
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userResult.user) return null;

    const { data, error } = await supabase
        .from('player_profiles')
        .upsert({
            user_id: userResult.user.id,
            profile_number: profileNumber,
            display_name: snapshot.displayName || `Player ${profileNumber}`,
            parent_verified: Boolean(snapshot.parentVerified),
            cosmetics: snapshot.cosmetics || {},
            progression: snapshot.skills || {},
            stats: snapshot.stats || {},
            preferences: snapshot.preferences || {},
        }, { onConflict: 'user_id,profile_number' })
        .select('id')
        .single();
    if (error) throw error;
    return data;
};

export const saveCloudProfileSettings = async (profileNumber, settings) => {
    if (!supabase) return null;
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userResult.user) return null;

    const { data, error } = await supabase
        .from('player_profiles')
        .upsert({
            user_id: userResult.user.id,
            profile_number: profileNumber,
            display_name: settings.displayName || `Player ${profileNumber}`,
            parent_verified: Boolean(settings.parentVerified),
            cosmetics: settings.cosmetics || {},
            preferences: settings.preferences || {},
        }, { onConflict: 'user_id,profile_number' })
        .select('id')
        .single();
    if (error) throw error;
    return data;
};
