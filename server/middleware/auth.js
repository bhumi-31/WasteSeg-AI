import jwt from 'jsonwebtoken';

/**
 * Authentication middleware
 * Extracts JWT from Authorization header and attaches user to req
 */
export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please provide a valid token in the Authorization header'
            });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error('❌ JWT_SECRET is not set in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, secret);
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Your session has expired. Please login again.'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'The provided token is invalid.'
            });
        }
        return res.status(401).json({ error: 'Authentication failed' });
    }
}

/**
 * Generate JWT token for a user
 */
export function generateToken(user) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign(
        { id: user._id, email: user.email },
        secret,
        { expiresIn: '7d' }
    );
}
