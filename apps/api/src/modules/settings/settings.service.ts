import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(group?: string) {
    const where = group ? { group } : {};
    const list = await this.prisma.setting.findMany({ where });
    const obj: Record<string, any> = {};
    for (const s of list) {
      obj[s.key] = s.type === 'json' ? safeJson(s.value) : s.type === 'number' ? Number(s.value) : s.type === 'boolean' ? s.value === 'true' : s.value;
    }
    return obj;
  }

  async upsert(key: string, value: any, type: string = 'string', group: string = 'general') {
    const str = type === 'json' ? JSON.stringify(value) : String(value);
    return this.prisma.setting.upsert({
      where: { key },
      update: { value: str, type, group },
      create: { key, value: str, type, group },
    });
  }

  async upsertMany(items: Array<{ key: string; value: any; type?: string; group?: string }>) {
    for (const it of items) {
      await this.upsert(it.key, it.value, it.type ?? 'string', it.group ?? 'general');
    }
    return { ok: true };
  }
}

function safeJson(v: string) {
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}
