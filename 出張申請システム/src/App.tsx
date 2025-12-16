import { useState } from 'react';
import { TripRequestForm } from './components/TripRequestForm';
import { TripRequestList } from './components/TripRequestList';
import { ExpenseSettlement } from './components/ExpenseSettlement';
import { Plane, Receipt, List } from 'lucide-react';
import type { TripRequest, Expense } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'request' | 'list' | 'settlement'>('request');
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleAddTripRequest = (request: Omit<TripRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: TripRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setTripRequests([newRequest, ...tripRequests]);
    setActiveTab('list');
  };

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    setTripRequests(tripRequests.map(req => 
      req.id === id ? { ...req, status } : req
    ));
  };

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses([newExpense, ...expenses]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
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
            {activeTab === 'request' && (
              <TripRequestForm onSubmit={handleAddTripRequest} />
            )}
            {activeTab === 'list' && (
              <TripRequestList
                requests={tripRequests}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
            {activeTab === 'settlement' && (
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