-- Restore Maram; default active support agent (Chafik remains available)
INSERT OR IGNORE INTO whatsapp_agents (id, name, phone, gender, is_active, title, emoji)
VALUES ('agent-maram', 'Maram', '+21652013035', 'female', 1, 'الوكيلة الأولى', '👩');

INSERT OR IGNORE INTO whatsapp_agents (id, name, phone, gender, is_active, title, emoji)
VALUES ('agent-chafik', 'Chafik', '+21650496159', 'male', 0, 'الدعم', '👨');

UPDATE whatsapp_agents SET is_active = 0 WHERE LOWER(name) = 'chafik';
UPDATE whatsapp_agents SET is_active = 1 WHERE LOWER(name) = 'maram';
