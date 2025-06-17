
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { LogIn, LogOut } from 'lucide-react';

const AuthButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    if (error) console.error('Error signing in:', error);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  if (loading) return null;

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          <span className="text-sm text-muted-foreground">
            {user.email}
          </span>
          <Button onClick={signOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </>
      ) : (
        <Button onClick={signInWithGoogle} variant="outline" size="sm">
          <LogIn className="w-4 h-4 mr-2" />
          Masuk dengan Google
        </Button>
      )}
    </div>
  );
};

export default AuthButton;
