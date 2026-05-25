import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ExpensesService } from '../expenses/expenses.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expenses: ExpensesService,
  ) {}

  async getSummary() {
    const now = dayjs();
    const startOfDay = now.startOf('day').toDate();
    const endOfDay = now.endOf('day').toDate();
    const startOfWeek = now.startOf('week').toDate();
    const endOfWeek = now.endOf('week').toDate();
    const startOfMonth = now.startOf('month').toDate();
    const endOfMonth = now.endOf('month').toDate();

    const [
      appointmentsToday,
      appointmentsWeek,
      pendingQuotes,
      acceptedQuotes,
      incomeMonthAgg,
      newClientsMonth,
      upcomingAppointments,
      recentQuotes,
      overdueExpensesCount,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: { startTime: { gte: startOfDay, lte: endOfDay }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
      }),
      this.prisma.appointment.count({
        where: { startTime: { gte: startOfWeek, lte: endOfWeek }, status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
      }),
      this.prisma.quote.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
      this.prisma.quote.count({ where: { status: 'ACCEPTED' } }),
      this.prisma.payment.aggregate({
        where: { paidAt: { gte: startOfMonth, lte: endOfMonth }, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.client.count({ where: { createdAt: { gte: startOfMonth, lte: endOfMonth } } }),
      this.prisma.appointment.findMany({
        where: { startTime: { gte: now.toDate() }, status: { notIn: ['CANCELLED', 'COMPLETED'] } },
        orderBy: { startTime: 'asc' },
        take: 8,
        include: { client: { select: { id: true, name: true } } },
      }),
      this.prisma.quote.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { client: { select: { id: true, name: true } } },
      }),
      this.prisma.expense.count({
        where: { date: { lt: startOfDay }, status: { in: ['PENDING', 'OVERDUE'] } },
      }),
    ]);

    const incomeMonth = Number(incomeMonthAgg._sum.amount ?? 0);
    const expensesSummary = await this.expenses.getMonthlySummary(now.year(), now.month() + 1);
    const expensesMonth = expensesSummary.paid;
    const balanceMonth = incomeMonth - expensesMonth;

    const upcomingExpenses = (await this.expenses.findAll({
      from: now.toDate().toISOString(),
      to: now.add(30, 'day').toDate().toISOString(),
      status: undefined,
      includeVirtual: true,
    }))
      .filter((e) => e.status !== 'PAID' && e.status !== 'CANCELLED')
      .slice(0, 8);

    // últimos 6 meses ingresos vs gastos
    const incomeByMonth: Array<{ month: string; income: number; expenses: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const m = now.subtract(i, 'month');
      const ms = m.startOf('month').toDate();
      const me = m.endOf('month').toDate();
      const [inc, exp] = await Promise.all([
        this.prisma.payment.aggregate({ where: { paidAt: { gte: ms, lte: me }, status: 'COMPLETED' }, _sum: { amount: true } }),
        this.prisma.expense.aggregate({ where: { paidAt: { gte: ms, lte: me }, status: 'PAID' }, _sum: { amount: true } }),
      ]);
      incomeByMonth.push({
        month: m.format('MMM YY'),
        income: Number(inc._sum.amount ?? 0),
        expenses: Number(exp._sum.amount ?? 0),
      });
    }

    return {
      appointmentsToday,
      appointmentsWeek,
      pendingQuotes,
      acceptedQuotes,
      incomeMonth,
      expensesMonth,
      balanceMonth,
      overdueExpenses: overdueExpensesCount,
      newClientsMonth,
      upcomingAppointments: upcomingAppointments.map((a) => ({
        id: a.id,
        type: a.type,
        startTime: a.startTime.toISOString(),
        clientName: a.client.name,
        status: a.status,
      })),
      recentQuotes: recentQuotes.map((q) => ({
        id: q.id,
        number: q.number,
        clientName: q.client.name,
        total: Number(q.total),
        status: q.status,
        createdAt: q.createdAt.toISOString(),
      })),
      upcomingExpenses,
      incomeByMonth,
    };
  }
}
