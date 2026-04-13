import { NextRequest, NextResponse } from 'next/server';
import { getCfContext } from '@/lib/cf-context';
import { eq, desc } from 'drizzle-orm';
import { whatsappAgents } from '@/db/schema';

export async function GET() {
  try {
    const { db, kv } = getCfContext();

    const allAgents = await db.select().from(whatsappAgents)
      .orderBy(desc(whatsappAgents.isActive))
      .all();

    const activeAgent = allAgents.find(a => a.isActive === true);

    let kvActiveAgent = null;
    try {
      const cached = await kv.get('active_whatsapp_agent');
      if (cached) {
        kvActiveAgent = JSON.parse(cached);
      }
    } catch {
      // KV read failed
    }

    if (activeAgent && !kvActiveAgent) {
      try {
        await kv.put('active_whatsapp_agent', JSON.stringify(activeAgent));
      } catch {
        // KV write failed
      }
    }

    const finalActive = activeAgent || kvActiveAgent;

    const agentsWithStatus = allAgents.map(agent => ({
      ...agent,
      active: agent.id === finalActive?.id,
    }));

    return NextResponse.json({
      agents: agentsWithStatus,
      activeAgent: finalActive || agentsWithStatus[0] || null,
    });
  } catch (error) {
    console.error('[whatsapp-agent] GET Error:', error);
    return NextResponse.json(
      { error: 'فشل تحميل الوكلاء' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { db, kv } = getCfContext();
    const body = await request.json();
    
    // Accept both `agentId` (UUID) and `agent` (name key like 'maram')
    let agentId = body.agentId;
    const agentKey = body.agent;

    // If no agentId but agent key provided, find by name
    if (!agentId && agentKey) {
      const agents = await db.select().from(whatsappAgents).all();
      const match = agents.find(
        a => a.name.toLowerCase() === agentKey.toLowerCase()
      );
      if (match) {
        agentId = match.id;
      } else {
        return NextResponse.json(
          { error: 'وكيل غير موجود' },
          { status: 404 }
        );
      }
    }

    if (!agentId) {
      return NextResponse.json(
        { error: 'معرف الوكيل مطلوب' },
        { status: 400 }
      );
    }

    const agent = await db.select().from(whatsappAgents)
      .where(eq(whatsappAgents.id, agentId))
      .get();

    if (!agent) {
      return NextResponse.json(
        { error: 'وكيل غير موجود' },
        { status: 404 }
      );
    }

    // Set all agents to inactive
    await db.update(whatsappAgents)
      .set({ isActive: false })
      .run();

    // Set selected agent to active
    await db.update(whatsappAgents)
      .set({ isActive: true })
      .where(eq(whatsappAgents.id, agentId))
      .run();

    const activeAgent = {
      ...agent,
      isActive: true,
    };

    try {
      await kv.put('active_whatsapp_agent', JSON.stringify(activeAgent));
    } catch {
      // KV write failed — non-critical
    }

    return NextResponse.json({
      success: true,
      agent: activeAgent,
    });
  } catch (error) {
    console.error('[whatsapp-agent] PUT Error:', error);
    return NextResponse.json(
      { error: 'فشل تحديث الوكيل' },
      { status: 500 }
    );
  }
}
