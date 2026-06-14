import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { withAuthSync } from '@utils/auth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  HiOutlineArrowTrendingUp,
  HiOutlineUserGroup,
  HiOutlineBanknotes,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePlusCircle,
  HiOutlineDocumentArrowDown,
  HiOutlineCreditCard,
  HiOutlineChartBarSquare,
  HiOutlineClock,
} from 'react-icons/hi2';
import { TbArrowsExchange, TbUserPlus } from 'react-icons/tb';
import useUser from '@store/user';
import useTransaction from '@store/transactions';
import useClient from '@store/client';
import { Transaction, Client } from '@utils/types';
import styles from '@styles/Dashboard.module.css';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const statusLabel: Record<string, string> = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
};

const Dashboard = () => {
  const router = useRouter();
  const { user } = useUser();
  const { transactions, total, fetchTransactions } = useTransaction();
  const { client, fetchClient } = useClient();
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchTransactions(1, 50, '', 'reciente'),
          fetchClient(1, 50, ''),
        ]);
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Computed metrics
  const metrics = useMemo(() => {
    const approved = transactions.filter((t: Transaction) => t.status === 'approved');
    const pending = transactions.filter((t: Transaction) => t.status === 'pending');
    const rejected = transactions.filter((t: Transaction) => t.status === 'rejected');

    const totalApproved = approved.reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0);
    const totalPending = pending.reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0);

    const totalCreditUsed = (client as Client[]).reduce((sum: number, c: Client) => sum + (Number(c.current_balance) || 0), 0);
    const totalCreditLimit = (client as Client[]).reduce((sum: number, c: Client) => sum + (Number(c.credit_limit) || 0), 0);

    return {
      totalTransactions: total,
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      totalApproved,
      totalPending,
      totalClients: (client as Client[]).length,
      totalCreditUsed,
      totalCreditLimit,
      creditAvailable: totalCreditLimit - totalCreditUsed,
    };
  }, [transactions, client, total]);

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  const topClients = useMemo(
    () =>
      [...(client as Client[])]
        .sort((a, b) => (Number(b.current_balance) || 0) - (Number(a.current_balance) || 0))
        .slice(0, 5),
    [client]
  );

  const greetingName = user?.name?.split(' ')[0] || 'Usuario';
  const hour = new Date().getHours();
  const greetingText = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const roleBadge = () => {
    const planType = (user as any)?.subscription?.planType || 'FREE';
    switch (planType) {
      case 'BASIC':
        return <span className={`${styles.planBadge} ${styles.normal}`}>⭐ Basic</span>;
      case 'PRO':
        return <span className={`${styles.planBadge} ${styles.special}`}>🚀 Pro</span>;
      case 'ENTERPRISE':
        return <span className={`${styles.planBadge} ${styles.special}`}>💎 Enterprise</span>;
      default:
        return <span className={`${styles.planBadge} ${styles.free}`}>Free</span>;
    }
  };

  if (loading) {
    return (
      <Container className={styles.dashboardContainer}>
        <div className={styles.greeting}>
          <div className={styles.skeletonLine} style={{ width: '40%', height: '1.75rem' }} />
          <div className={styles.skeletonLine} style={{ width: '25%' }} />
        </div>
        <div className={styles.metricsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container className={styles.dashboardContainer}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <h1 className={styles.greetingTitle}>
          {greetingText}, {greetingName} 👋
        </h1>
        <p className={styles.greetingSubtitle}>
          Aquí tienes un resumen de tu negocio · {roleBadge()}
        </p>
      </div>

      {/* Quick actions */}
      <div className={styles.actionsGrid}>
        <Link href="/transacciones" className={styles.actionBtn}>
          <div className={styles.actionIcon}>
            <HiOutlinePlusCircle size={18} />
          </div>
          Nueva Transacción
        </Link>
        <Link href="/client" className={styles.actionBtn}>
          <div className={styles.actionIcon}>
            <TbUserPlus size={18} />
          </div>
          Nuevo Cliente
        </Link>
        <Link href="/transacciones" className={styles.actionBtn}>
          <div className={styles.actionIcon}>
            <HiOutlineDocumentArrowDown size={18} />
          </div>
          Exportar Excel
        </Link>
        <Link href="/plans" className={styles.actionBtn}>
          <div className={styles.actionIcon}>
            <HiOutlineCreditCard size={18} />
          </div>
          Ver Planes
        </Link>
      </div>

      {/* Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrap} ${styles.teal}`}>
            <TbArrowsExchange size={20} />
          </div>
          <div className={styles.metricBody}>
            <span className={styles.metricLabel}>Transacciones</span>
            <span className={styles.metricValue}>{metrics.totalTransactions}</span>
            <span className={styles.metricSub}>Total registradas</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrap} ${styles.green}`}>
            <HiOutlineBanknotes size={20} />
          </div>
          <div className={styles.metricBody}>
            <span className={styles.metricLabel}>Monto Aprobado</span>
            <span className={styles.metricValue}>{formatCurrency(metrics.totalApproved)}</span>
            <span className={styles.metricSub}>{metrics.approvedCount} transacciones</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrap} ${styles.amber}`}>
            <HiOutlineClock size={20} />
          </div>
          <div className={styles.metricBody}>
            <span className={styles.metricLabel}>Pendientes</span>
            <span className={styles.metricValue}>{metrics.pendingCount}</span>
            <span className={styles.metricSub}>{formatCurrency(metrics.totalPending)}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrap} ${styles.blue}`}>
            <HiOutlineUserGroup size={20} />
          </div>
          <div className={styles.metricBody}>
            <span className={styles.metricLabel}>Clientes</span>
            <span className={styles.metricValue}>{metrics.totalClients}</span>
            <span className={styles.metricSub}>Registrados</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrap} ${styles.purple}`}>
            <HiOutlineChartBarSquare size={20} />
          </div>
          <div className={styles.metricBody}>
            <span className={styles.metricLabel}>Saldo Total</span>
            <span className={styles.metricValue}>{formatCurrency(metrics.totalCreditUsed)}</span>
            <span className={styles.metricSub}>de {formatCurrency(metrics.totalCreditLimit)} en límites</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIconWrap} ${styles.red}`}>
            <HiOutlineXCircle size={20} />
          </div>
          <div className={styles.metricBody}>
            <span className={styles.metricLabel}>Rechazadas</span>
            <span className={styles.metricValue}>{metrics.rejectedCount}</span>
            <span className={styles.metricSub}>transacciones</span>
          </div>
        </div>
      </div>

      {/* Sections: Recent Transactions + Top Clients */}
      <div className={styles.sectionsRow}>
        {/* Recent Transactions */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <TbArrowsExchange size={18} /> Transacciones Recientes
            </h3>
            <Link
              href="/transacciones"
              style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-color)', textDecoration: 'none' }}
            >
              Ver todas →
            </Link>
          </div>
          <div className={styles.sectionBody}>
            {recentTransactions.length === 0 ? (
              <div className={styles.sectionEmpty}>
                <TbArrowsExchange size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p>No hay transacciones aún</p>
              </div>
            ) : (
              recentTransactions.map((tx: any) => (
                <div key={tx.id} className={styles.txItem}>
                  <div className={styles.txLeft}>
                    <span className={styles.txClient}>
                      {tx.client?.name
                        ? `${tx.client.name}${tx.client.lastname ? ` ${tx.client.lastname}` : ''}`
                        : tx.detail?.clientName || `Transacción #${tx.id?.slice(0, 8)}`}
                    </span>
                    <span className={styles.txDate}>{formatDate(tx.createdAt)}</span>
                  </div>
                  <div className={styles.txRight}>
                    <span className={styles.txAmount}>{formatCurrency(Number(tx.amount) || 0)}</span>
                    <span className={`${styles.txBadge} ${styles[tx.status]}`}>
                      {statusLabel[tx.status] || tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <HiOutlineUserGroup size={18} /> Clientes con Mayor Saldo
            </h3>
            <Link
              href="/client"
              style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-color)', textDecoration: 'none' }}
            >
              Ver todos →
            </Link>
          </div>
          <div className={styles.sectionBody}>
            {topClients.length === 0 ? (
              <div className={styles.sectionEmpty}>
                <HiOutlineUserGroup size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p>No hay clientes registrados</p>
              </div>
            ) : (
              topClients.map((c: Client) => (
                <div key={c.id} className={styles.clientItem}>
                  <span className={styles.clientName}>
                    {c.name} {c.lastname || ''}
                  </span>
                  <span className={styles.clientBalance}>
                    {formatCurrency(Number(c.current_balance) || 0)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default withAuthSync(Dashboard);
