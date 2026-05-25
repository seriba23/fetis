export interface DashboardKpi {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number; // % vs período anterior
  intent?: 'neutral' | 'positive' | 'negative' | 'warning';
}

export interface DashboardSummary {
  appointmentsToday: number;
  appointmentsWeek: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  incomeMonth: number;
  expensesMonth: number;
  balanceMonth: number;
  overdueExpenses: number;
  newClientsMonth: number;
  upcomingAppointments: Array<{
    id: string;
    type: string;
    startTime: string;
    clientName: string;
    status: string;
  }>;
  recentQuotes: Array<{
    id: string;
    number: string;
    clientName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  upcomingExpenses: Array<{
    id: string;
    name: string;
    category: string;
    amount: number;
    date: string;
    status: string;
    virtual?: boolean;
  }>;
  incomeByMonth: Array<{ month: string; income: number; expenses: number }>;
}
