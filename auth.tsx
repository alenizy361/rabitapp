/**
 * Authentication Routes
 * Handles user registration, login, OTP verification
 * Uses JWT-format tokens (header.payload.signature) for compatibility
 */

import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Mock OTP for development - in production this would be sent via email service
const MOCK_OTP = '123456';

// Initialize Supabase client for JWT validation
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
};

// Initialize Supabase Admin client for user management
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
};

// Types
interface User {
  id: string;
  fullName: string;
  nationalId: string;
  email: string;
  phone: string;
  passwordHash: string;
  verified: boolean;
  role?: "buyer" | "seller" | "both";
  createdAt: string;
  rating?: number;
  reviewCount?: number;
  avatarUrl?: string;
}

interface UserProfile {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  role: "buyer" | "seller" | "both";
  verified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  avatarUrl?: string;
}

// Helper functions
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a JWT-format access token
 * Format: header.payload.signature (3 parts separated by dots)
 * This is NOT a cryptographically signed JWT, but has the correct format
 * Includes Supabase JWKS Key ID for future proper JWT validation
 */
function generateAccessToken(userId: string): string {
  // JWT Header with Supabase JWKS Key ID
  const header = {
    alg: "HS256",
    typ: "JWT",
    kid: "06d472df-a256-448e-943c-d241fc26f4d9" // Supabase JWKS Key ID
  };
  
  // JWT Payload
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
  };
  
  // Create JWT format: header.payload.signature
  // Use URL-safe base64 encoding (no padding)
  const headerB64 = btoa(JSON.stringify(header))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  // Simple signature (in production, use proper HMAC signing with JWKS)
  const signature = btoa(`rabit_${userId}_${Date.now()}`)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, 43);
  
  const token = `${headerB64}.${payloadB64}.${signature}`;
  
  console.log('🔑 Generated JWT token:', {
    parts: token.split('.').length,
    kid: '06d472df-a256-448e-943c-d241fc26f4d9',
    headerLength: headerB64.length,
    payloadLength: payloadB64.length,
    signatureLength: signature.length,
    totalLength: token.length,
    preview: token.substring(0, 50) + '...'
  });
  
  return token;
}

function hashPassword(password: string): string {
  // Simple hash for demo - in production use bcrypt
  return btoa(password);
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

// Get user by phone
async function getUserByPhone(phone: string): Promise<User | null> {
  const normalizedPhone = normalizePhone(phone);
  const users = await kv.getByPrefix("user:");
  
  for (const user of users) {
    if (user.phone === normalizedPhone) {
      return user as User;
    }
  }
  
  return null;
}

// Get user by email
async function getUserByEmail(email: string): Promise<User | null> {
  const users = await kv.getByPrefix("user:");
  
  for (const user of users) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      return user as User;
    }
  }
  
  return null;
}

// Get user by national ID
async function getUserByNationalId(nationalId: string): Promise<User | null> {
  const users = await kv.getByPrefix("user:");
  
  for (const user of users) {
    if (user.nationalId === nationalId) {
      return user as User;
    }
  }
  
  return null;
}

// Get user by ID
async function getUserById(userId: string): Promise<User | null> {
  return await kv.get(`user:${userId}`) as User | null;
}

/**
 * Verify user from JWT access token (for protected routes)
 * Validates JWT format and extracts user ID
 * DEVELOPMENT MODE: Provides detailed error messages for debugging
 */
