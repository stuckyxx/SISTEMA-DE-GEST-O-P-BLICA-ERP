import { supabase } from '../lib/supabase';
import { AppState } from '../types';

export const supabaseService = {
    async fetchAppState(tenantId: string): Promise<AppState | null> {
        const { data, error } = await supabase
            .from('tenants')
            .select('state')
            .eq('id', tenantId)
            .single();

        if (error) {
            console.error('Error fetching state from Supabase:', error);
            return null;
        }

        return data?.state as AppState;
    },

    async saveAppState(tenantId: string, state: AppState): Promise<void> {
        const { error } = await supabase
            .from('tenants')
            .upsert({ id: tenantId, state, updated_at: new Date().toISOString() });

        if (error) {
            console.error('Error saving state to Supabase:', error);
        }
    }
};
