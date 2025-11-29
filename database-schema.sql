-- Feature Usage Tracking Schema

-- Update users table to include feature usage tracking
ALTER TABLE users ADD COLUMN feature_usage_count INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN feature_usage_status CHAR(1) DEFAULT 'A' CHECK (feature_usage_status IN ('A', 'X'));
ALTER TABLE users ADD COLUMN feature_usage_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create feature usage log table for tracking individual feature usage
CREATE TABLE feature_usage_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remaining_count INTEGER NOT NULL,
    user_plan CHAR(1) NOT NULL CHECK (user_plan IN ('F', 'P', 'S')),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create index for better performance
CREATE INDEX idx_feature_usage_log_user_id ON feature_usage_log(user_id);
CREATE INDEX idx_feature_usage_log_feature_name ON feature_usage_log(feature_name);
CREATE INDEX idx_feature_usage_log_used_at ON feature_usage_log(used_at);

-- Function to get user plan limits
CREATE OR REPLACE FUNCTION get_plan_limit(plan_type CHAR(1))
RETURNS INTEGER AS $$
BEGIN
    CASE plan_type
        WHEN 'F' THEN RETURN 5;   -- Free
        WHEN 'P' THEN RETURN 15;  -- Paid
        WHEN 'S' THEN RETURN 35;  -- Pro
        ELSE RETURN 0;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize user feature usage based on plan
CREATE OR REPLACE FUNCTION initialize_user_features(user_id VARCHAR(255), plan_type CHAR(1))
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET 
        feature_usage_count = get_plan_limit(plan_type),
        feature_usage_status = 'A',
        feature_usage_updated_at = CURRENT_TIMESTAMP
    WHERE users.user_id = initialize_user_features.user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to use a feature (decrements count)
CREATE OR REPLACE FUNCTION use_feature(user_id VARCHAR(255), feature_name VARCHAR(100))
RETURNS TABLE(success BOOLEAN, remaining_count INTEGER, status CHAR(1), message TEXT) AS $$
DECLARE
    current_count INTEGER;
    current_status CHAR(1);
    user_plan CHAR(1);
BEGIN
    -- Get current user feature info
    SELECT u.feature_usage_count, u.feature_usage_status, 
           CASE u.user_plan 
               WHEN 'free' THEN 'F'
               WHEN 'subscribed' THEN 'P' 
               WHEN 'pro' THEN 'S'
               ELSE 'F'
           END
    INTO current_count, current_status, user_plan
    FROM users u 
    WHERE u.user_id = use_feature.user_id;
    
    -- Check if user exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0, 'X'::CHAR(1), 'User not found'::TEXT;
        RETURN;
    END IF;
    
    -- Check if user can use features
    IF current_status = 'X' OR current_count <= 0 THEN
        RETURN QUERY SELECT FALSE, current_count, current_status, 'No more features available'::TEXT;
        RETURN;
    END IF;
    
    -- Decrement count
    current_count := current_count - 1;
    
    -- Update status if count reaches 0
    IF current_count = 0 THEN
        current_status := 'X';
    END IF;
    
    -- Update user record
    UPDATE users 
    SET 
        feature_usage_count = current_count,
        feature_usage_status = current_status,
        feature_usage_updated_at = CURRENT_TIMESTAMP
    WHERE users.user_id = use_feature.user_id;
    
    -- Log the usage
    INSERT INTO feature_usage_log (user_id, feature_name, remaining_count, user_plan)
    VALUES (use_feature.user_id, use_feature.feature_name, current_count, user_plan);
    
    RETURN QUERY SELECT TRUE, current_count, current_status, 'Feature used successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Sample API endpoints (pseudo-code for backend implementation)
/*
GET /api/v1/features/usage
- Returns current user's feature usage info
- Response: { plan: 'F'|'P'|'S', remaining_count: number, status: 'A'|'X' }

POST /api/v1/features/use
- Body: { feature: string }
- Decrements user's feature count
- Response: { success: boolean, remaining_count: number, status: 'A'|'X', message?: string }

Example backend controller (Node.js/Express):

app.get('/api/v1/features/usage', authenticateToken, async (req, res) => {
    const userId = req.user.user_id;
    const result = await db.query(`
        SELECT 
            CASE user_plan 
                WHEN 'free' THEN 'F'
                WHEN 'subscribed' THEN 'P' 
                WHEN 'pro' THEN 'S'
                ELSE 'F'
            END as plan,
            feature_usage_count as remaining_count,
            feature_usage_status as status
        FROM users 
        WHERE user_id = $1
    `, [userId]);
    
    res.json(result.rows[0]);
});

app.post('/api/v1/features/use', authenticateToken, async (req, res) => {
    const userId = req.user.user_id;
    const { feature } = req.body;
    
    const result = await db.query('SELECT * FROM use_feature($1, $2)', [userId, feature]);
    res.json(result.rows[0]);
});
*/