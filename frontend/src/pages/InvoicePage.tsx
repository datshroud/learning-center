import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingState } from '../components/LoadingState';
import { PageHeader, SectionCard } from '../components/Page';
import { usePreferences } from '../contexts/PreferencesContext';
import { api, formatDate, formatMoney } from '../lib/api';
import type { Invoice } from '../types/domain';

export function InvoicePage() {
  const { t } = usePreferences();
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (id) {
      api.get<Invoice>(`/invoices/${id}`).then((response) => setInvoice(response.data));
    }
  }, [id]);

  if (!invoice) {
    return <LoadingState />;
  }

  return (
    <>
      <PageHeader title="Phiếu thu học phí" />
      <SectionCard>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">{t('Mã hóa đơn')}</p>
            <p className="font-semibold text-slate-950">{invoice.id}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('Ngày lập')}</p>
            <p className="font-semibold text-slate-950">{formatDate(invoice.invoiceDate)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('Học viên')}</p>
            <p className="font-semibold text-slate-950">{invoice.tuitionPayment?.student?.user.fullName ?? '-'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('Số tiền')}</p>
            <p className="font-semibold text-slate-950">{formatMoney(invoice.totalAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">{t('Phương thức')}</p>
            <p className="font-semibold text-slate-950">{t(invoice.payment?.method ?? '-')}</p>
          </div>
        </div>
      </SectionCard>
    </>
  );
}