export async function verifyUser(c: Context): Promise<{ error?: string; user?: User }> {
  try {
    // Get access token from Authorization header
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      console.error('❌ Authorization header missing');
      console.error('   Headers received:', Object.keys(c.req.raw.headers));
      return { error: 'Authorization header missing' };
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.error('❌ Access token missing from header');
      console.error('   Auth header value:', authHeader);
      return { error: 'Access token missing' };
    }

    // ✅ VALIDATE JWT FORMAT: Must be header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid JWT format - expected 3 parts, got:', parts.length);
      console.error('   Token preview:', token.substring(0, 50) + '...');
      console.error('   Token length:', token.length);
      console.error('   🔧 HINT: Make sure user is logged in with a valid JWT token');
      return { error: 'Invalid JWT' };
    }

    console.log('🔍 Verifying JWT token');
    console.log('   Token parts:', parts.length);
    console.log('   Header length:', parts[0].length);
    console.log('   Payload length:', parts[1].length);
    console.log('   Signature length:', parts[2].length);

    // Decode payload
    let payload: any;
    try {
      // Decode URL-safe base64 (convert - to + and _ to /)
      const base64 = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      // Add padding if needed
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      const payloadJson = atob(padded);
      payload = JSON.parse(payloadJson);
      console.log('✅ JWT payload decoded:', {
        userId: payload.userId,
        iat: payload.iat,
        exp: payload.exp,
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'never'
      });
    } catch (e) {
      console.error('❌ Failed to decode JWT payload:', e.message);
      console.error('   Payload part:', parts[1].substring(0, 50) + '...');
      console.error('   🔧 HINT: Token might be corrupted or in wrong format');
      return { error: 'Invalid JWT' };
    }

    const { userId } = payload;
    if (!userId) {
      console.error('❌ No userId in JWT payload');
      console.error('   Payload contents:', payload);
      console.error('   🔧 HINT: Token missing userId field - user may need to login again');
      return { error: 'Invalid JWT' };
    }

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      const expiryDate = new Date(payload.exp * 1000);
      console.error('❌ JWT expired');
      console.error('   Expired at:', expiryDate.toISOString());
      console.error('   Current time:', new Date().toISOString());
      console.error('   🔧 HINT: User needs to login again');
      return { error: 'Invalid JWT' };
    }

    // Get user from database
    const user = await getUserById(userId);
    if (!user) {
      console.error('❌ User not found in database:', userId);
      console.error('   🔧 HINT: User may have been deleted or database was cleared');
      return { error: 'User not found' };
    }

    console.log('✅ User verified:', user.email);
    console.log('   User ID:', user.id);
    console.log('   Role:', user.role);
    console.log('   Verified:', user.verified);
    return { user };
  } catch (error) {
    console.error('❌ Verify user error:', error);
    console.error('   Error type:', error.constructor.name);
    console.error('   Error message:', error.message);
    console.error('   🔧 HINT: Check server logs for more details');
    return { error: 'Authentication failed' };
  }
}

// Save user
async function saveUser(user: User): Promise<void> {
  await kv.set(`user:${user.id}`, user);
}

// Convert User to UserProfile
function userToProfile(user: User): UserProfile {
  return {
    id: user.id,
    name: user.fullName,
    nameAr: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role || "buyer",
    verified: user.verified,
    rating: user.rating || 0,
    reviewCount: user.reviewCount || 0,
    createdAt: user.createdAt,
    avatarUrl: user.avatarUrl,
  };
}

