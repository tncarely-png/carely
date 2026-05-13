-- Remove Maram; keep Chafik as the only WhatsApp agent and ensure he is active
DELETE FROM whatsapp_agents WHERE LOWER(name) = 'maram';
UPDATE whatsapp_agents SET is_active = 1 WHERE LOWER(name) = 'chafik';
