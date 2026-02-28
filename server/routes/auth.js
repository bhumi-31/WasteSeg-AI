import express from 'express';
import User from '../models/User.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Create a new user account
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                error: 'Email already registered',
                message: 'An account with this email already exists. Please login instead.'
            });
        }

        // Create user (password hashed by pre-save hook)
        const user = new User({ name, email, password });
        await user.save();

        // Generate JWT
        const token = generateToken(user);

        console.log(`✅ New user registered: ${email}`);

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: user.toJSON()
        });

    } catch (error) {
        console.error('❌ Registration error:', error.message);
        next(error);
    }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect.'
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect.'
            });
        }

        // Generate JWT
        const token = generateToken(user);

        console.log(`✅ User logged in: ${email}`);

        res.json({
            message: 'Login successful',
            token,
            user: user.toJSON()
        });

    } catch (error) {
        console.error('❌ Login error:', error.message);
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Get current user profile (protected)
 */
router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        next(error);
    }
});

export default router;
