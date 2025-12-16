import { useState } from 'react';
import type { TripRequest, Expense } from '../types';
import { Trash2, Plus } from 'lucide-react';

interface ExpenseSettlementProps {
  tripRequests: TripRequest[];
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export function ExpenseSettlement({
  tripRequests,
  expenses,
  onAddExpense,
  onDeleteExpense,
}: ExpenseSettlementProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tripRequestId: '',
    category: '',
    amount: 0,
    date: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense(formData);
    setFormData({
      tripRequestId: '',
      category: '',
      amount: 0,
      date: '',
      description: '',
    });
    setShowForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getTotalByTrip = (tripRequestId: string) => {
    return expenses
      .filter(exp => exp.tripRequestId === tripRequestId)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const categories = [
    '交通費（新幹線）',
    '交通費（飛行機）',
    '交通費（タクシー）',
    '交通費（その他）',
    '宿泊費',
    '食事代',
    'その他',
  ];

  if (tripRequests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>承認済みの出張申請がありません</p>
        <p className="mt-2">出張申請が承認されると、ここで経費精算ができます。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-gray-900">経費精算</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          経費を追加
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tripRequestId" className="block text-gray-700 mb-2">
                出張申請 <span className="text-red-500">*</span>
              </label>
              <select
                id="tripRequestId"
                name="tripRequestId"
                required
                value={formData.tripRequestId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                {tripRequests.map(req => (
                  <option key={req.id} value={req.id}>
                    {req.destination} - {req.employeeName} ({new Date(req.startDate).toLocaleDateString('ja-JP')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-gray-700 mb-2">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-gray-700 mb-2">
                金額（円） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                min="0"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-gray-700 mb-2">
                日付 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 mb-2">
              備考
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              追加
            </button>
          </div>
        </form>
      )}

      {/* 出張ごとに経費をグループ化 */}
      <div className="space-y-6">
        {tripRequests.map(trip => {
          const tripExpenses = expenses.filter(exp => exp.tripRequestId === trip.id);
          const total = getTotalByTrip(trip.id);

          return (
            <div key={trip.id} className="border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-gray-900">{trip.destination}</h3>
                <p className="text-gray-600">
                  {trip.employeeName} - {new Date(trip.startDate).toLocaleDateString('ja-JP')} 〜 {new Date(trip.endDate).toLocaleDateString('ja-JP')}
                </p>
              </div>

              {tripExpenses.length === 0 ? (
                <p className="text-gray-500">まだ経費が登録されていません</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {tripExpenses.map(expense => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {expense.category}
                            </span>
                            <span className="text-gray-600">
                              {new Date(expense.date).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                          {expense.description && (
                            <p className="text-gray-600">{expense.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-900">{formatCurrency(expense.amount)}</span>
                          <button
                            onClick={() => onDeleteExpense(expense.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-gray-700">合計</span>
                    <span className="text-gray-900">{formatCurrency(total)}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}