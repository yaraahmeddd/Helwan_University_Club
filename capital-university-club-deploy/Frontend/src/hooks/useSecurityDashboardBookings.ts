import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:3000';

export interface BookingParticipant {
  id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  national_id: string | null;
  national_id_front: string | null;
  national_id_back: string | null;
  is_creator: boolean;
  registered_at: string;
}

export interface Guest {
  name: string;
  phone: string;
  relation: string;
}

// Display format - what the component uses
export interface DisplayBooking {
  id: string;
  personName: string;
  phoneNumber: string;
  membershipId: string;
  memberType: string;
  fieldName: string;
  startTime: string;
  endTime: string;
  guests: Guest[];
  sport: string;
  frontIdUrl: string | null;
  backIdUrl: string | null;
  status: string;
  bookingCreatedAt: string;
  participantsCount: number;
  nationalId: string | null;
  email: string | null;
}

export interface SecurityBooking {
  booking_id: string;
  share_token: string;
  share_url: string;
  booker: {
    name: string;
    type: 'member' | 'team_member';
    phone: string | null;
    email: string | null;
  };
  booking_date: string;
  booking_time: {
    start: string;
    end: string;
    duration_minutes: number;
  };
  sport: {
    name_ar: string;
    name_en: string;
  };
  field: {
    name_ar: string;
    name_en: string;
  };
  participants: BookingParticipant[];
  stats: {
    expected_participants: number;
    registered_count: number;
    remaining_slots: number;
    is_full: boolean;
  };
  status: string;
  payment_status: 'completed' | 'pending';
  created_at: string;
}

interface UseSecurityDashboardBookingsOptions {
  fieldId?: string;
  sportId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Transform API response to component-compatible format
function transformBookingForDisplay(booking: SecurityBooking): DisplayBooking {
  const creator = booking.participants?.find(p => p.is_creator) || booking.participants?.[0];
  
  // Convert Arabic numerals to English for time parsing
  const convertArabicToEnglish = (text: string): string => {
    if (!text) return text;
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let result = text;
    arabicNumerals.forEach((arabicNum, idx) => {
      result = result.replace(new RegExp(arabicNum, 'g'), englishNumerals[idx]);
    });
    return result;
  };

  const startTime = convertArabicToEnglish(booking.booking_time.start);
  const endTime = convertArabicToEnglish(booking.booking_time.end);
  
  return {
    id: booking.booking_id,
    personName: booking.booker?.name || creator?.full_name || 'N/A',
    phoneNumber: booking.booker?.phone || creator?.phone_number || 'N/A',
    membershipId: booking.booking_id,
    memberType: booking.booker.type === 'member' ? 'عضو' : 'فريق رياضي',
    fieldName: booking.field?.name_ar || booking.field?.name_en || 'N/A',
    startTime: startTime,
    endTime: endTime,
    guests: booking.participants
      ?.filter(p => !p.is_creator)
      .map(p => ({
        name: p.full_name,
        phone: p.phone_number || 'N/A',
        relation: p.email || 'ضيف',
      })) || [],
    sport: booking.sport?.name_ar || booking.sport?.name_en || 'N/A',
    frontIdUrl: creator?.national_id_front,
    backIdUrl: creator?.national_id_back,
    status: booking.status,
    bookingCreatedAt: booking.created_at,
    participantsCount: booking.stats.registered_count,
    nationalId: creator?.national_id,
    email: creator?.email,
  };
}

interface UseSecurityDashboardBookingsReturn {
  bookings: SecurityBooking[];
  displayBookings: DisplayBooking[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch security dashboard bookings from the API (today only)
 */
export function useSecurityDashboardBookings(
  options?: UseSecurityDashboardBookingsOptions
): UseSecurityDashboardBookingsReturn {
  const [bookings, setBookings] = useState<SecurityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get today's date in local timezone (not UTC)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;

      // Build query parameters - always filter by today
      const params = new URLSearchParams();
      params.append('start_date', todayString);
      params.append('end_date', todayString);
      
      if (options?.fieldId) params.append('field_id', options.fieldId);
      if (options?.sportId) params.append('sport_id', options.sportId.toString());
      if (options?.status) params.append('status', options.status);

      const queryString = params.toString();
      const url = `${BACKEND_URL}/api/bookings/security/bookings${queryString ? `?${queryString}` : ''}`;

      console.log('[useSecurityDashboardBookings] Fetching from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        console.log('[useSecurityDashboardBookings] Successfully fetched bookings:', result.data.length);
        setBookings(result.data);
      } else {
        throw new Error(result.error || 'Invalid response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[useSecurityDashboardBookings] Error fetching bookings:', {
        error: errorMessage,
        url: `${BACKEND_URL}/api/bookings/security/bookings`,
        timestamp: new Date().toISOString()
      });
      setError(errorMessage);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [options?.fieldId, options?.sportId, options?.status]);

  const displayBookings = bookings.map(transformBookingForDisplay);

  return {
    bookings,
    displayBookings,
    loading,
    error,
    refetch: fetchBookings,
  };
}
