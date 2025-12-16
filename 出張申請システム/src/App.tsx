import { useEffect, useState } from 'react';
import { TripRequestForm } from './components/TripRequestForm';
import { TripRequestList } from './components/TripRequestList';
import { ExpenseSettlement } from './components/ExpenseSettlement';
import { Plane, Receipt, List } from 'lucide-react';
import type { TripRequest, Expense } from './types';
import { api } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'request' | 'list' | 'settlement'>('request');
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [requests, expenseList] = await Promise.all([
          api.fetchTripRequests(),
          api.fetchExpenses(),
        ]);
        setTripRequests(requests);
        setExpenses(expenseList);
      } catch (err) {
        console.error(err);
        setError('データの取得に失敗しました。バックエンドサーバーが起動していることを確認してください。');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddTripRequest = async (request: Omit<TripRequest, 'id' | 'createdAt' | 'status'>) => {
    try {
      const created = await api.createTripRequest(request);
      setTripRequests([created, ...tripRequests]);
      setActiveTab('list');
    } catch (err) {
      console.error(err);
      setError('出張申請の登録に失敗しました。');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const updated = await api.updateTripStatus(id, status);
      setTripRequests(tripRequests.map(req =>
        req.id === id ? updated : req
      ));
    } catch (err) {
      console.error(err);
      setError('ステータスの更新に失敗しました。');
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const created = await api.createExpense(expense);
      setExpenses([created, ...expenses]);
    } catch (err) {
      console.error(err);
      setError('経費の登録に失敗しました。関連する出張申請が承認済みか確認してください。');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await api.deleteExpense(id);
      setExpenses(expenses.filter(exp => exp.id !== id));
    } catch (err) {
      console.error(err);
      setError('経費の削除に失敗しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-gray-900">出張申請・経費精算システム</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* タブナビゲーション */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('request')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'request'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Plane className="w-5 h-5" />
                <span>出張申請</span>
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
                <span>申請一覧</span>
              </button>
              <button
                onClick={() => setActiveTab('settlement')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeTab === 'settlement'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Receipt className="w-5 h-5" />
                <span>経費精算</span>
              </button>
            </nav>
          </div>

          {/* コンテンツエリア */}
          <div className="p-6">
            {loading && (
              <div className="text-center text-gray-600 py-8">データを読み込んでいます...</div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                {error}
              </div>
            )}

            {!loading && activeTab === 'request' && (
              <TripRequestForm onSubmit={handleAddTripRequest} />
            )}
            {!loading && activeTab === 'list' && (
              <TripRequestList
                requests={tripRequests}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
            {!loading && activeTab === 'settlement' && (
              <ExpenseSettlement
                tripRequests={tripRequests.filter(req => req.status === 'approved')}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}