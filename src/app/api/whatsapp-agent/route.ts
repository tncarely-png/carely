import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const AGENTS = {
  maram: {
    name: 'Maram',
    phone: '+21652013035',
    title: 'الوكيلة الأولى',
    emoji: '👩',
  },
  chafik: {
    name: 'Chafik',
    phone: '+21650496159',
    title: 'الوكيل الثاني',
    emoji: '👨',
  },
} as const;

type AgentKey = keyof typeof AGENTS;

function getActiveAgentFromDb(): AgentKey {
  // Default to maram if no setting found
  return 'maram';
}

export async function GET() {
  try {
    const setting = await db.settings.findUnique({
      where: { key: 'active_whatsapp_agent' },
    });

    const activeAgentKey = (setting?.value || 'maram') as AgentKey;
    const agent = AGENTS[activeAgentKey];

    if (!agent) {
      // Fallback to maram if invalid
      return NextResponse.json({
        ...AGENTS.maram,
        active: true,
      });
    }

    return NextResponse.json({
      ...agent,
      key: activeAgentKey,
      active: true,
    });
  } catch {
    return NextResponse.json({
      ...AGENTS.maram,
      key: 'maram',
      active: true,
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent } = body;

    if (agent !== 'maram' && agent !== 'chafik') {
      return NextResponse.json(
        { error: 'وكيل غير صالح. اختار maram أو chafik' },
        { status: 400 }
      );
    }

    await db.settings.upsert({
      where: { key: 'active_whatsapp_agent' },
      create: { key: 'active_whatsapp_agent', value: agent },
      update: { value: agent },
    });

    const selectedAgent = AGENTS[agent as AgentKey];

    return NextResponse.json({
      success: true,
      ...selectedAgent,
      key: agent,
    });
  } catch (error) {
    console.error('[whatsapp-agent] Error:', error);
    return NextResponse.json(
      { error: 'فشل تحديث الوكيل' },
      { status: 500 }
    );
  }
}
