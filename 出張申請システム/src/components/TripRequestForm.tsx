import { useState } from 'react';
import type { TripRequest, RouteInfo, RouteStep } from '../types';
import { CheckCircle, AlertCircle, Search, Train, Clock, ArrowRight, Wallet } from 'lucide-react';

interface TripRequestFormProps {
  onSubmit: (request: Omit<TripRequest, 'id' | 'status' | 'createdAt'>) => void;
}

export function TripRequestForm({ onSubmit }: TripRequestFormProps) {
  const [formData, setFormData] = useState({
    employeeName: '',
    department: '',
    departure: '',
    destination: '',
    purpose: '',
    startDate: '',
    endDate: '',
    estimatedCost: 0,
  });
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(null);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      employeeName: formData.employeeName,
      department: formData.department,
      destination: formData.destination,
      purpose: formData.purpose,
      startDate: formData.startDate,
      endDate: formData.endDate,
      estimatedCost: formData.estimatedCost,
      selectedRoute: selectedRoute || undefined,
    });
    setFormData({
      employeeName: '',
      department: '',
      departure: '',
      destination: '',
      purpose: '',
      startDate: '',
      endDate: '',
      estimatedCost: 0,
    });
    setSelectedRoute(null);
    setRoutes([]);
    setHasSearched(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedCost' ? Number(value) : value,
    }));
  };

  const handleSearchRoute = () => {
    if (!formData.departure || !formData.destination) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // モックデータを使用（実際のAPIの代わり）
    setTimeout(() => {
      const mockRoutes = generateMockRoutes(formData.departure, formData.destination);
      // 最安値のルートを特定
      const cheapestFare = Math.min(...mockRoutes.map(r => r.fare));
      const routesWithCheapestInfo = mockRoutes.map(route => ({
        ...route,
        isCheapest: route.fare === cheapestFare,
        cheapestFare,
      }));
      setRoutes(routesWithCheapestInfo);
      setIsSearching(false);
    }, 800);
  };

  const generateMockRoutes = (from: string, to: string): RouteInfo[] => {
    if (!from || !to) return [];

    return [
      {
        id: '1',
        departure: from,
        arrival: to,
        duration: 135,
        fare: 14520,
        transfers: 1,
        steps: [
          {
            type: 'train',
            line: '東海道新幹線のぞみ',
            from: from,
            to: '名古屋',
            duration: 90,
            fare: 10560,
          },
          {
            type: 'walk',
            from: '名古屋',
            to: '名古屋',
            duration: 5,
          },
          {
            type: 'train',
            line: '東海道本線快速',
            from: '名古屋',
            to: to,
            duration: 40,
            fare: 3960,
          },
        ],
      },
      {
        id: '2',
        departure: from,
        arrival: to,
        duration: 145,
        fare: 13340,
        transfers: 2,
        steps: [
          {
            type: 'train',
            line: '東海道新幹線ひかり',
            from: from,
            to: '京都',
            duration: 100,
            fare: 9840,
          },
          {
            type: 'walk',
            from: '京都',
            to: '京都',
            duration: 5,
          },
          {
            type: 'train',
            line: '東海道本線',
            from: '京都',
            to: '大阪',
            duration: 30,
            fare: 2200,
          },
          {
            type: 'walk',
            from: '大阪',
            to: '大阪',
            duration: 3,
          },
          {
            type: 'train',
            line: '大阪環状線',
            from: '大阪',
            to: to,
            duration: 7,
            fare: 1300,
          },
        ],
      },
      {
        id: '3',
        departure: from,
        arrival: to,
        duration: 160,
        fare: 11280,
        transfers: 1,
        steps: [
          {
            type: 'train',
            line: '東海道本線',
            from: from,
            to: '静岡',
            duration: 80,
            fare: 5640,
          },
          {
            type: 'walk',
            from: '静岡',
            to: '静岡',
            duration: 5,
          },
          {
            type: 'train',
            line: '東海道本線快速',
            from: '静岡',
            to: to,
            duration: 75,
            fare: 5640,
          },
        ],
      },
    ];
  };

  const handleSelectRoute = (route: RouteInfo) => {
    setSelectedRoute(route);
    setFormData(prev => ({
      ...prev,
      estimatedCost: route.fare * 2, // 往復料金
    }));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="employeeName" className="block text-gray-700 mb-2">
            申請者名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="employeeName"
            name="employeeName"
            required
            value={formData.employeeName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-gray-700 mb-2">
            部署 <span className="text-red-500">*</span>
          </label>
          <select
            id="department"
            name="department"
            required
            value={formData.department}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">選択してください</option>
            <option value="営業部">営業部</option>
            <option value="開発部">開発部</option>
            <option value="企画部">企画部</option>
            <option value="管理部">管理部</option>
            <option value="人事部">人事部</option>
          </select>
        </div>

        <div>
          <label htmlFor="departure" className="block text-gray-700 mb-2">
            出発地 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="departure"
            name="departure"
            required
            value={formData.departure}
            onChange={handleChange}
            placeholder="例：東京都、大阪府"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="destination" className="block text-gray-700 mb-2">
            出張先 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="destination"
            name="destination"
            required
            value={formData.destination}
            onChange={handleChange}
            placeholder="例：東京都、大阪府"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="estimatedCost" className="block text-gray-700 mb-2">
            概算費用（円） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="estimatedCost"
            name="estimatedCost"
            required
            min="0"
            value={formData.estimatedCost}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-gray-700 mb-2">
            出発日 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            required
            value={formData.startDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-gray-700 mb-2">
            帰着日 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            required
            value={formData.endDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="purpose" className="block text-gray-700 mb-2">
          出張目的 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="purpose"
          name="purpose"
          required
          value={formData.purpose}
          onChange={handleChange}
          rows={4}
          placeholder="出張の目的を詳しく記入してください"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900">交通ルート検索</h3>
          <button
            type="button"
            onClick={handleSearchRoute}
            disabled={!formData.departure || !formData.destination || isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            {isSearching ? '検索中...' : 'ルートを検索'}
          </button>
        </div>
        
        {!formData.departure || !formData.destination ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
            出発地と出張先を入力してからルート検索を行ってください
          </div>
        ) : null}

        {/* 選択されたルート情報 */}
        {selectedRoute && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-900">選択されたルート</span>
            </div>
            <div className="text-gray-700 mb-2">
              {selectedRoute.departure} → {selectedRoute.arrival}
              <span className="ml-4">片道運賃: {formatCurrency(selectedRoute.fare)}</span>
              <span className="ml-2">往復運賃: {formatCurrency(selectedRoute.fare * 2)}</span>
              {selectedRoute.isCheapest && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded">最安値</span>
              )}
            </div>
          </div>
        )}

        {/* 検索結果 */}
        {routes.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-gray-900">検索結果（往復料金で表示）</h4>
            {routes.map((route) => (
              <div
                key={route.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  selectedRoute?.id === route.id ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
                onClick={() => handleSelectRoute(route)}
              >
                {/* ルート概要 */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3 pb-3 border-b border-gray-200">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{formatDuration(route.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">往復 {formatCurrency(route.fare * 2)}</span>
                      <span className="text-gray-600 text-sm">（片道 {formatCurrency(route.fare)}）</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Train className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">乗換 {route.transfers}回</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {route.isCheapest && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        最安値
                      </span>
                    )}
                    {!route.isCheapest && route.cheapestFare && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
                        <AlertCircle className="w-4 h-4" />
                        最安値より{formatCurrency((route.fare - route.cheapestFare) * 2)}高い
                      </span>
                    )}
                  </div>
                </div>

                {/* 詳細な経路ステップ */}
                <div className="space-y-2">
                  {route.steps.map((step, index) => (
                    <div key={index}>
                      {step.type === 'train' ? (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Train className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                                {step.line}
                              </span>
                              <span className="text-gray-600 text-sm">{formatDuration(step.duration)}</span>
                              {step.fare && (
                                <span className="text-gray-900 text-sm">{formatCurrency(step.fare)}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 text-sm">
                              <span>{step.from}</span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              <span>{step.to}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          </div>
                          <div className="flex-1">
                            <span className="text-gray-600 text-sm">徒歩 {formatDuration(step.duration)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          申請を提出
        </button>
      </div>
    </form>
  );
}