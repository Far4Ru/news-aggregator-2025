import { supabase } from './supabase';

interface IpData {
  user_id: string
}

interface UserData {
  id: string
}

export const userService = {
  async checkIp(ipAddress: string): Promise<IpData | null | undefined> {
    try {
      const { data: existingIP } = await supabase
        .from('ip_addresses')
        .select('id, user_id')
        .eq('ip', ipAddress);

      if (Array.isArray(existingIP)) {
        return existingIP[0] as any;
      }

      return null;
    } catch (error) {

      return undefined;
    }
  },
  async checkUser(userId: string) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      return existingUser;
    } catch (error) {
      return undefined;
    }
  },
  async checkUserByIp(existingIP: any): Promise<string | undefined> {

    if (existingIP && existingIP.user_id) {
      const userId = existingIP.user_id;

      if (userId) {
        return userId;
      }

    }

    return undefined;
  },
  async createNewUser(): Promise<UserData | undefined> {
    try {
      const { data: newUser } = await supabase
        .from('users')
        .insert([
          {
            user_status: 'new'
          } as never
        ])
        .select()
        .single();

      return newUser as any;
    } catch (error) {
      return undefined;
    }
  },
  async createNewIpByUser(ip: string, userId: string): Promise<IpData | undefined> {
    try {
      const { data: newIP } = await supabase
        .from('ip_addresses')
        .insert([
          {
            ip: ip,
            user_id: userId
          } as never
        ])
        .select()
        .single();

      return newIP as any;
    } catch (error) {
      return undefined;
    }
  },
};