// Register a new user
export async function register(c: Context) {
  try {
    const body = await c.req.json();
    const { fullName, nationalId, email, phone, password } = body;

    // Validate required fields
    if (!fullName || !nationalId || !email || !phone || !password) {
      return c.json({
        success: false,
        error: "All fields are required",
        errorAr: "جميع الحقول مطلوبة",
      }, 400);
    }

    // Check if email exists
    const emailExists = await getUserByEmail(email);
    if (emailExists) {
      return c.json({
        success: false,
        error: "Email already registered",
        errorAr: "البريد الإلكتروني مسجل مسبقاً",
      }, 400);
    }

    // Check if phone exists
    const phoneExists = await getUserByPhone(phone);
    if (phoneExists) {
      return c.json({
        success: false,
        error: "Phone number already registered",
        errorAr: "رقم الهاتف مسجل مسبقاً",
      }, 400);
    }

    // Check if national ID exists
    const idExists = await getUserByNationalId(nationalId);
    if (idExists) {
      return c.json({
        success: false,
        error: "National ID already registered",
        errorAr: "رقم الهوية الوطنية مسجل مسبقاً",
      }, 400);
    }

    // Create new user
    const userId = generateUserId();
    const newUser: User = {
      id: userId,
      fullName,
      nationalId,
      email,
      phone: normalizePhone(phone),
      passwordHash: hashPassword(password),
      verified: false,
      createdAt: new Date().toISOString(),
    };

    await saveUser(newUser);

    console.log(`✅ User registered: ${email} (${userId})`);

    return c.json({
      success: true,
      userId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({
      success: false,
      error: "Registration failed",
      errorAr: "فشل التسجيل",
    }, 500);
  }
}

// Send OTP
export async function sendOTP(c: Context) {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({
        success: false,
        error: "Email address required",
        errorAr: "البريد الإلكتروني مطلوب",
      }, 400);
    }

    console.log(`📧 OTP sent to ${email}: ${MOCK_OTP}`);

    return c.json({
      success: true,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return c.json({
      success: false,
      error: "Failed to send OTP",
      errorAr: "فشل إرسال رمز التحقق",
    }, 500);
  }
}

// Verify OTP
export async function verifyOTP(c: Context) {
  try {
    const body = await c.req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return c.json({
        success: false,
        error: "Email and OTP required",
        errorAr: "البريد الإلكتروني ورمز التحقق مطلوبان",
      }, 400);
    }

    // Verify OTP
    if (otp !== MOCK_OTP) {
      return c.json({
        success: false,
        error: "Invalid verification code",
        errorAr: "رمز التحقق غير صحيح",
      }, 400);
    }

    // Mark user as verified
    const user = await getUserByEmail(email);
    if (user) {
      user.verified = true;
      await saveUser(user);
    }

    console.log(`✅ OTP verified for ${email}`);

    return c.json({
      success: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return c.json({
      success: false,
      error: "Verification failed",
      errorAr: "فشل التحقق",
    }, 500);
  }
}

// Check if user exists
export async function checkUserExists(c: Context) {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({
        success: false,
        error: "Email address required",
        errorAr: "البريد الإلكتروني مطلوب",
      }, 400);
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return c.json({
        success: true,
        exists: false,
        error: "No account found with this email address",
        errorAr: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني",
      });
    }

    return c.json({
      success: true,
      exists: true,
      userId: user.id,
    });
  } catch (error) {
    console.error("Check user exists error:", error);
    return c.json({
      success: false,
      error: "Check failed",
      errorAr: "فشل الفحص",
    }, 500);
  }
}

// Login with OTP
export async function loginWithOTP(c: Context) {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({
        success: false,
        error: "Email address required",
        errorAr: "البريد الإلكتروني مطلوب",
      }, 400);
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return c.json({
        success: false,
        error: "User not found",
        errorAr: "المستخدم غير موجود",
      }, 404);
    }

    if (!user.verified) {
      return c.json({
        success: false,
        error: "Account not verified",
        errorAr: "الحساب غير موثق",
      }, 400);
    }

    // ✅ Generate JWT-format access token
    const accessToken = generateAccessToken(user.id);
    const profile = userToProfile(user);

    console.log(`✅ User logged in: ${user.email}`);
    console.log(`   JWT token generated (${accessToken.split('.').length} parts)`);

    return c.json({
      success: true,
      user: {
        ...profile,
        accessToken,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({
      success: false,
      error: "Login failed",
      errorAr: "فشل تسجيل الدخول",
    }, 500);
  }
}

// Set user role
export async function setUserRole(c: Context) {
  try {
    const body = await c.req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return c.json({
        success: false,
        error: "User ID and role required",
        errorAr: "معرف المستخدم والدور مطلوبان",
      }, 400);
    }

    const user = await getUserById(userId);

    if (!user) {
      return c.json({
        success: false,
        error: "User not found",
        errorAr: "المستخدم غير موجود",
      }, 404);
    }

    user.role = role;
    user.rating = 4.8;
    user.reviewCount = 0;
    await saveUser(user);

    // ✅ Generate JWT-format access token
    const accessToken = generateAccessToken(user.id);
    const profile = userToProfile(user);

    console.log(`✅ User role set: ${user.email} -> ${role}`);
    console.log(`   JWT token generated (${accessToken.split('.').length} parts)`);

    return c.json({
      success: true,
      user: {
        ...profile,
        accessToken,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Set role error:", error);
    return c.json({
      success: false,
      error: "Failed to set role",
      errorAr: "فشل تعيين الدور",
    }, 500);
  }
}

// Get user profile
export async function getUserProfile(c: Context) {
  try {
    const body = await c.req.json();
    const { userId } = body;

    if (!userId) {
      return c.json({
        success: false,
        error: "User ID required",
        errorAr: "معرف المستخدم مطلوب",
      }, 400);
    }

    const user = await getUserById(userId);

    if (!user) {
      return c.json({
        success: false,
        error: "User not found",
        errorAr: "المستخدم غير موجود",
      }, 404);
    }

    const profile = userToProfile(user);

    return c.json({
      success: true,
      user: profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return c.json({
      success: false,
      error: "Failed to get profile",
      errorAr: "فشل الحصول على الملف الشخصي",
    }, 500);
  }
}

// Update user profile
export async function updateUserProfile(c: Context) {
  try {
    const body = await c.req.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return c.json({
        success: false,
        error: "User ID and updates required",
        errorAr: "معرف المستخدم والتحديثات مطلوبة",
      }, 400);
    }

    const user = await getUserById(userId);

    if (!user) {
      return c.json({
        success: false,
        error: "User not found",
        errorAr: "المستخدم غير موجود",
      }, 404);
    }

    // Update allowed fields
    if (updates.fullName) user.fullName = updates.fullName;
    if (updates.email) user.email = updates.email;
    if (updates.phone) user.phone = updates.phone;
    if (updates.role) user.role = updates.role;
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;

    await saveUser(user);

    const profile = userToProfile(user);

    console.log(`✅ User profile updated: ${user.email}`);

    return c.json({
      success: true,
      user: profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return c.json({
      success: false,
      error: "Failed to update profile",
      errorAr: "فشل تحديث الملف الشخصي",
    }, 500);
  }
}