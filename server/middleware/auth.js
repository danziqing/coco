const config = require('../../config');

function requirePassword(req, res, next) {
    if (!config.security.password.enabled) {
        return next();
    }

    // 先检查是否提供了正确的密码 → 说明是管理员（非游客）
    const password =
        req.headers["x-access-password"] || req.body.password || req.query.password;
    if (password && password === config.security.password.accessPassword) {
        return next();
    }

    // 游客模式：允许 GET/HEAD 请求直接通过（标记为游客）
    if (config.security.guestMode && (req.method === 'GET' || req.method === 'HEAD')) {
        req.isGuest = true;
        return next();
    }

    if (!password) {
        return res.status(401).json({ error: "需要提供访问密码" });
    }

    return res.status(401).json({ error: "密码错误" });
}

function requireAdmin(req, res, next) {
    if (req.isGuest) {
        return res.status(403).json({ error: "游客模式无法执行此操作" });
    }
    next();
}

module.exports = { requirePassword, requireAdmin };
