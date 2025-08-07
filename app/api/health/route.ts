import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const dbHealthy = await testConnection();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? 'connected' : 'disconnected',
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    };

    if (!dbHealthy) {
      logger.warn('Health check failed: Database not connected');
      return NextResponse.json(health, { status: 503 });
    }

    return NextResponse.json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
