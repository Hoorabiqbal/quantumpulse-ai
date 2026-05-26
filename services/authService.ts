import { supabase } from './supabaseClient';
import { User, LoginFormData, SignupFormData, ServiceResponse } from '../types';

export const authService = {
  async signUp({ name, email, password }: SignupFormData): Promise<ServiceResponse<User>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { name: name.trim() } },
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes('already registered') ||
          authError.message.toLowerCase().includes('user already exists') ||
          authError.message.toLowerCase().includes('email already') ||
          authError.status === 422
        ) {
          return { data: null, error: 'ACCOUNT_EXISTS', success: false };
        }
        return { data: null, error: authError.message, success: false };
      }

      // Supabase returns empty identities[] when email already exists (confirm disabled)
      if (authData?.user && authData.user.identities?.length === 0) {
        return { data: null, error: 'ACCOUNT_EXISTS', success: false };
      }

      if (!authData?.user) {
        return { data: null, error: 'No user data returned.', success: false };
      }

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        name: name.trim(),
      };

      return { data: user, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected error occurred.',
        success: false,
      };
    }
  },

  async signIn({ email, password }: LoginFormData): Promise<ServiceResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('wrong password')) {
          return { data: null, error: 'INVALID_CREDENTIALS', success: false };
        }
        if (msg.includes('email not confirmed')) {
          return { data: null, error: 'EMAIL_NOT_CONFIRMED', success: false };
        }
        return { data: null, error: error.message, success: false };
      }

      if (!data?.user) {
        return { data: null, error: 'No user data returned.', success: false };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || 'User',
      };

      return { data: user, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected error occurred.',
        success: false,
      };
    }
  },

  async signInWithGoogle(): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) return { data: null, error: error.message, success: false };
      return { data: null, error: null, success: true };
    } catch (error) {
      return { data: null, error: 'Google sign-in failed.', success: false };
    }
  },

  async signInWithGitHub(): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin },
      });
      if (error) return { data: null, error: error.message, success: false };
      return { data: null, error: null, success: true };
    } catch (error) {
      return { data: null, error: 'GitHub sign-in failed.', success: false };
    }
  },

  async forgotPassword(email: string): Promise<ServiceResponse<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (error) return { data: null, error: error.message, success: false };
      return { data: null, error: null, success: true };
    } catch (error) {
      return { data: null, error: 'Failed to send reset email.', success: false };
    }
  },

  async signOut(): Promise<ServiceResponse<null>> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return { data: null, error: null, success: true };
      await supabase.auth.signOut();
      return { data: null, error: null, success: true };
    } catch {
      return { data: null, error: null, success: true };
    }
  },

  async getCurrentUser(): Promise<ServiceResponse<User | null>> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) return { data: null, error: error.message, success: false };
      if (!session?.user) return { data: null, error: null, success: true };

      const user: User = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
      };
      return { data: user, error: null, success: true };
    } catch (error) {
      return { data: null, error: 'Unexpected error.', success: false };
    }
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
        };
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
    return subscription;
  },

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  },

  async getUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  },
};
